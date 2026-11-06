import numpy as np, matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from scipy import stats

plt.rcParams.update({"font.size": 10, "axes.spines.top": False, "axes.spines.right": False, "axes.grid": True, "grid.alpha": .25})
AZ, OC, RJ, GR = "#1559a6", "#9a5b12", "#b3261e", "#57667a"
Z = stats.norm.ppf(.995)
r, beta, al, th = 50, 3, 4, 3000
EN, VN, k3N = r*beta, r*beta*(1+beta), r*beta*(1+beta)*(1+2*beta)

def discretizar(cdf, h, K):
    j = np.arange(K); f = np.empty(K); f[0] = cdf(h/2); f[1:] = cdf((j[1:]+.5)*h) - cdf((j[1:]-.5)*h); return f/f.sum()
def agg_fft(f, M, fgp):
    fp = np.zeros(M); fp[:len(f)] = f; return np.clip(np.fft.ifft(fgp(np.fft.fft(fp))).real, 0, None)
def cuant(g, h, p): return h*int(np.searchsorted(np.cumsum(g), p))
def tvar(g, h, p):
    s = h*np.arange(len(g)); F = np.cumsum(g); v = np.searchsorted(F, p); return (np.sum(s[v+1:]*g[v+1:]) + s[v]*(F[v]-p))/(1-p)

# ---- Poisson frente a Binomial Negativa con la misma media ----------------------
EX, VX = th/(al-1), al*th**2/((al-1)**2*(al-2)); EX2 = VX + EX**2
V_nb = EN*VX + VN*EX**2; V_po = EN*EX2
print("Hogar: Var NB", V_nb, "Var Poisson", V_po, "VaR normal NB", EN*EX+Z*V_nb**.5, "Poisson", EN*EX+Z*V_po**.5, "dif %", 100*((EN*EX+Z*V_po**.5)/(EN*EX+Z*V_nb**.5)-1))

# ---- Reaseguro XL por riesgo en Hogar (Pareto 4, 3000) --------------------------------
h, M = 100, 2**13
f_full = discretizar(lambda z: stats.lomax.cdf(z, al, scale=th), h, M)
g_full = agg_fft(f_full, M, lambda z: (1-beta*(z-1))**(-r))
Eg = EN*EX; var_gross = cuant(g_full, h, .995); tv_gross = tvar(g_full, h, .995)
print("bruto: VaR", var_gross, "TVaR", tv_gross, "E", Eg)
filas = []
for d in (1500, 3000, 5000, 10000, 20000, 1e9):
    cdf = (lambda z, d=d: np.where(z >= d, 1.0, stats.lomax.cdf(np.minimum(z, d), al, scale=th)))
    f = discretizar(cdf, h, M) if d < 1e8 else f_full
    g = agg_fft(f, M, lambda z: (1-beta*(z-1))**(-r)); s = h*np.arange(M)
    E = np.sum(s*g); V = np.sum(s**2*g)-E**2; m3 = np.sum((s-E)**3*g); sk = m3/V**1.5
    rec = EN*(th/(al-1))*(th/(th+d))**(al-1) if d < 1e8 else 0.0     # E[ceded] = λ E[(X−d)+]
    filas.append((d, E, V**.5, sk, cuant(g, h, .995), tvar(g, h, .995), rec))
    print("d", d, "E %.0f SD %.0f asim %.3f VaR %.0f TVaR %.0f recobros esperados %.0f" % filas[-1][1:] if False else (d, round(E), round(V**.5), round(sk, 3), cuant(g, h, .995), round(tvar(g, h, .995)), round(rec)))
print("tabla XL con carga 30 %:")
for d, E, sd, sk, v, tv, rec in filas:
    print(f"  d={d:>10.0f} VaR neto {v:8.0f}  ahorro VaR {var_gross-v:8.0f}  coste (carga 30%) {0.3*rec:8.0f}  prima total {1.3*rec:8.0f}  ahorro/coste {(var_gross-v)/(0.3*rec) if rec>0 else float('nan'):.1f}")

# ---- Salto único (single big jump) para Pareto con α bajo ----------------------------------
print("-- single big jump: VaR ≈ θ[((1−p)/E[N])^(−1/α) − 1] + E[S]")
for a_ in (3, 2.5, 2, 1.5, 1.2):
    t_ = 1000*(a_-1); x = t_*(((1-.995)/EN)**(-1/a_) - 1); print("alpha", a_, "approx", round(x+EN*1000), "(solo salto:", round(x), ")")

# ---- Figura: VaR relativo al engordar la cola -----------------------------------------------
tabla = {5: .56, 4: .585, 3.5: .6117, 3: .665, 2.5: .7983, 2: 1.25, 1.5: 3.225}
fig, ax = plt.subplots(figsize=(6.6, 3.6)); xs = sorted(tabla, reverse=True)
ax.plot(xs, [tabla[a] for a in xs], "o-", color=AZ, label="VaR 99,5 % exacto")
ax.plot([5, 4, 3.5, 3, 2.5], [225097.68/150000-1, 227274.88/150000-1, 229392.39/150000-1, 233466.41/150000-1, 244642.01/150000-1], "s--", color=RJ, label="Normal (solo si α>2)")
ax.axvline(2, color=GR, ls=":"); ax.text(2.03, 2.6, "α=2: sin varianza", color=GR, fontsize=8, rotation=90); ax.set_xlabel("α de la Pareto (media fija 1.000)"); ax.set_ylabel("VaR / E(S) − 1"); ax.invert_xaxis(); ax.legend(fontsize=8)
plt.tight_layout(); plt.savefig("t3_f_debate3.png", dpi=170); plt.close()

# ---- Figura: efecto del XL en el VaR neto ------------------------------------------------------
fig, ax = plt.subplots(figsize=(6.6, 3.6)); dd = [f[0] for f in filas[:-1]]
ax.plot(dd, [f[4]/1e3 for f in filas[:-1]], "o-", color=AZ, label="VaR 99,5 % neto"); ax.axhline(var_gross/1e3, color=GR, ls="--", label="VaR bruto")
ax2 = ax.twinx(); ax2.plot(dd, [1.3*f[6]/1e3 for f in filas[:-1]], "s-", color=OC, label="prima de reaseguro (carga 30 %)"); ax2.grid(False)
ax.set_xscale("log"); ax.set_xlabel("prioridad d del exceso de pérdida por riesgo (€)"); ax.set_ylabel("VaR (miles €)"); ax2.set_ylabel("prima (miles €)")
h1, l1 = ax.get_legend_handles_labels(); h2, l2 = ax2.get_legend_handles_labels(); ax.legend(h1+h2, l1+l2, fontsize=8, loc="center right")
plt.tight_layout(); plt.savefig("t3_f_debate2.png", dpi=170); plt.close()

# ---- Repaso 1/2: contribución de cada término a la varianza ----------------------------------------
print("Auto: EN*VX =", 1200*2*450**2, " VarN*EX^2 =", 1200*900**2, "-> Poisson: términos", 1200*405000, 1200*810000)
print("Hogar: EN*VX =", EN*VX, " VarN*EX^2 =", VN*EX**2)
for phi in (1, 2, 4):
    print("phi", phi, "Var(S) Hogar", EN*VX + (phi-1)*EN*EX**2 + EN*EX**2*0 if False else EN*EX2 + (phi-1)*EN*EX**2)
# BN como mezcla: λ Gamma(r, β) -> mismos momentos
print("mezcla Poisson-Gamma: E=rβ", r*beta, "Var=rβ(1+β)", r*beta*(1+beta), "Var Λ = rβ²", r*beta**2)
# Repaso 3: Pareto 1.8
a_ = 1.8; print("Pareto 1.8: E(X) = θ/(α−1) =", "θ/0.8", " Var infinita; 3er momento infinito; E[N]P(X>x) =", "")
n = 1000; rng = np.random.default_rng(1); samp = stats.lomax.rvs(1.8, scale=1000*.8, size=(300, n), random_state=rng); varm = samp.var(axis=1, ddof=1)
print("varianza muestral Pareto 1.8 (n=1000): mediana", np.median(varm), "p90", np.quantile(varm, .9), "max", varm.max())
big = [stats.lomax.rvs(1.8, scale=800, size=m, random_state=rng).var(ddof=1) for m in (100, 1000, 10000, 100000)]
print("varianza muestral vs n", big)
for a_ in (1.8,):
    t_ = 800; x = t_*(((1-.995)/150)**(-1/a_) - 1); print("alpha 1.8 VaR approx", x + 150*1000)
print("figs ok")
