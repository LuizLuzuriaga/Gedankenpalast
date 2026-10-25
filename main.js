/**
 * Gedankenpalast - Atlas Topológico Actuarial & Singularidad Cognitiva
 * Integración Dual de Modelos 3D GLB (Skybox Nebula & Point Cloud)
 * con Red Filamentaria Cósmica (Estilo Laniakea / CF4 / Illustris) y KaTeX
 */

// --- 1. SETUP DE ESCENA, CÁMARA Y RENDERER ---
const container = document.getElementById('webgl-container');
const scene = new THREE.Scene();

const COLOR_BG_OUTSIDE = new THREE.Color(0xf6f8fb);
const COLOR_BG_INSIDE = new THREE.Color(0x020409);

scene.background = COLOR_BG_OUTSIDE.clone();
scene.fog = new THREE.FogExp2(0xf6f8fb, 0.00045);

const camera = new THREE.PerspectiveCamera(54, window.innerWidth / window.innerHeight, 1, 15000);
const DEFAULT_OUTSIDE_CAM = { x: 0, y: 15, z: 920 };
camera.position.set(DEFAULT_OUTSIDE_CAM.x, DEFAULT_OUTSIDE_CAM.y, DEFAULT_OUTSIDE_CAM.z);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0xf6f8fb, 1);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.6;
container.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.055;
controls.minDistance = 25;
controls.maxDistance = 4500;
controls.rotateSpeed = 0.65;
controls.zoomSpeed = 0.85;

// --- 2. GENERADORES DE TEXTURAS PROCEDURALES (GLOW SPRITES) ---
function createGlowTexture(size = 128, colorStop = 'rgba(255, 255, 255, 1)') {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const center = size / 2;
    const gradient = ctx.createRadialGradient(center, center, 0, center, center, center);
    gradient.addColorStop(0, colorStop);
    gradient.addColorStop(0.18, 'rgba(235, 245, 255, 0.95)');
    gradient.addColorStop(0.42, 'rgba(60, 170, 255, 0.45)');
    gradient.addColorStop(0.75, 'rgba(20, 80, 255, 0.12)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}
const particleTexture = createGlowTexture(128);

function createAmberGlowTexture(size = 128) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const center = size / 2;
    const gradient = ctx.createRadialGradient(center, center, 0, center, center, center);
    gradient.addColorStop(0, 'rgba(255, 255, 240, 1)');
    gradient.addColorStop(0.20, 'rgba(255, 215, 90, 0.98)');
    gradient.addColorStop(0.50, 'rgba(255, 140, 25, 0.50)');
    gradient.addColorStop(0.80, 'rgba(220, 70, 0, 0.12)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}
const amberTexture = createAmberGlowTexture(128);

// --- 3. ESCENA EXTERIOR: VACÍO BLANCO & ESFERA OBSIDIANA ---
const outsideGroup = new THREE.Group();
scene.add(outsideGroup);

const sphereRadius = 230;
const blackSphereGeo = new THREE.SphereGeometry(sphereRadius, 64, 64);
const blackSphereMat = new THREE.MeshBasicMaterial({
    color: 0x05070d,
    transparent: true,
    opacity: 0.99
});
const blackSphere = new THREE.Mesh(blackSphereGeo, blackSphereMat);
outsideGroup.add(blackSphere);

// Sombra de contacto suave en el vacío blanco
const shadowGeo = new THREE.RingGeometry(12, sphereRadius * 1.35, 64);
const shadowMat = new THREE.MeshBasicMaterial({
    color: 0xd6dfea,
    transparent: true,
    opacity: 0.75,
    side: THREE.DoubleSide
});
const contactShadow = new THREE.Mesh(shadowGeo, shadowMat);
contactShadow.rotation.x = Math.PI / 2;
contactShadow.position.y = -sphereRadius - 5;
outsideGroup.add(contactShadow);

// Polvo exterior sutil
const outerDustCount = 750;
const outerDustGeo = new THREE.BufferGeometry();
const outerDustPos = new Float32Array(outerDustCount * 3);
for (let i = 0; i < outerDustCount; i++) {
    const dist = 280 + Math.random() * 560;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    outerDustPos[i * 3] = dist * Math.sin(phi) * Math.cos(theta);
    outerDustPos[i * 3 + 1] = dist * Math.sin(phi) * Math.sin(theta);
    outerDustPos[i * 3 + 2] = dist * Math.cos(phi);
}
outerDustGeo.setAttribute('position', new THREE.BufferAttribute(outerDustPos, 3));
const outerDustMat = new THREE.PointsMaterial({
    size: 2.2,
    color: 0x8898af,
    transparent: true,
    opacity: 0.45,
    depthWrite: false
});
const outerDust = new THREE.Points(outerDustGeo, outerDustMat);
outsideGroup.add(outerDust);

// --- 4. ESCENA INTERIOR: COSMOS OSCURO & MODELOS 3D GLB (AUTOSCALED) ---
const interiorGroup = new THREE.Group();
interiorGroup.visible = false;
scene.add(interiorGroup);

// Grupo para los dos modelos 3D GLB conjuntos
const gltfModelsGroup = new THREE.Group();
interiorGroup.add(gltfModelsGroup);

let skyboxMesh = null;
let cosmicPointCloud = null;

const gltfLoader = new THREE.GLTFLoader();

// A) MODELO 1: alien_space_nebula_2_skybox.glb (Nebulosa Cósmica 3D Envolvente)
gltfLoader.load('alien_space_nebula_2_skybox.glb', (gltf) => {
    skyboxMesh = gltf.scene;
    
    // Auto-escalado preciso para envolver todo el cosmos (Diámetro 9000)
    const box = new THREE.Box3().setFromObject(skyboxMesh);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 118;
    const scaleFactor = 9000 / maxDim;
    skyboxMesh.scale.set(scaleFactor, scaleFactor, scaleFactor);
    skyboxMesh.position.set(0, 0, 0);

    skyboxMesh.traverse((child) => {
        if (child.isMesh) {
            const mat = child.material;
            const tex = (mat && mat.emissiveMap) ? mat.emissiveMap : (mat ? mat.map : null);
            child.material = new THREE.MeshBasicMaterial({
                map: tex,
                side: THREE.BackSide,
                depthWrite: false,
                transparent: true,
                opacity: 0.95,
                fog: false
            });
        }
    });
    gltfModelsGroup.add(skyboxMesh);
    console.log(" alien_space_nebula_2_skybox.glb auto-escalado x" + Math.round(scaleFactor) + " (Diámetro: 9000)");
}, undefined, (err) => {
    console.warn("alien_space_nebula_2_skybox.glb error:", err);
});

// B) MODELO 2: need_some_space.glb (50.000 Puntos Astronómicos Reales)
gltfLoader.load('need_some_space.glb', (gltf) => {
    cosmicPointCloud = gltf.scene;
    cosmicPointCloud.traverse((child) => {
        if (child.isPoints) {
            child.geometry.center();
            child.material = new THREE.PointsMaterial({
                size: 4.8,
                vertexColors: true,
                map: particleTexture,
                transparent: true,
                opacity: 1.0,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
                fog: false
            });
        }
    });

    // Auto-escalado para abarcar toda la cuenca de Laniakea (Envergadura 780 unidades)
    const box = new THREE.Box3().setFromObject(cosmicPointCloud);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 4;
    const scaleFactor = 780 / maxDim;
    cosmicPointCloud.scale.set(scaleFactor, scaleFactor, scaleFactor);
    cosmicPointCloud.position.set(0, 0, 0);

    gltfModelsGroup.add(cosmicPointCloud);
    console.log(" need_some_space.glb auto-escalado x" + Math.round(scaleFactor) + " (Envergadura: 780, 50.000 puntos reales)");
}, undefined, (err) => {
    console.warn("need_some_space.glb error:", err);
});

// Cuenca de Laniakea (Envolvente de marea gravitacional)
const basinHullGeo = new THREE.DodecahedronGeometry(450, 2);
const hullPosAttr = basinHullGeo.attributes.position;
for (let i = 0; i < hullPosAttr.count; i++) {
    let x = hullPosAttr.getX(i);
    let y = hullPosAttr.getY(i);
    let z = hullPosAttr.getZ(i);
    x = x * 1.45 + (y > 0 ? 30 : -20);
    y = y * 0.95 + (x > 0 ? -25 : 15);
    z = z * 0.85;
    hullPosAttr.setXYZ(i, x, y, z);
}
basinHullGeo.computeVertexNormals();
const basinHullMat = new THREE.MeshBasicMaterial({
    color: 0x051532,
    transparent: true,
    opacity: 0.08,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    fog: false
});
const basinHull = new THREE.Mesh(basinHullGeo, basinHullMat);
interiorGroup.add(basinHull);

// --- 5. RED FILAMENTARIA CÓSMICA ORGANIZADA (V-WEB / LANIAKEA TOPOLOGY) ---
const streamLinesGroup = new THREE.Group();
interiorGroup.add(streamLinesGroup);

// Diccionario de posiciones de nodos
const nodeMap = {};
KNOWLEDGE_GRAPH.forEach(n => {
    nodeMap[n.id] = new THREE.Vector3(n.position.x, n.position.y, n.position.z);
});

// Grafo de conexiones topológicas (Autopistas macrodisciplinares)
const graphEdges = [
    // Núcleo hacia ramas principales
    ['gran_atractor', 'lee_carter'],
    ['gran_atractor', 'lundberg'],
    ['gran_atractor', 'chain_ladder'],
    ['gran_atractor', 'tarificacion_poisson_gamma'],
    ['gran_atractor', 'xgboost_tweedie'],
    ['gran_atractor', 'mcmc_bayesian'],
    ['gran_atractor', 'vasicek'],
    ['gran_atractor', 'black_scholes'],
    ['gran_atractor', 'alm_redington'],
    ['gran_atractor', 'calculo_ito'],
    ['gran_atractor', 'copulas'],
    // Rama Actuarial interna
    ['lundberg', 'tarificacion_poisson_gamma'],
    ['chain_ladder', 'lee_carter'],
    ['lee_carter', 'tarificacion_poisson_gamma'],
    ['lundberg', 'chain_ladder'],
    // Rama Data Science interna
    ['xgboost_tweedie', 'mcmc_bayesian'],
    ['mcmc_bayesian', 'bootstrap_resampling'],
    ['bootstrap_resampling', 'xgboost_tweedie'],
    // Rama Finanzas Cuantitativas interna
    ['vasicek', 'black_scholes'],
    ['black_scholes', 'alm_redington'],
    ['vasicek', 'kalman_filter'],
    ['kalman_filter', 'alm_redington'],
    // Puentes Transversales interdisciplinares
    ['calculo_ito', 'black_scholes'],
    ['calculo_ito', 'vasicek'],
    ['calculo_ito', 'lundberg'],
    ['copulas', 'chain_ladder'],
    ['copulas', 'black_scholes'],
    ['copulas', 'tarificacion_poisson_gamma'],
    ['copulas', 'xgboost_tweedie'],
    ['kalman_filter', 'mcmc_bayesian'],
    ['tarificacion_poisson_gamma', 'xgboost_tweedie']
];

const allCurves = [];
const linePositions = [];
const lineColors = [];

// Función para generar filamentos trenzados y ondulantes (Sinuous Braided Bundles)
function createFilamentBundle(startVec, endVec, strands = 14, maxOffset = 24) {
    const dir = new THREE.Vector3().subVectors(endVec, startVec);
    const length = dir.length();

    let up = new THREE.Vector3(0, 1, 0);
    if (Math.abs(dir.clone().normalize().dot(up)) > 0.9) {
        up.set(1, 0, 0);
    }
    const right = new THREE.Vector3().crossVectors(dir, up).normalize();
    const normal = new THREE.Vector3().crossVectors(dir, right).normalize();

    for (let s = 0; s < strands; s++) {
        const phi = (s / strands) * Math.PI * 2 + Math.random() * 0.4;
        const waveFreq = 2.4 + Math.random() * 1.8;
        const strandSpread = (Math.random() * 0.75 + 0.25) * maxOffset;

        // Control point 1 (1/3 camino)
        const p1 = startVec.clone().lerp(endVec, 0.33);
        const factor1 = Math.sin(Math.PI * 0.33);
        p1.addScaledVector(right, Math.cos(phi) * strandSpread * factor1);
        p1.addScaledVector(normal, Math.sin(phi * waveFreq) * strandSpread * factor1);

        // Control point 2 (2/3 camino)
        const p2 = startVec.clone().lerp(endVec, 0.67);
        const factor2 = Math.sin(Math.PI * 0.67);
        p2.addScaledVector(right, Math.cos(phi + 1.3) * strandSpread * factor2);
        p2.addScaledVector(normal, Math.sin((phi + 1.3) * waveFreq) * strandSpread * factor2);

        const curve = new THREE.CubicBezierCurve3(
            startVec.clone(),
            p1,
            p2,
            endVec.clone()
        );
        allCurves.push(curve);

        const segments = 36;
        const pts = curve.getPoints(segments);

        for (let j = 0; j < pts.length - 1; j++) {
            linePositions.push(pts[j].x, pts[j].y, pts[j].z);
            linePositions.push(pts[j + 1].x, pts[j + 1].y, pts[j + 1].z);

            const tA = j / segments;
            const tB = (j + 1) / segments;

            // Gradiente idéntico a la referencia:
            // Azul eléctrico / cian central con destellos ambarinos hacia los nodos
            const getCol = (t) => {
                const c = new THREE.Color();
                if (t < 0.18) {
                    c.lerpColors(new THREE.Color(0xffd555), new THREE.Color(0x00d8ff), t / 0.18);
                } else if (t < 0.82) {
                    const midT = (t - 0.18) / 0.64;
                    c.lerpColors(new THREE.Color(0x00c4ff), new THREE.Color(0x1a58d8), Math.sin(midT * Math.PI));
                } else {
                    c.lerpColors(new THREE.Color(0x00d8ff), new THREE.Color(0xffd555), (t - 0.82) / 0.18);
                }
                return c;
            };

            const colA = getCol(tA);
            const colB = getCol(tB);
            lineColors.push(colA.r, colA.g, colA.b);
            lineColors.push(colB.r, colB.g, colB.b);
        }
    }
}

// Generar haces para cada arista del grafo
graphEdges.forEach(([srcId, dstId]) => {
    if (nodeMap[srcId] && nodeMap[dstId]) {
        const isCoreEdge = (srcId === 'gran_atractor' || dstId === 'gran_atractor');
        createFilamentBundle(nodeMap[srcId], nodeMap[dstId], isCoreEdge ? 18 : 10, isCoreEdge ? 28 : 18);
    }
});

// Afluentes externos de la cuenca (Corrientes cósmicas hacia los nodos)
const NUM_FEEDERS = 220;
for (let i = 0; i < NUM_FEEDERS; i++) {
    const targetNode = KNOWLEDGE_GRAPH[Math.floor(Math.random() * KNOWLEDGE_GRAPH.length)];
    const targetPos = nodeMap[targetNode.id];

    const u = Math.random();
    const angle = u * Math.PI * 2;
    const elevation = (Math.random() - 0.5) * Math.PI * 0.88;
    const dist = 380 + Math.random() * 280;

    const p0 = new THREE.Vector3(
        Math.cos(angle) * Math.cos(elevation) * dist * 1.35,
        Math.sin(elevation) * dist * 0.95 + (u > 0.5 ? 45 : -45),
        Math.sin(angle) * Math.cos(elevation) * dist * 0.9
    );

    const p1 = new THREE.Vector3(
        p0.x * 0.65 + (Math.random() - 0.5) * 55,
        p0.y * 0.65 + (p0.y > 0 ? 38 : -28),
        p0.z * 0.65 + (Math.random() - 0.5) * 55
    );

    const p2 = new THREE.Vector3(
        targetPos.x * 0.65 + p1.x * 0.35 + (Math.random() - 0.5) * 35,
        targetPos.y * 0.65 + p1.y * 0.35 + (Math.random() - 0.5) * 25,
        targetPos.z * 0.65 + p1.z * 0.35 + (Math.random() - 0.5) * 35
    );

    const curve = new THREE.CubicBezierCurve3(p0, p1, p2, targetPos.clone());
    allCurves.push(curve);

    const segments = 30;
    const pts = curve.getPoints(segments);
    for (let j = 0; j < pts.length - 1; j++) {
        linePositions.push(pts[j].x, pts[j].y, pts[j].z);
        linePositions.push(pts[j + 1].x, pts[j + 1].y, pts[j + 1].z);

        const progA = j / segments;
        const progB = (j + 1) / segments;
        const colA = new THREE.Color().lerpColors(new THREE.Color(0x0e306e), new THREE.Color(0x00d8ff), Math.pow(progA, 1.5));
        const colB = new THREE.Color().lerpColors(new THREE.Color(0x0e306e), new THREE.Color(0x00d8ff), Math.pow(progB, 1.5));
        lineColors.push(colA.r, colA.g, colA.b);
        lineColors.push(colB.r, colB.g, colB.b);
    }
}

// Geometría y material de líneas de flujo
const streamlineGeo = new THREE.BufferGeometry();
streamlineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
streamlineGeo.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 3));

const streamlineMat = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.68,
    blending: THREE.AdditiveBlending,
    depthWrite: false
});
const streamlinesMesh = new THREE.LineSegments(streamlineGeo, streamlineMat);
streamLinesGroup.add(streamlinesMesh);

// --- 6. NUBE VOLUMÉTRICA DE GAS Y ESTRELLAS (220.000 partículas - Idéntica a la Referencia) ---
const galaxyCount = 220000;
const galaxyGeo = new THREE.BufferGeometry();
const galaxyPos = new Float32Array(galaxyCount * 3);
const galaxyCols = new Float32Array(galaxyCount * 3);

const palette = [
    new THREE.Color(0xffffff), // 0: Blanco estelar
    new THREE.Color(0xa6ecff), // 1: Cian hielo luminoso
    new THREE.Color(0x00b4ff), // 2: Azul eléctrico brillante
    new THREE.Color(0x194ee0), // 3: Azul real profundo
    new THREE.Color(0xff9d00), // 4: Ámbar brillante
    new THREE.Color(0xffd54f)  // 5: Dorado estelar
];

for (let i = 0; i < galaxyCount; i++) {
    let px, py, pz;
    let colIndex = 2;
    const dice = Math.random();

    if (dice < 0.74) {
        // 74% Partículas que forman la red densa de filamentos
        const curve = allCurves[Math.floor(Math.random() * allCurves.length)];
        const t = Math.random();
        const pt = curve.getPoint(t);

        const spread = (1 - t * 0.45) * 12 * (Math.random() + 0.12);
        px = pt.x + (Math.random() - 0.5) * spread;
        py = pt.y + (Math.random() - 0.5) * spread;
        pz = pt.z + (Math.random() - 0.5) * spread;

        if (t > 0.84 || t < 0.16) {
            colIndex = Math.random() > 0.4 ? 4 : 5;
        } else if (Math.random() > 0.55) {
            colIndex = 1;
        } else {
            colIndex = Math.random() > 0.35 ? 2 : 3;
        }
    } else if (dice < 0.92) {
        // 18% Cúmulos densos alrededor de los 14 nodos (Knots estelares)
        const node = KNOWLEDGE_GRAPH[Math.floor(Math.random() * KNOWLEDGE_GRAPH.length)];
        const rad = Math.pow(Math.random(), 2.2) * (node.size * 4.2);
        const th = Math.random() * Math.PI * 2;
        const ph = Math.acos((Math.random() * 2) - 1);

        px = node.position.x + rad * Math.sin(ph) * Math.cos(th);
        py = node.position.y + rad * Math.sin(ph) * Math.sin(th) * 0.8;
        pz = node.position.z + rad * Math.cos(ph);

        colIndex = (node.id === "gran_atractor" || Math.random() > 0.25) ? (Math.random() > 0.45 ? 4 : 5) : 0;
    } else {
        // 8% Partículas de halo en la cuenca cósmica
        const rad = Math.random() * 420;
        const th = Math.random() * Math.PI * 2;
        const ph = Math.acos((Math.random() * 2) - 1);
        px = rad * Math.sin(ph) * Math.cos(th) * 1.35;
        py = rad * Math.sin(ph) * Math.sin(th) * 0.9;
        pz = rad * Math.cos(ph) * 0.85;
        colIndex = Math.random() > 0.65 ? 1 : 3;
    }

    galaxyPos[i * 3] = px;
    galaxyPos[i * 3 + 1] = py;
    galaxyPos[i * 3 + 2] = pz;

    const col = palette[colIndex];
    galaxyCols[i * 3] = col.r;
    galaxyCols[i * 3 + 1] = col.g;
    galaxyCols[i * 3 + 2] = col.b;
}

galaxyGeo.setAttribute('position', new THREE.BufferAttribute(galaxyPos, 3));
galaxyGeo.setAttribute('color', new THREE.BufferAttribute(galaxyCols, 3));

const galaxyMat = new THREE.PointsMaterial({
    size: 2.8,
    vertexColors: true,
    map: particleTexture,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
    depthWrite: false
});
const galaxyPoints = new THREE.Points(galaxyGeo, galaxyMat);
interiorGroup.add(galaxyPoints);

// Pulsos cinéticos de flujo de riesgo/información (Traveling energy photons)
const pulseCount = 950;
const pulseGeo = new THREE.BufferGeometry();
const pulsePos = new Float32Array(pulseCount * 3);
const pulseData = [];

for (let i = 0; i < pulseCount; i++) {
    const curve = allCurves[Math.floor(Math.random() * allCurves.length)];
    const speed = 0.0018 + Math.random() * 0.0035;
    const t = Math.random();
    pulseData.push({ curve, t, speed });
    const pt = curve.getPoint(t);
    pulsePos[i * 3] = pt.x;
    pulsePos[i * 3 + 1] = pt.y;
    pulsePos[i * 3 + 2] = pt.z;
}
pulseGeo.setAttribute('position', new THREE.BufferAttribute(pulsePos, 3));
const pulseMat = new THREE.PointsMaterial({
    size: 5.2,
    color: 0xffffff,
    map: particleTexture,
    transparent: true,
    opacity: 0.92,
    blending: THREE.AdditiveBlending,
    depthWrite: false
});
const pulses = new THREE.Points(pulseGeo, pulseMat);
interiorGroup.add(pulses);

// --- 7. NODOS TOPOLÓGICOS DEL GRAFO DE CONOCIMIENTO ---
const nodesGroup = new THREE.Group();
interiorGroup.add(nodesGroup);

const nodeMeshes = [];
const labelsContainer = document.getElementById('labels-container');
if (labelsContainer) {
    labelsContainer.style.display = 'none';
}

KNOWLEDGE_GRAPH.forEach((node) => {
    const nodeObj = new THREE.Group();
    nodeObj.position.set(node.position.x, node.position.y, node.position.z);

    const isGranAtractor = node.id === "gran_atractor";
    const geo = new THREE.SphereGeometry(node.size * 0.45, 32, 32);
    const mat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(node.color),
        transparent: true,
        opacity: 0.96
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.userData = { nodeData: node };
    nodeObj.add(mesh);

    const haloGeo = new THREE.RingGeometry(node.size * 0.6, node.size * 0.98, 32);
    const haloMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(node.beaconColor || node.color),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    nodeObj.add(haloMesh);

    const spriteMat = new THREE.SpriteMaterial({
        map: isGranAtractor ? amberTexture : particleTexture,
        color: new THREE.Color(node.beaconColor || node.color),
        transparent: true,
        opacity: 0.90,
        blending: THREE.AdditiveBlending
    });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(node.size * 4.0, node.size * 4.0, 1);
    nodeObj.add(sprite);

    nodesGroup.add(nodeObj);

    // Etiqueta 3D en el DOM
    const labelEl = document.createElement('div');
    labelEl.className = 'node-space-label hidden';
    labelEl.id = `label-${node.id}`;
    labelEl.innerHTML = `
        <div class="node-beacon" style="background:${node.beaconColor || node.color}; box-shadow: 0 0 14px ${node.beaconColor || node.color};"></div>
        <div class="node-label-box">
            <span class="node-label-title">${node.shortName}</span>
            <span class="node-label-sub">${node.category}</span>
        </div>
    `;
    labelEl.addEventListener('click', (e) => {
        e.stopPropagation();
        focusOnNode(node);
    });
    if (labelsContainer) labelsContainer.appendChild(labelEl);

    nodeMeshes.push({
        nodeData: node,
        group: nodeObj,
        mesh: mesh,
        halo: haloMesh,
        sprite: sprite,
        labelEl: labelEl
    });
});

// --- 8. PROYECCIÓN 3D DE ETIQUETAS A COORDENADAS DE PANTALLA ---
const tempVec = new THREE.Vector3();
function update3DLabels() {
    if (!interiorGroup.visible || !isInside) return;

    nodeMeshes.forEach(item => {
        if (!item.labelEl) return;
        tempVec.set(item.nodeData.position.x, item.nodeData.position.y, item.nodeData.position.z);
        tempVec.applyMatrix4(interiorGroup.matrixWorld);
        tempVec.project(camera);

        if (tempVec.z > 1 || item.group.visible === false) {
            item.labelEl.style.opacity = '0';
            return;
        }

        const x = (tempVec.x * 0.5 + 0.5) * window.innerWidth;
        const y = (-(tempVec.y * 0.5) + 0.5) * window.innerHeight;
        item.labelEl.style.left = `${x}px`;
        item.labelEl.style.top = `${y}px`;
        item.labelEl.style.opacity = '1';
    });
}

// --- 9. INTERACCIÓN Y EVENTOS DE RATÓN ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let isInside = false;
let isTransitioning = false;
let autoRotate = true;
let hoveredNode = null;
let activeNode = null;

const body = document.body;
const entranceHud = document.getElementById('entrance-hud');
const palaceHud = document.getElementById('palace-hud');
const distortionOverlay = document.getElementById('distortion-overlay');
const drawer = document.getElementById('node-drawer');

window.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    if (isTransitioning) return;

    if (isInside) {
        raycaster.setFromCamera(mouse, camera);
        const hitMeshes = nodeMeshes.map(m => m.mesh);
        const hits = raycaster.intersectObjects(hitMeshes);

        if (hits.length > 0) {
            const hitMesh = hits[0].object;
            const node = hitMesh.userData.nodeData;
            if (hoveredNode !== node) {
                hoveredNode = node;
                document.body.style.cursor = 'pointer';
            }
        } else {
            if (hoveredNode) {
                hoveredNode = null;
                document.body.style.cursor = 'default';
            }
        }
    } else {
        raycaster.setFromCamera(mouse, camera);
        const hits = raycaster.intersectObject(blackSphere);
        document.body.style.cursor = hits.length > 0 ? 'pointer' : 'default';
    }
});

window.addEventListener('click', (e) => {
    if (isTransitioning) return;
    if (e.target.closest('#node-drawer') || e.target.closest('.top-nav') || e.target.closest('.filter-strip') || e.target.closest('#prompt-enter')) {
        return;
    }

    if (!isInside) {
        raycaster.setFromCamera(mouse, camera);
        const hits = raycaster.intersectObject(blackSphere);
        if (hits.length > 0) {
            enterPalace();
            return;
        }
    } else {
        raycaster.setFromCamera(mouse, camera);
        const hitMeshes = nodeMeshes.map(m => m.mesh);
        const hits = raycaster.intersectObjects(hitMeshes);
        if (hits.length > 0) {
            const node = hits[0].object.userData.nodeData;
            focusOnNode(node);
        }
    }
});

window.addEventListener('dblclick', (e) => {
    if (!isInside && !isTransitioning) {
        enterPalace();
    }
});

document.getElementById('prompt-enter').addEventListener('click', () => {
    if (!isInside && !isTransitioning) enterPalace();
});

window.addEventListener('wheel', (e) => {
    if (!isInside && !isTransitioning && camera.position.length() < 560 && e.deltaY < 0) {
        enterPalace();
    }
});

function playCosmicWarp() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(140, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 2.5);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 2.5);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 2.5);
    } catch(e) {}
}

// --- 10. TRANSICIÓN GRAVITACIONAL: BLANCO -> COSMOS OSCURO ---
function enterPalace() {
    if (isTransitioning || isInside) return;
    isTransitioning = true;
    document.body.style.cursor = 'default';

    distortionOverlay.classList.add('warping');
    playCosmicWarp();

    entranceHud.classList.remove('visible');
    entranceHud.classList.add('hidden');

    gsap.to(camera.position, {
        duration: 2.8,
        x: 40,
        y: 45,
        z: 420,
        ease: "power3.inOut",
        onUpdate: () => {
            controls.target.set(0, 0, 0);
            controls.update();
        }
    });

    gsap.to(scene.background, {
        duration: 2.2,
        r: COLOR_BG_INSIDE.r,
        g: COLOR_BG_INSIDE.g,
        b: COLOR_BG_INSIDE.b,
        ease: "power2.inOut",
        onUpdate: () => {
            renderer.setClearColor(scene.background, 1);
        }
    });
    gsap.to(scene.fog.color, {
        duration: 2.2,
        r: COLOR_BG_INSIDE.r,
        g: COLOR_BG_INSIDE.g,
        b: COLOR_BG_INSIDE.b,
        ease: "power2.inOut"
    });

    gsap.to(blackSphere.scale, {
        duration: 2.4,
        x: 2.8,
        y: 2.8,
        z: 2.8,
        ease: "power2.in"
    });
    gsap.to(blackSphereMat, {
        duration: 1.8,
        delay: 0.5,
        opacity: 0
    });
    gsap.to(contactShadow.material, {
        duration: 1.4,
        delay: 0.3,
        opacity: 0,
        onComplete: () => {
            outsideGroup.visible = false;
        }
    });

    interiorGroup.visible = true;
    interiorGroup.scale.set(0.03, 0.03, 0.03);

    gsap.to(interiorGroup.scale, {
        duration: 2.6,
        delay: 0.4,
        x: 1,
        y: 1,
        z: 1,
        ease: "power2.out",
        onComplete: () => {
            isInside = true;
            isTransitioning = false;
            body.classList.remove('mode-outside');
            body.classList.add('mode-inside');
            distortionOverlay.classList.remove('warping');

            palaceHud.classList.remove('hidden');
            palaceHud.classList.add('visible');

            if (labelsContainer) {
                labelsContainer.style.display = 'block';
            }
            document.querySelectorAll('.node-space-label').forEach(el => el.classList.remove('hidden'));
        }
    });
}

function exitToOutside() {
    if (!isInside || isTransitioning) return;
    isTransitioning = true;
    closeDrawer();

    distortionOverlay.classList.add('warping');

    palaceHud.classList.remove('visible');
    palaceHud.classList.add('hidden');

    if (labelsContainer) {
        labelsContainer.style.display = 'none';
    }
    document.querySelectorAll('.node-space-label').forEach(el => el.classList.add('hidden'));

    outsideGroup.visible = true;
    blackSphere.scale.set(1, 1, 1);
    blackSphereMat.opacity = 0;
    contactShadow.material.opacity = 0;

    gsap.to(camera.position, {
        duration: 2.5,
        x: DEFAULT_OUTSIDE_CAM.x,
        y: DEFAULT_OUTSIDE_CAM.y,
        z: DEFAULT_OUTSIDE_CAM.z,
        ease: "power3.inOut",
        onUpdate: () => {
            controls.target.set(0, 0, 0);
            controls.update();
        }
    });

    gsap.to(scene.background, {
        duration: 2.0,
        r: COLOR_BG_OUTSIDE.r,
        g: COLOR_BG_OUTSIDE.g,
        b: COLOR_BG_OUTSIDE.b,
        ease: "power2.inOut",
        onUpdate: () => {
            renderer.setClearColor(scene.background, 1);
        }
    });
    gsap.to(scene.fog.color, {
        duration: 2.0,
        r: COLOR_BG_OUTSIDE.r,
        g: COLOR_BG_OUTSIDE.g,
        b: COLOR_BG_OUTSIDE.b,
        ease: "power2.inOut"
    });

    gsap.to(interiorGroup.scale, {
        duration: 1.8,
        x: 0.02,
        y: 0.02,
        z: 0.02,
        ease: "power2.in",
        onComplete: () => {
            interiorGroup.visible = false;
        }
    });

    gsap.to(blackSphereMat, {
        duration: 1.6,
        delay: 0.5,
        opacity: 0.99
    });
    gsap.to(contactShadow.material, {
        duration: 1.6,
        delay: 0.5,
        opacity: 0.75,
        onComplete: () => {
            isInside = false;
            isTransitioning = false;
            body.classList.remove('mode-inside');
            body.classList.add('mode-outside');
            distortionOverlay.classList.remove('warping');

            entranceHud.classList.remove('hidden');
            entranceHud.classList.add('visible');
        }
    });
}

document.getElementById('btn-exit').addEventListener('click', exitToOutside);

// --- 11. ENFOQUE CINEMATOGRÁFICO EN UN NODO ---
function focusOnNode(node) {
    activeNode = node;
    const targetPos = new THREE.Vector3(node.position.x, node.position.y, node.position.z);
    targetPos.applyMatrix4(interiorGroup.matrixWorld);

    const camOffset = targetPos.clone().normalize().multiplyScalar(110);
    if (targetPos.length() < 10) camOffset.set(0, 30, 95);

    const destCam = targetPos.clone().add(camOffset);

    gsap.to(camera.position, {
        duration: 1.8,
        x: destCam.x,
        y: destCam.y,
        z: destCam.z,
        ease: "power2.inOut",
        onUpdate: () => {
            controls.target.copy(targetPos);
            controls.update();
        }
    });

    const activeInfo = document.getElementById('active-node-info');
    if (activeInfo) {
        activeInfo.innerHTML = `<strong>Inspeccionando:</strong> ${node.name} (${node.category}) | <em>${node.frameworks ? node.frameworks.join(', ') : ''}</em>`;
    }

    openDrawer(node);
}

// --- 12. DRAWER DE MICRO-INSPECCIÓN CON KaTeX & CÓDIGO REPRODUCIBLE ---
const drawerTitle = document.getElementById('drawer-node-title');
const drawerCat = document.getElementById('drawer-node-cat');
const drawerDesc = document.getElementById('drawer-node-desc');
const mathBox = document.getElementById('math-box');
const codeSnippet = document.getElementById('code-snippet');
const btnCopyCode = document.getElementById('btn-copy-code');
const upstreamList = document.getElementById('upstream-list');
const downstreamList = document.getElementById('downstream-list');
let currentCodeLang = 'python';

function openDrawer(node) {
    drawerTitle.innerText = node.name;
    drawerCat.innerText = node.category.toUpperCase();
    drawerCat.style.background = node.beaconColor || node.color;
    drawerDesc.innerText = node.description;

    mathBox.innerHTML = '';
    if (node.math && window.katex) {
        try {
            window.katex.render(node.math, mathBox, {
                displayMode: true,
                throwOnError: false
            });
        } catch (e) {
            mathBox.innerText = node.math;
        }
    } else {
        mathBox.innerText = node.math || "Fórmula en formulación...";
    }

    updateCodeView(node);

    upstreamList.innerHTML = '';
    if (node.dependencies && node.dependencies.upstream) {
        node.dependencies.upstream.forEach(upId => {
            const upNode = KNOWLEDGE_GRAPH.find(n => n.id === upId);
            const li = document.createElement('li');
            li.className = 'deps-item-link';
            li.innerHTML = `
                <span>${upNode ? upNode.name : upId}</span>
                <span class="deps-jump-btn">Ir al nodo </span>
            `;
            li.addEventListener('click', () => {
                if (upNode) focusOnNode(upNode);
            });
            upstreamList.appendChild(li);
        });
    }

    downstreamList.innerHTML = '';
    if (node.dependencies && node.dependencies.downstream) {
        node.dependencies.downstream.forEach(downId => {
            const downNode = KNOWLEDGE_GRAPH.find(n => n.id === downId);
            const li = document.createElement('li');
            li.className = 'deps-item-link';
            li.innerHTML = `
                <span>${downNode ? downNode.name : downId}</span>
                <span class="deps-jump-btn">Ir al nodo </span>
            `;
            li.addEventListener('click', () => {
                if (downNode) focusOnNode(downNode);
            });
            downstreamList.appendChild(li);
        });
    }

    drawer.classList.remove('hidden');
    drawer.classList.add('visible');
}

function updateCodeView(node) {
    if (!node.code) return;
    const raw = node.code[currentCodeLang] || `# Código no disponible en ${currentCodeLang}`;
    codeSnippet.textContent = raw;
}

function closeDrawer() {
    drawer.classList.remove('visible');
    drawer.classList.add('hidden');
    activeNode = null;
    const activeInfo = document.getElementById('active-node-info');
    if (activeInfo) {
        activeInfo.innerHTML = `<strong>Nodo:</strong> Evaluación y Mitigación del Riesgo Financiero y Vital (Núcleo) | <em>Laniakea Cosmic Web</em>`;
    }
}

document.getElementById('btn-close-drawer').addEventListener('click', closeDrawer);

document.querySelectorAll('.drawer-tab').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.drawer-tab').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        const tabId = btn.dataset.tab;
        const targetPane = document.getElementById(tabId);
        if (targetPane) targetPane.classList.add('active');
    });
});

document.querySelectorAll('.code-lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.code-lang-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCodeLang = btn.dataset.lang;
        if (activeNode) updateCodeView(activeNode);
    });
});

btnCopyCode.addEventListener('click', () => {
    if (codeSnippet.textContent) {
        navigator.clipboard.writeText(codeSnippet.textContent).then(() => {
            const originalText = btnCopyCode.innerHTML;
            btnCopyCode.innerHTML = '¡Copiado!';
            setTimeout(() => {
                btnCopyCode.innerHTML = originalText;
            }, 1800);
        });
    }
});

// --- 13. FILTROS POR LENGUAJE Y MARCO REGULATORIO ---
let currentFilterType = 'all';
let currentFilterVal = 'all';

document.querySelectorAll('.filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
        const type = pill.dataset.filter;
        const val = pill.dataset.val;

        document.querySelectorAll(`.filter-pill[data-filter="${type}"]`).forEach(p => p.classList.remove('active'));
        pill.classList.add('active');

        applyFilters(type, val);
    });
});

function applyFilters(type, val) {
    currentFilterType = type;
    currentFilterVal = val;

    nodeMeshes.forEach(item => {
        const node = item.nodeData;
        let match = true;

        if (val !== 'all') {
            if (type === 'lang') {
                match = node.languages && node.languages.includes(val);
            } else if (type === 'framework') {
                match = node.frameworks && node.frameworks.includes(val);
            }
        }

        if (match) {
            item.group.visible = true;
            if (item.labelEl) item.labelEl.classList.remove('dimmed');
            item.mesh.material.opacity = 0.95;
            item.halo.material.opacity = 0.85;
        } else {
            item.group.visible = true;
            if (item.labelEl) item.labelEl.classList.add('dimmed');
            item.mesh.material.opacity = 0.15;
            item.halo.material.opacity = 0.08;
        }
    });
}

// --- 14. BÚSQUEDA FUZZY CON DESPLEGABLE Y SALTO DE CÁMARA ---
const searchInput = document.getElementById('node-search');
const searchDropdown = document.getElementById('search-results');
const searchClear = document.getElementById('search-clear');

searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    if (!query) {
        searchDropdown.classList.add('hidden');
        searchClear.classList.add('hidden');
        return;
    }
    searchClear.classList.remove('hidden');

    const matches = KNOWLEDGE_GRAPH.filter(n => {
        return n.name.toLowerCase().includes(query) ||
               n.shortName.toLowerCase().includes(query) ||
               n.category.toLowerCase().includes(query) ||
               (n.description && n.description.toLowerCase().includes(query));
    });

    if (matches.length > 0) {
        searchDropdown.innerHTML = '';
        matches.forEach(m => {
            const row = document.createElement('div');
            row.className = 'search-result-item';
            row.innerHTML = `
                <div class="result-dot" style="background:${m.beaconColor || m.color};"></div>
                <div class="result-text">
                    <span class="result-name">${m.name}</span>
                    <span class="result-cat">${m.category}</span>
                </div>
            `;
            row.addEventListener('click', () => {
                focusOnNode(m);
                searchDropdown.classList.add('hidden');
                searchInput.value = m.name;
            });
            searchDropdown.appendChild(row);
        });
        searchDropdown.classList.remove('hidden');
    } else {
        searchDropdown.innerHTML = `<div class="search-empty">No se encontraron algoritmos o fórmulas para "${query}"</div>`;
        searchDropdown.classList.remove('hidden');
    }
});

searchClear.addEventListener('click', () => {
    searchInput.value = '';
    searchDropdown.classList.add('hidden');
    searchClear.classList.add('hidden');
});

// --- 15. BOTONES DE ACCIÓN RÁPIDA (FILAMENTOS, MODELOS 3D, ORBITAR, AUDIO) ---
let filamentsVisible = true;
const btnFilaments = document.getElementById('btn-toggle-filaments');
btnFilaments.addEventListener('click', () => {
    filamentsVisible = !filamentsVisible;
    streamLinesGroup.visible = filamentsVisible;
    btnFilaments.classList.toggle('active', filamentsVisible);
});

let models3DVisible = true;
const btnModels = document.getElementById('btn-toggle-models');
btnModels.addEventListener('click', () => {
    models3DVisible = !models3DVisible;
    gltfModelsGroup.visible = models3DVisible;
    btnModels.classList.toggle('active', models3DVisible);
});

const btnRotate = document.getElementById('btn-toggle-rotate');
btnRotate.addEventListener('click', () => {
    autoRotate = !autoRotate;
    btnRotate.classList.toggle('active', autoRotate);
});

// Audio sintético continuo
let audioPlaying = false;
let ambientOsc = null;
let ambientGain = null;
const btnSound = document.getElementById('btn-toggle-sound');
btnSound.addEventListener('click', () => {
    if (!audioPlaying) {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            ambientOsc = ctx.createOscillator();
            ambientGain = ctx.createGain();
            ambientOsc.type = 'sine';
            ambientOsc.frequency.setValueAtTime(55, ctx.currentTime);
            ambientGain.gain.setValueAtTime(0.04, ctx.currentTime);
            ambientOsc.connect(ambientGain);
            ambientGain.connect(ctx.destination);
            ambientOsc.start();
            audioPlaying = true;
            btnSound.classList.add('active');
        } catch(e) {}
    } else {
        if (ambientOsc) {
            ambientOsc.stop();
            audioPlaying = false;
            btnSound.classList.remove('active');
        }
    }
});

// --- 16. BUCLE PRINCIPAL DE ANIMACIÓN Y RENDERIZADO ---
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    const time = clock.getElapsedTime();

    // Animación exterior
    if (outsideGroup.visible) {
        const breath = 1 + Math.sin(time * 1.5) * 0.012;
        blackSphere.scale.set(breath, breath, breath);
        contactShadow.scale.set(breath, breath, 1);

        outerDust.rotation.y = time * 0.012;
        outerDust.rotation.x = time * 0.006;
    }

    // Animación interior
    if (interiorGroup.visible) {
        if (autoRotate && !isTransitioning && !activeNode) {
            interiorGroup.rotation.y += delta * 0.028;
        }

        // Rotación de los dos modelos 3D conjuntos
        if (skyboxMesh) {
            skyboxMesh.rotation.y += delta * 0.003;
            skyboxMesh.rotation.x += delta * 0.0008;
        }

        if (cosmicPointCloud) {
            cosmicPointCloud.rotation.y -= delta * 0.004;
        }

        // Halos de nodos
        nodeMeshes.forEach((item, idx) => {
            const s = 1 + Math.sin(time * 3 + idx) * 0.16;
            item.halo.scale.set(s, s, 1);
            item.halo.lookAt(camera.position);
        });

        // Pulsos de energía
        const posAttr = pulses.geometry.attributes.position;
        for (let i = 0; i < pulseCount; i++) {
            const p = pulseData[i];
            p.t += p.speed;
            if (p.t > 1) p.t = 0;
            const pt = p.curve.getPoint(p.t);
            posAttr.setXYZ(i, pt.x, pt.y, pt.z);
        }
        posAttr.needsUpdate = true;

        update3DLabels();
    }

    controls.update();
    renderer.render(scene, camera);
}

animate();

// --- 17. RESPONSIVE RESIZE ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
