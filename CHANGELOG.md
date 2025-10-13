# Changelog

All notable changes to the GO2 WebRTC Princess Peach project will be documented in this file.

## [2.0.1] - 2024-12-19

### 🗺️ LIDAR 3D Visualization Added

#### Added
- **LIDAR Visualization Interface** (`lidar.html`)
  - Real-time 3D point cloud mapping
  - Voxel-based rendering with height-coded colors
  - Interactive 3D controls (orbit, zoom, pan)
  - Separate interface from main robot control
  - WebRTC integration for LIDAR data streaming
- **Documentation Updates**
  - Added LIDAR features to all documentation
  - Updated setup instructions for dual interfaces
  - Enhanced feature descriptions

#### Features
- **Real-time Mapping**: Live 3D environment visualization
- **Height Mapping**: Color-coded elevation (blue=low, red=high)
- **Interactive View**: Mouse controls for 3D navigation
- **Performance Stats**: FPS and rendering information
- **Dual Interface**: Works alongside Princess Peach control

## [2.0.0] - 2024-12-19

### 🎉 Major Release - Complete AI Companion System

#### Added
- **Complete Documentation Overhaul**
  - Comprehensive [FEATURES.md](FEATURES.md) guide
  - Detailed [SETUP.md](SETUP.md) installation guide
  - Updated README with full project overview
  - Added CHANGELOG for version tracking

#### Cleaned Up
- **Removed Unused Files**
  - Deleted ThreeJS visualization files (threejs.html, threejs.js, threejs.init.js)
  - Removed unused utilities (utils.js)
  - Cleaned up models directory
  - Streamlined codebase for better maintainability

#### Improved
- **Project Structure**: Clear organization and documentation
- **Version Tracking**: Proper semantic versioning
- **User Experience**: Better onboarding and setup process

## [1.9.0] - 2024-12-19

### 🎤 Voice Conversation AI

#### Added
- **Text Chat System**: Type messages to Princess Peach
- **Natural Language Processing**: GPT-4o powered conversations
- **Automatic Trick Performance**: AI executes requested commands
- **Princess Personality**: Royal, elegant, and charming responses

#### Fixed
- **Voice Recognition Issues**: Replaced with reliable text input
- **Female Voice Selection**: Consistent voice across all features

## [1.8.0] - 2024-12-19

### 👑 Princess Peach Personality

#### Added
- **Female Voice System**: Automatic female voice selection
- **Royal Personality**: Elegant and charming character
- **Princess Responses**: "Oh my!" and "How delightful!" expressions
- **Voice Characteristics**: Higher pitch (1.2) and slower rate (0.8)

#### Improved
- **Connection Messages**: "Princess Peach is online! Ready to serve, your majesty!"
- **Speech Synthesis**: Better voice selection algorithm

## [1.7.0] - 2024-12-19

### 🧠 OpenAI Vision Analysis

#### Added
- **GPT-4 Vision Integration**: Intelligent scene analysis
- **API Key Management**: Secure storage in settings
- **Vision Button**: 👁️ button for scene analysis
- **Audio Feedback**: Speaks analysis results
- **API Testing**: Debug functionality for troubleshooting

#### Features
- **Scene Understanding**: Detailed environment descriptions
- **Object Recognition**: Advanced AI-powered detection
- **Natural Language**: Human-like scene descriptions

## [1.6.0] - 2024-12-19

### 📝 OCR Text Detection

#### Added
- **Tesseract.js Integration**: Browser-based OCR
- **Real-time Text Recognition**: Detects any readable text
- **Text Logging**: Shows detected text in console
- **Multi-language Support**: Various text formats

#### Removed
- **ICE-specific Detection**: Changed to general text recognition
- **Alert System**: Simplified to text logging only

## [1.5.0] - 2024-12-19

### 👁️ Object Detection AI

#### Added
- **TensorFlow.js Integration**: Browser-based AI detection
- **COCO-SSD Model**: 80+ object types recognition
- **Visual Overlay**: Orange bounding boxes with labels
- **Real-time Processing**: 500ms detection intervals
- **AI Toggle Button**: Enable/disable detection

#### Features
- **People Detection**: Person recognition and tracking
- **Vehicle Detection**: Cars, trucks, motorcycles, bicycles
- **Object Recognition**: Furniture, electronics, animals
- **Performance Optimized**: Balanced accuracy and speed

## [1.4.0] - 2024-12-19

### 🎯 Smart UI Zones

#### Added
- **Mouse Control Zones**: Restricted to video area only
- **Smart Interaction**: UI buttons always functional
- **Visual Indicators**: Green border when mouse control active
- **Safety Features**: Prevents accidental command execution

#### Improved
- **User Experience**: Clear separation of control zones
- **Mobile Compatibility**: Better touch interaction
- **Desktop Usage**: Precise mouse control areas

## [1.3.0] - 2024-12-19

### 📱 Categorized Commands

#### Added
- **Command Categories**: Organized by function type
  - Popular (expanded by default)
  - Dances & Fun
  - Acrobatics
  - Movement
  - Body Moves
  - Control
- **Expandable Sections**: Tap headers to expand/collapse
- **Visual Indicators**: Arrows show expand/collapse state
- **Auto-close**: Panel closes after command selection

#### Improved
- **Command Discovery**: Easier to find specific commands
- **User Interface**: Better organization and navigation
- **Mobile Experience**: Touch-friendly expandable sections

## [1.2.0] - 2024-12-19

### 🖱️ Mouse Control Toggle

#### Added
- **Mouse Control System**: Wheel and click controls
  - Mouse wheel: Forward/backward movement
  - Shift + wheel: Strafe left/right
  - Left/right click hold: Turn left/right
  - Double-click: Emergency stop
- **Safety Toggle**: Enable/disable mouse control
- **Visual Feedback**: Button changes color when active
- **Auto-stop**: Movement timeout after 2 seconds

#### Features
- **Smart Controls**: Only works when enabled
- **Emergency Features**: Double-click stop functionality
- **User Safety**: Toggle prevents accidental activation

## [1.1.0] - 2024-12-19

### 📱 Mobile UI Improvements

#### Added
- **Enhanced Responsive Design**: Better mobile layouts
- **Touch-friendly Controls**: Optimized button sizes
- **Adaptive Grids**: Column count changes with screen size
- **All Commands Access**: 36 robot commands available
- **Comprehensive Command Panel**: Scrollable grid interface

#### Improved
- **Mobile Experience**: Touch-optimized interface
- **Screen Adaptation**: Works on any screen size
- **Command Accessibility**: Easy access to all robot functions

## [1.0.0] - 2024-12-19

### 🎮 Initial Release - Basic WebRTC Interface

#### Added
- **WebRTC Connection**: Real-time video and control
- **Basic Controls**: Touch movement grid
- **Robot Commands**: Essential command set
- **Settings Panel**: IP and token configuration
- **Multiple Input Methods**: Touch, keyboard, Xbox controller

#### Features
- **Real-time Video**: Live camera feed from robot
- **Movement Controls**: 3x3 directional pad
- **Action Commands**: Basic robot tricks
- **Cross-platform**: Works on any WebRTC-capable browser
- **Secure Connection**: Token-based authentication support

---

## Version History Summary

- **v2.0.0**: Complete AI companion with full documentation
- **v1.9.0**: Voice conversation AI system
- **v1.8.0**: Princess Peach personality
- **v1.7.0**: OpenAI Vision integration
- **v1.6.0**: OCR text detection
- **v1.5.0**: Object detection AI
- **v1.4.0**: Smart UI zones
- **v1.3.0**: Categorized commands
- **v1.2.0**: Mouse control system
- **v1.1.0**: Mobile UI improvements
- **v1.0.0**: Initial WebRTC interface

## Contributing

See our [Contributing Guidelines](README.md#contributing) for information on how to contribute to this project.

## License

This project is licensed under the BSD 2-Clause License - see the [LICENSE](LICENSE) file for details.