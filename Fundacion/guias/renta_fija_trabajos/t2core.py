# -*- coding: utf-8 -*-
"""Núcleo de cálculo del Trabajo 2: datos, flujos, precios y estimación de la ETTI (Svensson y splines cúbicas)."""
import re, datetime as dt, glob
import numpy as np
import openpyxl
from scipy.optimize import brentq, least_squares

LIQ = dt.date(2026, 9, 14)          # fecha valor (celda R4 del Excel); contratación 11/09/2026
RAIZ = r"C:\Users\luzur\OneDrive - Universidad de Alcala\Documentos\UNIVERSIDAD\MUCAF\SEGUNDO AÑO\Renta Fija\Tema 3"
# Día de vencimiento del Tesoro según el mes (calendario de emisiones del Tesoro): 31/01, 30/03, 30/04, 31/05, 30/07, 31/10, 30/11
DIA = {1: 31, 3: 30, 4: 30, 5: 31, 7: 30, 10: 31, 11: 30}

def leer():
    f = glob.glob(RAIZ + r"\COTIZ*.xlsx")[0]
    ws = openpyxl.load_workbook(f, data_only=True).active
    bonos = []
    for r in range(6, ws.max_row + 1):
        nombre = ws.cell(r, 1).value
        if not nombre or not str(nombre).startswith(("BON", "OBL")): continue
        pc, pv = ws.cell(r, 6).value, ws.cell(r, 7).value
        if not isinstance(pc, (int, float)): continue            # sin cotización
        m = re.match(r"(BON|OBL) TESORO- ([\d,]+) (\d\d)/(\d{4})", nombre)
        cup = float(m.group(2).replace(",", "."))
        mes, anio = int(m.group(3)), int(m.group(4))
        venc = dt.date(anio, mes, DIA[mes])
        bonos.append(dict(fila=r, nombre=nombre, isin=ws.cell(r, 2).value, tipo=m.group(1), cupon=cup, venc=venc,
                          p_c=pc, p_v=pv, tir_c=ws.cell(r, 5).value, tir_v=ws.cell(r, 8).value,
                          imp_c=ws.cell(r, 4).value, imp_v=ws.cell(r, 9).value))
    return bonos

def anios_atras(d, k=1):
    return d.replace(year=d.year - k)

def flujos(b, liq=LIQ):
    """Fechas, importes y plazos (años) de los flujos futuros. Plazo = fracción del primer periodo + k (convención del Tema 1)."""
    v = b["venc"]
    fechas = []
    d = v
    while d > liq:
        fechas.append(d); d = anios_atras(d)
    fechas = fechas[::-1]
    prev = anios_atras(fechas[0])
    base = (fechas[0] - prev).days
    frac = (fechas[0] - liq).days / base
    t = np.array([frac + k for k in range(len(fechas))])
    cf = np.full(len(fechas), b["cupon"]); cf[-1] += 100.0
    cc = b["cupon"] * (liq - prev).days / base
    return dict(fechas=fechas, t=t, cf=cf, cc=cc, prev=prev, base=base)

def precio_tir(cf, t, y):
    return float(np.sum(cf / (1 + y) ** t))

def tir(cf, t, P):
    return brentq(lambda y: precio_tir(cf, t, y) - P, -0.5, 1.0)

def duracion(cf, t, y):
    pv = cf / (1 + y) ** t
    return float((t * pv).sum() / pv.sum())

def preparar():
    bonos = leer()
    for b in bonos:
        fl = flujos(b); b.update(fl)
        b["P_m"] = (b["p_c"] + b["p_v"]) / 2                    # precio ex-cupón medio compra/venta
        b["P_b"] = b["P_m"] + b["cc"]                           # precio bruto
        b["y"] = tir(b["cf"], b["t"], b["P_b"])
        b["y_pub"] = (b["tir_c"] + b["tir_v"]) / 2 / 100
        b["D"] = duracion(b["cf"], b["t"], b["y"])
        b["T"] = float(b["t"][-1])
    return bonos

# ---------------------------- Svensson ------------------------------------------------
def svensson(T, p):
    b0, b1, b2, b3, k1, k2 = p
    T = np.asarray(T, float)
    a1 = (1 - np.exp(-k1 * T)) / (k1 * T); a2 = (1 - np.exp(-k2 * T)) / (k2 * T)
    return b0 + (b1 + b2) * a1 - b2 * np.exp(-k1 * T) + b3 * a2 - b3 * np.exp(-k2 * T)

def svensson_fwd(T, p):
    b0, b1, b2, b3, k1, k2 = p
    T = np.asarray(T, float)
    return b0 + b1 * np.exp(-k1 * T) + b2 * k1 * T * np.exp(-k1 * T) + b3 * k2 * T * np.exp(-k2 * T)

def precio_modelo(bonos, p):
    return np.array([np.sum(b["cf"] * np.exp(-svensson(b["t"], p) * b["t"])) for b in bonos])

def ajustar_svensson(bonos, p0=(0.05, -0.025, 0.01, -0.04, 1.2, 0.5), pesos="dur"):
    P = np.array([b["P_b"] for b in bonos]); D = np.array([b["D"] for b in bonos])
    w = {"dur": 1 / D, "mco": np.ones_like(D)}[pesos]
    lb = [0, -0.2, -0.2, -0.2, 0.05, 0.05]; ub = [0.2, 0.2, 0.2, 0.2, 10, 10]
    fun = lambda p: w * (precio_modelo(bonos, p) - P)
    s = least_squares(fun, p0, bounds=(lb, ub), x_scale=[0.05, 0.05, 0.05, 0.05, 1, 1], xtol=1e-14, ftol=1e-14, gtol=1e-14, max_nfev=5000)
    return s

# ---------------------------- Splines cúbicas sobre D(t) --------------------------------
def base_spline(t, nudos):
    """Funciones base con a0 = 1 (D(0)=1): [t, t², t³, (t-ξ_p)^3_+ ...]. D(t) = 1 + Σ β_j φ_j(t)."""
    t = np.asarray(t, float)
    cols = [t, t ** 2, t ** 3] + [np.maximum(t - x, 0) ** 3 for x in nudos]
    return np.vstack(cols)

def matriz_spline(bonos, nudos):
    A = np.zeros((len(bonos), 3 + len(nudos)))
    for i, b in enumerate(bonos):
        A[i] = (b["cf"][None, :] * base_spline(b["t"], nudos)).sum(axis=1)
    return A

def ajustar_spline(bonos, nudos, pesos="dur"):
    P = np.array([b["P_b"] for b in bonos]); D = np.array([b["D"] for b in bonos])
    A = matriz_spline(bonos, nudos)
    c0 = np.array([b["cf"].sum() for b in bonos])         # D(t)=1 + ...  -> P - Σ CF = A β
    w = 1 / D if pesos == "dur" else np.ones_like(D)
    beta, *_ = np.linalg.lstsq(A * w[:, None], (P - c0) * w, rcond=None)
    return beta

def D_spline(t, beta, nudos):
    t = np.asarray(t, float)
    return (1 + beta @ base_spline(t.ravel(), nudos)).reshape(t.shape)

def tir_modelo(bonos, Pmod):
    return np.array([tir(b["cf"], b["t"], p) for b, p in zip(bonos, Pmod)])
