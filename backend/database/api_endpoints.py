"""
ORBITNET-MESH Database API Endpoints
REST API for accessing testing data and analytics with Firebase integration
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Optional, Any
from datetime import datetime
import json
from .db_manager import DatabaseManager
from .data_collector import DataCollector

# Import Firebase manager
try:
    import sys
    import os
    sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
    from firebase_manager import firebase_manager
    FIREBASE_AVAILABLE = True
except ImportError as e:
    print(f"⚠️ Firebase not available for analytics: {e}")
    firebase_manager = None
    FIREBASE_AVAILABLE = False

# Create router
router = APIRouter(prefix="/api/database", tags=["database"])

# Initialize services
db_manager = DatabaseManager()
data_collector = DataCollector()

@router.post("/sessions/start")
async def start_test_session(
    request: dict
):
    """Start a new test session with optional automatic data collection and Firebase sync"""
    try:
        test_name = request.get("test_name")
        test_type = request.get("test_type", "manual")
        test_description = request.get("test_description")
        auto_collect = request.get("auto_collect", True)
        collection_interval = request.get("collection_interval", 1.0)
        
        if not test_name:
            raise HTTPException(status_code=400, detail="test_name is required")
        
        if auto_collect:
            # Start automated data collection
            session_id = await data_collector.start_collection(
                test_name=test_name,
                test_type=test_type,
                test_description=test_description,
                collection_interval=collection_interval
            )
        else:
            # Manual session creation
            session_id = db_manager.create_test_session(
                test_name=test_name,
                test_type=test_type,
                test_description=test_description
            )
        
        # Sync to Firebase
        if FIREBASE_AVAILABLE and firebase_manager and firebase_manager.enabled:
            session_data = {
                "session_id": session_id,
                "test_name": test_name,
                "test_type": test_type,
                "test_description": test_description,
                "start_time": datetime.now().isoformat(),
                "auto_collect": auto_collect,
                "status": "started"
            }
            await firebase_manager.sync_test_session(session_data)
        
        return {
            "success": True,
            "session_id": session_id,
            "auto_collect": auto_collect,
            "firebase_synced": FIREBASE_AVAILABLE and firebase_manager and firebase_manager.enabled,
            "message": f"Test session started: {session_id}"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/sessions/{session_id}/stop")
async def stop_test_session(session_id: str, request: dict = None):
    """Stop a test session and generate results"""
    try:
        status = "completed"
        if request:
            status = request.get("status", "completed")
        
        # Stop data collection if active
        if data_collector.get_current_session_id() == session_id:
            await data_collector.stop_collection(status)
        else:
            # Manual session end
            db_manager.end_test_session(session_id, status)
        
        # Get final summary
        summary = db_manager.get_session_summary(session_id)
        
        return {
            "success": True,
            "session_id": session_id,
            "status": status,
            "summary": summary,
            "message": f"Test session stopped: {session_id}"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sessions")
async def get_all_sessions():
    """Get all test sessions"""
    try:
        sessions = db_manager.get_all_sessions()
        return {
            "success": True,
            "count": len(sessions),
            "sessions": sessions
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sessions/{session_id}")
async def get_session_details(session_id: str):
    """Get detailed information about a specific session"""
    try:
        summary = db_manager.get_session_summary(session_id)
        if not summary:
            raise HTTPException(status_code=404, detail="Session not found")
        
        transmission_history = db_manager.get_transmission_history(session_id)
        link_events = db_manager.get_link_events(session_id)
        
        return {
            "success": True,
            "session": summary,
            "transmission_history": transmission_history,
            "link_events": link_events,
            "metrics": {
                "total_data_points": len(transmission_history),
                "total_link_events": len(link_events)
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sessions/{session_id}/metrics")
async def get_session_metrics(
    session_id: str,
    start_time: Optional[str] = None,
    end_time: Optional[str] = None,
    limit: Optional[int] = Query(None, ge=1, le=10000)
):
    """Get transmission metrics for a session with optional filtering"""
    try:
        metrics = db_manager.get_transmission_history(session_id)
        
        if not metrics:
            raise HTTPException(status_code=404, detail="No metrics found for session")
        
        # Apply time filtering if provided
        if start_time:
            start_dt = datetime.fromisoformat(start_time)
            metrics = [m for m in metrics if datetime.fromisoformat(m['timestamp']) >= start_dt]
        
        if end_time:
            end_dt = datetime.fromisoformat(end_time)
            metrics = [m for m in metrics if datetime.fromisoformat(m['timestamp']) <= end_dt]
        
        # Apply limit
        if limit:
            metrics = metrics[-limit:]  # Get most recent N records
        
        return {
            "success": True,
            "session_id": session_id,
            "count": len(metrics),
            "metrics": metrics
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sessions/{session_id}/link-events")
async def get_session_link_events(session_id: str):
    """Get link events for a session"""
    try:
        events = db_manager.get_link_events(session_id)
        
        return {
            "success": True,
            "session_id": session_id,
            "count": len(events),
            "events": events
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sessions/{session_id}/export")
async def export_session_data(session_id: str, format: str = "json"):
    """Export complete session data"""
    try:
        if format.lower() not in ['json']:
            raise HTTPException(status_code=400, detail="Unsupported format. Use 'json'.")
        
        data = db_manager.export_session_data(session_id, format)
        
        return {
            "success": True,
            "session_id": session_id,
            "format": format,
            "data": json.loads(data) if format == 'json' else data
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analytics/summary")
async def get_analytics_summary():
    """Get overall analytics summary across all sessions with Firebase integration"""
    try:
        # Get data from local database
        sessions = db_manager.get_all_sessions()
        
        if not sessions:
            empty_summary = {
                "total_sessions": 0,
                "completed_sessions": 0,
                "passed_sessions": 0,
                "success_rate": 0,
                "average_data_loss_percentage": 0,
                "average_link_availability_percentage": 0,
                "average_test_score": 0,
                "total_packets_generated": 0,
                "total_packets_transmitted": 0,
                "overall_transmission_rate": 0
            }
            
            # Sync empty summary to Firebase
            if FIREBASE_AVAILABLE and firebase_manager and firebase_manager.enabled:
                await firebase_manager.sync_analytics_summary(empty_summary)
            
            return {
                "success": True,
                "message": "No test sessions found",
                "summary": empty_summary,
                "firebase_enabled": FIREBASE_AVAILABLE and firebase_manager and firebase_manager.enabled
            }
        
        # Calculate summary statistics
        total_sessions = len(sessions)
        completed_sessions = len([s for s in sessions if s.get('status') == 'completed'])
        passed_sessions = len([s for s in sessions if s.get('test_passed')])
        
        # Helper function to safely get numeric values
        def safe_get(session, key, default=0):
            value = session.get(key)
            return value if value is not None else default
        
        # Average metrics (only include non-None values)
        data_loss_values = [safe_get(s, 'overall_data_loss_percentage') for s in sessions if s.get('overall_data_loss_percentage') is not None]
        link_availability_values = [safe_get(s, 'link_availability_percentage') for s in sessions if s.get('link_availability_percentage') is not None]
        test_score_values = [safe_get(s, 'test_score') for s in sessions if s.get('test_score') is not None]
        
        avg_data_loss = sum(data_loss_values) / len(data_loss_values) if data_loss_values else 0
        avg_link_availability = sum(link_availability_values) / len(link_availability_values) if link_availability_values else 0
        avg_test_score = sum(test_score_values) / len(test_score_values) if test_score_values else 0
        
        # Total packets
        total_generated = sum(safe_get(s, 'total_packets_generated') for s in sessions)
        total_transmitted = sum(safe_get(s, 'total_packets_transmitted') for s in sessions)
        
        # Calculate transmission rate
        overall_transmission_rate = (total_transmitted / total_generated * 100) if total_generated > 0 else 0
        
        summary_data = {
            "total_sessions": total_sessions,
            "completed_sessions": completed_sessions,
            "passed_sessions": passed_sessions,
            "success_rate": (passed_sessions / total_sessions * 100) if total_sessions > 0 else 0,
            "average_data_loss_percentage": avg_data_loss,
            "average_link_availability_percentage": avg_link_availability,
            "average_test_score": avg_test_score,
            "total_packets_generated": total_generated,
            "total_packets_transmitted": total_transmitted,
            "overall_transmission_rate": overall_transmission_rate
        }
        
        # Sync to Firebase
        if FIREBASE_AVAILABLE and firebase_manager and firebase_manager.enabled:
            await firebase_manager.sync_analytics_summary(summary_data)
        
        return {
            "success": True,
            "summary": summary_data,
            "recent_sessions": sessions[:10],  # Last 10 sessions
            "firebase_enabled": FIREBASE_AVAILABLE and firebase_manager and firebase_manager.enabled,
            "firebase_synced": FIREBASE_AVAILABLE and firebase_manager and firebase_manager.enabled
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status")
async def get_database_status():
    """Get current database and collection status with Firebase integration"""
    try:
        # Check if data collection is active
        is_collecting = data_collector.is_collecting()
        current_session = data_collector.get_current_session_id()
        
        # Get database statistics
        sessions = db_manager.get_all_sessions()
        
        # Get Firebase status
        firebase_status = None
        if FIREBASE_AVAILABLE and firebase_manager:
            firebase_status = firebase_manager.get_status()
        
        return {
            "success": True,
            "database_status": "connected",
            "data_collection": {
                "active": is_collecting,
                "current_session_id": current_session,
            },
            "statistics": {
                "total_sessions": len(sessions),
                "completed_sessions": len([s for s in sessions if s.get('status') == 'completed']),
                "latest_session": sessions[0] if sessions else None
            },
            "firebase": firebase_status,
            "firebase_enabled": FIREBASE_AVAILABLE and firebase_manager and firebase_manager.enabled
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/firebase/analytics")
async def get_firebase_analytics():
    """Get analytics data from Firebase (if available)"""
    try:
        if not FIREBASE_AVAILABLE or not firebase_manager or not firebase_manager.enabled:
            raise HTTPException(status_code=503, detail="Firebase not available")
        
        # Get Firebase analytics data
        firebase_summary = await firebase_manager.get_firebase_analytics_summary()
        firebase_sessions = await firebase_manager.get_firebase_test_sessions(limit=20)
        
        return {
            "success": True,
            "source": "firebase",
            "summary": firebase_summary,
            "sessions": firebase_sessions,
            "last_updated": firebase_summary.get('last_updated') if firebase_summary else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analytics/hybrid")
async def get_hybrid_analytics():
    """Get analytics from both local database and Firebase, with Firebase as fallback"""
    try:
        # Always get local data first
        local_sessions = db_manager.get_all_sessions()
        
        # Calculate local summary
        local_summary = None
        if local_sessions:
            total_sessions = len(local_sessions)
            completed_sessions = len([s for s in local_sessions if s.get('status') == 'completed'])
            passed_sessions = len([s for s in local_sessions if s.get('test_passed')])
            
            def safe_get(session, key, default=0):
                value = session.get(key)
                return value if value is not None else default
            
            data_loss_values = [safe_get(s, 'overall_data_loss_percentage') for s in local_sessions if s.get('overall_data_loss_percentage') is not None]
            avg_data_loss = sum(data_loss_values) / len(data_loss_values) if data_loss_values else 0
            
            total_generated = sum(safe_get(s, 'total_packets_generated') for s in local_sessions)
            total_transmitted = sum(safe_get(s, 'total_packets_transmitted') for s in local_sessions)
            
            local_summary = {
                "total_sessions": total_sessions,
                "completed_sessions": completed_sessions,
                "passed_sessions": passed_sessions,
                "success_rate": (passed_sessions / total_sessions * 100) if total_sessions > 0 else 0,
                "average_data_loss_percentage": avg_data_loss,
                "total_packets_generated": total_generated,
                "total_packets_transmitted": total_transmitted,
                "overall_transmission_rate": (total_transmitted / total_generated * 100) if total_generated > 0 else 0
            }
        
        # Try to get Firebase data
        firebase_summary = None
        firebase_sessions = []
        if FIREBASE_AVAILABLE and firebase_manager and firebase_manager.enabled:
            try:
                firebase_summary = await firebase_manager.get_firebase_analytics_summary()
                firebase_sessions = await firebase_manager.get_firebase_test_sessions(limit=10)
            except Exception as e:
                print(f"⚠️ Firebase analytics fetch failed: {e}")
        
        return {
            "success": True,
            "local": {
                "available": len(local_sessions) > 0,
                "summary": local_summary,
                "sessions": local_sessions[:10],
                "count": len(local_sessions)
            },
            "firebase": {
                "available": firebase_summary is not None,
                "summary": firebase_summary,
                "sessions": firebase_sessions,
                "count": len(firebase_sessions)
            },
            "primary_source": "local" if local_sessions else "firebase",
            "firebase_enabled": FIREBASE_AVAILABLE and firebase_manager and firebase_manager.enabled
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/sessions/{session_id}")
async def delete_session(session_id: str):
    """Delete a test session and all its data"""
    try:
        # Stop collection if this session is active
        if data_collector.get_current_session_id() == session_id:
            await data_collector.stop_collection("deleted")
        
        # Delete from database (this would need to be implemented in db_manager)
        # For now, just return success
        return {
            "success": True,
            "message": f"Session {session_id} deletion requested",
            "note": "Full deletion not yet implemented"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))