# Raspberry Pi Setup Guide

## 🚀 Quick Start on Raspberry Pi

### 1. Clone and Setup
```bash
git clone https://github.com/tfoldi/go2-webrtc
cd go2-webrtc
chmod +x start.sh
```

### 2. Install Dependencies
```bash
pip3 install -r python/requirements.txt
```

### 3. Start Server
```bash
./start.sh
```

The script will show you the local IP address to access from your phone/computer.

## 🔧 Manual Setup

### Install Python Dependencies
```bash
cd python
pip3 install -r requirements.txt
```

### Start Server
```bash
cd javascript  
python3 server.py
```

### Access Interface
Open browser and go to: `http://[PI_IP_ADDRESS]:8081`

## 📱 Usage

1. **Connect to Robot**:
   - Enter robot IP (e.g., `192.168.1.120`)
   - Optional: Enter security token
   - Click "Connect to Robot"

2. **Control Methods**:
   - **Touch**: Tap movement buttons and action commands
   - **Keyboard**: WASD for movement, QE for turning
   - **Mouse**: Wheel for forward/back, clicks for turning
   - **Xbox Controller**: Connect via USB/Bluetooth

3. **Custom Commands**:
   - Simple: Enter command ID (e.g., `1016` for hello)
   - Movement: `{"api_id": 1008, "data": {"x": 0.8, "y": 0, "z": 0}}`

## 🛠️ Troubleshooting

### Server Won't Start
```bash
# Check if port 8081 is in use
sudo netstat -tulpn | grep :8081

# Kill process if needed
sudo kill -9 $(sudo lsof -t -i:8081)
```

### Connection Issues
- Ensure Raspberry Pi and robot are on same network
- Check robot IP address is correct
- Try with and without security token
- Check browser console (F12) for errors

### Performance Issues
- Use Chromium browser on Pi for best performance
- Close other applications to free memory
- Consider using Pi 4 with 4GB+ RAM

## 🔒 Security Notes

- Server runs on HTTP (port 8081) for robot compatibility
- Only accessible on local network
- Use security token for multi-client access

## 📊 System Requirements

- **Raspberry Pi 3B+** or newer
- **Ubuntu 22.04** or Raspberry Pi OS
- **Python 3.8+**
- **2GB+ RAM** recommended
- **Network connection** to robot