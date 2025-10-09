#!/usr/bin/env python3
"""
Simple color blob tracker for GO2 robot
Tracks red objects and sends movement commands to follow them
"""

import cv2
import numpy as np
import time
import sys
import os

# Add the go2_webrtc module to path
sys.path.append(os.path.dirname(__file__))
import go2_webrtc

class ColorTracker:
    def __init__(self, robot_ip, token=""):
        self.robot_ip = robot_ip
        self.token = token
        self.connection = None
        
        # Red color range in HSV
        self.lower_red1 = np.array([0, 120, 70])
        self.upper_red1 = np.array([10, 255, 255])
        self.lower_red2 = np.array([170, 120, 70])
        self.upper_red2 = np.array([180, 255, 255])
        
        # Control parameters
        self.center_threshold = 50  # pixels from center to ignore
        self.min_area = 500  # minimum blob area
        self.max_area = 50000  # maximum blob area
        
        # Movement speeds
        self.turn_speed = 1.0
        self.move_speed = 0.4
        
        print("🔴 Color Tracker initialized - Looking for RED objects")
        print(f"📡 Robot IP: {robot_ip}")
    
    def connect_robot(self):
        """Connect to GO2 robot"""
        try:
            self.connection = go2_webrtc.Go2Connection(self.robot_ip, self.token)
            print("✅ Connected to GO2 robot")
            return True
        except Exception as e:
            print(f"❌ Failed to connect to robot: {e}")
            return False
    
    def send_movement(self, x=0, y=0, z=0):
        """Send movement command to robot"""
        if not self.connection:
            return
        
        try:
            self.connection.move(x, y, z)
        except Exception as e:
            print(f"❌ Movement command failed: {e}")
    
    def find_red_blob(self, frame):
        """Find the largest red blob in frame"""
        hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
        
        # Create mask for red color (two ranges for red hue wrap-around)
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
        
        # Get bounding box
        x, y, w, h = cv2.boundingRect(largest_contour)
        center_x = x + w // 2
        center_y = y + h // 2
        
        return {
            'center': (center_x, center_y),
            'area': area,
            'bbox': (x, y, w, h)
        }, mask
    
    def track_object(self, blob_info, frame_width, frame_height):
        """Calculate and send movement commands based on blob position"""
        if not blob_info:
            # No target found - stop moving
            self.send_movement(0, 0, 0)
            return "🔍 Searching..."
        
        center_x, center_y = blob_info['center']
        area = blob_info['area']
        
        frame_center_x = frame_width // 2
        frame_center_y = frame_height // 2
        
        # Calculate offsets from center
        offset_x = center_x - frame_center_x
        offset_y = center_y - frame_center_y
        
        # Movement logic
        x, y, z = 0, 0, 0
        status = "🎯 Tracking"
        
        # Horizontal tracking (turning)
        if abs(offset_x) > self.center_threshold:
            if offset_x > 0:
                z = -self.turn_speed  # Turn right
                status += " → Turn Right"
            else:
                z = self.turn_speed   # Turn left
                status += " ← Turn Left"
        
        # Distance tracking (forward/backward based on blob size)
        if area < 2000:  # Too far
            x = self.move_speed
            status += " ↑ Move Forward"
        elif area > 15000:  # Too close
            x = -self.move_speed
            status += " ↓ Move Backward"
        else:
            status += " ✓ Good Distance"
        
        # Send movement command
        self.send_movement(x, y, z)
        return status
    
    def run(self):
        """Main tracking loop"""
        if not self.connect_robot():
            return
        
        # Initialize camera
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            print("❌ Cannot open camera")
            return
        
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        cap.set(cv2.CAP_PROP_FPS, 15)  # Lower FPS for Pi
        
        print("🎥 Camera initialized")
        print("🔴 Hold up a RED object to track!")
        print("Press 'q' to quit")
        
        try:
            while True:
                ret, frame = cap.read()
                if not ret:
                    break
                
                # Find red blob
                blob_info, mask = self.find_red_blob(frame)
                
                # Track object and get status
                status = self.track_object(blob_info, frame.shape[1], frame.shape[0])
                
                # Draw tracking info on frame
                if blob_info:
                    x, y, w, h = blob_info['bbox']
                    cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
                    cv2.circle(frame, blob_info['center'], 5, (0, 255, 0), -1)
                    
                    # Show area
                    cv2.putText(frame, f"Area: {int(blob_info['area'])}", 
                              (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)
                
                # Show center crosshair
                h, w = frame.shape[:2]
                cv2.line(frame, (w//2 - 20, h//2), (w//2 + 20, h//2), (255, 255, 255), 1)
                cv2.line(frame, (w//2, h//2 - 20), (w//2, h//2 + 20), (255, 255, 255), 1)
                
                # Show status
                cv2.putText(frame, status, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
                
                # Display frame
                cv2.imshow('GO2 Color Tracker', frame)
                cv2.imshow('Red Mask', mask)
                
                # Check for quit
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    break
                
                time.sleep(0.1)  # Limit processing rate
        
        except KeyboardInterrupt:
            print("\n🛑 Stopping tracker...")
        
        finally:
            # Stop robot
            self.send_movement(0, 0, 0)
            cap.release()
            cv2.destroyAllWindows()
            print("✅ Tracker stopped")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 color_tracker.py <robot_ip> [token]")
        print("Example: python3 color_tracker.py 192.168.1.120")
        sys.exit(1)
    
    robot_ip = sys.argv[1]
    token = sys.argv[2] if len(sys.argv) > 2 else ""
    
    tracker = ColorTracker(robot_ip, token)
    tracker.run()