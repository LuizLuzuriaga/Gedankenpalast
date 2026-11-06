"""Utilidades comunes para generar los entregables de cada tema (ipynb ejecutado, figuras, PDF por Tectonic)."""
import re, base64, subprocess, json, pathlib, nbformat
from nbclient import NotebookClient

TECTONIC = r"C:\Users\luzur\AppData\Local\Temp\claude\3a63025f5cdf9784\59089931-4f16-4198-8958-320ecf7c722d\scratchpad\tectonic\tectonic.exe"
RSCRIPT = r"C:\Program Files\R\R-4.5.2\bin\Rscript.exe"

def py_to_ipynb(py, ipynb, execute=True):
    """Convierte un script con marcadores '# %%' / '# %% [markdown]' en cuaderno; lo ejecuta y guarda salidas."""
    txt = pathlib.Path(py).read_text(encoding="utf-8")
    cells = []
    for chunk in re.split(r"^# %%", txt, flags=re.M)[1:]:
        head, _, body = chunk.partition("\n")
        body = body.strip("\n")
        if "[markdown]" in head:
            md = "\n".join(l[2:] if l.startswith("# ") else l[1:] if l.startswith("#") else l for l in body.split("\n"))
            cells.append(nbformat.v4.new_markdown_cell(md))
        else:
            cells.append(nbformat.v4.new_code_cell(body))
    nb = nbformat.v4.new_notebook(cells=cells, metadata={"kernelspec": {"name": "python3", "display_name": "Python 3", "language": "python"}})
    if execute:
        NotebookClient(nb, timeout=300, kernel_name="python3", resources={"metadata": {"path": str(pathlib.Path(py).parent)}}).execute()
    nbformat.write(nb, ipynb)
    return nb

def save_outputs(nb, outdir, prefix):
    """Extrae PNG de las salidas -> {prefix}_py_N.png y devuelve la lista [(índice_celda, texto, [pngs])]."""
    out, k = [], 0
    for i, c in enumerate(nb.cells):
        if c.cell_type != "code": continue
        txt, pngs = "", []
        for o in c.outputs:
            if o.output_type == "stream": txt += o.text
            elif o.output_type in ("execute_result", "display_data"):
                d = o.data
                if "image/png" in d:
                    k += 1; f = pathlib.Path(outdir) / f"{prefix}_py_{k}.png"
                    f.write_bytes(base64.b64decode(d["image/png"])); pngs.append(f.name)
                elif "text/plain" in d and not txt: txt += d["text/plain"]
        out.append((i, txt, pngs))
    return out

def compile_tex(tex):
    tex = pathlib.Path(tex)
    r = subprocess.run([TECTONIC, "-X", "compile", tex.name] if False else [TECTONIC, tex.name], cwd=tex.parent, capture_output=True, text=True)
    print(r.stdout[-300:] if r.returncode == 0 else r.stdout[-2500:] + r.stderr[-2500:])
    return r.returncode == 0
