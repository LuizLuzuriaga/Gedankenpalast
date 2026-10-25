/**
 * Gendanken Palast - Experiencia 3D
 * Portada: bola de obsidiana sobre blanco. Entrada: membrana viscosa.
 * Interior: superclúster de Laniakea con cuatro cúmulos de conocimiento cuyos temas orbitan,
 * filamentos de flujo hacia El Gran Atractor, buscador, filtros y panel de temario.
 * Datos: atlas.js (cúmulos y temas), knowledgeData.js (metodologías), conocimientos.js (temarios).
 */

// ==========================================================================
// 0. DATOS DEL ATLAS
// ==========================================================================
const CLUSTER_BY_ID = Object.fromEntries(CLUSTERS.map(c => [c.id, c]));
const GA_METHOD = KNOWLEDGE_GRAPH.find(n => n.id === 'gran_atractor');

const ALL_TOPICS = [
    {
        id: 'gran_atractor', cluster: null, name: 'El Gran Atractor',
        desc: GA_METHOD.description, method: GA_METHOD,
        related: GA_METHOD.upstream
    },
    ...TOPICS,
    ...KNOWLEDGE_GRAPH.filter(n => METHOD_CLUSTER[n.category]).map(n => ({
        id: n.id, cluster: METHOD_CLUSTER[n.category], name: n.shortName,
        desc: n.description, method: n,
        related: [...n.upstream, ...n.downstream]
    }))
];
const TOPIC_BY_ID = Object.fromEntries(ALL_TOPICS.map(t => [t.id, t]));

// Relaciones simétricas y solo entre temas que existen en el atlas
const NEIGHBOURS = Object.fromEntries(ALL_TOPICS.map(t => [t.id, new Set()]));
ALL_TOPICS.forEach(t => (t.related || []).forEach(id => {
    if (TOPIC_BY_ID[id] && id !== t.id) {
        NEIGHBOURS[t.id].add(id);
        NEIGHBOURS[id].add(t.id);
    }
}));

const LANGUAGES = ['Python', 'R', 'LaTeX', 'Excel/VBA'];
const FRAMEWORKS = ['Solvencia II', 'IFRS 17', 'Tarificación', 'Reservas', 'ALM'];

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ==========================================================================
// 1. RENDERER, ESCENA, CÁMARA
// ==========================================================================
const container = document.getElementById('webgl-container');
const scene = new THREE.Scene();
const COLOR_WHITE = new THREE.Color(0xffffff);
const COLOR_SPACE = new THREE.Color(0x000000);
const COLOR_STUDIO = new THREE.Color(0xf1f1f1); // fondo de estudio de la portada
scene.background = COLOR_STUDIO.clone();

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.5, 20000);
const CAM_PORTADA = new THREE.Vector3(0, 225, 710); // algo elevada, como una foto de producto
const CAM_OVERVIEW = new THREE.Vector3(430, 250, 840);
// En pantallas verticales el campo horizontal es estrecho: la cámara se aleja para que quepan los cúmulos
const viewScale = () => Math.max(1, Math.pow(1.5 / camera.aspect, 0.6));
const overviewPosition = () => CAM_OVERVIEW.clone().multiplyScalar(viewScale());
camera.position.copy(CAM_PORTADA);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.rotateSpeed = 0.6;
controls.zoomSpeed = 0.9;
controls.enablePan = false;
const DISTANCE_LIMITS = { portada: [185, 1400], cosmos: [12, 2600] };
[controls.minDistance, controls.maxDistance] = DISTANCE_LIMITS.portada;
controls.autoRotateSpeed = 0.18;
controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN };

// Puntos nítidos a cualquier zoom: disco calculado por píxel, sin textura
const pointUniforms = {
    uScale: { value: 1 },
    uPixelRatio: { value: renderer.getPixelRatio() },
    uMaxSize: { value: 12 }
};

function createPointMaterial(opacity) {
    return new THREE.ShaderMaterial({
        uniforms: { ...pointUniforms, uOpacity: { value: opacity } },
        vertexShader: `
            attribute float size;
            attribute vec3 color;
            uniform float uScale, uPixelRatio, uMaxSize, uOpacity;
            varying vec3 vColor;
            varying float vAlpha;
            void main() {
                vec4 mv = modelViewMatrix * vec4(position, 1.0);
                gl_Position = projectionMatrix * mv;
                float px = size * uScale / max(-mv.z, 0.001);
                gl_PointSize = clamp(px, 1.0, uMaxSize) * uPixelRatio;
                // Los puntos de menos de un píxel se atenúan en vez de parpadear, y los cercanos
                // también, para que al acercarse no se sumen hasta quemar la imagen en blanco
                vAlpha = uOpacity * clamp(px, 0.25, 1.0) * clamp(3.0 / px, 0.16, 1.0);
                vColor = color;
            }`,
        fragmentShader: `
            varying vec3 vColor;
            varying float vAlpha;
            void main() {
                float d = length(gl_PointCoord - 0.5) * 2.0;
                float disc = 1.0 - smoothstep(0.72, 1.0, d);
                float core = 1.0 - smoothstep(0.0, 0.55, d);
                float a = vAlpha * (disc * 0.55 + core * 0.45);
                if (a < 0.01) discard;
                gl_FragColor = vec4(vColor, a);
            }`,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });
}

function updatePointScale() {
    pointUniforms.uScale.value = window.innerHeight / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2));
    pointUniforms.uPixelRatio.value = renderer.getPixelRatio();
}
updatePointScale();

// Generador pseudoaleatorio reproducible: el cosmos es el mismo en cada visita
let seed = 20261025;
function rand() {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
}
const randSigned = () => rand() * 2 - 1;
function randInSphere() {
    const th = rand() * Math.PI * 2;
    const ph = Math.acos(randSigned());
    return new THREE.Vector3(Math.sin(ph) * Math.cos(th), Math.sin(ph) * Math.sin(th), Math.cos(ph));
}

// ==========================================================================
// 2. PORTADA: BOLA DE OBSIDIANA
// ==========================================================================
const portada = new THREE.Group();
scene.add(portada);

const SPHERE_RADIUS = 140;
const pointer = new THREE.Vector2();
const obsidianMat = new THREE.ShaderMaterial({
    uniforms: {
        uPointer: { value: new THREE.Vector2() },
        uOpacity: { value: 1 }
    },
    vertexShader: `
        varying vec3 vN;
        varying vec3 vWorldPos;
        void main() {
            vec4 wp = modelMatrix * vec4(position, 1.0);
            vWorldPos = wp.xyz;
            vN = normalize(mat3(modelMatrix) * normal);
            gl_Position = projectionMatrix * viewMatrix * wp;
        }`,
    fragmentShader: `
        uniform vec2 uPointer;
        uniform float uOpacity;
        varying vec3 vN;
        varying vec3 vWorldPos;

        // Estudio de producto difuso: techo claro, suelo gris en sombra y un horizonte muy suave.
        // Sin ventanas ni brillos de borde: el vidrio negro solo refleja el estudio y una luz puntual.
        vec3 studio(vec3 R) {
            float sky = smoothstep(-0.02, 0.32, R.y);
            float zenith = smoothstep(0.6, 1.0, R.y);
            float v = mix(0.05, 1.0, sky) - zenith * 0.12;
            // Luz amplia arriba a la derecha que aclara un poco ese lado de la cúpula
            v += 0.12 * smoothstep(0.6, 1.0, dot(R, normalize(vec3(0.6, 0.7, 0.4))));
            return vec3(v * 0.995, v, v * 1.01);
        }

        void main() {
            vec3 N = normalize(vN);
            vec3 V = normalize(cameraPosition - vWorldPos);
            vec3 R = reflect(-V, N);
            float NdV = clamp(dot(N, V), 0.0, 1.0);

            // Reflectancia de laca/vidrio pulido: algo de reflejo de frente, más hacia los bordes,
            // pero sin llegar a un aro blanco en la silueta
            float F = 0.16 + 0.26 * pow(1.0 - NdV, 3.0);
            vec3 col = vec3(0.004, 0.0042, 0.005) + studio(R) * F;

            // Destello: un solo punto diminuto y nítido arriba a la derecha, con un halo apenas visible
            vec3 Lp = normalize(vec3(0.42 + uPointer.x * 0.06, 0.78 + uPointer.y * 0.04, 0.62));
            float s = max(dot(R, Lp), 0.0);
            col += vec3(pow(s, 3200.0) * 2.4 + pow(s, 260.0) * 0.05);

            gl_FragColor = vec4(min(col, vec3(1.0)), uOpacity);
        }`,
    transparent: true
});
const obsidian = new THREE.Mesh(new THREE.SphereGeometry(SPHERE_RADIUS, 160, 120), obsidianMat);
portada.add(obsidian);

// Sombras sobre el suelo: contacto muy oscuro bajo la bola, oclusión alrededor de su base
// y una sombra proyectada suave hacia delante a la izquierda (la luz viene de arriba a la derecha)
const SHADOW_EXTENT = 6; // el plano mide 6 radios de lado
const shadowMat = new THREE.ShaderMaterial({
    uniforms: { uOpacity: { value: 1 } },
    vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `
        uniform float uOpacity;
        varying vec2 vUv;
        void main() {
            vec2 p = (vUv - 0.5) * ${SHADOW_EXTENT.toFixed(1)}; // en radios de la bola; -y es hacia la cámara
            float r = length(p);
            float contact = exp(-pow(r / 0.24, 2.0)) * 0.7;
            float occlusion = exp(-pow(r / 1.05, 2.0)) * 0.46;
            vec2 d = normalize(vec2(-0.85, -0.5));
            vec2 q = p - d * 0.75;
            float along = dot(q, d);
            float across = d.x * q.y - d.y * q.x;
            float castShadow = exp(-pow(along / 1.15, 2.0) - pow(across / 0.62, 2.0)) * 0.26;
            float a = 1.0 - (1.0 - contact) * (1.0 - occlusion) * (1.0 - castShadow);
            gl_FragColor = vec4(vec3(0.0), a * uOpacity);
        }`,
    transparent: true,
    depthWrite: false
});
const contactShadow = new THREE.Mesh(new THREE.PlaneGeometry(SPHERE_RADIUS * SHADOW_EXTENT, SPHERE_RADIUS * SHADOW_EXTENT), shadowMat);
contactShadow.rotation.x = -Math.PI / 2;
contactShadow.position.y = -SPHERE_RADIUS - 1;
portada.add(contactShadow);

// ==========================================================================
// 3. INTERIOR: SUPERCLÚSTER DE LANIAKEA
// ==========================================================================
const cosmos = new THREE.Group();
cosmos.visible = false;
scene.add(cosmos);

const GA_POS = new THREE.Vector3(0, 0, 0);
const clusterCenters = Object.fromEntries(CLUSTERS.map(c => [c.id, new THREE.Vector3(...c.center)]));
const clusterTints = Object.fromEntries(CLUSTERS.map(c => [c.id, new THREE.Color(c.hue).lerp(COLOR_WHITE, 0.2)]));
const COLOR_CORE = new THREE.Color(0xfff1d6);
const COLOR_DEEP = new THREE.Color(0x2f5e9e);

// A) LÍNEAS DE FLUJO: cada cúmulo desagua hacia El Gran Atractor y recibe afluentes del vacío
const flowCurves = []; // { curve, from: Color, to: Color, toAttractor: bool }

CLUSTERS.forEach((c, ci) => {
    const center = clusterCenters[c.id];
    const toGA = GA_POS.clone().sub(center);
    const dist = toGA.length();
    // Cada puente se curva hacia un lado distinto para dar la forma de cuenca de Laniakea
    const bend = new THREE.Vector3().crossVectors(toGA, new THREE.Vector3(0, 1, 0)).normalize()
        .multiplyScalar(dist * (ci % 2 ? 0.28 : -0.28)).add(new THREE.Vector3(0, dist * 0.22, 0));

    for (let i = 0; i < 170; i++) {
        const p0 = center.clone().add(randInSphere().multiplyScalar(c.radius * Math.cbrt(rand()) * 0.9));
        const p1 = center.clone().lerp(GA_POS, 0.33).add(bend).add(randInSphere().multiplyScalar(c.radius * 0.55));
        const p2 = center.clone().lerp(GA_POS, 0.72).add(bend.clone().multiplyScalar(0.25)).add(randInSphere().multiplyScalar(c.radius * 0.25));
        const p3 = GA_POS.clone().add(randInSphere().multiplyScalar(22 * rand()));
        flowCurves.push({ curve: new THREE.CubicBezierCurve3(p0, p1, p2, p3), from: clusterTints[c.id], to: COLOR_CORE, toAttractor: true });
    }

    // Afluentes: llegan al cúmulo desde el lado opuesto al Atractor
    const away = center.clone().normalize();
    for (let i = 0; i < 80; i++) {
        const dir = away.clone().multiplyScalar(1.1).add(randInSphere()).normalize();
        const p0 = center.clone().add(dir.multiplyScalar(c.radius * (2.4 + rand() * 1.6)));
        const p1 = p0.clone().lerp(center, 0.35).add(randInSphere().multiplyScalar(c.radius * 0.6));
        const p2 = p0.clone().lerp(center, 0.75).add(randInSphere().multiplyScalar(c.radius * 0.3));
        const p3 = center.clone().add(randInSphere().multiplyScalar(c.radius * 0.25));
        flowCurves.push({ curve: new THREE.CubicBezierCurve3(p0, p1, p2, p3), from: COLOR_DEEP, to: clusterTints[c.id], toAttractor: false });
    }
});

// Bóveda: arcos amplios que caen sobre El Gran Atractor desde arriba
for (let i = 0; i < 140; i++) {
    const u = rand();
    const p0 = new THREE.Vector3(-380 + u * 760, 260 + (1 - Math.pow(u * 2 - 1, 2)) * 170 + randSigned() * 40, randSigned() * 240);
    const p1 = p0.clone().multiply(new THREE.Vector3(0.7, 0.62, 0.7));
    const p2 = new THREE.Vector3(randSigned() * 70, 40 + randSigned() * 20, randSigned() * 50);
    const p3 = GA_POS.clone().add(randInSphere().multiplyScalar(20 * rand()));
    flowCurves.push({ curve: new THREE.CubicBezierCurve3(p0, p1, p2, p3), from: COLOR_DEEP, to: COLOR_CORE, toAttractor: true });
}

const filaments = new THREE.Group();
cosmos.add(filaments);
{
    const SEGMENTS = 28;
    const positions = new Float32Array(flowCurves.length * SEGMENTS * 6);
    const colors = new Float32Array(flowCurves.length * SEGMENTS * 6);
    const tmp = new THREE.Color();
    let o = 0;
    flowCurves.forEach(({ curve, from, to }) => {
        const pts = curve.getPoints(SEGMENTS);
        for (let j = 0; j < SEGMENTS; j++) {
            [j, j + 1].forEach(k => {
                positions.set([pts[k].x, pts[k].y, pts[k].z], o);
                tmp.copy(from).lerp(to, Math.pow(k / SEGMENTS, 1.5));
                colors.set([tmp.r, tmp.g, tmp.b], o);
                o += 3;
            });
        }
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    filaments.add(new THREE.LineSegments(geo, new THREE.LineBasicMaterial({
        vertexColors: true, transparent: true, opacity: 0.3,
        blending: THREE.AdditiveBlending, depthWrite: false
    })));
}

// B) GALAXIAS: a lo largo del flujo, condensadas en los cúmulos, en el núcleo y en el campo
{
    const COUNT = 110000;
    const positions = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);
    const sizes = new Float32Array(COUNT);
    const col = new THREE.Color();
    const p = new THREE.Vector3();

    for (let i = 0; i < COUNT; i++) {
        const dice = rand();
        let size = 0.8 + rand() * 1.3;
        if (dice < 0.56) {
            const f = flowCurves[Math.floor(rand() * flowCurves.length)];
            const t = rand();
            f.curve.getPoint(t, p);
            const spread = (1 - t * 0.7) * 10 * (rand() + 0.15);
            p.add(randInSphere().multiplyScalar(spread));
            col.copy(f.from).lerp(f.to, Math.pow(t, 1.5)).multiplyScalar(0.75 + rand() * 0.25);
        } else if (dice < 0.8) {
            const c = CLUSTERS[Math.floor(rand() * CLUSTERS.length)];
            const r = Math.pow(rand(), 1.9) * c.radius * 1.2;
            p.copy(randInSphere()).multiply(new THREE.Vector3(1, 0.7, 0.85)).multiplyScalar(r).add(clusterCenters[c.id]);
            col.copy(clusterTints[c.id]).lerp(COLOR_WHITE, rand() * 0.25).multiplyScalar(0.7 + rand() * 0.3);
            size += r < c.radius * 0.3 ? 0.6 : 0.2;
        } else if (dice < 0.88) {
            const r = Math.pow(rand(), 2.4) * 70;
            p.copy(randInSphere()).multiply(new THREE.Vector3(1, 0.6, 1)).multiplyScalar(r);
            col.copy(COLOR_CORE);
            size += 0.6;
        } else {
            p.copy(randInSphere()).multiplyScalar(250 + rand() * 900);
            col.copy(COLOR_DEEP).lerp(COLOR_WHITE, rand() * 0.3).multiplyScalar(0.55);
            size *= 0.8;
        }
        positions.set([p.x, p.y, p.z], i * 3);
        colors.set([col.r, col.g, col.b], i * 3);
        sizes[i] = size;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    cosmos.add(new THREE.Points(geo, createPointMaterial(0.72)));
}

// C) PULSOS: materia que fluye por los filamentos hacia su destino
const pulseCurves = flowCurves.filter(f => f.toAttractor);
const PULSE_COUNT = 700;
const pulseState = [];
const pulseGeo = new THREE.BufferGeometry();
{
    const positions = new Float32Array(PULSE_COUNT * 3);
    const colors = new Float32Array(PULSE_COUNT * 3);
    const sizes = new Float32Array(PULSE_COUNT).fill(2.6);
    for (let i = 0; i < PULSE_COUNT; i++) {
        pulseState.push({ f: pulseCurves[Math.floor(rand() * pulseCurves.length)], t: rand(), speed: 0.03 + rand() * 0.05 });
        colors.set([1, 0.96, 0.88], i * 3);
    }
    pulseGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    pulseGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    pulseGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    filaments.add(new THREE.Points(pulseGeo, createPointMaterial(0.85)));
}

// D) MODELO FUSIONADO: nebulosa de fondo + 50.000 puntos reales moldeados en los cúmulos
new THREE.GLTFLoader().load('gedankenpalast_cosmos.glb', (gltf) => {
    gltf.scene.traverse((child) => {
        if (child.isPoints) {
            const n = child.geometry.attributes.position.count;
            const sizes = new Float32Array(n);
            for (let i = 0; i < n; i++) sizes[i] = 0.7 + rand() * 1.4;
            child.geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
            child.material = createPointMaterial(0.5);
        } else if (child.isMesh) {
            const map = child.material.map;
            if (map) map.anisotropy = renderer.capabilities.getMaxAnisotropy();
            child.material = new THREE.MeshBasicMaterial({
                map, side: THREE.BackSide, transparent: true, opacity: 0.16, depthWrite: false
            });
            child.renderOrder = -1;
        }
    });
    cosmos.add(gltf.scene);
}, undefined, (err) => console.warn('gedankenpalast_cosmos.glb no se pudo cargar:', err));

// E) TEMAS QUE ORBITAN SU CÚMULO
const topicNodes = [];
const hitGeo = new THREE.SphereGeometry(10, 8, 6);
const hitMat = new THREE.MeshBasicMaterial({ visible: false });
const orbitLines = new THREE.Group();
cosmos.add(orbitLines);

CLUSTERS.forEach(c => {
    const members = ALL_TOPICS.filter(t => t.cluster === c.id);
    members.forEach((topic, k) => {
        const r = c.radius * (0.75 + 0.75 * (k + 0.5) / members.length);
        const tilt = 0.25 + rand() * 0.9;
        const node = rand() * Math.PI * 2;
        const axisU = new THREE.Vector3(Math.cos(node), 0, Math.sin(node));
        const axisV = new THREE.Vector3(-Math.sin(node) * Math.cos(tilt), Math.sin(tilt), Math.cos(node) * Math.cos(tilt));
        topicNodes.push({
            topic, center: clusterCenters[c.id], r, axisU, axisV,
            theta: (k / members.length) * Math.PI * 2 + rand() * 0.4,
            omega: 0.16 * Math.pow(c.radius / r, 1.5),
            pos: new THREE.Vector3()
        });

        const ring = [];
        for (let s = 0; s <= 96; s++) {
            const a = (s / 96) * Math.PI * 2;
            ring.push(clusterCenters[c.id].clone().addScaledVector(axisU, r * Math.cos(a)).addScaledVector(axisV, r * Math.sin(a)));
        }
        const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(ring), new THREE.LineBasicMaterial({
            color: c.hue, transparent: true, opacity: 0.14, depthWrite: false
        }));
        line.userData.cluster = c.id;
        line.visible = false;
        orbitLines.add(line);
    });
});
topicNodes.push({ topic: TOPIC_BY_ID.gran_atractor, center: GA_POS, r: 0, axisU: new THREE.Vector3(), axisV: new THREE.Vector3(), theta: 0, omega: 0, pos: new THREE.Vector3() });

// Los nodos son discos de tamaño fijo en pantalla: nítidos y nunca gigantes al acercarse
const NODE_SIZE = { topic: 7, core: 12, selected: 12 };
const nodeGeo = new THREE.BufferGeometry();
nodeGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(topicNodes.length * 3), 3));
nodeGeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(topicNodes.length * 3), 3));
nodeGeo.setAttribute('size', new THREE.BufferAttribute(new Float32Array(topicNodes.length), 1));
nodeGeo.setAttribute('alpha', new THREE.BufferAttribute(new Float32Array(topicNodes.length).fill(1), 1));
const nodePoints = new THREE.Points(nodeGeo, new THREE.ShaderMaterial({
    uniforms: { uPixelRatio: pointUniforms.uPixelRatio },
    vertexShader: `
        attribute float size;
        attribute float alpha;
        attribute vec3 color;
        uniform float uPixelRatio;
        varying vec3 vColor;
        varying float vAlpha;
        varying float vSize;
        void main() {
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            vSize = size * uPixelRatio;
            gl_PointSize = vSize;
            vColor = color;
            vAlpha = alpha;
        }`,
    fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;
        varying float vSize;
        void main() {
            float d = length(gl_PointCoord - 0.5) * 2.0;
            float a = vAlpha * (1.0 - smoothstep(1.0 - 3.0 / vSize, 1.0, d));
            if (a < 0.01) discard;
            gl_FragColor = vec4(vColor, a);
        }`,
    transparent: true,
    depthWrite: false
}));
nodePoints.frustumCulled = false;
cosmos.add(nodePoints);

topicNodes.forEach((n, i) => {
    n.index = i;
    const hue = new THREE.Color(n.topic.cluster ? CLUSTER_BY_ID[n.topic.cluster].hue : '#fff1d6');
    nodeGeo.attributes.color.setXYZ(i, hue.r, hue.g, hue.b);
    nodeGeo.attributes.size.setX(i, n.topic.cluster ? NODE_SIZE.topic : NODE_SIZE.core);
    n.hit = new THREE.Mesh(hitGeo, hitMat);
    n.hit.userData.topicId = n.topic.id;
    cosmos.add(n.hit);
});
const NODE_BY_ID = Object.fromEntries(topicNodes.map(n => [n.topic.id, n]));

// Líneas de relación del tema seleccionado
const relationGeo = new THREE.BufferGeometry();
relationGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(64 * 6), 3));
const relationLines = new THREE.LineSegments(relationGeo, new THREE.LineBasicMaterial({
    color: 0xffffff, transparent: true, opacity: 0.4, depthWrite: false
}));
relationLines.visible = false;
cosmos.add(relationLines);

// ==========================================================================
// 4. MEMBRANA VISCOSA (post-proceso de la transición)
// ==========================================================================
const post = { warp: 0, reveal: 1 };
const sceneTarget = new THREE.WebGLRenderTarget(1, 1);
const postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const postMat = new THREE.ShaderMaterial({
    uniforms: {
        tScene: { value: sceneTarget.texture },
        uWarp: { value: 0 },
        uReveal: { value: 1 },
        uTime: { value: 0 },
        uAspect: { value: 1 }
    },
    vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
    fragmentShader: `
        uniform sampler2D tScene;
        uniform float uWarp, uReveal, uTime, uAspect;
        varying vec2 vUv;

        float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float noise(vec2 p) {
            vec2 i = floor(p), f = fract(p);
            vec2 u = f * f * (3.0 - 2.0 * f);
            return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0)), u.x), u.y);
        }
        float fbm(vec2 p) {
            float v = 0.0, a = 0.5;
            for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
            return v;
        }

        void main() {
            vec2 c = vUv - 0.5;
            c.x *= uAspect;
            float r = length(c);
            vec2 dir = r > 0.0 ? c / r : vec2(0.0);

            // Campo viscoso: el espacio se pliega y fluye hacia el centro
            vec2 flow = vec2(fbm(c * 3.5 + vec2(uTime * 0.22, -uTime * 0.17)), fbm(c * 3.5 - vec2(uTime * 0.19, uTime * 0.21))) - 0.5;
            vec2 q = c - dir * uWarp * 0.32 * smoothstep(0.0, 1.0, r) + flow * 0.11 * uWarp;
            q.x /= uAspect;
            vec2 uv = q + 0.5;

            // Estelas radiales y separación cromática al atravesar la membrana
            vec3 col = vec3(0.0);
            for (int i = 0; i < 12; i++) {
                float k = float(i) / 11.0;
                vec2 s = (uv - 0.5) * (1.0 - k * 0.22 * uWarp) + 0.5;
                vec2 ab = (s - 0.5) * 0.016 * uWarp;
                col.r += texture2D(tScene, s + ab).r;
                col.g += texture2D(tScene, s).g;
                col.b += texture2D(tScene, s - ab).b;
            }
            col /= 12.0;

            // Iris líquido: se cierra al entrar en la obsidiana y se abre ya dentro
            float n = fbm(c * 5.0 + uTime * 0.35);
            float edge = uReveal * 1.25 - r + (n - 0.5) * 0.22;
            float mask = smoothstep(-0.015, 0.015, edge);
            float meniscus = (1.0 - smoothstep(0.0, 0.035, abs(edge))) * step(0.001, uReveal) * step(uReveal, 0.999);
            col = col * mask + vec3(0.55, 0.62, 0.7) * meniscus * 0.35;

            gl_FragColor = vec4(col, 1.0);
        }`,
    depthTest: false,
    depthWrite: false
});
const postScene = new THREE.Scene();
postScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), postMat));

function resizeTargets() {
    const size = renderer.getDrawingBufferSize(new THREE.Vector2());
    sceneTarget.setSize(size.x, size.y);
    postMat.uniforms.uAspect.value = size.x / size.y;
}
resizeTargets();

// ==========================================================================
// 5. INTERFAZ
// ==========================================================================
const $ = (id) => document.getElementById(id);
const portadaHeader = $('portada-header');
const app = $('app');
const labelsLayer = $('labels');
const clusterNav = $('cluster-nav');
const searchInput = $('search-input');
const searchResults = $('search-results');
const filtersButton = $('filters-button');
const filtersMenu = $('filters-menu');
const filtersCount = $('filters-count');
const actions = $('actions');
const topbar = document.querySelector('.topbar');
const panel = $('panel');
const panelScope = $('panel-scope');
const panelTitle = $('panel-title');
const panelDesc = $('panel-desc');
const panelTabs = $('panel-tabs');
const panelBody = $('panel-body');

const state = {
    scene: 'portada',
    transitioning: false,
    focusCluster: null,
    selected: null,
    filamentsOn: true,
    orbitsOn: !prefersReducedMotion,
    hoverLabel: false,
    hoverNode: false,
    orbitSpeed: prefersReducedMotion ? 0 : 1,
    filters: { language: null, framework: null }
};

const esc = (s) => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
const hueOf = (topic) => topic.cluster ? CLUSTER_BY_ID[topic.cluster].hue : '#fff1d6';
const clusterNameOf = (topic) => topic.cluster ? CLUSTER_BY_ID[topic.cluster].name : 'Núcleo del atlas';

// --- Etiquetas proyectadas ---
CLUSTERS.forEach(c => {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'cluster-label';
    el.style.setProperty('--hue', c.hue);
    el.innerHTML = `<span class="dot"></span>${esc(c.name)}`;
    el.addEventListener('click', () => focusCluster(c.id));
    labelsLayer.appendChild(el);
    c.labelEl = el;
});

topicNodes.forEach(n => {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'topic-label' + (n.topic.cluster ? '' : ' is-core');
    el.style.setProperty('--hue', hueOf(n.topic));
    el.innerHTML = `<span class="dot"></span>${esc(n.topic.name)}`;
    el.addEventListener('click', () => selectTopic(n.topic.id));
    el.addEventListener('pointerenter', () => { state.hoverLabel = true; });
    el.addEventListener('pointerleave', () => { state.hoverLabel = false; });
    labelsLayer.appendChild(el);
    n.labelEl = el;
});

// --- Navegación por cúmulos ---
function renderClusterNav() {
    const items = [{ id: null, name: 'Vista general', count: ALL_TOPICS.length, hue: null }]
        .concat(CLUSTERS.map(c => ({ id: c.id, name: c.name, count: ALL_TOPICS.filter(t => t.cluster === c.id).length, hue: c.hue })));
    clusterNav.innerHTML = items.map(item => `
        <button type="button" class="cluster-item${item.id === state.focusCluster ? ' is-active' : ''}" data-cluster="${item.id || ''}">
            ${item.hue ? `<span class="dot" style="--hue:${item.hue}"></span>` : '<span class="dot dot-all"></span>'}
            <span class="cluster-name">${esc(item.name)}</span>
            <span class="cluster-count num">${item.count}</span>
        </button>`).join('');
}
clusterNav.addEventListener('click', (e) => {
    const item = e.target.closest('.cluster-item');
    if (item) focusCluster(item.dataset.cluster || null);
});

// --- Filtros por lenguaje y marco regulatorio ---
function topicMatches(topic) {
    const { language, framework } = state.filters;
    if (!language && !framework) return true;
    if (!topic.method) return false;
    return (!language || topic.method.languages.includes(language)) && (!framework || topic.method.frameworks.includes(framework));
}

function renderFilters() {
    const group = (key, title, values) => `
        <fieldset class="filter-group">
            <legend>${title}</legend>
            ${[null, ...values].map(v => `
                <button type="button" class="chip${state.filters[key] === v ? ' is-on' : ''}" data-key="${key}" data-value="${v || ''}" aria-pressed="${state.filters[key] === v}">
                    ${v ? esc(v) : 'Todos'}
                </button>`).join('')}
        </fieldset>`;
    const matching = ALL_TOPICS.filter(topicMatches).length;
    filtersMenu.innerHTML = group('language', 'Lenguaje', LANGUAGES) + group('framework', 'Marco regulatorio', FRAMEWORKS)
        + `<p class="filter-result"><span class="num">${matching}</span> de <span class="num">${ALL_TOPICS.length}</span> temas</p>`;
    const active = [state.filters.language, state.filters.framework].filter(Boolean).length;
    filtersCount.textContent = active ? String(active) : '';
    filtersCount.hidden = !active;
    topicNodes.forEach(n => {
        const on = topicMatches(n.topic);
        n.labelEl.classList.toggle('is-dim', !on);
        nodeGeo.attributes.alpha.setX(n.index, on ? 1 : 0.22);
    });
    nodeGeo.attributes.alpha.needsUpdate = true;
}
filtersMenu.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    state.filters[chip.dataset.key] = chip.dataset.value || null;
    renderFilters();
});
filtersButton.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = filtersMenu.hidden;
    filtersMenu.hidden = !open;
    filtersButton.setAttribute('aria-expanded', String(open));
});

// --- Interruptores ---
function setToggle(button, on) {
    button.setAttribute('aria-pressed', String(on));
}
$('toggle-filaments').addEventListener('click', (e) => {
    state.filamentsOn = !state.filamentsOn;
    filaments.visible = state.filamentsOn;
    setToggle(e.currentTarget, state.filamentsOn);
});
$('toggle-orbits').addEventListener('click', (e) => {
    state.orbitsOn = !state.orbitsOn;
    setToggle(e.currentTarget, state.orbitsOn);
});
$('exit-button').addEventListener('click', () => exitCosmos());
$('menu-button').addEventListener('click', (e) => {
    const open = !actions.classList.contains('is-open');
    actions.classList.toggle('is-open', open);
    e.currentTarget.setAttribute('aria-expanded', String(open));
});

// --- Buscador ---
const normalise = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const SEARCH_INDEX = ALL_TOPICS.map(t => ({
    topic: t,
    name: normalise(t.name),
    text: normalise([t.name, t.method ? t.method.name : '', t.desc, clusterNameOf(t)].join(' '))
}));
let searchActive = -1;

function runSearch() {
    const q = normalise(searchInput.value.trim());
    if (!q) {
        searchResults.hidden = true;
        return;
    }
    const words = q.split(/\s+/);
    const hits = SEARCH_INDEX
        .filter(e => words.every(w => e.text.includes(w)))
        .sort((a, b) => (b.name.startsWith(q) - a.name.startsWith(q)) || (b.name.includes(q) - a.name.includes(q)))
        .slice(0, 8);
    searchActive = hits.length ? 0 : -1;
    searchResults.innerHTML = hits.length
        ? hits.map((e, i) => `
            <li role="option" id="result-${i}" aria-selected="${i === 0}">
                <button type="button" data-id="${e.topic.id}" tabindex="-1">
                    <span class="dot" style="--hue:${hueOf(e.topic)}"></span>
                    <span class="result-name">${esc(e.topic.name)}</span>
                    <span class="result-scope">${esc(clusterNameOf(e.topic))}</span>
                </button>
            </li>`).join('')
        : `<li class="result-empty">Ningún tema contiene «${esc(searchInput.value.trim())}».</li>`;
    searchResults.hidden = false;
}

function moveSearch(step) {
    const options = [...searchResults.querySelectorAll('[role="option"]')];
    if (!options.length) return;
    searchActive = (searchActive + step + options.length) % options.length;
    options.forEach((o, i) => o.setAttribute('aria-selected', String(i === searchActive)));
    searchInput.setAttribute('aria-activedescendant', options[searchActive].id);
}

function chooseResult(id) {
    searchResults.hidden = true;
    searchInput.value = '';
    searchInput.blur();
    selectTopic(id);
}

searchInput.addEventListener('input', runSearch);
searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); moveSearch(1); }
    if (e.key === 'ArrowUp') { e.preventDefault(); moveSearch(-1); }
    if (e.key === 'Enter') {
        const option = searchResults.querySelectorAll('[role="option"] button')[searchActive];
        if (option) chooseResult(option.dataset.id);
    }
    if (e.key === 'Escape') { searchInput.value = ''; searchResults.hidden = true; searchInput.blur(); }
});
searchResults.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-id]');
    if (b) chooseResult(b.dataset.id);
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('.search')) searchResults.hidden = true;
    if (!e.target.closest('#filters-menu') && !e.target.closest('#filters-button')) {
        filtersMenu.hidden = true;
        filtersButton.setAttribute('aria-expanded', 'false');
    }
});

window.addEventListener('keydown', (e) => {
    if (state.scene !== 'cosmos') return;
    if (e.key === '/' && document.activeElement !== searchInput) {
        e.preventDefault();
        searchInput.focus();
    }
    if (e.key === 'Escape' && document.activeElement !== searchInput) {
        if (!filtersMenu.hidden) filtersMenu.hidden = true;
        else if (state.selected) closePanel();
    }
});

// ==========================================================================
// 6. PANEL DEL TEMA
// ==========================================================================
function renderMath(tex, displayMode) {
    if (window.katex) return katex.renderToString(tex, { displayMode, throwOnError: false });
    return `<code>${esc(tex)}</code>`;
}

// Texto con matemáticas en línea entre $...$ (contenido propio de conocimientos.js, puede incluir <b>)
function renderRich(text) {
    return text.split(/\$([^$]+)\$/).map((part, i) => (i % 2 ? renderMath(part, false) : part)).join('');
}

// Texto de knowledgeData.js: líneas con $$...$$, viñetas "- " y \textbf{...}
function renderMethodMath(src) {
    const html = [];
    let list = [];
    const flushList = () => {
        if (list.length) html.push(`<ul class="kb-list">${list.map(li => `<li>${li}</li>`).join('')}</ul>`);
        list = [];
    };
    const inline = (text) => text.split(/\$([^$]+)\$/).map((part, i) => i % 2
        ? renderMath(part, false)
        : esc(part).replace(/\\textbf\{([^}]*)\}/g, '<b>$1</b>')).join('');

    src.trim().split('\n').map(l => l.trim()).filter(Boolean).forEach(line => {
        const parts = line.split(/\$\$([^$]+)\$\$/);
        if (parts.length > 1) {
            flushList();
            parts.forEach((part, i) => {
                if (i % 2) html.push(`<div class="kb-formula">${renderMath(part, true)}</div>`);
                else if (part.trim()) html.push(`<p class="kb-p">${inline(part.trim())}</p>`);
            });
        } else if (line.startsWith('- ')) {
            list.push(inline(line.slice(2)));
        } else {
            flushList();
            html.push(`<p class="kb-p">${inline(line)}</p>`);
        }
    });
    flushList();
    return html.join('');
}

const CODE_NAMES = { python: 'Python', r: 'R', vba: 'Excel/VBA' };

function renderBlock(block) {
    switch (block.type) {
        case 'p':
            return `<p class="kb-p">${renderRich(block.text)}</p>`;
        case 'callout':
            return `<p class="kb-callout">${renderRich(block.text)}</p>`;
        case 'list':
            return `${block.title ? `<h4 class="kb-h">${renderRich(block.title)}</h4>` : ''}
                <ul class="kb-list">${block.items.map(item => `<li>${renderRich(item)}</li>`).join('')}</ul>`;
        case 'formula':
            return `<div class="kb-formula">
                <p class="kb-formula-label">${renderRich(block.label)}</p>
                ${renderMath(block.tex, true)}
                ${block.note ? `<p class="kb-note">${renderRich(block.note)}</p>` : ''}
            </div>`;
        case 'steps':
            return `<ol class="kb-steps">${block.items.map(step => `<li>
                <h4 class="kb-h">${renderRich(step.title)}</h4>
                <p class="kb-p">${renderRich(step.text)}</p>
                ${step.tex ? renderMath(step.tex, true) : ''}
            </li>`).join('')}</ol>`;
        case 'table': {
            // Columnas de cifras a la derecha, cabecera incluida
            const isFigure = (s) => /^[−+-]?\d[\d.,]*\s*(%|um|€)?$/.test(s.trim());
            const numeric = block.head.map((_, i) => block.rows.every(row => isFigure(row[i])));
            const cls = (i) => numeric[i] ? ' class="num"' : '';
            return `<div class="kb-table-wrap"><table class="kb-table">
                ${block.caption ? `<caption>${renderRich(block.caption)}</caption>` : ''}
                <thead><tr>${block.head.map((h, i) => `<th${cls(i)}>${renderRich(h)}</th>`).join('')}</tr></thead>
                <tbody>${block.rows.map(row => `<tr>${row.map((cell, i) => `<td${cls(i)}>${renderRich(cell)}</td>`).join('')}</tr>`).join('')}</tbody>
            </table></div>`;
        }
        case 'sources':
            return `<ul class="kb-sources">${block.items.map(item => `<li>${renderRich(item)}</li>`).join('')}</ul>`;
        case 'calculator':
            return `<div class="kb-calc" data-calc="${block.id}"></div>`;
        case 'html':
            return block.html;
        case 'code': {
            const langs = Object.keys(block.code);
            return `<div class="kb-code">
                <div class="segmented" role="tablist">${langs.map((l, i) => `<button type="button" role="tab" class="segment${i ? '' : ' is-on'}" data-lang="${l}" aria-selected="${!i}">${CODE_NAMES[l] || l}</button>`).join('')}</div>
                ${langs.map((l, i) => `<pre class="code-block" data-lang="${l}"${i ? ' hidden' : ''}><code>${esc(block.code[l].trim())}</code></pre>`).join('')}
            </div>`;
        }
        case 'related':
            return `<ul class="related-list">${block.ids.map(id => {
                const t = TOPIC_BY_ID[id];
                return `<li><button type="button" class="related-row" data-id="${id}">
                    <span class="dot" style="--hue:${hueOf(t)}"></span>
                    <span class="related-name">${esc(t.name)}</span>
                    <span class="related-scope">${esc(clusterNameOf(t))}</span>
                </button></li>`;
            }).join('')}</ul>`;
        default:
            return '';
    }
}

function sectionsFor(topic) {
    let sections;
    if (topic.knowledge && KNOWLEDGE[topic.knowledge]) {
        sections = KNOWLEDGE[topic.knowledge].sections.slice();
    } else if (topic.method) {
        const m = topic.method;
        sections = [
            { id: 'idea', title: 'Idea clave', blocks: [
                { type: 'p', text: esc(m.description) },
                { type: 'html', html: `<dl class="kb-meta">
                    <div><dt>Lenguajes</dt><dd>${m.languages.map(esc).join(', ')}</dd></div>
                    <div><dt>Marcos</dt><dd>${m.frameworks.map(esc).join(', ')}</dd></div>
                </dl>` }
            ] },
            { id: 'formulas', title: 'Fórmulas', blocks: [{ type: 'html', html: renderMethodMath(m.math) }] },
            { id: 'codigo', title: 'Código', blocks: [{ type: 'code', code: m.code }] }
        ];
        // Fuentes y destinos de knowledgeData.js que no son temas del atlas (datos, comités, supervisores)
        const external = (ids) => ids.filter(id => !TOPIC_BY_ID[id]).map(id => esc(id.replace(/_/g, ' ')));
        const inputs = external(m.upstream);
        const outputs = external(m.downstream);
        if (inputs.length) sections[0].blocks.push({ type: 'list', title: 'Se apoya en', items: inputs });
        if (outputs.length) sections[0].blocks.push({ type: 'list', title: 'Alimenta a', items: outputs });
    } else {
        sections = [{ id: 'idea', title: 'Idea clave', blocks: [{ type: 'p', text: esc(topic.desc) }] }];
    }
    const neighbours = [...NEIGHBOURS[topic.id]];
    if (neighbours.length) {
        sections.push({ id: 'relaciones', title: 'Relaciones', blocks: [{ type: 'related', ids: neighbours }] });
    }
    return sections;
}

function openPanel(topic) {
    const sections = sectionsFor(topic);
    panel.style.setProperty('--hue', hueOf(topic));
    panelScope.textContent = clusterNameOf(topic);
    panelTitle.textContent = topic.method && topic.method.name ? topic.method.name : topic.name;
    panelDesc.textContent = topic.knowledge || !topic.method ? topic.desc : '';
    panelDesc.hidden = !panelDesc.textContent || !topic.knowledge;
    panelTabs.innerHTML = sections.map((s, i) =>
        `<button type="button" role="tab" class="tab${i ? '' : ' is-on'}" data-section="${s.id}" aria-selected="${!i}">${s.title}</button>`).join('');
    panelBody.innerHTML = sections.map((s, i) =>
        `<section class="kb-section" data-section="${s.id}"${i ? ' hidden' : ''}>${s.blocks.map(renderBlock).join('')}</section>`).join('');
    panelBody.querySelectorAll('.kb-calc').forEach(mountCalculator);
    panelBody.scrollTop = 0;
    panel.hidden = false;
    app.classList.add('has-panel');
}

function closePanel() {
    panel.hidden = true;
    app.classList.remove('has-panel');
    state.selected = null;
    relationLines.visible = false;
    syncLabelStates();
}

panelTabs.addEventListener('click', (e) => {
    const tab = e.target.closest('.tab');
    if (!tab) return;
    panelTabs.querySelectorAll('.tab').forEach(t => {
        t.classList.toggle('is-on', t === tab);
        t.setAttribute('aria-selected', String(t === tab));
    });
    panelBody.querySelectorAll('.kb-section').forEach(s => { s.hidden = s.dataset.section !== tab.dataset.section; });
    panelBody.scrollTop = 0;
});

panelBody.addEventListener('click', (e) => {
    const segment = e.target.closest('.segment');
    if (segment) {
        const wrap = segment.closest('.kb-code');
        wrap.querySelectorAll('.segment').forEach(s => {
            s.classList.toggle('is-on', s === segment);
            s.setAttribute('aria-selected', String(s === segment));
        });
        wrap.querySelectorAll('.code-block').forEach(b => { b.hidden = b.dataset.lang !== segment.dataset.lang; });
    }
    const row = e.target.closest('.related-row');
    if (row) selectTopic(row.dataset.id);
});

$('panel-close').addEventListener('click', closePanel);

function mountCalculator(el) {
    const calc = CALCULATORS[el.dataset.calc];
    if (!calc) return;
    const values = {};
    calc.inputs.forEach(input => { values[input.id] = input.value; });

    el.innerHTML = `
        <h4 class="kb-h">${renderRich(calc.title)}</h4>
        <div class="kb-calc-inputs">${calc.inputs.map(input => `
            <label class="kb-field">
                <span>${renderRich(input.label)}</span>
                <input type="number" inputmode="decimal" step="${input.step}" value="${input.value}" data-id="${input.id}">
            </label>`).join('')}
        </div>
        <div class="kb-calc-outputs"></div>
        <div class="kb-chart"></div>`;

    const outputsEl = el.querySelector('.kb-calc-outputs');
    const chartEl = el.querySelector('.kb-chart');
    const update = () => {
        const result = calc.compute(values);
        outputsEl.innerHTML = result.outputs.map(o => `
            <div class="kb-out">
                <span class="kb-out-label">${renderRich(o.label)}</span>
                <span class="kb-out-value num">${o.value}</span>
                ${o.note ? `<span class="kb-note">${renderRich(o.note)}</span>` : ''}
            </div>`).join('');
        chartEl.innerHTML = result.chart ? renderBarChart(result.chart) : '';
    };
    el.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', () => {
            const v = parseFloat(input.value);
            if (Number.isFinite(v)) {
                values[input.dataset.id] = v;
                update();
            }
        });
    });
    update();
}

// Barras agrupadas por edad, escala con pasos redondos por encima del máximo
function renderBarChart(chart) {
    const W = 640, H = 220, padL = 34, padR = 8, padT = 10, padB = 24;
    const n = chart.series[0].values.length;
    const rawMax = Math.max(1e-9, ...chart.series.flatMap(s => s.values.filter(Number.isFinite)));
    const step = Math.pow(10, Math.floor(Math.log10(rawMax / 4)));
    const tick = [1, 2, 2.5, 5, 10].map(m => m * step).find(s => rawMax / s <= 4) || step * 10;
    const max = Math.ceil(rawMax / tick) * tick;
    const slot = (W - padL - padR) / n;
    const barW = (slot * 0.85) / chart.series.length;
    const y = v => padT + (H - padT - padB) * (1 - Math.max(0, v) / max);

    let bars = '';
    chart.series.forEach((s, k) => {
        s.values.forEach((v, i) => {
            if (!Number.isFinite(v)) return;
            const x = padL + i * slot + k * barW;
            bars += `<rect x="${x.toFixed(1)}" y="${y(v).toFixed(1)}" width="${Math.max(barW - 0.4, 0.6).toFixed(1)}" height="${(H - padB - y(v)).toFixed(1)}" style="fill:${s.color}"/>`;
        });
    });
    let axes = '';
    for (let v = 0; v <= max + 1e-9; v += tick) {
        const yy = y(v);
        axes += `<line x1="${padL}" x2="${W - padR}" y1="${yy}" y2="${yy}" class="kb-grid"/>
            <text x="${padL - 6}" y="${yy + 3}" text-anchor="end" class="kb-axis">${v.toLocaleString('es-ES', { maximumFractionDigits: 1 })}</text>`;
    }
    for (let i = 0; i < n; i++) {
        const age = chart.startAge + i;
        if (age % 10 === 0) axes += `<text x="${(padL + (i + 0.5) * slot).toFixed(1)}" y="${H - 6}" text-anchor="middle" class="kb-axis">${age}</text>`;
    }
    const xr = padL + chart.retireIndex * slot;
    axes += `<line x1="${xr}" x2="${xr}" y1="${padT}" y2="${H - padB}" class="kb-retire"/>`;
    const legend = chart.series.map(s => `<span><i style="background:${s.color}"></i>${s.name}</span>`).join('');
    return `<figure class="kb-figure">
        <figcaption>${chart.caption}<span class="kb-legend">${legend}</span></figcaption>
        <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${chart.caption}">${axes}${bars}</svg>
        <p class="kb-note">La línea discontinua marca la jubilación.</p>
    </figure>`;
}

// ==========================================================================
// 7. NAVEGACIÓN DE CÁMARA
// ==========================================================================
function flyTo(position, target, duration = 1.4) {
    gsap.killTweensOf(camera.position);
    gsap.killTweensOf(controls.target);
    gsap.to(camera.position, { duration, x: position.x, y: position.y, z: position.z, ease: 'power3.inOut' });
    gsap.to(controls.target, { duration, x: target.x, y: target.y, z: target.z, ease: 'power3.inOut' });
}

function focusCluster(id) {
    state.focusCluster = id;
    renderClusterNav();
    syncLabelStates();
    if (!id) {
        flyTo(overviewPosition(), GA_POS, 1.6);
        return;
    }
    const c = CLUSTER_BY_ID[id];
    const center = clusterCenters[id];
    const out = center.clone().normalize();
    const pos = center.clone().addScaledVector(out, c.radius * 3.4 * viewScale()).add(new THREE.Vector3(0, c.radius * 1.1, 0));
    flyTo(pos, center, 1.6);
}

function selectTopic(id) {
    const topic = TOPIC_BY_ID[id];
    if (!topic) return;
    state.selected = id;
    state.orbitSpeed = 0; // el tema se detiene al instante para que la cámara llegue a él
    state.focusCluster = topic.cluster;
    renderClusterNav();
    openPanel(topic);
    syncLabelStates();
    const node = NODE_BY_ID[id];
    const center = topic.cluster ? clusterCenters[topic.cluster] : GA_POS;
    const out = node.pos.clone().sub(center).normalize();
    if (!topic.cluster) out.set(0.45, 0.35, 0.82).normalize();
    // Desde fuera del cúmulo, para mirar el tema sin quedar dentro de su núcleo
    const pos = node.pos.clone().addScaledVector(out, 230 * viewScale()).add(new THREE.Vector3(0, 70, 0));
    const target = node.pos.clone();

    // En escritorio el panel ocupa la derecha: el tema queda en el centro del espacio libre
    if (window.innerWidth > 760) {
        const panelShare = (panel.getBoundingClientRect().width + 14) / window.innerWidth;
        const distance = pos.distanceTo(target);
        const visibleWidth = 2 * distance * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * camera.aspect;
        const right = new THREE.Vector3().crossVectors(target.clone().sub(pos), camera.up).normalize();
        const shift = right.multiplyScalar(visibleWidth * panelShare / 2);
        pos.add(shift);
        target.add(shift);
    }
    flyTo(pos, target, 1.3);
}

function syncLabelStates() {
    topicNodes.forEach(n => {
        const selected = state.selected === n.topic.id;
        const related = state.selected && NEIGHBOURS[state.selected].has(n.topic.id);
        n.labelEl.classList.toggle('is-selected', selected);
        n.labelEl.classList.toggle('is-related', !!related);
        nodeGeo.attributes.size.setX(n.index, selected ? NODE_SIZE.selected : (n.topic.cluster ? NODE_SIZE.topic : NODE_SIZE.core));
    });
    nodeGeo.attributes.size.needsUpdate = true;
    orbitLines.children.forEach(l => { l.visible = l.userData.cluster === state.focusCluster; });
}

// ==========================================================================
// 8. ENTRAR Y SALIR DE LA OBSIDIANA
// ==========================================================================
function showCosmos() {
    portada.visible = false;
    cosmos.visible = true;
    scene.background = COLOR_SPACE.clone();
    state.scene = 'cosmos';
    document.body.classList.replace('scene-portada', 'scene-cosmos');
    // La interfaz aparece cuando la membrana termina de abrirse (finishTransition)
    app.classList.add('is-arriving');
    app.hidden = false;
    controls.enablePan = true;
    controls.target.copy(GA_POS);
}

function showPortada() {
    closePanel();
    cosmos.visible = false;
    portada.visible = true;
    scene.background = COLOR_STUDIO.clone();
    state.scene = 'portada';
    state.focusCluster = null;
    document.body.classList.replace('scene-cosmos', 'scene-portada');
    app.hidden = true;
    controls.enablePan = false;
    controls.autoRotate = false;
    controls.target.set(0, 0, 0);
}

// Durante una transición la cámara cruza los límites de distancia de ambas escenas
function beginTransition() {
    state.transitioning = true;
    controls.enabled = false;
    controls.autoRotate = false;
    controls.minDistance = 0.1;
    controls.maxDistance = 1e5;
}

function enterCosmos() {
    if (state.transitioning || state.scene !== 'portada') return;
    beginTransition();
    portadaHeader.classList.add('is-hidden');

    if (prefersReducedMotion) {
        gsap.timeline({ onComplete: finishTransition })
            .to(post, { reveal: 0, duration: 0.4 })
            .call(() => { showCosmos(); camera.position.copy(overviewPosition()); })
            .to(post, { reveal: 1, duration: 0.4 });
        return;
    }

    const toward = camera.position.clone().normalize();
    const surface = toward.multiplyScalar(SPHERE_RADIUS * 1.04);
    const { x, y, z } = overviewPosition();
    const overview = { x, y, z };
    gsap.timeline({ onComplete: finishTransition })
        .to(camera.position, { duration: 1.5, x: surface.x, y: surface.y, z: surface.z, ease: 'power3.in', onUpdate: () => camera.lookAt(0, 0, 0) }, 0)
        .to(post, { warp: 1, duration: 1.5, ease: 'power2.in' }, 0)
        .to(post, { reveal: 0, duration: 0.6, ease: 'power2.in' }, 0.95)
        .call(showCosmos, null, 1.55)
        .fromTo(camera.position, { x: 6, y: 4, z: 26 }, { ...overview, duration: 3, ease: 'power2.out', immediateRender: false, onUpdate: () => camera.lookAt(GA_POS) }, 1.6)
        .to(post, { reveal: 1, duration: 1.3, ease: 'power2.out' }, 1.65)
        .to(post, { warp: 0, duration: 2.4, ease: 'power2.out' }, 1.65);
}

function exitCosmos() {
    if (state.transitioning || state.scene !== 'cosmos') return;
    beginTransition();
    actions.classList.remove('is-open');
    app.classList.add('is-arriving');
    portadaHeader.hidden = false; // sigue con .is-hidden hasta que la membrana se abre en la portada

    gsap.killTweensOf(camera.position);
    gsap.killTweensOf(controls.target);
    gsap.timeline({ onComplete: () => { portadaHeader.classList.remove('is-hidden'); finishTransition(); } })
        .to(camera.position, { duration: 1.2, x: 4, y: 3, z: 20, ease: 'power3.in', onUpdate: () => camera.lookAt(GA_POS) }, 0)
        .to(post, { warp: 1, duration: 1.2, ease: 'power2.in' }, 0)
        .to(post, { reveal: 0, duration: 0.5, ease: 'power2.in' }, 0.7)
        .call(showPortada, null, 1.25)
        .fromTo(camera.position, { x: 0, y: 30, z: SPHERE_RADIUS * 1.15 }, { x: CAM_PORTADA.x, y: CAM_PORTADA.y, z: CAM_PORTADA.z, duration: 2, ease: 'power2.out', immediateRender: false, onUpdate: () => camera.lookAt(0, 0, 0) }, 1.3)
        .to(post, { reveal: 1, duration: 1, ease: 'power2.out' }, 1.35)
        .to(post, { warp: 0, duration: 1.6, ease: 'power2.out' }, 1.35);
}

function finishTransition() {
    [controls.minDistance, controls.maxDistance] = DISTANCE_LIMITS[state.scene];
    app.classList.remove('is-arriving');
    portadaHeader.hidden = state.scene === 'cosmos';
    state.transitioning = false;
    controls.enabled = true;
    controls.update();
}

// ==========================================================================
// 9. PUNTERO Y TACTO
// ==========================================================================
const raycaster = new THREE.Raycaster();
const ndc = new THREE.Vector2();

function hitAt(clientX, clientY, objects) {
    ndc.set((clientX / window.innerWidth) * 2 - 1, -(clientY / window.innerHeight) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    return raycaster.intersectObjects(objects, false)[0] || null;
}

renderer.domElement.addEventListener('dblclick', (e) => {
    if (state.scene === 'portada' && hitAt(e.clientX, e.clientY, [obsidian])) enterCosmos();
});

// Doble toque en móvil y toque simple en el cosmos
let tapStart = null;
let lastTap = { time: 0, x: 0, y: 0 };
renderer.domElement.addEventListener('pointerdown', (e) => {
    tapStart = { x: e.clientX, y: e.clientY, time: performance.now() };
});
renderer.domElement.addEventListener('pointerup', (e) => {
    if (!tapStart || state.transitioning) return;
    const moved = Math.hypot(e.clientX - tapStart.x, e.clientY - tapStart.y);
    const quick = performance.now() - tapStart.time < 350;
    tapStart = null;
    if (moved > 8 || !quick) return;

    if (state.scene === 'portada') {
        if (e.pointerType !== 'touch') return; // el ratón usa dblclick
        const now = performance.now();
        const near = Math.hypot(e.clientX - lastTap.x, e.clientY - lastTap.y) < 45;
        if (now - lastTap.time < 420 && near && hitAt(e.clientX, e.clientY, [obsidian])) {
            lastTap.time = 0;
            enterCosmos();
        } else {
            lastTap = { time: now, x: e.clientX, y: e.clientY };
        }
        return;
    }

    const hit = hitAt(e.clientX, e.clientY, topicNodes.map(n => n.hit));
    if (hit) selectTopic(hit.object.userData.topicId);
    else if (state.selected) closePanel();
});

window.addEventListener('pointermove', (e) => {
    pointer.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
    if (state.transitioning || e.target !== renderer.domElement) return;
    state.hoverLabel = false; // el puntero está sobre el lienzo, no sobre una etiqueta
    if (state.scene === 'portada') {
        document.body.style.cursor = hitAt(e.clientX, e.clientY, [obsidian]) ? 'pointer' : '';
        return;
    }
    state.hoverNode = !!hitAt(e.clientX, e.clientY, topicNodes.map(n => n.hit));
    document.body.style.cursor = state.hoverNode ? 'pointer' : '';
});

// En la portada, acercarse con la rueda o el pellizco hasta casi tocar la superficie también entra
controls.addEventListener('change', () => {
    if (state.scene === 'portada' && !state.transitioning && camera.position.length() < DISTANCE_LIMITS.portada[0] + 30) enterCosmos();
});

// ==========================================================================
// 10. BUCLE
// ==========================================================================
const clock = new THREE.Clock();
const projected = new THREE.Vector3();

let labelRightEdge = Infinity; // borde izquierdo del panel abierto: las etiquetas no se asoman bajo él
let labelTopEdge = 0;          // bajo la barra superior
const LABEL_MARGIN = 16;

function placeLabel(el, worldPos, visible) {
    projected.copy(worldPos).project(camera);
    const x = Math.round((projected.x * 0.5 + 0.5) * window.innerWidth);
    const y = Math.round((-projected.y * 0.5 + 0.5) * window.innerHeight);
    // Geometría según el anclaje de cada tipo (ver translate en style.css)
    const w = el.offsetWidth, h = el.offsetHeight;
    const isCluster = el.classList.contains('cluster-label');
    const isCore = el.classList.contains('is-core');
    const left = isCluster || isCore ? x - w / 2 : x + 10;
    const top = isCluster ? y - h : isCore ? y + 14 : y - h / 2;
    const rect = { left: left - 4, right: left + w + 4, top: top - 2, bottom: top + h + 2 };
    const onScreen = visible && projected.z < 1
        && left >= LABEL_MARGIN && left + w <= Math.min(labelRightEdge, window.innerWidth - LABEL_MARGIN)
        && y >= labelTopEdge && y <= window.innerHeight - LABEL_MARGIN
        && !placedLabels.some(r => r.left < rect.right && rect.left < r.right && r.top < rect.bottom && rect.top < r.bottom);
    el.classList.toggle('is-off', !onScreen);
    if (!onScreen) return;
    placedLabels.push(rect);
    el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
}

// Una etiqueta que choca con otra ya colocada no se dibuja: seleccionado, núcleo, cúmulos, el resto
const placedLabels = [];
const labelPriority = (n) => state.selected === n.topic.id ? 0 : !n.topic.cluster ? 1 : 2;

function updateCosmos(dt) {
    const paused = state.hoverLabel || state.hoverNode;
    const wantOrbit = state.orbitsOn && !state.selected && !paused ? 1 : 0;
    state.orbitSpeed += (wantOrbit - state.orbitSpeed) * Math.min(1, dt * 3);

    topicNodes.forEach(n => {
        n.theta += n.omega * dt * state.orbitSpeed;
        n.pos.copy(n.center).addScaledVector(n.axisU, n.r * Math.cos(n.theta)).addScaledVector(n.axisV, n.r * Math.sin(n.theta));
        nodeGeo.attributes.position.setXYZ(n.index, n.pos.x, n.pos.y, n.pos.z);
        n.hit.position.copy(n.pos);
    });
    nodeGeo.attributes.position.needsUpdate = true;

    if (filaments.visible) {
        const arr = pulseGeo.attributes.position.array;
        const p = new THREE.Vector3();
        pulseState.forEach((s, i) => {
            s.t += s.speed * dt;
            if (s.t > 1) s.t -= 1;
            s.f.curve.getPoint(s.t, p);
            arr[i * 3] = p.x; arr[i * 3 + 1] = p.y; arr[i * 3 + 2] = p.z;
        });
        pulseGeo.attributes.position.needsUpdate = true;
    }

    if (state.selected) {
        const from = NODE_BY_ID[state.selected].pos;
        const arr = relationGeo.attributes.position.array;
        let k = 0;
        NEIGHBOURS[state.selected].forEach(id => {
            const to = NODE_BY_ID[id].pos;
            arr.set([from.x, from.y, from.z, to.x, to.y, to.z], k * 6);
            k++;
        });
        relationGeo.setDrawRange(0, k * 2);
        relationGeo.attributes.position.needsUpdate = true;
        relationLines.visible = k > 0;
    }

    // Etiquetas: los temas de un cúmulo aparecen al acercarse o al enfocarlo
    labelRightEdge = panel.hidden || window.innerWidth <= 760 ? Infinity : panel.getBoundingClientRect().left - 8;
    labelTopEdge = topbar.getBoundingClientRect().bottom + LABEL_MARGIN + 15; // media altura de etiqueta incluida
    placedLabels.length = 0;
    CLUSTERS.forEach(c => {
        c.near = state.focusCluster === c.id || camera.position.distanceTo(clusterCenters[c.id]) < c.radius * 5.2;
    });
    const topicVisible = (n) => !n.topic.cluster
        || CLUSTER_BY_ID[n.topic.cluster].near
        || state.selected === n.topic.id
        || (state.selected && NEIGHBOURS[state.selected].has(n.topic.id));
    const ordered = [...topicNodes].sort((a, b) => labelPriority(a) - labelPriority(b));
    const [first, rest] = [ordered.filter(n => labelPriority(n) < 2), ordered.filter(n => labelPriority(n) === 2)];
    first.forEach(n => placeLabel(n.labelEl, n.pos, topicVisible(n)));
    CLUSTERS.forEach(c => placeLabel(c.labelEl, clusterCenters[c.id].clone().add(new THREE.Vector3(0, c.radius * 1.05, 0)), true));
    rest.forEach(n => placeLabel(n.labelEl, n.pos, topicVisible(n)));

    controls.autoRotate = state.orbitsOn && !state.selected && !paused && !state.transitioning;
}

function animate() {
    requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    if (state.scene === 'portada') {
        obsidianMat.uniforms.uPointer.value.lerp(pointer, 0.06);
    } else {
        updateCosmos(dt);
    }
    controls.update();

    const usePost = post.warp > 0.001 || post.reveal < 0.999;
    if (usePost) {
        postMat.uniforms.uWarp.value = post.warp;
        postMat.uniforms.uReveal.value = post.reveal;
        postMat.uniforms.uTime.value = t;
        renderer.setRenderTarget(sceneTarget);
        renderer.render(scene, camera);
        renderer.setRenderTarget(null);
        renderer.render(postScene, postCamera);
    } else {
        renderer.render(scene, camera);
    }
}

renderClusterNav();
renderFilters();
setToggle($('toggle-orbits'), state.orbitsOn);
camera.lookAt(0, 0, 0);
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    updatePointScale();
    resizeTargets();
});
