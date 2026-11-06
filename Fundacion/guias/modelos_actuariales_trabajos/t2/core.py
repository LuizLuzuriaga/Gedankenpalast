import numpy as np
from scipy import stats
Z995 = stats.norm.ppf(0.995)

def momentos(q, b, sig2=None, mu=None):
    """Individual con severidad degenerada (b) o aleatoria (mu, sig2). Devuelve E, Var, mu3 totales."""
    q = np.asarray(q, float); b = np.asarray(b, float)
    E = q*b; V = q*(1-q)*b**2; m3 = b**3*q*(1-q)*(1-2*q)
    return E.sum(), V.sum(), m3.sum()

def aprox(E, V, m3, p=0.995):
    sd = V**.5; g = m3/sd**3; z = stats.norm.ppf(p)
    normal = E + z*sd
    a = 4/g**2; beta = 2/(sd*g); k = E - 2*sd/g
    gam = k + stats.gamma.ppf(p, a, scale=1/beta)
    npw = E + sd*(z + g/6*(z**2-1))
    return dict(sd=sd, g=g, normal=normal, alpha=a, beta=beta, k=k, gamma=gam, np=npw)

def exacta(q, b, unit):
    """Distribución exacta de S por convolución (b múltiplo de unit)."""
    q = np.asarray(q, float); u = (np.asarray(b, float)/unit).round().astype(int)
    P = np.zeros(u.sum()+1); P[0] = 1
    for qi, ui in zip(q, u):
        N = P*(1-qi); N[ui:] += qi*P[:len(P)-ui]; P = N
    return P
def cuantil(P, unit, p):
    c = np.cumsum(P); return unit*int(np.searchsorted(c, p))
