# GO2 WebRTC Features Guide

## 🎮 Control Methods

### Touch Controls (Mobile/Tablet)
- **Movement Grid**: 3x3 directional pad for precise movement
- **Action Buttons**: Quick access to popular commands
- **Settings Panel**: Full configuration access

### Keyboard Controls (Desktop)
- **WASD**: Movement (W=Forward, S=Backward, A=Left, D=Right)
- **QE**: Rotation (Q=Turn Left, E=Turn Right)
- **Works on any device with keyboard**

### Xbox Controller Support
- **LB + Left Stick**: Movement control
- **LB + Right Stick**: Rotation control
- **Auto-detection**: Plug and play support

### Mouse Controls (Optional)
- **Mouse Wheel**: Forward/Backward movement
- **Shift + Wheel**: Strafe left/right
- **Left Click Hold**: Turn left
- **Right Click Hold**: Turn right
- **Double Click**: Emergency stop
- **Smart Zones**: Only works on video area, not UI buttons

## 🤖 AI Features

### Object Detection (TensorFlow.js)
- **Real-time Detection**: 80+ object types (people, vehicles, animals, furniture)
- **Visual Overlay**: Orange bounding boxes with confidence scores
- **Performance**: Runs every 500ms for optimal balance
- **Browser-based**: No server processing required

### Text Recognition (OCR)
- **Tesseract.js**: Reads any text in camera view
- **Real-time Logging**: Shows detected text in console
- **Multiple Languages**: Supports various text formats

### LIDAR 3D Visualization
- **Real-time Mapping**: 3D point cloud from robot's LIDAR sensor
- **Voxel Rendering**: Colored 3D blocks representing environment
- **Interactive View**: Orbit, zoom, and pan controls
- **Height Mapping**: Color-coded elevation (blue=low, red=high)
- **Separate Interface**: Independent from main robot control

### OpenAI Vision Analysis
- **GPT-4o Integration**: Intelligent scene understanding
- **Natural Descriptions**: Detailed analysis of surroundings
- **Princess Personality**: Responses with royal charm
- **API Key Required**: Secure key storage in settings

## 👑 Princess Peach AI Companion

### Personality Features
- **Royal Character**: Elegant, charming, and playful responses
- **Female Voice**: Prioritizes natural voices (Aria, Jenny, Zira)
- **Contextual Responses**: Understands and reacts to environment
- **Trick Performance**: Automatically performs requested actions

### Voice System
- **Text-to-Speech**: High-quality female voice synthesis
- **Voice Selection**: Auto-detects best female voice available
- **Pitch Control**: Higher pitch for feminine sound (1.3)
- **Rate Control**: Slower speech for elegance (0.8)

### Chat System
- **Text Input**: Type messages to Princess Peach
- **Natural Language**: Conversational AI understanding
- **Command Recognition**: Automatically performs tricks from chat
- **Personality Responses**: Royal and charming replies

## 🎭 Robot Commands & Tricks

### Basic Commands
- **Stand (1004)**: Basic standing position
- **Sit (1009)**: Sitting position
- **Hello (1016)**: Greeting wave
- **Bow (1015)**: Royal curtsy/bow

### Entertainment Commands
- **Dance (1022)**: Primary dance routine
- **Dance 2 (1023)**: Alternative dance
- **Wag Tail (1018)**: Friendly tail wagging
- **Heart (1036)**: Love gesture
- **Stretch (1017)**: Stretching routine

### Acrobatic Commands
- **Back Flip (1013)**: Backward somersault
- **Front Flip (1014)**: Forward somersault
- **Jump (1031)**: Jumping motion
- **Rainbow (1030)**: Complex acrobatic move
- **Leg Lift (1027)**: Single leg raise

### Social Commands
- **Shake Hands (1028)**: Handshake gesture
- **Finger Heart (1029)**: Korean heart gesture
- **Chicken Head (1025)**: Playful head movement
- **Crab Steps (1026)**: Sideways walking

### Movement Commands
- **Run Forward (1005)**: Forward locomotion
- **Run Backward (1006)**: Reverse movement
- **Run Left (1007)**: Left strafe
- **Run Right (1008)**: Right strafe
- **Turn Around (1035)**: 180-degree turn

### Body Movement Commands
- **Trunk Wiggle (1019)**: Body wiggling
- **Butt Circle (1020)**: Hip rotation
- **Head Circle (1021)**: Head rotation
- **Scrape (1031)**: Ground scratching motion

### Control Commands
- **Damp (1001)**: Damping mode
- **Balance Stand (1002)**: Balanced standing
- **Stop Move (1003)**: Stop all movement
- **Rise Sit (1010)**: Transition from sit to stand
- **Switch Gait (1011)**: Change walking style
- **Trigger (1012)**: Special trigger command

## 🛠️ Technical Features

### WebRTC Connection
- **Real-time Video**: Live camera feed from robot
- **Low Latency**: Direct peer-to-peer connection
- **Secure**: Token-based authentication support
- **Cross-platform**: Works on any WebRTC-capable browser

### Smart UI Design
- **Responsive**: Adapts to any screen size
- **Touch-friendly**: Optimized for mobile interaction
- **Glassmorphism**: Modern translucent design
- **Categorized Commands**: Organized by function type

### Safety Features
- **Mouse Control Toggle**: Prevent accidental commands
- **Smart Zones**: Mouse control only affects video area
- **Emergency Stop**: Double-click for immediate stop
- **Connection Status**: Real-time connection monitoring

### Data Persistence
- **Local Storage**: Saves IP, token, and API keys
- **Auto-reconnect**: Remembers connection settings
- **Settings Sync**: Maintains configuration across sessions

## 🎯 Use Cases

### Home Companion
- **Pet Interaction**: Play and interact like a real pet
- **Entertainment**: Dances, tricks, and performances
- **Conversation**: Chat with AI personality
- **Monitoring**: Security and home surveillance

### Educational
- **STEM Learning**: Robotics and AI demonstration
- **Programming**: Custom command development
- **Computer Vision**: Object and text recognition
- **Voice Technology**: Speech synthesis and recognition

### Development Platform
- **API Integration**: OpenAI and other services
- **Custom Commands**: Extend functionality
- **WebRTC Applications**: Real-time communication
- **AI Experimentation**: Vision and language models

### Accessibility
- **Multiple Input Methods**: Touch, keyboard, controller, mouse
- **Voice Feedback**: Audio responses and descriptions
- **Visual Indicators**: Clear status and feedback
- **Simple Interface**: Easy-to-use controls

## 🔧 Custom Commands

### Direct Command Execution
```javascript
// Execute any command by ID
quickCommand(1022); // Dance command
```

### Custom Movement
```javascript
// Custom movement with velocity control
globalThis.rtc.publishApi("rt/api/sport/request", 1008, JSON.stringify({
  x: 0.5,  // Forward/backward (-1 to 1)
  y: 0.3,  // Left/right (-1 to 1)  
  z: 1.0   // Rotation (-3 to 3)
}));
```

### API Integration
```javascript
// Add custom AI responses
async function customAIResponse(prompt) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }]
    })
  });
  return response.json();
}
```

## 📱 Platform Compatibility

### Supported Browsers
- **Chrome/Chromium**: Full feature support
- **Firefox**: WebRTC and AI features
- **Safari**: Limited WebRTC support
- **Edge**: Full compatibility

### Operating Systems
- **Windows**: Complete feature set
- **macOS**: Full support with system voices
- **Linux**: WebRTC and basic features
- **Android**: Mobile-optimized interface
- **iOS**: Limited due to WebRTC restrictions

### Hardware Requirements
- **Raspberry Pi 4**: Recommended for server
- **2GB+ RAM**: For AI processing
- **Network**: Same subnet as robot
- **Camera**: Robot's built-in camera system

## 🚀 Getting Started

1. **Setup Server**: Run `python server.py` on Raspberry Pi
2. **Connect Network**: Ensure Pi and robot on same network
3. **Open Browser**: Navigate to `http://pi-ip:8000`
4. **Configure Settings**: Enter robot IP and optional API key
5. **Connect**: Click "Connect to Robot"
6. **Start Playing**: Use any control method to interact
7. **LIDAR Mapping**: Click "🗺️ LIDAR Visualization" for 3D mapping

## 🔮 Future Possibilities

### Planned Features
- **Voice Commands**: Speech-to-text control
- **Autonomous Navigation**: AI-powered movement
- **Multi-robot Support**: Control multiple units
- **Cloud Integration**: Remote access capabilities
- **Mobile App**: Native mobile application

### Extension Ideas
- **Home Automation**: IoT device control
- **Security System**: Automated patrol routes
- **Educational Content**: Interactive learning modules
- **Gaming Integration**: Robot as game controller
- **Social Features**: Multi-user interaction