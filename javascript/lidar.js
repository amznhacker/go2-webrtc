import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Stats from "three/addons/libs/stats.module.js";
import { Go2WebRTC } from "./go2webrtc.js";

// Global variables
let scene, camera, renderer, controls, stats;
let voxelWorld;
let rtc = null;

// LIDAR data processing
class VoxelWorld {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.mesh = new THREE.Mesh();
    this.tileSize = options.tileSize || 32;
    this.tileTextureWidth = options.tileTextureWidth || 1024;
    this.tileTextureHeight = options.tileTextureHeight || 32;
    this.material = options.material || new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.currCellDataInfo = undefined;
    this.cellSize_X = 128;
    this.cellSize_Y = 128;
    this.cellSize_Z = 30;
  }

  clearVoxel() {
    this.currCellDataInfo = undefined;
  }

  calBitForIndex(byte, index) {
    return (byte >> (7 - index)) & 1;
  }

  getVoxel(data, x, y, z) {
    const { cellSize_X, cellSize_Y } = this;
    const index = cellSize_X * cellSize_Y * z + cellSize_X * y + x;
    const byteIndex = Math.floor(index / 8);
    const bitIndex = index % 8;
    return this.calBitForIndex(data[byteIndex], bitIndex);
  }

  adjacent(data, pos) {
    const { cellSize_X, cellSize_Y, cellSize_Z } = this;
    const [x, y, z] = pos;
    return x > cellSize_X || y > cellSize_Y || z > cellSize_Z ? 0 : this.getVoxel(data, x, y, z);
  }

  generateGeometryData(data, dimensions, resolution, origin) {
    const positions = [];
    const uvs = [];
    const indices = [];
    
    this.cellSize_X = dimensions[0];
    this.cellSize_Y = dimensions[1];
    this.cellSize_Z = dimensions[2];

    let voxelCount = 0;
    
    // Face definitions for cube rendering
    const faces = [
      { dir: [-1, 0, 0], corners: [{ pos: [0, 1, 0], uv: [0, 1] }, { pos: [0, 0, 0], uv: [1, 1] }, { pos: [0, 1, 1], uv: [0, 0] }, { pos: [0, 0, 1], uv: [1, 0] }] },
      { dir: [1, 0, 0], corners: [{ pos: [1, 1, 1], uv: [1, 0] }, { pos: [1, 0, 1], uv: [0, 0] }, { pos: [1, 1, 0], uv: [1, 1] }, { pos: [1, 0, 0], uv: [0, 1] }] },
      { dir: [0, -1, 0], corners: [{ pos: [1, 0, 1], uv: [1, 0] }, { pos: [0, 0, 1], uv: [0, 0] }, { pos: [1, 0, 0], uv: [1, 1] }, { pos: [0, 0, 0], uv: [0, 1] }] },
      { dir: [0, 1, 0], corners: [{ pos: [0, 1, 1], uv: [0, 0] }, { pos: [1, 1, 1], uv: [1, 0] }, { pos: [0, 1, 0], uv: [0, 1] }, { pos: [1, 1, 0], uv: [1, 1] }] },
      { dir: [0, 0, -1], corners: [{ pos: [1, 0, 0], uv: [0, 0] }, { pos: [0, 0, 0], uv: [1, 0] }, { pos: [1, 1, 0], uv: [0, 1] }, { pos: [0, 1, 0], uv: [1, 1] }] },
      { dir: [0, 0, 1], corners: [{ pos: [0, 0, 1], uv: [0, 0] }, { pos: [1, 0, 1], uv: [1, 0] }, { pos: [0, 1, 1], uv: [0, 1] }, { pos: [1, 1, 1], uv: [1, 1] }] }
    ];

    for (let byteIndex = 0; byteIndex < data.byteLength; byteIndex++) {
      if (data[byteIndex] > 0) {
        const byte = data[byteIndex];
        for (let bitIndex = 0; bitIndex < 8; bitIndex++) {
          if (this.calBitForIndex(byte, bitIndex)) {
            const voxelIndex = byteIndex * 8 + bitIndex;
            voxelCount++;
            
            const z = Math.floor(voxelIndex / (this.cellSize_X * this.cellSize_Y));
            const remainder = voxelIndex % (this.cellSize_X * this.cellSize_Y);
            const y = Math.floor(remainder / this.cellSize_X);
            const x = remainder % this.cellSize_X;
            
            // Color based on height
            const heightNormalized = (z * resolution + origin[2]) * Math.round(1 / resolution);
            const colorIndex = Math.floor((heightNormalized < -10 ? -10 : heightNormalized > 20 ? 20 : heightNormalized) + 10);
            
            for (const { dir, corners } of faces) {
              if (!this.adjacent(data, [x + dir[0], y + dir[1], z + dir[2]])) {
                const vertexIndex = positions.length / 3;
                
                for (const { pos, uv } of corners) {
                  positions.push(pos[0] + x, pos[1] + y, pos[2] + z);
                  uvs.push(((colorIndex + uv[0]) * this.tileSize) / this.tileTextureWidth, 1 - ((1 - uv[1]) * this.tileSize) / this.tileTextureHeight);
                }
                
                indices.push(vertexIndex, vertexIndex + 1, vertexIndex + 2, vertexIndex + 2, vertexIndex + 1, vertexIndex + 3);
              }
            }
          }
        }
      }
    }

    return {
      positionsFloat32Array: new Float32Array(positions),
      uvsFloat32Array: new Float32Array(uvs),
      indices: indices,
      pointCount: voxelCount
    };
  }

  updateMesh(geometryData, resolution, origin) {
    // Remove old mesh
    if (this.mesh) {
      this.scene.remove(this.mesh);
      if (this.mesh.geometry) this.mesh.geometry.dispose();
      if (this.mesh.material) this.mesh.material.dispose();
    }

    // Create new geometry
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(geometryData.positionsFloat32Array, 3));
    geometry.setAttribute('uv', new THREE.BufferAttribute(geometryData.uvsFloat32Array, 2));
    geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(geometryData.indices), 1));

    // Create new mesh
    this.mesh = new THREE.Mesh(geometry, this.material);
    const res = resolution || 0.1;
    this.mesh.scale.set(res, res, res);
    this.mesh.position.set(origin[0] || 0, origin[1] || 0, origin[2] || 0);
    
    this.scene.add(this.mesh);
    
    console.log(`Updated LIDAR mesh: ${geometryData.pointCount} voxels`);
  }
}

// Initialize 3D scene
function init() {
  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x282828);
  scene.rotation.x -= Math.PI / 2;

  // Camera
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 100);
  camera.position.set(-3, 0, 3);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);

  // Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.minPolarAngle = 0.2;
  controls.maxPolarAngle = (Math.PI / 4) * 3;

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
  directionalLight.position.set(10, 10, 5);
  scene.add(directionalLight);

  // Grid
  const gridHelper = new THREE.GridHelper(40, 40, 0x888888);
  gridHelper.rotateX(Math.PI / 2);
  scene.add(gridHelper);

  // Stats
  stats = Stats();
  stats.dom.style.top = '20px';
  stats.dom.style.right = '20px';
  stats.dom.style.left = 'auto';
  document.body.appendChild(stats.dom);

  // Create texture for voxels
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  
  // Create color gradient for height mapping
  for (let i = 0; i < 32; i++) {
    const hue = (i / 32) * 240; // Blue to red
    ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;
    ctx.fillRect(i * 32, 0, 32, 32);
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;

  const material = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide,
    transparent: false
  });

  // Initialize voxel world
  voxelWorld = new VoxelWorld(scene, {
    tileSize: 32,
    tileTextureWidth: 1024,
    tileTextureHeight: 32,
    material: material
  });

  // Handle window resize
  window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
  stats.update();
}

// WebRTC connection and data handling
function connectToRobot() {
  const robotIP = document.getElementById('robot-ip').value;
  const token = document.getElementById('token').value;
  const connectBtn = document.getElementById('connect-btn');
  const status = document.getElementById('status');
  
  if (!robotIP) {
    alert('Please enter robot IP address');
    return;
  }

  connectBtn.textContent = 'Connecting...';
  connectBtn.disabled = true;
  
  // Save values
  localStorage.setItem('lidar-robotIP', robotIP);
  localStorage.setItem('lidar-token', token);

  // Initialize WebRTC connection
  rtc = new Go2WebRTC(token, robotIP, handleIncomingData);
  
  rtc.pc.onconnectionstatechange = () => {
    const state = rtc.pc.connectionState;
    console.log('Connection state:', state);
    
    if (state === 'connected') {
      status.innerHTML = '<span class="connected">● Connected</span>';
      connectBtn.textContent = 'Connected';
      connectBtn.disabled = false;
      
      // Subscribe to LIDAR data
      console.log('Subscribing to LIDAR topic...');
      rtc.channel.send(JSON.stringify({
        type: "subscribe",
        topic: "rt/utlidar/voxel_map_compressed"
      }));
      
    } else if (state === 'failed' || state === 'disconnected') {
      status.innerHTML = '<span class="disconnected">● Disconnected</span>';
      connectBtn.textContent = 'Connect';
      connectBtn.disabled = false;
    }
  };
  
  rtc.initSDP();
}

function handleIncomingData(data) {
  console.log('Received data:', data.type);
  
  if (data.type === 'validation' && data.data === 'Validation Ok.') {
    console.log('Validation successful');
  }
  
  if (data.type === 'msg' && data.topic === 'rt/utlidar/voxel_map_compressed') {
    console.log('Received LIDAR data');
    processLidarData(data.data);
  }
}

function processLidarData(binaryData) {
  try {
    // Parse binary data format
    const jsonLength = binaryData[0];
    const jsonOffset = 4;
    const jsonString = String.fromCharCode.apply(null, binaryData.slice(jsonOffset, jsonOffset + jsonLength));
    const jsonData = JSON.parse(jsonString);
    
    const voxelData = binaryData.slice(jsonOffset + jsonLength);
    
    console.log('LIDAR data:', {
      resolution: jsonData.data.resolution,
      origin: jsonData.data.origin,
      width: jsonData.data.width,
      voxelBytes: voxelData.length
    });
    
    // Generate geometry from voxel data
    const geometryData = voxelWorld.generateGeometryData(
      voxelData,
      [jsonData.data.width, jsonData.data.width, 30], // dimensions
      jsonData.data.resolution,
      jsonData.data.origin
    );
    
    // Update 3D visualization
    voxelWorld.updateMesh(geometryData, jsonData.data.resolution, jsonData.data.origin);
    
  } catch (error) {
    console.error('Error processing LIDAR data:', error);
  }
}

// Load saved values
function loadSavedValues() {
  const savedIP = localStorage.getItem('lidar-robotIP');
  const savedToken = localStorage.getItem('lidar-token');
  
  if (savedIP) document.getElementById('robot-ip').value = savedIP;
  if (savedToken) document.getElementById('token').value = savedToken;
}

// Make functions global
window.connectToRobot = connectToRobot;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  loadSavedValues();
  init();
  animate();
});