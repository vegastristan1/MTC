import * as THREE from 'three';
import { Hands } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';

// --- Scene Setup ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- Particle Shader Material ---
const particleCount = 10000;
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 10;
}
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const material = new THREE.ShaderMaterial({
    uniforms: {
        uTime: { value: 0 },
        uExpansion: { value: 0.0 }, // Controlled by hand gesture
        uColor: { value: new THREE.Color(0x00ffcc) }
    },
    vertexShader: `
        uniform float uTime;
        uniform float uExpansion;
        void main() {
            vec3 newPos = position + (normalize(position) * uExpansion * 2.0);
            vec4 mvPosition = modelViewMatrix * vec4(newPos, 1.0);
            gl_PointSize = 4.0 * (1.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
        }
    `,
    fragmentShader: `
        uniform vec3 uColor;
        void main() {
            if (length(gl_PointCoord - vec2(0.5)) > 0.5) discard;
            gl_FragColor = vec4(uColor, 1.0);
        }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending
});

const points = new THREE.Points(geometry, material);
scene.add(points);
camera.position.z = 5;

// --- MediaPipe Hand Tracking ---
const videoElement = document.getElementById('video-input');
const hands = new Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});

hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

hands.onResults((results) => {
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        
        // Calculate distance between Thumb Tip (4) and Index Tip (8)
        const thumb = landmarks[4];
        const index = landmarks[8];
        const distance = Math.sqrt(
            Math.pow(thumb.x - index.x, 2) + 
            Math.pow(thumb.y - index.y, 2)
        );

        // Map distance to Expansion Uniform (0.0 to 1.0)
        material.uniforms.uExpansion.value = THREE.MathUtils.lerp(
            material.uniforms.uExpansion.value, 
            distance * 5.0, 
            0.1 // Smoothing
        );
    }
});

const mediaCamera = new Camera(videoElement, {
    onFrame: async () => { await hands.send({ image: videoElement }); },
    width: 640,
    height: 480
});
mediaCamera.start();

// --- Animation Loop ---
function animate() {
    requestAnimationFrame(animate);
    material.uniforms.uTime.value += 0.01;
    renderer.render(scene, camera);
}
animate();