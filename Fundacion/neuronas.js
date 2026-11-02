/**
 * Gendanken Palast - Neuronas, inyector y laboratorios de Python
 * Adaptación a la web estática de las ideas centrales de Proyecto Alejandría (MIT, Mario Torralba):
 *  - una neurona es un tema descrito en JSON (teoría, glosario, ejercicios, referencias y laboratorio);
 *  - las sinapsis (relaciones) se proponen con un motivo y la persona las acepta o rechaza;
 *  - los laboratorios son Python que se ejecuta en el propio navegador con Pyodide, sin servidor.
 * Todo se guarda en localStorage de este navegador; nada sale de tu equipo salvo la descarga de Pyodide al ejecutar código.
 * Se carga antes de main.js: añade las neuronas guardadas a TOPICS y KNOWLEDGE.
 */

const Neuronas = (() => {
    const KEY = 'gedankenpalast.neuronas';
    const ID_RE = /^[a-z0-9_]{2,60}$/;
    const NUEVO = 'neu_';

    const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

    // --- Almacenamiento -------------------------------------------------
    function leer() {
        try {
            const v = JSON.parse(localStorage.getItem(KEY) || '[]');
            return Array.isArray(v) ? v : [];
        } catch { return []; }
    }
    function guardar(lista) {
        try { localStorage.setItem(KEY, JSON.stringify(lista)); return true; } catch { return false; }
    }

    // --- Validación del JSON de una neurona ------------------------------
    function validar(n) {
        const errores = [];
        if (!n || typeof n !== 'object' || Array.isArray(n)) return { ok: false, errores: ['El contenido debe ser un único objeto JSON.'] };
        const texto = (k, min = 1) => typeof n[k] === 'string' && n[k].trim().length >= min;
        if (!texto('id') || !ID_RE.test(n.id)) errores.push('«id» debe ser texto en minúsculas, números y guiones bajos (2 a 60 caracteres).');
        if (!texto('nombre', 2)) errores.push('Falta «nombre».');
        if (!texto('teoria', 40)) errores.push('«teoria» debe ser un texto de al menos 40 caracteres (admite Markdown y $$ para fórmulas).');
        if (n.cluster != null && typeof n.cluster !== 'string') errores.push('«cluster» debe ser texto.');
        if (n.glosario != null) {
            if (!Array.isArray(n.glosario) || n.glosario.some(g => !g || typeof g.termino !== 'string' || typeof g.definicion !== 'string')) errores.push('«glosario» es una lista de {termino, definicion}.');
        }
        if (n.ejercicios != null) {
            if (!Array.isArray(n.ejercicios) || n.ejercicios.some(e => !e || typeof e.enunciado !== 'string')) errores.push('«ejercicios» es una lista de {enunciado, solucion}.');
        }
        if (n.referencias != null && !Array.isArray(n.referencias)) errores.push('«referencias» debe ser una lista.');
        const lab = n.laboratorio;
        if (lab != null) {
            if (typeof lab !== 'object' || typeof lab.codigo !== 'string' || !lab.codigo.trim()) errores.push('«laboratorio» necesita «codigo» (Python).');
            else if (lab.controles != null) {
                if (!Array.isArray(lab.controles) || lab.controles.length > 24) errores.push('«controles» es una lista de hasta 24 controles.');
                else lab.controles.forEach((c, i) => {
                    if (!c || !/^[A-Za-z_][A-Za-z0-9_]*$/.test(c.variable || '')) errores.push(`Control ${i + 1}: «variable» debe ser un nombre válido de Python.`);
                    const tipo = c && c.tipo ? c.tipo : 'slider';
                    if (!['slider', 'checkbox', 'select'].includes(tipo)) errores.push(`Control ${i + 1}: tipo desconocido «${tipo}».`);
                    if (tipo === 'slider' && !(Number.isFinite(c.min) && Number.isFinite(c.max) && c.min < c.max)) errores.push(`Control ${i + 1}: un slider necesita «min» menor que «max».`);
                    if (tipo === 'select' && !(Array.isArray(c.opciones) && c.opciones.length)) errores.push(`Control ${i + 1}: un select necesita «opciones».`);
                });
            }
        }
        return { ok: errores.length === 0, errores };
    }

    // --- Cúmulo según el nombre de la rama --------------------------------
    const PISTAS = [
        ['act', /actuar|seguro|vida|pension|riesgo|solvenc|reserv|biometr|mortalid/],
        ['ds', /dato|estad|machine|aprendizaje|bayes|simulac|regres|econometr|inferenc/],
        ['eco', /econom|financ|mercado|derivad|renta|cartera|fiscal|contab|juego/],
        ['mat', /matem|probab|algebr|calcul|optimiz|ecuacion|analisis|topolog/]
    ];
    function clusterPara(nombre) {
        const t = norm(nombre);
        const hit = PISTAS.find(([, re]) => re.test(t));
        return hit ? hit[0] : 'mat';
    }

    // --- Sinapsis propuestas por solapamiento de palabras distintivas ------
    const PARADA = new Set(['para', 'como', 'entre', 'sobre', 'desde', 'donde', 'cuando', 'esta', 'este', 'estos', 'estas', 'cada', 'tiene', 'tienen', 'puede', 'pueden', 'mediante', 'modelo', 'modelos', 'tema', 'temas', 'datos']);
    function palabras(texto) {
        return new Set((norm(texto).match(/[a-z0-9]{5,}/g) || []).filter(w => !PARADA.has(w)));
    }
    function proponerSinapsis(neurona, existentes) {
        const mias = palabras([neurona.nombre, neurona.teoria, (neurona.glosario || []).map(g => g.termino).join(' ')].join(' '));
        const docs = existentes.map(t => ({ t, w: palabras([t.name, t.desc].join(' ')) }));
        const df = new Map();
        docs.forEach(d => d.w.forEach(w => df.set(w, (df.get(w) || 0) + 1)));
        const puntuadas = docs.map(({ t, w }) => {
            const comunes = [...w].filter(x => mias.has(x));
            const score = comunes.reduce((s, x) => s + Math.log(1 + docs.length / df.get(x)), 0);
            return { id: t.id, score, comunes };
        }).filter(x => x.comunes.length >= 2).sort((a, b) => b.score - a.score).slice(0, 4);
        return puntuadas.map(x => ({
            id: x.id,
            motivo: `Comparten ${x.comunes.length} términos: ${x.comunes.slice(0, 5).join(', ')}.`
        }));
    }

    // --- Neurona -> tema del atlas ------------------------------------------
    function descripcion(teoria) {
        const limpio = String(teoria).replace(/^#{1,4}\s.*$/gm, ' ').replace(/\$\$[\s\S]*?\$\$/g, ' ').replace(/[#*`$\\]/g, '').replace(/\s+/g, ' ').trim();
        const frase = limpio.match(/^.{40,260}?[.!?](\s|$)/);
        return (frase ? frase[0] : limpio.slice(0, 240)).trim();
    }

    function aTema(registro, existentes) {
        const n = registro.neurona;
        const id = NUEVO + n.id;
        const sinapsis = proponerSinapsis(n, existentes)
            .filter(s => !(registro.rechazadas || []).includes(s.id) && !(registro.aceptadas || []).includes(s.id));
        const aceptadas = (registro.aceptadas || []).filter(a => existentes.some(t => t.id === a));
        const secciones = [{ id: 'teoria', title: 'Teoría', blocks: [{ type: 'markdown', text: n.teoria }] }];
        if (n.glosario && n.glosario.length) secciones.push({ id: 'glosario', title: 'Glosario', blocks: [{ type: 'glosario', items: n.glosario }] });
        if (n.ejercicios && n.ejercicios.length) secciones.push({ id: 'ejercicios', title: 'Ejercicios', blocks: [{ type: 'ejercicios', items: n.ejercicios }] });
        if (n.laboratorio) secciones.push({ id: 'laboratorio', title: 'Laboratorio', blocks: [{ type: 'lab', lab: n.laboratorio }] });
        if (sinapsis.length) secciones.push({ id: 'sinapsis', title: 'Sinapsis', blocks: [{ type: 'sinapsis', neurona: n.id, items: sinapsis }] });
        const refs = (n.referencias || []).map(r => typeof r === 'string' ? r : Object.values(r || {}).filter(v => typeof v === 'string' || typeof v === 'number').join('. '));
        if (refs.length) secciones.push({ id: 'referencias', title: 'Referencias', blocks: [{ type: 'sources', items: refs }] });
        return {
            tema: { id, cluster: registro.cluster, name: n.nombre, desc: descripcion(n.teoria), related: aceptadas, knowledge: id, neurona: true },
            conocimiento: { sections: secciones }
        };
    }

    function cargarEnAtlas() {
        const existentes = [...TOPICS];
        const usados = new Set(TOPICS.map(t => t.id));
        leer().forEach(registro => {
            if (!validar(registro.neurona).ok || !CLUSTERS.some(c => c.id === registro.cluster)) return;
            const { tema, conocimiento } = aTema(registro, existentes);
            if (usados.has(tema.id)) return;
            usados.add(tema.id);
            TOPICS.push(tema);
            KNOWLEDGE[tema.knowledge] = conocimiento;
        });
    }

    // --- Operaciones de la interfaz ----------------------------------------
    function añadir(neurona, cluster) {
        const v = validar(neurona);
        if (!v.ok) return v;
        const lista = leer();
        const i = lista.findIndex(r => r.neurona.id === neurona.id);
        const registro = { neurona, cluster, aceptadas: i >= 0 ? lista[i].aceptadas : [], rechazadas: i >= 0 ? lista[i].rechazadas : [] };
        if (i >= 0) lista[i] = registro; else lista.push(registro);
        return guardar(lista) ? { ok: true, errores: [] } : { ok: false, errores: ['El navegador no deja guardar datos (¿modo privado?).'] };
    }
    function quitar(id) { guardar(leer().filter(r => r.neurona.id !== id)); }
    function decidir(id, relacionadoCon, acepta) {
        const lista = leer();
        const r = lista.find(x => x.neurona.id === id);
        if (!r) return;
        r.aceptadas = (r.aceptadas || []).filter(x => x !== relacionadoCon);
        r.rechazadas = (r.rechazadas || []).filter(x => x !== relacionadoCon);
        (acepta ? r.aceptadas : r.rechazadas).push(relacionadoCon);
        guardar(lista);
    }
    function exportar() { return JSON.stringify(leer(), null, 2); }
    function importar(texto) {
        let datos;
        try { datos = JSON.parse(texto); } catch { return { ok: false, errores: ['No es JSON válido.'] }; }
        const lista = Array.isArray(datos) ? datos : [datos];
        const errores = [];
        let n = 0;
        lista.forEach((r, i) => {
            const neurona = r && r.neurona ? r.neurona : r;
            const cluster = r && r.neurona && CLUSTERS.some(c => c.id === r.cluster) ? r.cluster : clusterPara(neurona && neurona.cluster);
            const res = añadir(neurona, cluster);
            if (res.ok) n++; else errores.push(`Elemento ${i + 1}: ${res.errores.join(' ')}`);
        });
        return { ok: errores.length === 0 && n > 0, errores, añadidas: n };
    }

    // --- Prompt para pedir una neurona a una IA ------------------------------
    function prompt(clusters) {
        return [
            'Actúa como catedrático universitario y redacta UNA neurona de conocimiento para mi atlas «Gendanken Palast».',
            'Responde SOLO con un objeto JSON válido (sin texto antes ni después, sin bloques de código) con esta estructura exacta:',
            JSON.stringify({
                id: 'identificador_en_snake_case',
                cluster: 'rama breve, máximo 3 palabras',
                nombre: 'Nombre completo del concepto',
                teoria: 'Texto en Markdown, mínimo 600 palabras, con subtítulos ## (Introducción, Fundamentos, Desarrollo, Aplicaciones y límites). Toda fórmula en bloques $$ ... $$ con líneas en blanco antes y después y numeradas con \\tag{n}. Nada de fórmulas dentro de los párrafos.',
                glosario: [{ termino: 'término', definicion: 'definición exacta' }],
                ejercicios: [{ enunciado: 'problema', solucion: 'resolución paso a paso' }],
                referencias: ['Autor (año). Título. Editorial o revista.'],
                laboratorio: {
                    explicacion: 'qué se explora y qué hay que observar',
                    controles: [{ variable: 'n', label: 'Tamaño de la muestra', tipo: 'slider', min: 10, max: 1000, step: 10, default: 100 }],
                    codigo: 'import numpy as np\nimport matplotlib.pyplot as plt\n# usa las variables de los controles directamente (n, ...)\nx = np.linspace(0, 1, n)\nplt.plot(x, x**2)\nplt.show()'
                }
            }, null, 2),
            'Reglas: el laboratorio es Python con numpy y matplotlib (opcionalmente scipy, pandas o statsmodels); cada «variable» de un control ya existe como variable al ejecutar; los tipos de control son slider, checkbox o select. No inventes referencias: si no estás seguro, déjalas fuera.',
            clusters && clusters.length ? `RAMAS EXISTENTES EN MI SISTEMA: ${clusters.join(', ')}. Reutiliza una de ellas si el concepto encaja.` : ''
        ].filter(Boolean).join('\n\n');
    }

    return { validar, clusterPara, añadir, quitar, decidir, exportar, importar, leer, prompt, cargarEnAtlas, norm };
})();

// ==========================================================================
// Ejecutor de Python (Pyodide), cargado solo cuando se pulsa «Ejecutar»
// ==========================================================================
const PyRunner = (() => {
    const BASE = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/';
    let cargando = null;

    function cargar() {
        if (cargando) return cargando;
        cargando = new Promise((ok, fallo) => {
            const s = document.createElement('script');
            s.src = BASE + 'pyodide.js';
            s.onload = async () => {
                try { ok(await loadPyodide({ indexURL: BASE })); } catch (e) { cargando = null; fallo(e); }
            };
            s.onerror = () => { cargando = null; fallo(new Error('No se pudo descargar Pyodide. Hace falta conexión la primera vez.')); };
            document.head.appendChild(s);
        });
        return cargando;
    }

    const FIGURAS = `
import io, base64
def __figuras_gp():
    try:
        import matplotlib.pyplot as plt
    except Exception:
        return []
    out = []
    for n in plt.get_fignums():
        b = io.BytesIO()
        plt.figure(n).savefig(b, format='png', dpi=110, bbox_inches='tight', facecolor='white')
        out.append(base64.b64encode(b.getvalue()).decode())
    plt.close('all')
    return out
`;

    function valorPython(v) {
        if (typeof v === 'boolean') return v ? 'True' : 'False';
        if (typeof v === 'number') return String(v);
        return JSON.stringify(String(v));
    }

    // Devuelve { texto, figuras[], error }
    async function ejecutar(codigo, variables = {}, estado = () => {}) {
        estado('Cargando Python…');
        const py = await cargar();
        const salida = [];
        py.setStdout({ batched: s => salida.push(s) });
        py.setStderr({ batched: s => salida.push(s) });
        try {
            if (!py.globals.get('__figuras_gp')) {
                await py.loadPackage('matplotlib').catch(() => {});
                py.runPython('import matplotlib; matplotlib.use("agg")\nimport matplotlib.pyplot as plt\nplt.show = lambda *a, **k: None');
                py.runPython(FIGURAS);
            }
            const cabecera = Object.entries(variables).map(([k, v]) => `${k} = ${valorPython(v)}`).join('\n');
            const completo = (cabecera ? cabecera + '\n' : '') + codigo;
            estado('Instalando librerías…');
            await py.loadPackagesFromImports(completo);
            estado('Ejecutando…');
            await py.runPythonAsync(completo);
            const figs = py.runPython('__figuras_gp()').toJs();
            return { texto: salida.join('\n'), figuras: figs, error: null };
        } catch (e) {
            const msg = String(e && e.message ? e.message : e).split('\n').filter(l => l.trim()).slice(-6).join('\n');
            return { texto: salida.join('\n'), figuras: [], error: msg };
        }
    }

    return { ejecutar };
})();

Neuronas.cargarEnAtlas();
