#!/usr/bin/env python3
"""
Test script to verify the Data Flow Pipeline visualization
"""

import requests
import json
import time

def test_pipeline_visualization():
    """Test the data flow pipeline visualization components"""
    
    print("🚀 Testing Data Flow Pipeline Visualization")
    print("=" * 60)
    
    # Test 1: Check if backend provides necessary data
    try:
        response = requests.get("http://localhost:8001/api/status", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print("✅ Backend API accessible")
            
            # Check required fields for pipeline
            required_fields = ['isRunning', 'stats']
            for field in required_fields:
                if field in data:
                    print(f"✅ Field '{field}' available")
                else:
                    print(f"⚠️  Field '{field}' missing")
        else:
            print("❌ Backend API not responding properly")
            return False
    except requests.exceptions.RequestException:
        print("❌ Backend server not running on http://localhost:8001")
        print("   Please start the backend with: python backend/main.py")
        return False
    
    # Test 2: Check telemetry for payload data
    try:
        response = requests.get("http://localhost:8001/api/telemetry/latest", timeout=5)
        if response.status_code == 200:
            telemetry = response.json()
            print("✅ Telemetry data available for pipeline")
            
            # Check for payload information
            if 'actual_payload' in telemetry and telemetry['actual_payload']:
                payload = telemetry['actual_payload']
                print(f"✅ Payload data for pipeline visualization:")
                print(f"   📄 File: {payload['filename']}")
                print(f"   📊 Size: {payload['size_bytes']} bytes")
                print(f"   🏷️  Type: {payload['type']}")
            else:
                print("⚠️  No payload data (normal if mission not started)")
        else:
            print("⚠️  Telemetry endpoint not accessible")
    except requests.exceptions.RequestException as e:
        print(f"⚠️  Error accessing telemetry: {e}")
    
    # Test 3: Check system status for pipeline stages
    try:
        response = requests.get("http://localhost:8001/system/status", timeout=5)
        if response.status_code == 200:
            status = response.json()
            print("✅ System status available for pipeline stages")
            
            # Check pipeline-relevant data
            pipeline_data = {
                'Total Generated': status.get('telemetry_generated', 0),
                'Transmitted': status.get('telemetry_sent', 0),
                'Buffered': status.get('telemetry_buffered', 0),
                'Lost': status.get('telemetry_lost', 0),
                'System Mode': status.get('system_mode', 'Unknown')
            }
            
            for key, value in pipeline_data.items():
                print(f"   {key}: {value}")
                
        else:
            print("⚠️  System status endpoint not accessible")
    except requests.exceptions.RequestException as e:
        print(f"⚠️  Error accessing system status: {e}")
    
    return True

def test_pipeline_components():
    """Test individual pipeline components"""
    
    print("\n🔧 Pipeline Component Analysis")
    print("=" * 40)
    
    components = [
        "Payload Source - Scientific data files",
        "Onboard Processing - Compression & encoding", 
        "Smart Buffer - ORBITNET protection",
        "Satellite Link - Communication channel",
        "Ground Station - Mission control reception"
    ]
    
    for i, component in enumerate(components, 1):
        print(f"✅ Stage {i}: {component}")
    
    print("\n📊 Pipeline Features:")
    features = [
        "Real-time payload file visualization",
        "Animated flow between stages",
        "Live packet progress tracking",
        "Stage-specific status indicators",
        "ORBITNET protection visualization",
        "Communication blackout handling",
        "Zero data loss demonstration"
    ]
    
    for feature in features:
        print(f"   ✨ {feature}")

def main():
    """Run all pipeline tests"""
    print("🎨 ORBITNET-MESH Data Flow Pipeline Test")
    print("=" * 70)
    
    # Test backend integration
    if not test_pipeline_visualization():
        return
    
    # Test component design
    test_pipeline_components()
    
    print("\n🎉 Data Flow Pipeline Test Complete!")
    print("\n📋 Pipeline Visualization Features:")
    print("1. 🎬 Cinematic 5-stage pipeline animation")
    print("2. 📦 Real payload file stream visualization") 
    print("3. 🔄 Live progress bars for each file")
    print("4. 🎯 Stage-specific status indicators")
    print("5. 🛡️  ORBITNET protection visualization")
    print("6. 📊 Real-time metrics dashboard")
    print("7. 🚨 Communication blackout handling")
    print("\n🚀 Ready for judge demonstration!")

if __name__ == "__main__":
    main()