/**
 * Botón «Ejecutar Python» para las guías sueltas (simulación, bayesiana, renta fija).
 * Necesita python_runner.js cargado antes. Añade el botón a cada caja .code[data-pair]
 * que monta mountCode() de la guía, y ejecuta el Python con Pyodide en el navegador.
 */
(() => {
    const css = document.createElement('style');
    css.textContent = `
.code:has(.code-tabs button[data-l="r"][aria-selected="true"]) .run-py { display: none; }
.run-out { margin: 0; padding: 10px 14px; border-top: 1px solid var(--rule); font-family: var(--font-data); font-size: 12.5px; line-height: 1.5; white-space: pre-wrap; overflow: auto; max-height: 320px; }
.run-out.is-error { color: var(--unknown, #c0392b); }
.run-figs { display: grid; gap: 10px; padding: 0 14px; }
.run-figs:not(:empty) { padding-bottom: 12px; border-top: 1px solid var(--rule); padding-top: 12px; }
.run-fig { max-width: 100%; height: auto; border-radius: 4px; background: #fff; }
.run-status { font-size: 12px; color: var(--muted); }`;
    document.head.appendChild(css);

    async function correr(box, boton) {
        const codigo = box.querySelector('pre[data-l="py"] code').textContent;
        const estado = box.querySelector('.run-status');
        const out = box.querySelector('.run-out');
        const figs = box.querySelector('.run-figs');
        boton.disabled = true;
        try {
            const res = await PyRunner.ejecutar(codigo, m => { estado.textContent = m; });
            const texto = [res.texto, res.error ? `Error: ${res.error}` : ''].filter(Boolean).join('\n');
            out.hidden = !texto;
            out.textContent = texto;
            out.classList.toggle('is-error', !!res.error);
            figs.innerHTML = res.figuras.slice(0, 6).map((b, i) => `<img class="run-fig" alt="Figura ${i + 1} del código" src="data:image/png;base64,${b}">`).join('');
            estado.textContent = res.error ? 'Terminó con un error.' : 'Listo.';
        } catch (e) {
            out.hidden = false;
            out.classList.add('is-error');
            out.textContent = `Error: ${e.message}`;
            estado.textContent = 'No se pudo ejecutar.';
        } finally {
            boton.disabled = false;
        }
    }

    function montar(box) {
        if (box.querySelector('.run-py') || !box.querySelector('pre[data-l="py"]')) return;
        const copiar = box.querySelector('.copy');
        const boton = document.createElement('button');
        boton.type = 'button';
        boton.className = 'run-py';
        boton.textContent = 'Ejecutar';
        boton.title = 'Ejecuta el Python en el navegador (la primera vez descarga Pyodide)';
        const estado = document.createElement('span');
        estado.className = 'run-status';
        estado.setAttribute('role', 'status');
        copiar.before(boton);
        boton.before(estado);
        const out = document.createElement('pre');
        out.className = 'run-out';
        out.hidden = true;
        const figs = document.createElement('div');
        figs.className = 'run-figs';
        box.append(out, figs);
        boton.addEventListener('click', () => correr(box, boton));
    }

    const escanear = () => document.querySelectorAll('.code[data-pair]').forEach(montar);
    new MutationObserver(escanear).observe(document.documentElement, { childList: true, subtree: true });
    escanear();
})();
