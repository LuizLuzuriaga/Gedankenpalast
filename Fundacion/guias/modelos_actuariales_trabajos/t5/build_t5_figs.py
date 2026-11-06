import numpy as np, matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from scipy import stats, integrate, optimize

plt.rcParams.update({"font.size": 10, "axes.spines.top": False, "axes.spines.right": False, "axes.grid": True, "grid.alpha": .25})
AZ, OC, RJ, GR = "#1559a6", "#9a5b12", "#b3261e", "#57667a"
rng = np.random.default_rng(77)

def var_gpd(p, u, xi, sg, n, Nu): return u + sg*np.expm1(-xi*np.log((n/Nu)*(1 - p)))/xi
def nivel(m, u, xi, sg, lam): return u + sg*np.expm1(xi*np.log(lam*m))/xi
def mle(exc):
    f = lambda p: np.inf if p[1] <= 0 else -np.sum(stats.genpareto.logpdf(exc, p[0], 0, p[1]))
    return optimize.minimize(f, [.2, exc.mean()], method="Nelder-Mead", options=dict(xatol=1e-8, fatol=1e-9, maxiter=3000)).x
def sim_scr(lam, xi, sg, u0, NY=600_000, seed=5):
    r = np.random.default_rng(seed); N = r.poisson(lam, NY); tot = N.sum(); anio = np.repeat(np.arange(NY), N)
    xs = u0 + stats.genpareto.rvs(xi, 0, sg, size=tot, random_state=r); S = np.bincount(anio, weights=xs, minlength=NY)
    return S.mean(), np.quantile(S, .995), np.quantile(S, .995) - S.mean()

# ---- Repaso 3: varianza muestral de una GPD con ξ = 0,6 -------------------------------------------------------
print("varianza muestral GPD(ξ=0,6; σ=1):")
for n in (100, 1000, 10000, 100000):
    v = [stats.genpareto.rvs(.6, 0, 1, size=n, random_state=rng).var(ddof=1) for _ in range(150)]; print(" n", n, "mediana", round(np.median(v), 1), "p90", round(np.quantile(v, .9), 1), "máx", round(np.max(v), 1))
print("TVaR/VaR límite 1/(1−ξ) =", 1/(1 - .6), " E(Y)=σ/(1−ξ) =", 1/(1 - .6))
# media muestral: error relativo con n=1000 (ξ=0,6)
m = [stats.genpareto.rvs(.6, 0, 1, size=1000, random_state=rng).mean() for _ in range(2000)]; print("media muestral n=1000: media", np.mean(m), "sd", np.std(m), "verdadera 2.5")

# ---- Repaso 2: GEV a partir de POT --------------------------------------------------------------------------------------
u, xi, sg, lam = 10, .35, 6, 2.0
mu_g = u + sg*(lam**xi - 1)/xi; sg_g = sg*lam**xi; q200 = mu_g + sg_g/xi*((-np.log(1 - 1/200))**(-xi) - 1)
print("GEV anual: μ", mu_g, "σ", sg_g, "ξ", xi, " cuantil 1/200:", q200, " nivel de retorno POT 200:", nivel(200, u, xi, sg, lam))
for m_ in (10, 50, 100, 200): print("  m", m_, "POT", round(nivel(m_, u, xi, sg, lam), 2), "GEV", round(mu_g + sg_g/xi*((-np.log(1 - 1/m_))**(-xi) - 1), 2))

# ---- Debate 1: SCR según ξ ---------------------------------------------------------------------------------------------------
print("SCR (Poisson 2, σ=6, u=10) según ξ:")
for x_ in (.21, .28, .35, .41, .45): print("  xi", x_, [round(v, 1) for v in sim_scr(2, x_, 6, 10)])
print("VaR severidad (n/Nu=25) según ξ,σ de la tabla de la diapositiva:")
for u_, x_, s_ in ((5, .21, 3.38), (7.5, .28, 3.47), (10, .41, 3.52), (12.5, .35, 4.83), (15, .32, 5.94), (20, .30, 7.12)): pass

# ---- Debate 2: 15 años frente a 40 años --------------------------------------------------------------------------------
print("Caso 1: nivel 1-en-200 con λ=2 (Nu=80, T=40):", nivel(200, 10, .35, 6, 2), " | con los mismos 80 excesos en 15 años λ=5.33:", nivel(200, 10, .35, 6, 80/15))
print("Caso 2: λ=2 →", nivel(200, 5, .25, 4, 2), " | 60 excesos en 15 años λ=4:", nivel(200, 5, .25, 4, 4))
res = {}
for Nu_, label in ((80, "Nu=80 (40 años)"), (30, "Nu=30 (15 años, λ=2)")):
    est = []
    for _ in range(1500):
        y = stats.genpareto.rvs(.35, 0, 6, size=Nu_, random_state=rng); x_, s_ = mle(y)
        est.append((x_, var_gpd(.995, 10, x_, s_, 25*Nu_, Nu_), nivel(200, 10, x_, s_, 2.0) if x_ > -.5 else np.nan))
    est = np.array(est); ok = est[:, 0] < .98
    res[label] = (np.quantile(est[:, 0], [.05, .95]), np.nanquantile(est[ok, 1], [.05, .95]), np.nanquantile(est[ok, 2], [.05, .95]), est[:, 0].std())
    print(label, "ξ̂ IC90", np.round(res[label][0], 2), "sd", round(res[label][3], 3), "VaR IC90", np.round(res[label][1], 1), "nivel200 IC90", np.round(res[label][2], 0))
print("factor de extrapolación a 200 años: 200/40 =", 200/40, " 200/15 =", 200/15)

# ---- Debate 3: SCR con tendencia -------------------------------------------------------------------------------------------
print("Caso 2 (u=5, ξ=0,25, σ=4): SCR con λ=2,25 (estacionario) frente a λ=3,62 (tendencia 2025):")
for lam_ in (2.25, 3.62): print("  λ", lam_, [round(v, 1) for v in sim_scr(lam_, .25, 4, 5)], " nivel100", round(nivel(100, 5, .25, 4, lam_), 1), " nivel200", round(nivel(200, 5, .25, 4, lam_), 1))
print("crecimiento 25 % por década: exp(10β)=", 1.25, "→ β=", np.log(1.25)/10, "; en 20 años:", 1.25**2)

# ---- Debate 4: torre de capas --------------------------------------------------------------------------------------------------
def esp_exc(d, u0, xi, sg): return (sg + xi*(d - u0))/(1 - xi)*(1 + xi*(d - u0)/sg)**(-1/xi)
def capa(D, L, u0, xi, sg, lam):
    sfy = lambda y: (1 + xi*(D + y - u0)/sg)**(-1/xi); EL = lam*(esp_exc(D, u0, xi, sg) - esp_exc(D + L, u0, xi, sg)); ey2 = integrate.quad(lambda y: 2*y*sfy(y), 0, L)[0]
    prima = EL + .25*np.sqrt(lam*ey2); return EL, 1 - np.exp(-lam*sfy(0)), 1 - np.exp(-lam*sfy(L)), prima, prima/L
print("torre de capas (Caso 1):")
capas = [(10, 10), (20, 20), (40, 40), (80, 60)]
tabla = []
for D, L in capas:
    for x_ in (.25, .35, .45):
        EL, pc, pa, pr, rol = capa(D, L, 10, x_, 6, 2.0); tabla.append((D, L, x_, EL, pc, pa, pr, rol))
for t in tabla: print("  %2d xs %2d  ξ=%.2f  EL %.3f  Pcont %.3f  Pagot %.4f  prima %.3f  ROL %.3f" % (t[1], t[0], *t[2:]))
print("return periods: retención 10 =", 1/(2*1), " (λ_u=2 → todo evento>10)", " attach 20:", 1/(2*(1 + .35*10/6)**(-1/.35)), " attach 40:", 1/(2*(1 + .35*30/6)**(-1/.35)), " attach 80:", 1/(2*(1 + .35*70/6)**(-1/.35)))
# figuras
fig, ax = plt.subplots(figsize=(6.6, 3.6)); ms = np.logspace(0, np.log10(300), 80)
ax.semilogx(ms, [nivel(m, 10, .35, 6, 2.0) for m in ms], color=AZ, label="ξ=0,35 (estimada)")
for dx, c in ((-.1, GR), (.1, RJ)): ax.semilogx(ms, [nivel(m, 10, .35 + dx, 6, 2.0) for m in ms], color=c, ls="--", label=f"ξ={.35 + dx:.2f}")
ax.axvline(40, color="k", ls=":", lw=.8); ax.text(42, 20, "40 años de datos", fontsize=8); ax.set_xlabel("periodo de retorno (años)"); ax.set_ylabel("nivel de retorno por evento (M€)"); ax.legend(fontsize=8)
plt.tight_layout(); plt.savefig("t5_f_debate2.png", dpi=170); plt.close()
fig, ax = plt.subplots(figsize=(6.6, 3.6)); xs_ = np.linspace(0, 60, 300)
for xi_, c in ((.35, AZ), (.6, RJ), (.1, GR)): ax.plot(xs_, stats.genpareto.sf(xs_, xi_, 0, 6*(1 - xi_)/ (1 - .35)), color=c, label=f"ξ={xi_}")
ax.set_yscale("log"); ax.set_xlabel("exceso y"); ax.set_ylabel("P(Y>y)"); ax.legend(fontsize=8); plt.tight_layout(); plt.savefig("t5_f_repaso3.png", dpi=170); plt.close()
print("figs ok")
