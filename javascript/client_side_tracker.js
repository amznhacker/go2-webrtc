// Client-side color tracking using the WebRTC video stream
// Add this to the web interface to process video frames in the browser

class ClientSideTracker {
    constructor() {
        this.tracking = false;
        this.canvas = null;
        this.ctx = null;
        this.videoElement = null;
        this.lastCommand = Date.now();
        
        console.log('🎯 Client-side tracker initialized');
    }
    
    init() {
        // Create hidden canvas for processing
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.videoElement = document.getElementById('video-frame');
        
        if (!this.videoElement) {
            console.error('❌ Video element not found');
            return false;
        }
        
        // Set canvas size to match video
        this.canvas.width = 320;
        this.canvas.height = 240;
        
        console.log('✅ Client tracker ready');
        return true;
    }
    
    startTracking() {
        if (!this.init()) return;
        
        this.tracking = true;
        console.log('🔴 Starting client-side tracking');
        this.trackingLoop();
    }
    
    stopTracking() {
        this.tracking = false;
        console.log('⏹️ Stopping client-side tracking');
        
        // Stop robot
        if (globalThis.rtc && globalThis.rtc.publishApi) {
            globalThis.rtc.publishApi("rt/api/sport/request", 1008, JSON.stringify({x: 0, y: 0, z: 0}));
        }
    }
    
    findRedPixels(imageData) {
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        
        let redPixels = [];
        let totalRed = 0;
        
        // Simple red detection - look for pixels with high red, low green/blue
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // Red detection criteria
            if (r > 120 && r > g * 1.5 && r > b * 1.5) {
                const pixelIndex = i / 4;
                const x = pixelIndex % width;
                const y = Math.floor(pixelIndex / width);
                
                redPixels.push({x, y});
                totalRed++;
            }
        }
        
        if (redPixels.length < 100) return null; // Not enough red pixels
        
        // Calculate center of red pixels
        let centerX = 0, centerY = 0;
        redPixels.forEach(pixel => {
            centerX += pixel.x;
            centerY += pixel.y;
        });
        
        centerX = Math.floor(centerX / redPixels.length);
        centerY = Math.floor(centerY / redPixels.length);
        
        return {
            center: {x: centerX, y: centerY},
            pixelCount: totalRed,
            area: totalRed
        };
    }
    
    sendRobotCommand(x, y, z) {
        // Limit command frequency
        const now = Date.now();
        if (now - this.lastCommand < 200) return;
        this.lastCommand = now;
        
        if (globalThis.rtc && globalThis.rtc.publishApi) {
            globalThis.rtc.publishApi("rt/api/sport/request", 1008, JSON.stringify({x, y, z}));
            console.log(`🤖 Command: x=${x.toFixed(2)}, y=${y.toFixed(2)}, z=${z.toFixed(2)}`);
        }
    }
    
    trackingLoop() {
        if (!this.tracking) return;
        
        try {
            // Draw video frame to canvas
            this.ctx.drawImage(this.videoElement, 0, 0, this.canvas.width, this.canvas.height);
            
            // Get image data
            const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            
            // Find red pixels
            const redBlob = this.findRedPixels(imageData);
            
            if (redBlob) {
                const centerX = redBlob.center.x;
                const frameCenterX = this.canvas.width / 2;
                const offsetX = centerX - frameCenterX;
                
                // Movement logic
                let x = 0, y = 0, z = 0;
                let status = '🎯 Tracking';
                
                // Horizontal tracking (turning)
                if (Math.abs(offsetX) > 30) {
                    if (offsetX > 0) {
                        z = -0.8; // Turn right
                        status += ' → Right';
                    } else {
                        z = 0.8;  // Turn left
                        status += ' ← Left';
                    }
                }
                
                // Distance tracking (based on red pixel count)
                if (redBlob.pixelCount < 500) {
                    x = 0.4; // Move forward
                    status += ' ↑ Forward';
                } else if (redBlob.pixelCount > 2000) {
                    x = -0.3; // Move backward
                    status += ' ↓ Backward';
                } else {
                    status += ' ✓ Good';
                }
                
                // Send command
                this.sendRobotCommand(x, y, z);
                
                // Log status
                if (Math.random() < 0.1) { // Log occasionally to avoid spam
                    logMessage(status + ` (${redBlob.pixelCount} red pixels)`);
                }
                
            } else {
                // No red object found - stop robot
                this.sendRobotCommand(0, 0, 0);
                
                if (Math.random() < 0.05) { // Log occasionally
                    logMessage('🔍 Searching for red object...');
                }
            }
            
        } catch (error) {
            console.error('Tracking error:', error);
        }
        
        // Continue tracking
        setTimeout(() => this.trackingLoop(), 100);
    }
}

// Create global tracker instance
const clientTracker = new ClientSideTracker();

// Override the tracking functions to use client-side tracking
window.startTracking = function() {
    clientTracker.startTracking();
    logMessage('🔴 Client-side tracking started - Hold up red object!');
};

window.stopTracking = function() {
    clientTracker.stopTracking();
    logMessage('⏹️ Client-side tracking stopped');
};