import { Go2WebRTC } from "./go2webrtc.js";
import { SPORT_CMD } from "./constants.js";

// Function to log messages to the console and the log window
function logMessage(text) {
  var log = document.querySelector("#log");
  var msg = document.getElementById("log-code");
  msg.textContent += truncateString(text, 300) + "\n";
  log.scrollTop = log.scrollHeight;
}
globalThis.logMessage = logMessage;

// Function to load saved values from localStorage
function loadSavedValues() {
  const savedToken = localStorage.getItem("token");
  const savedRobotIP = localStorage.getItem("robotIP");
  const savedOpenaiKey = localStorage.getItem("openaiKey");

  if (savedToken) {
    document.getElementById("token").value = savedToken;
  }
  if (savedRobotIP) {
    document.getElementById("robot-ip").value = savedRobotIP;
  }
  if (savedOpenaiKey) {
    document.getElementById("openai-key").value = savedOpenaiKey;
  }

  const commandSelect = document.getElementById("command");
  Object.entries(SPORT_CMD).forEach(([value, text]) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = text;
    commandSelect.appendChild(option);
  });
}

// Function to save values to localStorage
function saveValuesToLocalStorage() {
  const token = document.getElementById("token").value;
  const robotIP = document.getElementById("robot-ip").value;
  const openaiKey = document.getElementById("openai-key").value;

  localStorage.setItem("token", token);
  localStorage.setItem("robotIP", robotIP);
  localStorage.setItem("openaiKey", openaiKey);
}

// Function to handle connect button click
function handleConnectClick() {
  const token = document.getElementById("token").value;
  const robotIP = document.getElementById("robot-ip").value;
  const connectBtn = document.getElementById("connect-btn");
  
  if (!robotIP) {
    logMessage("❌ Please enter robot IP address");
    return;
  }

  console.log("Token:", token);
  console.log("Robot IP:", robotIP);
  
  connectBtn.innerHTML = "🔄 Connecting...";
  connectBtn.disabled = true;
  
  logMessage(`🚀 Connecting to robot at ${robotIP}...`);

  // Save the values to localStorage
  saveValuesToLocalStorage();

  // Initialize RTC with callback
  globalThis.rtc = new Go2WebRTC(token, robotIP, (data) => {
    if (data.type === 'validation' && data.data === 'Validation Ok.') {
      connectBtn.innerHTML = "✅ Connected to Robot";
      connectBtn.disabled = false;
      updateConnectionStatus(true);
      logMessage(`✅ Princess Peach is online! Ready to serve, your majesty!`);
      logMessage(`🖱️ Mouse: Wheel=Forward/Back, Middle+Wheel=Strafe, Hold Clicks=Turn, Double-Click=STOP`);
      logMessage(`⌨️ Keyboard: WASD=Move, QE=Turn`);
      logMessage(`🎮 Xbox: Hold LB + sticks to move`);
      
      // Ensure video element is ready
      const videoElement = document.getElementById("video-frame");
      if (videoElement && globalThis.rtc && globalThis.rtc.VidTrackEvent) {
        videoElement.srcObject = globalThis.rtc.VidTrackEvent.streams[0];
        videoElement.play().catch(e => console.log('Video autoplay prevented:', e));
      }
    }
  });
  
  // Set up connection state monitoring
  globalThis.rtc.pc.onconnectionstatechange = () => {
    const state = globalThis.rtc.pc.connectionState;
    logMessage(`Connection state: ${state}`);
    
    if (state === 'connected') {
      connectBtn.innerHTML = "✅ Connected to Robot";
      connectBtn.disabled = false;
      updateConnectionStatus(true);
    } else if (state === 'failed' || state === 'disconnected') {
      connectBtn.innerHTML = "❌ Connection Failed";
      setTimeout(() => {
        connectBtn.innerHTML = "🔗 Connect to Robot";
        connectBtn.disabled = false;
      }, 3000);
      updateConnectionStatus(false);
    }
  };
  
  globalThis.rtc.initSDP();
}

function handleExecuteClick() {
  const uniqID =
    (new Date().valueOf() % 2147483648) + Math.floor(Math.random() * 1e3);
  const command = parseInt(document.getElementById("command").value);

  console.log("Command:", command);

  globalThis.rtc.publish("rt/api/sport/request", {
    header: { identity: { id: uniqID, api_id: command } },
    parameter: JSON.stringify(command),
    // api_id: command,
  });
}


function handleExecuteCustomClick() {
    const command = document.getElementById("custom-command").value;
  
    console.log("Command:", command);
  
    globalThis.rtc.channel.send(command);
  }

function truncateString(str, maxLength) {
  if (typeof str !== "string") {
    str = JSON.stringify(str);
  }

  if (str.length > maxLength) {
    return str.substring(0, maxLength) + "...";
  } else {
    return str;
  }
}

function applyGamePadDeadzeone(value, th) {
  return Math.abs(value) > th ? value : 0
}

let gamepadInterval = null;

function startGamepadControl() {
  if (gamepadInterval) return;
  
  gamepadInterval = setInterval(() => {
    const gpToUse = document.getElementById("gamepad")?.value;
    if (!gpToUse || gpToUse === "NO" || !globalThis.rtc) return;
    
    const gamepads = navigator.getGamepads();
    const gp = gamepads[gpToUse];
    
    if (!gp) return;
    
    // LB must be pressed (button 4)
    if (gp.buttons[4] && gp.buttons[4].pressed) {
      const x = -1 * applyGamePadDeadzeone(gp.axes[1], 0.25); // Left stick Y
      const y = -1 * applyGamePadDeadzeone(gp.axes[0], 0.25); // Left stick X  
      const z = -1 * applyGamePadDeadzeone(gp.axes[2], 0.25); // Right stick X
      
      if (x !== 0 || y !== 0 || z !== 0) {
        updateControlMethod('Xbox Controller', '🎮');
        globalThis.rtc.publishApi("rt/api/sport/request", 1008, JSON.stringify({x: x * 0.8, y: y * 0.6, z: z * 1.5}));
      }
    }
  }, 50);
}

function stopGamepadControl() {
  if (gamepadInterval) {
    clearInterval(gamepadInterval);
    gamepadInterval = null;
  }
}

function joystickTick(joyLeft, joyRight) {
  // Disable joysticks to prevent spam
  return;
}

function addJoysticks() {
  const joyConfig = {
    internalFillColor: "#FFFFFF",
    internalLineWidth: 2,
    internalStrokeColor: "rgba(240, 240, 240, 0.3)",
    externalLineWidth: 1,
    externalStrokeColor: "#FFFFFF",
  };
  var joyLeft = new JoyStick("joy-left", joyConfig);
  var joyRight = new JoyStick("joy-right", joyConfig);

  setInterval( joystickTick, 100, joyLeft, joyRight );
}

const buildGamePadsSelect = (e) => {
  const gamepads = navigator.getGamepads();
  const gamepadSelect = document.getElementById("gamepad");
  if (!gamepadSelect) return;
  
  gamepadSelect.innerHTML = "";

  const option = document.createElement("option");
  option.value = "NO";
  option.textContent = "No Controller";
  option.selected = true;
  gamepadSelect.appendChild(option);  

  for (let i = 0; i < gamepads.length; i++) {
    const gp = gamepads[i];
    if (gp) {
      const option = document.createElement("option");
      option.value = i;
      option.textContent = gp.id.substring(0, 30) + (gp.id.length > 30 ? '...' : '');
      gamepadSelect.appendChild(option);
    }
  }
};

window.addEventListener("gamepadconnected", buildGamePadsSelect);
window.addEventListener("gamepaddisconnected", buildGamePadsSelect);
buildGamePadsSelect();

// Load saved values when the page loads
document.addEventListener("DOMContentLoaded", loadSavedValues);
document.addEventListener("DOMContentLoaded", addJoysticks);

// Setup gamepad change handler
document.addEventListener("DOMContentLoaded", function() {
  const gamepadSelect = document.getElementById("gamepad");
  if (gamepadSelect) {
    gamepadSelect.addEventListener("change", (e) => {
      if (e.target.value !== "NO") {
        startGamepadControl();
        logMessage(`🎮 Xbox controller activated - Hold LB to move`);
      } else {
        stopGamepadControl();
        logMessage(`🎮 Controller disabled`);
      }
    });
  }
});

// Attach event listener to connect button
document
  .getElementById("connect-btn")
  .addEventListener("click", handleConnectClick);

document
  .getElementById("execute-btn")
  .addEventListener("click", handleExecuteClick);

document
  .getElementById("execute-custom-btn")
  .addEventListener("click", handleExecuteCustomClick);




// Function to update control method indicator
function updateControlMethod(method, icon) {
  const controlMethod = document.getElementById('control-method');
  if (controlMethod) {
    controlMethod.textContent = `${icon} ${method}`;
  }
}

let middleButtonPressed = false;

// Track middle button state
document.addEventListener('mousedown', function(event) {
  if (event.button === 1) {
    middleButtonPressed = true;
    event.preventDefault();
  }
});

document.addEventListener('mouseup', function(event) {
  if (event.button === 1) {
    middleButtonPressed = false;
    event.preventDefault();
  }
});

// Mouse wheel controls
document.addEventListener('wheel', function(event) {
  // Don't trigger if not connected, mouse control disabled, or not on video area
  if (!globalThis.rtc || !globalThis.rtc.publishApi || !window.mouseControlEnabled) return;
  if (!event.target.closest('.video-background')) return;
  
  event.preventDefault();
  
  if (middleButtonPressed) {
    // Middle button + wheel = sideways movement
    updateControlMethod('Mouse', '🖱️');
    if (event.deltaY < 0) {
      // Middle + scroll up - Strafe left
      logMessage('🖱️ Middle + wheel up - Strafe left');
      globalThis.rtc.publishApi("rt/api/sport/request", 1008, JSON.stringify({x: 0, y: 0.5, z: 0}));
      startMovementTimeout();
      setTimeout(() => {
        if (globalThis.rtc && globalThis.rtc.publishApi) {
          globalThis.rtc.publishApi("rt/api/sport/request", 1008, JSON.stringify({x: 0, y: 0, z: 0}));
        }
      }, 200);
    } else if (event.deltaY > 0) {
      // Middle + scroll down - Strafe right
      logMessage('🖱️ Middle + wheel down - Strafe right');
      globalThis.rtc.publishApi("rt/api/sport/request", 1008, JSON.stringify({x: 0, y: -0.5, z: 0}));
      startMovementTimeout();
      setTimeout(() => {
        if (globalThis.rtc && globalThis.rtc.publishApi) {
          globalThis.rtc.publishApi("rt/api/sport/request", 1008, JSON.stringify({x: 0, y: 0, z: 0}));
        }
      }, 200);
    }
  } else if (event.shiftKey) {
    // Shift + wheel = sideways movement (backup option)
    updateControlMethod('Mouse', '🖱️');
    if (event.deltaY < 0) {
      logMessage('🖱️ Shift + wheel up - Strafe left');
      globalThis.rtc.publishApi("rt/api/sport/request", 1008, JSON.stringify({x: 0, y: 0.5, z: 0}));
      startMovementTimeout();
      setTimeout(() => {
        if (globalThis.rtc && globalThis.rtc.publishApi) {
          globalThis.rtc.publishApi("rt/api/sport/request", 1008, JSON.stringify({x: 0, y: 0, z: 0}));
        }
      }, 200);
    } else if (event.deltaY > 0) {
      logMessage('🖱️ Shift + wheel down - Strafe right');
      globalThis.rtc.publishApi("rt/api/sport/request", 1008, JSON.stringify({x: 0, y: -0.5, z: 0}));
      startMovementTimeout();
      setTimeout(() => {
        if (globalThis.rtc && globalThis.rtc.publishApi) {
          globalThis.rtc.publishApi("rt/api/sport/request", 1008, JSON.stringify({x: 0, y: 0, z: 0}));
        }
      }, 200);
    }
  } else {
    // Normal wheel = forward/backward
    updateControlMethod('Mouse', '🖱️');
    if (event.deltaY < 0) {
      // Scroll up - Forward
      logMessage('🖱️ Mouse wheel up - Forward');
      globalThis.rtc.publishApi("rt/api/sport/request", 1008, JSON.stringify({x: 0.7, y: 0, z: 0}));
      startMovementTimeout();
      setTimeout(() => {
        if (globalThis.rtc && globalThis.rtc.publishApi) {
          globalThis.rtc.publishApi("rt/api/sport/request", 1008, JSON.stringify({x: 0, y: 0, z: 0}));
        }
      }, 200);
    } else if (event.deltaY > 0) {
      // Scroll down - Backward
      logMessage('🖱️ Mouse wheel down - Backward');
      globalThis.rtc.publishApi("rt/api/sport/request", 1008, JSON.stringify({x: -0.5, y: 0, z: 0}));
      startMovementTimeout();
      setTimeout(() => {
        if (globalThis.rtc && globalThis.rtc.publishApi) {
          globalThis.rtc.publishApi("rt/api/sport/request", 1008, JSON.stringify({x: 0, y: 0, z: 0}));
        }
      }, 200);
    }
  }
});

let mouseInterval = null;
let movementTimeout = null;
let lastClickTime = 0;

// Auto-stop movement after timeout
function startMovementTimeout() {
  if (movementTimeout) clearTimeout(movementTimeout);
  movementTimeout = setTimeout(() => {
    if (globalThis.rtc && globalThis.rtc.publishApi) {
      globalThis.rtc.publishApi("rt/api/sport/request", 1008, JSON.stringify({x: 0, y: 0, z: 0}));
      logMessage('⏱️ Auto-stopped after 2 seconds');
    }
  }, 2000);
}

// Emergency stop function
function emergencyStop() {
  logMessage('🛑 EMERGENCY STOP - Double click detected');
  const uniqID = (new Date().valueOf() % 2147483648) + Math.floor(Math.random() * 1e3);
  globalThis.rtc.publish("rt/api/sport/request", {
    header: { identity: { id: uniqID, api_id: 1001 } },
    parameter: JSON.stringify(1001),
  });
}

// Mouse click controls - hold to turn
document.addEventListener('mousedown', function(event) {
  // Don't trigger if not connected, mouse control disabled, or not on video area
  if (!globalThis.rtc || !globalThis.rtc.publishApi || !window.mouseControlEnabled) return;
  if (!event.target.closest('.video-background')) return;
  
  // Check for double-click emergency stop
  const currentTime = Date.now();
  if (currentTime - lastClickTime < 300) {
    emergencyStop();
    return;
  }
  lastClickTime = currentTime;
  
  if (event.button === 0) {
    // Left click - Hold to turn left
    updateControlMethod('Mouse', '🖱️');
    logMessage('🖱️ Hold left click - Turn left');
    globalThis.rtc.publishApi("rt/api/sport/request", 1008, JSON.stringify({x: 0, y: 0, z: 1.5}));
    startMovementTimeout();
    
    mouseInterval = setInterval(() => {
      if (globalThis.rtc && globalThis.rtc.publishApi) {
        globalThis.rtc.publishApi("rt/api/sport/request", 1008, JSON.stringify({x: 0, y: 0, z: 1.5}));
        startMovementTimeout();
      }
    }, 100);
  } else if (event.button === 2) {
    // Right click - Hold to turn right
    event.preventDefault();
    updateControlMethod('Mouse', '🖱️');
    logMessage('🖱️ Hold right click - Turn right');
    globalThis.rtc.publishApi("rt/api/sport/request", 1008, JSON.stringify({x: 0, y: 0, z: -1.5}));
    startMovementTimeout();
    
    mouseInterval = setInterval(() => {
      if (globalThis.rtc && globalThis.rtc.publishApi) {
        globalThis.rtc.publishApi("rt/api/sport/request", 1008, JSON.stringify({x: 0, y: 0, z: -1.5}));
        startMovementTimeout();
      }
    }, 100);
  }
});

// Stop turning when mouse button is released
document.addEventListener('mouseup', function(event) {
  if (mouseInterval && (event.button === 0 || event.button === 2)) {
    clearInterval(mouseInterval);
    mouseInterval = null;
    
    if (movementTimeout) {
      clearTimeout(movementTimeout);
      movementTimeout = null;
    }
    
    if (globalThis.rtc && globalThis.rtc.publishApi) {
      globalThis.rtc.publishApi("rt/api/sport/request", 1008, JSON.stringify({x: 0, y: 0, z: 0}));
    }
  }
});

// Make updateControlMethod global so it shows in UI
window.updateControlMethod = updateControlMethod;

// Mouse control state - accessed from index.html
let mouseControlEnabled = false;

// Disable right-click context menu
document.addEventListener('contextmenu', function(event) {
  event.preventDefault();
});

// Keyboard controls
document.addEventListener('keydown', function(event) {
  // Don't trigger if typing in input fields
  if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
    return;
  }
  
  const key = event.key.toLowerCase();
  let x = 0, y = 0, z = 0;

  switch (key) {
      case 'w': // Forward
          x = 0.8;
          break;
      case 's': // Reverse
          x = -0.4;
          break;
      case 'a': // Sideways left
          y = 0.4;
          break;
      case 'd': // Sideways right
          y = -0.4;
          break;
      case 'q': // Turn left
          z = 2;
          break;
      case 'e': // Turn right
          z = -2;
          break;
      default:
          return; // Ignore other keys
  }

  if(globalThis.rtc !== undefined && globalThis.rtc.publishApi) {
      updateControlMethod('Keyboard', '⌨️');
      globalThis.rtc.publishApi("rt/api/sport/request", 1008, JSON.stringify({x: x, y: y, z: z}));
  }
});

document.addEventListener('keyup', function(event) {
  // Don't trigger if typing in input fields
  if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
    return;
  }
  
  const key = event.key.toLowerCase();
  if (key === 'w' || key === 's' || key === 'a' || key === 'd' || key === 'q' || key === 'e') {
      if(globalThis.rtc !== undefined && globalThis.rtc.publishApi) {
          // Stop movement by sending zero velocity
          globalThis.rtc.publishApi("rt/api/sport/request", 1008, JSON.stringify({x: 0, y: 0, z: 0}));
      }
  }
});

