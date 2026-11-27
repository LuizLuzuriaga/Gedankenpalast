# -*- coding: utf-8 -*-
"""
Trabajo 2 - Estimacion de la ETTI cupon cero (Svensson y splines cubicas)
con las cotizaciones del Tesoro del 11/09/2026 (fecha valor 14/09/2026).

Pasos, con su equivalente en el Excel 'Trabajo2_ETTI_RentaFija.xlsx':
  1. Datos, flujos, precio bruto, TIR y duracion de los 57 bonos  -> hojas Bonos y Flujos (t2core.preparar)
  2. Ajuste de Svensson minimizando errores de precio / duracion  -> Parametros!B14 + Solver
  3. Efecto de la funcion objetivo (tres ponderaciones)            -> hoja Funcion_objetivo
  4. Ajuste por splines cubicas sobre D(t)                         -> hoja Splines (ESTIMACION.LINEAL)
  5. Curvas de tipos y forwards en una malla de plazos             -> hoja Curva
  6. Control de nuestra TIR frente a la publicada                  -> Bonos U a V
  7. Valoracion de la Obligacion 4 % 10/2064, que no cotiza         -> hoja Obligacion_2064
  8. JSON con los resultados (de ahi salen las tablas del PDF) y figuras
"""
import sys
import json
import datetime as dt
from pathlib import Path

import numpy as np
from scipy.optimize import least_squares
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

sys.path.insert(0, str(Path(__file__).parent))
from t2core import *

OUT = Path(__file__).parent

# =============================================================================
# 1. DATOS DE LOS BONOS  (Excel: hoja Bonos)
# =============================================================================
B = preparar()
P = np.array([b["P_b"] for b in B])          # precio bruto (Bonos N)
Dur = np.array([b["D"] for b in B])          # duracion (Bonos S)
yM = np.array([b["y"] for b in B])           # TIR de mercado (Bonos Q)
Tm = np.array([b["T"] for b in B])           # plazo hasta el vencimiento (Bonos P)

# =============================================================================
# 2. SVENSSON  (Excel: Parametros B7:B12 los parametros; B14 = SUMA.CUADRADOS(Bonos!Z6:Z62) que minimiza Solver)
#    Error de cada bono = (precio del modelo - precio de mercado) / duracion   (Bonos X y Z)
# =============================================================================
P0 = (0.05, -0.025, 0.01, -0.04, 1.2, 0.5)                    # valores iniciales del enunciado (Parametros C7:C12)
LB = [0, -0.1, -0.1, -0.1, 0.05, 0.05]                        # cotas: beta0 >= 0, kappas > 0
UB = [0.2, 0.1, 0.1, 0.1, 10, 10]


def ajustar_sv(pesos, p0):
    """Minimos cuadrados no lineales de los errores de precio multiplicados por 'pesos'."""
    error = lambda p: pesos * (precio_modelo(B, p) - P)
    return least_squares(error, p0, bounds=(LB, UB), x_scale=[.05, .05, .05, .05, 1, 1],
                         xtol=1e-14, ftol=1e-14, gtol=1e-14, max_nfev=5000)


w_dur = 1 / Dur                                               # peso 1/D (Bonos T)
# Varios puntos de partida para no quedarnos en un minimo local (en Excel: lanzar Solver desde otros valores)
arranques = [P0,
             (0.04, 0, 0, 0, 1, 0.3),
             (0.045, -0.02, 0.02, -0.02, 2, 0.2),
             (0.05, -0.03, 0.03, 0.03, 0.5, 3),
             (0.06, -0.04, -0.02, 0.02, 0.8, 0.1),
             (0.05, -0.02, 0.0, 0.0, 2.5, 0.5)]
ajustes = [ajustar_sv(w_dur, s) for s in arranques]
mejor = min(ajustes, key=lambda r: r.cost)
psv = mejor.x                                                 # parametros estimados (Parametros B7:B12)
Pm_sv = precio_modelo(B, psv)                                 # Bonos W: precio Svensson
y_sv = tir_modelo(B, Pm_sv)                                   # Bonos AA: TIR Svensson

# =============================================================================
# 3. OTRAS FUNCIONES OBJETIVO  (Excel: hoja Funcion_objetivo)
# =============================================================================
p_mco = ajustar_sv(np.ones_like(Dur), psv).x                  # errores de precio sin ponderar
w_tir = 1 / (Dur / (1 + yM) * P)                              # error / (D_mod * P) = error aproximado en TIR
p_tir = ajustar_sv(w_tir, psv).x


def resumen_objetivo(p):
    """Calidad del ajuste en TIR (pb) total, en el corto (<3 anios) y en el largo (>=15), y tipos a 1, 5, 10 y 30 anios."""
    y = tir_modelo(B, precio_modelo(B, p))
    rmse = lambda mascara: float(1e4 * np.sqrt(np.mean(((y - yM)[mascara]) ** 2)))
    return dict(params=list(map(float, p)),
                rmse_tir_bp=rmse(np.ones_like(Tm, bool)),
                rmse_tir_corto_bp=rmse(Tm < 3),
                rmse_tir_largo_bp=rmse(Tm >= 15),
                r=[float(svensson(t, p) * 100) for t in (1, 5, 10, 30)])


objetivo = {"Base: error de precio dividido por la duración (1/D)": resumen_objetivo(psv),
            "MCO sobre precios (sin ponderar)": resumen_objetivo(p_mco),
            "Error de precio dividido por D_mod·P (≈ error en TIR)": resumen_objetivo(p_tir)}

# =============================================================================
# 4. SPLINES CUBICAS  (Excel: hoja Splines; nudos en Parametros B18:E18 y coeficientes en B20:B26)
# =============================================================================
NUDOS = (1.5, 4.0, 8.0, 15.0)
beta = ajustar_spline(B, NUDOS)
A = matriz_spline(B, NUDOS)
c0 = np.array([b["cf"].sum() for b in B])
Pm_sp = c0 + A @ beta                                         # Bonos AC: precio spline
y_sp = tir_modelo(B, Pm_sp)                                   # Bonos AF: TIR spline

# Sensibilidad a la eleccion de nudos (tabla del PDF; no esta en el Excel)
configuraciones = {}
for nud in [(2, 5, 10), (1.5, 4, 8, 15), (2, 5, 10, 20), (1, 3, 6, 10, 20), (2, 5, 10, 20, 30)]:
    bt = ajustar_spline(B, nud)
    Pm = c0 + matriz_spline(B, nud) @ bt
    configuraciones[str(nud)] = dict(nudos=nud, k=len(nud) + 3,
                                     sse=float(np.sum(((Pm - P) / Dur) ** 2)),
                                     rmse_tir=float(1e4 * np.sqrt(np.mean((tir_modelo(B, Pm) - yM) ** 2))))


def metricas(Pm, y, k):
    """Errores de precio y de TIR (Bonos X/AB y AD/AG) y BIC para comparar modelos con distinto numero de parametros."""
    n = len(B)
    sse = float(np.sum(((Pm - P) / Dur) ** 2))
    return dict(k=k,
                rmse_precio=float(np.sqrt(np.mean((Pm - P) ** 2))),
                mae_precio=float(np.mean(abs(Pm - P))),
                rmse_tir_bp=float(1e4 * np.sqrt(np.mean((y - yM) ** 2))),
                mae_tir_bp=float(1e4 * np.mean(abs(y - yM))),
                max_tir_bp=float(1e4 * np.max(abs(y - yM))),
                sse_pond=sse,
                bic=float(n * np.log(sse / n) + k * np.log(n)))


m_sv = metricas(Pm_sv, y_sv, 6)
m_sp = metricas(Pm_sp, y_sp, len(NUDOS) + 3)

# =============================================================================
# 5. CURVAS EN UNA MALLA DE PLAZOS  (Excel: hoja Curva)
# =============================================================================
grid = np.array([0.1, 0.25, 0.5, 1, 2, 3, 4, 5, 7, 10, 15, 20, 25, 30, 40, 45])
tg = np.linspace(0.05, 45.1, 400)                             # malla fina para los graficos
r_sv = svensson(grid, psv)                                    # cupon cero continuo Svensson
f_sv = svensson_fwd(grid, psv)                                # forward instantaneo Svensson
r_sp = -np.log(D_spline(grid, beta, NUDOS)) / grid            # cupon cero continuo de la spline: -ln D(t) / t


def dD(t):
    """Derivada de D(t) de la spline; el forward instantaneo es f = -D'(t) / D(t)."""
    t = np.asarray(t, float)
    return (beta[0] + 2 * beta[1] * t + 3 * beta[2] * t ** 2
            + sum(3 * beta[3 + j] * np.maximum(t - x, 0) ** 2 for j, x in enumerate(NUDOS)))


f_sp = -dD(grid) / D_spline(grid, beta, NUDOS)
Dt = D_spline(tg, beta, NUDOS)                                # para comprobar que D(t) es positiva y decreciente

# =============================================================================
# 6. CONTROL: NUESTRA TIR FRENTE A LA PUBLICADA  (Excel: Bonos Q frente a U-V)
# =============================================================================
dif_pub = np.array([(b["y"] - b["y_pub"]) * 1e4 for b in B])
peor_pub = B[int(np.argmax(abs(dif_pub)))]
control = dict(mae_bp=float(np.mean(abs(dif_pub))), max_bp=float(np.max(abs(dif_pub))), max_nombre=peor_pub["nombre"],
               marzo=[dict(nombre=b["nombre"], dif_bp=float((b["y"] - b["y_pub"]) * 1e4))
                      for b in B if b["venc"].month == 3])

# =============================================================================
# 7. OBLIGACION 4 % 10/2064 (no cotiza, se valora con las curvas)  (Excel: hoja Obligacion_2064)
# =============================================================================
o64 = dict(nombre="OBL TESORO- 4,000 10/2064", cupon=4.0, venc=dt.date(2064, 10, DIA[10]))
o64.update(flujos(o64))                                       # flujos desde la fila 14; cupon corrido en B9


def valorar_o64(descuento):
    """Precio bruto y limpio, TIR, cupon cero al vencimiento y sesgo del cupon (resultados en E4:F9)."""
    P_bruto = float(np.sum(o64["cf"] * descuento(o64["t"])))
    y = tir(o64["cf"], o64["t"], P_bruto)
    T = float(o64["t"][-1])
    R_T = float(descuento(np.array([T]))[0]) ** (-1 / T) - 1  # cupon cero anual equivalente a T
    return dict(P_bruto=P_bruto, P_limpio=P_bruto - o64["cc"], tir=y * 100, R_T=R_T * 100,
                sesgo_bp=(y - R_T) * 1e4, D=duracion(o64["cf"], o64["t"], y))


val64 = dict(venc=o64["venc"].isoformat(), T=float(o64["t"][-1]), cc=float(o64["cc"]), n_flujos=len(o64["cf"]),
             svensson=valorar_o64(lambda t: np.exp(-svensson(t, psv) * t)),
             splines=valorar_o64(lambda t: D_spline(t, beta, NUDOS)),
             vecinos=[dict(nombre=b["nombre"], T=b["T"], P_m=b["P_m"], y=b["y"] * 100)
                      for b in B if b["nombre"].split()[-1] in ("10/2054", "10/2056", "10/2071")])

# =============================================================================
# 8. RESULTADOS EN JSON (los lee build_t2_tex.py para el PDF y build_t2_xlsx.py para el Excel)
# =============================================================================
res = dict(
    objetivo=objetivo, control=control, val64=val64, liq=LIQ.isoformat(), n=len(B),
    sv=dict(params=dict(zip(["beta0", "beta1", "beta2", "beta3", "kappa1", "kappa2"], psv.tolist())),
            cost=float(mejor.cost), metr=m_sv,
            arranques=[dict(inicio=list(map(float, s)), final=list(map(float, r.x)), coste=float(r.cost))
                       for s, r in zip(arranques, ajustes)]),
    sp=dict(nudos=list(NUDOS), beta=beta.tolist(), metr=m_sp,
            monotona=bool(np.all(np.diff(Dt) <= 1e-12)), positiva=bool(Dt.min() > 0), config=configuraciones),
    grid=grid.tolist(), r_sv=(r_sv * 100).tolist(), f_sv=(f_sv * 100).tolist(),
    r_sp=(r_sp * 100).tolist(), f_sp=(f_sp * 100).tolist(),
    bonos=[dict(nombre=b["nombre"], isin=b["isin"], cupon=b["cupon"], venc=b["venc"].isoformat(),
                P_m=b["P_m"], cc=b["cc"], P_b=b["P_b"], y=b["y"] * 100, y_pub=b["y_pub"] * 100,
                D=b["D"], T=b["T"], P_sv=float(Pm_sv[i]), y_sv=float(y_sv[i] * 100),
                P_sp=float(Pm_sp[i]), y_sp=float(y_sp[i] * 100))
           for i, b in enumerate(B)])
(OUT / "t2_resultados.json").write_text(json.dumps(res, indent=1, ensure_ascii=False), encoding="utf-8")

# =============================================================================
# GRAFICOS DEL PDF  (en Excel, el grafico de la hoja Curva)
# =============================================================================
plt.rcParams.update({"font.size": 9, "axes.grid": True, "grid.alpha": .3,
                     "axes.spines.top": False, "axes.spines.right": False})
COLOR = {"sv": "#1559a6", "sp": "#b07a1d", "tir": "#b3261e"}
anual = lambda r: np.exp(r) - 1                               # de continuo a anual equivalente


def guardar(fig, nombre):
    fig.tight_layout()
    fig.savefig(OUT / nombre)
    plt.close(fig)


# Figura 1: curva de Svensson y TIR de los bonos
fig, ax = plt.subplots(figsize=(7.2, 4))
ax.plot(tg, svensson(tg, psv) * 100, ":", color=COLOR["sv"], lw=1.2, label=r"Svensson, $r_T$ (cap. continua)")
ax.plot(tg, anual(svensson(tg, psv)) * 100, "-", color=COLOR["sv"], lw=2, label="Svensson, tipo anual equivalente")
ax.scatter(Tm, yM * 100, s=16, color=COLOR["tir"], zorder=3, label="TIR de los bonos y obligaciones (57)")
ax.set_xlabel("Plazo (años)"); ax.set_ylabel("%"); ax.legend(frameon=False, loc="lower right")
guardar(fig, "fig_svensson.pdf")

# Figura 2: Svensson frente a splines
fig, ax = plt.subplots(figsize=(7.2, 4))
ax.plot(tg, anual(svensson(tg, psv)) * 100, color=COLOR["sv"], lw=2, label="Svensson")
ax.plot(tg, anual(-np.log(np.where(Dt > 0, Dt, np.nan)) / tg) * 100, "--", color=COLOR["sp"], lw=2, label="Splines cúbicas")
ax.scatter(Tm, yM * 100, s=16, color=COLOR["tir"], zorder=3, label="TIR")
for x in NUDOS:
    ax.axvline(x, color="grey", lw=.5, ls=":")
ax.set_xlabel("Plazo (años)"); ax.set_ylabel("tipo cupón cero anual equivalente (%)"); ax.legend(frameon=False, loc="lower right")
guardar(fig, "fig_comparacion.pdf")

# Figura 3: forwards instantaneos
fig, ax = plt.subplots(figsize=(7.2, 3.6))
ax.plot(tg, svensson_fwd(tg, psv) * 100, color=COLOR["sv"], lw=2, label="Svensson")
ax.plot(tg, -dD(tg) / Dt * 100, "--", color=COLOR["sp"], lw=2, label="Splines cúbicas")
ax.set_xlabel("Plazo (años)"); ax.set_ylabel("forward instantáneo (%)"); ax.legend(frameon=False)
guardar(fig, "fig_forward.pdf")

# Figura 4: residuos en TIR (Bonos AB y AG)
fig, axs = plt.subplots(1, 2, figsize=(7.4, 3.2), sharey=True)
for ax, y, nombre, color in zip(axs, (y_sv, y_sp), ("Svensson", "Splines"), (COLOR["sv"], COLOR["sp"])):
    ax.axhline(0, color="k", lw=.6)
    ax.scatter(Tm, (y - yM) * 1e4, s=14, color=color)
    ax.set_title(nombre); ax.set_xlabel("Plazo del bono (años)")
axs[0].set_ylabel("TIR del modelo − TIR de mercado (pb)")
guardar(fig, "fig_residuos.pdf")

# Resumen en pantalla
print("Svensson:", np.round(psv, 5), "coste", round(mejor.cost, 8))
print("RMSE en TIR (pb): Svensson", round(m_sv["rmse_tir_bp"], 2), "| splines", round(m_sp["rmse_tir_bp"], 2))
print("Obligacion 2064 (Svensson): precio limpio", round(val64["svensson"]["P_limpio"], 3),
      "TIR", round(val64["svensson"]["tir"], 3), "%")
