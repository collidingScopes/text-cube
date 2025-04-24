// Set up scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);
// scene.background = new THREE.Color(0xeaeaea);

// Set up camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 4;
camera.position.y = 2;
camera.lookAt(0, 0, 0);

// Set up renderer with shadow support
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Softer shadows
document.body.appendChild(renderer.domElement);

// Add lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

// Directional light for dramatic shadows
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 5);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 50;
directionalLight.shadow.camera.left = -10;
directionalLight.shadow.camera.right = 10;
directionalLight.shadow.camera.top = 10;
directionalLight.shadow.camera.bottom = -10;
directionalLight.shadow.bias = -0.0005;
scene.add(directionalLight);

// Create floor plane for shadow
const floorGeometry = new THREE.PlaneGeometry(30, 30);
const floorMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xeeeeee,
    roughness: 0.8
});
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2; // Rotate to be horizontal
floor.position.y = -1.5; // Position below the cube
floor.receiveShadow = true; // Enable shadow receiving
scene.add(floor);

// Current colors
let currentFaceColor = "#ffffff";
let currentTextColor = "#0000FF";
let currentBorderColor = "#999999";
let showBorder = false;
let currentFont = "Helvetica";

// Store fixed random alignments for each face
const faceAlignments = [];
for (let i = 0; i < 6; i++) {
    const alignments = ['left', 'right',];
    const baselines = ['top', 'bottom',];
    faceAlignments.push({
        textAlign: alignments[Math.floor(Math.random() * alignments.length)],
        textBaseline: baselines[Math.floor(Math.random() * baselines.length)]
    });
}

// Face materials
const materials = [];
const faceTexts = [
    "this is not a cube", "you can just do things", "hello world", "don't be a square", "you are what you vibe", "@threejs"
];

// Create canvas textures for each face
for (let i = 0; i < 6; i++) {
    const texture = createTextTexture(faceTexts[i], currentFaceColor, currentTextColor, i);
    // Use MeshLambertMaterial instead of Basic to respond to lighting
    const material = new THREE.MeshLambertMaterial({ map: texture });
    materials.push(material);
}

// Create cube
const geometry = new THREE.BoxGeometry(2, 2, 2);
const cube = new THREE.Mesh(geometry, materials);
cube.castShadow = true; // Enable shadow casting
cube.position.y = 0; // Position above the floor
scene.add(cube);

// Controls for rotation
let isDragging = false;
let previousMousePosition = {
    x: 0,
    y: 0
};
let rotationSpeed = 0.01; // Increased from 0.005 for more sensitivity
let rotationMomentum = {
    x: 0,
    y: 0
};
const momentumFactor = 0.95; // How quickly momentum decreases (0-1)

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Mouse events for rotation
renderer.domElement.addEventListener('mousedown', (e) => {
    isDragging = true;
    previousMousePosition = {
        x: e.clientX,
        y: e.clientY
    };
});

renderer.domElement.addEventListener('mousemove', (e) => {
    if (isDragging) {
        const deltaMove = {
            x: e.clientX - previousMousePosition.x,
            y: e.clientY - previousMousePosition.y
        };
        
        // Apply rotation directly
        cube.rotation.y += deltaMove.x * rotationSpeed;
        cube.rotation.x += deltaMove.y * rotationSpeed;
        
        // Store momentum for continued rotation after release
        rotationMomentum.x = deltaMove.x * rotationSpeed * 0.8;
        rotationMomentum.y = deltaMove.y * rotationSpeed * 0.8;
        
        previousMousePosition = {
            x: e.clientX,
            y: e.clientY
        };
    }
});

renderer.domElement.addEventListener('mouseup', () => {
    isDragging = false;
    // Don't reset the momentum - let it continue
});

renderer.domElement.addEventListener('mouseleave', () => {
    isDragging = false;
    // Don't reset the momentum - let it continue
});

// Touch events for mobile support
renderer.domElement.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
        isDragging = true;
        previousMousePosition = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY
        };
    }
});

renderer.domElement.addEventListener('touchmove', (e) => {
    if (isDragging && e.touches.length === 1) {
        const deltaMove = {
            x: e.touches[0].clientX - previousMousePosition.x,
            y: e.touches[0].clientY - previousMousePosition.y
        };
        
        // Apply rotation directly
        cube.rotation.y += deltaMove.x * rotationSpeed;
        cube.rotation.x += deltaMove.y * rotationSpeed;
        
        // Store momentum for continued rotation after release
        rotationMomentum.x = deltaMove.x * rotationSpeed * 0.8;
        rotationMomentum.y = deltaMove.y * rotationSpeed * 0.8;
        
        previousMousePosition = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY
        };
    }
});

renderer.domElement.addEventListener('touchend', () => {
    isDragging = false;
    // Don't reset the momentum - let it continue
});

// Control for adjusting shadow intensity and angle
const addShadowControls = () => {
    const controlsDiv = document.getElementById('controls');
    
    // Shadow section
    const shadowSection = document.createElement('div');
    shadowSection.className = 'shadow-controls';
    
    // Shadow section label
    const sectionLabel = document.createElement('div');
    sectionLabel.className = 'section-label';
    sectionLabel.textContent = 'Shadow';
    shadowSection.appendChild(sectionLabel);
    
    // Light intensity slider
    const intensityContainer = document.createElement('div');
    intensityContainer.className = 'slider-container';
    
    const intensityLabel = document.createElement('label');
    intensityLabel.htmlFor = 'shadow-intensity';
    intensityLabel.textContent = 'Intensity:';
    
    const intensitySlider = document.createElement('input');
    intensitySlider.type = 'range';
    intensitySlider.id = 'shadow-intensity';
    intensitySlider.min = '0';
    intensitySlider.max = '2';
    intensitySlider.step = '0.1';
    intensitySlider.value = '1';
    
    intensityContainer.appendChild(intensityLabel);
    intensityContainer.appendChild(intensitySlider);
    shadowSection.appendChild(intensityContainer);
    
    // Light angle slider
    const angleContainer = document.createElement('div');
    angleContainer.className = 'slider-container';
    
    const angleLabel = document.createElement('label');
    angleLabel.htmlFor = 'shadow-angle';
    angleLabel.textContent = 'Angle:';
    
    const angleSlider = document.createElement('input');
    angleSlider.type = 'range';
    angleSlider.id = 'shadow-angle';
    angleSlider.min = '0';
    angleSlider.max = '360';
    angleSlider.step = '5';
    angleSlider.value = '45';
    
    angleContainer.appendChild(angleLabel);
    angleContainer.appendChild(angleSlider);
    shadowSection.appendChild(angleContainer);
    
    // Shadow blur slider
    const blurContainer = document.createElement('div');
    blurContainer.className = 'slider-container';
    
    const blurLabel = document.createElement('label');
    blurLabel.htmlFor = 'shadow-blur';
    blurLabel.textContent = 'Softness:';
    
    const blurSlider = document.createElement('input');
    blurSlider.type = 'range';
    blurSlider.id = 'shadow-blur';
    blurSlider.min = '0';
    blurSlider.max = '20';
    blurSlider.step = '1';
    blurSlider.value = '5';
    
    blurContainer.appendChild(blurLabel);
    blurContainer.appendChild(blurSlider);
    shadowSection.appendChild(blurContainer);
    
    // Add the shadow controls to the main controls
    controlsDiv.appendChild(shadowSection);
    
    // Event listeners
    intensitySlider.addEventListener('input', function() {
        directionalLight.intensity = parseFloat(this.value);
    });
    
    angleSlider.addEventListener('input', function() {
        const angle = parseInt(this.value) * Math.PI / 180;
        const radius = 10;
        directionalLight.position.x = Math.cos(angle) * radius;
        directionalLight.position.z = Math.sin(angle) * radius;
    });
    
    blurSlider.addEventListener('input', function() {
        const value = parseInt(this.value);
        directionalLight.shadow.radius = value * 0.5;
        directionalLight.shadow.bias = -0.0005 - (value * 0.0001);
    });
};

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Apply momentum when not being dragged
    if (!isDragging) {
        cube.rotation.x += rotationMomentum.y;
        cube.rotation.y += rotationMomentum.x;
        
        // Gradually reduce momentum
        rotationMomentum.x *= momentumFactor;
        rotationMomentum.y *= momentumFactor;
        
        // Add very subtle auto-rotation only when momentum is almost gone
        if (Math.abs(rotationMomentum.x) < 0.0005 && Math.abs(rotationMomentum.y) < 0.0005) {
            cube.rotation.y += 0.001;
            cube.rotation.x += 0.0005;
        }
    }
    
    renderer.render(scene, camera);
}

// Function to create text texture - FIXED VERSION
function createTextTexture(text, backgroundColor, textColor, faceIndex) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const size = 256;
    canvas.width = size;
    canvas.height = size;
    
    // Fill background
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, size, size);
    
    // Draw border if enabled
    if (showBorder) {
        context.strokeStyle = currentBorderColor;
        context.lineWidth = 2;
        context.strokeRect(2, 2, size - 2, size - 2);
    }
    
    // Configure text
    context.fillStyle = textColor;
    context.font = `bold 48px ${currentFont}`;
    
    // Use the stored alignment for this face
    const alignment = faceAlignments[faceIndex];
    const textAlign = alignment.textAlign;
    const textBaseline = alignment.textBaseline;
    
    context.textAlign = textAlign;
    context.textBaseline = textBaseline;
    
    // Break text into multiple lines if too long
    const maxLineWidth = size - 40;
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];
    
    for(let i = 1; i < words.length; i++) {
        const width = context.measureText(currentLine + ' ' + words[i]).width;
        if (width < maxLineWidth) {
            currentLine += ' ' + words[i];
        } else {
            lines.push(currentLine);
            currentLine = words[i];
        }
    }
    lines.push(currentLine);
    
    // Calculate total text height
    const lineHeight = 52;
    const totalTextHeight = lines.length * lineHeight;
    
    // Set text position based on alignment with fixes for multi-line text
    let x = size / 2; // Default center
    let y = size / 2; // Default middle
    
    // Adjust x position based on alignment
    if (textAlign === 'left') x = 20;
    if (textAlign === 'right') x = size - 20;
    
    // FIX: Adjust y position based on baseline and total text height
    if (textBaseline === 'top') {
        y = 20 + lineHeight; // Adjust for first line
    } else if (textBaseline === 'bottom') {
        // Position y so all lines fit within the canvas
        y = size - 20 - ((lines.length - 1) * lineHeight);
    } else { // middle
        y = (size / 2) - (totalTextHeight / 2) + lineHeight;
    }
    
    // Draw each line of text
    for(let i = 0; i < lines.length; i++) {
        context.fillText(lines[i], x, y + i * lineHeight);
    }
    
    // Create texture from canvas
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    
    return texture;
}

// Handle color selection
// Color pickers
document.getElementById('face-color-picker').addEventListener('input', function() {
    currentFaceColor = this.value;
    updateCube();
});

document.getElementById('text-color-picker').addEventListener('input', function() {
    currentTextColor = this.value;
    updateCube();
});

document.getElementById('border-color-picker').addEventListener('input', function() {
    currentBorderColor = this.value;
    updateCube();
});

// Border toggle
document.getElementById('wireframe-toggle').addEventListener('change', function() {
    showBorder = this.checked;
    updateCube();
});

// Font selection
document.getElementById('font-select').addEventListener('change', function() {
    currentFont = this.value;
    updateCube();
});

// Randomize alignment button
document.getElementById('randomize-alignment').addEventListener('click', function() {
    // Create new random alignments for each face
    for (let i = 0; i < 6; i++) {
        const alignments = ['left', 'right', 'center'];
        const baselines = ['top', 'middle', 'bottom'];
        faceAlignments[i] = {
            textAlign: alignments[Math.floor(Math.random() * alignments.length)],
            textBaseline: baselines[Math.floor(Math.random() * baselines.length)]
        };
    }
    // Update the cube with new alignments
    updateCube();
});

// Function to update cube
function updateCube() {
    const texts = [
        document.getElementById('face-front').value,
        document.getElementById('face-back').value,
        document.getElementById('face-top').value,
        document.getElementById('face-bottom').value,
        document.getElementById('face-left').value,
        document.getElementById('face-right').value
    ];
    
    for (let i = 0; i < 6; i++) {
        const texture = createTextTexture(texts[i], currentFaceColor, currentTextColor, i);
        cube.material[i].map.dispose();
        cube.material[i].map = texture;
        cube.material[i].needsUpdate = true;
    }
}

// Add input event listeners to all text inputs
document.querySelectorAll('input[type="text"]').forEach(input => {
    input.addEventListener('input', updateCube);
});

// Add shadow controls after DOM is loaded
window.addEventListener('DOMContentLoaded', addShadowControls);

animate();