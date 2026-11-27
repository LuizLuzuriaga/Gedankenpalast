# -*- coding: utf-8 -*-
"""
Trabajo 2 - funciones de calculo (las usa t2.py y el generador del Excel).

Contenido, con su equivalente en el Excel 'Trabajo2_ETTI_RentaFija.xlsx':
  - leer()          lectura de las cotizaciones del Tesoro      -> hoja Bonos, datos en azul
  - flujos()        fechas, plazos y cupon corrido              -> Bonos (I a P) y hoja Flujos
  - tir(), duracion()                                           -> Bonos, columnas Q y S
  - svensson()      tipo cupon cero continuo del modelo         -> Flujos, columna F
  - precio_modelo() precio teorico con Svensson                 -> Flujos (G, H) y Bonos (W)
  - funciones de las splines cubicas sobre D(t)                 -> hojas Splines y Flujos (I a Q)
"""
import re
import glob
import datetime as dt

import numpy as np
import openpyxl
from scipy.optimize import brentq, least_squares

# Fecha valor: contratacion el viernes 11/09/2026, liquidacion D+1 habil = lunes 14/09/2026 (Parametros!B4)
LIQ = dt.date(2026, 9, 14)
RAIZ = r"C:\Users\luzur\OneDrive - Universidad de Alcala\Documentos\UNIVERSIDAD\MUCAF\SEGUNDO AÑO\primer_cuatri\Renta Fija\Tema 3"

# El boletin solo da mes/anio de vencimiento. Dia segun el calendario de emisiones del Tesoro:
# 31/01, 31/03, 30/04, 31/05, 30/07, 31/10 y 30/11.
DIA = {1: 31, 3: 31, 4: 30, 5: 31, 7: 30, 10: 31, 11: 30}


# =============================================================================
# DATOS  (Excel: hoja Bonos, columnas A a G)
# =============================================================================
def leer():
    """Lee el boletin de cotizaciones y devuelve los bonos y obligaciones que cotizan."""
    archivo = glob.glob(RAIZ + r"\COTIZ*.xlsx")[0]
    ws = openpyxl.load_workbook(archivo, data_only=True).active
    bonos = []
    for r in range(6, ws.max_row + 1):
        nombre = ws.cell(r, 1).value
        if not nombre or not str(nombre).startswith(("BON", "OBL")):
            continue
        p_compra, p_venta = ws.cell(r, 6).value, ws.cell(r, 7).value
        if not isinstance(p_compra, (int, float)):
            continue                                          # sin cotizacion (p. ej. la 4 % 10/2064)
        m = re.match(r"(BON|OBL) TESORO- ([\d,]+) (\d\d)/(\d{4})", nombre)
        cupon = float(m.group(2).replace(",", "."))
        mes, anio = int(m.group(3)), int(m.group(4))
        bonos.append(dict(fila=r, nombre=nombre, isin=ws.cell(r, 2).value, tipo=m.group(1), cupon=cupon,
                          venc=dt.date(anio, mes, DIA[mes]),
                          p_c=p_compra, p_v=p_venta,
                          tir_c=ws.cell(r, 5).value, tir_v=ws.cell(r, 8).value,
                          imp_c=ws.cell(r, 4).value, imp_v=ws.cell(r, 9).value))
    return bonos


def anios_atras(d, k=1):
    return d.replace(year=d.year - k)


# =============================================================================
# FLUJOS, PLAZOS Y CUPON CORRIDO  (Excel: Bonos I a P; una fila por flujo en la hoja Flujos)
# =============================================================================
def flujos(b, liq=LIQ):
    """
    Flujos futuros de un bono con cupon anual.
    Plazo de cada flujo en anios = fraccion del primer periodo + k (convencion del Tema 1, ACT/ACT).
    """
    # fechas de pago: desde el vencimiento hacia atras, anio a anio, mientras sean posteriores a la fecha valor
    fechas = []
    d = b["venc"]
    while d > liq:
        fechas.append(d)
        d = anios_atras(d)
    fechas = fechas[::-1]

    anterior = anios_atras(fechas[0])                         # Bonos J: cupon anterior
    base = (fechas[0] - anterior).days                        # Bonos K: dias del periodo
    frac = (fechas[0] - liq).days / base                      # Bonos L: fraccion hasta el proximo cupon
    t = np.array([frac + k for k in range(len(fechas))])      # Flujos C: plazo de cada flujo
    cf = np.full(len(fechas), b["cupon"])                     # Flujos D: cupon...
    cf[-1] += 100.0                                           # ... y el nominal en el ultimo
    cc = b["cupon"] * (liq - anterior).days / base            # Bonos M: cupon corrido
    return dict(fechas=fechas, t=t, cf=cf, cc=cc, prev=anterior, base=base)


# =============================================================================
# TIR Y DURACION  (Excel: Bonos Q = TIR, R = control del precio con esa TIR, S = duracion)
# =============================================================================
def precio_tir(cf, t, y):
    """Precio descontando todos los flujos a la TIR y (capitalizacion compuesta anual)."""
    return float(np.sum(cf / (1 + y) ** t))


def tir(cf, t, P):
    """TIR: el tipo que iguala el precio teorico al precio bruto (equivale a Buscar objetivo)."""
    return brentq(lambda y: precio_tir(cf, t, y) - P, -0.5, 1.0)


def duracion(cf, t, y):
    """Duracion de Macaulay en anios."""
    pv = cf / (1 + y) ** t
    return float((t * pv).sum() / pv.sum())


def preparar():
    """Junta datos, flujos, precios y TIR de cada bono (Excel: hoja Bonos completa hasta la columna V)."""
    bonos = leer()
    for b in bonos:
        b.update(flujos(b))
        b["P_m"] = (b["p_c"] + b["p_v"]) / 2                  # Bonos H: precio medio compra/venta (ex cupon)
        b["P_b"] = b["P_m"] + b["cc"]                         # Bonos N: precio bruto = precio + cupon corrido
        b["y"] = tir(b["cf"], b["t"], b["P_b"])               # Bonos Q: TIR
        b["y_pub"] = (b["tir_c"] + b["tir_v"]) / 2 / 100      # Bonos U-V: TIR publicada (para el control)
        b["D"] = duracion(b["cf"], b["t"], b["y"])            # Bonos S: duracion; el peso es 1/D (Bonos T)
        b["T"] = float(b["t"][-1])                            # Bonos P: plazo hasta el vencimiento
    return bonos


# =============================================================================
# MODELO DE SVENSSON  (Excel: Parametros B7:B12; Flujos F a H; Bonos W)
# =============================================================================
def svensson(T, p):
    """Tipo cupon cero en capitalizacion continua r(T) (Flujos F)."""
    b0, b1, b2, b3, k1, k2 = p
    T = np.asarray(T, float)
    a1 = (1 - np.exp(-k1 * T)) / (k1 * T)
    a2 = (1 - np.exp(-k2 * T)) / (k2 * T)
    return b0 + (b1 + b2) * a1 - b2 * np.exp(-k1 * T) + b3 * a2 - b3 * np.exp(-k2 * T)


def svensson_fwd(T, p):
    """Forward instantaneo de Svensson (hoja Curva, columna D)."""
    b0, b1, b2, b3, k1, k2 = p
    T = np.asarray(T, float)
    return b0 + b1 * np.exp(-k1 * T) + b2 * k1 * T * np.exp(-k1 * T) + b3 * k2 * T * np.exp(-k2 * T)


def precio_modelo(bonos, p):
    """Precio teorico de cada bono: suma de flujos por exp(-r(t)*t) (Flujos G-H, sumado en Bonos W)."""
    return np.array([np.sum(b["cf"] * np.exp(-svensson(b["t"], p) * b["t"])) for b in bonos])


def ajustar_svensson(bonos, p0=(0.05, -0.025, 0.01, -0.04, 1.2, 0.5), pesos="dur"):
    """Ajuste simple desde un unico punto de partida (t2.py usa su propia version con varios arranques)."""
    P = np.array([b["P_b"] for b in bonos])
    D = np.array([b["D"] for b in bonos])
    w = {"dur": 1 / D, "mco": np.ones_like(D)}[pesos]
    lb = [0, -0.2, -0.2, -0.2, 0.05, 0.05]
    ub = [0.2, 0.2, 0.2, 0.2, 10, 10]
    error = lambda p: w * (precio_modelo(bonos, p) - P)
    return least_squares(error, p0, bounds=(lb, ub), x_scale=[0.05, 0.05, 0.05, 0.05, 1, 1],
                         xtol=1e-14, ftol=1e-14, gtol=1e-14, max_nfev=5000)


# =============================================================================
# SPLINES CUBICAS SOBRE LA FUNCION DE DESCUENTO  (Excel: hoja Splines y Flujos I a Q)
#   D(t) = 1 + a1 t + a2 t^2 + a3 t^3 + sum_p b_p (t - xi_p)^3_+      (D(0) = 1)
# =============================================================================
def base_spline(t, nudos):
    """Funciones base [t, t^2, t^3, (t - xi_p)^3_+ ...] (Flujos I a O)."""
    t = np.asarray(t, float)
    columnas = [t, t ** 2, t ** 3] + [np.maximum(t - x, 0) ** 3 for x in nudos]
    return np.vstack(columnas)


def matriz_spline(bonos, nudos):
    """Para cada bono, suma de flujo x funcion base: es la matriz de diseno de la regresion (hoja Splines)."""
    A = np.zeros((len(bonos), 3 + len(nudos)))
    for i, b in enumerate(bonos):
        A[i] = (b["cf"][None, :] * base_spline(b["t"], nudos)).sum(axis=1)
    return A


def ajustar_spline(bonos, nudos, pesos="dur"):
    """
    Minimos cuadrados ponderados: P - suma(CF) = A * beta  (equivale a ESTIMACION.LINEAL en la hoja Splines,
    con filas multiplicadas por 1/D; coeficientes en Parametros B20:B26).
    """
    P = np.array([b["P_b"] for b in bonos])
    D = np.array([b["D"] for b in bonos])
    A = matriz_spline(bonos, nudos)
    c0 = np.array([b["cf"].sum() for b in bonos])           # parte de D(t) = 1
    w = 1 / D if pesos == "dur" else np.ones_like(D)
    beta, *_ = np.linalg.lstsq(A * w[:, None], (P - c0) * w, rcond=None)
    return beta


def D_spline(t, beta, nudos):
    """Factor de descuento de la spline (Flujos P)."""
    t = np.asarray(t, float)
    return (1 + beta @ base_spline(t.ravel(), nudos)).reshape(t.shape)


def tir_modelo(bonos, Pmod):
    """TIR implicita en el precio del modelo (Bonos AA para Svensson y AF para splines)."""
    return np.array([tir(b["cf"], b["t"], p) for b, p in zip(bonos, Pmod)])
