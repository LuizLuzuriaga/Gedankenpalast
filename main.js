/**
 * Gendanken Palast - Experiencia 3D Interactiva
 * Escena 1: Portada (Fondo blanco, texto único, bola negra explorable y zoom)
 * Escena 2: Grafo de Conocimiento Cosmológico (4 caminos, El Gran Atractor, puntos brillantes)
 */

// --- DATOS DE LOS 4 CAMINOS Y CONCEPTOS ---
const CONCEPTS = [
    // CENTRO: EL GRAN ATRACTOR
    {
        id: "gran_atractor",
        name: "El Gran Atractor",
        category: "Centro Unificador",
        color: "#ffffff",
        haloColor: "#fde047",
        size: 18,
        pathId: "center",
        pos: [0, 0, 0],
        desc: "El núcleo gravitacional y conceptual donde convergen las 4 disciplinas. Representa la síntesis unificadora de las matemáticas, la econometría, la modelización actuarial y la ciencia de datos para cuantificar la incertidumbre y tomar decisiones óptimas.",
        connections: ["Estadística", "Macroeconomía", "Gestión de riesgos", "Cálculo", "Optimización"]
    },

    // CAMINO 1: DATA SCIENCE
    {
        id: "ds_estadistica",
        name: "Estadística",
        category: "Data Science",
        color: "#38bdf8",
        haloColor: "#0284c7",
        size: 13,
        pathId: "ds",
        pos: [95, 55, 75],
        desc: "Fundamento del análisis empírico y diseño experimental: estimación puntual, intervalos de confianza, contrastes de hipótesis y teoría asintótica para inferir propiedades poblacionales a partir de muestras.",
        connections: ["Probabilidad", "Econometría", "Machine Learning supervisado"]
    },
    {
        id: "ds_econometria",
        name: "Econometría (Modelos Econométricos)",
        category: "Data Science",
        color: "#38bdf8",
        haloColor: "#0284c7",
        size: 12,
        pathId: "ds",
        pos: [165, 95, 130],
        desc: "Modelos econométricos aplicados a la ciencia de datos: especificación, estimación por MCO/MCG, contraste de endogeneidad, series temporales, modelos autorregresivos y evaluación de causalidad.",
        connections: ["Econometría (Economía)", "Estadística", "Machine Learning supervisado"]
    },
    {
        id: "ds_ml_supervisado",
        name: "Machine Learning supervisado",
        category: "Data Science",
        color: "#38bdf8",
        haloColor: "#0284c7",
        size: 13,
        pathId: "ds",
        pos: [240, 135, 185],
        desc: "Algoritmos entrenados con datos etiquetados para predecir variables continuas o discretas: modelos lineales generalizados (GLM), árboles de decisión, Random Forest, XGBoost y Support Vector Machines (SVM).",
        connections: ["Álgebra lineal", "Optimización", "Machine Learning no supervisado", "Deep Learning"]
    },
    {
        id: "ds_ml_no_supervisado",
        name: "Machine Learning no supervisado",
        category: "Data Science",
        color: "#38bdf8",
        haloColor: "#0284c7",
        size: 12,
        pathId: "ds",
        pos: [310, 175, 235],
        desc: "Descubrimiento de patrones latentes y agrupaciones intrínsecas en datos no etiquetados: algoritmos de clustering (K-means, jerárquico, DBSCAN) y técnicas de reducción de dimensionalidad (PCA, t-SNE, UMAP).",
        connections: ["Álgebra lineal", "Data Mining", "Machine Learning supervisado"]
    },
    {
        id: "ds_deep_learning",
        name: "Deep Learning",
        category: "Data Science",
        color: "#38bdf8",
        haloColor: "#0284c7",
        size: 13,
        pathId: "ds",
        pos: [380, 215, 285],
        desc: "Redes neuronales profundas con representaciones jerárquicas multinivel: perceptrón multicapa, redes convolucionales (CNN), recurrentes (LSTM) y arquitecturas Transformer para aprendizaje no lineal extremo.",
        connections: ["Cálculo", "Optimización", "Machine Learning supervisado"]
    },
    {
        id: "ds_data_mining",
        name: "Data Mining",
        category: "Data Science",
        color: "#38bdf8",
        haloColor: "#0284c7",
        size: 11,
        pathId: "ds",
        pos: [450, 255, 335],
        desc: "Prospección y extracción automática de información procesable y reglas de asociación en almacenes masivos de datos estructurados y no estructurados.",
        connections: ["Machine Learning no supervisado", "Estadística"]
    },

    // CAMINO 2: ECONOMÍA
    {
        id: "eco_macro",
        name: "Macroeconomía",
        category: "Economía",
        color: "#34d399",
        haloColor: "#059669",
        size: 13,
        pathId: "eco",
        pos: [-110, 65, 80],
        desc: "Análisis del comportamiento global del sistema económico: producto interior bruto (PIB), dinámicas de inflación, curvas de tipos de interés, política monetaria, ciclos y modelos de equilibrio dinámico estocástico (DSGE).",
        connections: ["Microeconomía", "Econometría", "Gestión de riesgos"]
    },
    {
        id: "eco_micro",
        name: "Microeconomía",
        category: "Economía",
        color: "#34d399",
        haloColor: "#059669",
        size: 13,
        pathId: "eco",
        pos: [-200, 120, 145],
        desc: "Modelización del comportamiento de agentes individuales (consumidores y empresas): maximización de utilidad con restricciones, teoría de producción, fijación de precios, estructuras de mercado y teoría de juegos.",
        connections: ["Optimización", "Macroeconomía", "Seguros No Vida"]
    },
    {
        id: "eco_econometria",
        name: "Econometría",
        category: "Economía",
        color: "#34d399",
        haloColor: "#059669",
        size: 12,
        pathId: "eco",
        pos: [-285, 175, 210],
        desc: "Herramienta cuantitativa esencial para contrastar empíricamente teorías económicas mediante datos observacionales y paneles de datos, conectando directamente con los métodos de Data Science.",
        connections: ["Econometría (Modelos Econométricos)", "Macroeconomía", "Estadística"]
    },

    // CAMINO 3: CIENCIAS ACTUARIALES
    {
        id: "act_gestion_riesgos",
        name: "Gestión de riesgos",
        category: "Ciencias Actuariales",
        color: "#fbbf24",
        haloColor: "#d97706",
        size: 13,
        pathId: "act",
        pos: [-100, -65, -80],
        desc: "Marco integral de identificación, medición y control de exposiciones financieras y biométricas: métricas de cola como Valor en Riesgo (VaR) y Expected Shortfall (TVaR), junto con pruebas de estrés y escenarios extremos.",
        connections: ["Solvencia (Solvencia II)", "Macroeconomía", "Probabilidad"]
    },
    {
        id: "act_solvencia",
        name: "Solvencia (Solvencia II)",
        category: "Ciencias Actuariales",
        color: "#fbbf24",
        haloColor: "#d97706",
        size: 14,
        pathId: "act",
        pos: [-175, -115, -145],
        desc: "Régimen regulatorio europeo de solvencia prudencial para aseguradoras: cálculo del Capital de Solvencia Obligatorio (SCR) mediante fórmula estándar o modelos internos, Pillar II (ORSA) y disciplina de mercado.",
        connections: ["Gestión de riesgos", "IFRS 17", "Seguros de Vida", "Seguros No Vida"]
    },
    {
        id: "act_ifrs17",
        name: "IFRS 17",
        category: "Ciencias Actuariales",
        color: "#fbbf24",
        haloColor: "#d97706",
        size: 13,
        pathId: "act",
        pos: [-245, -165, -205],
        desc: "Estándar contable internacional de contratos de seguro: valoración económica de pasivos mediante flujos de efectivo descontados insesgados (BEL), Ajuste por Riesgo (RA) y Margen de Servicio Contractual (CSM).",
        connections: ["Contabilidad", "Solvencia (Solvencia II)"]
    },
    {
        id: "act_contabilidad",
        name: "Contabilidad",
        category: "Ciencias Actuariales",
        color: "#fbbf24",
        haloColor: "#d97706",
        size: 11,
        pathId: "act",
        pos: [-305, -210, -255],
        desc: "Registro sistemático y divulgación del balance y cuenta técnica: devengo del margen de servicio, liberación de reservas técnicas y reconciliación contable-actuarial.",
        connections: ["IFRS 17"]
    },
    {
        id: "act_vida",
        name: "Seguros de Vida",
        category: "Ciencias Actuariales",
        color: "#fbbf24",
        haloColor: "#d97706",
        size: 13,
        pathId: "act",
        pos: [-365, -250, -305],
        desc: "Modelización estocástica y determinista de riesgos biométricos: tablas de mortalidad dinámicas, riesgo de longevidad, rentas vitalicias, conmutación actuarial y proyecciones de supervivencia.",
        connections: ["Probabilidad", "Solvencia (Solvencia II)"]
    },
    {
        id: "act_no_vida",
        name: "Seguros No Vida",
        category: "Ciencias Actuariales",
        color: "#fbbf24",
        haloColor: "#d97706",
        size: 13,
        pathId: "act",
        pos: [-430, -295, -360],
        desc: "Tarificación y reservas en seguros generales: procesos de Poisson y binomial negativa para frecuencia, distribuciones de cola pesada para severidad, credibilidad y triángulos IBNR (Chain Ladder).",
        connections: ["Microeconomía", "Solvencia (Solvencia II)", "Estadística"]
    },

    // CAMINO 4: MATEMÁTICAS Y PROBABILIDAD
    {
        id: "mat_calculo",
        name: "Cálculo",
        category: "Matemáticas y Probabilidad",
        color: "#c084fc",
        haloColor: "#7e22ce",
        size: 13,
        pathId: "mat",
        pos: [105, -60, -70],
        desc: "Cálculo diferencial e integral multivariable, cálculo vectorial y cálculo estocástico (Lema de Itô): análisis de tasas instantáneas de cambio, integrales de contorno y ecuaciones diferenciales ordinarias y parciales.",
        connections: ["Optimización", "Probabilidad", "Deep Learning"]
    },
    {
        id: "mat_algebra",
        name: "Álgebra lineal",
        category: "Matemáticas y Probabilidad",
        color: "#c084fc",
        haloColor: "#7e22ce",
        size: 13,
        pathId: "mat",
        pos: [185, -110, -130],
        desc: "Teoría de espacios vectoriales y transformaciones lineales: cálculo matricial, descomposiciones ortogonales, autovalores/autovectores, descomposición en valores singulares (SVD) y tensores.",
        connections: ["Machine Learning supervisado", "Machine Learning no supervisado", "Optimización"]
    },
    {
        id: "mat_optimizacion",
        "name": "Optimización",
        "category": "Matemáticas y Probabilidad",
        "color": "#c084fc",
        "haloColor": "#7e22ce",
        "size": 13,
        "pathId": "mat",
        "pos": [265, -160, -190],
        "desc": "Optimización estática y dinámica: programación lineal, cuadrática, convexa, condiciones de Karush-Kuhn-Tucker (KKT), métodos de gradiente descendente y multiplicadores de Lagrange.",
        "connections": ["Cálculo", "Machine Learning supervisado", "Microeconomía"]
    },
    {
        id: "mat_probabilidad",
        "name": "Probabilidad",
        "category": "Matemáticas y Probabilidad",
        "color": "#c084fc",
        "haloColor": "#7e22ce",
        "size": 14,
        "pathId": "mat",
        "pos": [345, -210, -250],
        "desc": "Formalización matemática del azar mediante teoría de la medida: espacios de probabilidad, variables aleatorias, esperanza condicional, martingalas, ley fuerte de los grandes números y teorema central del límite.",
        "connections": ["Estadística", "Seguros de Vida", "Gestión de riesgos"]
    }
];

// --- 1. SETUP DE ESCENA, CÁMARA Y RENDERER ---
const container = document.getElementById('webgl-container');
const scene = new THREE.Scene();

const COLOR_WHITE = new THREE.Color(0xffffff);
const COLOR_SPACE = new THREE.Color(0x03050b);

scene.background = COLOR_WHITE.clone();

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 8000);
const CAM_PORTADA = { x: 0, y: 0, z: 750 };
camera.position.set(CAM_PORTADA.x, CAM_PORTADA.y, CAM_PORTADA.z);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0xffffff, 1);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.35;
container.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 35;
controls.maxDistance = 3200;
controls.rotateSpeed = 0.65;
controls.zoomSpeed = 0.85;

// Soporte táctil explícito para móvil
controls.touches = {
    ONE: THREE.TOUCH.ROTATE,
    TWO: THREE.TOUCH.DOLLY_PAN
};

// Generador de textura procedural para brillo de los puntos (Canvas Glow Sprite)
function createGlowTexture(size = 128) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const center = size / 2;
    const gradient = ctx.createRadialGradient(center, center, 0, center, center, center);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.9)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.35)');
    gradient.addColorStop(0.85, 'rgba(255, 255, 255, 0.06)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}
const glowTexture = createGlowTexture(128);

// ==========================================================================
// ESCENA 1: PORTADA (FONDO BLANCO, BOLA NEGRA EN EL CENTRO)
// ==========================================================================
const scenePortada = new THREE.Group();
scene.add(scenePortada);

const sphereRadius = 140;
const sphereGeo = new THREE.SphereGeometry(sphereRadius, 64, 64);
const sphereMat = new THREE.MeshBasicMaterial({
    color: 0x05070c,
    transparent: true,
    opacity: 1.0
});
const blackSphere = new THREE.Mesh(sphereGeo, sphereMat);
scenePortada.add(blackSphere);

// Sombra de contacto suave en el fondo blanco
const shadowGeo = new THREE.RingGeometry(10, sphereRadius * 1.35, 64);
const shadowMat = new THREE.MeshBasicMaterial({
    color: 0xd8e0ea,
    transparent: true,
    opacity: 0.75,
    side: THREE.DoubleSide
});
const contactShadow = new THREE.Mesh(shadowGeo, shadowMat);
contactShadow.rotation.x = Math.PI / 2;
contactShadow.position.y = -sphereRadius - 5;
scenePortada.add(contactShadow);

// ==========================================================================
// ESCENA 2: GRAFO DE CONOCIMIENTO EN 3D (RENDERIZADO DESDE EL PRINCIPIO)
// ==========================================================================
const sceneCosmos = new THREE.Group();
sceneCosmos.visible = false; // Se activa al cruzar la portada
scene.add(sceneCosmos);

const conceptMeshes = [];
const labelsContainer = document.getElementById('labels-container');

// Map de coordenadas
const conceptMap = {};
CONCEPTS.forEach(c => {
    conceptMap[c.id] = new THREE.Vector3(c.pos[0], c.pos[1], c.pos[2]);
    conceptMap[c.name] = new THREE.Vector3(c.pos[0], c.pos[1], c.pos[2]);
});

// A) PUNTOS BRILLANTES (Cada punto es un concepto de conocimiento)
CONCEPTS.forEach(concept => {
    const nodeGroup = new THREE.Group();
    nodeGroup.position.set(concept.pos[0], concept.pos[1], concept.pos[2]);

    const isCenter = concept.id === "gran_atractor";

    // 1. Núcleo esférico brillante
    const coreGeo = new THREE.SphereGeometry(concept.size * 0.45, 32, 32);
    const coreMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(concept.color),
        transparent: true,
        opacity: 0.98
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.userData = { concept: concept };
    nodeGroup.add(coreMesh);

    // Hit area invisible para fácil interacción táctil y con ratón
    const hitGeo = new THREE.SphereGeometry(Math.max(20, concept.size * 1.8), 16, 16);
    const hitMat = new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        depthWrite: false
    });
    const hitMesh = new THREE.Mesh(hitGeo, hitMat);
    hitMesh.userData = { concept: concept };
    nodeGroup.add(hitMesh);

    // 2. Halo/Corona luminosa
    const spriteMat = new THREE.SpriteMaterial({
        map: glowTexture,
        color: new THREE.Color(concept.haloColor || concept.color),
        transparent: true,
        opacity: isCenter ? 0.95 : 0.80,
        blending: THREE.AdditiveBlending
    });
    const sprite = new THREE.Sprite(spriteMat);
    const spriteScale = isCenter ? concept.size * 5.2 : concept.size * 3.6;
    sprite.scale.set(spriteScale, spriteScale, 1);
    nodeGroup.add(sprite);

    // 3. Anillo de energía en el Gran Atractor
    if (isCenter) {
        const ringGeo = new THREE.RingGeometry(concept.size * 0.7, concept.size * 1.15, 48);
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.85,
            blending: THREE.AdditiveBlending
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        nodeGroup.add(ringMesh);
    }

    sceneCosmos.add(nodeGroup);

    // 4. Etiqueta HTML 3D en pantalla
    const labelEl = document.createElement('div');
    labelEl.className = 'concept-label' + (isCenter ? ' center-atractor' : '');
    labelEl.innerHTML = `
        <span class="dot" style="background:${concept.color}; color:${concept.haloColor || concept.color};"></span>
        <span class="text">${concept.name}</span>
    `;
    labelEl.addEventListener('click', (e) => {
        e.stopPropagation();
        openConceptModal(concept);
    });
    labelEl.addEventListener('touchend', (e) => {
        e.stopPropagation();
        openConceptModal(concept);
    });
    labelsContainer.appendChild(labelEl);

    conceptMeshes.push({
        concept: concept,
        group: nodeGroup,
        mesh: coreMesh,
        hitMesh: hitMesh,
        sprite: sprite,
        labelEl: labelEl
    });
});

// B) GRANDES CAMINOS / FILAMENTOS QUE CONVERGEN AL GRAN ATRACTOR
// Los puntos de un mismo tema se agrupan a lo largo del mismo camino, como cúmulos en un tubo
const pathsConfig = [
    { id: 'ds', color: 0x38bdf8, concepts: ['ds_estadistica', 'ds_econometria', 'ds_ml_supervisado', 'ds_ml_no_supervisado', 'ds_deep_learning', 'ds_data_mining'] },
    { id: 'eco', color: 0x34d399, concepts: ['eco_macro', 'eco_micro', 'eco_econometria'] },
    { id: 'act', color: 0xfbbf24, concepts: ['act_gestion_riesgos', 'act_solvencia', 'act_ifrs17', 'act_contabilidad', 'act_vida', 'act_no_vida'] },
    { id: 'mat', color: 0xc084fc, concepts: ['mat_calculo', 'mat_algebra', 'mat_optimizacion', 'mat_probabilidad'] }
];

const filamentGroup = new THREE.Group();
sceneCosmos.add(filamentGroup);

pathsConfig.forEach(p => {
    // Puntos del camino ordenados desde el centro (Gran Atractor) hacia el exterior
    const spinePoints = [ new THREE.Vector3(0, 0, 0) ];
    p.concepts.forEach(cId => {
        spinePoints.push(conceptMap[cId]);
    });

    const spineCurve = new THREE.CatmullRomCurve3(spinePoints, false, 'centripetal');

    // Generar un haz de 6 filamentos tenues que forman el "tubo" del camino
    const strandsCount = 6;
    for (let s = 0; s < strandsCount; s++) {
        const angleOffset = (s / strandsCount) * Math.PI * 2;
        const radiusTube = 4.5;
        const linePts = [];
        const samples = 48;

        for (let i = 0; i <= samples; i++) {
            const t = i / samples;
            const pt = spineCurve.getPoint(t);
            const tangent = spineCurve.getTangent(t);

            // Vector normal
            let up = new THREE.Vector3(0, 1, 0);
            if (Math.abs(tangent.dot(up)) > 0.9) up.set(1, 0, 0);
            const normal = new THREE.Vector3().crossVectors(tangent, up).normalize();
            const binormal = new THREE.Vector3().crossVectors(tangent, normal).normalize();

            // Ondulación sutil que ensancha ligeramente con la distancia
            const currentR = radiusTube * (0.4 + t * 0.9);
            const a = angleOffset + t * 4.0;
            const displaced = pt.clone()
                .addScaledVector(normal, Math.cos(a) * currentR)
                .addScaledVector(binormal, Math.sin(a) * currentR);

            linePts.push(displaced);
        }

        const lineGeo = new THREE.BufferGeometry().setFromPoints(linePts);
        const lineMat = new THREE.LineBasicMaterial({
            color: p.color,
            transparent: true,
            opacity: 0.38,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const lineMesh = new THREE.Line(lineGeo, lineMat);
        filamentGroup.add(lineMesh);
    }
});

// C) LÍNEAS FINAS Y TENUES ENTRE CONCEPTOS RELACIONADOS
const interConnections = [
    // Econometría conecta Data Science y Economía
    ['ds_econometria', 'eco_econometria'],
    // IFRS 17 conecta con Contabilidad
    ['act_ifrs17', 'act_contabilidad'],
    // Matemáticas y Probabilidad se conecta con Estadística, ML y Actuariales
    ['mat_probabilidad', 'ds_estadistica'],
    ['mat_probabilidad', 'act_vida'],
    ['mat_probabilidad', 'act_gestion_riesgos'],
    ['mat_algebra', 'ds_ml_supervisado'],
    ['mat_algebra', 'ds_ml_no_supervisado'],
    ['mat_calculo', 'mat_optimizacion'],
    ['mat_calculo', 'ds_deep_learning'],
    ['mat_optimizacion', 'ds_ml_supervisado'],
    ['mat_optimizacion', 'eco_micro'],
    // Inter-relaciones clave adicionales
    ['act_solvencia', 'act_ifrs17'],
    ['act_gestion_riesgos', 'act_solvencia'],
    ['act_gestion_riesgos', 'eco_macro'],
    ['eco_micro', 'act_no_vida'],
    ['eco_macro', 'eco_econometria'],
    ['ds_estadistica', 'ds_econometria']
];

const connLinePositions = [];
interConnections.forEach(([idA, idB]) => {
    const vA = conceptMap[idA];
    const vB = conceptMap[idB];
    if (vA && vB) {
        connLinePositions.push(vA.x, vA.y, vA.z);
        connLinePositions.push(vB.x, vB.y, vB.z);
    }
});

const connGeo = new THREE.BufferGeometry();
connGeo.setAttribute('position', new THREE.Float32BufferAttribute(connLinePositions, 3));
const connMat = new THREE.LineBasicMaterial({
    color: 0x94a3b8,
    transparent: true,
    opacity: 0.22,
    blending: THREE.AdditiveBlending,
    depthWrite: false
});
const connLines = new THREE.LineSegments(connGeo, connMat);
sceneCosmos.add(connLines);

// ==========================================================================
// NAVEGACIÓN, RAYCASTING Y EVENTOS MÓVIL / ESCRITORIO
// ==========================================================================
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

let currentScene = 'portada'; // 'portada' | 'cosmos'
let isTransitioning = false;

const portadaHeader = document.getElementById('portada-header');
const modalBackdrop = document.getElementById('info-modal-backdrop');
const cardCategory = document.getElementById('card-category');
const cardTitle = document.getElementById('card-title');
const cardDesc = document.getElementById('card-desc');
const cardConnections = document.getElementById('card-connections');
const modalClose = document.getElementById('modal-close');

// Proyección de etiquetas 3D a coordenadas 2D de pantalla
const tempVec = new THREE.Vector3();
function updateLabels() {
    if (currentScene !== 'cosmos') return;

    conceptMeshes.forEach(item => {
        if (!item.labelEl) return;
        tempVec.set(item.concept.pos[0], item.concept.pos[1], item.concept.pos[2]);
        tempVec.applyMatrix4(sceneCosmos.matrixWorld);
        tempVec.project(camera);

        // Ocultar si está detrás de la cámara
        if (tempVec.z > 1) {
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

// Comprobación de colisión con la bola negra para entrar
function checkEnter(clientX, clientY) {
    if (currentScene !== 'portada' || isTransitioning) return;

    mouse.x = (clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObject(blackSphere);

    if (hits.length > 0) {
        enterCosmos();
    }
}

// TRANSICIÓN DE ZOOM HACIA DENTRO HASTA LLEGAR A LA ESCENA 2
function enterCosmos() {
    if (isTransitioning) return;
    isTransitioning = true;

    // Desvanecer título superior
    portadaHeader.classList.add('hidden');

    // Zoom hacia el interior de la bola negra
    gsap.to(camera.position, {
        duration: 2.2,
        x: 0,
        y: 0,
        z: 15,
        ease: "power2.in",
        onUpdate: () => {
            controls.target.set(0, 0, 0);
            controls.update();
        }
    });

    // Inversión de fondo de blanco a cosmos oscuro
    gsap.to(scene.background, {
        duration: 1.8,
        r: COLOR_SPACE.r,
        g: COLOR_SPACE.g,
        b: COLOR_SPACE.b,
        ease: "power2.inOut",
        onUpdate: () => {
            renderer.setClearColor(scene.background, 1);
        }
    });

    // Desvanecer esfera y sombra
    gsap.to([sphereMat, shadowMat], {
        duration: 1.6,
        opacity: 0,
        onComplete: () => {
            scenePortada.visible = false;

            // Activar Escena 2
            sceneCosmos.visible = true;
            currentScene = 'cosmos';
            document.body.classList.remove('scene-portada');
            document.body.classList.add('scene-cosmos');
            labelsContainer.classList.remove('hidden');

            // Posicionar cámara para vista cosmológica panorámica
            gsap.fromTo(camera.position, 
                { x: 25, y: 15, z: 70 },
                {
                    duration: 2.2,
                    x: 180,
                    y: 130,
                    z: 580,
                    ease: "power2.out",
                    onUpdate: () => {
                        controls.target.set(0, 0, 0);
                        controls.update();
                    },
                    onComplete: () => {
                        isTransitioning = false;
                    }
                }
            );
        }
    });
}

// Doble clic en escritorio
window.addEventListener('dblclick', (e) => {
    if (currentScene === 'portada') {
        checkEnter(e.clientX, e.clientY);
    }
});

// Gestión de toques en móvil (Doble toque para entrar / Tap para seleccionar punto o cerrar panel)
let lastTouchTime = 0;
let lastTouchPos = { x: 0, y: 0 };
let touchStartX = 0, touchStartY = 0, touchStartTime = 0;

window.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchStartTime = Date.now();
    }
}, { passive: true });

window.addEventListener('touchend', (e) => {
    const touch = e.changedTouches[0];
    const now = Date.now();
    const duration = now - touchStartTime;
    const moveDist = Math.hypot(touch.clientX - touchStartX, touch.clientY - touchStartY);

    // Considerar como tap si no hubo desplazamiento significativo (< 18px)
    if (moveDist < 18 && duration < 380) {
        if (currentScene === 'portada') {
            const timeDiff = now - lastTouchTime;
            const tapDist = Math.hypot(touch.clientX - lastTouchPos.x, touch.clientY - lastTouchPos.y);

            // Doble toque en la esfera negra
            if (timeDiff < 420 && tapDist < 45) {
                checkEnter(touch.clientX, touch.clientY);
                lastTouchTime = 0;
            } else {
                lastTouchTime = now;
                lastTouchPos = { x: touch.clientX, y: touch.clientY };
            }
        } else if (currentScene === 'cosmos' && !isTransitioning) {
            // En el cosmos
            if (!modalBackdrop.classList.contains('hidden')) {
                if (!e.target.closest('#info-card')) {
                    closeConceptModal();
                }
            } else {
                handleSelectPoint(touch.clientX, touch.clientY);
            }
        }
    }
});

// Click / Touch en puntos brillantes de la Escena 2
function handleSelectPoint(clientX, clientY) {
    if (currentScene !== 'cosmos' || isTransitioning) return;

    mouse.x = (clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const meshes = conceptMeshes.map(m => m.hitMesh || m.mesh);
    const hits = raycaster.intersectObjects(meshes);

    if (hits.length > 0) {
        const concept = hits[0].object.userData.concept;
        openConceptModal(concept);
    }
}

window.addEventListener('click', (e) => {
    if (e.target.closest('#info-card') || e.target.closest('.concept-label')) return;
    
    if (!modalBackdrop.classList.contains('hidden')) {
        closeConceptModal();
        return;
    }

    handleSelectPoint(e.clientX, e.clientY);
});

// Panel modal de explicación
function openConceptModal(concept) {
    cardCategory.textContent = concept.category;
    cardCategory.style.color = concept.color;
    cardCategory.style.borderColor = concept.color;

    cardTitle.textContent = concept.name;
    cardDesc.textContent = concept.desc;

    cardConnections.innerHTML = '';
    if (concept.connections && concept.connections.length > 0) {
        concept.connections.forEach(connName => {
            const span = document.createElement('span');
            span.className = 'conn-tag';
            span.textContent = `→ ${connName}`;
            cardConnections.appendChild(span);
        });
    }

    modalBackdrop.classList.remove('hidden');
}

function closeConceptModal() {
    modalBackdrop.classList.add('hidden');
}

modalClose.addEventListener('click', (e) => {
    e.stopPropagation();
    closeConceptModal();
});

modalBackdrop.addEventListener('pointerdown', (e) => {
    if (e.target === modalBackdrop) {
        closeConceptModal();
    }
});

modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) {
        closeConceptModal();
    }
});

// Cursor pointer interactivo
window.addEventListener('mousemove', (e) => {
    if (isTransitioning) return;
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    if (currentScene === 'portada') {
        const hits = raycaster.intersectObject(blackSphere);
        document.body.style.cursor = hits.length > 0 ? 'pointer' : 'default';
    } else if (currentScene === 'cosmos') {
        const meshes = conceptMeshes.map(m => m.mesh);
        const hits = raycaster.intersectObjects(meshes);
        document.body.style.cursor = hits.length > 0 ? 'pointer' : 'default';
    }
});

// --- BUCLE PRINCIPAL DE ANIMACIÓN ---
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    const time = clock.getElapsedTime();

    // Animación Portada: rotación lenta de la bola negra
    if (scenePortada.visible) {
        blackSphere.rotation.y = time * 0.12;
        blackSphere.rotation.x = time * 0.06;
    }

    // Animación Cosmos: pulsación sutil de los halos de los conceptos
    if (sceneCosmos.visible) {
        conceptMeshes.forEach((item, idx) => {
            const pulse = 1 + Math.sin(time * 2.8 + idx) * 0.12;
            item.sprite.scale.set(
                (item.concept.id === 'gran_atractor' ? item.concept.size * 5.2 : item.concept.size * 3.6) * pulse,
                (item.concept.id === 'gran_atractor' ? item.concept.size * 5.2 : item.concept.size * 3.6) * pulse,
                1
            );
        });

        // Rotación orbital muy lenta y majestuosa del supercúmulo
        if (!controls.state || controls.state === -1) {
            sceneCosmos.rotation.y += delta * 0.015;
        }

        updateLabels();
    }

    controls.update();
    renderer.render(scene, camera);
}

animate();

// --- RESPONSIVE RESIZE ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    updateLabels();
});