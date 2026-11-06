import numpy as np, xlsxwriter
from core import *

wb = xlsxwriter.Workbook("t1_practica.xlsx")
H = wb.add_format({"bold": 1, "bg_color": "#1559A6", "font_color": "white", "border": 1, "align": "center", "valign": "vcenter", "text_wrap": 1})
T = wb.add_format({"bold": 1, "font_size": 14}); I = wb.add_format({"italic": 1, "font_color": "#57667A"})
IN = wb.add_format({"bg_color": "#FFF2CC", "border": 1, "num_format": "#,##0.####"})
N1 = wb.add_format({"border": 1, "num_format": "#,##0.0"}); N2 = wb.add_format({"border": 1, "num_format": "#,##0.00"})
N6 = wb.add_format({"border": 1, "num_format": "0.000000"}); TX = wb.add_format({"border": 1}); PC = wb.add_format({"border": 1, "num_format": "0.0%"})
OK = wb.add_format({"border": 1, "align": "center", "bold": 1}); SCI = wb.add_format({"border": 1, "num_format": "0.000E+00"})

EW = W0 + P * UP + (1 - P) * DN
VAR = P * (1 - P) * (UP - DN) ** 2

# ---------------- Datos ----------------
d = wb.add_worksheet("Datos"); d.set_column("A:A", 46); d.set_column("B:B", 16); d.set_column("C:C", 40)
d.write("A1", "Tema 1 · Teoría de la utilidad y decisiones bajo riesgo — Datos de partida", T)
d.write("A2", "Celdas amarillas = entradas; el resto del libro se recalcula con fórmulas. Luiz Luzuriaga · MUCAF", I)
rows = [("Riqueza gestionada w (miles €)", W0, "w_0", "Caso 2"), ("Ganancia en el escenario favorable X↑", UP, "X_up", "Caso 2"),
        ("Resultado en el escenario desfavorable X↓", DN, "X_dn", "Caso 2"), ("Probabilidad del escenario favorable p", P, "prob_p", "Caso 2"),
        ("Gamma: forma n", 2, "gam_n", "Caso 1: X = θ·Y, Y ~ Gamma(n,1)"), ("Gamma: escala θ", 500, "gam_theta", "Caso 1"),
        ("Aversión absoluta cedente α_C", 6e-4, "alpha_C", "Caso 1 (exponencial)"), ("Aversión absoluta reasegurador α_R", 3e-4, "alpha_R", "Caso 1 (exponencial)")]
for i, (lab, v, nm, nt) in enumerate(rows):
    d.write(3 + i, 0, lab, TX); d.write(3 + i, 1, v, IN); d.write(3 + i, 2, nt, I); wb.define_name(nm, f"=Datos!$B${4 + i}")
d.write(12, 0, "Riqueza esperada E[W] = w + p·X↑ + (1−p)·X↓", TX)
d.write_formula(12, 1, "=w_0+prob_p*X_up+(1-prob_p)*X_dn", N1, EW); wb.define_name("EW_", "=Datos!$B$13")
d.write(13, 0, "Varianza Var[X] = p(1−p)(X↑−X↓)²", TX)
d.write_formula(13, 1, "=prob_p*(1-prob_p)*(X_up-X_dn)^2", N1, VAR); wb.define_name("VarX", "=Datos!$B$14")

# ---------------- Caso 2 ----------------
c = wb.add_worksheet("Caso2_Perfiles"); c.set_column("A:A", 20); c.set_column("B:K", 14)
c.write("A1", "Caso 2 · Equivalente cierto y prima de riesgo por perfil de aversión", T)
hd = ["Perfil", "Familia", "Parámetro (γ o α)", "W si X↑", "W si X↓", "CE", "E[W]", "Prima π = E[W]−CE", "¿Acepta? (CE>w)", "π Arrow–Pratt", "Error AP (%)"]
for j, h in enumerate(hd): c.write(2, j, h, H)
c.set_row(2, 32)
tab = tabla_perfiles()
for i, (n, t, k, ce, pi, ac) in enumerate(tab):
    r = 3 + i; x = r + 1
    c.write(r, 0, n, TX); c.write(r, 1, t, TX); c.write(r, 2, k, IN)
    c.write_formula(r, 3, "=w_0+X_up", N1, W0 + UP); c.write_formula(r, 4, "=w_0+X_dn", N1, W0 + DN)
    f = (f'=IF(B{x}="CRRA",IF(C{x}=1,EXP(prob_p*LN(D{x})+(1-prob_p)*LN(E{x})),(prob_p*D{x}^(1-C{x})+(1-prob_p)*E{x}^(1-C{x}))^(1/(1-C{x}))),'
         f'-LN(prob_p*EXP(-C{x}*D{x})+(1-prob_p)*EXP(-C{x}*E{x}))/C{x})')
    c.write_formula(r, 5, f, N1, ce); c.write_formula(r, 6, "=EW_", N1, EW)
    c.write_formula(r, 7, f"=G{x}-F{x}", N1, pi); c.write_formula(r, 8, f'=IF(F{x}>w_0,"Sí","No")', OK, "Sí" if ac else "No")
    ap = arrow_pratt_caso2(t, k)
    c.write_formula(r, 9, f'=0.5*IF(B{x}="CRRA",C{x}/EW_,C{x})*VarX', N1, ap)
    c.write_formula(r, 10, f"=(J{x}/H{x}-1)*100", N2, 100 * (ap / pi - 1))
c.write(10, 0, "Lectura: π crece con la aversión; aceptan solo los perfiles con CE > w (π < 250 = ganancia esperada). Arrow–Pratt sobrestima π cuando el riesgo deja de ser pequeño.", I)
c.write(11, 0, "Caso logarítmico: escribe 1 en la columna C de una fila CRRA (la fórmula usa EXP(E[ln W])).", I)
ch = wb.add_chart({"type": "column"})
ch.add_series({"name": "Prima de riesgo π", "categories": "=Caso2_Perfiles!$A$4:$A$9", "values": "=Caso2_Perfiles!$H$4:$H$9", "fill": {"color": "#1559A6"}})
ch.add_series({"name": "π Arrow–Pratt", "categories": "=Caso2_Perfiles!$A$4:$A$9", "values": "=Caso2_Perfiles!$J$4:$J$9", "fill": {"color": "#9A5B12"}})
ch.set_title({"name": "Prima de riesgo exacta frente a Arrow–Pratt"}); ch.set_size({"width": 760, "height": 320}); c.insert_chart("A15", ch)

# ---------------- Caso 1 ----------------
k1 = wb.add_worksheet("Caso1_Reaseguro"); k1.set_column("A:A", 50); k1.set_column("B:E", 16)
k1.write("A1", "Caso 1 · Zona de acuerdo cedente–reasegurador (utilidad exponencial, siniestro Gamma)", T)
lab = ["M_X(α_C) = (1−θα_C)^(−n)", "M_X(α_R) = (1−θα_R)^(−n)", "P⁺ = ln M_X(α_C)/α_C (prima máxima cedente)", "P⁻ = ln M_X(α_R)/α_R (prima mínima reasegurador)",
       "Anchura de la zona P⁺−P⁻", "E[X] = n·θ (prima pura)", "Recargo cedente P⁺/E[X]−1", "Recargo reasegurador P⁻/E[X]−1", "Cota de existencia 1/θ (α debe ser menor)"]
mC = (1 - 500 * 6e-4) ** -2; mR = (1 - 500 * 3e-4) ** -2; Pm = prima_gamma(6e-4); Pn = prima_gamma(3e-4)
fm = ["=(1-gam_theta*alpha_C)^(-gam_n)", "=(1-gam_theta*alpha_R)^(-gam_n)", "=LN(B3)/alpha_C", "=LN(B4)/alpha_R", "=B5-B6", "=gam_n*gam_theta", "=B5/B8-1", "=B6/B8-1", "=1/gam_theta"]
va = [mC, mR, Pm, Pn, Pm - Pn, 1000.0, Pm / 1000 - 1, Pn / 1000 - 1, 0.002]
fmt = [N6, N6, N2, N2, N2, N2, PC, PC, N6]
for i in range(9):
    k1.write(2 + i, 0, lab[i], TX); k1.write_formula(2 + i, 1, fm[i], fmt[i], va[i])
k1.write(12, 0, "Sensibilidad: P⁻ al reducirse α_R (la zona se ensancha hacia E[X])", T)
for j, h in enumerate(["α_R", "P⁻(α_R)", "Anchura P⁺−P⁻"]): k1.write(13, j, h, H)
als = np.array([1e-9, 5e-5, 1e-4, 1.5e-4, 2e-4, 2.5e-4, 3e-4, 4e-4, 5e-4, 5.9e-4])
for i, a in enumerate(als):
    r = 14 + i; x = r + 1; k1.write(r, 0, float(a), IN); v = prima_gamma(float(a))
    k1.write_formula(r, 1, f"=-gam_n*LN(1-gam_theta*A{x})/A{x}", N2, v); k1.write_formula(r, 2, f"=$B$5-B{x}", N2, Pm - v)
ch = wb.add_chart({"type": "scatter", "subtype": "straight_with_markers"})
ch.add_series({"name": "P⁻(α_R)", "categories": "=Caso1_Reaseguro!$A$15:$A$24", "values": "=Caso1_Reaseguro!$B$15:$B$24", "line": {"color": "#9A5B12"}})
ch.set_title({"name": "Prima mínima del reasegurador frente a su aversión"}); ch.set_x_axis({"name": "α_R", "num_format": "0.0000"}); ch.set_y_axis({"name": "P⁻"})
ch.set_legend({"none": True}); ch.set_size({"width": 640, "height": 300}); k1.insert_chart("F13", ch)

# ---------------- Umbrales ----------------
u = wb.add_worksheet("Umbrales"); u.set_column("A:G", 15); u.set_column("I:I", 30)
u.write("A1", "Umbral de aceptación: mayor aversión que aún acepta la posición del Caso 2", T)
for j, h in enumerate(["γ (CRRA)", "CE(γ)", "¿Acepta?", "", "α (CARA)", "CE(α)", "¿Acepta?"]):
    if h: u.write(2, j, h, H)
gs = np.round(np.arange(0.1, 6.01, 0.1), 1); als2 = np.round(np.arange(0.00002, 0.0010001, 0.00002), 5)
ces = [ce_posicion("CRRA", float(g)) for g in gs]; cea = [ce_posicion("CARA", float(a)) for a in als2]
for i, g in enumerate(gs):
    r = 3 + i; x = r + 1; v = ces[i]; u.write(r, 0, float(g), IN)
    u.write_formula(r, 1, f"=IF(A{x}=1,EXP(prob_p*LN(w_0+X_up)+(1-prob_p)*LN(w_0+X_dn)),(prob_p*(w_0+X_up)^(1-A{x})+(1-prob_p)*(w_0+X_dn)^(1-A{x}))^(1/(1-A{x})))", N1, v)
    u.write_formula(r, 2, f'=IF(B{x}>w_0,"Sí","No")', OK, "Sí" if v > W0 else "No")
for i, a in enumerate(als2):
    r = 3 + i; x = r + 1; v = cea[i]; u.write(r, 4, float(a), IN)
    u.write_formula(r, 5, f"=-LN(prob_p*EXP(-E{x}*(w_0+X_up))+(1-prob_p)*EXP(-E{x}*(w_0+X_dn)))/E{x}", N1, v)
    u.write_formula(r, 6, f'=IF(F{x}>w_0,"Sí","No")', OK, "Sí" if v > W0 else "No")
n = len(gs); na = len(als2)
k = sum(1 for v in ces if v >= W0); gint = float(gs[k - 1] + (ces[k - 1] - W0) / (ces[k - 1] - ces[k]) * (gs[k] - gs[k - 1]))
k2 = sum(1 for v in cea if v >= W0); aint = float(als2[k2 - 1] + (cea[k2 - 1] - W0) / (cea[k2 - 1] - cea[k2]) * (als2[k2] - als2[k2 - 1]))
def interp(colx, coly, last, step):
    m = f"MATCH(w_0,{coly}4:{coly}{last},-1)"
    return (f"=INDEX({colx}4:{colx}{last},{m})+(INDEX({coly}4:{coly}{last},{m})-w_0)/"
            f"(INDEX({coly}4:{coly}{last},{m})-INDEX({coly}4:{coly}{last},{m}+1))*{step}")
u.write("I3", "γ* (interpolación lineal)", H); u.write_formula("I4", interp("A", "B", 3 + n, 0.1), N6, gint)
u.write("I6", "α* (interpolación lineal)", H); u.write_formula("I7", interp("E", "F", 3 + na, 0.00002), N6, aint)
u.write("I9", "Exacto (Buscar objetivo): γ*≈1,6676 · α*≈0,000166", I)
ch = wb.add_chart({"type": "scatter", "subtype": "straight"})
ch.add_series({"name": "CE(γ)", "categories": f"=Umbrales!$A$4:$A${3 + n}", "values": f"=Umbrales!$B$4:$B${3 + n}", "line": {"color": "#1559A6"}})
ch.set_title({"name": "CE frente a γ: cruza w=10.000 en γ*"}); ch.set_x_axis({"name": "γ"}); ch.set_y_axis({"name": "CE", "min": 9000, "max": 10500})
ch.set_legend({"none": True}); ch.set_size({"width": 620, "height": 300}); u.insert_chart("I11", ch)

# ---------------- Curvas ----------------
cu = wb.add_worksheet("Curvas"); cu.set_column("A:N", 13)
cu.write("A1", "Curvas de utilidad por perfil (columnas I:N, normalizadas a [0,1])", T)
cu.write("A2", "Los parámetros de la fila 5 se enlazan a la hoja Caso2_Perfiles.", I)
cu.write(3, 0, "Tipo →", H); cu.write(4, 0, "Parámetro →", H)
for j, (n_, t, k_, *_r) in enumerate(tab):
    cu.write(2, 1 + j, n_, H); cu.write_formula(3, 1 + j, f"=Caso2_Perfiles!B{4 + j}", OK, t); cu.write_formula(4, 1 + j, f"=Caso2_Perfiles!C{4 + j}", N6, k_)
    cu.write(2, 8 + j, n_ + " (norm.)", H)
cu.set_row(2, 32); wg = np.arange(500, 20001, 500); cu.write(5, 0, "w", H)
raw = np.zeros((len(wg), 6))
for i, wv in enumerate(wg):
    r = 6 + i; x = r + 1; cu.write(r, 0, float(wv), IN)
    for j, (n_, t, k_, *_r) in enumerate(tab):
        col = chr(66 + j); uv = float(u_crra(wv, k_) if t == "CRRA" else u_cara(wv, k_)); raw[i, j] = uv
        cu.write_formula(r, 1 + j, f'=IF({col}$4="CRRA",IF({col}$5=1,LN($A{x}),$A{x}^(1-{col}$5)/(1-{col}$5)),-EXP(-{col}$5*$A{x})/{col}$5)', SCI, uv)
mn = raw.min(0); mx = raw.max(0); last = 6 + len(wg)
for i in range(len(wg)):
    r = 6 + i; x = r + 1
    for j in range(6):
        col = chr(66 + j)
        cu.write_formula(r, 8 + j, f"=({col}{x}-MIN({col}$7:{col}${last}))/(MAX({col}$7:{col}${last})-MIN({col}$7:{col}${last}))", N2, float((raw[i, j] - mn[j]) / (mx[j] - mn[j])))
for fam, cols, pos in (("CRRA", range(8, 11), "A"), ("CARA", range(11, 14), "G")):
    ch = wb.add_chart({"type": "scatter", "subtype": "straight"})
    for cj in cols:
        L = chr(65 + cj); ch.add_series({"name": f"=Curvas!${L}$3", "categories": f"=Curvas!$A$7:$A${last}", "values": f"=Curvas!${L}$7:${L}${last}"})
    ch.set_title({"name": f"Utilidad normalizada {fam}"}); ch.set_x_axis({"name": "Riqueza w"}); ch.set_size({"width": 520, "height": 300}); cu.insert_chart(f"{pos}{last + 3}", ch)
wb.close(); print("xlsx ok")
