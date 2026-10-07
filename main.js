const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.0015);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.set(0, 0, 800);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxDistance = 1500;

const sphereGeometry = new THREE.SphereGeometry(300, 64, 64);
const sphereMaterial = new THREE.MeshBasicMaterial({ 
    color: 0xffffff, 
    transparent: true,
    opacity: 1,
    side: THREE.FrontSide
});
const outerSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(outerSphere);

const webGroup = new THREE.Group();
webGroup.visible = false; 
scene.add(webGroup);

const particleCount = 150000;
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);
const colors = new Float32Array(particleCount * 3);

const colorPalette = [
    new THREE.Color(0x88ccff),
    new THREE.Color(0xffffff),
    new THREE.Color(0x0055ff),
    new THREE.Color(0xaa88ff),
    new THREE.Color(0xffffff)
];

for (let i = 0; i < particleCount; i++) {
    const radius = Math.random() * 280;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    
    const filamentBranch = Math.floor(Math.random() * 6);
    let x, y, z;
    
    if (Math.random() > 0.4) {
        const angle = (filamentBranch / 6) * Math.PI * 2;
        const stretch = Math.pow(Math.random(), 2) * 280; 
        const spread = (1 - stretch/280) * 40;
        x = Math.cos(angle) * stretch + (Math.random() - 0.5) * spread;
        y = (Math.random() - 0.5) * stretch * 0.3 + (Math.random() - 0.5) * spread;
        z = Math.sin(angle) * stretch + (Math.random() - 0.5) * spread;
    } else {
        x = radius * Math.sin(phi) * Math.cos(theta);
        y = radius * Math.sin(phi) * Math.sin(theta);
        z = radius * Math.cos(phi);
    }

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
}

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const material = new THREE.PointsMaterial({
    size: 0.6,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending
});

const particles = new THREE.Points(geometry, material);
webGroup.add(particles);

const coreGeometry = new THREE.SphereGeometry(15, 32, 32);
const coreMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending });
const core = new THREE.Mesh(coreGeometry, coreMaterial);
webGroup.add(core);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let isInside = false;

window.addEventListener('dblclick', (event) => {
    if(isInside) return;
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(outerSphere);
    if (intersects.length > 0) {
        enterPalace();
    }
});

function enterPalace() {
    isInside = true;
    document.getElementById('ui-container').style.opacity = '0';
    webGroup.visible = true;
    
    gsap.to(camera.position, {
        duration: 3,
        x: 0,
        y: 20,
        z: 180,
        ease: "power3.inOut",
        onUpdate: () => {
            controls.target.set(0,0,0);
            controls.update();
        },
        onComplete: () => {
            gsap.to(sphereMaterial, { duration: 1, opacity: 0, onComplete: () => outerSphere.visible = false });
        }
    });
}

const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();
    
    if(webGroup.visible) {
        webGroup.rotation.y = time * 0.05;
        webGroup.rotation.z = time * 0.02;
    }
    
    if(!isInside) {
        const scale = 1 + Math.sin(time * 3) * 0.01;
        outerSphere.scale.set(scale, scale, scale);
    }

    controls.update();
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
