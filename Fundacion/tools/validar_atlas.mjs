// Valida el atlas de Gedankenpalast sin abrir el navegador: ids, relaciones, temarios, calculadoras y fórmulas KaTeX.
// Uso: node Fundacion/tools/validar_atlas.mjs      (para comprobar también las fórmulas: npm i katex)
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';

const dir = path.resolve(import.meta.dirname, '..');
const require = createRequire(import.meta.url);
let katex = null;
try { katex = require('katex'); } catch { /* sin katex solo se omite la comprobación de fórmulas */ }

const ctx = vm.createContext({
    console, Math, Number, String, Array, Object, JSON, Set, Map, Date, Intl, Boolean, isNaN, isFinite, parseFloat, parseInt,
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    document: {}, window: {}
});
const ARCHIVOS = ['knowledgeData.js', 'atlas.js', 'conocimientos.js', 'conocimientos_mucaf.js', 'conocimientos_grado.js', 'conocimientos_grado2.js', 'conocimientos_drive.js', 'neuronas.js'];
for (const f of ARCHIVOS) {
    const p = path.join(dir, f);
    if (!fs.existsSync(p)) continue;
    new vm.Script(fs.readFileSync(p, 'utf8'), { filename: f }).runInContext(ctx);
}
const D = vm.runInContext('({ TOPICS, CLUSTERS, KNOWLEDGE, CALCULATORS, KNOWLEDGE_GRAPH })', ctx);

const errores = [];
const avisos = [];
const err = (m) => errores.push(m);

// --- Temas ---------------------------------------------------------------------------
const ids = new Set();
const grafo = new Set(D.KNOWLEDGE_GRAPH.map(n => n.id));
const clusters = new Set(D.CLUSTERS.map(c => c.id));
for (const t of D.TOPICS) {
    if (ids.has(t.id) || grafo.has(t.id)) err(`Id repetido: ${t.id}`);
    ids.add(t.id);
    if (!clusters.has(t.cluster)) err(`${t.id}: cúmulo desconocido «${t.cluster}»`);
    if (!t.name || !t.desc) err(`${t.id}: faltan nombre o descripción`);
}
const conocidos = new Set([...ids, ...grafo, 'gran_atractor']);
for (const t of D.TOPICS) {
    for (const r of t.related || []) if (!conocidos.has(r)) err(`${t.id}: la relación «${r}» no existe`);
    if (t.knowledge && !D.KNOWLEDGE[t.knowledge]) err(`${t.id}: no existe el temario «${t.knowledge}»`);
}
const usados = new Set(D.TOPICS.map(t => t.knowledge).filter(Boolean));
for (const k of Object.keys(D.KNOWLEDGE)) if (!usados.has(k)) avisos.push(`Temario sin tema que lo use: ${k}`);

// --- Temarios ---------------------------------------------------------------------------
const TIPOS = new Set(['p', 'callout', 'list', 'formula', 'steps', 'table', 'sources', 'calculator', 'guide', 'html', 'code', 'related', 'markdown', 'glosario', 'ejercicios', 'lab', 'sinapsis']);
const cadenas = [];                       // textos con posible matemática en línea
const formulas = [];                      // fórmulas en bloque
function recoger(v, ruta) {
    if (typeof v === 'string') cadenas.push([ruta, v]);
    else if (Array.isArray(v)) v.forEach((x, i) => recoger(x, ruta));
    else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) if (k !== 'tex' && k !== 'type' && k !== 'id' && k !== 'code' && k !== 'html') recoger(x, ruta);
}
for (const [clave, k] of Object.entries(D.KNOWLEDGE)) {
    const ids2 = new Set();
    for (const s of k.sections || []) {
        if (!s.id || !s.title || !Array.isArray(s.blocks)) err(`${clave}: sección mal formada`);
        if (ids2.has(s.id)) err(`${clave}: sección repetida «${s.id}»`);
        ids2.add(s.id);
        for (const b of s.blocks) {
            const ruta = `${clave}/${s.id}`;
            if (!TIPOS.has(b.type)) err(`${ruta}: tipo de bloque desconocido «${b.type}»`);
            if (b.type === 'calculator' && !D.CALCULATORS[b.id]) err(`${ruta}: la calculadora «${b.id}» no existe`);
            if (b.type === 'code' && !Object.values(b.code || {}).every(c => typeof c === 'string' && c.trim())) err(`${ruta}: bloque de código vacío`);
            if (b.type === 'formula') formulas.push([ruta, b.tex]);
            if (b.type === 'steps') (b.items || []).forEach(i => i.tex && formulas.push([ruta, i.tex]));
            if (b.type !== 'code' && b.type !== 'formula') recoger(b, ruta);
        }
    }
    if (k.guide && !fs.existsSync(path.join(dir, k.guide))) err(`${clave}: no existe la guía ${k.guide}`);
}

// --- Paridad de lenguajes: toda celda de código tiene R y Python equivalentes ---------------------
const paridad = (ruta, code) => {
    const claves = Object.keys(code || {}).map(c => c.toLowerCase());
    for (const l of ['r', 'python']) if (!claves.includes(l)) err(`${ruta}: falta la versión en ${l === 'r' ? 'R' : 'Python'} (tiene: ${claves.join(', ')})`);
};
for (const [clave, k] of Object.entries(D.KNOWLEDGE)) {
    for (const s of k.sections || []) for (const b of s.blocks) if (b.type === 'code') paridad(`${clave}/${s.id}`, b.code);
}
for (const n of D.KNOWLEDGE_GRAPH) if (n.code) paridad(`método ${n.id}`, n.code);
const guias = path.join(dir, 'guias');
if (fs.existsSync(guias)) {
    for (const f of fs.readdirSync(guias).filter(x => x.endsWith('.html'))) {
        const h = fs.readFileSync(path.join(guias, f), 'utf8');
        const pares = [...h.matchAll(/<div class="codepair"[^>]*>([\s\S]*?)<\/div>/g)];
        pares.forEach((m, i) => {
            if (!/type="text\/x-r"/.test(m[1]) || !/type="text\/x-py"/.test(m[1])) err(`guía ${f}: el bloque de código ${i + 1} no tiene R y Python`);
        });
        const sueltos = (h.match(/<script type="text\/x-(r|py)"/g) || []).length - pares.length * 2;
        if (sueltos > 0) err(`guía ${f}: ${sueltos} bloque(s) de código fuera de un par R/Python`);
    }
}

// --- Calculadoras: deben calcular con sus valores por defecto ----------------------------------
for (const [id, c] of Object.entries(D.CALCULATORS)) {
    try {
        const v = Object.fromEntries(c.inputs.map(i => [i.id, i.value]));
        const r = c.compute(v);
        for (const o of r.outputs) if (/NaN|Infinity|undefined/.test(String(o.value))) err(`Calculadora ${id}: «${o.label}» da ${o.value} con los valores por defecto`);
    } catch (e) { err(`Calculadora ${id}: ${e.message}`); }
}

// --- Fórmulas KaTeX ---------------------------------------------------------------------------------
let nFormulas = 0;
if (katex) {
    const probar = (ruta, tex, display) => {
        nFormulas++;
        try { katex.renderToString(tex, { displayMode: display, throwOnError: true, strict: (codigo) => { throw new Error('no estricto: ' + codigo); } }); } catch (e) { err(`${ruta}: fórmula no válida «${tex.slice(0, 60)}»: ${e.message.slice(0, 80)}`); }
    };
    formulas.forEach(([r, t]) => probar(r, t, true));
    cadenas.forEach(([r, t]) => t.split(/\$([^$]+)\$/).forEach((parte, i) => { if (i % 2) probar(r, parte, false); }));
} else {
    avisos.push('KaTeX no está instalado: no se han comprobado las fórmulas (npm i katex).');
}

console.log(`Temas: ${D.TOPICS.length} · temarios: ${Object.keys(D.KNOWLEDGE).length} · calculadoras: ${Object.keys(D.CALCULATORS).length} · fórmulas comprobadas: ${nFormulas}`);
avisos.forEach(a => console.log('AVISO ' + a));
if (errores.length) {
    errores.forEach(e => console.log('ERROR ' + e));
    console.log(`\n${errores.length} error(es).`);
    process.exit(1);
}
console.log('Todo correcto.');
