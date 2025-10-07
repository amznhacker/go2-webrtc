#!/usr/bin/env python3
"""
Mouse control using the EXACT same method as the working joystick example
"""

import asyncio
import json
import os
import evdev
import threading
import time
from go2_webrtc import Go2Connection, ROBOT_CMD

# Global variables for mouse state
mouse_x = 0
mouse_y = 0  
mouse_z = 0
mouse_commands = []

def gen_mov_command(x: float, y: float, z: float):
    """Generate movement command - EXACT copy from working joystick example"""
    command = {
        "type": "msg",
        "topic": "rt/api/sport/request", 
        "data": {
            "header": {"identity": {"id": Go2Connection.generate_id(), "api_id": 1008}},
            "parameter": json.dumps({"x": x, "y": y, "z": z}),
        },
    }
    return json.dumps(command)

def gen_command(cmd: int):
    """Generate action command - EXACT copy from working joystick example"""
    command = {
        "type": "msg",
        "topic": "rt/api/sport/request",
        "data": {
            "header": {"identity": {"id": Go2Connection.generate_id(), "api_id": cmd}},
            "parameter": json.dumps(cmd),
        },
    }
    return json.dumps(command)

def mouse_thread():
    """Thread to read mouse events"""
    global mouse_x, mouse_y, mouse_z, mouse_commands
    
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
    print("  Middle Click: Stand")
    
    try:
        for event in mouse.read_loop():
            if event.type == evdev.ecodes.EV_REL:
                # Scroll wheel
                if event.code == evdev.ecodes.REL_WHEEL:
                    if event.value > 0:  # Scroll up
                        print("⬆️ Forward")
                        mouse_x = 0.4
                        time.sleep(0.1)
                        mouse_x = 0
                    elif event.value < 0:  # Scroll down
                        print("⬇️ Backward") 
                        mouse_x = -0.3
                        time.sleep(0.1)
                        mouse_x = 0
            
            elif event.type == evdev.ecodes.EV_KEY and event.value == 1:
                # Button clicks
                if event.code == evdev.ecodes.BTN_LEFT:
                    print("👈 Turn left")
                    mouse_z = 1.0
                    time.sleep(0.2)
                    mouse_z = 0
                
                elif event.code == evdev.ecodes.BTN_RIGHT:
                    print("👉 Turn right")
                    mouse_z = -1.0
                    time.sleep(0.2)
                    mouse_z = 0
                
                elif event.code == evdev.ecodes.BTN_MIDDLE:
                    print("🐕 Stand")
                    mouse_commands.append(ROBOT_CMD["StandUp"])
                    
    except KeyboardInterrupt:
        pass

async def start_mouse_bridge(robot_conn):
    """Main control loop - EXACT copy from working joystick example"""
    global mouse_x, mouse_y, mouse_z, mouse_commands
    
    await robot_conn.connect_robot()
    
    # Wait for data channel to be ready
    while not robot_conn.data_channel or robot_conn.data_channel.readyState != "open":
        print("⏳ Waiting for data channel...")
        await asyncio.sleep(0.5)
    
    print("✅ Data channel ready!")
    
    # Start mouse reading thread
    mouse_thread_handle = threading.Thread(target=mouse_thread, daemon=True)
    mouse_thread_handle.start()
    
    while True:
        # Check if data channel is still open
        if not robot_conn.data_channel or robot_conn.data_channel.readyState != "open":
            print("❌ Data channel closed")
            break
            
        # Handle action commands
        if mouse_commands:
            cmd = mouse_commands.pop(0)
            robot_cmd = gen_command(cmd)
            robot_conn.data_channel.send(robot_cmd)
        
        # Handle movement commands
        if abs(mouse_x) > 0.0 or abs(mouse_y) > 0.0 or abs(mouse_z) > 0.0:
            robot_cmd = gen_mov_command(mouse_x, mouse_y, mouse_z)
            robot_conn.data_channel.send(robot_cmd)
        
        await asyncio.sleep(0.1)

async def main():
    robot_ip = input("Enter robot IP: ")
    
    conn = Go2Connection(
        robot_ip,
        "",  # No token needed
    )
    
    try:
        await start_mouse_bridge(conn)
    except KeyboardInterrupt:
        print("\n🛑 Mouse control stopped")
    finally:
        await conn.pc.close()

if __name__ == "__main__":
    asyncio.run(main())