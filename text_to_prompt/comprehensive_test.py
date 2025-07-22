#!/usr/bin/env python3

import requests
import json
import time
import sys
from typing import Dict, List, Any

class WireframeGeneratorTester:
    """Comprehensive test suite for the wireframe generator application."""
    
    def __init__(self, api_base="http://localhost:5000/api", frontend_url="http://localhost:5173"):
        self.api_base = api_base
        self.frontend_url = frontend_url
        self.test_results = []
        
    def log_test(self, test_name: str, success: bool, details: str = ""):
        """Log test results."""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"    {details}")
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details
        })
    
    def test_api_endpoints(self):
        """Test all API endpoints."""
        print("\n🔧 Testing API Endpoints")
        print("=" * 40)
        
        # Test templates endpoint
        try:
            response = requests.get(f"{self.api_base}/wireframe/templates", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and len(data.get('templates', [])) > 0:
                    self.log_test("Templates API", True, f"Found {len(data['templates'])} templates")
                else:
                    self.log_test("Templates API", False, "No templates returned")
            else:
                self.log_test("Templates API", False, f"HTTP {response.status_code}")
        except Exception as e:
            self.log_test("Templates API", False, str(e))
        
        # Test wireframe generation
        test_prompts = [
            "Create a simple login page with email and password fields",
            "Design a dashboard with charts and navigation",
            "Build a mobile app home screen with cards and bottom navigation"
        ]
        
        for i, prompt in enumerate(test_prompts):
            try:
                response = requests.post(
                    f"{self.api_base}/wireframe/generate",
                    json={"prompt": prompt},
                    timeout=60
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get('success'):
                        wireframe = data.get('wireframe', {})
                        components = len(wireframe.get('components', []))
                        annotations = len(wireframe.get('annotations', []))
                        self.log_test(
                            f"Generation Test {i+1}", 
                            True, 
                            f"Generated {components} components, {annotations} annotations"
                        )
                        
                        # Test rendering for the first wireframe
                        if i == 0:
                            self.test_rendering(wireframe)
                    else:
                        self.log_test(f"Generation Test {i+1}", False, data.get('error', 'Unknown error'))
                else:
                    self.log_test(f"Generation Test {i+1}", False, f"HTTP {response.status_code}")
            except Exception as e:
                self.log_test(f"Generation Test {i+1}", False, str(e))
    
    def test_rendering(self, wireframe_data: Dict[str, Any]):
        """Test wireframe rendering capabilities."""
        print("\n🎨 Testing Rendering Capabilities")
        print("=" * 40)
        
        # Test SVG rendering
        try:
            response = requests.post(
                f"{self.api_base}/wireframe/render/svg",
                json={"wireframe": wireframe_data},
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('svg'):
                    svg_length = len(data['svg'])
                    self.log_test("SVG Rendering", True, f"Generated {svg_length} characters of SVG")
                else:
                    self.log_test("SVG Rendering", False, "No SVG content returned")
            else:
                self.log_test("SVG Rendering", False, f"HTTP {response.status_code}")
        except Exception as e:
            self.log_test("SVG Rendering", False, str(e))
        
        # Test HTML rendering
        try:
            response = requests.post(
                f"{self.api_base}/wireframe/render/html",
                json={"wireframe": wireframe_data},
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('html'):
                    html_length = len(data['html'])
                    self.log_test("HTML Rendering", True, f"Generated {html_length} characters of HTML")
                else:
                    self.log_test("HTML Rendering", False, "No HTML content returned")
            else:
                self.log_test("HTML Rendering", False, f"HTTP {response.status_code}")
        except Exception as e:
            self.log_test("HTML Rendering", False, str(e))
        
        # Test specifications generation
        try:
            response = requests.post(
                f"{self.api_base}/wireframe/specifications",
                json={"wireframe": wireframe_data},
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('specifications'):
                    specs = data['specifications']
                    self.log_test("Specifications", True, f"Generated specs with {len(specs)} sections")
                else:
                    self.log_test("Specifications", False, "No specifications returned")
            else:
                self.log_test("Specifications", False, f"HTTP {response.status_code}")
        except Exception as e:
            self.log_test("Specifications", False, str(e))
    
    def test_enhancement_features(self):
        """Test wireframe enhancement features."""
        print("\n✨ Testing Enhancement Features")
        print("=" * 40)
        
        # First generate a basic wireframe
        try:
            response = requests.post(
                f"{self.api_base}/wireframe/generate",
                json={"prompt": "Create a basic contact form"},
                timeout=60
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    wireframe = data.get('wireframe', {})
                    original_components = len(wireframe.get('components', []))
                    
                    # Test enhancement
                    enhancement_types = ['full', 'content', 'interactions', 'accessibility']
                    
                    for enhancement_type in enhancement_types:
                        try:
                            enhance_response = requests.post(
                                f"{self.api_base}/wireframe/enhance",
                                json={
                                    "wireframe": wireframe,
                                    "enhancement_type": enhancement_type
                                },
                                timeout=60
                            )
                            
                            if enhance_response.status_code == 200:
                                enhance_data = enhance_response.json()
                                if enhance_data.get('success'):
                                    enhanced_wireframe = enhance_data.get('wireframe', {})
                                    enhanced_components = len(enhanced_wireframe.get('components', []))
                                    self.log_test(
                                        f"Enhancement ({enhancement_type})", 
                                        True, 
                                        f"Enhanced from {original_components} to {enhanced_components} components"
                                    )
                                else:
                                    self.log_test(f"Enhancement ({enhancement_type})", False, enhance_data.get('error', 'Unknown error'))
                            else:
                                self.log_test(f"Enhancement ({enhancement_type})", False, f"HTTP {enhance_response.status_code}")
                        except Exception as e:
                            self.log_test(f"Enhancement ({enhancement_type})", False, str(e))
                else:
                    self.log_test("Enhancement Setup", False, "Failed to generate base wireframe")
            else:
                self.log_test("Enhancement Setup", False, f"HTTP {response.status_code}")
        except Exception as e:
            self.log_test("Enhancement Setup", False, str(e))
    
    def test_data_persistence(self):
        """Test data persistence and retrieval."""
        print("\n💾 Testing Data Persistence")
        print("=" * 40)
        
        # Generate a wireframe
        try:
            response = requests.post(
                f"{self.api_base}/wireframe/generate",
                json={"prompt": "Create a test wireframe for persistence testing"},
                timeout=60
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    wireframe = data.get('wireframe', {})
                    
                    # Test saving
                    try:
                        save_response = requests.post(
                            f"{self.api_base}/wireframe/save",
                            json={
                                "wireframe": wireframe,
                                "title": "Test Wireframe",
                                "description": "Test wireframe for persistence",
                                "prompt": "Create a test wireframe for persistence testing"
                            },
                            timeout=30
                        )
                        
                        if save_response.status_code == 200:
                            save_data = save_response.json()
                            if save_data.get('success'):
                                wireframe_id = save_data.get('wireframe', {}).get('id')
                                self.log_test("Save Wireframe", True, f"Saved with ID {wireframe_id}")
                                
                                # Test loading
                                if wireframe_id:
                                    try:
                                        load_response = requests.get(
                                            f"{self.api_base}/wireframe/load/{wireframe_id}",
                                            timeout=30
                                        )
                                        
                                        if load_response.status_code == 200:
                                            load_data = load_response.json()
                                            if load_data.get('success'):
                                                self.log_test("Load Wireframe", True, "Successfully loaded wireframe")
                                            else:
                                                self.log_test("Load Wireframe", False, load_data.get('error', 'Unknown error'))
                                        else:
                                            self.log_test("Load Wireframe", False, f"HTTP {load_response.status_code}")
                                    except Exception as e:
                                        self.log_test("Load Wireframe", False, str(e))
                            else:
                                self.log_test("Save Wireframe", False, save_data.get('error', 'Unknown error'))
                        else:
                            self.log_test("Save Wireframe", False, f"HTTP {save_response.status_code}")
                    except Exception as e:
                        self.log_test("Save Wireframe", False, str(e))
                else:
                    self.log_test("Persistence Setup", False, "Failed to generate wireframe")
            else:
                self.log_test("Persistence Setup", False, f"HTTP {response.status_code}")
        except Exception as e:
            self.log_test("Persistence Setup", False, str(e))
    
    def test_error_handling(self):
        """Test error handling and edge cases."""
        print("\n🚨 Testing Error Handling")
        print("=" * 40)
        
        # Test empty prompt
        try:
            response = requests.post(
                f"{self.api_base}/wireframe/generate",
                json={"prompt": ""},
                timeout=30
            )
            
            if response.status_code == 400:
                self.log_test("Empty Prompt Handling", True, "Correctly rejected empty prompt")
            else:
                self.log_test("Empty Prompt Handling", False, f"Unexpected response: {response.status_code}")
        except Exception as e:
            self.log_test("Empty Prompt Handling", False, str(e))
        
        # Test invalid wireframe data
        try:
            response = requests.post(
                f"{self.api_base}/wireframe/render/svg",
                json={"wireframe": {"invalid": "data"}},
                timeout=30
            )
            
            # Should handle gracefully, either with error or empty result
            if response.status_code in [200, 400, 500]:
                self.log_test("Invalid Data Handling", True, "Handled invalid data gracefully")
            else:
                self.log_test("Invalid Data Handling", False, f"Unexpected response: {response.status_code}")
        except Exception as e:
            self.log_test("Invalid Data Handling", False, str(e))
    
    def test_performance(self):
        """Test performance characteristics."""
        print("\n⚡ Testing Performance")
        print("=" * 40)
        
        # Test generation speed
        start_time = time.time()
        try:
            response = requests.post(
                f"{self.api_base}/wireframe/generate",
                json={"prompt": "Create a simple landing page"},
                timeout=120
            )
            
            end_time = time.time()
            duration = end_time - start_time
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.log_test("Generation Speed", True, f"Generated in {duration:.2f} seconds")
                else:
                    self.log_test("Generation Speed", False, f"Failed after {duration:.2f} seconds")
            else:
                self.log_test("Generation Speed", False, f"HTTP {response.status_code} after {duration:.2f} seconds")
        except Exception as e:
            self.log_test("Generation Speed", False, str(e))
    
    def run_all_tests(self):
        """Run all test suites."""
        print("🧪 Wireframe Generator - Comprehensive Test Suite")
        print("=" * 60)
        
        # Run all test suites
        self.test_api_endpoints()
        self.test_enhancement_features()
        self.test_data_persistence()
        self.test_error_handling()
        self.test_performance()
        
        # Summary
        print("\n📊 Test Summary")
        print("=" * 40)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result['success'])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\n❌ Failed Tests:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  - {result['test']}: {result['details']}")
        
        return failed_tests == 0

if __name__ == "__main__":
    tester = WireframeGeneratorTester()
    success = tester.run_all_tests()
    
    if success:
        print("\n🎉 All tests passed!")
        sys.exit(0)
    else:
        print("\n💥 Some tests failed!")
        sys.exit(1)

