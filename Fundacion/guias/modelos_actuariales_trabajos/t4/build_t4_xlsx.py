import numpy as np, xlsxwriter
from scipy import stats

wb = xlsxwriter.Workbook("t4_practica.xlsx")
H = wb.add_format({"bold": 1, "bg_color": "#1559A6", "font_color": "white", "border": 1, "align": "center", "valign": "vcenter", "text_wrap": 1})
T = wb.add_format({"bold": 1, "font_size": 14}); I = wb.add_format({"italic": 1, "font_color": "#57667A"})
IN = wb.add_format({"bg_color": "#FFF2CC", "border": 1, "num_format": "#,##0.####"})
N0 = wb.add_format({"border": 1, "num_format": "#,##0"}); N1 = wb.add_format({"border": 1, "num_format": "#,##0.0"}); N2 = wb.add_format({"border": 1, "num_format": "#,##0.00"})
N4 = wb.add_format({"border": 1, "num_format": "0.0000"}); N6 = wb.add_format({"border": 1, "num_format": "0.000000"}); TX = wb.add_format({"border": 1}); PCT = wb.add_format({"border": 1, "num_format": "0.00"})
OKF = wb.add_format({"border": 1, "align": "center", "bold": 1})

mu, sd = 5e6, 8e5

# ---------------- Datos ----------------
d = wb.add_worksheet("Datos"); d.set_column("A:A", 42); d.set_column("B:B", 16); d.set_column("C:C", 52)
d.write("A1", "Tema 4 · VaR y TVaR — datos generales", T); d.write("A2", "Amarillo = entrada. Luiz Luzuriaga · MUCAF", I)
d.write("A4", "E(S) (€)", TX); d.write("B4", mu, IN); wb.define_name("mu_S", "=Datos!$B$4")
d.write("A5", "σ(S) (€)", TX); d.write("B5", sd, IN); wb.define_name("sd_S", "=Datos!$B$5")
d.write("A6", "Grados de libertad de la t de Student", TX); d.write("B6", 4, IN); wb.define_name("nu_t", "=Datos!$B$6")
d.write("C4", "Caso 1: S ~ Normal(5.000.000; 800.000)", I)

# ---------------- Caso 1: Normal ----------------
c1 = wb.add_worksheet("Caso1_Normal"); c1.set_column("A:A", 12); c1.set_column("B:L", 16)
c1.write("A1", "Caso 1 · VaR y TVaR de una Normal por nivel de confianza (taller de Excel)", T)
hd = ["p", "z_p", "φ(z_p)", "VaR_p", "TVaR_p", "TVaR − VaR", "TVaR/VaR − 1 (%)", "Control NORMINV", "Dif. control", "Capital VaR", "Capital TVaR", "Capital TVaR / VaR − 1 (%)"]
for j, h in enumerate(hd): c1.write(2, j, h, H)
c1.set_row(2, 44)
for i, p in enumerate((.95, .99, .995, .999)):
    r = 3 + i; x = r + 1; z = stats.norm.ppf(p); ph = stats.norm.pdf(z); v = mu + sd * z; t = mu + sd * ph / (1 - p)
    c1.write(r, 0, p, IN); c1.write_formula(r, 1, f"=NORMSINV(A{x})", N6, z); c1.write_formula(r, 2, f"=EXP(-(B{x}^2)/2)/SQRT(2*PI())", N6, ph)
    c1.write_formula(r, 3, f"=mu_S+sd_S*B{x}", N0, v); c1.write_formula(r, 4, f"=mu_S+sd_S*C{x}/(1-A{x})", N0, t); c1.write_formula(r, 5, f"=E{x}-D{x}", N0, t - v)
    c1.write_formula(r, 6, f"=100*(E{x}/D{x}-1)", PCT, 100 * (t / v - 1)); c1.write_formula(r, 7, f"=NORMINV(A{x},mu_S,sd_S)", N0, v); c1.write_formula(r, 8, f"=D{x}-H{x}", N4, 0.0)
    c1.write_formula(r, 9, f"=D{x}-mu_S", N0, v - mu); c1.write_formula(r, 10, f"=E{x}-mu_S", N0, t - mu); c1.write_formula(r, 11, f"=100*(K{x}/J{x}-1)", PCT, 100 * ((t - mu) / (v - mu) - 1))
c1.write(8, 0, "Lectura: la brecha TVaR − VaR decrece con p (334.287 → 221.486) por la cola delgada de la Normal; el TVaR exige un 12,3 % más de capital al 99,5 %. Con colas pesadas la brecha no decrece.", I)
ch = wb.add_chart({"type": "column"}); ch.add_series({"name": "VaR", "categories": "=Caso1_Normal!$A$4:$A$7", "values": "=Caso1_Normal!$D$4:$D$7", "fill": {"color": "#1559A6"}})
ch.add_series({"name": "TVaR", "categories": "=Caso1_Normal!$A$4:$A$7", "values": "=Caso1_Normal!$E$4:$E$7", "fill": {"color": "#9A5B12"}})
ch.set_title({"name": "VaR y TVaR según el nivel de confianza"}); ch.set_y_axis({"min": 5000000, "num_format": "#,##0"}); ch.set_size({"width": 640, "height": 300}); c1.insert_chart("A11", ch)

# ---------------- Log-normal y t ----------------
c2 = wb.add_worksheet("Lognormal_t"); c2.set_column("A:A", 12); c2.set_column("B:L", 16)
c2.write("A1", "Extensión · Log-normal (misma media y varianza) y t de Student", T)
s2 = np.log(1 + (sd / mu) ** 2); s_ = s2 ** .5; m_ = np.log(mu) - s2 / 2
c2.write("A3", "σ_L² = ln[1+(σ/E)²]", TX); c2.write_formula("B3", "=LN(1+(sd_S/mu_S)^2)", N6, s2)
c2.write("A4", "σ_L", TX); c2.write_formula("B4", "=SQRT(B3)", N6, s_); c2.write("A5", "μ_L = ln E − σ_L²/2", TX); c2.write_formula("B5", "=LN(mu_S)-B3/2", N6, m_)
c2.set_column("A:A", 24)
hd = ["p", "VaR Normal", "TVaR Normal", "VaR Log-normal", "TVaR Log-normal", "brecha LN", "TVaR/VaR−1 LN %", "VaR t", "TVaR t", "brecha t", "Capital TVaR LN / Normal − 1 %"]
for j, h in enumerate(hd): c2.write(6, j, h, H)
c2.set_row(6, 44)
nu = 4; sc = sd * np.sqrt((nu - 2) / nu)
for i, p in enumerate((.95, .99, .995, .999, .9999)):
    r = 7 + i; x = r + 1; z = stats.norm.ppf(p); ph = stats.norm.pdf(z)
    vn, tn = mu + sd * z, mu + sd * ph / (1 - p); vl = np.exp(m_ + s_ * z); tl = mu * stats.norm.cdf(s_ - z) / (1 - p)
    tq = stats.t.ppf(p, nu); vt = mu + sc * tq; tt = mu + sc * stats.t.pdf(tq, nu) / (1 - p) * (nu + tq ** 2) / (nu - 1)
    c2.write(r, 0, p, IN)
    c2.write_formula(r, 1, f"=mu_S+sd_S*NORMSINV(A{x})", N0, vn); c2.write_formula(r, 2, f"=mu_S+sd_S*EXP(-(NORMSINV(A{x})^2)/2)/SQRT(2*PI())/(1-A{x})", N0, tn)
    c2.write_formula(r, 3, f"=EXP($B$5+$B$4*NORMSINV(A{x}))", N0, vl); c2.write_formula(r, 4, f"=mu_S*NORMSDIST($B$4-NORMSINV(A{x}))/(1-A{x})", N0, tl)
    c2.write_formula(r, 5, f"=E{x}-D{x}", N0, tl - vl); c2.write_formula(r, 6, f"=100*(E{x}/D{x}-1)", PCT, 100 * (tl / vl - 1))
    tqf = f"TINV(2*(1-A{x}),nu_t)"
    c2.write_formula(r, 7, f"=mu_S+sd_S*SQRT((nu_t-2)/nu_t)*{tqf}", N0, vt)
    tpdf = f"EXP(GAMMALN((nu_t+1)/2)-GAMMALN(nu_t/2))/SQRT(nu_t*PI())*(1+{tqf}^2/nu_t)^(-(nu_t+1)/2)"
    c2.write_formula(r, 8, f"=mu_S+sd_S*SQRT((nu_t-2)/nu_t)*{tpdf}/(1-A{x})*(nu_t+{tqf}^2)/(nu_t-1)", N0, tt)
    c2.write_formula(r, 9, f"=I{x}-H{x}", N0, tt - vt); c2.write_formula(r, 10, f"=100*((E{x}-mu_S)/(C{x}-mu_S)-1)", PCT, 100 * ((tl - mu) / (tn - mu) - 1))
c2.write(13, 0, "Al 99,5 %: capital VaR Log-normal = +18,2 % y capital TVaR = +22,2 % sobre la Normal; TVaR/VaR del capital sube del 12,3 % al 16,1 %. La brecha de la t crece con p; la de la Normal y la de esta Log-normal suave decrecen.", I)

# ---------------- Bonos ----------------
bn = wb.add_worksheet("Bonos"); bn.set_column("A:A", 38); bn.set_column("B:K", 14)
bn.write("A1", "Dos bonos con q = 2 %, pérdida 100: VaR no subaditivo, TVaR subaditivo", T)
for i, (lab, v) in enumerate([("q (probabilidad de impago)", .02), ("L (pérdida en impago)", 100), ("p (nivel)", .975)]): bn.write(2 + i, 0, lab, TX); bn.write(2 + i, 1, v, IN)
q, L, p = .02, 100, .975
vi = 100 if q > 1 - p else 0; ti = vi + (q * L if vi == 0 else 0) / (1 - p)
bn.write(5, 0, "VaR individual", TX); bn.write_formula(5, 1, "=IF(B3>1-B5,B4,0)", N1, vi)
bn.write(6, 0, "TVaR individual", TX); bn.write_formula(6, 1, "=B6+IF(B6=0,B3*B4,0)/(1-B5)", N1, ti)
bn.write(7, 0, "ρ* a partir del cual VaR(A+B) cae a 0", TX)
rho_star = (2 * q - (1 - p) - q ** 2) / (q * (1 - q)); bn.write_formula(7, 1, "=(2*B3-(1-B5)-B3^2)/(B3*(1-B3))", N4, rho_star)
bn.write(8, 0, "Rango admisible de ρ: [−q/(1−q), 1]", TX); bn.write_formula(8, 1, "=-B3/(1-B3)", N4, -q / (1 - q))
for j, h in enumerate(["ρ", "P(A y B)", "P(S>0)", "VaR A+B", "VaR A + VaR B", "TVaR A+B", "TVaR A + TVaR B", "Beneficio TVaR", "¿VaR subaditivo?"]): bn.write(10, j, h, H)
bn.set_row(10, 32)
rhos = [0, .05, .1, .15, .2, .25, .3, .35, .4, .45, .5, .55, .6, .65, .7, .75, .8, .85, .9, .95, 1.0]
for i, rho in enumerate(rhos):
    r = 11 + i; x = r + 1; p11 = q ** 2 + rho * q * (1 - q); ps0 = 2 * q - p11
    v = 200 if p11 > 1 - p else (100 if ps0 > 1 - p else 0); t = v + (200 * q if v == 0 else (100 * p11 if v == 100 else 0)) / (1 - p)
    bn.write(r, 0, rho, IN); bn.write_formula(r, 1, f"=$B$3^2+A{x}*$B$3*(1-$B$3)", N6, p11); bn.write_formula(r, 2, f"=2*$B$3-B{x}", N6, ps0)
    bn.write_formula(r, 3, f"=IF(B{x}>1-$B$5,2*$B$4,IF(C{x}>1-$B$5,$B$4,0))", N1, v); bn.write_formula(r, 4, "=2*$B$6", N1, 2 * vi)
    bn.write_formula(r, 5, f"=D{x}+IF(D{x}=0,2*$B$3*$B$4,IF(D{x}=$B$4,$B$4*B{x},0))/(1-$B$5)", N1, t); bn.write_formula(r, 6, "=2*$B$7", N1, 2 * ti)
    bn.write_formula(r, 7, f"=G{x}-F{x}", N1, 2 * ti - t); bn.write_formula(r, 8, f'=IF(D{x}<=E{x},"Sí","No")', OKF, "Sí" if v <= 2 * vi else "No")
last = 11 + len(rhos)
for nm, col, color in (("VaR A+B", "D", "#B3261E"), ("TVaR A+B", "F", "#1559A6")):
    ch = wb.add_chart({"type": "scatter", "subtype": "straight_with_markers"})
    ch.add_series({"name": nm, "categories": f"=Bonos!$A$12:$A${last}", "values": f"=Bonos!${col}$12:${col}${last}", "line": {"color": color}})
    ch.set_title({"name": f"{nm} según ρ"}); ch.set_x_axis({"name": "ρ"}); ch.set_size({"width": 520, "height": 280}); ch.set_legend({"none": True}); bn.insert_chart("K3" if nm == "VaR A+B" else "K18", ch)

# ---------------- Crédito ----------------
cr = wb.add_worksheet("Credito"); cr.set_column("A:A", 46); cr.set_column("B:C", 16)
cr.write("A1", "Caso 2 · Diversificación de crédito en un banco (50 M€ cada cartera, q = 1,5 %, p = 98 %)", T)
for i, (lab, v) in enumerate([("Exposición E (M€)", 50), ("q (probabilidad de impago)", .015), ("p (nivel)", .98)]): cr.write(2 + i, 0, lab, TX); cr.write(2 + i, 1, v, IN)
E_, q_, p_ = 50, .015, .98
p2, p1, p0 = q_ ** 2, 2 * q_ * (1 - q_), (1 - q_) ** 2; vAB = 2 * E_ if p2 > 1 - p_ else (E_ if 1 - p0 > 1 - p_ else 0); tAB = vAB + (E_ * p1 + 2 * E_ * p2 if vAB == 0 else (E_ * p2 if vAB == E_ else 0)) / (1 - p_)
cr.write(6, 0, "P(ambas impagan)", TX); cr.write_formula(6, 1, "=B4^2", N6, p2)
cr.write(7, 0, "P(sólo una impaga)", TX); cr.write_formula(7, 1, "=2*B4*(1-B4)", N6, p1)
cr.write(8, 0, "P(al menos una impaga)", TX); cr.write_formula(8, 1, "=1-(1-B4)^2", N6, 1 - p0)
cr.write(9, 0, "VaR individual (A o B)", TX); cr.write_formula(9, 1, "=IF(B4>1-B5,B3,0)", N2, 0.0)
cr.write(10, 0, "TVaR individual = q·E/(1−p)", TX); cr.write_formula(10, 1, "=B10+IF(B10=0,B4*B3,0)/(1-B5)", N2, q_ * E_ / (1 - p_))
cr.write(11, 0, "VaR consolidado", TX); cr.write_formula(11, 1, "=IF(B7>1-B5,2*B3,IF(B9>1-B5,B3,0))", N2, vAB)
cr.write(12, 0, "TVaR consolidado", TX); cr.write_formula(12, 1, "=B12+IF(B12=0,B3*B8+2*B3*B7,IF(B12=B3,B3*B7,0))/(1-B5)", N4, tAB)
cr.write(13, 0, "VaR(A)+VaR(B)", TX); cr.write_formula(13, 1, "=2*B10", N2, 0.0)
cr.write(14, 0, "TVaR(A)+TVaR(B)", TX); cr.write_formula(14, 1, "=2*B11", N2, 2 * q_ * E_ / (1 - p_))
cr.write(15, 0, "¿VaR subaditivo? (VaR consolidado ≤ suma)", TX); cr.write_formula(15, 1, '=IF(B12<=B14,"Sí","No")', OKF, "No")
cr.write(16, 0, "¿TVaR subaditivo?", TX); cr.write_formula(16, 1, '=IF(B13<=B15,"Sí","No")', OKF, "Sí")
cr.write(17, 0, "Beneficio de diversificación (TVaR)", TX); cr.write_formula(17, 1, "=B15-B13", N4, 2 * q_ * E_ / (1 - p_) - tAB)

# ---------------- Euler ----------------
eu = wb.add_worksheet("Euler"); eu.set_column("A:A", 40); eu.set_column("B:F", 16)
eu.write("A1", "Asignación de capital: contribuciones de Euler al TVaR (Normal conjunta)", T)
for i, (lab, v) in enumerate([("μ_A", 3), ("σ_A", .5), ("μ_B", 2), ("σ_B", .4), ("ρ", .3), ("p", .995)]): eu.write(2 + i, 0, lab, TX); eu.write(2 + i, 1, v, IN)
mA, sA, mB, sB, rho, pp = 3, .5, 2, .4, .3, .995; z = stats.norm.ppf(pp); k = stats.norm.pdf(z) / (1 - pp); sS = np.sqrt(sA ** 2 + sB ** 2 + 2 * rho * sA * sB)
covA, covB = sA ** 2 + rho * sA * sB, sB ** 2 + rho * sA * sB
rows = [("z_p", "=NORMSINV(B8)", z, N6), ("φ(z_p)/(1−p)", "=EXP(-(B9^2)/2)/SQRT(2*PI())/(1-B8)", k, N6), ("σ_S", "=SQRT(B4^2+B6^2+2*B7*B4*B6)", sS, N4),
        ("Cov(A,S)", "=B4^2+B7*B4*B6", covA, N4), ("Cov(B,S)", "=B6^2+B7*B4*B6", covB, N4)]
for i, (lab, f, v, fm) in enumerate(rows): eu.write(8 + i, 0, lab, TX); eu.write_formula(8 + i, 1, f, fm, float(v))
eu.write(14, 0, "VaR(S) = μ_S + σ_S·z", TX); eu.write_formula(14, 1, "=B3+B5+B11*B9", N4, mA + mB + sS * z)
eu.write(15, 0, "TVaR(S) = μ_S + σ_S·φ/(1−p)", TX); eu.write_formula(15, 1, "=B3+B5+B11*B10", N4, mA + mB + sS * k)
for j, h in enumerate(["Línea", "TVaR individual", "Contribución Cᵢ", "Diversificación asignada"]): eu.write(17, j, h, H)
vals = [("A", mA + sA * k, mA + covA / sS * k), ("B", mB + sB * k, mB + covB / sS * k)]
eu.write(18, 0, "A", TX); eu.write_formula(18, 1, "=B3+B4*B10", N4, vals[0][1]); eu.write_formula(18, 2, "=B3+B12/B11*B10", N4, vals[0][2]); eu.write_formula(18, 3, "=B19-C19", N4, vals[0][1] - vals[0][2])
eu.write(19, 0, "B", TX); eu.write_formula(19, 1, "=B5+B6*B10", N4, vals[1][1]); eu.write_formula(19, 2, "=B5+B13/B11*B10", N4, vals[1][2]); eu.write_formula(19, 3, "=B20-C20", N4, vals[1][1] - vals[1][2])
eu.write(20, 0, "A+B", H); eu.write_formula(20, 1, "=B19+B20", N4, vals[0][1] + vals[1][1]); eu.write_formula(20, 2, "=C19+C20", N4, vals[0][2] + vals[1][2]); eu.write_formula(20, 3, "=D19+D20", N4, sum(v[1] - v[2] for v in vals))
eu.write(22, 0, "Comprobación: Σ Cᵢ − TVaR(S)", TX); eu.write_formula(22, 1, "=C21-B16", N6, 0.0)

# ---------------- Fórmula estándar ----------------
sc_ = wb.add_worksheet("SCR_agregacion"); sc_.set_column("A:A", 28); sc_.set_column("B:G", 14)
sc_.write("A1", "Fórmula estándar de Solvencia II: SCR = √(Σᵢ Σⱼ Corrᵢⱼ·SCRᵢ·SCRⱼ)", T)
mods = ["Mercado", "Contraparte", "Vida", "No Vida"]; v = np.array([100., 20., 50., 80.])
C = np.array([[1, .25, .25, .25], [.25, 1, .25, .5], [.25, .25, 1, 0], [.25, .5, 0, 1]])
sc_.write(2, 0, "Módulo", H); sc_.write(2, 1, "SCRᵢ", H)
for i, m in enumerate(mods): sc_.write(3 + i, 0, m, TX); sc_.write(3 + i, 1, v[i], IN); sc_.write(2, 2 + i, m, H);
for i in range(4):
    for j in range(4): sc_.write(3 + i, 2 + j, C[i, j], IN)
sc_.write(8, 0, "Matriz Corrᵢⱼ·SCRᵢ·SCRⱼ", H)
for i in range(4):
    for j in range(4):
        sc_.write_formula(9 + i, 2 + j, f"={chr(67+j)}{4+i}*$B${4+i}*$B${4+j}", N1, float(C[i, j] * v[i] * v[j]))
tot = np.sqrt(np.sum(C * np.outer(v, v)))
sc_.write(14, 0, "Σ Corrᵢⱼ SCRᵢ SCRⱼ", TX); sc_.write_formula(14, 1, "=SUM(C10:F13)", N1, float(np.sum(C * np.outer(v, v))))
sc_.write(15, 0, "SCR agregado", TX); sc_.write_formula(15, 1, "=SQRT(B15)", N2, float(tot))
sc_.write(16, 0, "Suma sin diversificar", TX); sc_.write_formula(16, 1, "=SUM(B4:B7)", N1, float(v.sum()))
sc_.write(17, 0, "Beneficio de diversificación %", TX); sc_.write_formula(17, 1, "=100*(1-B16/B17)", PCT, float(100 * (1 - tot / v.sum())))
sc_.write(19, 0, "Ejemplo de la diapositiva (2 riesgos)", H); sc_.write(20, 0, "SCR₁, SCR₂, Corr", TX); sc_.write(20, 1, 100, IN); sc_.write(20, 2, 80, IN); sc_.write(20, 3, .25, IN)
sc_.write(21, 0, "SCR agregado", TX); sc_.write_formula(21, 1, "=SQRT(B21^2+C21^2+2*D21*B21*C21)", N2, float(np.sqrt(100 ** 2 + 80 ** 2 + 2 * .25 * 100 * 80)))
sc_.write(22, 0, "Reducción frente a 180 (%)", TX); sc_.write_formula(22, 1, "=100*(B22/(B21+C21)-1)", PCT, float(100 * (np.sqrt(20400) / 180 - 1)))
sc_.write(24, 0, "Exacta solo bajo normalidad; con dependencia en la cola el SCR real puede ser algo mayor (Python/R: −8 % a +5 % según σ y cópula).", I)
wb.close(); print("xlsx ok")
