r"""Corrige detalles de LaTeX comunes a todos los .tex de los temas: \,\% en modo matematico (babel-spanish) y el simbolo del euro."""
import re, sys, pathlib

def fix(path):
    p = pathlib.Path(path); s = p.read_text(encoding="utf-8")
    s = re.sub(r"\$([^$\n]*?)\$", lambda m: "$" + m.group(1).replace(r"\,\%", r"\%") + "$", s)
    if "textcomp" not in s:
        s = s.replace("enumitem}", "enumitem,textcomp}\n" + r"\newcommand{\euro}{\texteuro}", 1)
    p.write_text(s, encoding="utf-8")

if __name__ == "__main__":
    for a in sys.argv[1:]: fix(a)
