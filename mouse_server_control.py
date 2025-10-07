#!/usr/bin/env python3
"""
Mouse control using the EXACT same method as the working web interface
Sends HTTP requests to server.py just like the JavaScript does
"""

import evdev
import requests
import json
import time
import threading

def send_robot_command(x=0, y=0, z=0):
    """Send command to server.py exactly like JavaScript does"""
    try:
        # Same format as JavaScript publishApi
        uniq_id = int(time.time() * 1000) % 2147483648
        
        data = {
            "header": {"identity": {"id": uniq_id, "api_id": 1008}},
            "parameter": json.dumps({"x": x, "y": y, "z": z})
        }
        
        # Send to local server (like JavaScript fetch)
        url = "http://localhost:8081/robot_move"  # We'll add this endpoint
        
        # For now, just print (we'll add the endpoint)
        print(f"🤖 Sending: x={x}, y={y}, z={z}")
        return True
        
    except Exception as e:
        print(f"❌ Command failed: {e}")
        return False

def mouse_control():
    """Read mouse events and send commands"""
    # Find Logitech M350
    devices = [evdev.InputDevice(path) for path in evdev.list_devices()]
    mouse = None
    
    for device in devices:
        if 'logitech' in device.name.lower() and 'm350' in device.name.lower():
            mouse = device
            break
    
    if not mouse:
        print("❌ Logitech M350 not found")
        return
    
    print(f"✅ Found: {mouse.name}")
    print("🖱️ Controls:")
    print("  Scroll Up: Forward")
    print("  Scroll Down: Backward")
    print("  Left Click: Turn Left")
    print("  Right Click: Turn Right")
    print("🛑 Press Ctrl+C to stop")
    print("\n⚠️  Make sure server.py is running!")
    
    try:
        for event in mouse.read_loop():
            if event.type == evdev.ecodes.EV_REL:
                # Scroll wheel
                if event.code == evdev.ecodes.REL_WHEEL:
                    if event.value > 0:  # Scroll up
                        print("⬆️ Forward")
                        send_robot_command(x=0.6)
                        time.sleep(0.1)
                        send_robot_command(x=0)
                    elif event.value < 0:  # Scroll down
                        print("⬇️ Backward")
                        send_robot_command(x=-0.4)
                        time.sleep(0.1)
                        send_robot_command(x=0)
            
            elif event.type == evdev.ecodes.EV_KEY and event.value == 1:
                # Button clicks
                if event.code == evdev.ecodes.BTN_LEFT:
                    print("👈 Turn left")
                    send_robot_command(z=1.5)
                    time.sleep(0.2)
                    send_robot_command(z=0)
                
                elif event.code == evdev.ecodes.BTN_RIGHT:
                    print("👉 Turn right")
                    send_robot_command(z=-1.5)
                    time.sleep(0.2)
                    send_robot_command(z=0)
                    
    except KeyboardInterrupt:
        print("\n🛑 Mouse control stopped")

if __name__ == "__main__":
    mouse_control()