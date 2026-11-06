import numpy as np, xlsxwriter
from scipy import stats

wb = xlsxwriter.Workbook("t3_practica.xlsx")
H = wb.add_format({"bold": 1, "bg_color": "#1559A6", "font_color": "white", "border": 1, "align": "center", "valign": "vcenter", "text_wrap": 1})
T = wb.add_format({"bold": 1, "font_size": 14}); I = wb.add_format({"italic": 1, "font_color": "#57667A"})
IN = wb.add_format({"bg_color": "#FFF2CC", "border": 1, "num_format": "#,##0.####"})
N0 = wb.add_format({"border": 1, "num_format": "#,##0"}); N1 = wb.add_format({"border": 1, "num_format": "#,##0.0"}); N2 = wb.add_format({"border": 1, "num_format": "#,##0.00"})
N4 = wb.add_format({"border": 1, "num_format": "0.0000"}); N9 = wb.add_format({"border": 1, "num_format": "0.000000000"}); SC = wb.add_format({"border": 1, "num_format": "0.000E+00"})
TX = wb.add_format({"border": 1}); PCT = wb.add_format({"border": 1, "num_format": "0.0"}); REF = wb.add_format({"border": 1, "num_format": "#,##0", "bg_color": "#E6EEF7", "italic": 1})
Z = stats.norm.ppf(.995)

# ---------------- Datos ----------------
d = wb.add_worksheet("Datos"); d.set_column("A:A", 40); d.set_column("B:B", 14); d.set_column("C:C", 50)
d.write("A1", "Tema 3 · Modelo colectivo — datos generales", T); d.write("A2", "Amarillo = entrada. Luiz Luzuriaga · MUCAF", I)
d.write("A4", "Nivel de confianza p", TX); d.write("B4", 0.995, IN); wb.define_name("p_niv", "=Datos!$B$4")
d.write("A5", "z_p = Φ⁻¹(p)", TX); d.write_formula("B5", "=NORMSINV(p_niv)", N4, Z); wb.define_name("z_p", "=Datos!$B$5")

# ---------------- Fórmulas del colectivo: Caso 1 ----------------
c1 = wb.add_worksheet("Caso1_Auto"); c1.set_column("A:A", 52); c1.set_column("B:B", 18)
c1.write("A1", "Caso 1 · Auto: N ~ Poisson(λ) y X ~ Gamma(α, θ)", T)
for i, (lab, v) in enumerate([("λ (nº esperado de siniestros)", 1200), ("α (forma)", 2), ("θ (escala, €)", 450)]):
    c1.write(2 + i, 0, lab, TX); c1.write(2 + i, 1, v, IN)
lam, a, t = 1200, 2, 450
EX, VX = a * t, a * t ** 2; ES = lam * EX; VS = lam * a * t ** 2 * (1 + a); m3 = lam * a * (a + 1) * (a + 2) * t ** 3; sd = VS ** .5; g = m3 / sd ** 3
rows = [("E(X) = αθ", "=B4*B5", EX, N1), ("Var(X) = αθ²", "=B4*B5^2", VX, N0), ("E(S) = λ·E(X)", "=B3*B6", ES, N0),
        ("Var(S) = λ·E(X²) = λαθ²(1+α)", "=B3*B4*B5^2*(1+B4)", VS, N0), ("SD(S)", "=SQRT(B9)", sd, N1),
        ("μ₃(S) = λ·E(X³) = λα(α+1)(α+2)θ³", "=B3*B4*(B4+1)*(B4+2)*B5^3", m3, SC), ("Asimetría γ", "=B11/B10^3", g, N4),
        ("VaR 99,5 % Normal", "=B8+z_p*B10", ES + Z * sd, N0), ("VaR 99,5 % Normal Power", "=B8+B10*(z_p+B12/6*(z_p^2-1))", ES + sd * (Z + g / 6 * (Z ** 2 - 1)), N0),
        ("Capital Normal = VaR − E(S)", "=B13-B8", Z * sd, N0), ("…como % de E(S)", "=100*B15/B8", 100 * Z * sd / ES, PCT)]
for i, (lab, f, v, fm) in enumerate(rows): c1.write(5 + i, 0, lab, TX); c1.write_formula(5 + i, 1, f, fm, float(v))
c1.write(17, 0, "Referencia (Python/R): VaR exacto por FFT", TX); c1.write(17, 1, 1180040, REF)
c1.write(18, 0, "Normal frente al exacto (%)", TX); c1.write_formula(18, 1, "=100*(B13/B18-1)", PCT, 100 * ((ES + Z * sd) / 1180040 - 1))
c1.write(20, 0, "Con λ = 1.200 la recursión de Panjer desborda en Excel (e^−1200 = 0): se usa FFT en Python/R.", I)

# ---------------- Caso 2: Hogar ----------------
c2 = wb.add_worksheet("Caso2_Hogar"); c2.set_column("A:A", 56); c2.set_column("B:B", 18)
c2.write("A1", "Caso 2 · Hogar: N ~ Binomial Negativa(r, β) y X ~ Pareto(α, θ)", T)
for i, (lab, v) in enumerate([("r (forma)", 50), ("β (escala)", 3), ("α (Pareto)", 4), ("θ (Pareto, €)", 3000)]): c2.write(2 + i, 0, lab, TX); c2.write(2 + i, 1, v, IN)
r, be, al, th = 50, 3, 4, 3000
EN, VN, k3N = r * be, r * be * (1 + be), r * be * (1 + be) * (1 + 2 * be); ex = th / (al - 1); vx = al * th ** 2 / ((al - 1) ** 2 * (al - 2))
ex2 = 2 * th ** 2 / ((al - 1) * (al - 2)); ex3 = 6 * th ** 3 / ((al - 1) * (al - 2) * (al - 3)); m3x = ex3 - 3 * ex * ex2 + 2 * ex ** 3
ES2 = EN * ex; VS2 = EN * vx + VN * ex ** 2; m3s = EN * m3x + 3 * VN * ex * vx + k3N * ex ** 3; sd2 = VS2 ** .5; g2 = m3s / sd2 ** 3
rows = [("E(N) = rβ", "=B3*B4", EN, N0), ("Var(N) = rβ(1+β)", "=B3*B4*(1+B4)", VN, N0), ("κ₃(N) = rβ(1+β)(1+2β)", "=B3*B4*(1+B4)*(1+2*B4)", k3N, N0),
        ("E(X) = θ/(α−1)", "=B6/(B5-1)", ex, N1), ("Var(X) = αθ²/[(α−1)²(α−2)]  (α>2)", "=B5*B6^2/((B5-1)^2*(B5-2))", vx, N0),
        ("E(X²) = 2θ²/[(α−1)(α−2)]", "=2*B6^2/((B5-1)*(B5-2))", ex2, N0), ("E(X³) = 6θ³/[(α−1)(α−2)(α−3)]  (α>3)", "=6*B6^3/((B5-1)*(B5-2)*(B5-3))", ex3, SC),
        ("μ₃(X) = E(X³) − 3E(X)E(X²) + 2E(X)³", "=B13-3*B10*B12+2*B10^3", m3x, SC),
        ("E(S) = E(N)·E(X)", "=B7*B10", ES2, N0), ("Var(S) = E(N)Var(X) + Var(N)E(X)²", "=B7*B11+B8*B10^2", VS2, N0), ("SD(S)", "=SQRT(B16)", sd2, N0),
        ("μ₃(S) = E(N)μ₃(X) + 3Var(N)E(X)Var(X) + κ₃(N)E(X)³", "=B7*B14+3*B8*B10*B11+B9*B10^3", m3s, SC), ("Asimetría γ", "=B18/B17^3", g2, N4),
        ("SD(S)/E(S)", "=B17/B15", sd2 / ES2, N4), ("VaR 99,5 % Normal", "=B15+z_p*B17", ES2 + Z * sd2, N0),
        ("VaR 99,5 % Normal Power", "=B15+B17*(z_p+B19/6*(z_p^2-1))", ES2 + sd2 * (Z + g2 / 6 * (Z ** 2 - 1)), N0), ("VaR/E(S) − 1 (Normal), %", "=100*(B21/B15-1)", 100 * (Z * sd2 / ES2), PCT)]
for i, (lab, f, v, fm) in enumerate(rows): c2.write(6 + i, 0, lab, TX); c2.write_formula(6 + i, 1, f, fm, float(v))
c2.write(24, 0, "Referencia (Python/R): VaR exacto por FFT", TX); c2.write(24, 1, 238300, REF)
c2.write(25, 0, "Normal frente al exacto (%)", TX); c2.write_formula(25, 1, "=100*(B21/B25-1)", PCT, 100 * ((ES2 + Z * sd2) / 238300 - 1))
c2.write(27, 0, "Contraste con el Caso 1: SD/E = 3,5 % en Auto frente a 20 % en Hogar (la diapositiva los llama «similares»).", I)
c2.write("D3", "Frecuencias equivalentes: SD(S)/E(S) Caso 1", TX); c2.write_formula("E3", "=Caso1_Auto!B10/Caso1_Auto!B8", N4, sd / ES)

# ---------------- Segmentos ----------------
sg = wb.add_worksheet("Segmentos"); sg.set_column("A:A", 24); sg.set_column("B:L", 15)
sg.write("A1", "Taller de Excel · cuatro segmentos de Auto Poisson–Gamma (aditividad)", T)
hd = ["Segmento", "λ", "α", "θ (€)", "E[X] = αθ", "E[X²] = α(α+1)θ²", "E[X³]", "E(S) = λE[X]", "Var(S) = λE[X²]", "μ₃(S) = λE[X³]"]
for j, hh in enumerate(hd): sg.write(2, j, hh, H)
sg.set_row(2, 32)
seg = [(300, 2.0, 400), (250, 2.5, 500), (400, 1.8, 350), (250, 2.2, 600)]
E_, V_, M_ = [], [], []
for i, (l, a_, t_) in enumerate(seg):
    r_ = 3 + i; x = r_ + 1; ex_, ex2_, ex3_ = a_ * t_, a_ * (a_ + 1) * t_ ** 2, a_ * (a_ + 1) * (a_ + 2) * t_ ** 3
    sg.write(r_, 0, i + 1, TX); sg.write(r_, 1, l, IN); sg.write(r_, 2, a_, IN); sg.write(r_, 3, t_, IN)
    sg.write_formula(r_, 4, f"=C{x}*D{x}", N1, ex_); sg.write_formula(r_, 5, f"=C{x}*(C{x}+1)*D{x}^2", N0, ex2_); sg.write_formula(r_, 6, f"=C{x}*(C{x}+1)*(C{x}+2)*D{x}^3", SC, ex3_)
    sg.write_formula(r_, 7, f"=B{x}*E{x}", N0, l * ex_); sg.write_formula(r_, 8, f"=B{x}*F{x}", N0, l * ex2_); sg.write_formula(r_, 9, f"=B{x}*G{x}", SC, l * ex3_)
    E_.append(l * ex_); V_.append(l * ex2_); M_.append(l * ex3_)
sg.write(7, 0, "Total cartera", H); sg.write_formula(7, 1, "=SUM(B4:B7)", N0, 1200)
sg.write_formula(7, 7, "=SUM(H4:H7)", N0, sum(E_)); sg.write_formula(7, 8, "=SUM(I4:I7)", N0, sum(V_)); sg.write_formula(7, 9, "=SUM(J4:J7)", SC, sum(M_))
ET, VT, MT = sum(E_), sum(V_), sum(M_); sdT = VT ** .5; gT = MT / sdT ** 3
lab = [("SD(S)", "=SQRT(I8)", sdT, N0), ("Asimetría γ", "=J8/B11^3", gT, N4), ("VaR 99,5 % Normal", "=H8+z_p*B11", ET + Z * sdT, N0),
       ("VaR 99,5 % Normal Power", "=H8+B11*(z_p+B12/6*(z_p^2-1))", ET + sdT * (Z + gT / 6 * (Z ** 2 - 1)), N0)]
for i, (l_, f, v, fm) in enumerate(lab): sg.write(10 + i, 0, l_, TX); sg.write_formula(10 + i, 1, f, fm, float(v))
sg.write(15, 0, "Severidad de la mezcla (pesos λⱼ/λ)", H); sg.write(15, 1, "Valor", H)
mx1 = sum(l * a_ * t_ for l, a_, t_ in seg) / 1200; mx2 = sum(l * a_ * (a_ + 1) * t_ ** 2 for l, a_, t_ in seg) / 1200
sg.write(16, 0, "E[X] de la mezcla", TX); sg.write_formula(16, 1, "=SUMPRODUCT(B4:B7,E4:E7)/B8", N1, mx1)
sg.write(17, 0, "E[X²] de la mezcla", TX); sg.write_formula(17, 1, "=SUMPRODUCT(B4:B7,F4:F7)/B8", N0, mx2)
sg.write(18, 0, "Var(S) = λ·E[X²] (mezcla)", TX); sg.write_formula(18, 1, "=B8*B18", N0, 1200 * mx2)
sg.write(19, 0, "Comprobación: Var(mezcla) − Σ Var(S_j)", TX); sg.write_formula(19, 1, "=B19-I8", N4, 1200 * mx2 - VT)
sg.write(21, 0, "Referencia (Python/R): VaR exacto por FFT", TX); sg.write(21, 1, 1243150, REF)
sg.write(23, 0, "Propiedad: suma de Poisson compuestos independientes = Poisson compuesto con λ=Σλⱼ y severidad mezcla; basta sumar medias y varianzas.", I)

# ---------------- Panjer ----------------
K = 1000; R0 = 9   # filas de datos: k = 0..K en las filas Excel R0+1 .. R0+K+1 (R0 es la fila de cabecera, 1-based)
pj = wb.add_worksheet("Panjer"); pj.set_column("A:A", 30); pj.set_column("B:H", 15)
pj.write("A1", "Recursión de Panjer · N ~ Poisson(λ), X ~ Gamma(α, θ), malla h (clase (a,b,0): a=0, b=λ)", T)
par = [("λ (frecuencia)", 5), ("α (forma)", 2), ("θ (escala, €)", 300), ("h (paso de malla, €)", 10)]
for i, (lab_, v) in enumerate(par): pj.write(2 + i, 0, lab_, TX); pj.write(2 + i, 1, v, IN)
lam_, al_, th_, h_ = 5, 2, 300, 10
fk = np.empty(K + 1); fk[0] = stats.gamma.cdf(h_ / 2, al_, scale=th_)
kk = np.arange(1, K + 1); fk[1:] = stats.gamma.cdf((kk + .5) * h_, al_, scale=th_) - stats.gamma.cdf((kk - .5) * h_, al_, scale=th_)
g = np.zeros(K + 1); g[0] = np.exp(-lam_ * (1 - fk[0])); jf = np.arange(K + 1) * fk
for k in range(1, K + 1): g[k] = lam_ / k * np.sum(jf[1:k + 1] * g[k - 1::-1][:k])
F = np.cumsum(g); s_ = h_ * np.arange(K + 1)
Em = float(np.sum(s_ * g)); Vm = float(np.sum(s_ ** 2 * g) - Em ** 2); vq = {p: h_ * int(np.searchsorted(F, p)) for p in (.5, .9, .95, .99, .995)}
out = [("E(S) teórico = λαθ", "=B3*B4*B5", lam_ * al_ * th_, N2), ("E(S) por Panjer = Σ s·gₖ", f"=SUMPRODUCT(B{R0+2}:B{R0+K+2},D{R0+2}:D{R0+K+2})", Em, N2),
       ("Var(S) teórica = λαθ²(1+α)", "=B3*B4*B5^2*(1+B4)", lam_ * al_ * th_ ** 2 * (1 + al_), N0),
       ("Var(S) por Panjer", f"=SUMPRODUCT(B{R0+2}:B{R0+K+2}^2,D{R0+2}:D{R0+K+2})-E4^2", Vm, N0),
       ("Masa total Σ gₖ", f"=SUM(D{R0+2}:D{R0+K+2})", float(g.sum()), N9)]
for i, (lab_, f, v, fm) in enumerate(out): pj.write(2 + i, 3, lab_, TX); pj.write_formula(2 + i, 4, f, fm, v)
pj.set_column("D:D", 30); pj.set_column("E:E", 16)
pj.write(2 + len(out) + 0, 3, "VaR 90 %", TX); pj.write_formula(7, 4, f'=B6*COUNTIF(E{R0+2}:E{R0+K+2},"<0.9")', N0, vq[.9])
pj.write(8, 3, "VaR 95 %", TX); pj.write_formula(8, 4, f'=B6*COUNTIF(E{R0+2}:E{R0+K+2},"<0.95")', N0, vq[.95])
pj.write(9, 3, "VaR 99,5 % (Datos!p)", TX); pj.write_formula(9, 4, f'=B6*COUNTIF(E{R0+2}:E{R0+K+2},"<"&p_niv)', N0, vq[.995])
# Estructura de columnas de la tabla: A=k  B=s=h·k  C=f_k  D=g_k  E=F_S(s)  F=j·f_j  G=g invertida (auxiliar)
for j, hh in enumerate(["k", "s = h·k (€)", "fₖ (severidad discretizada)", "gₖ = P(S=s)", "F_S(s) = Σ gᵣ", "j·fⱼ", "gₖ invertida (aux.)"]): pj.write(R0, j, hh, H)
pj.set_row(R0, 32)
first, last = R0 + 2, R0 + K + 2   # filas Excel de k=0 y k=K
for k in range(K + 1):
    row = R0 + 1 + k; x = row + 1  # índice 0-based -> fila Excel x
    pj.write(row, 0, k, TX); pj.write_formula(row, 1, f"=$B$6*A{x}", N0, float(s_[k]))
    if k == 0: pj.write_formula(row, 2, "=GAMMADIST($B$6/2,$B$4,$B$5,TRUE)", SC, float(fk[0]))
    else: pj.write_formula(row, 2, f"=GAMMADIST((A{x}+0.5)*$B$6,$B$4,$B$5,TRUE)-GAMMADIST((A{x}-0.5)*$B$6,$B$4,$B$5,TRUE)", SC, float(fk[k]))
    if k == 0: pj.write_formula(row, 3, "=EXP(-$B$3*(1-C{0}))".format(x), SC, float(g[0]))
    else:
        # g_k = (λ/k) · Σ_{j=1..k} j f_j g_{k-j}; la columna G guarda g invertida: fila(G) de g_r = last - r  ->  g_{k-1}..g_0 en G[last-(k-1) .. last]
        pj.write_formula(row, 3, f"=$B$3/A{x}*SUMPRODUCT($F${first+1}:$F${first+k},$G${last-k+1}:$G${last})", SC, float(g[k]))
    pj.write_formula(row, 4, f"=SUM(D${first}:D{x})", N9, float(F[k])); pj.write_formula(row, 5, f"=A{x}*C{x}", SC, float(jf[k]))
    pj.write_formula(row, 6, f"=D{last - k}", SC, float(g[K - k]))   # G en la fila de g_{K-k}... ver nota
ch = wb.add_chart({"type": "line"}); ch.add_series({"name": "F_S(s)", "categories": f"=Panjer!$B${first}:$B${first+1000}", "values": f"=Panjer!$E${first}:$E${first+1000}", "line": {"color": "#1559A6"}})
ch.set_title({"name": "Función de distribución de S (Panjer)"}); ch.set_legend({"none": True}); ch.set_x_axis({"interval_unit": 100, "name": "s (€)"}); ch.set_size({"width": 640, "height": 300}); pj.insert_chart("I11", ch)
ch = wb.add_chart({"type": "line"}); ch.add_series({"name": "g_k", "categories": f"=Panjer!$B${first}:$B${first+1000}", "values": f"=Panjer!$D${first}:$D${first+1000}", "line": {"color": "#9A5B12"}})
ch.set_title({"name": "Probabilidad gₖ = P(S = s)"}); ch.set_legend({"none": True}); ch.set_x_axis({"interval_unit": 100, "name": "s (€)"}); ch.set_size({"width": 640, "height": 300}); pj.insert_chart("I27", ch)
wb.close(); print("xlsx ok")
