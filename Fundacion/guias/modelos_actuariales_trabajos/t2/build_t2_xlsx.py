import numpy as np, xlsxwriter
from scipy import stats
from core import aprox, exacta, cuantil

wb = xlsxwriter.Workbook("t2_practica.xlsx")
H = wb.add_format({"bold": 1, "bg_color": "#1559A6", "font_color": "white", "border": 1, "align": "center", "valign": "vcenter", "text_wrap": 1})
T = wb.add_format({"bold": 1, "font_size": 14}); I = wb.add_format({"italic": 1, "font_color": "#57667A"})
IN = wb.add_format({"bg_color": "#FFF2CC", "border": 1, "num_format": "#,##0.####"})
N0 = wb.add_format({"border": 1, "num_format": "#,##0"}); N1 = wb.add_format({"border": 1, "num_format": "#,##0.0"})
N4 = wb.add_format({"border": 1, "num_format": "0.0000"}); N6 = wb.add_format({"border": 1, "num_format": "0.000000"}); SC = wb.add_format({"border": 1, "num_format": "0.000E+00"})
PCT = wb.add_format({"border": 1, "num_format": "0.0"}); TX = wb.add_format({"border": 1}); REF = wb.add_format({"border": 1, "num_format": "#,##0", "bg_color": "#E6EEF7", "italic": 1})
Z = stats.norm.ppf(0.995)

def nombre(ws, ref, nm): wb.define_name(nm, f"='{ws.get_name()}'!{ref}")

# ---------------- Datos ----------------
d = wb.add_worksheet("Datos"); d.set_column("A:A", 44); d.set_column("B:B", 14); d.set_column("C:C", 60)
d.write("A1", "Tema 2 · Modelo individual — datos generales", T)
d.write("A2", "Amarillo = entrada. Luiz Luzuriaga · MUCAF · todo el libro se recalcula con fórmulas.", I)
d.write("A4", "Nivel de confianza p", TX); d.write("B4", 0.995, IN); nombre(d, "$B$4", "p_niv")
d.write("A5", "z_p = Φ⁻¹(p)", TX); d.write_formula("B5", "=NORMSINV(p_niv)", N6, Z); nombre(d, "$B$5", "z_p")
d.write("C4", "Solvencia II: VaR al 99,5 % a un año", I)

def aprox_block(ws, r0, E, V, M3, fE, fV, fM3, fmt_cols=None, titulo="Aproximaciones al VaR"):
    """Escribe SD, asimetría, α, β, k, Normal, Gamma trasladada y Normal Power a partir de celdas de E, V, μ3."""
    ap = aprox(*fE[1:2] and (E, V, M3))
    rows = [("SD(S) = √Var", f"=SQRT({fV})", ap["sd"], N1), ("Asimetría γ = μ₃/SD³", f"={fM3}/SQRT({fV})^3", ap["g"], N4),
            ("α = 4/γ²", f"=4/B{r0+2}^2", ap["alpha"], N6), ("β (tasa) = 2/(SD·γ)", f"=2/(B{r0+1}*B{r0+2})", ap["beta"], SC),
            ("k = E − 2·SD/γ", f"={fE}-2*B{r0+1}/B{r0+2}", ap["k"], N1),
            ("VaR Normal = E + z·SD", f"={fE}+z_p*B{r0+1}", ap["normal"], N1),
            ("VaR Gamma trasladada = k + Γ⁻¹(p; α, 1/β)", f"=B{r0+5}+GAMMAINV(p_niv,B{r0+3},1/B{r0+4})", ap["gamma"], N1),
            ("VaR Normal Power = E + SD[z + γ/6 (z²−1)]", f"={fE}+B{r0+1}*(z_p+B{r0+2}/6*(z_p^2-1))", ap["np"], N1)]
    ws.write(r0 - 1, 0, titulo, H); ws.write(r0 - 1, 1, "Valor", H)
    for i, (lab, f, v, fm) in enumerate(rows):
        ws.write(r0 + i, 0, lab, TX); ws.write_formula(r0 + i, 1, f, fm, float(v))
    return ap

# ---------------- Cartera de 8 pólizas ----------------
c8 = wb.add_worksheet("Cartera8"); c8.set_column("A:A", 44); c8.set_column("B:G", 16)
c8.write("A1", "Taller de Excel · cartera de 8 pólizas de vida (severidad degenerada)", T)
for j, h in enumerate(["Póliza", "qᵢ", "bᵢ (SA, €)", "E(Xᵢ) = qᵢbᵢ", "Var(Xᵢ) = qᵢ(1−qᵢ)bᵢ²", "μ₃(Xᵢ) = bᵢ³qᵢ(1−qᵢ)(1−2qᵢ)", "uᵢ = bᵢ/10.000"]): c8.write(2, j, h, H)
c8.set_row(2, 44)
q8 = np.array([.0015, .002, .0025, .003, .004, .005, .006, .008]); b8 = np.array([120e3, 150e3, 100e3, 200e3, 80e3, 250e3, 90e3, 300e3])
for i in range(8):
    r = 3 + i; x = r + 1
    c8.write(r, 0, i + 1, TX); c8.write(r, 1, q8[i], IN); c8.write(r, 2, b8[i], IN)
    c8.write_formula(r, 3, f"=B{x}*C{x}", N1, q8[i] * b8[i]); c8.write_formula(r, 4, f"=B{x}*(1-B{x})*C{x}^2", N0, q8[i] * (1 - q8[i]) * b8[i] ** 2)
    c8.write_formula(r, 5, f"=C{x}^3*B{x}*(1-B{x})*(1-2*B{x})", N0, b8[i] ** 3 * q8[i] * (1 - q8[i]) * (1 - 2 * q8[i])); c8.write_formula(r, 6, f"=C{x}/10000", N0, b8[i] / 1e4)
E8 = (q8 * b8).sum(); V8 = (q8 * (1 - q8) * b8 ** 2).sum(); M8 = (b8 ** 3 * q8 * (1 - q8) * (1 - 2 * q8)).sum()
c8.write(11, 0, "Total cartera", H); c8.write_formula(11, 3, "=SUM(D4:D11)", N1, E8); c8.write_formula(11, 4, "=SUM(E4:E11)", N0, V8); c8.write_formula(11, 5, "=SUM(F4:F11)", N0, M8)
ap8 = aprox_block(c8, 14, E8, V8, M8, "D12", "E12", "F12", titulo="Cálculo del capital (p = 99,5 %)")
P8 = exacta(q8, b8, 10000); v8 = cuantil(P8, 10000, .995)
c8.write(24, 0, "VaR exacto (convolución, hoja Exacta8)", TX); c8.write_formula(24, 1, "=Exacta8!M3", N0, v8)
c8.write(26, 0, "Comparación", H); c8.write(26, 1, "VaR 99,5 %", H); c8.write(26, 2, "Capital = VaR − E(S)", H); c8.write(26, 3, "Δ vs Normal", H)
for i, (nm, ref, val) in enumerate([("Normal (TCL)", "B20", ap8["normal"]), ("Gamma trasladada", "B21", ap8["gamma"]), ("Normal Power", "B22", ap8["np"]), ("Exacta", "B25", v8)]):
    r = 27 + i; x = r + 1; c8.write(r, 0, nm, TX); c8.write_formula(r, 1, f"={ref}", N1, float(val)); c8.write_formula(r, 2, f"=B{x}-$D$12", N1, float(val - E8)); c8.write_formula(r, 3, f"=B{x}-$B$28", N1, float(val - ap8["normal"]))
ch = wb.add_chart({"type": "column"}); ch.add_series({"name": "VaR 99,5 %", "categories": "=Cartera8!$A$28:$A$31", "values": "=Cartera8!$B$28:$B$31", "fill": {"color": "#1559A6"}})
ch.set_title({"name": "VaR 99,5 %: aproximaciones frente a la distribución exacta"}); ch.set_legend({"none": True}); ch.set_size({"width": 640, "height": 300}); c8.insert_chart("F14", ch)

# ---------------- Exacta8 (convolución) ----------------
ex = wb.add_worksheet("Exacta8"); ex.set_column("A:M", 12)
ex.write("A1", "Distribución exacta de S (cartera de 8 pólizas) por convolución recursiva, rejilla de 10.000 €", T)
ex.write("L2", "VaR exacto →", H); ex.write("L3", "VaR 99,5 %", TX); ex.write_formula("M3", '=10000*COUNTIF(K5:K134,"<"&p_niv)', N0, v8)
ex.write("A2", "Columna k: Pₖ(s) = (1−qₖ)·Pₖ₋₁(s) + qₖ·Pₖ₋₁(s−uₖ)  (u = capital/10.000). s = nº de unidades de 10.000 €.", I)
ex.write(3, 0, "s", H); ex.write(3, 1, "P₀", H)
for k in range(8): ex.write(3, 2 + k, f"tras póliza {k+1}", H)
ex.write(3, 10, "F(s) = P(S ≤ s·10.000)", H); ex.set_row(3, 32)
u8 = (b8 / 1e4).round().astype(int); S_ = len(P8)  # 130
Pk = [np.eye(1, S_, 0).ravel()]
for k in range(8):
    prev = Pk[-1]; new = prev * (1 - q8[k]); new[u8[k]:] += q8[k] * prev[:S_ - u8[k]]; Pk.append(new)
cdf = np.cumsum(Pk[-1])
for s in range(S_):
    r = 4 + s; x = r + 1; ex.write(r, 0, s, TX); ex.write_formula(r, 1, f"=IF(A{x}=0,1,0)", SC, float(Pk[0][s]))
    for k in range(8):
        col = chr(66 + k); nxt = chr(67 + k); uk = f"Cartera8!$G${4+k}"; qk = f"Cartera8!$B${4+k}"
        ex.write_formula(r, 2 + k, f"=(1-{qk})*{col}{x}+{qk}*IF(A{x}>={uk},INDEX({col}$5:{col}$134,A{x}-{uk}+1),0)", SC, float(Pk[k + 1][s]))
    ex.write_formula(r, 10, f"=SUM(J$5:J{x})", N6, float(cdf[s]))
ch = wb.add_chart({"type": "column"}); ch.add_series({"name": "P(S = s·10.000)", "categories": "=Exacta8!$A$5:$A$60", "values": "=Exacta8!$J$5:$J$60", "fill": {"color": "#1559A6"}})
ch.set_title({"name": "Distribución exacta de S (primeras 55 unidades)"}); ch.set_y_axis({"log_base": 10, "min": 1e-9, "max": 1}); ch.set_legend({"none": True}); ch.set_size({"width": 640, "height": 300}); ex.insert_chart("L6", ch)

# ---------------- Caso 1 ----------------
k1 = wb.add_worksheet("Caso1_Vida"); k1.set_column("A:A", 44); k1.set_column("B:I", 16)
k1.write("A1", "Caso 1 · Cartera de Vida de 1.000 pólizas en 4 grupos homogéneos", T)
for j, h in enumerate(["Grupo", "Nº pólizas", "qᵢ", "bᵢ (€)", "E del grupo", "Var del grupo", "μ₃ del grupo", "% de Var", "% de E"]): k1.write(2, j, h, H)
n1 = np.array([500, 300, 150, 50.]); q1 = np.array([.002, .004, .006, .010]); b1 = np.array([1e5, 1.5e5, 2e5, 3e5])
e1 = n1 * q1 * b1; v1 = n1 * q1 * (1 - q1) * b1 ** 2; m1_ = n1 * b1 ** 3 * q1 * (1 - q1) * (1 - 2 * q1)
for i in range(4):
    r = 3 + i; x = r + 1; k1.write(r, 0, "ABCD"[i], TX); k1.write(r, 1, n1[i], IN); k1.write(r, 2, q1[i], IN); k1.write(r, 3, b1[i], IN)
    k1.write_formula(r, 4, f"=B{x}*C{x}*D{x}", N0, e1[i]); k1.write_formula(r, 5, f"=B{x}*C{x}*(1-C{x})*D{x}^2", N0, v1[i]); k1.write_formula(r, 6, f"=B{x}*D{x}^3*C{x}*(1-C{x})*(1-2*C{x})", SC, m1_[i])
    k1.write_formula(r, 7, f"=100*F{x}/F$8", PCT, 100 * v1[i] / v1.sum()); k1.write_formula(r, 8, f"=100*E{x}/E$8", PCT, 100 * e1[i] / e1.sum())
k1.write(7, 0, "Total", H); k1.write_formula(7, 4, "=SUM(E4:E7)", N0, e1.sum()); k1.write_formula(7, 5, "=SUM(F4:F7)", N0, v1.sum()); k1.write_formula(7, 6, "=SUM(G4:G7)", SC, m1_.sum())
ap1 = aprox_block(k1, 11, e1.sum(), v1.sum(), m1_.sum(), "E8", "F8", "G8", titulo="Aproximaciones (p = 99,5 %)")
k1.write(21, 0, "Capital de riesgo Normal = VaR − E(S)", TX); k1.write_formula(21, 1, "=B17-E8", N0, ap1["normal"] - e1.sum())
k1.write(22, 0, "…como % de la prima de riesgo esperada", TX); k1.write_formula(22, 1, "=100*B22/E8", PCT, 100 * (ap1["normal"] - e1.sum()) / e1.sum())
k1.write(24, 0, "Referencias calculadas en Python y R (fuera de Excel)", H); k1.write(24, 1, "VaR 99,5 %", H)
k1.write(25, 0, "Distribución exacta (convolución de 4 binomiales)", TX); k1.write(25, 1, 1700000, REF)
k1.write(26, 0, "Monte Carlo, 100.000 escenarios, semilla 123", TX); k1.write(26, 1, 1650000, REF)
k1.write(27, 0, "Normal (enunciado) infravalora frente al exacto en %", TX); k1.write_formula(27, 1, "=100*(B17/B26-1)", PCT, 100 * (ap1["normal"] / 1.7e6 - 1))
k1.write(29, 0, "La rejilla es de 50.000 €; el exacto y la simulación caen en escalones contiguos. La diapositiva muestra ≈1.486.900 para el Monte Carlo, valor no reproducible.", I)

# ---------------- Caso 2 ----------------
k2 = wb.add_worksheet("Caso2_Accidentes"); k2.set_column("A:A", 44); k2.set_column("B:I", 16)
k2.write("A1", "Caso 2 · Accidentes personales, severidad uniforme Bᵢ ~ U(0, Mᵢ)", T)
for j, h in enumerate(["Segmento", "Nº pólizas", "qᵢ", "Mᵢ (€)", "E[X] = q·M/2", "E[X²] = q·M²/3", "E[X³] = q·M³/4", "E del seg.", "Var del seg.", "μ₃ del seg."]): k2.write(2, j, h, H)
n2 = np.array([100, 200, 50.]); q2 = np.array([.05, .06, .08]); M2 = np.array([5e3, 8e3, 12e3])
a1, a2, a3 = q2 * M2 / 2, q2 * M2 ** 2 / 3, q2 * M2 ** 3 / 4; e2 = n2 * a1; v2 = n2 * (a2 - a1 ** 2); m2_ = n2 * (a3 - 3 * a1 * a2 + 2 * a1 ** 3)
for i in range(3):
    r = 3 + i; x = r + 1; k2.write(r, 0, i + 1, TX); k2.write(r, 1, n2[i], IN); k2.write(r, 2, q2[i], IN); k2.write(r, 3, M2[i], IN)
    k2.write_formula(r, 4, f"=C{x}*D{x}/2", N1, a1[i]); k2.write_formula(r, 5, f"=C{x}*D{x}^2/3", N0, a2[i]); k2.write_formula(r, 6, f"=C{x}*D{x}^3/4", N0, a3[i])
    k2.write_formula(r, 7, f"=B{x}*E{x}", N0, e2[i]); k2.write_formula(r, 8, f"=B{x}*(F{x}-E{x}^2)", N0, v2[i]); k2.write_formula(r, 9, f"=B{x}*(G{x}-3*E{x}*F{x}+2*E{x}^3)", SC, m2_[i])
k2.write(6, 0, "Total", H); k2.write_formula(6, 7, "=SUM(H4:H6)", N0, e2.sum()); k2.write_formula(6, 8, "=SUM(I4:I6)", N0, v2.sum()); k2.write_formula(6, 9, "=SUM(J4:J6)", SC, m2_.sum())
ap2 = aprox_block(k2, 10, e2.sum(), v2.sum(), m2_.sum(), "H7", "I7", "J7", titulo="Aproximaciones (p = 99,5 %)")
k2.write(19, 0, "VaR/E(S) con la Normal", TX); k2.write_formula(19, 1, "=B16/H7", N4, ap2["normal"] / e2.sum())
k2.write(21, 0, "Referencia Monte Carlo (Python, semilla 123)", TX); k2.write(21, 1, 145107, REF)
k2.write(22, 0, "Normal frente a Monte Carlo en %", TX); k2.write_formula(22, 1, "=100*(B16/B22-1)", PCT, 100 * (ap2["normal"] / 145107 - 1))

# ---------------- 3 pólizas ----------------
c3 = wb.add_worksheet("Ejemplo3"); c3.set_column("A:A", 44); c3.set_column("B:F", 16)
c3.write("A1", "Ejemplo de las diapositivas · 3 pólizas de vida", T)
for j, h in enumerate(["Póliza", "qᵢ", "bᵢ", "E", "Var", "μ₃"]): c3.write(2, j, h, H)
q3 = np.array([.01, .02, .03]); b3 = np.array([1e5, 1.5e5, 2e5])
for i in range(3):
    r = 3 + i; x = r + 1; c3.write(r, 0, i + 1, TX); c3.write(r, 1, q3[i], IN); c3.write(r, 2, b3[i], IN)
    c3.write_formula(r, 3, f"=B{x}*C{x}", N0, q3[i] * b3[i]); c3.write_formula(r, 4, f"=B{x}*(1-B{x})*C{x}^2", N0, q3[i] * (1 - q3[i]) * b3[i] ** 2); c3.write_formula(r, 5, f"=C{x}^3*B{x}*(1-B{x})*(1-2*B{x})", SC, b3[i] ** 3 * q3[i] * (1 - q3[i]) * (1 - 2 * q3[i]))
E3, V3, M3 = (q3 * b3).sum(), (q3 * (1 - q3) * b3 ** 2).sum(), (b3 ** 3 * q3 * (1 - q3) * (1 - 2 * q3)).sum()
c3.write(6, 0, "Total", H); c3.write_formula(6, 3, "=SUM(D4:D6)", N0, E3); c3.write_formula(6, 4, "=SUM(E4:E6)", N0, V3); c3.write_formula(6, 5, "=SUM(F4:F6)", SC, M3)
c3.write(8, 0, "SD · asimetría", TX); c3.write_formula(8, 1, "=SQRT(E7)", N1, V3 ** .5); c3.write_formula(8, 2, "=F7/SQRT(E7)^3", N4, M3 / V3 ** 1.5)
for j, h in enumerate(["Nivel p", "Normal", "Gamma tras.", "Normal Power", "Exacto (Python)"]): c3.write(10, j, h, H)
P3 = exacta(q3, b3, 50000)
for i, p in enumerate((.90, .95, .995)):
    r = 11 + i; x = r + 1; a = aprox(E3, V3, M3, p); c3.write(r, 0, p, IN)
    c3.write_formula(r, 1, f"=$D$7+NORMSINV(A{x})*$B$9", N0, a["normal"])
    c3.write_formula(r, 2, f"=($D$7-2*$B$9/$C$9)+GAMMAINV(A{x},4/$C$9^2,$B$9*$C$9/2)", N0, a["gamma"])
    c3.write_formula(r, 3, f"=$D$7+$B$9*(NORMSINV(A{x})+$C$9/6*(NORMSINV(A{x})^2-1))", N0, a["np"]); c3.write(r, 4, cuantil(P3, 50000, p), REF)
c3.write(15, 0, "P(S = 0) = Π(1−qᵢ) (la distribución es casi toda masa en 0)", TX); c3.write_formula(15, 1, "=(1-B4)*(1-B5)*(1-B6)", N4, float(np.prod(1 - q3)))

# ---------------- Escala ----------------
es = wb.add_worksheet("Escala"); es.set_column("A:J", 15)
es.write("A1", "¿Cuándo funciona la Normal? Cartera del Caso 1 multiplicada por k", T)
es.write("A2", "E, Var y μ₃ escalan con k; la asimetría cae como 1/√k. Columna 'Exacto' = valores de referencia de Python (convolución).", I)
for j, h in enumerate(["k", "nº pólizas", "E(S)", "Var(S)", "asimetría", "VaR Normal", "VaR Normal Power", "VaR Gamma tras.", "VaR exacto (ref.)", "error Normal %", "error NP %"]): es.write(2, j, h, H)
from core import exacta as _ex
ref = {1: 1.7e6, 2: None, 5: None, 10: None, 25: None, 50: None}
from scipy.signal import fftconvolve
def vexact(k):
    Pp = np.ones(1)
    for n, q, b in zip(n1 * k, q1, b1):
        u = int(round(b / 50000)); pm = stats.binom.pmf(np.arange(int(n) + 1), int(n), q); arr = np.zeros(int(n) * u + 1); arr[::u] = pm; Pp = np.clip(fftconvolve(Pp, arr), 0, None)
    Pp /= Pp.sum(); return 50000 * int(np.searchsorted(np.cumsum(Pp), .995))
for i, k in enumerate((1, 2, 5, 10, 25, 50)):
    r = 3 + i; x = r + 1; Ek, Vk, Mk = e1.sum() * k, v1.sum() * k, m1_.sum() * k; a = aprox(Ek, Vk, Mk); vx = vexact(k)
    es.write(r, 0, k, IN); es.write_formula(r, 1, f"=1000*A{x}", N0, 1000 * k)
    es.write_formula(r, 2, f"=Caso1_Vida!$E$8*A{x}", N0, Ek); es.write_formula(r, 3, f"=Caso1_Vida!$F$8*A{x}", N0, Vk)
    es.write_formula(r, 4, f"=Caso1_Vida!$G$8*A{x}/SQRT(D{x})^3", N4, Mk / Vk ** 1.5)
    es.write_formula(r, 5, f"=C{x}+z_p*SQRT(D{x})", N0, a["normal"]); es.write_formula(r, 6, f"=C{x}+SQRT(D{x})*(z_p+E{x}/6*(z_p^2-1))", N0, a["np"])
    es.write_formula(r, 7, f"=(C{x}-2*SQRT(D{x})/E{x})+GAMMAINV(p_niv,4/E{x}^2,SQRT(D{x})*E{x}/2)", N0, a["gamma"])
    es.write(r, 8, vx, REF); es.write_formula(r, 9, f"=100*(F{x}/I{x}-1)", PCT, 100 * (a["normal"] / vx - 1)); es.write_formula(r, 10, f"=100*(G{x}/I{x}-1)", PCT, 100 * (a["np"] / vx - 1))
ch = wb.add_chart({"type": "scatter", "subtype": "straight_with_markers"})
ch.add_series({"name": "error Normal %", "categories": "=Escala!$B$4:$B$9", "values": "=Escala!$J$4:$J$9", "line": {"color": "#B3261E"}})
ch.add_series({"name": "error Normal Power %", "categories": "=Escala!$B$4:$B$9", "values": "=Escala!$K$4:$K$9", "line": {"color": "#1559A6"}})
ch.set_title({"name": "Error del VaR 99,5 % frente al exacto"}); ch.set_x_axis({"name": "nº de pólizas", "log_base": 10}); ch.set_y_axis({"name": "%"}); ch.set_size({"width": 640, "height": 300}); es.insert_chart("A12", ch)
wb.close(); print("xlsx ok")
