/**
 * Gendanken Palast - Ejecutor de Python en el navegador (Pyodide).
 * Se carga después de main.js. Pyodide solo se descarga al pulsar «Ejecutar el Python en el navegador».
 */

const PyRunner = (() => {
    const BASE = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/';
    const MAX_FIG = 6;
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

    // Devuelve { texto, figuras[], error }
    async function ejecutar(codigo, estado = () => {}) {
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
            estado('Instalando librerías…');
            await py.loadPackagesFromImports(codigo);
            estado('Ejecutando…');
            await py.runPythonAsync(codigo);
            const figs = py.runPython('__figuras_gp()').toJs();
            return { texto: salida.join('\n'), figuras: figs, error: null };
        } catch (e) {
            const msg = String(e && e.message ? e.message : e).split('\n').filter(l => l.trim()).slice(-6).join('\n');
            return { texto: salida.join('\n'), figuras: [], error: msg };
        }
    }

    function mostrar(cont, res) {
        const out = cont.querySelector('.run-out'), figs = cont.querySelector('.run-figs');
        const texto = [res.texto, res.error ? `Error: ${res.error}` : ''].filter(Boolean).join('\n');
        out.hidden = !texto;
        out.textContent = texto;
        out.classList.toggle('is-error', !!res.error);
        figs.innerHTML = res.figuras.slice(0, MAX_FIG).map((b, i) => `<img src="data:image/png;base64,${b}" alt="Figura ${i + 1} del código" class="run-fig">`).join('');
    }

    async function correr(cont, codigo) {
        const estado = cont.querySelector('.lab-status');
        const boton = cont.querySelector('.run-py');
        boton.disabled = true;
        try {
            const res = await ejecutar(codigo, m => { estado.textContent = m; });
            mostrar(cont, res);
            estado.textContent = res.error ? 'Terminó con un error.' : 'Listo.';
        } catch (e) {
            mostrar(cont, { texto: '', figuras: [], error: e.message });
            estado.textContent = 'No se pudo ejecutar.';
        } finally {
            boton.disabled = false;
        }
    }

    panelBody.addEventListener('click', (e) => {
        const py = e.target.closest('.run-py');
        if (!py) return;
        const cont = py.closest('.kb-code');
        const bloque = cont.querySelector('.code-block[data-lang="python"]');
        if (bloque) correr(cont, bloque.textContent);
    });

    return { ejecutar };
})();
