import numpy as np, matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from scipy import stats, optimize

plt.rcParams.update({"font.size": 10, "axes.spines.top": False, "axes.spines.right": False, "axes.grid": True, "grid.alpha": .25})
AZ, OC, RJ, GR = "#1559a6", "#9a5b12", "#b3261e", "#57667a"
mu, sd = 5e6, 8e5

# ---- Debate 2: mismo VaR 99,5 %, distinta cola ------------------------------------------------
z995 = stats.norm.ppf(.995); v_target = mu + sd*z995
pc = .004; Lc = 30e6                                          # catástrofe: prob. 0,4 % (< 0,5 %) de pérdida 30 M€
# parte "normal" N(5, sg²) tal que VaR99,5 de la mezcla = v_target
def var_mezcla(sg):
    f = lambda x: (1 - pc)*stats.norm.sf(x, mu, sg) + pc*(x < Lc) - 0.005
    return optimize.brentq(f, mu, Lc - 1)
# P(S > x) = (1-pc)*sf_N(x) + pc  para x < Lc  =>  sf_N(x) = (0.005 - pc)/(1-pc)
sf_needed = (0.005 - pc)/(1 - pc); sg = (v_target - mu)/stats.norm.isf(sf_needed)
print("sigma parte normal", sg, " VaR mezcla", var_mezcla(sg))
# TVaR 99,5 % de la mezcla: (pc*Lc + (1-pc)*E[N; N>v]) / 0.005
xN = (v_target - mu)/sg; EN_tail = (1 - pc)*(mu*stats.norm.sf(xN) + sg*stats.norm.pdf(xN))
tvar_mez = (pc*Lc + EN_tail)/0.005; tvar_norm = mu + sd*stats.norm.pdf(z995)/.005
print("VaR igual:", v_target, "TVaR Normal", tvar_norm, "TVaR mezcla", tvar_mez, "ratio", tvar_mez/tvar_norm, "media mezcla", (1-pc)*mu + pc*Lc)
for pp in (.99, .995, .999):
    print("p", pp, "VaR normal", mu + sd*stats.norm.ppf(pp), "VaR mezcla", None)
# VaR de la mezcla a otros niveles
def var_mez_p(p):
    return optimize.brentq(lambda x: (1 - pc)*stats.norm.sf(x, mu, sg) + pc*(x < Lc) - (1 - p), mu, Lc*1.0 - 1) if (1 - p) > pc else Lc
for pp in (.99, .995, .996, .999):
    print("p", pp, "VaR N", round(mu + sd*stats.norm.ppf(pp)), "VaR mezcla", round(var_mez_p(pp)), "TVaR mezcla", None)
xs = np.linspace(4e6, 32e6, 800)
fig, ax = plt.subplots(figsize=(6.6, 3.6))
sfN = stats.norm.sf(xs, mu, sd); sfM = (1 - pc)*stats.norm.sf(xs, mu, sg) + pc*(xs < Lc)
ax.semilogy(xs/1e6, sfN, color=AZ, label="Normal(5; 0,8)"); ax.semilogy(xs/1e6, sfM, color=RJ, label="mezcla con catástrofe de 30 M€ (p=0,4 %)")
ax.axhline(.005, color=GR, ls=":"); ax.axvline(v_target/1e6, color="k", ls="--", lw=.8); ax.set_ylim(1e-7, 1); ax.set_xlabel("pérdida (millones €)"); ax.set_ylabel("P(S > x)"); ax.legend(fontsize=8)
ax.text(v_target/1e6 + .3, 1.5e-6, "mismo VaR 99,5 %", fontsize=8)
plt.tight_layout(); plt.savefig("t4_f_debate2.png", dpi=170); plt.close()

# ---- Debate 3: fragmentación en filiales -------------------------------------------------------------
print("fragmentación: n bonos independientes de q=2 %, pérdida 100, p=97,5 %")
for n in (2, 5, 10, 25, 50, 100):
    pm = stats.binom.pmf(np.arange(n+1), n, .02); cdf = np.cumsum(pm); k = int(np.searchsorted(cdf, .975 - 1e-12)); v = 100*k
    tv = v + np.sum(np.maximum(100*np.arange(n+1) - v, 0)*pm)/.025
    print(f"  n={n:3d} VaR consolidado {v:5.0f} (suma individual 0)  TVaR consolidado {tv:8.1f}  suma TVaR indiv {80*n:6.0f}  beneficio {80*n - tv:7.1f}")
# optimización de cola: vender una opción que paga 100 con prob 0,3 % (por debajo de 1-p)
print("-- optimización de cola --")
# cartera con VaR 97,5 %= 0 y pérdida 100 con 2 %: añade riesgo con prob 0,4 % y pérdida 10.000 (cobrando prima)
for L in (0, 1000, 10000):
    pm = np.array([1 - .02 - .004, .02, .004]); xs_ = np.array([0, 100, 100 + L]); v = xs_[np.searchsorted(np.cumsum(pm), .975 - 1e-12)]
    print(" L cola extra", L, "VaR", v, "TVaR", v + np.sum(np.maximum(xs_ - v, 0)*pm)/.025)

# ---- Debate 4: homogeneidad, liquidez y convexidad --------------------------------------------------
rho = 2.060663e6; kap = .05*rho
for lam in (1, 2, 5, 10):
    print(f"λ={lam}: λρ={lam*rho:,.0f}  ρ_liq={lam*rho + kap*lam**2:,.0f} ({100*(1 + .05*lam):.0f}% de λρ)")
a = 1e-6
for lam in (1, 2, 5, 10):
    rent = a*(lam*sd)**2/2; print(f"entrópica (a=1e-6) λ={lam}: ρ={lam*mu + rent:,.0f} frente a λρ={lam*(mu + a*sd**2/2):,.0f}")
print("ok")
