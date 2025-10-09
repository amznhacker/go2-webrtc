// Greeter Bot - Detects people, approaches them, and says hello
// Uses face detection to find people and greet them politely

class GreeterBot {
    constructor() {
        this.greeting = false;
        this.canvas = null;
        this.ctx = null;
        this.videoElement = null;
        this.lastCommand = Date.now();
        this.lastGreeting = 0;
        this.greetingCooldown = 10000; // 10 seconds between greetings
        this.greetingDistance = 1500; // Target face area for greeting distance
        
        console.log('🤖 Greeter Bot initialized');
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
        
        console.log('✅ Greeter Bot ready');
        return true;
    }
    
    startGreeting() {
        if (!this.init()) return;
        
        this.greeting = true;
        console.log('🤖 Starting greeter mode');
        this.greetingLoop();
    }
    
    stopGreeting() {
        this.greeting = false;
        console.log('⏹️ Stopping greeter mode');
        
        // Stop robot
        if (globalThis.rtc && globalThis.rtc.publishApi) {
            globalThis.rtc.publishApi("rt/api/sport/request", 1008, JSON.stringify({x: 0, y: 0, z: 0}));
        }
    }
    
    detectPerson(imageData) {
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        
        let skinPixels = [];
        let totalSkin = 0;
        
        // Simple skin/face detection - look for skin-colored pixels
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // Skin color detection criteria
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
        
        // Calculate center of skin pixels (likely face area)
        let centerX = 0, centerY = 0;
        skinPixels.forEach(pixel => {
            centerX += pixel.x;
            centerY += pixel.y;
        });
        
        centerX = Math.floor(centerX / skinPixels.length);
        centerY = Math.floor(centerY / skinPixels.length);
        
        return {
            center: {x: centerX, y: centerY},
            area: totalSkin
        };
    }
    
    sendRobotCommand(x, y, z) {
        // Limit command frequency
        const now = Date.now();
        if (now - this.lastCommand < 300) return;
        this.lastCommand = now;
        
        if (globalThis.rtc && globalThis.rtc.publishApi) {
            globalThis.rtc.publishApi("rt/api/sport/request", 1008, JSON.stringify({x, y, z}));
            console.log(`🤖 Greeter: x=${x.toFixed(2)}, y=${y.toFixed(2)}, z=${z.toFixed(2)}`);
        }
    }
    
    executeGreeting() {
        // Send hello wave command
        if (globalThis.rtc && globalThis.rtc.publishApi) {
            const uniqID = (new Date().valueOf() % 2147483648) + Math.floor(Math.random() * 1e3);
            globalThis.rtc.publish("rt/api/sport/request", {
                header: { identity: { id: uniqID, api_id: 1016 } },
                parameter: JSON.stringify(1016),
            });
            
            logMessage('👋 Hello! Nice to meet you!');
            console.log('👋 Greeting executed');
        }
    }
    
    greetingLoop() {
        if (!this.greeting) return;
        
        try {
            // Draw video frame to canvas
            this.ctx.drawImage(this.videoElement, 0, 0, this.canvas.width, this.canvas.height);
            
            // Get image data
            const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            
            // Detect person
            const person = this.detectPerson(imageData);
            
            if (person) {
                const centerX = person.center.x;
                const frameCenterX = this.canvas.width / 2;
                const offsetX = centerX - frameCenterX;
                const now = Date.now();
                
                // Check if we're at greeting distance
                if (person.area >= this.greetingDistance) {
                    // Close enough - stop and greet if cooldown passed
                    this.sendRobotCommand(0, 0, 0);
                    
                    if (now - this.lastGreeting > this.greetingCooldown) {
                        this.executeGreeting();
                        this.lastGreeting = now;
                        
                        // Wait a bit after greeting
                        setTimeout(() => {
                            if (Math.random() < 0.3) {
                                logMessage('😊 Have a great day!');
                            }
                        }, 2000);
                    }
                    
                    if (Math.random() < 0.1) {
                        logMessage('🤖 At greeting distance - Hello!');
                    }
                    
                } else {
                    // Too far - approach slowly
                    let x = 0, y = 0, z = 0;
                    let status = '🚪 Approaching person';
                    
                    // Center the person first
                    if (Math.abs(offsetX) > 40) {
                        if (offsetX > 0) {
                            z = -0.4; // Turn right slowly
                            status += ' → Centering';
                        } else {
                            z = 0.4;  // Turn left slowly
                            status += ' ← Centering';
                        }
                    } else {
                        // Centered - move forward slowly
                        x = 0.2; // Slow approach
                        status += ' ↑ Moving closer';
                    }
                    
                    // Send command
                    this.sendRobotCommand(x, y, z);
                    
                    // Log status occasionally
                    if (Math.random() < 0.1) {
                        logMessage(status + ` (distance: ${Math.round(person.area)})`);
                    }
                }
                
            } else {
                // No person found - stop and wait
                this.sendRobotCommand(0, 0, 0);
                
                if (Math.random() < 0.05) {
                    logMessage('👀 Looking for people to greet...');
                }
            }
            
        } catch (error) {
            console.error('Greeter error:', error);
        }
        
        // Continue greeting loop
        setTimeout(() => this.greetingLoop(), 200);
    }
}

// Create global greeter bot instance
const greeterBot = new GreeterBot();

// Greeter bot functions
window.startGreeting = function() {
    greeterBot.startGreeting();
    logMessage('🤖 Greeter Bot activated - Looking for people to greet!');
};

window.stopGreeting = function() {
    greeterBot.stopGreeting();
    logMessage('⏹️ Greeter Bot deactivated');
};