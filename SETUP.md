# GO2 WebRTC Setup Guide

## 🎯 Quick Start

### Prerequisites
- **Unitree GO2 Robot** (Air, Pro, or Edu)
- **Raspberry Pi 4** (2GB+ RAM recommended)
- **MicroSD Card** (32GB+ Class 10)
- **Network Access** (Same subnet as robot)

### 1. Raspberry Pi Setup

#### Install Ubuntu 22.04
```bash
# Flash Ubuntu 22.04 Server to SD card
# Enable SSH and configure WiFi during setup
```

#### Install Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python and pip
sudo apt install python3 python3-pip git -y

# Install required Python packages
pip3 install asyncio websockets
```

#### Clone Repository
```bash
# Clone the project
git clone https://github.com/tfoldi/go2-webrtc.git
cd go2-webrtc

# Install Python requirements
pip3 install -r python/requirements.txt
```

### 2. Network Configuration

#### Find Robot IP
```bash
# Scan network for robot
nmap -sn 192.168.1.0/24

# Robot typically uses:
# 192.168.1.xxx (home network)
# 192.168.12.1 (direct connection)
```

#### Test Connection
```bash
# Ping robot to verify connectivity
ping 192.168.1.xxx

# Should respond with low latency
```

### 3. Start the Server

#### Run WebRTC Server
```bash
cd go2-webrtc/javascript
python3 server.py
```

#### Access Web Interface
```
# Open browser and navigate to:
http://raspberry-pi-ip:8000

# Example:
http://192.168.1.100:8000
```

## 🔧 Configuration

### Robot Connection Settings

#### Required Settings
- **Robot IP**: Your GO2's IP address
- **Port**: Default 8000 (usually auto-configured)

#### Optional Settings
- **Security Token**: For multi-client access
- **OpenAI API Key**: For AI features

### Security Token (Optional)

#### Method 1: Network Sniffing
```bash
# Install tinyproxy
sudo apt install tinyproxy

# Configure phone to use Pi as proxy
# Monitor traffic on port 8081
ngrep port 8081

# Look for token in JSON payload
```

#### Method 2: API Login
```bash
# Get token via email login
curl -X POST https://global-robot-api.unitree.com/login/email \
  -d "email=YOUR_EMAIL&password=MD5_HASH_OF_PASSWORD"
```

### OpenAI API Setup

#### Get API Key
1. Visit [OpenAI Platform](https://platform.openai.com)
2. Create account and add billing
3. Generate API key (starts with `sk-`)
4. Enter in settings panel

#### Test API Access
- Use "Test API Key" button in settings
- Verify GPT-4o access for vision features
- Check billing and usage limits

## 🖥️ Browser Compatibility

### Recommended Browsers
- **Chrome/Chromium**: Best performance
- **Firefox**: Good WebRTC support
- **Edge**: Full compatibility

### Mobile Browsers
- **Android Chrome**: Excellent support
- **iOS Safari**: Limited WebRTC (HTTP only)

### Feature Support Matrix
| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| WebRTC | ✅ | ✅ | ⚠️ | ✅ |
| AI Detection | ✅ | ✅ | ✅ | ✅ |
| Voice Synthesis | ✅ | ✅ | ✅ | ✅ |
| OpenAI API | ✅ | ✅ | ❌* | ✅ |

*Requires HTTPS for API calls

## 🔊 Voice Setup

### Windows Voices
```bash
# Install additional voices via Settings
Settings > Time & Language > Speech > Manage voices

# Recommended female voices:
# - Microsoft Aria (Neural)
# - Microsoft Jenny (Neural)  
# - Microsoft Zira (Standard)
```

### macOS Voices
```bash
# Install via System Preferences
System Preferences > Accessibility > Speech > System Voice

# Available female voices:
# - Samantha, Victoria, Allison, Susan, etc.
```

### Linux Voices
```bash
# Install espeak or festival
sudo apt install espeak espeak-data

# Limited voice options available
```

## 🚨 Troubleshooting

### Connection Issues

#### Robot Not Found
```bash
# Check network connectivity
ping robot-ip

# Verify robot is powered on
# Ensure same network subnet
# Check firewall settings
```

#### WebRTC Failed
```bash
# Check browser console for errors
# Verify WebRTC support: webrtc.org/testing
# Try different browser
# Check HTTPS requirements
```

### Performance Issues

#### Slow AI Detection
```bash
# Reduce detection frequency in code
# Use smaller video resolution
# Close other browser tabs
# Check CPU usage on Pi
```

#### Audio Lag
```bash
# Check system audio settings
# Reduce speech rate in code
# Verify voice synthesis support
# Test with different voices
```

### API Issues

#### OpenAI 401 Error
```bash
# Verify API key format (sk-...)
# Check billing and credits
# Confirm GPT-4o access
# Test with simple API call
```

#### CORS Errors
```bash
# Use HTTPS server for API calls
# Set up proxy server on Pi
# Check browser security settings
```

## 🔒 Security Considerations

### Network Security
- **Local Network Only**: Keep on private network
- **Firewall Rules**: Restrict external access
- **VPN Access**: Use VPN for remote control

### API Security
- **Secure Storage**: API keys in localStorage only
- **Rate Limiting**: Monitor API usage
- **Key Rotation**: Regularly update API keys

### Robot Security
- **Token Authentication**: Use security tokens
- **Access Control**: Limit concurrent connections
- **Monitoring**: Log all robot commands

## 📊 Performance Optimization

### Raspberry Pi Optimization
```bash
# Increase GPU memory split
sudo raspi-config
# Advanced Options > Memory Split > 128

# Optimize Python performance
export PYTHONOPTIMIZE=1

# Use faster SD card (Class 10 U3)
```

### Browser Optimization
```javascript
// Reduce AI detection frequency
setInterval(detectObjects, 1000); // Instead of 500ms

// Lower video quality for better performance
video.width = 640;
video.height = 480;
```

### Network Optimization
```bash
# Use 5GHz WiFi when possible
# Minimize network hops
# Check bandwidth usage
# Optimize video compression
```

## 🔄 Auto-Start Setup

### Systemd Service
```bash
# Create service file
sudo nano /etc/systemd/system/go2-webrtc.service

[Unit]
Description=GO2 WebRTC Server
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/go2-webrtc/javascript
ExecStart=/usr/bin/python3 server.py
Restart=always

[Install]
WantedBy=multi-user.target

# Enable service
sudo systemctl enable go2-webrtc
sudo systemctl start go2-webrtc
```

### Boot Script
```bash
# Add to ~/.bashrc for auto-start
echo 'cd ~/go2-webrtc/javascript && python3 server.py &' >> ~/.bashrc
```

## 📱 Mobile Setup

### Android Optimization
- **Chrome Browser**: Best performance
- **Full Screen**: Hide browser UI
- **Keep Screen On**: Prevent sleep
- **Hardware Acceleration**: Enable in Chrome flags

### iOS Limitations
- **HTTP Only**: HTTPS causes WebRTC issues
- **Safari Required**: Chrome uses Safari engine
- **Limited Features**: Some APIs restricted

## 🔧 Development Setup

### Local Development
```bash
# Clone repository
git clone https://github.com/your-username/go2-webrtc.git

# Install development dependencies
npm install -g live-server

# Start development server
live-server javascript/
```

### Code Structure
```
javascript/
├── index.html          # Main interface
├── index.js           # Core functionality  
├── go2webrtc.js       # WebRTC connection
├── constants.js       # Robot commands
├── server.py          # WebRTC signaling server
├── md5.js            # Encryption utilities
└── joy.min.js        # Joystick library (unused)
```

### Custom Modifications
```javascript
// Add custom commands to constants.js
export const CUSTOM_COMMANDS = {
  2001: 'Custom Dance',
  2002: 'Custom Trick'
};

// Extend functionality in index.js
function customCommand(id) {
  globalThis.rtc.publishApi("rt/api/sport/request", id, JSON.stringify(id));
}
```

## 📚 Additional Resources

### Documentation
- [Unitree GO2 Manual](https://www.unitree.com/go2/)
- [WebRTC Documentation](https://webrtc.org/)
- [OpenAI API Docs](https://platform.openai.com/docs)

### Community
- [GitHub Issues](https://github.com/tfoldi/go2-webrtc/issues)
- [Unitree Community](https://www.unitree.com/community/)
- [WebRTC Community](https://webrtc.org/community/)

### Support
- Check existing GitHub issues
- Create detailed bug reports
- Include browser console logs
- Provide system specifications