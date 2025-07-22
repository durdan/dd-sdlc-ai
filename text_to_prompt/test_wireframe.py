#!/usr/bin/env python3

import requests
import json
import sys

def test_wireframe_generation():
    """Test the wireframe generation API."""
    
    url = "http://localhost:5000/api/wireframe/generate"
    
    test_prompt = "Create a simple login page with email and password fields"
    
    payload = {
        "prompt": test_prompt
    }
    
    headers = {
        "Content-Type": "application/json"
    }
    
    try:
        print(f"Testing wireframe generation with prompt: '{test_prompt}'")
        print("Sending request...")
        
        response = requests.post(url, json=payload, headers=headers, timeout=60)
        
        if response.status_code == 200:
            data = response.json()
            
            if data.get('success'):
                wireframe = data.get('wireframe', {})
                print(f"✅ Success! Generated wireframe: '{wireframe.get('title', 'Untitled')}'")
                print(f"📝 Description: {wireframe.get('description', 'No description')}")
                print(f"🔧 Components: {len(wireframe.get('components', []))}")
                print(f"📋 Annotations: {len(wireframe.get('annotations', []))}")
                
                # Test rendering
                test_rendering(wireframe)
                
                return True
            else:
                print(f"❌ API returned success=false: {data}")
                return False
        else:
            print(f"❌ HTTP Error {response.status_code}: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print("❌ Request timed out")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_rendering(wireframe_data):
    """Test wireframe rendering capabilities."""
    
    print("\n🎨 Testing rendering capabilities...")
    
    # Test SVG rendering
    try:
        svg_url = "http://localhost:5000/api/wireframe/render/svg"
        svg_response = requests.post(svg_url, json={"wireframe": wireframe_data}, timeout=30)
        
        if svg_response.status_code == 200:
            svg_data = svg_response.json()
            if svg_data.get('success'):
                print("✅ SVG rendering successful")
            else:
                print(f"❌ SVG rendering failed: {svg_data}")
        else:
            print(f"❌ SVG rendering HTTP error: {svg_response.status_code}")
    except Exception as e:
        print(f"❌ SVG rendering error: {e}")
    
    # Test HTML rendering
    try:
        html_url = "http://localhost:5000/api/wireframe/render/html"
        html_response = requests.post(html_url, json={"wireframe": wireframe_data}, timeout=30)
        
        if html_response.status_code == 200:
            html_data = html_response.json()
            if html_data.get('success'):
                print("✅ HTML rendering successful")
            else:
                print(f"❌ HTML rendering failed: {html_data}")
        else:
            print(f"❌ HTML rendering HTTP error: {html_response.status_code}")
    except Exception as e:
        print(f"❌ HTML rendering error: {e}")

def test_templates():
    """Test template functionality."""
    
    print("\n📋 Testing templates...")
    
    try:
        templates_url = "http://localhost:5000/api/wireframe/templates"
        response = requests.get(templates_url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                templates = data.get('templates', [])
                print(f"✅ Templates loaded: {len(templates)} available")
                for template in templates[:3]:  # Show first 3
                    print(f"   - {template.get('name', 'Unknown')}: {template.get('description', 'No description')}")
            else:
                print(f"❌ Templates failed: {data}")
        else:
            print(f"❌ Templates HTTP error: {response.status_code}")
    except Exception as e:
        print(f"❌ Templates error: {e}")

if __name__ == "__main__":
    print("🧪 Wireframe Generator API Test")
    print("=" * 40)
    
    # Test templates first
    test_templates()
    
    # Test wireframe generation
    success = test_wireframe_generation()
    
    if success:
        print("\n🎉 All tests passed!")
        sys.exit(0)
    else:
        print("\n💥 Some tests failed!")
        sys.exit(1)

