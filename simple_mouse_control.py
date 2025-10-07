#!/usr/bin/env python3
"""
Simple mouse control using the same pattern as working JavaScript
"""

import evdev
import requests
import json
import time

def send_robot_command(robot_ip, x=0, y=0, z=0):
    """Send movement command using same format as JavaScript"""
    try:
        # Same format as working JavaScript WASD keys
        url = f"http://{robot_ip}:8000/robot_command"  # We'll create this endpoint
        data = {"x": x, "y": y, "z": z}
        
        # For now, just print what we would send
        print(f"🤖 Would send: x={x}, y={y}, z={z}")
        return True
        
    except Exception as e:
        print(f"❌ Command failed: {e}")
        return False

def main():
    robot_ip = input("Enter robot IP: ")
    
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
    
    try:
        for event in mouse.read_loop():
            if event.type == evdev.ecodes.EV_REL:
                # Scroll wheel
                if event.code == evdev.ecodes.REL_WHEEL:
                    if event.value > 0:  # Scroll up
                        print("⬆️ Scroll up - Forward")
                        send_robot_command(robot_ip, x=0.6)
                        time.sleep(0.1)
                        send_robot_command(robot_ip, x=0)
                    elif event.value < 0:  # Scroll down
                        print("⬇️ Scroll down - Backward")
                        send_robot_command(robot_ip, x=-0.4)
                        time.sleep(0.1)
                        send_robot_command(robot_ip, x=0)
            
            elif event.type == evdev.ecodes.EV_KEY and event.value == 1:
                # Button clicks
                if event.code == evdev.ecodes.BTN_LEFT:
                    print("👈 Left click - Turn left")
                    send_robot_command(robot_ip, z=1.5)
                    time.sleep(0.2)
                    send_robot_command(robot_ip, z=0)
                
                elif event.code == evdev.ecodes.BTN_RIGHT:
                    print("👉 Right click - Turn right")
                    send_robot_command(robot_ip, z=-1.5)
                    time.sleep(0.2)
                    send_robot_command(robot_ip, z=0)
                    
    except KeyboardInterrupt:
        print("\n🛑 Mouse control stopped")

if __name__ == "__main__":
    main()