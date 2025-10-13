# 🤖 GO2 WebRTC - Princess Peach AI Robot Controller

**Transform your Unitree GO2 into an intelligent AI companion with real-time WebRTC control, computer vision, and conversational AI.**

[![Version](https://img.shields.io/badge/version-1.9.0-blue.svg)](https://github.com/tfoldi/go2-webrtc)
[![License](https://img.shields.io/badge/license-BSD--2--Clause-green.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Raspberry%20Pi-red.svg)](SETUP.md)

## ✨ What Makes This Special

**Princess Peach** is not just a robot controller - it's a complete AI companion system that brings your Unitree GO2 to life with:

- 🎭 **AI Personality**: Chat with Princess Peach using natural language
- 👁️ **Computer Vision**: Real-time object detection and scene analysis  
- 🎤 **Voice Synthesis**: Natural female voice with royal personality
- 🎮 **Multi-Input Control**: Touch, keyboard, Xbox controller, and mouse
- 📱 **Mobile Optimized**: Works perfectly on phones and tablets
- 🔒 **Secure WebRTC**: Direct peer-to-peer connection with your robot

## 🚀 Quick Demo

```bash
# Clone and run in 3 commands
git clone https://github.com/tfoldi/go2-webrtc.git
cd go2-webrtc/javascript  
python3 server.py
# Open http://your-pi-ip:8000
```

## 🎯 Core Features

### 🎮 Advanced Control Systems
- **Touch Controls**: Mobile-optimized directional pad and action buttons
- **Keyboard**: WASD movement + QE rotation
- **Xbox Controller**: LB + analog sticks for precise control
- **Smart Mouse**: Wheel/click controls with safety zones
- **Emergency Stop**: Double-click anywhere for immediate halt

### 🤖 AI & Computer Vision
- **Object Detection**: Real-time recognition of 80+ object types
- **Text Recognition**: OCR for reading signs and text
- **Scene Analysis**: GPT-4 Vision for intelligent environment understanding
- **Princess Peach AI**: Conversational companion with royal personality
- **LIDAR Mapping**: Real-time 3D point cloud visualization

### 🎭 Interactive Companion
- **36 Robot Commands**: From basic moves to complex acrobatics
- **Natural Conversation**: Chat with Princess Peach via text
- **Voice Responses**: High-quality female voice synthesis
- **Trick Performance**: AI automatically performs requested actions
- **Personality**: Elegant, charming, and playful royal character

### 🛠️ Technical Excellence
- **WebRTC**: Low-latency real-time video and control
- **Responsive Design**: Works on any screen size
- **Smart UI**: Glassmorphism design with intuitive controls
- **Safety Features**: Multiple failsafes and emergency stops
- **Cross-Platform**: Runs on any modern browser

## 🎪 What Can Princess Peach Do?

### Basic Interactions
```
You: "Hello Princess Peach!"
Peach: "Oh my! Hello there, your majesty! How delightful to see you!"
*waves gracefully*

You: "Can you dance for me?"
Peach: "Of course! I shall perform my royal dance just for you!"
*performs elegant dance routine*
```

### Advanced AI Features
```
You: *clicks Vision button*
Peach: "I observe a lovely living room with a comfortable sofa, 
        a coffee table with books, and beautiful natural lighting 
        streaming through the windows. How delightful!"

You: "What do you see now?"
Peach: "I can see a person sitting at a desk with a computer. 
        There are also some plants nearby - how lovely!"
```

## 🚀 Quick Start

### 1. Hardware Setup
- **Unitree GO2** (Air, Pro, or Edu)
- **Raspberry Pi 4** (2GB+ RAM)
- **Same Network** (Pi and robot)

### 2. Software Installation
```bash
# On Raspberry Pi
git clone https://github.com/tfoldi/go2-webrtc.git
cd go2-webrtc
pip3 install -r python/requirements.txt
cd javascript
python3 server.py
```

### 3. Web Interface
```
# Open browser to:
http://your-raspberry-pi-ip:8000

# Configure in settings:
- Robot IP: 192.168.1.xxx
- OpenAI API Key: sk-... (optional)
```

### 4. Start Playing!
- **Connect**: Click "Connect to Robot"
- **Control**: Use touch, keyboard, or controller
- **Chat**: Type messages to Princess Peach
- **Vision**: Click 👁️ for AI scene analysis
- **LIDAR**: Click 🗺️ for 3D mapping visualization

## 📚 Documentation

- **[📖 Complete Setup Guide](SETUP.md)** - Detailed installation and configuration
- **[🎮 Features Guide](FEATURES.md)** - All capabilities and use cases  
- **[🔧 API Reference](python/README.md)** - Python backend documentation
- **[🚨 Troubleshooting](SETUP.md#troubleshooting)** - Common issues and solutions

## 🎯 Use Cases

### 🏠 Home Companion
- Interactive pet that responds to voice and gestures
- Security monitoring with AI scene analysis
- Entertainment with dances, tricks, and conversations
- Educational tool for learning robotics and AI

### 🔬 Development Platform
- WebRTC application development
- Computer vision experimentation
- AI integration testing
- Custom command development

### 🎓 Educational
- STEM learning with hands-on robotics
- AI and machine learning demonstrations
- Programming and software development
- Human-robot interaction research

## 🎮 Control Methods

| Method | Description | Best For |
|--------|-------------|----------|
| 📱 **Touch** | Mobile-optimized directional pad | Phones, tablets |
| ⌨️ **Keyboard** | WASD + QE controls | Desktop, laptop |
| 🎮 **Xbox Controller** | LB + analog sticks | Gaming, precision |
| 🖱️ **Mouse** | Wheel + click controls | Desktop (optional) |

## 🤖 AI Capabilities

| Feature | Technology | Description |
|---------|------------|-------------|
| 👁️ **Object Detection** | TensorFlow.js | Real-time recognition of 80+ objects |
| 📝 **Text Recognition** | Tesseract.js | OCR for reading signs and text |
| 🧠 **Scene Analysis** | GPT-4 Vision | Intelligent environment understanding |
| 💬 **Conversation** | GPT-4o | Natural language chat with Princess Peach |
| 🎤 **Voice Synthesis** | Web Speech API | High-quality female voice responses |

## 🎭 Princess Peach Commands

### Popular Commands
- **Stand** - Basic standing position
- **Sit** - Sitting position  
- **Hello** - Greeting wave
- **Bow** - Royal curtsy
- **Dance** - Elegant dance routine
- **Stretch** - Graceful stretching

### Advanced Tricks
- **Acrobatics**: Flips, jumps, somersaults
- **Social**: Handshakes, heart gestures
- **Playful**: Tail wagging, head movements
- **Custom**: 36 total commands available

*See [FEATURES.md](FEATURES.md) for complete command list*

## 🛠️ Technical Architecture

```
go2-webrtc/
├── javascript/           # Web interface (Princess Peach UI)
│   ├── index.html       # Main application
│   ├── index.js         # Core functionality
│   ├── go2webrtc.js     # WebRTC connection
│   ├── constants.js     # Robot commands
│   └── server.py        # WebRTC signaling server
├── python/              # Backend API
│   └── go2_webrtc/      # Python package
└── docs/                # Documentation
```

## 🤝 Contributing

We welcome contributions! Here's how you can help:

- 🐛 **Bug Reports**: Found an issue? Create a GitHub issue
- 💡 **Feature Requests**: Have an idea? Let us know!
- 🔧 **Code Contributions**: Submit pull requests
- 📚 **Documentation**: Help improve our guides
- 🎨 **UI/UX**: Design improvements welcome

### Development Setup
```bash
git clone https://github.com/your-username/go2-webrtc.git
cd go2-webrtc
# Make your changes
# Test thoroughly
# Submit pull request
```

## 🔗 Related Projects

- **[go2_webrtc_connect](https://github.com/legion1581/go2_webrtc_connect)** by @legion1581 - Alternative Python API with additional features
- **[Unitree SDK](https://github.com/unitreerobotics)** - Official Unitree development resources

## 🌟 Acknowledgments

- **Unitree Robotics** - For creating amazing robots
- **@legion1581** - For the original `go2_webrtc_connect` inspiration
- **OpenAI** - For GPT-4 Vision API
- **TensorFlow.js** - For browser-based AI
- **WebRTC Community** - For real-time communication standards

## 📄 License

This project is licensed under the BSD 2-Clause License - see the [LICENSE](LICENSE) file for details.

## 🚀 What's Next?

- 🎤 **Voice Commands**: Speech-to-text control
- 🗺️ **Autonomous Navigation**: AI-powered pathfinding  
- 🏠 **Home Integration**: IoT device control
- 📱 **Mobile App**: Native mobile application
- 🤖 **Multi-Robot**: Control multiple GO2 units

---

**Ready to meet Princess Peach? [Get Started Now!](SETUP.md)** 👑🤖✨