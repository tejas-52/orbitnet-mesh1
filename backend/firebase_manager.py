import firebase_admin
from firebase_admin import credentials, firestore
import os
import json
from datetime import datetime
from typing import Dict, Any, Optional, List

class FirebaseManager:
    def __init__(self, service_account_path: Optional[str] = None):
        self.db = None
        self.enabled = False
        
        # Try to initialize with service account if provided
        try:
            if service_account_path and os.path.exists(service_account_path):
                # Check if it's a real config (not template)
                with open(service_account_path, 'r') as f:
                    config = json.load(f)
                    if config.get('project_id') != 'YOUR_PROJECT_ID':
                        cred = credentials.Certificate(service_account_path)
                        firebase_admin.initialize_app(cred)
                        self.db = firestore.client()
                        self.enabled = True
                        print("🔥 Firebase initialized successfully with service account.")
                    else:
                        print("⚠️ Firebase service account is template - please configure with real credentials.")
            else:
                # Try default credentials (environment variable GOOGLE_APPLICATION_CREDENTIALS)
                if 'GOOGLE_APPLICATION_CREDENTIALS' in os.environ:
                    firebase_admin.initialize_app()
                    self.db = firestore.client()
                    self.enabled = True
                    print("🔥 Firebase initialized via environment credentials.")
                else:
                    print("⚠️ Firebase not initialized: No service account or environment credentials found.")
        except Exception as e:
            print(f"❌ Firebase initialization failed: {e}")

    async def update_mission_status(self, status: Dict[str, Any]):
        """Update the global mission status in Firestore"""
        if not self.enabled: return
        try:
            doc_ref = self.db.collection('mission').document('current_status')
            doc_ref.set({
                **status,
                'last_updated': datetime.now().isoformat()
            }, merge=True)
        except Exception as e:
            print(f"❌ Failed to update mission status in Firebase: {e}")

    async def push_telemetry(self, telemetry: Dict[str, Any]):
        """Push a telemetry packet to Firestore"""
        if not self.enabled: return
        try:
            # Update latest telemetry
            self.db.collection('mission').document('latest_telemetry').set({
                **telemetry,
                'pushed_at': datetime.now().isoformat()
            })
            
            # Optionally store in history (capped or sampled to avoid high costs)
            # self.db.collection('telemetry_history').add(telemetry)
        except Exception as e:
            print(f"❌ Failed to push telemetry to Firebase: {e}")

    async def log_link_event(self, link_status: Dict[str, Any]):
        """Log a link change event"""
        if not self.enabled: return
        try:
            self.db.collection('link_history').add({
                **link_status,
                'timestamp': datetime.now().isoformat()
            })
        except Exception as e:
            print(f"❌ Failed to log link event to Firebase: {e}")

    # ============ ANALYTICS INTEGRATION ============
    
    async def sync_test_session(self, session_data: Dict[str, Any]):
        """Sync test session data to Firebase"""
        if not self.enabled: return
        try:
            session_id = session_data.get('session_id')
            if session_id:
                doc_ref = self.db.collection('analytics').collection('test_sessions').document(session_id)
                doc_ref.set({
                    **session_data,
                    'synced_at': datetime.now().isoformat(),
                    'source': 'orbitnet_mesh'
                }, merge=True)
                print(f"✅ Synced session {session_id} to Firebase")
        except Exception as e:
            print(f"❌ Failed to sync session to Firebase: {e}")

    async def sync_analytics_summary(self, summary_data: Dict[str, Any]):
        """Sync analytics summary to Firebase"""
        if not self.enabled: return
        try:
            doc_ref = self.db.collection('analytics').document('summary')
            doc_ref.set({
                **summary_data,
                'last_updated': datetime.now().isoformat(),
                'source': 'orbitnet_mesh'
            }, merge=True)
            print("✅ Synced analytics summary to Firebase")
        except Exception as e:
            print(f"❌ Failed to sync analytics summary to Firebase: {e}")

    async def get_firebase_analytics_summary(self) -> Optional[Dict[str, Any]]:
        """Get analytics summary from Firebase"""
        if not self.enabled: return None
        try:
            doc_ref = self.db.collection('analytics').document('summary')
            doc = doc_ref.get()
            if doc.exists:
                return doc.to_dict()
            return None
        except Exception as e:
            print(f"❌ Failed to get analytics from Firebase: {e}")
            return None

    async def get_firebase_test_sessions(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Get test sessions from Firebase"""
        if not self.enabled: return []
        try:
            sessions_ref = self.db.collection('analytics').collection('test_sessions')
            docs = sessions_ref.order_by('start_time', direction=firestore.Query.DESCENDING).limit(limit).stream()
            return [doc.to_dict() for doc in docs]
        except Exception as e:
            print(f"❌ Failed to get sessions from Firebase: {e}")
            return []

    async def log_transmission_event(self, event_data: Dict[str, Any]):
        """Log transmission events to Firebase for real-time analytics"""
        if not self.enabled: return
        try:
            self.db.collection('analytics').collection('transmission_events').add({
                **event_data,
                'timestamp': datetime.now().isoformat(),
                'source': 'orbitnet_mesh'
            })
        except Exception as e:
            print(f"❌ Failed to log transmission event to Firebase: {e}")

    def get_status(self) -> Dict[str, Any]:
        """Get Firebase connection status"""
        return {
            'enabled': self.enabled,
            'connected': self.db is not None,
            'collections': ['mission', 'analytics', 'link_history'] if self.enabled else []
        }

# Global instance
firebase_manager = FirebaseManager(service_account_path=os.path.join(os.path.dirname(__file__), "firebase-service-account.json"))
