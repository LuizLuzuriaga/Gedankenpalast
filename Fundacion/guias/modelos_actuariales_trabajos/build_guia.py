"""Genera Fundacion/guias/modelos_actuariales.html a partir de content_tN.py y de los entregables de cada tema."""
import re, html, json, pathlib, importlib, sys
HERE = pathlib.Path(__file__).parent
GUIAS = HERE.parent
sys.path.insert(0, str(HERE))

# ---------- CSS: el de la guía de Renta fija, más unos extras ----------
rf = (GUIAS / "renta_fija.html").read_text(encoding="utf-8")
CSS = re.search(r"<style>(.*?)</style>", rf, re.S).group(1)
CSS += """
.tema-work { background: var(--surface); border: 1px solid var(--rule); border-radius: 6px; }
.tema-work > summary { cursor: pointer; padding: 12px 16px; font-family: var(--font-display); font-weight: 700; font-size: 18px; list-style: none; display: flex; gap: 10px; align-items: baseline; }
.tema-work > summary::-webkit-details-marker { display: none; }
.tema-work > summary::before { content: "+"; font-family: var(--font-data); color: var(--accent); }
.tema-work[open] > summary::before { content: "\\2212"; }
.tema-work > .inner { padding: 4px 16px 16px; display: grid; gap: 14px; }
.tema-work .pend { color: var(--muted); font-family: var(--font-body); font-size: 14px; font-weight: 400; }
.tools a { text-decoration: none; }
.tools button.pri { background: var(--accent); color: var(--surface); }
img.fimg { display:block; max-width:100%; height:auto; margin:0 auto; background:#fff; filter:invert(1) hue-rotate(180deg); border-radius:6px; padding:6px; box-sizing:border-box; }
.out-block { white-space: pre; overflow: auto; max-height: 360px; background: var(--code-bg); border: 1px solid var(--rule); border-radius: 6px; padding: 10px 14px; font-family: var(--font-data); font-size: 12px; line-height: 1.5; }
.kind { font-family: var(--font-data); font-size: 11.5px; letter-spacing: .06em; text-transform: uppercase; color: var(--pres); }
.nocode { font-size: 13px; color: var(--muted); }
"""

KW_PY = r"\b(def|return|import|from|as|for|in|if|else|elif|print|assert|lambda|True|False|None|np|pd|plt)\b"
KW_R = r"\b(function|return|if|else|for|library|suppressPackageStartupMessages|TRUE|FALSE|NULL|cat|print|sapply|Map|do\.call|cbind|rbind)\b"

def hl(code, lang):
    s = html.escape(code, quote=False)
    kw = KW_PY if lang == "py" else KW_R
    pat = re.compile(r'(?P<com>#[^\n]*)|(?P<str>"[^"\n]*"|\'[^\'\n]*\')|(?P<num>\b\d+\.?\d*(?:e-?\d+)?\b)|(?P<kw>' + kw[2:-2] + r')', re.I if False else 0)
    def rep(m):
        for k in ("com", "str", "num", "kw"):
            if m.group(k) is not None:
                cls = {"com": "c-com", "str": "c-str", "num": "c-num", "kw": "c-kw"}[k]
                return f'<span class="{cls}">{m.group(0)}</span>'
        return m.group(0)
    return pat.sub(rep, s)

def code_block(path, lang, label, dl):
    p = GUIAS / "modelos_actuariales_trabajos" / path
    code = p.read_text(encoding="utf-8")
    btns = " ".join(f'<a href="modelos_actuariales_trabajos/{h}" download><button type="button">{t}</button></a>' for t, h in dl)
    return (f'<details class="codebox"><summary>Ver el código ({label})</summary><div class="code">'
            f'<div class="code-head"><span class="fname">{p.name}</span><span class="badge">{lang.upper() if lang!="py" else "Python"}</span></div>'
            f'<pre><code>{hl(code, lang)}</code></pre></div></details><div class="tools">{btns}</div>')

def dl(href, text, pri=False, name=None):
    cls = ' class="pri"' if pri else ""
    return f'<a href="modelos_actuariales_trabajos/{href}" download><button type="button"{cls}>{text}</button></a>'

def view(href, text="Abrir en pestaña"):
    return f'<a href="modelos_actuariales_trabajos/{href}" target="_blank" rel="noopener"><button type="button">{text}</button></a>'

def table(rows):
    h = "".join(f"<th>{c}</th>" for c in rows[0])
    b = "".join("<tr>" + "".join(f'<td class="{"num" if i>1 else ""}">{c}</td>' for i, c in enumerate(r)) + "</tr>" for r in rows[1:])
    return f'<div class="tbl"><table class="mini"><thead><tr>{h}</tr></thead><tbody>{b}</tbody></table></div>'

def nb_output(slug):
    import nbformat
    nb = nbformat.read(HERE / slug / f"{slug}_practica.ipynb", as_version=4)
    outs = []
    for c in nb.cells:
        if c.cell_type != "code": continue
        for o in c.outputs:
            if o.output_type == "stream": outs.append(o.text.rstrip())
            elif o.output_type == "execute_result" and "text/plain" in o.data: outs.append(o.data["text/plain"].rstrip())
    return "\n\n".join(outs)

def r_output(slug):
    f = HERE / slug / f"{slug}_practica_R_salida.txt"
    if not f.exists(): return ""
    lines = [l for l in f.read_text(encoding="utf-8").splitlines() if not (l.startswith("Aviso") or l.startswith("package '") or l.startswith("Warning") or l.startswith("(`geom"))]
    return "\n".join(lines).strip()

# ---------- carga de temas ----------
TEMAS = []
for n in range(1, 7):
    try: TEMAS.append(importlib.import_module(f"content_t{n}").T)
    except ModuleNotFoundError: pass

def fig(src, cap):
    return f'<figure class="fig"><img class="fimg" src="modelos_actuariales_trabajos/{src}" alt="{html.escape(cap)}" loading="lazy"><figcaption>{cap}</figcaption></figure>'

def sec_tema(t):
    parts = []
    for i, (h, body) in enumerate(t["explain"], 1):
        parts.append(f'<div class="sub" id="{t["id"]}-e{i}"><h3>{t["num"]}.{i} {h}</h3>{body}</div>')
    return (f'<section id="{t["id"]}"><div class="sec-head"><div class="eyebrow">Tema {t["num"]}</div><h2>{t["title"]}</h2></div>'
            f'<p class="lede">{t["lede"]}</p>' + "".join(parts) +
            f'<p class="note">Respuestas, PDF, Excel, Python y R de este tema: <a href="#tr-repaso-{t["id"]}">repaso</a> · <a href="#tr-debate-{t["id"]}">debate</a> · <a href="#tr-practica-{t["id"]}">ejercicio práctico</a>.</p></section>')

def qblocks(items, kind, t):
    out = []
    for i, q in enumerate(items, 1):
        out.append(f'<div class="q"><span class="qn">{kind} {i}</span><p class="stmt">{q["q"]}</p>{q["a"]}</div>')
    return "".join(out)

def work_pdf(t, kind):
    k = "repaso" if kind == "Repaso" else "debate"
    f = t["files"]
    desc = "tres preguntas de repaso" if k == "repaso" else f"{len(t['debate'])} preguntas de debate"
    return (f'<div class="tools"><span class="kind">PDF · {desc}</span> {dl(f[k+"_pdf"], "Descargar PDF", True)} {view(f[k+"_pdf"], "Ver PDF")} {dl(f[k+"_tex"], "Descargar .tex")}</div>')

def sec_trabajos():
    out = ['<section id="trabajos"><div class="sec-head"><div class="eyebrow">Evaluación y práctica</div><h2>Trabajos</h2></div>',
           '<p class="note">Cada subbloque (repaso, debate, ejercicios prácticos) contiene un bloque por tema con las respuestas explicadas y los archivos para descargar. Los PDF están hechos en LaTeX (se descarga también el .tex); el Excel y los PDF no muestran código; los cuadernos de Python (.ipynb) y los scripts de R (.R) sí, y se pueden descargar. Autor: Luiz Luzuriaga.</p>']
    # Repaso
    out.append('<div class="sub" id="tr-repaso"><h3>Preguntas de repaso</h3><p class="note">Tres por tema. Se razonan con rigor: demostraciones, condiciones de validez y comprobación numérica.</p>')
    for t in TEMAS:
        out.append(f'<details class="tema-work" id="tr-repaso-{t["id"]}"><summary>Tema {t["num"]} · {t["title"]}</summary><div class="inner">{work_pdf(t,"Repaso")}{qblocks(t["repaso"],"Repaso",t)}</div></details>')
    out.append('</div>')
    # Debate
    out.append('<div class="sub" id="tr-debate"><h3>Preguntas de debate</h3><p class="note">Respuestas argumentadas con visión actuarial: modelo, cifras del caso y lectura regulatoria.</p>')
    for t in TEMAS:
        out.append(f'<details class="tema-work" id="tr-debate-{t["id"]}"><summary>Tema {t["num"]} · {t["title"]}</summary><div class="inner">{work_pdf(t,"Debate")}{qblocks(t["debate"],"Debate",t)}</div></details>')
    out.append('</div>')
    # Práctica
    out.append('<div class="sub" id="tr-practica"><h3>Ejercicios prácticos</h3><p class="note">El mismo ejercicio resuelto en Excel, Python y R, con resultados idénticos. Se explica el planteamiento, se muestra el código de Python y R, y el Excel se describe sin código.</p>')
    for t in TEMAS:
        p = t["practica"]; f = p["files"]
        steps = "".join(f"<li>{s}</li>" for s in p["steps"])
        pyout = nb_output(t["slug"]); rout = r_output(t["slug"])
        figs_py = "".join(fig(s, c) for s, c in p["figs_py"]); figs_r = "".join(fig(s, c) for s, c in p["figs_r"])
        out.append(f'''<details class="tema-work" id="tr-practica-{t["id"]}"><summary>Tema {t["num"]} · {t["title"]}</summary><div class="inner">
{p["intro"]}<h4>Planteamiento paso a paso</h4><ol class="walk">{steps}</ol>
<h4>Resultados</h4>{table(p["results"])}{p["results_note"]}{p["extra"]}{p["lectura"]}
<div class="card"><span class="tag">Excel</span><p class="nocode">Sin código visible: se descarga el libro con fórmulas vivas.</p>{p["excel"]}<div class="tools">{dl(f["xlsx"],"Descargar .xlsx",True)}</div></div>
<div class="card"><span class="tag">Python</span>{code_block(f["py"],"py","Python",[("Descargar .ipynb",f["ipynb"]),("Descargar .py",f["py"])])}
<h4>Salida de la ejecución</h4><div class="out-block">{html.escape(pyout)}</div>{figs_py}</div>
<div class="card"><span class="tag">R</span>{code_block(f["r"],"r","R",[("Descargar .R",f["r"])])}
<h4>Salida de la ejecución</h4><div class="out-block">{html.escape(rout)}</div>{figs_r}</div>
</div></details>''')
    out.append('</div></section>')
    return "".join(out)

def mapa():
    rows = "".join(f'<tr><td><a href="#{t["id"]}">Tema {t["num"]} · {t["short"]}</a></td><td>{t["title"]}</td><td><a href="#tr-repaso-{t["id"]}">R</a> · <a href="#tr-debate-{t["id"]}">D</a> · <a href="#tr-practica-{t["id"]}">P</a></td></tr>' for t in TEMAS)
    return (f'<section id="mapa"><div class="sec-head"><div class="eyebrow">Qué entra</div><h2>Mapa del temario</h2></div>'
            f'<div class="tbl"><table><thead><tr><th>Tema</th><th>Contenido</th><th>Trabajos (R = repaso, D = debate, P = práctico)</th></tr></thead><tbody>{rows}</tbody></table></div></section>')

def build():
    nav = "".join(f'<a href="#{t["id"]}">Tema {t["num"]} · {t["short"]}</a>' for t in TEMAS)
    body = mapa() + "".join(sec_tema(t) for t in TEMAS) + sec_trabajos()
    doc = f'''<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<meta name="description" content="Guía de Matemática Actuarial de la Estabilidad y Solvencia: utilidad, modelo individual y colectivo, medidas de riesgo, valores extremos y cópulas, con trabajos resueltos en PDF, Excel, Python y R.">
<title>Matemática actuarial de la solvencia (No Vida II)</title>
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='14' fill='%230a0a0b'/%3E%3C/svg%3E">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=STIX+Two+Text:ital,wght@0,400;0,600;1,400&family=IBM+Plex+Mono:wght@400;500&display=swap">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/dreampulse/computer-modern-web-font@master/fonts.css">
<script>window.MathJax={{tex:{{inlineMath:[['\\\\(','\\\\)']],displayMath:[['\\\\[','\\\\]']]}},svg:{{fontCache:'global'}},options:{{enableMenu:false}}}};</script>
<script src="https://cdn.jsdelivr.net/npm/mathjax@3.2.2/es5/tex-svg.js" defer></script>
<style>{CSS}</style></head><body>
<nav class="toc" aria-label="Índice"><div class="in"><a href="../" target="_top">← Gendanken Palast</a><a href="#mapa">Mapa</a>{nav}<a href="#trabajos">Trabajos</a><a href="#tr-repaso">Repaso</a><a href="#tr-debate">Debate</a><a href="#tr-practica">Prácticos</a></div></nav>
<div class="wrap"><header class="hero"><div class="eyebrow">Máster CC. Actuariales y Financieras · UAH · Prof. Hugo González Riera</div>
<h1>Matemática Actuarial de la Estabilidad y Solvencia de la Actividad Aseguradora</h1>
<div class="eyebrow">(Matemática No Vida II)</div>
<p class="lede">Guía de estudio de los seis temas del bloque de teoría del riesgo: utilidad y reaseguro, modelo individual, modelo colectivo, medidas de riesgo coherentes, valores extremos y dependencia con cópulas. Cada tema se explica y se acompaña de las respuestas a las preguntas de repaso y debate y del ejercicio práctico en Excel, Python y R.</p>
<div class="hero-meta"><span class="chip">Trabajos de <b>Luiz Luzuriaga</b></span><span class="src">PDF en LaTeX · Excel · Python · R</span></div></header>
{body}
<footer class="foot"><div>Fuentes: diapositivas del Máster en Ciencias Actuariales y Financieras (Universidad de Alcalá). Elaboración propia: Luiz Luzuriaga.</div></footer></div></body></html>'''
    out = GUIAS / "modelos_actuariales.html"
    out.write_text(doc, encoding="utf-8"); print("guia ok", out, len(doc) // 1024, "KB", [t["id"] for t in TEMAS])

if __name__ == "__main__":
    build()
