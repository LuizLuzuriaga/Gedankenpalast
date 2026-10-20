/**
 * Gedankenpalast - El Palacio de la Memoria · Laniakea
 * Visualización 3D interactiva del Supercúmulo Cósmico y el Palacio de la Memoria
 */

// --- 1. SETUP DE ESCENA, CÁMARA Y RENDERER ---
const container = document.getElementById('webgl-container');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x020307, 0.0006);

const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 1, 6000);
const DEFAULT_OUTSIDE_CAM = { x: 0, y: 25, z: 980 };
camera.position.set(DEFAULT_OUTSIDE_CAM.x, DEFAULT_OUTSIDE_CAM.y, DEFAULT_OUTSIDE_CAM.z);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.3;
container.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 40;
controls.maxDistance = 2600;
controls.rotateSpeed = 0.65;
controls.zoomSpeed = 0.9;

// --- 2. GENERADOR PROCEDURAL DE TEXTURAS GLOW (Canvas) ---
function createGlowTexture(size = 128) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const center = size / 2;
    const gradient = ctx.createRadialGradient(center, center, 0, center, center, center);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.18, 'rgba(240, 248, 255, 0.9)');
    gradient.addColorStop(0.45, 'rgba(125, 210, 255, 0.4)');
    gradient.addColorStop(0.75, 'rgba(65, 145, 255, 0.08)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}

const particleTexture = createGlowTexture(128);

// --- 3. ESCENA EXTERIOR: LA ESFERA BLANCA CELESTIAL ---
const outsideGroup = new THREE.Group();
scene.add(outsideGroup);

// Esfera blanca central
const sphereRadius = 250;
const sphereGeo = new THREE.SphereGeometry(sphereRadius, 64, 64);
const sphereMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.98,
    side: THREE.FrontSide
});
const outerSphere = new THREE.Mesh(sphereGeo, sphereMat);
outsideGroup.add(outerSphere);

// Corona VFX Fresnel
const auraGeo = new THREE.SphereGeometry(sphereRadius * 1.15, 64, 64);
const auraShaderMat = new THREE.ShaderMaterial({
    uniforms: {
        glowColor: { value: new THREE.Color(0xdceeff) },
        viewVector: { value: camera.position },
        p: { value: 3.0 },
        c: { value: 0.38 },
        time: { value: 0.0 }
    },
    vertexShader: `
        uniform vec3 viewVector;
        uniform float c;
        uniform float p;
        varying float intensity;
        void main() {
            vec3 vNormal = normalize(normalMatrix * normal);
            vec3 vNormel = normalize(normalMatrix * viewVector);
            intensity = pow(c - dot(vNormal, vNormel), p);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform vec3 glowColor;
        varying float intensity;
        void main() {
            gl_FragColor = vec4(glowColor, intensity * 0.95);
        }
    `,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false
});
const sphereAura = new THREE.Mesh(auraGeo, auraShaderMat);
outsideGroup.add(sphereAura);

// Polvo estelar exterior
const outerDustCount = 2000;
const outerDustGeo = new THREE.BufferGeometry();
const outerDustPos = new Float32Array(outerDustCount * 3);
for (let i = 0; i < outerDustCount; i++) {
    const dist = 300 + Math.random() * 850;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    outerDustPos[i * 3] = dist * Math.sin(phi) * Math.cos(theta);
    outerDustPos[i * 3 + 1] = dist * Math.sin(phi) * Math.sin(theta);
    outerDustPos[i * 3 + 2] = dist * Math.cos(phi);
}
outerDustGeo.setAttribute('position', new THREE.BufferAttribute(outerDustPos, 3));
const outerDustMat = new THREE.PointsMaterial({
    size: 2.2,
    map: particleTexture,
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending,
    depthWrite: false
});
const outerDust = new THREE.Points(outerDustGeo, outerDustMat);
outsideGroup.add(outerDust);

// --- 4. ESCENA INTERIOR: SUPER CÚMULO LANIAKEA & V-WEB ---
const laniakeaGroup = new THREE.Group();
laniakeaGroup.visible = false;
scene.add(laniakeaGroup);

// Puntos de referencia topológica (Laniakea Supercluster Watershed)
const GREAT_ATTRACTOR_POS = new THREE.Vector3(-100, 20, 0); // Foco de convergencia
const MILKY_WAY_POS = new THREE.Vector3(220, -38, 25);      // Vía Láctea en rama secundaria
const CENTAURUS_POS = new THREE.Vector3(-40, 10, -15);
const VIRGO_POS = new THREE.Vector3(120, -15, 10);

// Cuenca sutil de Laniakea (Envolvente translúcida como en la foto de referencia)
const basinHullGeo = new THREE.DodecahedronGeometry(380, 2);
const hullPosAttr = basinHullGeo.attributes.position;
for (let i = 0; i < hullPosAttr.count; i++) {
    let x = hullPosAttr.getX(i);
    let y = hullPosAttr.getY(i);
    let z = hullPosAttr.getZ(i);
    // Morfología de la cuenca watershed
    x = x * 1.45 + (y > 0 ? 30 : -20);
    y = y * 0.95 + (x > 0 ? -25 : 15);
    z = z * 0.85;
    hullPosAttr.setXYZ(i, x, y, z);
}
basinHullGeo.computeVertexNormals();

const basinHullMat = new THREE.MeshBasicMaterial({
    color: 0x182a44,
    transparent: true,
    opacity: 0.08,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending
});
const basinHull = new THREE.Mesh(basinHullGeo, basinHullMat);
laniakeaGroup.add(basinHull);

// --- 5. LÍNEAS DE FLUJO SUAVES Y ELEGANTES (Streamlines con arcos orgánicos) ---
const streamLinesGroup = new THREE.Group();
laniakeaGroup.add(streamLinesGroup);

const NUM_STREAMLINES = 680;
const linePositions = [];
const lineColors = [];
const streamlinesCurves = [];

for (let i = 0; i < NUM_STREAMLINES; i++) {
    let p0, p1, p2, p3;
    const category = Math.random();
    
    if (category < 0.42) {
        // 1. CANOPIA SUPERIOR ARQUEADA (Fuente cósmica que arquea hacia abajo como en la foto)
        const u = Math.random();
        const arcX = -260 + u * 480 + (Math.random() - 0.5) * 40;
        const arcY = 160 + (1 - Math.pow(u - 0.35, 2)) * 140 + (Math.random() - 0.5) * 50;
        const arcZ = (Math.random() - 0.5) * 180;
        p0 = new THREE.Vector3(arcX, arcY, arcZ);
        
        // Puntos de control que guían la caída suave hacia la espina dorsal
        p1 = new THREE.Vector3(
            arcX * 0.7 - 20,
            arcY * 0.65 + 10,
            arcZ * 0.7
        );
        p2 = new THREE.Vector3(
            -80 + (u * 140) * 0.4,
            25 + (Math.random() - 0.5) * 15,
            arcZ * 0.25
        );
        p3 = new THREE.Vector3(
            -100 + (Math.random() - 0.5) * 30,
            20 + (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 30
        );
    } else if (category < 0.70) {
        // 2. RAMA DE LA VÍA LÁCTEA (Brazo horizontal extendido hacia la derecha)
        const u = Math.random();
        // Nace desde la derecha y converge hacia la Vía Láctea y luego hacia la espina
        const startX = 260 + Math.random() * 140;
        const startY = -40 + (Math.random() - 0.5) * 70;
        const startZ = 20 + (Math.random() - 0.5) * 90;
        p0 = new THREE.Vector3(startX, startY, startZ);
        
        // Pasa cerca de la Vía Láctea
        p1 = new THREE.Vector3(
            MILKY_WAY_POS.x + (Math.random() - 0.5) * 25,
            MILKY_WAY_POS.y + (Math.random() - 0.5) * 20,
            MILKY_WAY_POS.z + (Math.random() - 0.5) * 25
        );
        // Sigue por el puente de Virgo hacia el Atractor
        p2 = new THREE.Vector3(
            VIRGO_POS.x + (Math.random() - 0.5) * 30,
            VIRGO_POS.y + (Math.random() - 0.5) * 20,
            VIRGO_POS.z + (Math.random() - 0.5) * 30
        );
        p3 = new THREE.Vector3(
            CENTAURUS_POS.x + (Math.random() - 0.5) * 25,
            CENTAURUS_POS.y + (Math.random() - 0.5) * 20,
            CENTAURUS_POS.z + (Math.random() - 0.5) * 25
        );
    } else {
        // 3. AFLUENTES INFERIORES Y LATERALES
        const ang = Math.random() * Math.PI * 2;
        const dist = 240 + Math.random() * 160;
        const startX = Math.cos(ang) * dist * 1.2;
        const startY = -120 - Math.random() * 140;
        const startZ = Math.sin(ang) * dist * 0.8;
        p0 = new THREE.Vector3(startX, startY, startZ);
        
        p1 = new THREE.Vector3(
            startX * 0.5 - 30,
            startY * 0.45,
            startZ * 0.5
        );
        p2 = new THREE.Vector3(
            -70 + (Math.random() - 0.5) * 40,
            -10 + (Math.random() - 0.5) * 20,
            startZ * 0.2
        );
        p3 = new THREE.Vector3(
            GREAT_ATTRACTOR_POS.x + (Math.random() - 0.5) * 30,
            GREAT_ATTRACTOR_POS.y + (Math.random() - 0.5) * 20,
            GREAT_ATTRACTOR_POS.z + (Math.random() - 0.5) * 30
        );
    }
    
    const curve = new THREE.CubicBezierCurve3(p0, p1, p2, p3);
    streamlinesCurves.push(curve);
    
    // Trazado de segmentos
    const segments = 32;
    const pts = curve.getPoints(segments);
    
    for (let j = 0; j < pts.length - 1; j++) {
        const ptA = pts[j];
        const ptB = pts[j + 1];
        linePositions.push(ptA.x, ptA.y, ptA.z);
        linePositions.push(ptB.x, ptB.y, ptB.z);
        
        const progA = j / segments;
        const progB = (j + 1) / segments;
        
        // Gradiente de color: Celeste cósmico en periferia -> Blanco resplandeciente en la espina
        const colA = new THREE.Color().lerpColors(
            new THREE.Color(0x3566a8),
            new THREE.Color(0xffffff),
            Math.pow(progA, 1.6)
        );
        const colB = new THREE.Color().lerpColors(
            new THREE.Color(0x3566a8),
            new THREE.Color(0xffffff),
            Math.pow(progB, 1.6)
        );
        
        lineColors.push(colA.r, colA.g, colA.b);
        lineColors.push(colB.r, colB.g, colB.b);
    }
}

const streamlineGeo = new THREE.BufferGeometry();
streamlineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
streamlineGeo.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 3));

const streamlineMat = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.38,
    blending: THREE.AdditiveBlending,
    depthWrite: false
});

const streamlinesMesh = new THREE.LineSegments(streamlineGeo, streamlineMat);
streamLinesGroup.add(streamlinesMesh);

// --- 6. NUBE DE GALAXIAS Y POLVO CÓSMICO (140.000 partículas suaves) ---
const galaxyCount = 140000;
const galaxyGeo = new THREE.BufferGeometry();
const galaxyPos = new Float32Array(galaxyCount * 3);
const galaxyCols = new Float32Array(galaxyCount * 3);
const galaxySizes = new Float32Array(galaxyCount);

const galaxyPalette = [
    new THREE.Color(0xffffff), // Blanco estelar puro
    new THREE.Color(0xebf5ff), // Blanco azulado brillante
    new THREE.Color(0x8ae0ff), // Cyan eléctrico
    new THREE.Color(0x3b75d6), // Azul cósmico
    new THREE.Color(0xbba6ff), // Lavanda
    new THREE.Color(0xffdf88)  // Oro cálido (núcleo denso)
];

for (let i = 0; i < galaxyCount; i++) {
    let px, py, pz;
    let colIndex = 0;
    let pSize = Math.random() * 2.0 + 0.9;
    
    const dice = Math.random();
    
    if (dice < 0.78) {
        // Distribuidas a lo largo de las curvas de filamento
        const curve = streamlinesCurves[Math.floor(Math.random() * streamlinesCurves.length)];
        const t = Math.random();
        const pt = curve.getPoint(t);
        // Concentración más densa y delgada en la espina principal
        const spread = (1 - t * 0.65) * 12 * (Math.random() + 0.15);
        px = pt.x + (Math.random() - 0.5) * spread;
        py = pt.y + (Math.random() - 0.5) * spread;
        pz = pt.z + (Math.random() - 0.5) * spread;
        
        if (t > 0.8) {
            colIndex = Math.random() > 0.3 ? 0 : 5; // Blanco o dorado
            pSize += 1.4;
        } else if (t > 0.45) {
            colIndex = Math.random() > 0.5 ? 1 : 2; // Blanco azulado o Cyan
            pSize += 0.8;
        } else {
            colIndex = Math.random() > 0.6 ? 2 : 3; // Cyan o Azul
        }
    } else if (dice < 0.92) {
        // En los núcleos de atracción (Gran Atractor / Vía Láctea / Centaurus)
        let target = GREAT_ATTRACTOR_POS;
        if (Math.random() < 0.3) target = MILKY_WAY_POS;
        else if (Math.random() < 0.5) target = CENTAURUS_POS;
        
        const rad = Math.pow(Math.random(), 2.2) * 50;
        const th = Math.random() * Math.PI * 2;
        const ph = Math.acos((Math.random() * 2) - 1);
        
        px = target.x + rad * Math.sin(ph) * Math.cos(th);
        py = target.y + rad * Math.sin(ph) * Math.sin(th) * 0.65;
        pz = target.z + rad * Math.cos(ph);
        
        colIndex = target === MILKY_WAY_POS ? 0 : (Math.random() > 0.4 ? 0 : 5);
        pSize += 1.6;
    } else {
        // Galaxias de fondo
        const rad = Math.random() * 340;
        const th = Math.random() * Math.PI * 2;
        const ph = Math.acos((Math.random() * 2) - 1);
        px = rad * Math.sin(ph) * Math.cos(th) * 1.3;
        py = rad * Math.sin(ph) * Math.sin(th) * 0.85;
        pz = rad * Math.cos(ph) * 0.9;
        colIndex = 3;
        pSize *= 0.7;
    }
    
    galaxyPos[i * 3] = px;
    galaxyPos[i * 3 + 1] = py;
    galaxyPos[i * 3 + 2] = pz;
    
    const c = galaxyPalette[colIndex];
    galaxyCols[i * 3] = c.r;
    galaxyCols[i * 3 + 1] = c.g;
    galaxyCols[i * 3 + 2] = c.b;
    galaxySizes[i] = pSize;
}

galaxyGeo.setAttribute('position', new THREE.BufferAttribute(galaxyPos, 3));
galaxyGeo.setAttribute('color', new THREE.BufferAttribute(galaxyCols, 3));

const galaxyMat = new THREE.PointsMaterial({
    size: 2.2,
    vertexColors: true,
    map: particleTexture,
    transparent: true,
    opacity: 0.94,
    blending: THREE.AdditiveBlending,
    depthWrite: false
});

const galaxyPoints = new THREE.Points(galaxyGeo, galaxyMat);
laniakeaGroup.add(galaxyPoints);

// --- 7. MARCADORES DESTACADOS (Vía Láctea y Gran Atractor) ---
const mwMarkerGeo = new THREE.SphereGeometry(3.8, 32, 32);
const mwMarkerMat = new THREE.MeshBasicMaterial({
    color: 0xff3377,
    blending: THREE.AdditiveBlending
});
const mwMarker = new THREE.Mesh(mwMarkerGeo, mwMarkerMat);
mwMarker.position.copy(MILKY_WAY_POS);
laniakeaGroup.add(mwMarker);

const mwHaloGeo = new THREE.RingGeometry(5.0, 8.5, 32);
const mwHaloMat = new THREE.MeshBasicMaterial({
    color: 0xff3377,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending
});
const mwHalo = new THREE.Mesh(mwHaloGeo, mwHaloMat);
mwMarker.add(mwHalo);

const attractorMarkerGeo = new THREE.SphereGeometry(8, 32, 32);
const attractorMarkerMat = new THREE.MeshBasicMaterial({
    color: 0x4fe8ff,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending
});
const attractorMarker = new THREE.Mesh(attractorMarkerGeo, attractorMarkerMat);
attractorMarker.position.copy(GREAT_ATTRACTOR_POS);
laniakeaGroup.add(attractorMarker);

// --- 8. PULSOS DE ENERGÍA FLUIDOS A LO LARGO DE LOS FILAMENTOS ---
const pulseCount = 750;
const pulseGeo = new THREE.BufferGeometry();
const pulsePos = new Float32Array(pulseCount * 3);
const pulseData = [];

for (let i = 0; i < pulseCount; i++) {
    const curve = streamlinesCurves[Math.floor(Math.random() * streamlinesCurves.length)];
    const speed = 0.0018 + Math.random() * 0.0032;
    const t = Math.random();
    pulseData.push({ curve, t, speed });
    const pt = curve.getPoint(t);
    pulsePos[i * 3] = pt.x;
    pulsePos[i * 3 + 1] = pt.y;
    pulsePos[i * 3 + 2] = pt.z;
}
pulseGeo.setAttribute('position', new THREE.BufferAttribute(pulsePos, 3));
const pulseMat = new THREE.PointsMaterial({
    size: 4.8,
    color: 0xffffff,
    map: particleTexture,
    transparent: true,
    opacity: 0.88,
    blending: THREE.AdditiveBlending,
    depthWrite: false
});
const pulses = new THREE.Points(pulseGeo, pulseMat);
laniakeaGroup.add(pulses);

// --- 9. INTERACCIÓN Y TRANSICIONES ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let isInside = false;
let isTransitioning = false;
let autoRotate = true;

const entranceHud = document.getElementById('entrance-hud');
const palaceHud = document.getElementById('palace-hud');
const labelMw = document.getElementById('label-milkyway');
const labelAttractor = document.getElementById('label-attractor');
const labelLaniakea = document.getElementById('label-laniakea');

const tempVec = new THREE.Vector3();
function updateLabelPosition(meshPos, element, offsetX = 0, offsetY = 0) {
    if (!element || !isInside) return;
    tempVec.copy(meshPos);
    tempVec.applyMatrix4(laniakeaGroup.matrixWorld);
    tempVec.project(camera);
    
    if (tempVec.z > 1) {
        element.style.opacity = '0';
        return;
    }
    
    const x = (tempVec.x * 0.5 + 0.5) * window.innerWidth + offsetX;
    const y = (-(tempVec.y * 0.5) + 0.5) * window.innerHeight + offsetY;
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
    element.style.opacity = '1';
}

// Hover sobre la esfera exterior
window.addEventListener('mousemove', (e) => {
    if (isInside || isTransitioning) return;
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObject(outerSphere);
    if (hits.length > 0) {
        document.body.style.cursor = 'pointer';
        auraShaderMat.uniforms.p.value = 2.3;
    } else {
        document.body.style.cursor = 'default';
        auraShaderMat.uniforms.p.value = 3.0;
    }
});

// Doble clic para entrar
window.addEventListener('dblclick', (e) => {
    if (isInside || isTransitioning) return;
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObject(outerSphere);
    if (hits.length > 0) {
        enterPalace();
    }
});

function enterPalace() {
    isTransitioning = true;
    document.body.style.cursor = 'default';
    
    entranceHud.classList.remove('visible');
    entranceHud.classList.add('hidden');
    
    laniakeaGroup.visible = true;
    laniakeaGroup.scale.set(0.04, 0.04, 0.04);
    
    playCosmicWarp();
    
    gsap.to(camera.position, {
        duration: 3.2,
        x: 30,
        y: 50,
        z: 420,
        ease: "power3.inOut",
        onUpdate: () => {
            controls.target.set(0, 0, 0);
            controls.update();
        }
    });
    
    gsap.to(laniakeaGroup.scale, {
        duration: 3.2,
        x: 1,
        y: 1,
        z: 1,
        ease: "power2.out"
    });
    
    gsap.to(sphereMat, {
        duration: 1.8,
        delay: 0.8,
        opacity: 0
    });
    gsap.to(outerDustMat, {
        duration: 1.5,
        delay: 0.5,
        opacity: 0,
        onComplete: () => {
            outsideGroup.visible = false;
            isInside = true;
            isTransitioning = false;
            
            palaceHud.classList.remove('hidden');
            palaceHud.classList.add('visible');
            labelMw.classList.remove('hidden');
            labelAttractor.classList.remove('hidden');
            labelLaniakea.classList.remove('hidden');
        }
    });
}

function exitToOutside() {
    if (!isInside || isTransitioning) return;
    isTransitioning = true;
    
    palaceHud.classList.remove('visible');
    palaceHud.classList.add('hidden');
    labelMw.classList.add('hidden');
    labelAttractor.classList.add('hidden');
    labelLaniakea.classList.add('hidden');
    
    outsideGroup.visible = true;
    sphereMat.opacity = 0;
    outerDustMat.opacity = 0;
    
    gsap.to(camera.position, {
        duration: 2.8,
        x: DEFAULT_OUTSIDE_CAM.x,
        y: DEFAULT_OUTSIDE_CAM.y,
        z: DEFAULT_OUTSIDE_CAM.z,
        ease: "power3.inOut",
        onUpdate: () => {
            controls.target.set(0, 0, 0);
            controls.update();
        }
    });
    
    gsap.to(sphereMat, {
        duration: 2.0,
        delay: 0.8,
        opacity: 0.98
    });
    gsap.to(outerDustMat, {
        duration: 2.0,
        delay: 0.8,
        opacity: 0.55
    });
    
    gsap.to(laniakeaGroup.scale, {
        duration: 2.0,
        x: 0.1,
        y: 0.1,
        z: 0.1,
        ease: "power2.in",
        onComplete: () => {
            laniakeaGroup.visible = false;
            isInside = false;
            isTransitioning = false;
            
            entranceHud.classList.remove('hidden');
            entranceHud.classList.add('visible');
        }
    });
}

// --- 10. CONTROLES DEL HUD INTERIOR ---
document.getElementById('btn-exit').addEventListener('click', exitToOutside);

document.getElementById('btn-focus-mw').addEventListener('click', () => {
    if (!isInside) return;
    gsap.to(camera.position, {
        duration: 2.2,
        x: MILKY_WAY_POS.x + 35,
        y: MILKY_WAY_POS.y + 20,
        z: MILKY_WAY_POS.z + 75,
        ease: "power2.inOut"
    });
    gsap.to(controls.target, {
        duration: 2.2,
        x: MILKY_WAY_POS.x,
        y: MILKY_WAY_POS.y,
        z: MILKY_WAY_POS.z,
        ease: "power2.inOut"
    });
    document.getElementById('scene-status').textContent = "Enfocando Vía Láctea (~27.000 a.l. al agujero negro Sgr A*)";
});

document.getElementById('btn-focus-attractor').addEventListener('click', () => {
    if (!isInside) return;
    gsap.to(camera.position, {
        duration: 2.2,
        x: GREAT_ATTRACTOR_POS.x + 25,
        y: GREAT_ATTRACTOR_POS.y + 35,
        z: GREAT_ATTRACTOR_POS.z + 110,
        ease: "power2.inOut"
    });
    gsap.to(controls.target, {
        duration: 2.2,
        x: GREAT_ATTRACTOR_POS.x,
        y: GREAT_ATTRACTOR_POS.y,
        z: GREAT_ATTRACTOR_POS.z,
        ease: "power2.inOut"
    });
    document.getElementById('scene-status').textContent = "Enfocando Gran Atractor (Foco gravitatorio en Hydra-Centauro)";
});

const btnFilaments = document.getElementById('btn-toggle-filaments');
btnFilaments.addEventListener('click', () => {
    streamLinesGroup.visible = !streamLinesGroup.visible;
    pulses.visible = streamLinesGroup.visible;
    btnFilaments.classList.toggle('active', streamLinesGroup.visible);
});

const btnRotate = document.getElementById('btn-toggle-rotate');
btnRotate.addEventListener('click', () => {
    autoRotate = !autoRotate;
    btnRotate.classList.toggle('active', autoRotate);
});

labelMw.addEventListener('click', () => {
    document.getElementById('btn-focus-mw').click();
});
labelAttractor.addEventListener('click', () => {
    document.getElementById('btn-focus-attractor').click();
});

// --- 11. SINTETIZADOR DE AMBIENTE CÓSMICO (Web Audio API) ---
let audioCtx = null;
let soundEnabled = false;
let masterGain = null;
const btnSound = document.getElementById('btn-toggle-sound');

function initAudio() {
    if (audioCtx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();
    
    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
    masterGain.connect(audioCtx.destination);
    
    const freqs = [54, 108, 162];
    freqs.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const oscGain = audioCtx.createGain();
        osc.type = idx === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        
        const lfo = audioCtx.createOscillator();
        const lfoGain = audioCtx.createGain();
        lfo.frequency.setValueAtTime(0.08 + idx * 0.04, audioCtx.currentTime);
        lfoGain.gain.setValueAtTime(freq * 0.05, audioCtx.currentTime);
        lfo.connect(osc.frequency);
        lfo.start();
        
        oscGain.gain.setValueAtTime(0.08 / (idx + 1), audioCtx.currentTime);
        osc.connect(oscGain);
        oscGain.connect(masterGain);
        osc.start();
    });
}

function playCosmicWarp() {
    if (!audioCtx || !soundEnabled) return;
    const warpOsc = audioCtx.createOscillator();
    const warpGain = audioCtx.createGain();
    warpOsc.type = 'sine';
    warpOsc.frequency.setValueAtTime(80, audioCtx.currentTime);
    warpOsc.frequency.exponentialRampToValueAtTime(320, audioCtx.currentTime + 3.0);
    
    warpGain.gain.setValueAtTime(0.01, audioCtx.currentTime);
    warpGain.gain.linearRampToValueAtTime(0.12, audioCtx.currentTime + 1.5);
    warpGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 3.2);
    
    warpOsc.connect(warpGain);
    warpGain.connect(masterGain);
    warpOsc.start();
    warpOsc.stop(audioCtx.currentTime + 3.3);
}

btnSound.addEventListener('click', () => {
    initAudio();
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    soundEnabled = !soundEnabled;
    if (soundEnabled) {
        masterGain.gain.linearRampToValueAtTime(0.25, audioCtx.currentTime + 1.5);
        btnSound.innerHTML = '<span class="btn-icon">🔊</span> Audio ON';
        btnSound.classList.add('active');
    } else {
        masterGain.gain.linearRampToValueAtTime(0.0, audioCtx.currentTime + 1.0);
        btnSound.innerHTML = '<span class="btn-icon">🔈</span> Audio';
        btnSound.classList.remove('active');
    }
});

// --- 12. BUCLE PRINCIPAL DE ANIMACIÓN ---
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    const time = clock.getElapsedTime();
    
    if (outsideGroup.visible) {
        const breath = 1 + Math.sin(time * 1.8) * 0.012;
        outerSphere.scale.set(breath, breath, breath);
        sphereAura.scale.set(breath * 1.02, breath * 1.02, breath * 1.02);
        
        outerDust.rotation.y = time * 0.015;
        outerDust.rotation.x = time * 0.008;
    }
    
    if (laniakeaGroup.visible) {
        if (autoRotate && !isTransitioning) {
            laniakeaGroup.rotation.y += delta * 0.035;
        }
        
        const haloScale = 1 + Math.sin(time * 4) * 0.25;
        mwHalo.scale.set(haloScale, haloScale, 1);
        mwHalo.lookAt(camera.position);
        
        const posAttr = pulses.geometry.attributes.position;
        for (let i = 0; i < pulseCount; i++) {
            const p = pulseData[i];
            p.t += p.speed;
            if (p.t > 1) p.t = 0;
            const pt = p.curve.getPoint(p.t);
            posAttr.setXYZ(i, pt.x, pt.y, pt.z);
        }
        posAttr.needsUpdate = true;
        
        updateLabelPosition(MILKY_WAY_POS, labelMw, 20, -10);
        updateLabelPosition(GREAT_ATTRACTOR_POS, labelAttractor, 25, -10);
        updateLabelPosition(new THREE.Vector3(-140, -180, 0), labelLaniakea, 0, 0);
    }
    
    controls.update();
    renderer.render(scene, camera);
}

animate();

// --- 13. RESPONSIVE RESIZE ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
