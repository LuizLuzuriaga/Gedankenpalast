# -*- coding: utf-8 -*-
"""Trabajo 1 · Renta Fija y sus Derivados (curso 2026-27): Euribor, forwards y ETTI.

Convención (la del Tema 2, ejemplo 7.1): capitalización simple y año comercial (ACT/360) para el Euribor,
plazos en días reales (vencimiento = misma fecha + plazo, siguiente día hábil TARGET), tipo compuesto
equivalente con (1+R)^(n/365) = 1 + i*n/360 y forward con la fórmula (7) del Tema 2.
"""
import json, datetime as dt
from pathlib import Path
import numpy as np, pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from dateutil.easter import easter
from dateutil.relativedelta import relativedelta

OUT = Path(__file__).parent
D = dt.date
fechas = [D(2024,10,1), D(2025,1,2), D(2025,4,1), D(2025,7,1), D(2025,10,1), D(2026,1,2), D(2026,4,1), D(2026,7,1), D(2026,10,1)]
TEN = ["1 semana", "3 meses", "6 meses", "12 meses"]
euribor = np.array([
    [3.328, 3.252, 3.092, 2.749], [2.911, 2.736, 2.562, 2.448], [2.390, 2.324, 2.309, 2.277],
    [1.902, 1.961, 2.051, 2.070], [1.914, 2.017, 2.079, 2.204], [1.891, 2.029, 2.105, 2.245],
    [1.895, 2.075, 2.488, 2.845], [2.135, 2.312, 2.554, 2.727], [2.438, 2.589, 3.043, 3.303]])

# --- calendario TARGET -----------------------------------------------------------------
def festivos(y):
    e = easter(y)
    return {D(y,1,1), e - dt.timedelta(2), e + dt.timedelta(1), D(y,5,1), D(y,12,25), D(y,12,26)}
FEST = set().union(*[festivos(y) for y in range(2024, 2029)])
def habil(d): return d.weekday() < 5 and d not in FEST
def siguiente_habil(d):
    while not habil(d): d += dt.timedelta(1)
    return d
def vencimiento(d, k):
    """k = 'w' (7 días) o nº de meses."""
    v = d + dt.timedelta(7) if k == "w" else d + relativedelta(months=k)
    return siguiente_habil(v)

filas = []
for f, row in zip(fechas, euribor):
    venc = [vencimiento(f, k) for k in ("w", 3, 6, 12)]
    n = [(v - f).days for v in venc]
    i = row / 100
    R = (1 + i * np.array(n) / 360) ** (365 / np.array(n)) - 1       # compuesto equivalente
    DF = 1 / (1 + i * np.array(n) / 360)
    def fwd(a, b):   # a, b = índices de plazo (1: 3m, 2: 6m, 3: 12m)
        comp = ((1 + R[b]) ** (n[b] / 365) / (1 + R[a]) ** (n[a] / 365)) ** (365 / (n[b] - n[a])) - 1
        simp = ((1 + i[b] * n[b] / 360) / (1 + i[a] * n[a] / 360) - 1) * 360 / (n[b] - n[a])
        return comp, simp
    f36c, f36s = fwd(1, 2); f612c, f612s = fwd(2, 3)
    filas.append(dict(fecha=f, venc=venc, n=n, i=i, R=R, DF=DF, f36c=f36c, f36s=f36s, f612c=f612c, f612s=f612s))

# --- contraste ex post: forward frente al tipo que luego se observó (forward simple, mismo criterio ACT/360) ---
# F3/12;6/12 (3 meses, dentro de 3 meses) se compara con el Euribor 3m de la fila siguiente;
# F6/12;12/12 (6 meses, dentro de 6 meses) con el Euribor 6m dos filas después.
cont = []
for k, r in enumerate(filas):
    c = dict(fecha=r["fecha"])
    c["f36s"] = r["f36s"] * 100
    c["real3"] = euribor[k + 1, 1] if k + 1 < len(filas) else None
    c["f612s"] = r["f612s"] * 100
    c["real6"] = euribor[k + 2, 2] if k + 2 < len(filas) else None
    cont.append(c)
prima3 = [c["f36s"] - c["real3"] for c in cont if c["real3"] is not None]
prima6 = [c["f612s"] - c["real6"] for c in cont if c["real6"] is not None]

# --- salida numérica a JSON para LaTeX y Excel --------------------------------------
res = dict(
    filas=[dict(fecha=r["fecha"].isoformat(), venc=[v.isoformat() for v in r["venc"]], n=r["n"], i=(r["i"] * 100).tolist(),
                R=(r["R"] * 100).tolist(), f36c=r["f36c"] * 100, f36s=r["f36s"] * 100, f612c=r["f612c"] * 100, f612s=r["f612s"] * 100) for r in filas],
    cont=[dict(fecha=c["fecha"].isoformat(), f36s=c["f36s"], real3=c["real3"], f612s=c["f612s"], real6=c["real6"]) for c in cont],
    prima3_media=float(np.mean(prima3)), prima6_media=float(np.mean(prima6)),
    prima3_pos=int(sum(p > 0 for p in prima3)), prima3_n=len(prima3),
    prima6_pos=int(sum(p > 0 for p in prima6)), prima6_n=len(prima6))
(OUT / "t1_resultados.json").write_text(json.dumps(res, indent=1, ensure_ascii=False), encoding="utf-8")

# --- gráficos --------------------------------------------------------------------------
plt.rcParams.update({"font.size": 9, "axes.grid": True, "grid.alpha": .3, "axes.spines.top": False, "axes.spines.right": False})
lab = [f.strftime("%d/%m/%y") for f in fechas]
x = np.arange(len(fechas))
fig, ax = plt.subplots(figsize=(7, 3.6))
for j, (t, c) in enumerate(zip(TEN, ["#7a8794", "#1559a6", "#b07a1d", "#1c7a4a"])):
    ax.plot(x, euribor[:, j], marker="o", ms=4, color=c, label=f"Euribor {t}")
ax.set_xticks(x, lab, rotation=35, ha="right"); ax.set_ylabel("%"); ax.legend(frameon=False, ncol=2)
ax.set_title("Evolución del Euribor (1.er día hábil de cada trimestre)")
fig.tight_layout(); fig.savefig(OUT / "fig_a_euribor.pdf"); plt.close(fig)

fig, ax = plt.subplots(figsize=(7, 3.6))
ax.plot(x, [r["f36c"] * 100 for r in filas], marker="o", ms=4, color="#1559a6", label=r"$F_{3/12;6/12}$ (3 m dentro de 3 m)")
ax.plot(x, [r["f612c"] * 100 for r in filas], marker="s", ms=4, color="#b07a1d", label=r"$F_{6/12;12/12}$ (6 m dentro de 6 m)")
ax.set_xticks(x, lab, rotation=35, ha="right"); ax.set_ylabel("% (compuesto anual equivalente)"); ax.legend(frameon=False)
ax.set_title("Tipos forward implícitos en la curva del Euribor")
fig.tight_layout(); fig.savefig(OUT / "fig_b_forward.pdf"); plt.close(fig)

fig, axs = plt.subplots(1, 3, figsize=(7.4, 2.9), sharey=True)
for ax, k in zip(axs, (0, 4, 8)):
    r = filas[k]
    ax.plot([n / 365 * 12 for n in r["n"]], r["R"] * 100, marker="o", color="#1559a6")
    ax.set_title(fechas[k].strftime("%d/%m/%Y")); ax.set_xlabel("plazo (meses)")
axs[0].set_ylabel("tipo compuesto anual (%)")
fig.tight_layout(); fig.savefig(OUT / "fig_c_etti.pdf"); plt.close(fig)

fig, ax = plt.subplots(figsize=(7, 3.4))
xs = [c["fecha"].strftime("%d/%m/%y") for c in cont]
ax.plot(xs, [c["f36s"] for c in cont], "o-", color="#1559a6", label=r"Forward $F_{3/12;6/12}$ (t)")
ax.plot(xs[1:], [c["real3"] for c in cont if c["real3"] is not None], "o--", color="#b3261e", label="Euribor 3 m observado 3 meses después")
ax.set_xticks(range(len(xs)), xs, rotation=35, ha="right"); ax.set_ylabel("%"); ax.legend(frameon=False)
fig.tight_layout(); fig.savefig(OUT / "fig_d_contraste3.pdf"); plt.close(fig)
fig, ax = plt.subplots(figsize=(7, 3.4))
ax.plot(xs, [c["f612s"] for c in cont], "o-", color="#b07a1d", label=r"Forward $F_{6/12;12/12}$ (t)")
ax.plot(xs[2:], [c["real6"] for c in cont if c["real6"] is not None], "o--", color="#b3261e", label="Euribor 6 m observado 6 meses después")
ax.set_xticks(range(len(xs)), xs, rotation=35, ha="right"); ax.set_ylabel("%"); ax.legend(frameon=False)
fig.tight_layout(); fig.savefig(OUT / "fig_d_contraste6.pdf"); plt.close(fig)

# --- Excel con fórmulas vivas -------------------------------------------------------------
import xlsxwriter
wb = xlsxwriter.Workbook(str(OUT / "Trabajo1_Euribor_RentaFija.xlsx"))
b = wb.add_format({"bold": True, "bg_color": "#DCE8F5", "border": 1, "align": "center", "text_wrap": True})
d_ = wb.add_format({"num_format": "dd/mm/yyyy", "border": 1})
t3 = wb.add_format({"num_format": "0.000", "border": 1}); t4 = wb.add_format({"num_format": "0.0000", "border": 1})
t6 = wb.add_format({"num_format": "0.000000", "border": 1}); n0 = wb.add_format({"num_format": "0", "border": 1})
inp = wb.add_format({"num_format": "0.000", "border": 1, "font_color": "#0000FF"})
inpd = wb.add_format({"num_format": "dd/mm/yyyy", "border": 1, "font_color": "#0000FF"})

ws = wb.add_worksheet("Datos y calculos")
ws.write(0, 0, "Trabajo 1 · Euribor, forwards y ETTI (ACT/360, capitalización simple; compuesto equivalente (1+R)^(n/365)=1+i·n/360). Azul = dato; negro = fórmula.")
ws.write_row(2, 0, ["Fecha", "Euribor 1s (%)", "Euribor 3m (%)", "Euribor 6m (%)", "Euribor 12m (%)",
                    "Venc. 1s", "Venc. 3m", "Venc. 6m", "Venc. 12m", "n 1s", "n 3m", "n 6m", "n 12m",
                    "R 1s (%)", "R 3m (%)", "R 6m (%)", "R 12m (%)",
                    "F3/12;6/12 comp. (%)", "F6/12;12/12 comp. (%)", "F3/12;6/12 simple (%)", "F6/12;12/12 simple (%)"], b)
ws.set_row(2, 42)
ws.set_column(0, 0, 11); ws.set_column(1, 4, 10); ws.set_column(5, 8, 11); ws.set_column(9, 12, 6); ws.set_column(13, 20, 13)
for k, r in enumerate(filas):
    row = 3 + k; e = row + 1
    ws.write_datetime(row, 0, dt.datetime.combine(r["fecha"], dt.time()), inpd)
    for j in range(4): ws.write_number(row, 1 + j, euribor[k, j], inp)
    for j, v in enumerate(r["venc"]): ws.write_datetime(row, 5 + j, dt.datetime.combine(v, dt.time()), inpd)
    for j in range(4): ws.write_formula(row, 9 + j, f"={chr(70+j)}{e}-$A{e}", n0, r["n"][j])
    for j in range(4):
        ws.write_formula(row, 13 + j, f"=((1+{chr(66+j)}{e}/100*{chr(74+j)}{e}/360)^(365/{chr(74+j)}{e})-1)*100", t4, r["R"][j] * 100)
    # forward compuesto: columnas O(3m)=14,P(6m)=15,Q(12m)=16 ; n: K,L,M
    ws.write_formula(row, 17, f"=((((1+P{e}/100)^(L{e}/365))/((1+O{e}/100)^(K{e}/365)))^(365/(L{e}-K{e}))-1)*100", t4, r["f36c"] * 100)
    ws.write_formula(row, 18, f"=((((1+Q{e}/100)^(M{e}/365))/((1+P{e}/100)^(L{e}/365)))^(365/(M{e}-L{e}))-1)*100", t4, r["f612c"] * 100)
    ws.write_formula(row, 19, f"=(((1+D{e}/100*L{e}/360)/(1+C{e}/100*K{e}/360))-1)*360/(L{e}-K{e})*100", t4, r["f36s"])
    ws.write_formula(row, 20, f"=(((1+E{e}/100*M{e}/360)/(1+D{e}/100*L{e}/360))-1)*360/(M{e}-L{e})*100", t4, r["f612s"])
ch = wb.add_chart({"type": "line"})
for j, nm in enumerate(TEN):
    ch.add_series({"name": f"Euribor {nm}", "categories": ["Datos y calculos", 3, 0, 11, 0], "values": ["Datos y calculos", 3, 1 + j, 11, 1 + j], "marker": {"type": "circle"}})
ch.set_title({"name": "a) Evolución del Euribor"}); ch.set_y_axis({"name": "%"}); ch.set_x_axis({"date_axis": False, "num_format": "dd/mm/yy"})
ch.set_size({"width": 720, "height": 340}); ws.insert_chart("A16", ch)
ch2 = wb.add_chart({"type": "line"})
ch2.add_series({"name": "F3/12;6/12", "categories": ["Datos y calculos", 3, 0, 11, 0], "values": ["Datos y calculos", 3, 17, 11, 17], "marker": {"type": "circle"}})
ch2.add_series({"name": "F6/12;12/12", "categories": ["Datos y calculos", 3, 0, 11, 0], "values": ["Datos y calculos", 3, 18, 11, 18], "marker": {"type": "square"}})
ch2.set_title({"name": "b) Tipos forward (compuesto equivalente)"}); ch2.set_y_axis({"name": "%"}); ch2.set_size({"width": 720, "height": 340}); ws.insert_chart("L16", ch2)

# Hoja ETTI (c): 3 fechas
we = wb.add_worksheet("ETTI c)")
we.write_row(0, 0, ["Plazo (meses)", "ETTI 01/10/2024 (%)", "ETTI 01/10/2025 (%)", "ETTI 01/10/2026 (%)"], b); we.set_column(0, 3, 20)
for j in range(4):
    we.write_formula(1 + j, 0, f"='Datos y calculos'!{chr(74+j)}{4}/365*12", t3, filas[0]["n"][j] / 365 * 12)
for c, k in enumerate((0, 4, 8)):
    for j in range(4):
        we.write_formula(1 + j, 1 + c, f"='Datos y calculos'!{chr(78+j)}{4+k}", t4, filas[k]["R"][j] * 100)
we.write(6, 0, "Nota: el eje de plazos usa los días de la 1.ª fila (01/10/2024); los plazos de las otras fechas difieren en pocos días.")
ch3 = wb.add_chart({"type": "scatter", "subtype": "straight_with_markers"})
for c, nm in enumerate(["01/10/2024", "01/10/2025", "01/10/2026"]):
    ch3.add_series({"name": nm, "categories": ["ETTI c)", 1, 0, 4, 0], "values": ["ETTI c)", 1, 1 + c, 4, 1 + c]})
ch3.set_title({"name": "c) ETTI del Euribor"}); ch3.set_x_axis({"name": "meses"}); ch3.set_y_axis({"name": "%"}); ch3.set_size({"width": 640, "height": 340}); we.insert_chart("F2", ch3)

# Hoja contraste (d)
wc = wb.add_worksheet("Contraste d)")
wc.write_row(0, 0, ["Fecha t", "F3/12;6/12 simple (%)", "Euribor 3m en t+3m (%)", "Diferencia (prima ex post)", "F6/12;12/12 simple (%)", "Euribor 6m en t+6m (%)", "Diferencia (prima ex post)"], b)
wc.set_row(0, 32); wc.set_column(0, 6, 17)
for k, c in enumerate(cont):
    row = 1 + k; src = 4 + k
    wc.write_formula(row, 0, f"='Datos y calculos'!A{src}", d_, None)
    wc.write_formula(row, 1, f"='Datos y calculos'!T{src}", t4, c["f36s"])
    if c["real3"] is not None:
        wc.write_formula(row, 2, f"='Datos y calculos'!C{src+1}", t3, c["real3"]); wc.write_formula(row, 3, f"=B{row+1}-C{row+1}", t4, c["f36s"] - c["real3"])
    wc.write_formula(row, 4, f"='Datos y calculos'!U{src}", t4, c["f612s"])
    if c["real6"] is not None:
        wc.write_formula(row, 5, f"='Datos y calculos'!D{src+2}", t3, c["real6"]); wc.write_formula(row, 6, f"=E{row+1}-F{row+1}", t4, c["f612s"] - c["real6"])
wc.write(11, 0, "Media"); wc.write_formula(11, 3, "=AVERAGE(D2:D9)", t4, res["prima3_media"]); wc.write_formula(11, 6, "=AVERAGE(G2:G8)", t4, res["prima6_media"])
wc.write(12, 0, "Nº diferencias > 0"); wc.write_formula(12, 3, '=COUNTIF(D2:D9,">0")', n0, res["prima3_pos"]); wc.write_formula(12, 6, '=COUNTIF(G2:G8,">0")', n0, res["prima6_pos"])
wb.close()
print(json.dumps({k: res[k] for k in res if k.startswith("prima")}, indent=1))
for r in res["filas"]: print(r["fecha"], r["n"], [round(x, 3) for x in r["R"]], round(r["f36c"], 3), round(r["f612c"], 3), round(r["f36s"], 3), round(r["f612s"], 3))
