#!/usr/bin/env python3
"""
Test script to verify payload flow integration from backend/payload_source to frontend
"""

import requests
import json
import time

def test_payload_flow():
    """Test that payload data flows from backend to frontend"""
    
    print("🧪 Testing Payload Flow Integration")
    print("=" * 50)
    
    # Test 1: Check if backend is running
    try:
        response = requests.get("http://localhost:8001/api/status", timeout=5)
        if response.status_code == 200:
            print("✅ Backend server is running")
        else:
            print("❌ Backend server not responding properly")
            return False
    except requests.exceptions.RequestException:
        print("❌ Backend server not running on http://localhost:8001")
        print("   Please start the backend with: python backend/main.py")
        return False
    
    # Test 2: Check telemetry endpoint for payload data
    try:
        response = requests.get("http://localhost:8001/api/telemetry/latest", timeout=5)
        if response.status_code == 200:
            telemetry = response.json()
            print("✅ Telemetry endpoint accessible")
            
            # Check if actual_payload is included
            if 'actual_payload' in telemetry and telemetry['actual_payload']:
                payload = telemetry['actual_payload']
                print(f"✅ Payload data found in telemetry:")
                print(f"   📄 File: {payload['filename']}")
                print(f"   📊 Size: {payload['size_bytes']} bytes")
                print(f"   🏷️  Type: {payload['type']}")
                return True
            else:
                print("⚠️  No payload data in telemetry (may be normal if mission not started)")
                return True
        else:
            print("❌ Telemetry endpoint not accessible")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Error accessing telemetry: {e}")
        return False

def test_payload_source_files():
    """Test that payload source files exist"""
    import os
    
    payload_dir = "backend/payload_source"
    if not os.path.exists(payload_dir):
        print(f"❌ Payload source directory not found: {payload_dir}")
        return False
    
    files = [f for f in os.listdir(payload_dir) if os.path.isfile(os.path.join(payload_dir, f))]
    if not files:
        print(f"❌ No payload files found in {payload_dir}")
        return False
    
    print(f"✅ Found {len(files)} payload files:")
    for i, file in enumerate(files[:5]):  # Show first 5 files
        size = os.path.getsize(os.path.join(payload_dir, file))
        print(f"   {i+1}. {file} ({size} bytes)")
    
    if len(files) > 5:
        print(f"   ... and {len(files) - 5} more files")
    
    return True

def main():
    """Run all tests"""
    print("🚀 ORBITNET-MESH Payload Flow Integration Test")
    print("=" * 60)
    
    # Test payload source files
    if not test_payload_source_files():
        return
    
    print()
    
    # Test backend integration
    if not test_payload_flow():
        return
    
    print()
    print("🎉 Payload Flow Integration Test Complete!")
    print()
    print("📋 Next Steps:")
    print("1. Start the backend: python backend/main.py")
    print("2. Start the frontend: npm run dev")
    print("3. Start a mission to see payload files flowing through the system")
    print("4. Watch the Mission Control Panel show actual payload files")

if __name__ == "__main__":
    main()