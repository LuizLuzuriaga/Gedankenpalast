import numpy as np, matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from scipy.optimize import brentq
from core import *

plt.rcParams.update({"font.size": 10, "axes.spines.top": False, "axes.spines.right": False, "axes.grid": True, "grid.alpha": .25})
AZ, OC, GR = "#1559a6", "#9a5b12", "#57667a"

# Repaso 2: prima CARA (constante) frente a prima CRRA (decreciente en w)
ws = np.linspace(5500, 120000, 400)
P_cara = np.log(.8 + .2 * np.exp(2e-4 * 5000)) / 2e-4
P_crra = ws - (.8 / ws + .2 / (ws - 5000)) ** -1
fig, ax = plt.subplots(figsize=(6.4, 3.5))
ax.plot(ws, P_crra, color=AZ, label=r"CRRA $\gamma=2$: $P(w)$"); ax.axhline(P_cara, color=OC, label=r"CARA $\alpha=2\cdot10^{-4}$: $P$ constante")
ax.axhline(1000, color=GR, ls="--", lw=.8, label=r"$E[X]=1000$")
ax.set_xlabel("Riqueza inicial $w$"); ax.set_ylabel("Prima máxima $P$"); ax.set_xscale("log"); ax.legend(fontsize=8)
plt.tight_layout(); plt.savefig("t1_f_repaso2.png", dpi=170); plt.close()

# Repaso 3: P(alpha) = K(alpha)/alpha creciente; zona de acuerdo
al = np.linspace(1e-6, 1.95e-3, 500); Pa = [prima_gamma(a) for a in al]
fig, ax = plt.subplots(figsize=(6.4, 3.5))
ax.plot(al, Pa, color=AZ); ax.axhline(1000, color=GR, ls="--", lw=.8); ax.axvline(1 / 500, color="#b3261e", ls=":")
aC, aR = 6e-4, 3e-4
ax.fill_between([aR, aC], [prima_gamma(aR)] * 2, [prima_gamma(aC)] * 2, color=OC, alpha=.25)
ax.plot([aR, aC], [prima_gamma(aR), prima_gamma(aC)], "o", color=OC)
ax.annotate(r"$P^-$", (aR, prima_gamma(aR)), textcoords="offset points", xytext=(-22, 6)); ax.annotate(r"$P^+$", (aC, prima_gamma(aC)), textcoords="offset points", xytext=(-22, 6))
ax.text(1.55e-3, 1020, r"$E[X]$", color=GR); ax.text(1.62e-3, 1500, r"$\alpha=1/\theta$", color="#b3261e", rotation=90)
ax.set_xlabel(r"$\alpha$"); ax.set_ylabel(r"$P(\alpha)=\ln M_X(\alpha)/\alpha$"); ax.set_ylim(900, 2200)
plt.tight_layout(); plt.savefig("t1_f_repaso3.png", dpi=170); plt.close()

# Debate 3: CE frente a gamma, perfiles y umbral
g_star, a_star = umbrales(); gs = np.linspace(.05, 6, 400)
fig, ax = plt.subplots(figsize=(6.4, 3.5))
ax.plot(gs, [ce_posicion("CRRA", g) for g in gs], color=AZ); ax.axhline(W0, color="k", ls="--", lw=.8); ax.axvline(g_star, color="#b3261e", ls=":")
for g, lab in ((0.5, "0,5"), (1, "1"), (2, "2"), (3, "3"), (5, "5")):
    ax.plot(g, ce_posicion("CRRA", g), "o", color=OC); ax.annotate(lab, (g, ce_posicion("CRRA", g)), textcoords="offset points", xytext=(5, 6), fontsize=8)
ax.text(g_star + .08, 10210, rf"$\gamma^*={g_star:.3f}$", color="#b3261e"); ax.text(4.2, W0 + 30, "$w=10.000$ (no operar)", fontsize=8)
ax.set_xlabel(r"$\gamma$"); ax.set_ylabel("Equivalente cierto"); plt.tight_layout(); plt.savefig("t1_f_debate3.png", dpi=170); plt.close()

# Debate 2: aversión implícita a partir de la prima realmente pagada
for Ppag in (1083.46, 1150.0, 1188.9):
    print("P pagada", Ppag, "-> alpha implicita", brentq(lambda a: prima_gamma(a) - Ppag, 1e-7, 1.99e-3))
print("figs ok")
