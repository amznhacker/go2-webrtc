#!/usr/bin/env python3
"""
Enhanced GO2 WebRTC Server with integrated color tracking
Serves web interface and provides color tracking functionality
"""

import http.server
import socketserver
import json
import os
import sys
import threading
import time
import cv2
import numpy as np

# Add go2_webrtc module to path
path_to_add = os.path.abspath(os.path.join(os.path.dirname(__file__), "../python"))
if os.path.exists(path_to_add):
    sys.path.insert(0, path_to_add)
    print(f"Added {path_to_add} to sys.path")

import go2_webrtc

PORT = 8081

class SDPDict:
    def __init__(self, existing_dict):
        self.__dict__["_dict"] = existing_dict

    def __getattr__(self, attr):
        try:
            return self._dict[attr]
        except KeyError:
            raise AttributeError(f"No such attribute: {attr}")

class ColorTracker:
    def __init__(self):
        self.robot_connection = None
        self.tracking_enabled = False
        self.camera = None
        
        # Red color range in HSV
        self.lower_red1 = np.array([0, 120, 70])
        self.upper_red1 = np.array([10, 255, 255])
        self.lower_red2 = np.array([170, 120, 70])
        self.upper_red2 = np.array([180, 255, 255])
        
        # Control parameters
        self.center_threshold = 80
        self.min_area = 1000
        self.turn_speed = 0.8
        self.move_speed = 0.3
        
        print("🎯 Color Tracker initialized")
    
    def set_robot_connection(self, connection):
        """Set the robot connection for sending commands"""
        self.robot_connection = connection
        print("🤖 Robot connection set for tracker")
    
    def start_tracking(self):
        """Start color tracking"""
        if self.tracking_enabled:
            return
        
        self.tracking_enabled = True
        print("🔴 Starting red object tracking...")
        
        # Start tracking thread
        tracking_thread = threading.Thread(target=self._tracking_loop, daemon=True)
        tracking_thread.start()
    
    def stop_tracking(self):
        """Stop color tracking"""
        self.tracking_enabled = False
        if self.robot_connection:
            try:
                # Stop robot movement
                self.robot_connection.move(0, 0, 0)
            except:
                pass
        print("⏹️ Color tracking stopped")
    
    def find_red_blob(self, frame):
        """Find the largest red blob in frame"""
        hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
        
        # Create mask for red color
        mask1 = cv2.inRange(hsv, self.lower_red1, self.upper_red1)
        mask2 = cv2.inRange(hsv, self.lower_red2, self.upper_red2)
        mask = mask1 + mask2
        
        # Clean up mask
        mask = cv2.erode(mask, None, iterations=2)
        mask = cv2.dilate(mask, None, iterations=2)
        
        # Find contours
        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if not contours:
            return None
        
        # Find largest contour
        largest_contour = max(contours, key=cv2.contourArea)
        area = cv2.contourArea(largest_contour)
        
        if area < self.min_area:
            return None
        
        # Get center
        M = cv2.moments(largest_contour)
        if M["m00"] == 0:
            return None
        
        center_x = int(M["m10"] / M["m00"])
        center_y = int(M["m01"] / M["m00"])
        
        return {
            'center': (center_x, center_y),
            'area': area
        }
    
    def _tracking_loop(self):
        """Main tracking loop"""
        # Initialize camera
        self.camera = cv2.VideoCapture(0)
        if not self.camera.isOpened():
            print("❌ Cannot open camera for tracking")
            return
        
        self.camera.set(cv2.CAP_PROP_FRAME_WIDTH, 320)
        self.camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 240)
        self.camera.set(cv2.CAP_PROP_FPS, 10)
        
        print("📹 Tracking camera initialized")
        
        try:
            while self.tracking_enabled:
                ret, frame = self.camera.read()
                if not ret:
                    continue
                
                # Find red blob
                blob_info = self.find_red_blob(frame)
                
                if blob_info and self.robot_connection:
                    center_x, center_y = blob_info['center']
                    area = blob_info['area']
                    
                    frame_center_x = frame.shape[1] // 2
                    offset_x = center_x - frame_center_x
                    
                    # Movement logic
                    x, y, z = 0, 0, 0
                    
                    # Horizontal tracking
                    if abs(offset_x) > self.center_threshold:
                        if offset_x > 0:
                            z = -self.turn_speed  # Turn right
                        else:
                            z = self.turn_speed   # Turn left
                    
                    # Distance tracking
                    if area < 3000:  # Too far
                        x = self.move_speed
                    elif area > 12000:  # Too close
                        x = -self.move_speed
                    
                    # Send movement command
                    try:
                        self.robot_connection.move(x, y, z)
                    except Exception as e:
                        print(f"Movement error: {e}")
                
                elif self.robot_connection:
                    # No target - stop moving
                    try:
                        self.robot_connection.move(0, 0, 0)
                    except:
                        pass
                
                time.sleep(0.1)  # Limit processing rate
        
        except Exception as e:
            print(f"Tracking error: {e}")
        
        finally:
            if self.camera:
                self.camera.release()
            print("📹 Tracking camera released")

# Global tracker instance
color_tracker = ColorTracker()

class CORSRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200, "ok")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        # Handle tracking control endpoints
        if self.path == "/start_tracking":
            color_tracker.start_tracking()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps({"status": "tracking_started"}).encode())
            return
        
        elif self.path == "/stop_tracking":
            color_tracker.stop_tracking()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps({"status": "tracking_stopped"}).encode())
            return
        
        elif self.path == "/tracking_status":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            status = {"tracking_enabled": color_tracker.tracking_enabled}
            self.wfile.write(json.dumps(status).encode())
            return
        
        # Default file serving
        super().do_GET()

    def do_POST(self):
        if self.path == "/offer":
            content_length = int(self.headers["Content-Length"])
            post_data = self.rfile.read(content_length)
            
            try:
                data = SDPDict(json.loads(post_data))
            except json.JSONDecodeError:
                self.send_response(400)
                self.end_headers()
                return

            # Create robot connection and set it for tracker
            try:
                connection = go2_webrtc.Go2Connection(data.ip, data.token)
                color_tracker.set_robot_connection(connection)
                print(f"🤖 Robot connection established: {data.ip}")
            except Exception as e:
                print(f"Failed to create robot connection: {e}")

            response_data = go2_webrtc.Go2Connection.get_peer_answer(
                data, data.token, data.ip
            )
            
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps(response_data).encode("utf-8"))

if __name__ == "__main__":
    print("🚀 Starting GO2 WebRTC Server with Color Tracking")
    print(f"📡 Server running on port {PORT}")
    print("🔴 Color tracking available via web interface")
    
    try:
        with socketserver.TCPServer(("", PORT), CORSRequestHandler) as httpd:
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Shutting down server...")
        color_tracker.stop_tracking()