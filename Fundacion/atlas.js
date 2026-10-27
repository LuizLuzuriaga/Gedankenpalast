/**
 * Gendanken Palast - Topología del atlas
 * Cuatro cúmulos de conocimiento alrededor del Gran Atractor y los temas que orbitan cada uno.
 * Las metodologías de knowledgeData.js se añaden a su cúmulo en main.js (ver METHOD_CLUSTER).
 *
 * tools/build_cosmos_glb.py lee la línea de cada cúmulo con una expresión regular:
 * mantén `id`, `name`, `hue`, `center` y `radius` en una sola línea y en este orden.
 */

const CLUSTERS = [
    { id: 'act', name: 'Ciencias Actuariales', hue: '#f2b33d', center: [-215, -55, 150], radius: 95 },
    { id: 'ds', name: 'Data Science', hue: '#4cb3f0', center: [245, 105, -45], radius: 90 },
    { id: 'eco', name: 'Economía y Finanzas', hue: '#5cc98a', center: [-150, 150, -215], radius: 80 },
    { id: 'mat', name: 'Matemáticas y Probabilidad', hue: '#e6e6e6', center: [170, -150, 175], radius: 80 }
];

// Lunas: temas que orbitan a otro tema en vez de al centro de su cúmulo
const TOPIC_PARENTS = {
    chain_ladder: 'act_reserving'
};

// Categoría de knowledgeData.js -> cúmulo
const METHOD_CLUSTER = {
    'Actuarial': 'act',
    'Data Science': 'ds',
    'Finanzas': 'eco',
    'Transversal': 'mat'
};

const TOPICS = [
    // CIENCIAS ACTUARIALES
    {
        id: 'act_gestion_riesgos', cluster: 'act', name: 'Gestión de riesgos',
        desc: 'Identificación, medición y control de exposiciones financieras y biométricas: métricas de cola como el Valor en Riesgo (VaR) y el Expected Shortfall (TVaR), pruebas de estrés y escenarios extremos.',
        related: ['act_solvencia', 'eco_macro', 'mat_probabilidad']
    },
    {
        id: 'act_solvencia', cluster: 'act', name: 'Solvencia II',
        desc: 'Régimen prudencial europeo para aseguradoras: Capital de Solvencia Obligatorio (SCR) por fórmula estándar o modelo interno, Pilar II (ORSA) y disciplina de mercado.',
        related: ['act_gestion_riesgos', 'act_ifrs17', 'act_vida', 'act_no_vida']
    },
    {
        id: 'act_ifrs17', cluster: 'act', name: 'IFRS 17',
        desc: 'Norma contable de contratos de seguro: pasivos valorados con flujos descontados insesgados (BEL), Ajuste por Riesgo (RA) y Margen de Servicio Contractual (CSM).',
        related: ['act_contabilidad', 'act_solvencia']
    },
    {
        id: 'act_contabilidad', cluster: 'act', name: 'Contabilidad',
        desc: 'Registro y presentación del balance y la cuenta técnica: devengo del margen de servicio, liberación de reservas técnicas y conciliación contable-actuarial.',
        related: ['act_ifrs17']
    },
    {
        id: 'act_vida', cluster: 'act', name: 'Seguros de Vida',
        desc: 'Riesgos biométricos: tablas de mortalidad dinámicas, riesgo de longevidad, rentas vitalicias, conmutación actuarial y proyecciones de supervivencia.',
        related: ['mat_probabilidad', 'act_solvencia', 'act_pensiones']
    },
    {
        id: 'act_no_vida', cluster: 'act', name: 'Seguros No Vida',
        desc: 'Tarificación y reservas en seguros generales: Poisson y binomial negativa para la frecuencia, colas pesadas para la severidad, credibilidad y triángulos IBNR.',
        related: ['eco_micro', 'act_solvencia', 'ds_estadistica']
    },
    {
        id: 'act_reserving', cluster: 'act', name: 'Reserving',
        desc: 'Cálculo de las provisiones técnicas de siniestros: siniestros pendientes y ocurridos no declarados (IBNR) a partir de triángulos de desarrollo, con métodos deterministas (Chain Ladder, Bornhuetter-Ferguson) y estocásticos (Mack, bootstrap) para medir su incertidumbre.',
        related: ['act_no_vida', 'act_solvencia', 'act_ifrs17', 'chain_ladder']
    },
    {
        id: 'act_pensiones', cluster: 'act', name: 'Previsión social y pensiones',
        desc: 'Sistemas de previsión para la jubilación: ciclo de vida de ahorro y consumo, tasa de intercambio y de sustitución, inflación, reparto frente a capitalización y riesgo de longevidad.',
        related: ['act_vida', 'eco_macro', 'act_gestion_riesgos'],
        knowledge: 'prevision_pensiones'
    },

    // DATA SCIENCE
    {
        id: 'ds_estadistica', cluster: 'ds', name: 'Estadística',
        desc: 'Fundamento del análisis empírico: estimación puntual, intervalos de confianza, contrastes de hipótesis y teoría asintótica para inferir la población a partir de muestras.',
        related: ['mat_probabilidad', 'ds_econometria', 'ds_ml_supervisado']
    },
    {
        id: 'ds_econometria', cluster: 'ds', name: 'Econometría aplicada',
        desc: 'Modelos econométricos en ciencia de datos: MCO y MCG, endogeneidad, series temporales, modelos autorregresivos y evaluación de causalidad.',
        related: ['eco_econometria', 'ds_estadistica', 'ds_ml_supervisado']
    },
    {
        id: 'ds_ml_supervisado', cluster: 'ds', name: 'Machine Learning supervisado',
        desc: 'Algoritmos entrenados con datos etiquetados: modelos lineales generalizados (GLM), árboles de decisión, Random Forest, XGBoost y SVM.',
        related: ['mat_algebra', 'mat_optimizacion', 'ds_ml_no_supervisado', 'ds_deep_learning']
    },
    {
        id: 'ds_ml_no_supervisado', cluster: 'ds', name: 'Machine Learning no supervisado',
        desc: 'Patrones latentes en datos sin etiquetar: clustering (K-means, jerárquico, DBSCAN) y reducción de dimensionalidad (PCA, t-SNE, UMAP).',
        related: ['mat_algebra', 'ds_data_mining', 'ds_ml_supervisado']
    },
    {
        id: 'ds_deep_learning', cluster: 'ds', name: 'Deep Learning',
        desc: 'Redes neuronales profundas: perceptrón multicapa, redes convolucionales, recurrentes (LSTM) y arquitecturas Transformer.',
        related: ['mat_calculo', 'mat_optimizacion', 'ds_ml_supervisado']
    },
    {
        id: 'ds_data_mining', cluster: 'ds', name: 'Data Mining',
        desc: 'Extracción automática de información y reglas de asociación en grandes almacenes de datos estructurados y no estructurados.',
        related: ['ds_ml_no_supervisado', 'ds_estadistica']
    },

    // ECONOMÍA Y FINANZAS
    {
        id: 'eco_macro', cluster: 'eco', name: 'Macroeconomía',
        desc: 'Comportamiento agregado de la economía: PIB, inflación, curva de tipos, política monetaria, ciclos y modelos de equilibrio dinámico estocástico (DSGE).',
        related: ['eco_micro', 'eco_econometria', 'act_gestion_riesgos']
    },
    {
        id: 'eco_micro', cluster: 'eco', name: 'Microeconomía',
        desc: 'Decisiones de consumidores y empresas: maximización de la utilidad con restricciones, producción, precios, estructuras de mercado y teoría de juegos.',
        related: ['mat_optimizacion', 'eco_macro', 'act_no_vida']
    },
    {
        id: 'eco_econometria', cluster: 'eco', name: 'Econometría',
        desc: 'Contraste empírico de teorías económicas con datos observacionales y de panel; enlaza directamente con los métodos de Data Science.',
        related: ['ds_econometria', 'eco_macro', 'ds_estadistica']
    },

    // MATEMÁTICAS Y PROBABILIDAD
    {
        id: 'mat_probabilidad', cluster: 'mat', name: 'Probabilidad',
        desc: 'El azar formalizado con teoría de la medida: espacios de probabilidad, variables aleatorias, esperanza condicional, martingalas, ley de los grandes números y teorema central del límite.',
        related: ['ds_estadistica', 'act_vida', 'act_gestion_riesgos']
    },
    {
        id: 'mat_algebra', cluster: 'mat', name: 'Álgebra lineal',
        desc: 'Espacios vectoriales y transformaciones lineales: cálculo matricial, descomposiciones ortogonales, autovalores, SVD y tensores.',
        related: ['ds_ml_supervisado', 'ds_ml_no_supervisado', 'mat_optimizacion']
    },
    {
        id: 'mat_calculo', cluster: 'mat', name: 'Cálculo',
        desc: 'Cálculo diferencial e integral multivariable, cálculo vectorial y ecuaciones diferenciales ordinarias y parciales.',
        related: ['mat_optimizacion', 'mat_probabilidad', 'ds_deep_learning']
    },
    {
        id: 'mat_optimizacion', cluster: 'mat', name: 'Optimización',
        desc: 'Programación lineal, cuadrática y convexa, condiciones de Karush-Kuhn-Tucker, descenso de gradiente y multiplicadores de Lagrange.',
        related: ['mat_calculo', 'ds_ml_supervisado', 'eco_micro']
    }
];
