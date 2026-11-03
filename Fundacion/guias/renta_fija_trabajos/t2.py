# -*- coding: utf-8 -*-
"""Trabajo 2 · Estimación de la ETTI cupón cero (Svensson y splines cúbicas) con las cotizaciones del 11-sep-2026."""
import json, sys, datetime as dt
from pathlib import Path
import numpy as np
from scipy.optimize import least_squares
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
sys.path.insert(0, str(Path(__file__).parent))
from t2core import *

OUT = Path(__file__).parent
B = preparar()
P = np.array([b["P_b"] for b in B]); Dur = np.array([b["D"] for b in B]); yM = np.array([b["y"] for b in B]); Tm = np.array([b["T"] for b in B])

# ---------------------------------- Svensson ----------------------------------------------
P0 = (0.05, -0.025, 0.01, -0.04, 1.2, 0.5)                    # valores iniciales del enunciado
LB = [0, -0.1, -0.1, -0.1, 0.05, 0.05]; UB = [0.2, 0.1, 0.1, 0.1, 10, 10]
def fit_sv(w, p0, lb=LB, ub=UB):
    f = lambda p: w * (precio_modelo(B, p) - P)
    return least_squares(f, p0, bounds=(lb, ub), x_scale=[.05, .05, .05, .05, 1, 1], xtol=1e-14, ftol=1e-14, gtol=1e-14, max_nfev=5000)
w_dur = 1 / Dur
starts = [P0, (0.04, 0, 0, 0, 1, 0.3), (0.045, -0.02, 0.02, -0.02, 2, 0.2), (0.05, -0.03, 0.03, 0.03, 0.5, 3), (0.06, -0.04, -0.02, 0.02, 0.8, 0.1), (0.05, -0.02, 0.0, 0.0, 2.5, 0.5)]
runs = [fit_sv(w_dur, s) for s in starts]
best = min(runs, key=lambda r: r.cost)
psv = best.x
Pm_sv = precio_modelo(B, psv); y_sv = tir_modelo(B, Pm_sv)
# alternativas de robustez
alt = {}
alt["MCO sobre precios (sin ponderar)"] = fit_sv(np.ones_like(Dur), psv).x
w_y = 1 / (Dur / (1 + yM) * P)                                # error de precio / (D_mod·P) ≈ error en TIR
alt["Ponderando por 1/(D_mod·P) (≈ error en TIR)"] = fit_sv(w_y, psv).x
alt["Sin cotas en β (solo κ>0)"] = fit_sv(w_dur, P0, [-1, -1, -1, -1, 0.01, 0.01], [1, 1, 1, 1, 50, 50]).x

# ---------------------------------- Splines -----------------------------------------------
NUDOS = (1.5, 4.0, 8.0, 15.0)
beta = ajustar_spline(B, NUDOS)
A = matriz_spline(B, NUDOS); c0 = np.array([b["cf"].sum() for b in B])
Pm_sp = c0 + A @ beta; y_sp = tir_modelo(B, Pm_sp)
cfg = {}
for nud in [(2, 5, 10), (1.5, 4, 8, 15), (2, 5, 10, 20), (1, 3, 6, 10, 20), (2, 5, 10, 20, 30)]:
    bt = ajustar_spline(B, nud); Pm = c0 + matriz_spline(B, nud) @ bt
    cfg[str(nud)] = dict(nudos=nud, k=len(nud) + 3, sse=float(np.sum(((Pm - P) / Dur) ** 2)), rmse_tir=float(1e4 * np.sqrt(np.mean((tir_modelo(B, Pm) - yM) ** 2))))

def metr(Pm, y, k):
    n = len(B); e = (Pm - P) / Dur
    sse = float(np.sum(e ** 2))
    return dict(k=k, rmse_precio=float(np.sqrt(np.mean((Pm - P) ** 2))), mae_precio=float(np.mean(abs(Pm - P))),
                rmse_tir_bp=float(1e4 * np.sqrt(np.mean((y - yM) ** 2))), mae_tir_bp=float(1e4 * np.mean(abs(y - yM))),
                max_tir_bp=float(1e4 * np.max(abs(y - yM))), sse_pond=sse, bic=float(n * np.log(sse / n) + k * np.log(n)))
m_sv = metr(Pm_sv, y_sv, 6); m_sp = metr(Pm_sp, y_sp, len(NUDOS) + 3)

# ---------------------------------- malla de resultados -----------------------------------
grid = np.array([0.1, 0.25, 0.5, 1, 2, 3, 4, 5, 7, 10, 15, 20, 25, 30, 40, 45])
tg = np.linspace(0.05, 45.1, 400)
r_sv = svensson(grid, psv); f_sv = svensson_fwd(grid, psv)
r_sp = -np.log(D_spline(grid, beta, NUDOS)) / grid
# forward instantáneo de la spline: f = -D'/D
def dD(t): t = np.asarray(t, float); return beta[0] + 2 * beta[1] * t + 3 * beta[2] * t ** 2 + sum(3 * beta[3 + j] * np.maximum(t - x, 0) ** 2 for j, x in enumerate(NUDOS))
f_sp = -dD(grid) / D_spline(grid, beta, NUDOS)
Dt = D_spline(tg, beta, NUDOS)
res = dict(
    liq=LIQ.isoformat(), n=len(B), sv=dict(params=dict(zip(["beta0", "beta1", "beta2", "beta3", "kappa1", "kappa2"], psv.tolist())), cost=float(best.cost), metr=m_sv,
                                         arranques=[dict(inicio=list(map(float, s)), final=list(map(float, r.x)), coste=float(r.cost)) for s, r in zip(starts, runs)]),
    sp=dict(nudos=list(NUDOS), beta=beta.tolist(), metr=m_sp, monotona=bool(np.all(np.diff(Dt) <= 1e-12)), positiva=bool(Dt.min() > 0), config=cfg),
    alt={k: (v.tolist() if v is not None else None) for k, v in alt.items()},
    grid=grid.tolist(), r_sv=(r_sv * 100).tolist(), f_sv=(f_sv * 100).tolist(), r_sp=(r_sp * 100).tolist(), f_sp=(f_sp * 100).tolist(),
    bonos=[dict(nombre=b["nombre"], isin=b["isin"], cupon=b["cupon"], venc=b["venc"].isoformat(), P_m=b["P_m"], cc=b["cc"], P_b=b["P_b"], y=b["y"] * 100, y_pub=b["y_pub"] * 100,
                D=b["D"], T=b["T"], P_sv=float(Pm_sv[i]), y_sv=float(y_sv[i] * 100), P_sp=float(Pm_sp[i]), y_sp=float(y_sp[i] * 100)) for i, b in enumerate(B)])
(OUT / "t2_resultados.json").write_text(json.dumps(res, indent=1, ensure_ascii=False), encoding="utf-8")

# ---------------------------------- gráficos ------------------------------------------------
plt.rcParams.update({"font.size": 9, "axes.grid": True, "grid.alpha": .3, "axes.spines.top": False, "axes.spines.right": False})
C = {"sv": "#1559a6", "sp": "#b07a1d", "tir": "#b3261e"}
eff = lambda r: np.exp(r) - 1
fig, ax = plt.subplots(figsize=(7.2, 4))
ax.plot(tg, svensson(tg, psv) * 100, ":", color=C["sv"], lw=1.2, label=r"Svensson, $r_T$ (cap. continua)")
ax.plot(tg, eff(svensson(tg, psv)) * 100, "-", color=C["sv"], lw=2, label="Svensson, tipo anual equivalente")
ax.scatter(Tm, yM * 100, s=16, color=C["tir"], zorder=3, label="TIR de los bonos y obligaciones (57)")
ax.set_xlabel("Plazo (años)"); ax.set_ylabel("%"); ax.legend(frameon=False, loc="lower right")
fig.tight_layout(); fig.savefig(OUT / "fig_svensson.pdf"); plt.close(fig)

fig, ax = plt.subplots(figsize=(7.2, 4))
ax.plot(tg, eff(svensson(tg, psv)) * 100, color=C["sv"], lw=2, label="Svensson")
ax.plot(tg, eff(-np.log(np.where(Dt > 0, Dt, np.nan)) / tg) * 100, "--", color=C["sp"], lw=2, label="Splines cúbicas")
ax.scatter(Tm, yM * 100, s=16, color=C["tir"], zorder=3, label="TIR")
for x in NUDOS: ax.axvline(x, color="grey", lw=.5, ls=":")
ax.set_xlabel("Plazo (años)"); ax.set_ylabel("tipo cupón cero anual equivalente (%)"); ax.legend(frameon=False, loc="lower right")
fig.tight_layout(); fig.savefig(OUT / "fig_comparacion.pdf"); plt.close(fig)

fig, ax = plt.subplots(figsize=(7.2, 3.6))
ax.plot(tg, svensson_fwd(tg, psv) * 100, color=C["sv"], lw=2, label="Svensson")
ax.plot(tg, -dD(tg) / Dt * 100, "--", color=C["sp"], lw=2, label="Splines cúbicas")
ax.set_xlabel("Plazo (años)"); ax.set_ylabel("forward instantáneo (%)"); ax.legend(frameon=False)
fig.tight_layout(); fig.savefig(OUT / "fig_forward.pdf"); plt.close(fig)

fig, axs = plt.subplots(1, 2, figsize=(7.4, 3.2), sharey=True)
for ax, y, nm, c in zip(axs, (y_sv, y_sp), ("Svensson", "Splines"), (C["sv"], C["sp"])):
    ax.axhline(0, color="k", lw=.6); ax.scatter(Tm, (y - yM) * 1e4, s=14, color=c); ax.set_title(nm); ax.set_xlabel("Plazo del bono (años)")
axs[0].set_ylabel("TIR del modelo − TIR de mercado (pb)")
fig.tight_layout(); fig.savefig(OUT / "fig_residuos.pdf"); plt.close(fig)

fig, ax = plt.subplots(figsize=(7.2, 3.4))
ax.plot(tg, np.exp(-svensson(tg, psv) * tg), color=C["sv"], lw=2, label="Svensson"); ax.plot(tg, Dt, "--", color=C["sp"], lw=2, label="Splines")
ax.set_xlabel("T (años)"); ax.set_ylabel("D(0,T)"); ax.legend(frameon=False)
fig.tight_layout(); fig.savefig(OUT / "fig_descuento.pdf"); plt.close(fig)

# ---------------------------------- salida en consola -----------------------------------------
print("Svensson", np.round(psv, 5), "coste", best.cost)
for s, r in zip(starts, runs): print("  inicio", np.round(s, 3), "->", np.round(r.x, 4), round(r.cost, 6))
print("Métricas Svensson", {k: round(v, 3) for k, v in m_sv.items()}); print("Métricas Spline", {k: round(v, 3) for k, v in m_sp.items()})
print("alt", {k: (np.round(v, 4).tolist() if v is not None else None) for k, v in alt.items()})
print("grid", grid.tolist()); print("r_sv", np.round(r_sv * 100, 3).tolist()); print("r_sp", np.round(r_sp * 100, 3).tolist())
print("f_sv", np.round(f_sv * 100, 3).tolist()); print("f_sp", np.round(f_sp * 100, 3).tolist())
print("spline mono/pos", res["sp"]["monotona"], res["sp"]["positiva"])
