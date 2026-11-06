import numpy as np, matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from scipy import stats
from scipy.signal import fftconvolve

plt.rcParams.update({"font.size": 10, "axes.spines.top": False, "axes.spines.right": False, "axes.grid": True, "grid.alpha": .25})
AZ, OC, RJ, GR = "#1559a6", "#9a5b12", "#b3261e", "#57667a"
Z = stats.norm.ppf(.995)
n = np.array([500, 300, 150, 50.]); q = np.array([.002, .004, .006, .010]); b = np.array([1e5, 1.5e5, 2e5, 3e5])

def mom(n, q, b):
    return (n*q*b).sum(), (n*q*(1-q)*b**2).sum(), (n*b**3*q*(1-q)*(1-2*q)).sum()
def pmf(n, q, b, unit=50000):
    P = np.ones(1)
    for ng, qg, bg in zip(n, q, b):
        u = int(round(bg/unit)); pm = stats.binom.pmf(np.arange(int(ng)+1), int(ng), qg); arr = np.zeros(int(ng)*u+1); arr[::u] = pm
        P = np.clip(fftconvolve(P, arr), 0, None)
    return P/P.sum()
def var99(P, unit=50000, p=.995): return unit*int(np.searchsorted(np.cumsum(P), p))
def approx(E, V, m3, p=.995):
    sd = V**.5; g = m3/sd**3; z = stats.norm.ppf(p)
    return dict(sd=sd, g=g, normal=E+z*sd, np=E+sd*(z+g/6*(z**2-1)), gamma=E-2*sd/g+stats.gamma.ppf(p, 4/g**2, scale=sd*g/2))

E, V, M3 = mom(n, q, b); P = pmf(n, q, b); ap = approx(E, V, M3)
print("== Caso 1 base:", E, V, ap)
# ---- Repaso 1: aportes de la póliza 8, y dependencia equicorrelada -------
q8 = np.array([.0015, .002, .0025, .003, .004, .005, .006, .008]); b8 = np.array([120e3, 150e3, 100e3, 200e3, 80e3, 250e3, 90e3, 300e3])
v8 = q8*(1-q8)*b8**2; print("poliza8 %Var", 100*v8[-1]/v8.sum(), "%E", 100*(q8*b8)[-1]/(q8*b8).sum())
sdsum = (n*np.sqrt(q*(1-q))*b).sum()
for rho in (0, .001, .005, .01, .05):
    Vr = (1-rho)*V + rho*sdsum**2; print("rho", rho, "Var", Vr, "SD", Vr**.5, "VaR", E+Z*Vr**.5, "x veces var", Vr/V)
# ---- Repaso 2: cola exacta frente a Normal ---------------------------------
xs = np.arange(len(P))*50000; sf = 1-np.cumsum(P)
print("P(S>VaR_normal) exacto", 1-np.cumsum(P)[int(ap["normal"]//50000)], " P(S>NP)", sf[int(ap["np"]//50000)])
fig, ax = plt.subplots(figsize=(6.6, 3.6))
grid = np.arange(900000, 2200001, 50000)
ax.step(grid/1e6, [sf[int(x//50000)] for x in grid], where="post", color=AZ, label="exacta (convolución)")
ax.plot(grid/1e6, stats.norm.sf((grid-E)/V**.5), color=RJ, ls="--", label="Normal")
g = ap["g"]; zz = (grid-E)/V**.5
# NP: P(S>x) ≈ Φ̄(y) con y = invertida de z = y + g/6 (y²−1)  -> y = -3/g + sqrt(9/g² + 1 + 6 z/g)
y = -3/g + np.sqrt(9/g**2 + 1 + 6*zz/g); ax.plot(grid/1e6, stats.norm.sf(y), color=OC, label="Normal Power")
ax.axhline(.005, color=GR, lw=.8, ls=":"); ax.set_yscale("log"); ax.set_ylim(1e-5, .1); ax.set_xlabel("x (millones €)"); ax.set_ylabel("P(S > x)"); ax.legend(fontsize=8)
plt.tight_layout(); plt.savefig("t2_f_repaso2.png", dpi=170); plt.close()
# ---- Repaso 3: colectivo frente a individual -------------------------------
Vcol = (n*q*b**2).sum(); M3col = (n*q*b**3).sum(); a = approx(E, Vcol, M3col)
print("Var ind", V, "Var col", Vcol, "dif %", 100*(Vcol/V-1), "VaR normal col", a["normal"], "vs", ap["normal"], 100*(a["normal"]/ap["normal"]-1))
Vc8 = (q8*b8**2).sum(); print("8 pol: Var ind", v8.sum(), "Var col", Vc8, 100*(Vc8/v8.sum()-1))
n2 = np.array([100, 200, 50.]); q2 = np.array([.05, .06, .08]); M2 = np.array([5e3, 8e3, 12e3])
Vi2 = (n2*(q2*M2**2/3 - (q2*M2/2)**2)).sum(); Vc2 = (n2*q2*M2**2/3).sum(); print("Caso2 Var ind", Vi2, "col", Vc2, 100*(Vc2/Vi2-1), "VaR normal", 84500+Z*Vi2**.5, 84500+Z*Vc2**.5)
# ---- Debate 1: pandemia -------------------------------------------------------
print("cat mortalidad SII +0,15 pp:", (n*b).sum()*0.0015, " suma asegurada", (n*b).sum())
filas = []
for tau in (0, .1, .2, .3, .5):
    Vt = V + tau**2*E**2; filas.append((tau, Vt, E+Z*Vt**.5)); print("frailty tau", tau, "Var", Vt, "x", Vt/V, "VaR normal", E+Z*Vt**.5)
fig, ax = plt.subplots(figsize=(6.6, 3.5))
taus = np.linspace(0, .5, 60); ax.plot(taus, [E+Z*(V+t**2*E**2)**.5 for t in taus], color=AZ)
ax.axhline(ap["normal"], color=GR, ls=":"); ax.set_xlabel(r"$\tau$ (desviación típica del factor común de mortalidad)"); ax.set_ylabel("VaR 99,5 % (Normal)")
ax.text(.01, ap["normal"]*1.02, "independencia", color=GR); plt.tight_layout(); plt.savefig("t2_f_debate1.png", dpi=170); plt.close()
# ---- Debate 3: reaseguro por riesgo (XL) y su efecto en asimetría ----------------
for d in (None, 250e3, 200e3, 150e3, 100e3):
    bb = b if d is None else np.minimum(b, d); Ee, Ve, Me = mom(n, q, bb); Pe = pmf(n, q, bb, 50000 if d is None or d % 50000 == 0 else 50000); a = approx(Ee, Ve, Me); vx = var99(Pe)
    print("retención", d, "E", Ee, "SD", Ve**.5, "asim", a["g"], "VaR normal", a["normal"], "exacto", vx, "err normal %", 100*(a["normal"]/vx-1), "NP", 100*(a["np"]/vx-1))
# cuota parte 50%: asimetría invariante
print("CP 50% asim", approx(.5*E, .25*V, .125*M3)["g"], "SD", (.25*V)**.5)
# ---- Debate 4: incertidumbre de parámetros ------------------------------------------
for f in (1.0, 1.2, 1.5):
    q_ = q.copy(); q_[3] *= f; E_, V_, M_ = mom(n, q_, b); print("q_D x", f, "E", E_, "VaR normal", E_+Z*V_**.5, "dif", E_+Z*V_**.5-ap["normal"])
q_ = q*1.2; E_, V_, M_ = mom(n, q_, b); print("todas q x1.2 VaR normal", E_+Z*V_**.5, 100*((E_+Z*V_**.5)/ap["normal"]-1))
# híbrido: grupo D individual (b=300k exacto) y resto colectivo Poisson
print("figs ok")
