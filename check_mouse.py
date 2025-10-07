#!/usr/bin/env python3
"""
Check what input devices are available on the Pi
"""

import subprocess
import sys

def check_usb_devices():
    """Check USB devices"""
    print("🔍 USB Devices:")
    try:
        result = subprocess.run(['lsusb'], capture_output=True, text=True)
        for line in result.stdout.split('\n'):
            if 'logitech' in line.lower() or 'mouse' in line.lower():
                print(f"  ✅ {line}")
    except:
        print("  ❌ lsusb not available")

def check_input_devices():
    """Check /dev/input devices"""
    print("\n🔍 Input Devices:")
    try:
        result = subprocess.run(['ls', '/dev/input/'], capture_output=True, text=True)
        devices = result.stdout.strip().split('\n')
        for device in devices:
            if device.startswith('event') or device.startswith('mouse'):
                print(f"  📱 /dev/input/{device}")
    except:
        print("  ❌ Cannot access /dev/input/")

def check_pygame_joysticks():
    """Check if pygame can see any joysticks"""
    print("\n🔍 Pygame Joysticks:")
    try:
        import pygame
        pygame.init()
        pygame.joystick.init()
        
        count = pygame.joystick.get_count()
        print(f"  Found {count} joystick(s)")
        
        for i in range(count):
            joy = pygame.joystick.Joystick(i)
            print(f"  🎮 {i}: {joy.get_name()}")
            
    except ImportError:
        print("  ❌ pygame not installed - run: pip3 install pygame")
    except Exception as e:
        print(f"  ❌ pygame error: {e}")

def check_evdev_devices():
    """Check evdev input devices"""
    print("\n🔍 Evdev Devices:")
    try:
        import evdev
        devices = [evdev.InputDevice(path) for path in evdev.list_devices()]
        
        for i, device in enumerate(devices):
            caps = device.capabilities()
            has_buttons = evdev.ecodes.EV_KEY in caps
            has_movement = evdev.ecodes.EV_REL in caps
            
            if 'logitech' in device.name.lower() or 'mouse' in device.name.lower():
                print(f"  ✅ {i}: {device.name} (buttons: {has_buttons}, movement: {has_movement})")
            else:
                print(f"  📱 {i}: {device.name}")
                
    except ImportError:
        print("  ❌ evdev not installed - run: pip3 install evdev")
    except Exception as e:
        print(f"  ❌ evdev error: {e}")

if __name__ == "__main__":
    print("🖱️ Logitech Mouse Detection")
    print("=" * 40)
    
    check_usb_devices()
    check_input_devices()
    check_pygame_joysticks()
    check_evdev_devices()
    
    print("\n💡 Next steps:")
    print("  1. If USB shows Logitech device: ✅ Hardware detected")
    print("  2. If pygame shows joystick: Use joystick method")
    print("  3. If evdev shows mouse: Use evdev method")
    print("  4. If nothing: Check USB connection")