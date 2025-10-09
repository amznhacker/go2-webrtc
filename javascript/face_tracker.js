// Client-side face tracking using browser Face Detection API
// Fallback to simple skin color detection if Face Detection API not available

class FaceTracker {
    constructor() {
        this.tracking = false;
        this.canvas = null;
        this.ctx = null;
        this.videoElement = null;
        this.lastCommand = Date.now();
        this.faceDetector = null;
        this.useFaceAPI = false;
        
        console.log('👤 Face tracker initialized');
        this.initFaceDetection();
    }
    
    async initFaceDetection() {
        // Try to use Face Detection API if available
        if ('FaceDetector' in window) {
            try {
                this.faceDetector = new FaceDetector({
                    maxDetectedFaces: 1,
                    fastMode: true
                });
                this.useFaceAPI = true;
                console.log('✅ Using Face Detection API');
            } catch (e) {
                console.log('⚠️ Face Detection API not supported, using skin detection');
                this.useFaceAPI = false;
            }
        } else {
            console.log('⚠️ Face Detection API not available, using skin detection');
            this.useFaceAPI = false;
        }
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
        
        // Set canvas size
        this.canvas.width = 320;
        this.canvas.height = 240;
        
        console.log('✅ Face tracker ready');
        return true;
    }
    
    startTracking() {
        if (!this.init()) return;
        
        this.tracking = true;
        console.log('👤 Starting face tracking');
        this.trackingLoop();
    }
    
    stopTracking() {
        this.tracking = false;
        console.log('⏹️ Stopping face tracking');
        
        // Stop robot
        if (globalThis.rtc && globalThis.rtc.publishApi) {
            globalThis.rtc.publishApi("rt/api/sport/request", 1008, JSON.stringify({x: 0, y: 0, z: 0}));
        }
    }
    
    async detectFaceAPI() {
        if (!this.faceDetector) return null;
        
        try {
            const faces = await this.faceDetector.detect(this.videoElement);
            if (faces.length > 0) {
                const face = faces[0];
                const bbox = face.boundingBox;
                
                return {
                    center: {
                        x: (bbox.x + bbox.width / 2) * (this.canvas.width / this.videoElement.videoWidth),
                        y: (bbox.y + bbox.height / 2) * (this.canvas.height / this.videoElement.videoHeight)
                    },
                    area: bbox.width * bbox.height,
                    confidence: 1.0
                };
            }
        } catch (e) {
            console.error('Face detection error:', e);
        }
        
        return null;
    }
    
    detectSkinColor(imageData) {
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        
        let skinPixels = [];
        let totalSkin = 0;
        
        // Simple skin color detection in RGB
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // Skin color criteria (simplified)
            if (r > 95 && g > 40 && b > 20 && 
                r > g && r > b && 
                Math.abs(r - g) > 15 && 
                r - b > 15) {
                
                const pixelIndex = i / 4;
                const x = pixelIndex % width;
                const y = Math.floor(pixelIndex / width);
                
                skinPixels.push({x, y});
                totalSkin++;
            }
        }
        
        if (skinPixels.length < 200) return null; // Not enough skin pixels
        
        // Calculate center of skin pixels
        let centerX = 0, centerY = 0;
        skinPixels.forEach(pixel => {
            centerX += pixel.x;
            centerY += pixel.y;
        });
        
        centerX = Math.floor(centerX / skinPixels.length);
        centerY = Math.floor(centerY / skinPixels.length);
        
        return {
            center: {x: centerX, y: centerY},
            area: totalSkin,
            confidence: 0.7
        };
    }
    
    sendRobotCommand(x, y, z) {
        // Limit command frequency
        const now = Date.now();
        if (now - this.lastCommand < 200) return;
        this.lastCommand = now;
        
        if (globalThis.rtc && globalThis.rtc.publishApi) {
            globalThis.rtc.publishApi("rt/api/sport/request", 1008, JSON.stringify({x, y, z}));
            console.log(`🤖 Face tracking: x=${x.toFixed(2)}, y=${y.toFixed(2)}, z=${z.toFixed(2)}`);
        }
    }
    
    async trackingLoop() {
        if (!this.tracking) return;
        
        try {
            let faceData = null;
            
            // Try Face Detection API first
            if (this.useFaceAPI) {
                faceData = await this.detectFaceAPI();
            }
            
            // Fallback to skin color detection
            if (!faceData) {
                // Draw video frame to canvas
                this.ctx.drawImage(this.videoElement, 0, 0, this.canvas.width, this.canvas.height);
                
                // Get image data
                const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
                
                // Detect skin color
                faceData = this.detectSkinColor(imageData);
            }
            
            if (faceData) {
                const centerX = faceData.center.x;
                const frameCenterX = this.canvas.width / 2;
                const offsetX = centerX - frameCenterX;
                
                // Movement logic
                let x = 0, y = 0, z = 0;
                let status = '👤 Tracking face';
                
                // Horizontal tracking (turning)
                if (Math.abs(offsetX) > 40) {
                    if (offsetX > 0) {
                        z = -0.6; // Turn right
                        status += ' → Right';
                    } else {
                        z = 0.6;  // Turn left
                        status += ' ← Left';
                    }
                }
                
                // Distance tracking (based on face size)
                if (faceData.area < 800) {
                    x = 0.3; // Move forward
                    status += ' ↑ Forward';
                } else if (faceData.area > 3000) {
                    x = -0.2; // Move backward
                    status += ' ↓ Backward';
                } else {
                    status += ' ✓ Good distance';
                }
                
                // Send command
                this.sendRobotCommand(x, y, z);
                
                // Log status occasionally
                if (Math.random() < 0.1) {
                    const method = this.useFaceAPI ? 'Face API' : 'Skin detection';
                    logMessage(`${status} (${method}, area: ${Math.round(faceData.area)})`);
                }
                
            } else {
                // No face found - stop robot
                this.sendRobotCommand(0, 0, 0);
                
                if (Math.random() < 0.05) {
                    logMessage('👤 Searching for face...');
                }
            }
            
        } catch (error) {
            console.error('Face tracking error:', error);
        }
        
        // Continue tracking
        setTimeout(() => this.trackingLoop(), 150);
    }
}

// Create global face tracker instance
const faceTracker = new FaceTracker();

// Add face tracking functions
window.startFaceTracking = function() {
    faceTracker.startTracking();
    logMessage('👤 Face tracking started - Look at the camera!');
};

window.stopFaceTracking = function() {
    faceTracker.stopTracking();
    logMessage('⏹️ Face tracking stopped');
};