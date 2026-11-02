/**
 * Gendanken Palast - Interfaz de neuronas: bloques de contenido, laboratorios Python e inyector.
 * Se carga después de main.js (usa panelBody, esc, renderMath, openPanel, selectTopic, NEIGHBOURS...).
 */

const NeuronaUI = (() => {
    const labs = [];            // definiciones de laboratorio de los bloques renderizados
    const MAX_FIG = 6;

    // --- Markdown mínimo con matemáticas ($$ en bloque y $ en línea) --------------------
    function markdown(texto) {
        const guardados = [];
        const guardar = (html) => { guardados.push(html); return `\u0000${guardados.length - 1}\u0000`; };
        let t = String(texto || '').replace(/\r/g, '');
        t = t.replace(/\$\$([\s\S]+?)\$\$/g, (_, tex) => `\n\n${guardar(`<div class="kb-formula">${renderMath(tex.trim(), true)}</div>`)}\n\n`);
        t = t.replace(/\$([^$\n]+)\$/g, (_, tex) => guardar(renderMath(tex, false)));
        const inline = (s) => esc(s)
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
            .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<i>$2</i>');
        const html = t.split(/\n{2,}/).map(bloque => {
            const b = bloque.trim();
            if (!b) return '';
            if (/^\u0000\d+\u0000$/.test(b)) return b;
            const h = b.match(/^(#{1,4})\s+(.+)$/);
            if (h) return `<h4 class="kb-h">${inline(h[2])}</h4>`;
            const lineas = b.split('\n');
            if (lineas.every(l => /^\s*[-*]\s+/.test(l))) return `<ul class="kb-list">${lineas.map(l => `<li>${inline(l.replace(/^\s*[-*]\s+/, ''))}</li>`).join('')}</ul>`;
            if (lineas.every(l => /^\s*\d+[.)]\s+/.test(l))) return `<ol class="kb-steps">${lineas.map(l => `<li><p class="kb-p">${inline(l.replace(/^\s*\d+[.)]\s+/, ''))}</p></li>`).join('')}</ol>`;
            return `<p class="kb-p">${inline(b.replace(/\n/g, ' '))}</p>`;
        }).join('\n');
        return html.replace(/\u0000(\d+)\u0000/g, (_, i) => guardados[Number(i)]);
    }

    // --- Laboratorio ---------------------------------------------------------------------
    function controlHtml(c, i) {
        const tipo = c.tipo || 'slider';
        const etiqueta = `<span>${esc(c.label || c.variable)}${tipo === 'slider' ? ` <b class="lab-val">${esc(c.default)}</b>` : ''}</span>`;
        if (tipo === 'checkbox') return `<label class="lab-ctl lab-check"><input type="checkbox" data-var="${esc(c.variable)}" data-tipo="checkbox"${c.default ? ' checked' : ''}>${etiqueta}</label>`;
        if (tipo === 'select') {
            const ops = (c.opciones || []).map(o => typeof o === 'object' ? o : { valor: o, label: o });
            return `<label class="lab-ctl">${etiqueta}<select data-var="${esc(c.variable)}" data-tipo="select">${ops.map(o => `<option value="${esc(o.valor)}"${String(o.valor) === String(c.default) ? ' selected' : ''}>${esc(o.label != null ? o.label : o.valor)}</option>`).join('')}</select></label>`;
        }
        return `<label class="lab-ctl">${etiqueta}<input type="range" data-var="${esc(c.variable)}" data-tipo="slider" min="${c.min}" max="${c.max}" step="${c.step || 'any'}" value="${esc(c.default != null ? c.default : c.min)}"></label>`;
    }

    function labHtml(lab) {
        const i = labs.push(lab) - 1;
        const grupos = new Map();
        (lab.controles || []).forEach((c, k) => {
            const g = c.grupo || '';
            if (!grupos.has(g)) grupos.set(g, []);
            grupos.get(g).push(controlHtml(c, k));
        });
        const controles = [...grupos.entries()].map(([g, items]) => `<fieldset class="lab-group">${g ? `<legend>${esc(g)}</legend>` : ''}${items.join('')}</fieldset>`).join('');
        return `<div class="kb-lab" data-lab="${i}">
            ${lab.explicacion ? markdown(lab.explicacion) : ''}
            ${controles ? `<div class="lab-controls">${controles}</div>` : ''}
            <details class="lab-code"><summary>Código de Python (editable)</summary><textarea class="lab-src" rows="12" spellcheck="false" aria-label="Código del laboratorio">${esc(lab.codigo)}</textarea></details>
            ${lab.codigo_r ? `<details class="lab-code"><summary>Mismo laboratorio en R (para copiar a RStudio)</summary><pre class="code-block"><code>${esc(lab.codigo_r)}</code></pre></details>` : ''}
            <div class="lab-actions"><button type="button" class="control lab-run">Ejecutar</button><span class="lab-status" role="status"></span></div>
            <pre class="run-out" hidden></pre><div class="run-figs"></div>
        </div>`;
    }

    // --- Render de los bloques nuevos ---------------------------------------------------------
    function render(block) {
        switch (block.type) {
            case 'markdown':
                return markdown(block.text);
            case 'glosario':
                return `<dl class="kb-glosario">${block.items.map(g => `<div><dt>${esc(g.termino)}</dt><dd>${markdown(g.definicion)}</dd></div>`).join('')}</dl>`;
            case 'ejercicios':
                return block.items.map((e, i) => `<details class="kb-ejercicio"><summary><span>Ejercicio ${i + 1}</span></summary>
                    <div class="kb-ej-cuerpo">${markdown(e.enunciado)}${e.solucion ? `<details class="kb-solucion"><summary>Ver solución</summary>${markdown(e.solucion)}</details>` : ''}</div></details>`).join('');
            case 'lab':
                return labHtml(block.lab);
            case 'sinapsis':
                return `<p class="kb-p">Conexiones que propone el atlas por términos en común. Acepta las que tengan sentido; lo que rechaces no vuelve a proponerse.</p>
                    <ul class="sinapsis-list" data-neurona="${esc(block.neurona)}">${block.items.map(s => {
                        const t = TOPIC_BY_ID[s.id];
                        return t ? `<li data-id="${esc(s.id)}"><div><b>${esc(t.name)}</b><span class="kb-note">${esc(s.motivo)}</span></div>
                            <div class="sinapsis-btns"><button type="button" class="control" data-decide="1">Aceptar</button><button type="button" class="control control-quiet" data-decide="0">Rechazar</button></div></li>` : '';
                    }).join('')}</ul>`;
            default:
                return '';
        }
    }

    // --- Ejecución ----------------------------------------------------------------------------
    function mostrar(cont, res) {
        const out = cont.querySelector('.run-out'), figs = cont.querySelector('.run-figs');
        const texto = [res.texto, res.error ? `Error: ${res.error}` : ''].filter(Boolean).join('\n');
        out.hidden = !texto;
        out.textContent = texto;
        out.classList.toggle('is-error', !!res.error);
        figs.innerHTML = res.figuras.slice(0, MAX_FIG).map((b, i) => `<img src="data:image/png;base64,${b}" alt="Figura ${i + 1} del código" class="run-fig">`).join('');
    }

    async function correr(cont, codigo, variables) {
        const estado = cont.querySelector('.lab-status');
        const boton = cont.querySelector('.lab-run, .run-py');
        if (boton) boton.disabled = true;
        try {
            const res = await PyRunner.ejecutar(codigo, variables, m => { if (estado) estado.textContent = m; });
            mostrar(cont, res);
            if (estado) estado.textContent = res.error ? 'Terminó con un error.' : 'Listo.';
        } catch (e) {
            mostrar(cont, { texto: '', figuras: [], error: e.message });
            if (estado) estado.textContent = 'No se pudo ejecutar.';
        } finally {
            if (boton) boton.disabled = false;
        }
    }

    function variablesDe(cont) {
        const v = {};
        cont.querySelectorAll('[data-var]').forEach(el => {
            const tipo = el.dataset.tipo;
            v[el.dataset.var] = tipo === 'checkbox' ? el.checked : (tipo === 'slider' ? Number(el.value) : (isNaN(Number(el.value)) ? el.value : Number(el.value)));
        });
        return v;
    }

    let pendiente = null;
    function conectarPanel() {
        panelBody.addEventListener('click', (e) => {
            const run = e.target.closest('.lab-run');
            if (run) {
                const cont = run.closest('.kb-lab');
                cont.dataset.ejecutado = '1';
                correr(cont, cont.querySelector('.lab-src').value, variablesDe(cont));
                return;
            }
            const py = e.target.closest('.run-py');
            if (py) {
                const cont = py.closest('.kb-code');
                const bloque = cont.querySelector('.code-block[data-lang="python"]');
                if (bloque) correr(cont, bloque.textContent, {});
                return;
            }
            const dec = e.target.closest('[data-decide]');
            if (dec) {
                const li = dec.closest('li'), lista = dec.closest('.sinapsis-list');
                decidir(lista.dataset.neurona, li.dataset.id, dec.dataset.decide === '1');
            }
        });
        panelBody.addEventListener('input', (e) => {
            const c = e.target.closest('[data-var]');
            if (!c) return;
            const cont = c.closest('.kb-lab');
            const val = c.closest('.lab-ctl').querySelector('.lab-val');
            if (val) val.textContent = c.value;
            if (cont && cont.dataset.ejecutado) {
                clearTimeout(pendiente);
                pendiente = setTimeout(() => correr(cont, cont.querySelector('.lab-src').value, variablesDe(cont)), 450);
            }
        });
    }

    function decidir(neuronaId, otroId, acepta) {
        Neuronas.decidir(neuronaId, otroId, acepta);
        const id = 'neu_' + neuronaId;
        const topic = TOPIC_BY_ID[id];
        const sec = KNOWLEDGE[topic.knowledge].sections.find(s => s.id === 'sinapsis');
        sec.blocks[0].items = sec.blocks[0].items.filter(s => s.id !== otroId);
        if (!sec.blocks[0].items.length) KNOWLEDGE[topic.knowledge].sections = KNOWLEDGE[topic.knowledge].sections.filter(s => s.id !== 'sinapsis');
        if (acepta) {
            NEIGHBOURS[id].add(otroId);
            NEIGHBOURS[otroId].add(id);
        }
        const otra = KNOWLEDGE[topic.knowledge].sections.some(s => s.id === 'sinapsis') ? 'sinapsis' : 'relaciones';
        openPanel(topic);
        const tab = panelTabs.querySelector(`[data-section="${otra}"]`);
        if (tab) tab.click();
    }

    // --- Inyector -----------------------------------------------------------------------------
    const $ = (id) => document.getElementById(id);
    function inyector() {
        const caja = $('inyector'), json = $('inyector-json'), msg = $('inyector-msg'), cl = $('inyector-cluster');
        cl.innerHTML = '<option value="">Automático según la rama</option>' + CLUSTERS.map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('');
        const abrir = () => { caja.hidden = false; pintarLista(); json.focus(); };
        const cerrar = () => { caja.hidden = true; };
        const aviso = (t, error) => { msg.textContent = t; msg.classList.toggle('is-error', !!error); };
        const leerJson = () => {
            try { return JSON.parse(json.value); } catch (e) { aviso('El texto no es JSON válido: ' + e.message, true); return null; }
        };
        function pintarLista() {
            const lista = Neuronas.leer();
            $('inyector-lista').innerHTML = lista.length
                ? lista.map(r => `<li><span>${esc(r.neurona.nombre)} <small>${esc(CLUSTERS.find(c => c.id === r.cluster).name)}</small></span><button type="button" class="control control-quiet" data-quitar="${esc(r.neurona.id)}">Quitar</button></li>`).join('')
                : '<li class="vacio">Todavía no has inyectado ninguna neurona.</li>';
        }
        $('inject-button').addEventListener('click', abrir);
        $('inyector-cerrar').addEventListener('click', cerrar);
        caja.addEventListener('click', (e) => { if (e.target === caja) cerrar(); });
        window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !caja.hidden) { e.stopPropagation(); cerrar(); } }, true);
        $('inyector-prompt').addEventListener('click', async () => {
            const texto = Neuronas.prompt(CLUSTERS.map(c => c.name));
            try { await navigator.clipboard.writeText(texto); aviso('Prompt copiado. Pégalo en tu IA y pega aquí el JSON que te devuelva.'); }
            catch { json.value = texto; json.select(); aviso('Tu navegador no deja copiar solo: el prompt está en el cuadro, cópialo desde ahí.'); }
        });
        $('inyector-validar').addEventListener('click', () => {
            const n = leerJson();
            if (!n) return;
            const v = Neuronas.validar(n);
            aviso(v.ok ? `Correcta: «${n.nombre}» (${(n.glosario || []).length} términos, ${(n.ejercicios || []).length} ejercicios${n.laboratorio ? ', con laboratorio' : ''}).` : v.errores.join('\n'), !v.ok);
        });
        $('inyector-anadir').addEventListener('click', () => {
            const n = leerJson();
            if (!n) return;
            const cluster = cl.value || Neuronas.clusterPara(n.cluster);
            const r = Neuronas.añadir(n, cluster);
            if (!r.ok) { aviso(r.errores.join('\n'), true); return; }
            try { sessionStorage.setItem('gp.reabrir', 'neu_' + n.id); } catch { /* opcional */ }
            location.reload();
        });
        $('inyector-lista').addEventListener('click', (e) => {
            const q = e.target.closest('[data-quitar]');
            if (!q) return;
            Neuronas.quitar(q.dataset.quitar);
            try { sessionStorage.removeItem('gp.reabrir'); } catch { /* opcional */ }
            location.reload();
        });
        $('inyector-exportar').addEventListener('click', () => {
            const blob = new Blob([Neuronas.exportar()], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'gedankenpalast-neuronas.json';
            a.click();
            URL.revokeObjectURL(a.href);
        });
        $('inyector-importar').addEventListener('click', () => {
            const r = Neuronas.importar(json.value);
            if (r.ok) location.reload(); else aviso(r.errores.join('\n') || 'No hay nada que importar.', true);
        });
    }

    // Tras añadir una neurona la página se recarga: vuelve al interior y abre el tema
    function reabrir() {
        let id = null;
        try { id = sessionStorage.getItem('gp.reabrir'); sessionStorage.removeItem('gp.reabrir'); } catch { /* opcional */ }
        if (!id || !TOPIC_BY_ID[id]) return;
        setTimeout(() => { showCosmos(); finishTransition(); selectTopic(id); }, 400);
    }

    conectarPanel();
    inyector();
    reabrir();
    return { render, markdown };
})();
