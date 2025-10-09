# GO2 Color Tracker Setup

## 🎯 Simple Red Object Tracking

The robot will automatically follow any **RED object** you hold up!

## 📦 Installation on Raspberry Pi

```bash
# Install OpenCV and dependencies
pip3 install -r python/requirements_tracker.txt

# Or install manually
pip3 install opencv-python numpy
```

## 🚀 Usage

```bash
# Basic usage (no token)
python3 python/color_tracker.py 192.168.1.120

# With security token
python3 python/color_tracker.py 192.168.1.120 your_token_here
```

## 🎮 How It Works

1. **Hold up a RED object** (red ball, red shirt, red book)
2. **Robot turns** to center the object in camera view
3. **Robot moves forward/backward** to maintain good distance
4. **Press 'q'** to quit tracking

## 🔧 Tracking Behavior

- **Object left of center** → Robot turns left
- **Object right of center** → Robot turns right  
- **Object too small/far** → Robot moves forward
- **Object too large/close** → Robot moves backward
- **No red object** → Robot stops

## ⚙️ Customization

Edit `color_tracker.py` to change:

```python
# Track different colors (change HSV ranges)
self.lower_red1 = np.array([0, 120, 70])    # Red range 1
self.upper_red1 = np.array([10, 255, 255])

# Adjust sensitivity
self.center_threshold = 50  # How close to center before stopping turn
self.min_area = 500        # Minimum object size to track
self.turn_speed = 1.0      # How fast to turn
self.move_speed = 0.4      # How fast to move forward/back
```

## 🎨 Other Colors

**Blue objects:**
```python
lower_blue = np.array([100, 150, 50])
upper_blue = np.array([130, 255, 255])
```

**Green objects:**
```python
lower_green = np.array([40, 50, 50])
upper_green = np.array([80, 255, 255])
```

## 🛠️ Troubleshooting

**Camera not found:**
```bash
# Check camera
ls /dev/video*

# Test camera
python3 -c "import cv2; print(cv2.VideoCapture(0).isOpened())"
```

**Robot not responding:**
- Check robot IP address
- Ensure robot and Pi on same network
- Try with/without security token

**Poor tracking:**
- Use bright, solid red object
- Ensure good lighting
- Avoid red backgrounds

## 🔴 Best Red Objects to Use

- **Red ball** - Perfect shape and color
- **Red book/folder** - Large, easy to track
- **Red clothing** - Works well
- **Red toy** - Good for testing
- **Red marker/pen** - Small but trackable

The robot will follow you around as long as you hold the red object! 🤖🔴