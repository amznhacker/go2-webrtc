#!/bin/bash

# GO2 WebRTC Startup Script for Raspberry Pi
echo "🤖 Starting GO2 WebRTC Server..."

# Check if we're in the right directory
if [ ! -f "javascript/server.py" ]; then
    echo "❌ Please run this script from the go2-webrtc root directory"
    exit 1
fi

# Check if Python requirements are installed
if ! python3 -c "import go2_webrtc" 2>/dev/null; then
    echo "📦 Installing Python requirements..."
    pip3 install -r python/requirements.txt
fi

# Get local IP address
LOCAL_IP=$(hostname -I | awk '{print $1}')
echo "🌐 Server will be available at: http://$LOCAL_IP:8081"
echo "📱 Open this URL on your phone/computer to control the robot"
echo ""
echo "🚀 Starting server on port 8081..."
echo "   Press Ctrl+C to stop"
echo ""

# Start the server
cd javascript
python3 server.py