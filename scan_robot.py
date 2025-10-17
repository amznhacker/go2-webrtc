#!/usr/bin/env python3
"""
Robot Scanner - Discover GO2 robot services and endpoints
"""
import requests
import socket
import json
from concurrent.futures import ThreadPoolExecutor

ROBOT_IP = "192.168.137.100"

def scan_port(port):
    """Check if a port is open"""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(1)
        result = sock.connect_ex((ROBOT_IP, port))
        sock.close()
        return port if result == 0 else None
    except:
        return None

def test_http_endpoint(port, path="/"):
    """Test HTTP endpoint"""
    try:
        url = f"http://{ROBOT_IP}:{port}{path}"
        response = requests.get(url, timeout=3)
        return {
            "port": port,
            "path": path,
            "status": response.status_code,
            "content": response.text[:200] if response.text else "",
            "headers": dict(response.headers)
        }
    except Exception as e:
        return {"port": port, "path": path, "error": str(e)}

def main():
    print(f"🔍 Scanning robot at {ROBOT_IP}")
    
    # Common ports to check
    ports_to_scan = [
        80, 443, 8080, 8081, 8443, 9090, 9091, 9990, 9991, 9992,
        1935, 8000, 8001, 8888, 3000, 5000, 7000, 10000, 22, 23
    ]
    
    print("\n📡 Scanning ports...")
    with ThreadPoolExecutor(max_workers=20) as executor:
        results = list(executor.map(scan_port, ports_to_scan))
    
    open_ports = [port for port in results if port is not None]
    print(f"Open ports: {open_ports}")
    
    # Test HTTP endpoints on open ports
    print("\n🌐 Testing HTTP endpoints...")
    http_results = []
    for port in open_ports:
        for path in ["/", "/status", "/info", "/api", "/con_notify", "/offer"]:
            result = test_http_endpoint(port, path)
            if "error" not in result or "Connection refused" not in result.get("error", ""):
                http_results.append(result)
                print(f"  {port}{path}: {result.get('status', 'ERROR')} - {result.get('content', result.get('error', ''))[:50]}")
    
    # Test specific GO2 endpoints
    print("\n🤖 Testing GO2 specific endpoints...")
    go2_endpoints = [
        ("9991", "/con_notify"),
        ("8081", "/offer"),
        ("8080", "/"),
        ("80", "/"),
    ]
    
    for port, path in go2_endpoints:
        try:
            url = f"http://{ROBOT_IP}:{port}{path}"
            response = requests.post(url, json={"test": "data"}, timeout=3)
            print(f"  POST {port}{path}: {response.status_code} - {response.text[:100]}")
        except Exception as e:
            print(f"  POST {port}{path}: ERROR - {str(e)[:50]}")
    
    print(f"\n✅ Scan complete for {ROBOT_IP}")

if __name__ == "__main__":
    main()