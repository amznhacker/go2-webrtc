// Hand gesture control for GO2 robot
// Detects simple hand gestures and converts them to robot commands

class GestureControl {
    constructor() {
        this.active = false;
        this.canvas = null;
        this.ctx = null;
        this.videoElement = null;
        this.lastCommand = Date.now();
        this.lastGesture = '';
        this.gestureConfidence = 0;
        
        console.log('✋ Gesture Control initialized');
    }
    
    init() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.videoElement = document.getElementById('video-frame');
        
        if (!this.videoElement) {
            console.error('❌ Video element not found');
            return false;
        }
        
        this.canvas.width = 320;
        this.canvas.height = 240;
        
        console.log('✅ Gesture Control ready');
        return true;
    }
    
    startGestureControl() {
        if (!this.init()) return;
        
        this.active = true;
        console.log('✋ Starting gesture control');
        this.gestureLoop();
    }
    
    stopGestureControl() {
        this.active = false;
        console.log('⏹️ Stopping gesture control');
        
        // Stop robot
        if (globalThis.rtc && globalThis.rtc.publishApi) {
            globalThis.rtc.publishApi("rt/api/sport/request", 1008, JSON.stringify({x: 0, y: 0, z: 0}));
        }
    }
    
    detectHandGesture(imageData) {
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        
        // Find skin-colored regions (hands/arms)
        let skinPixels = [];
        
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // Skin detection
            if (r > 100 && g > 50 && b > 30 && 
                r > g && r > b && 
                Math.abs(r - g) > 15) {
                
                const pixelIndex = i / 4;
                const x = pixelIndex % width;
                const y = Math.floor(pixelIndex / width);
                
                skinPixels.push({x, y});
            }
        }
        
        if (skinPixels.length < 300) return null;
        
        // Analyze hand position and shape
        return this.analyzeGesture(skinPixels, width, height);
    }
    
    analyzeGesture(skinPixels, width, height) {
        // Calculate center and bounds of hand
        let minX = width, maxX = 0, minY = height, maxY = 0;
        let centerX = 0, centerY = 0;
        
        skinPixels.forEach(pixel => {
            centerX += pixel.x;
            centerY += pixel.y;
            minX = Math.min(minX, pixel.x);
            maxX = Math.max(maxX, pixel.x);
            minY = Math.min(minY, pixel.y);
            maxY = Math.max(maxY, pixel.y);
        });
        
        centerX = Math.floor(centerX / skinPixels.length);
        centerY = Math.floor(centerY / skinPixels.length);
        
        const handWidth = maxX - minX;
        const handHeight = maxY - minY;
        const area = skinPixels.length;
        
        // Simple gesture recognition based on hand characteristics
        let gesture = 'unknown';
        let confidence = 0;
        
        // Open palm (wide and tall)
        if (handWidth > 40 && handHeight > 50 && area > 800) {
            gesture = 'open_palm';
            confidence = 0.8;
        }
        // Closed fist (compact)
        else if (handWidth < 35 && handHeight < 40 && area > 400 && area < 800) {
            gesture = 'fist';
            confidence = 0.7;
        }
        // Point gesture (tall and narrow)
        else if (handHeight > handWidth * 1.5 && area > 300 && area < 600) {
            gesture = 'point';
            confidence = 0.6;
        }
        
        return {
            gesture,
            confidence,
            center: {x: centerX, y: centerY},
            area,
            position: this.getHandPosition(centerX, centerY, width, height)
        };
    }
    
    getHandPosition(x, y, width, height) {
        const centerX = width / 2;
        const centerY = height / 2;
        
        if (x < centerX - 50) return 'left';
        if (x > centerX + 50) return 'right';
        if (y < centerY - 30) return 'up';
        if (y > centerY + 30) return 'down';
        return 'center';
    }
    
    executeGestureCommand(gestureData) {
        const now = Date.now();
        if (now - this.lastCommand < 500) return; // Limit command frequency
        
        const { gesture, position, confidence } = gestureData;
        
        if (confidence < 0.5) return; // Not confident enough
        
        let x = 0, y = 0, z = 0;
        let command = null;
        let message = '';
        
        switch (gesture) {
            case 'open_palm':
                // Open palm = Hello wave
                command = 1016;
                message = '👋 Hello gesture detected - Waving!';
                break;
                
            case 'fist':
                // Closed fist = Sit
                command = 1009;
                message = '✊ Fist detected - Sitting down!';
                break;
                
            case 'point':
                // Point gesture = Movement based on direction
                switch (position) {
                    case 'left':
                        z = 1.0; // Turn left
                        message = '👈 Point left - Turning left!';
                        break;
                    case 'right':
                        z = -1.0; // Turn right
                        message = '👉 Point right - Turning right!';
                        break;
                    case 'up':
                        x = 0.5; // Move forward
                        message = '👆 Point forward - Moving forward!';
                        break;
                    case 'down':
                        command = 1004; // Stand up
                        message = '👇 Point down - Standing up!';
                        break;
                }
                break;
        }
        
        // Execute command
        if (command) {
            // Robot trick command
            if (globalThis.rtc && globalThis.rtc.publish) {
                const uniqID = (new Date().valueOf() % 2147483648) + Math.floor(Math.random() * 1e3);
                globalThis.rtc.publish("rt/api/sport/request", {
                    header: { identity: { id: uniqID, api_id: command } },
                    parameter: JSON.stringify(command),
                });
            }
        } else if (x !== 0 || y !== 0 || z !== 0) {
            // Movement command
            if (globalThis.rtc && globalThis.rtc.publishApi) {
                globalThis.rtc.publishApi("rt/api/sport/request", 1008, JSON.stringify({x, y, z}));
                
                // Stop movement after short time
                setTimeout(() => {
                    if (globalThis.rtc && globalThis.rtc.publishApi) {
                        globalThis.rtc.publishApi("rt/api/sport/request", 1008, JSON.stringify({x: 0, y: 0, z: 0}));
                    }
                }, 1000);
            }
        }
        
        if (message) {
            logMessage(message);
            this.lastCommand = now;
        }
    }
    
    gestureLoop() {
        if (!this.active) return;
        
        try {
            // Draw video frame to canvas
            this.ctx.drawImage(this.videoElement, 0, 0, this.canvas.width, this.canvas.height);
            
            // Get image data
            const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            
            // Detect hand gesture
            const gestureData = this.detectHandGesture(imageData);
            
            if (gestureData && gestureData.confidence > 0.5) {
                // Execute gesture command
                this.executeGestureCommand(gestureData);
                
                // Log detection occasionally
                if (Math.random() < 0.1) {
                    logMessage(`✋ Gesture: ${gestureData.gesture} (${gestureData.position}) - ${Math.round(gestureData.confidence * 100)}%`);
                }
            }
            
        } catch (error) {
            console.error('Gesture control error:', error);
        }
        
        // Continue gesture loop
        setTimeout(() => this.gestureLoop(), 300);
    }
}

// Create global gesture control instance
const gestureControl = new GestureControl();

// Gesture control functions
window.startGestureControl = function() {
    gestureControl.startGestureControl();
    logMessage('✋ Gesture Control activated - Use hand gestures to control robot!');
    logMessage('👋 Open palm = Hello | ✊ Fist = Sit | 👉 Point = Move/Turn');
};

window.stopGestureControl = function() {
    gestureControl.stopGestureControl();
    logMessage('⏹️ Gesture Control deactivated');
};