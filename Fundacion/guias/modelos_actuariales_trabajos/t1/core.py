# Núcleo numérico del Tema 1 (utilidad y decisiones bajo riesgo). Lo importan build_t1.py y los PDF.
import numpy as np, math
from scipy.optimize import brentq

W0, UP, DN, P = 10000.0, 2000.0, -1500.0, 0.5
PERFILES = [("Agresivo CRRA","CRRA",0.5),("Moderado CRRA","CRRA",2.0),("Conservador CRRA","CRRA",5.0),
            ("Agresivo CARA","CARA",1e-4),("Moderado CARA","CARA",3e-4),("Conservador CARA","CARA",6e-4)]

def u_crra(w,g):
    w=np.asarray(w,float)
    return np.log(w) if g==1 else w**(1-g)/(1-g)
def u_cara(w,a): return -np.exp(-a*np.asarray(w,float))/a

def ce_posicion(tipo,k,w=W0,up=UP,dn=DN,p=P):
    W=np.array([w+up,w+dn],float); pr=np.array([p,1-p])
    if tipo=="CRRA":
        return float(np.exp(pr@np.log(W))) if k==1 else float((pr@W**(1-k))**(1/(1-k)))
    return float(-np.log(pr@np.exp(-k*W))/k)

def tabla_perfiles():
    EW=W0+P*UP+(1-P)*DN
    return [(n,t,k,ce_posicion(t,k),EW-ce_posicion(t,k),ce_posicion(t,k)>W0) for n,t,k in PERFILES]

def prima_gamma(alpha,n=2,theta=500.0):
    return math.log((1-theta*alpha)**(-n))/alpha

def umbrales():
    g=brentq(lambda g:ce_posicion("CRRA",g)-W0,1.01,6)
    a=brentq(lambda a:ce_posicion("CARA",a)-W0,1e-6,1e-3)
    return g,a

def arrow_pratt_caso2(tipo,k):
    # π ≈ ½ r(w̄) σ²  con w̄ = E[W] y σ² = Var[X]; CRRA: r(w)=γ/w ; CARA: r=α
    var=P*(1-P)*(UP-DN)**2; wbar=W0+P*UP+(1-P)*DN
    r=k/wbar if tipo=="CRRA" else k
    return 0.5*r*var
