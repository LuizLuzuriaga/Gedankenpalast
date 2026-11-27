# -*- coding: utf-8 -*-
"""
Trabajo 1 · Renta Fija y sus Derivados (curso 2026-27)
Euríbor, tipos forward y ETTI.

Qué hace este script, en el mismo orden que el trabajo y que el Excel
«Trabajo1_Euribor_RentaFija.xlsx» (hojas «Datos y calculos», «ETTI c)» y «Contraste d)»):

  1. Datos: Euríbor a 1 semana y 3, 6 y 12 meses en nueve fechas trimestrales.
  2. Plazos en días reales hasta el vencimiento (calendario TARGET).
  3. Tipo anual compuesto equivalente:      (1 + R)^(n/365) = 1 + i * n/360
  4. Forwards F3/12;6/12 y F6/12;12/12 (compuestos y simples).
  5. Contraste: cada forward frente al Euríbor que se observó después.
  6. Gráficos del PDF (figuras 1 a 6) y el Excel con fórmulas.

Convención del Tema 2 (ejemplo del Euríbor del 28-jun-2013 de los apuntes de Eliseo Navarro):
el Euríbor es capitalización simple, base ACT/360.
"""
import json
import datetime as dt
from pathlib import Path

import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from dateutil.easter import easter
from dateutil.relativedelta import relativedelta
from scipy.interpolate import PchipInterpolator
import xlsxwriter

OUT = Path(__file__).parent
D = dt.date

# =============================================================================
# 1. DATOS  (Excel: hoja «Datos y calculos», columnas A a E, en azul)
# =============================================================================
fechas = [D(2024, 10, 1), D(2025, 1, 2), D(2025, 4, 1), D(2025, 7, 1), D(2025, 10, 1),
          D(2026, 1, 2), D(2026, 4, 1), D(2026, 7, 1), D(2026, 10, 1)]
PLAZOS = ["1 semana", "3 meses", "6 meses", "12 meses"]
# una fila por fecha; columnas: 1 semana, 3 meses, 6 meses, 12 meses (en %)
euribor = np.array([
    [3.328, 3.252, 3.092, 2.749],
    [2.911, 2.736, 2.562, 2.448],
    [2.390, 2.324, 2.309, 2.277],
    [1.902, 1.961, 2.051, 2.070],
    [1.914, 2.017, 2.079, 2.204],
    [1.891, 2.029, 2.105, 2.245],
    [1.895, 2.075, 2.488, 2.845],
    [2.135, 2.312, 2.554, 2.727],
    [2.438, 2.589, 3.043, 3.303]])

# =============================================================================
# 2. PLAZOS EN DÍAS REALES  (Excel: «Datos y calculos», vencimientos en F:I y días n en J:M = vencimiento - fecha)
#    Vencimiento = fecha + plazo; si cae en fin de semana o festivo TARGET, pasa al siguiente día hábil.
# =============================================================================
def festivos_target(anio):
    """Festivos TARGET: 1 de enero, Viernes Santo, Lunes de Pascua, 1 de mayo, 25 y 26 de diciembre."""
    pascua = easter(anio)
    return {D(anio, 1, 1), pascua - dt.timedelta(2), pascua + dt.timedelta(1),
            D(anio, 5, 1), D(anio, 12, 25), D(anio, 12, 26)}

FESTIVOS = set().union(*[festivos_target(a) for a in range(2024, 2029)])

def es_habil(d):
    return d.weekday() < 5 and d not in FESTIVOS

def siguiente_habil(d):
    while not es_habil(d):
        d += dt.timedelta(1)
    return d

def vencimiento(fecha, plazo):
    """plazo = 'w' (una semana, 7 días) o número de meses."""
    v = fecha + dt.timedelta(7) if plazo == "w" else fecha + relativedelta(months=plazo)
    return siguiente_habil(v)

# =============================================================================
# 3 y 4. TIPO COMPUESTO EQUIVALENTE Y FORWARDS
#   Excel «Datos y calculos»:  R (compuesto) en N:Q;  forward compuesto en R:S;  forward simple en T:U
# =============================================================================
filas = []
for fecha, fila_euribor in zip(fechas, euribor):
    venc = [vencimiento(fecha, p) for p in ("w", 3, 6, 12)]
    n = np.array([(v - fecha).days for v in venc])           # días: 1 semana, 3, 6 y 12 meses
    i = fila_euribor / 100                                    # Euríbor en tanto por uno (simple, ACT/360)
    R = (1 + i * n / 360) ** (365 / n) - 1                    # compuesto anual equivalente

    def forward(a, b):
        """Forward entre los plazos a y b (índices: 1 = 3 m, 2 = 6 m, 3 = 12 m)."""
        compuesto = ((1 + R[b]) ** (n[b] / 365) / (1 + R[a]) ** (n[a] / 365)) ** (365 / (n[b] - n[a])) - 1
        simple = ((1 + i[b] * n[b] / 360) / (1 + i[a] * n[a] / 360) - 1) * 360 / (n[b] - n[a])
        return compuesto, simple

    f36c, f36s = forward(1, 2)          # F3/12;6/12: tres meses dentro de tres meses
    f612c, f612s = forward(2, 3)        # F6/12;12/12: seis meses dentro de seis meses
    filas.append(dict(fecha=fecha, venc=venc, n=n.tolist(), i=i, R=R,
                      f36c=f36c, f36s=f36s, f612c=f612c, f612s=f612s))

# =============================================================================
# 5. CONTRASTE CON LO OCURRIDO  (Excel: hoja «Contraste d)»)
#    F3/12;6/12 (forward simple) frente al Euríbor 3 m de la fila siguiente (tres meses después);
#    F6/12;12/12 frente al Euríbor 6 m dos filas después. Diferencia = forward - observado.
# =============================================================================
contraste = []
for k, f in enumerate(filas):
    contraste.append(dict(
        fecha=f["fecha"],
        f36s=f["f36s"] * 100,
        real3=euribor[k + 1, 1] if k + 1 < len(filas) else None,
        f612s=f["f612s"] * 100,
        real6=euribor[k + 2, 2] if k + 2 < len(filas) else None))
dif3 = [c["f36s"] - c["real3"] for c in contraste if c["real3"] is not None]
dif6 = [c["f612s"] - c["real6"] for c in contraste if c["real6"] is not None]

# Resultados en JSON: de aquí salen las tablas y las cifras del PDF
res = dict(
    filas=[dict(fecha=f["fecha"].isoformat(), venc=[v.isoformat() for v in f["venc"]], n=f["n"],
                i=(f["i"] * 100).tolist(), R=(f["R"] * 100).tolist(),
                f36c=f["f36c"] * 100, f36s=f["f36s"] * 100, f612c=f["f612c"] * 100, f612s=f["f612s"] * 100)
           for f in filas],
    cont=[dict(fecha=c["fecha"].isoformat(), f36s=c["f36s"], real3=c["real3"], f612s=c["f612s"], real6=c["real6"])
          for c in contraste],
    prima3_media=float(np.mean(dif3)), prima6_media=float(np.mean(dif6)),      # Excel: fila «Media»
    prima3_pos=int(sum(p > 0 for p in dif3)), prima3_n=len(dif3),             # Excel: fila «Nº diferencias > 0»
    prima6_pos=int(sum(p > 0 for p in dif6)), prima6_n=len(dif6))
(OUT / "t1_resultados.json").write_text(json.dumps(res, indent=1, ensure_ascii=False), encoding="utf-8")

# =============================================================================
# 6. GRÁFICOS DEL PDF
# =============================================================================
plt.rcParams.update({"font.size": 9, "axes.grid": True, "grid.alpha": .3,
                     "axes.spines.top": False, "axes.spines.right": False})
etiquetas = [f.strftime("%d/%m/%y") for f in fechas]
x = np.arange(len(fechas))

def guardar(fig, nombre):
    fig.tight_layout()
    fig.savefig(OUT / nombre)
    plt.close(fig)

# Figura 1 - a) Evolución del Euríbor  (Excel: primer gráfico de «Datos y calculos»)
fig, ax = plt.subplots(figsize=(7, 3.6))
for j, (plazo, color) in enumerate(zip(PLAZOS, ["#7a8794", "#1559a6", "#b07a1d", "#1c7a4a"])):
    ax.plot(x, euribor[:, j], marker="o", ms=4, color=color, label=f"Euríbor {plazo}")
ax.set_xticks(x, etiquetas, rotation=35, ha="right")
ax.set_ylabel("%"); ax.legend(frameon=False, ncol=2)
ax.set_title("Evolución del Euríbor (1.er día hábil de cada trimestre)")
guardar(fig, "fig_a_euribor.pdf")

# Figura 2 - b) Forwards compuestos  (Excel: segundo gráfico de «Datos y calculos», columnas R y S)
fig, ax = plt.subplots(figsize=(7, 3.6))
ax.plot(x, [f["f36c"] * 100 for f in filas], marker="o", ms=4, color="#1559a6", label=r"$F_{3/12;6/12}$ (3 m dentro de 3 m)")
ax.plot(x, [f["f612c"] * 100 for f in filas], marker="s", ms=4, color="#b07a1d", label=r"$F_{6/12;12/12}$ (6 m dentro de 6 m)")
ax.set_xticks(x, etiquetas, rotation=35, ha="right")
ax.set_ylabel("% (compuesto anual equivalente)"); ax.legend(frameon=False)
ax.set_title("Tipos forward implícitos en la curva del Euríbor")
guardar(fig, "fig_b_forward.pdf")

# Figura 3 - c) Las tres ETTI superpuestas  (Excel: gráfico de la hoja «ETTI c)»)
# Los puntos se unen con una curva suavizada; PCHIP es una cúbica monótona que no inventa máximos ni mínimos.
fig, ax = plt.subplots(figsize=(7, 3.8))
for k, color, marca in ((0, "#1559a6", "D"), (4, "#d9771f", "s"), (8, "#1c7a6a", "^")):
    meses = np.array(filas[k]["n"]) / 365 * 12
    tipos = filas[k]["R"] * 100
    xx = np.linspace(meses[0], meses[-1], 200)
    ax.plot(xx, PchipInterpolator(meses, tipos)(xx), color=color, lw=1.8)
    ax.plot(meses, tipos, marca, color=color, ms=6, label=fechas[k].strftime("%d/%m/%Y"))
ax.set_xlabel("plazo hasta el vencimiento (meses)"); ax.set_ylabel("tipo anual compuesto equivalente (%)")
ax.set_xlim(0, 12.6)
ax.legend(frameon=False, loc="upper center", ncol=3, bbox_to_anchor=(0.5, 1.12))
guardar(fig, "fig_c_etti_conjunta.pdf")

# Figura 4 - c) Las mismas tres ETTI por separado
fig, axs = plt.subplots(1, 3, figsize=(7.4, 2.9), sharey=True)
for ax, k in zip(axs, (0, 4, 8)):
    ax.plot(np.array(filas[k]["n"]) / 365 * 12, filas[k]["R"] * 100, marker="o", color="#1559a6")
    ax.set_title(fechas[k].strftime("%d/%m/%Y")); ax.set_xlabel("plazo (meses)")
axs[0].set_ylabel("tipo compuesto anual (%)")
guardar(fig, "fig_c_etti.pdf")

# Figuras 5 y 6 - d) Contraste  (Excel: gráficos de la hoja «Contraste d)»)
# Cada Euríbor observado se dibuja en la fecha en que se calculó el forward que intentaba preverlo,
# así que la distancia vertical entre las dos líneas es la diferencia de la Tabla 4.
xs = [c["fecha"].strftime("%d/%m/%y") for c in contraste]
for clave_f, clave_r, n_obs, color, nombre_f, nombre_r, archivo in (
        ("f36s", "real3", 8, "#1559a6", r"Forward $F_{3/12;6/12}$ calculado en la fecha", "Euríbor 3 m observado tres meses después", "fig_d_contraste3.pdf"),
        ("f612s", "real6", 7, "#b07a1d", r"Forward $F_{6/12;12/12}$ calculado en la fecha", "Euríbor 6 m observado seis meses después", "fig_d_contraste6.pdf")):
    fig, ax = plt.subplots(figsize=(7, 3.4))
    ax.plot(xs, [c[clave_f] for c in contraste], "o-", color=color, label=nombre_f)
    ax.plot(xs[:n_obs], [c[clave_r] for c in contraste[:n_obs]], "o--", color="#b3261e", label=nombre_r)
    ax.set_xticks(range(len(xs)), xs, rotation=35, ha="right")
    ax.set_xlabel("fecha en que se calcula el forward"); ax.set_ylabel("%"); ax.legend(frameon=False)
    guardar(fig, archivo)

# =============================================================================
# EXCEL CON FÓRMULAS  (azul = dato; negro = fórmula). Cada fórmula reproduce un paso de arriba.
# =============================================================================
wb = xlsxwriter.Workbook(str(OUT / "Trabajo1_Euribor_RentaFija.xlsx"))
cab = wb.add_format({"bold": True, "bg_color": "#DCE8F5", "border": 1, "align": "center", "text_wrap": True})
f_fecha = wb.add_format({"num_format": "dd/mm/yyyy", "border": 1})
f3 = wb.add_format({"num_format": "0.000", "border": 1})
f4 = wb.add_format({"num_format": "0.0000", "border": 1})
f0 = wb.add_format({"num_format": "0", "border": 1})
dato = wb.add_format({"num_format": "0.000", "border": 1, "font_color": "#0000FF"})
dato_fecha = wb.add_format({"num_format": "dd/mm/yyyy", "border": 1, "font_color": "#0000FF"})
fecha_excel = lambda d: dt.datetime.combine(d, dt.time())

# --- Hoja «Datos y calculos»: pasos 1 a 4 -----------------------------------------------------
ws = wb.add_worksheet("Datos y calculos")
ws.write(0, 0, "Trabajo 1 · Euríbor, forwards y ETTI (ACT/360, capitalización simple; compuesto equivalente (1+R)^(n/365)=1+i·n/360). Azul = dato; negro = fórmula.")
ws.write_row(2, 0, ["Fecha", "Euríbor 1s (%)", "Euríbor 3m (%)", "Euríbor 6m (%)", "Euríbor 12m (%)",
                    "Venc. 1s", "Venc. 3m", "Venc. 6m", "Venc. 12m", "n 1s", "n 3m", "n 6m", "n 12m",
                    "R 1s (%)", "R 3m (%)", "R 6m (%)", "R 12m (%)",
                    "F3/12;6/12 comp. (%)", "F6/12;12/12 comp. (%)", "F3/12;6/12 simple (%)", "F6/12;12/12 simple (%)"], cab)
ws.set_row(2, 42)
ws.set_column(0, 0, 11); ws.set_column(1, 4, 10); ws.set_column(5, 8, 11); ws.set_column(9, 12, 6); ws.set_column(13, 20, 13)
for k, f in enumerate(filas):
    fila = 3 + k; e = fila + 1                                   # e = número de fila en Excel
    ws.write_datetime(fila, 0, fecha_excel(f["fecha"]), dato_fecha)
    for j in range(4):
        ws.write_number(fila, 1 + j, euribor[k, j], dato)                                   # B:E Euríbor
        ws.write_datetime(fila, 5 + j, fecha_excel(f["venc"][j]), dato_fecha)              # F:I vencimientos
        ws.write_formula(fila, 9 + j, f"={chr(70 + j)}{e}-$A{e}", f0, f["n"][j])            # J:M días n
        i_col, n_col = chr(66 + j), chr(74 + j)
        ws.write_formula(fila, 13 + j, f"=((1+{i_col}{e}/100*{n_col}{e}/360)^(365/{n_col}{e})-1)*100", f4, f["R"][j] * 100)  # N:Q R
    # R:S forward compuesto (fórmula (7) del Tema 2) a partir de R (O = 3m, P = 6m, Q = 12m) y n (K, L, M)
    ws.write_formula(fila, 17, f"=((((1+P{e}/100)^(L{e}/365))/((1+O{e}/100)^(K{e}/365)))^(365/(L{e}-K{e}))-1)*100", f4, f["f36c"] * 100)
    ws.write_formula(fila, 18, f"=((((1+Q{e}/100)^(M{e}/365))/((1+P{e}/100)^(L{e}/365)))^(365/(M{e}-L{e}))-1)*100", f4, f["f612c"] * 100)
    # T:U forward simple ACT/360 a partir del Euríbor (C = 3m, D = 6m, E = 12m)
    ws.write_formula(fila, 19, f"=(((1+D{e}/100*L{e}/360)/(1+C{e}/100*K{e}/360))-1)*360/(L{e}-K{e})*100", f4, f["f36s"])
    ws.write_formula(fila, 20, f"=(((1+E{e}/100*M{e}/360)/(1+D{e}/100*L{e}/360))-1)*360/(M{e}-L{e})*100", f4, f["f612s"])

graf = wb.add_chart({"type": "line"})                         # Figura 1
for j, plazo in enumerate(PLAZOS):
    graf.add_series({"name": f"Euríbor {plazo}", "categories": ["Datos y calculos", 3, 0, 11, 0],
                     "values": ["Datos y calculos", 3, 1 + j, 11, 1 + j], "marker": {"type": "circle"}})
graf.set_title({"name": "a) Evolución del Euríbor"}); graf.set_y_axis({"name": "%"})
graf.set_x_axis({"date_axis": False, "num_format": "dd/mm/yy"}); graf.set_size({"width": 720, "height": 340})
ws.insert_chart("A16", graf)

graf = wb.add_chart({"type": "line"})                         # Figura 2
graf.add_series({"name": "F3/12;6/12", "categories": ["Datos y calculos", 3, 0, 11, 0], "values": ["Datos y calculos", 3, 17, 11, 17], "marker": {"type": "circle"}})
graf.add_series({"name": "F6/12;12/12", "categories": ["Datos y calculos", 3, 0, 11, 0], "values": ["Datos y calculos", 3, 18, 11, 18], "marker": {"type": "square"}})
graf.set_title({"name": "b) Tipos forward (compuesto equivalente)"}); graf.set_y_axis({"name": "%"}); graf.set_size({"width": 720, "height": 340})
ws.insert_chart("L16", graf)

# --- Hoja «ETTI c)»: las tres fechas del apartado c) (Tabla 3 y Figura 3) ------------------------
we = wb.add_worksheet("ETTI c)")
we.write_row(0, 0, ["Plazo (meses)", "ETTI 01/10/2024 (%)", "ETTI 01/10/2025 (%)", "ETTI 01/10/2026 (%)"], cab)
we.set_column(0, 3, 20)
for j in range(4):
    we.write_formula(1 + j, 0, f"='Datos y calculos'!{chr(74 + j)}4/365*12", f3, filas[0]["n"][j] / 365 * 12)
for col, k in enumerate((0, 4, 8)):
    for j in range(4):
        we.write_formula(1 + j, 1 + col, f"='Datos y calculos'!{chr(78 + j)}{4 + k}", f4, filas[k]["R"][j] * 100)
we.write(6, 0, "Nota: el eje de plazos usa los días de la 1.ª fila (01/10/2024); los plazos de las otras fechas difieren en pocos días.")
graf = wb.add_chart({"type": "scatter", "subtype": "smooth_with_markers"})
for col, nombre in enumerate(["01/10/2024", "01/10/2025", "01/10/2026"]):
    graf.add_series({"name": nombre, "categories": ["ETTI c)", 1, 0, 4, 0], "values": ["ETTI c)", 1, 1 + col, 4, 1 + col]})
graf.set_title({"name": "c) ETTI del Euríbor"}); graf.set_x_axis({"name": "meses"}); graf.set_y_axis({"name": "%"})
graf.set_size({"width": 640, "height": 340}); we.insert_chart("F2", graf)

# --- Hoja «Contraste d)»: paso 5 (Tabla 4 y figuras 5 y 6) --------------------------------------
wc = wb.add_worksheet("Contraste d)")
wc.write_row(0, 0, ["Fecha t", "F3/12;6/12 simple (%)", "Euríbor 3m en t+3m (%)", "Diferencia (prima ex post)",
                    "F6/12;12/12 simple (%)", "Euríbor 6m en t+6m (%)", "Diferencia (prima ex post)"], cab)
wc.set_row(0, 32); wc.set_column(0, 6, 17)
for k, c in enumerate(contraste):
    fila = 1 + k; e = fila + 1; origen = 4 + k                    # origen = fila en «Datos y calculos»
    wc.write_formula(fila, 0, f"='Datos y calculos'!A{origen}", f_fecha, None)
    wc.write_formula(fila, 1, f"='Datos y calculos'!T{origen}", f4, c["f36s"])
    if c["real3"] is not None:                                     # Euríbor 3 m de la fila siguiente
        wc.write_formula(fila, 2, f"='Datos y calculos'!C{origen + 1}", f3, c["real3"])
        wc.write_formula(fila, 3, f"=B{e}-C{e}", f4, c["f36s"] - c["real3"])
    wc.write_formula(fila, 4, f"='Datos y calculos'!U{origen}", f4, c["f612s"])
    if c["real6"] is not None:                                     # Euríbor 6 m dos filas después
        wc.write_formula(fila, 5, f"='Datos y calculos'!D{origen + 2}", f3, c["real6"])
        wc.write_formula(fila, 6, f"=E{e}-F{e}", f4, c["f612s"] - c["real6"])
wc.write(11, 0, "Media")
wc.write_formula(11, 3, "=AVERAGE(D2:D9)", f4, res["prima3_media"]); wc.write_formula(11, 6, "=AVERAGE(G2:G8)", f4, res["prima6_media"])
wc.write(12, 0, "Nº diferencias > 0")
wc.write_formula(12, 3, '=COUNTIF(D2:D9,">0")', f0, res["prima3_pos"]); wc.write_formula(12, 6, '=COUNTIF(G2:G8,">0")', f0, res["prima6_pos"])
for col_f, col_r, nombre_f, nombre_r, ancla, titulo in (
        (1, 2, "Forward F3/12;6/12", "Euríbor 3m observado tres meses después", "I2", "d) Forward a tres meses frente al Euríbor observado"),
        (4, 5, "Forward F6/12;12/12", "Euríbor 6m observado seis meses después", "I20", "d) Forward a seis meses frente al Euríbor observado")):
    graf = wb.add_chart({"type": "line"})
    graf.add_series({"name": nombre_f, "categories": ["Contraste d)", 1, 0, 9, 0], "values": ["Contraste d)", 1, col_f, 9, col_f], "marker": {"type": "circle"}})
    graf.add_series({"name": nombre_r, "categories": ["Contraste d)", 1, 0, 9, 0], "values": ["Contraste d)", 1, col_r, 9, col_r],
                     "marker": {"type": "circle"}, "line": {"dash_type": "dash"}})
    graf.set_title({"name": titulo}); graf.set_y_axis({"name": "%"})
    graf.set_x_axis({"name": "fecha en que se calcula el forward", "num_format": "dd/mm/yy"})
    graf.set_size({"width": 640, "height": 330}); wc.insert_chart(ancla, graf)
wb.close()

# Resumen en pantalla
print(f"Forward a 3 meses por encima del observado: {res['prima3_pos']} de {res['prima3_n']} (media {res['prima3_media']:.3f} pp)")
print(f"Forward a 6 meses por encima del observado: {res['prima6_pos']} de {res['prima6_n']} (media {res['prima6_media']:.3f} pp)")
