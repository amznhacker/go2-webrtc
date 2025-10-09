#!/usr/bin/env python3
"""
Simple standalone color tracker that shows visual feedback
Run this alongside the regular server.py
"""

import cv2
import numpy as np
import time
import sys
import os
import requests
import json

# Add go2_webrtc module to path
path_to_add = os.path.abspath(os.path.join(os.path.dirname(__file__), "../python"))
if os.path.exists(path_to_add):
    sys.path.insert(0, path_to_add)

class SimpleTracker:
    def __init__(self, robot_ip, token=""):
        self.robot_ip = robot_ip
        self.token = token
        self.tracking_enabled = False
        
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
        
        print("🎯 Simple Color Tracker")
        print("Press 't' to toggle tracking, 'q' to quit")
    
    def send_robot_command(self, x=0, y=0, z=0):
        """Send movement command via WebRTC API"""
        try:
            # Send command to the WebRTC server
            command_data = {
                "api_id": 1008,
                "data": {"x": x, "y": y, "z": z}
            }
            
            # This would need to be sent through the WebRTC connection
            # For now, just print what we would send
            if x != 0 or y != 0 or z != 0:
                print(f"🤖 Command: x={x:.2f}, y={y:.2f}, z={z:.2f}")
        except Exception as e:
            print(f"❌ Command failed: {e}")
    
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
            return None, mask
        
        # Find largest contour
        largest_contour = max(contours, key=cv2.contourArea)
        area = cv2.contourArea(largest_contour)
        
        if area < self.min_area:
            return None, mask
        
        # Get bounding box and center
        x, y, w, h = cv2.boundingRect(largest_contour)
        center_x = x + w // 2
        center_y = y + h // 2
        
        return {
            'center': (center_x, center_y),
            'area': area,
            'bbox': (x, y, w, h),
            'contour': largest_contour
        }, mask
    
    def run(self):
        """Main tracking loop with visual feedback"""
        # Initialize camera
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            print("❌ Cannot open camera")
            return
        
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        cap.set(cv2.CAP_PROP_FPS, 15)
        
        print("📹 Camera initialized")
        print("🔴 Looking for RED objects...")
        
        try:
            while True:
                ret, frame = cap.read()
                if not ret:
                    break
                
                # Find red blob
                blob_info, mask = self.find_red_blob(frame)
                
                # Draw tracking info
                if blob_info:
                    # Draw bounding box
                    x, y, w, h = blob_info['bbox']
                    cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
                    
                    # Draw center point
                    center = blob_info['center']
                    cv2.circle(frame, center, 5, (0, 255, 0), -1)
                    
                    # Draw contour
                    cv2.drawContours(frame, [blob_info['contour']], -1, (0, 255, 0), 2)
                    
                    # Show area and status
                    area_text = f"Area: {int(blob_info['area'])}"
                    cv2.putText(frame, area_text, (x, y - 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
                    
                    # Calculate movement if tracking enabled
                    if self.tracking_enabled:
                        center_x, center_y = center
                        frame_center_x = frame.shape[1] // 2
                        offset_x = center_x - frame_center_x
                        
                        # Movement logic
                        x_cmd, y_cmd, z_cmd = 0, 0, 0
                        status = "🎯 TRACKING"
                        
                        # Horizontal tracking
                        if abs(offset_x) > self.center_threshold:
                            if offset_x > 0:
                                z_cmd = -self.turn_speed  # Turn right
                                status += " → Turn Right"
                            else:
                                z_cmd = self.turn_speed   # Turn left
                                status += " ← Turn Left"
                        
                        # Distance tracking
                        area = blob_info['area']
                        if area < 3000:  # Too far
                            x_cmd = self.move_speed
                            status += " ↑ Forward"
                        elif area > 12000:  # Too close
                            x_cmd = -self.move_speed
                            status += " ↓ Backward"
                        else:
                            status += " ✓ Good Distance"
                        
                        # Send command
                        self.send_robot_command(x_cmd, y_cmd, z_cmd)
                        
                        # Show tracking status
                        cv2.putText(frame, status, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
                    else:
                        cv2.putText(frame, "🔴 RED OBJECT DETECTED - Press 't' to track", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
                else:
                    if self.tracking_enabled:
                        cv2.putText(frame, "🔍 SEARCHING FOR RED OBJECT...", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
                        # Stop robot when no target
                        self.send_robot_command(0, 0, 0)
                    else:
                        cv2.putText(frame, "🔴 Hold up RED object, press 't' to start tracking", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
                
                # Draw center crosshair
                h, w = frame.shape[:2]
                cv2.line(frame, (w//2 - 20, h//2), (w//2 + 20, h//2), (255, 255, 255), 1)
                cv2.line(frame, (w//2, h//2 - 20), (w//2, h//2 + 20), (255, 255, 255), 1)
                
                # Show tracking mode
                mode_text = "TRACKING ON" if self.tracking_enabled else "TRACKING OFF"
                mode_color = (0, 255, 0) if self.tracking_enabled else (0, 0, 255)
                cv2.putText(frame, mode_text, (w - 150, h - 20), cv2.FONT_HERSHEY_SIMPLEX, 0.6, mode_color, 2)
                
                # Display frames
                cv2.imshow('GO2 Color Tracker - Visual Feedback', frame)
                cv2.imshow('Red Detection Mask', mask)
                
                # Handle key presses
                key = cv2.waitKey(1) & 0xFF
                if key == ord('q'):
                    break
                elif key == ord('t'):
                    self.tracking_enabled = not self.tracking_enabled
                    status = "ENABLED" if self.tracking_enabled else "DISABLED"
                    print(f"🎯 Tracking {status}")
                    if not self.tracking_enabled:
                        self.send_robot_command(0, 0, 0)  # Stop robot
                
                time.sleep(0.05)  # Limit processing rate
        
        except KeyboardInterrupt:
            print("\n🛑 Stopping tracker...")
        
        finally:
            # Stop robot
            self.send_robot_command(0, 0, 0)
            cap.release()
            cv2.destroyAllWindows()
            print("✅ Tracker stopped")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 simple_tracker.py <robot_ip> [token]")
        print("Example: python3 simple_tracker.py 192.168.1.120")
        sys.exit(1)
    
    robot_ip = sys.argv[1]
    token = sys.argv[2] if len(sys.argv) > 2 else ""
    
    tracker = SimpleTracker(robot_ip, token)
    tracker.run()