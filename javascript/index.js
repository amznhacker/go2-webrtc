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

  if (savedToken) {
    document.getElementById("token").value = savedToken;
  }
  if (savedRobotIP) {
    document.getElementById("robot-ip").value = savedRobotIP;
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

  localStorage.setItem("token", token);
  localStorage.setItem("robotIP", robotIP);
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
      logMessage(`✅ Successfully connected to GO2!`);
      
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

