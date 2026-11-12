"""Genera t6_practica.xlsx (fórmulas vivas con valores en caché). Reutiliza las celdas del script de Python para obtener datos y parámetros MLE."""
import os, re, numpy as np, pandas as pd, xlsxwriter
from scipy import stats

src = open("t6_practica.py", encoding="utf-8").read()
cells = re.split(r"^# %%", src, flags=re.M)[1:]
keys = ("import numpy as np", "def r_gauss", "n = 1500; rho_true", "def ll_gauss", "# MLE (pseudo")
G = {}
for c in cells:
    if any(k in c for k in keys): exec(c.partition("\n")[2], G)
fits, Uh, X, Y, n = G["fits"], G["Uh"], G["X"], G["Y"], G["n"]
ll_gauss, ll_t, ll_clayton, ll_gumbel, ll_frank = (G[k] for k in ("ll_gauss", "ll_t", "ll_clayton", "ll_gumbel", "ll_frank"))
NT = int(os.environ.get("T6_NT", 0)); OUT = os.environ.get("T6_OUT", "t6_practica.xlsx")
if NT: X, Y, n = X[:NT], Y[:NT], NT; Uh = np.c_[stats.rankdata(X), stats.rankdata(Y)] / (n + 1)
tau_hat = float(stats.kendalltau(X, Y)[0])

wb = xlsxwriter.Workbook(OUT)
H = wb.add_format({"bold": 1, "bg_color": "#1559A6", "font_color": "white", "border": 1, "align": "center", "valign": "vcenter", "text_wrap": 1})
T = wb.add_format({"bold": 1, "font_size": 14}); I = wb.add_format({"italic": 1, "font_color": "#57667A"})
IN = wb.add_format({"bg_color": "#FFF2CC", "border": 1, "num_format": "#,##0.####"}); REF = wb.add_format({"bg_color": "#E6EEF7", "border": 1, "italic": 1, "num_format": "0.0000"})
N2 = wb.add_format({"border": 1, "num_format": "#,##0.00"}); N4 = wb.add_format({"border": 1, "num_format": "0.0000"}); N0 = wb.add_format({"border": 1, "num_format": "#,##0"})
TX = wb.add_format({"border": 1}); PCT = wb.add_format({"border": 1, "num_format": "0.0%"}); OKF = wb.add_format({"border": 1, "align": "center", "bold": 1})
BOLD = wb.add_format({"bold": 1, "border": 1, "num_format": "#,##0.00", "bg_color": "#EAF2E3"})

# =========================== Casos ===========================
cs = wb.add_worksheet("Casos"); cs.set_column("A:A", 58); cs.set_column("B:H", 17)
cs.write("A1", "Casos 1 y 2 · agregación de capital y dependencia de cola", T); cs.write("A2", "Amarillo = entrada. Azul = valor de referencia calculado en Python. Luiz Luzuriaga · MUCAF", I)
m, u, rho, rec = 40, 30, .25, .13
for i, (lab, v) in enumerate([("SCR mercado (M€)", m), ("SCR suscripción (M€)", u), ("ρ prescrita (Solvencia II)", rho), ("Recargo por dependencia de cola (Clayton)", rec)]):
    cs.write(3 + i, 0, lab, TX); cs.write(3 + i, 1, v, IN)
scr = float(np.sqrt(m ** 2 + u ** 2 + 2 * rho * m * u))
rows = [("SCR estándar = √(M²+U²+2ρMU)", "=SQRT(B4^2+B5^2+2*B6*B4*B5)", scr, N2), ("Beneficio de diversificación = M+U−SCR", "=B4+B5-B9", m + u - scr, N2),
        ("% del beneficio sobre la suma simple", "=B10/(B4+B5)", (m + u - scr) / (m + u), PCT), ("SCR ajustado por cola = SCR·(1+recargo)", "=B9*(1+B7)", scr * (1 + rec), N2),
        ("Capital adicional = SCR ajustado − SCR", "=B12-B9", scr * rec, N2), ("Recargo respecto a la suma simple", "=B12/(B4+B5)-1", scr * (1 + rec) / (m + u) - 1, PCT)]
for i, (lab, f, v, fm) in enumerate(rows): cs.write(8 + i, 0, lab, TX); cs.write_formula(8 + i, 1, f, fm, v)
cs.write(15, 0, "Sensibilidad a ρ", T)
for j, h in enumerate(["ρ", "SCR estándar", "SCR + recargo", "Capital adicional", "Adicional / suma simple"]): cs.write(16, j, h, H)
cs.set_row(16, 32)
for i, r in enumerate((0, .25, .5, .75)):
    x = 18 + i; s = float(np.sqrt(m ** 2 + u ** 2 + 2 * r * m * u))
    cs.write(17 + i, 0, r, IN); cs.write_formula(17 + i, 1, f"=SQRT($B$4^2+$B$5^2+2*A{x}*$B$4*$B$5)", N2, s); cs.write_formula(17 + i, 2, f"=B{x}*(1+$B$7)", N2, s * (1 + rec))
    cs.write_formula(17 + i, 3, f"=C{x}-B{x}", N2, s * rec); cs.write_formula(17 + i, 4, f"=D{x}/($B$4+$B$5)", PCT, s * rec / (m + u))
cs.write(22, 0, "Con ρ = 0 el recargo de cola sigue siendo 6,50 M€: la dependencia de cola no es la correlación media.", I)

cs.write(24, 0, "Caso 2 · Clayton θ̂ = 1,5", T)
cs.write(25, 0, "θ̂ (MLE)", TX); cs.write(25, 1, 1.5, IN)
lamL = 2 ** (-1 / 1.5)
for i, (lab, f, v, fm) in enumerate([("λ_L = 2^(−1/θ)", "=2^(-1/B26)", lamL, N4), ("τ de Kendall = θ/(θ+2)", "=B26/(B26+2)", 1.5 / 3.5, N4), ("ρ de la Gaussiana con la misma τ = sen(πτ/2)", "=SIN(PI()*B28/2)", float(np.sin(np.pi * 1.5 / 3.5 / 2)), N4)]):
    cs.write(26 + i, 0, lab, TX); cs.write_formula(26 + i, 1, f, fm, v)
cs.write(29, 0, "Lectura: si el mercado cae a su peor percentil, la probabilidad asintótica de que la cartera catastrófica también lo esté es ≈ 63 %.", I)

cs.write(31, 0, "Perfil de cola por familia con la misma τ", T)
cs.write(32, 0, "τ de Kendall", TX); cs.write(32, 1, .5, IN); cs.write(33, 0, "ν de la t (dos casos)", TX); cs.write(33, 1, 15, IN); cs.write(33, 2, 4, IN)
for j, h in enumerate(["Familia", "Parámetro", "λ_L", "λ_U"]): cs.write(34, j, h, H)
tau0 = .5; rg = np.sin(np.pi * tau0 / 2)
lt = lambda nu: float(2 * stats.t.cdf(-np.sqrt((nu + 1) * (1 - rg) / (1 + rg)), nu + 1))
tabf = [("Gaussiana (ρ)", "=SIN(PI()*$B$33/2)", rg, "0", 0, "0", 0),
        ("t, ν en B34 (ρ)", "=SIN(PI()*$B$33/2)", rg, "=2*T.DIST(-SQRT(($B$34+1)*(1-B37)/(1+B37)),$B$34+1,TRUE)", lt(15), "=D37", lt(15)),
        ("t, ν en C34 (ρ)", "=SIN(PI()*$B$33/2)", rg, "=2*T.DIST(-SQRT(($C$34+1)*(1-B38)/(1+B38)),$C$34+1,TRUE)", lt(4), "=D38", lt(4)),
        ("Clayton (θ = 2τ/(1−τ))", "=2*$B$33/(1-$B$33)", 2.0, "=2^(-1/B39)", 2 ** -.5, "0", 0), ("Gumbel (θ = 1/(1−τ))", "=1/(1-$B$33)", 2.0, "0", 0, "=2-2^(1/B40)", 2 - 2 ** .5)]
for i, (lab, fp, vp, fl, vl, fu, vu) in enumerate(tabf):
    r = 35 + i; cs.write(r, 0, lab, TX); cs.write_formula(r, 1, fp, N4, vp)
    for c, (f, v) in ((2, (fl, vl)), (3, (fu, vu))):
        cs.write_formula(r, c, f if f.startswith("=") else f"={f}", N4, v)
cs.write(40, 0, "Frank (θ numérico: τ = 1 − 4[1 − D₁(θ)]/θ)", TX); cs.write(40, 1, G["th_frank"](.5), REF); cs.write(40, 2, 0, N4); cs.write(40, 3, 0, N4)
cs.write(41, 0, "Misma τ = 0,5 y colas muy distintas: λ_L(Clayton) = 0,71; λ_U(Gumbel) = 0,59; t(ν=15) ≈ 0,12; t(ν=4) ≈ 0,40.", I)
ch = wb.add_chart({"type": "column"}); ch.add_series({"name": "λ_L", "categories": "=Casos!$A$36:$A$40", "values": "=Casos!$C$36:$C$40", "fill": {"color": "#1559A6"}})
ch.add_series({"name": "λ_U", "categories": "=Casos!$A$36:$A$40", "values": "=Casos!$D$36:$D$40", "fill": {"color": "#B03A2E"}}); ch.set_title({"name": "Dependencia de cola con τ = 0,5"}); ch.set_size({"width": 560, "height": 300}); cs.insert_chart("F24", ch)

# =========================== Modulos4 ===========================
md = wb.add_worksheet("Modulos4"); md.set_column("A:A", 30); md.set_column("B:H", 15)
md.write("A1", "Agregación de 4 módulos de SCR: fórmula estándar, matriz P y comprobaciones", T); md.write("A2", "Amarillo = entrada · azul = valor simulado en Python (10⁶ escenarios)", I)
mods = ["Mercado", "Suscripción", "Contraparte", "Salud"]; S = [40, 30, 20, 10]
P = [[1, .25, .25, .25], [.25, 1, .5, 0], [.25, .5, 1, .25], [.25, 0, .25, 1]]
md.write(3, 0, "Módulo", H); md.write(3, 1, "SCR (M€)", H)
for i in range(4): md.write(4 + i, 0, mods[i], TX); md.write(4 + i, 1, S[i], IN)
md.write(8, 0, "Suma simple", TX); md.write_formula(8, 1, "=SUM(B5:B8)", N2, 100)
md.write(10, 0, "Matriz P", T)
for j in range(4): md.write(11, 1 + j, mods[j], H)
for i in range(4):
    md.write(12 + i, 0, mods[i], TX)
    for j in range(4): md.write(12 + i, 1 + j, P[i][j], IN)
md.write(17, 0, "Términos ρij·SCRi·SCRj", T)
for j in range(4): md.write(18, 1 + j, mods[j], H)
cols = "BCDE"
for i in range(4):
    md.write(19 + i, 0, mods[i], TX)
    for j in range(4): md.write_formula(19 + i, 1 + j, f"={cols[j]}{13+i}*$B${5+i}*$B${5+j}", N2, P[i][j] * S[i] * S[j])
tot = sum(P[i][j] * S[i] * S[j] for i in range(4) for j in range(4))
md.write(23, 0, "Σ términos", TX); md.write_formula(23, 1, "=SUM(B20:E23)", N2, tot)
md.write(24, 0, "SCR = √(ΣΣ ρij SCRi SCRj)", TX); md.write_formula(24, 1, "=SQRT(B24)", BOLD, float(np.sqrt(tot)))
md.write(25, 0, "Beneficio de diversificación", TX); md.write_formula(25, 1, "=B9-B25", N2, 100 - float(np.sqrt(tot)))
md.write(27, 0, "¿Es P definida positiva? Menores principales (Sylvester)", T)
mi = [("Menor 1×1", "=MDETERM(B13:B13)", 1.0), ("Menor 2×2", "=MDETERM(B13:C14)", 1 - .0625), ("Menor 3×3", "=MDETERM(B13:D15)", float(np.linalg.det(np.array(P)[:3, :3]))), ("Determinante 4×4", "=MDETERM(B13:E16)", float(np.linalg.det(np.array(P))))]
for i, (lab, f, v) in enumerate(mi): md.write(28 + i, 0, lab, TX); md.write_formula(28 + i, 1, f, N4, v)
md.write(32, 0, "¿Todos > 0?", TX); md.write_formula(32, 1, '=IF(AND(B29>0,B30>0,B31>0,B32>0),"Sí","No")', OKF, "Sí")
md.write(34, 0, "τ medio y parámetros de las arquimedianas (un solo θ)", T)
pairs = [(0, 1), (0, 2), (0, 3), (1, 2), (1, 3), (2, 3)]; taus = []
for k, (i, j) in enumerate(pairs):
    t_ = 2 / np.pi * np.arcsin(P[i][j]); taus.append(t_); md.write(35 + k, 0, f"τ({mods[i]}, {mods[j]}) = (2/π)·asen ρ", TX); md.write_formula(35 + k, 1, f"=2/PI()*ASIN({cols[j]}{13+i})", N4, t_)
tm = float(np.mean(taus)); md.write(41, 0, "τ medio", TX); md.write_formula(41, 1, "=AVERAGE(B36:B41)", N4, tm)
md.write(42, 0, "Clayton: θ = 2τ/(1−τ)", TX); md.write_formula(42, 1, "=2*B42/(1-B42)", N4, 2 * tm / (1 - tm)); md.write(43, 0, "Gumbel: θ = 1/(1−τ)", TX); md.write_formula(43, 1, "=1/(1-B42)", N4, 1 / (1 - tm))
md.write(45, 0, "VaR 99,5 % de la suma por cópula (simulación, referencia)", T)
for j, h in enumerate(["Cópula", "VaR 99,5 %", "Δ vs fórmula estándar", "TVaR 99,5 %", "P(≥2 > p99)", "P(4 a la vez) ×10⁵"]): md.write(46, j, h, H)
md.set_row(46, 32)
# valores simulados en el script (celda F)
sim = {}
ce = [c for c in cells if "S = np.array([40, 30, 20, 10.])" in c][0]
G2 = dict(G); G2['var_tvar'] = lambda L, q=.995: (float(np.quantile(L, q)), float(L[L >= np.quantile(L, q)].mean())); exec(ce.partition("\n")[2].replace("NN = 1_000_000", "NN = 1_000_000"), G2)
out = G2["out"]
for i, (nm, rw) in enumerate(out.iterrows()):
    r = 47 + i; md.write(r, 0, nm, TX); md.write(r, 1, float(rw.VaR), REF); md.write_formula(r, 2, f"=B{r+1}/$B$25-1", PCT, float(rw.VaR) / float(np.sqrt(tot)) - 1)
    md.write(r, 3, float(rw.TVaR), REF); md.write(r, 4, float(rw.P2), REF); md.write(r, 5, float(rw.P4_x100k), REF)
md.write(53, 0, "Con la misma dependencia media, cambiar la cola mueve el capital entre +4 % y +21 %: P por pares no basta.", I)
ch = wb.add_chart({"type": "column"}); ch.add_series({"name": "VaR 99,5 %", "categories": "=Modulos4!$A$48:$A$52", "values": "=Modulos4!$B$48:$B$52", "fill": {"color": "#1559A6"}})
ch.set_title({"name": "VaR 99,5 % de la suma de 4 módulos (M€)"}); ch.set_y_axis({"min": 60}); ch.set_size({"width": 520, "height": 300}); md.insert_chart("H4", ch)

# =========================== Muestra (ajuste) ===========================
ms = wb.add_worksheet("Muestra"); ms.set_column("A:A", 7); ms.set_column("B:C", 13); ms.set_column("D:E", 11); ms.set_column("F:G", 10); ms.set_column("H:M", 12); ms.set_column("O:O", 40); ms.set_column("P:U", 14)
for j, h in enumerate(["obs", "X pérdida mercado", "Y siniestralidad", "û = R(X)/(n+1)", "v̂ = R(Y)/(n+1)", "x = Φ⁻¹(û)", "y = Φ⁻¹(v̂)", "ℓ Gaussiana", "ℓ t-Student", "ℓ Clayton", "ℓ Clayton rotada", "ℓ Gumbel", "ℓ Frank"]): ms.write(0, j, h, H)
ms.set_row(0, 32)
# parámetros (columna P/Q)
ms.write("O1", "Parámetros MLE (de Python; Solver puede reoptimizarlos)", T)
prm = [("n", n, None), ("ρ Gaussiana", fits["Gaussiana"]["par"][0], 1), ("ρ t-Student", fits["t-Student"]["par"][0], 1), ("ν t-Student (entero: Excel trunca los g.l.)", float(round(fits["t-Student"]["par"][1])), 1), ("θ Clayton", fits["Clayton"]["par"][0], 1),
       ("θ Clayton rotada", fits["Clayton rotada"]["par"][0], 1), ("θ Gumbel", fits["Gumbel"]["par"][0], 1), ("θ Frank", fits["Frank"]["par"][0], 1)]
for i, (lab, v, _) in enumerate(prm): ms.write(1 + i, 14, lab, TX); ms.write(1 + i, 15, float(v), IN)      # P2..P9: n=P2, rhoG=P3, rhoT=P4, nu=P5, thC=P6, thCr=P7, thG=P8, thF=P9
N1 = n + 1
for i in range(n):
    r = i + 2
    ms.write(i + 1, 0, i + 1, N0); ms.write(i + 1, 1, float(X[i]), IN); ms.write(i + 1, 2, float(Y[i]), IN)
    ms.write_formula(i + 1, 3, f"=(RANK(B{r},$B$2:$B${N1},1)+(COUNTIF($B$2:$B${N1},B{r})-1)/2)/($P$2+1)", N4, float(Uh[i, 0])); ms.write_formula(i + 1, 4, f"=(RANK(C{r},$C$2:$C${N1},1)+(COUNTIF($C$2:$C${N1},C{r})-1)/2)/($P$2+1)", N4, float(Uh[i, 1]))
    ms.write_formula(i + 1, 5, f"=NORM.S.INV(D{r})", N4, float(stats.norm.ppf(Uh[i, 0]))); ms.write_formula(i + 1, 6, f"=NORM.S.INV(E{r})", N4, float(stats.norm.ppf(Uh[i, 1])))
lg = ll_gauss(Uh, fits["Gaussiana"]["par"][0]); NU_X = float(round(fits["t-Student"]["par"][1])); lt_ = ll_t(Uh, fits["t-Student"]["par"][0], NU_X); lc = ll_clayton(Uh, fits["Clayton"]["par"][0]); lr = ll_clayton(1 - Uh, fits["Clayton rotada"]["par"][0])
lu = ll_gumbel(Uh, fits["Gumbel"]["par"][0]); lf = ll_frank(Uh, fits["Frank"]["par"][0])
for i in range(n):
    r = i + 2
    fG = f"=-0.5*LN(1-$P$3^2)-($P$3^2*(F{r}^2+G{r}^2)-2*$P$3*F{r}*G{r})/(2*(1-$P$3^2))"
    fT = (f"=GAMMALN(($P$5+2)/2)-GAMMALN($P$5/2)-LN($P$5*PI())-0.5*LN(1-$P$4^2)-($P$5+2)/2*LN(1+(T.INV(D{r},$P$5)^2-2*$P$4*T.INV(D{r},$P$5)*T.INV(E{r},$P$5)+T.INV(E{r},$P$5)^2)/($P$5*(1-$P$4^2)))"
          f"-LN(T.DIST(T.INV(D{r},$P$5),$P$5,FALSE))-LN(T.DIST(T.INV(E{r},$P$5),$P$5,FALSE))")
    fC = f"=LN(1+$P$6)-(1+$P$6)*(LN(D{r})+LN(E{r}))-(2+1/$P$6)*LN(D{r}^(-$P$6)+E{r}^(-$P$6)-1)"
    fR = f"=LN(1+$P$7)-(1+$P$7)*(LN(1-D{r})+LN(1-E{r}))-(2+1/$P$7)*LN((1-D{r})^(-$P$7)+(1-E{r})^(-$P$7)-1)"
    fU = (f"=-(((-LN(D{r}))^$P$8+(-LN(E{r}))^$P$8)^(1/$P$8))-LN(D{r})-LN(E{r})+($P$8-1)*(LN(-LN(D{r}))+LN(-LN(E{r})))"
          f"+(2/$P$8-2)*LN((-LN(D{r}))^$P$8+(-LN(E{r}))^$P$8)+LN(1+($P$8-1)*((-LN(D{r}))^$P$8+(-LN(E{r}))^$P$8)^(-1/$P$8))")
    fF = f"=LN($P$9*(1-EXP(-$P$9)))-$P$9*(D{r}+E{r})-2*LN((1-EXP(-$P$9))-(1-EXP(-$P$9*D{r}))*(1-EXP(-$P$9*E{r})))"
    for c, (f, v) in enumerate(((fG, lg[i]), (fT, lt_[i]), (fC, lc[i]), (fR, lr[i]), (fU, lu[i]), (fF, lf[i]))): ms.write_formula(i + 1, 7 + c, f, N4, float(v))
# estadísticos y tabla AIC/BIC
ms.write("O12", "Descriptivos y dependencia", T)
st = [("Pearson ρ", f"=CORREL(B2:B{N1},C2:C{N1})", float(np.corrcoef(X, Y)[0, 1])), ("Spearman ρS = CORREL(rangos)", f"=CORREL(D2:D{N1},E2:E{N1})", float(stats.spearmanr(X, Y)[0]))]
for i, (lab, f, v) in enumerate(st): ms.write(12 + i, 14, lab, TX); ms.write_formula(12 + i, 15, f, N4, v)
ms.write(14, 14, "τ de Kendall (Python; O(n²), no se calcula en celdas)", TX); ms.write(14, 15, tau_hat, REF)
ms.write(15, 14, "τ → ρ Gaussiana = sen(πτ/2)", TX); ms.write_formula(15, 15, "=SIN(PI()*P15/2)", N4, float(np.sin(np.pi * tau_hat / 2)))
ms.write(16, 14, "τ → θ Clayton = 2τ/(1−τ)", TX); ms.write_formula(16, 15, "=2*P15/(1-P15)", N4, 2 * tau_hat / (1 - tau_hat))
ms.write(17, 14, "τ → θ Gumbel = 1/(1−τ)", TX); ms.write_formula(17, 15, "=1/(1-P15)", N4, 1 / (1 - tau_hat))
for j, h in enumerate(["Cópula", "k", "log-verosimilitud", "AIC", "BIC", "λ_L", "λ_U"]): ms.write(19, 14 + j, h, H)
cop = [("Gaussiana", 1, "H", "0", "0", lg, 0, 0), ("t-Student", 2, "I", "=2*T.DIST(-SQRT(($P$5+1)*(1-$P$4)/(1+$P$4)),$P$5+1,TRUE)", "=T{r}", lt_, None, None),
       ("Clayton", 1, "J", "=2^(-1/$P$6)", "0", lc, None, 0), ("Clayton rotada", 1, "K", "0", "=2^(-1/$P$7)", lr, 0, None), ("Gumbel", 1, "L", "0", "=2-2^(1/$P$8)", lu, 0, None), ("Frank", 1, "M", "0", "0", lf, 0, 0)]
fp = fits
for i, (nm, k, col, fl, fu, arr, _, _) in enumerate(cop):
    r = 21 + i; ll_ = float(arr.sum()); ms.write(r - 1, 14, nm, TX); ms.write(r - 1, 15, k, N0); ms.write_formula(r - 1, 16, f"=SUM({col}2:{col}{N1})", N2, ll_)
    ms.write_formula(r - 1, 17, f"=-2*Q{r}+2*P{r}", N2, -2 * ll_ + 2 * k); ms.write_formula(r - 1, 18, f"=-2*Q{r}+P{r}*LN($P$2)", N2, -2 * ll_ + k * np.log(n))
    lamv = {"Gaussiana": (0, 0), "t-Student": (G["lam_t"](fp["t-Student"]["par"][0], NU_X),) * 2, "Clayton": (G["lam_clayton"](fp["Clayton"]["par"][0]), 0), "Clayton rotada": (0, G["lam_clayton"](fp["Clayton rotada"]["par"][0])),
            "Gumbel": (0, G["lam_gumbel"](fp["Gumbel"]["par"][0])), "Frank": (0, 0)}[nm]
    ms.write_formula(r - 1, 19, fl if fl.startswith("=") else "=" + fl, N4, lamv[0]); ms.write_formula(r - 1, 20, fu.format(r=r) if fu.startswith("=") else "=" + fu, N4, lamv[1])
ms.write("O28", "Contraste de razón de verosimilitudes: t frente a Gaussiana", TX); ms.write_formula("P28", "=2*(Q22-Q21)", N2, 2 * (float(lt_.sum()) - float(lg.sum())))
ms.write("O29", "ΔAIC (Gaussiana − t) · ΔBIC", TX); ms.write_formula("P29", "=R21-R22", N2, (-2 * lg.sum() + 2) - (-2 * lt_.sum() + 4)); ms.write_formula("Q29", "=S21-S22", N2, (-2 * lg.sum() + np.log(n)) - (-2 * lt_.sum() + 2 * np.log(n)))
ms.write("O30", "Menor AIC → mejor ajuste. Bondad de ajuste Sn (bootstrap): ver Python y R. La t mejora a la Gaussiana si ΔAIC > 0.", I)
ch = wb.add_chart({"type": "scatter"}); ch.add_series({"name": "(û, v̂)", "categories": f"=Muestra!$D$2:$D${N1}", "values": f"=Muestra!$E$2:$E${N1}", "marker": {"type": "circle", "size": 2, "fill": {"color": "#1559A6"}, "border": {"none": True}}})
ch.set_title({"name": "Pseudo-observaciones"}); ch.set_legend({"none": True}); ch.set_x_axis({"min": 0, "max": 1}); ch.set_y_axis({"min": 0, "max": 1}); ch.set_size({"width": 420, "height": 420}); ms.insert_chart("O33", ch)

# =========================== Simulacion ===========================
sm = wb.add_worksheet("Simulacion"); sm.set_column("A:G", 12); sm.set_column("I:I", 46); sm.set_column("J:K", 14)
NSIM = int(os.environ.get("T6_NSIM", 4000)); gen = np.random.default_rng(11); uu, ww = gen.uniform(size=NSIM), gen.uniform(size=NSIM)
sm.write("I1", "Simulación con números aleatorios fijos (los mismos u, w para las dos cópulas)", T)
sm.write("I2", "Gaussiana ρ=0,25 frente a Clayton rotada con la misma τ. Las pérdidas marginales son N(0, SCRi/z₀,₉₉₅).", I)
inp = [("SCR mercado", 40), ("SCR suscripción", 30), ("ρ Gaussiana", .25)]
for i, (lab, v) in enumerate(inp): sm.write(3 + i, 8, lab, TX); sm.write(3 + i, 9, v, IN)
Z995 = float(stats.norm.ppf(.995)); tau_g = float(2 / np.pi * np.arcsin(.25)); th = 2 * tau_g / (1 - tau_g)
der = [("z₀,₉₉₅", "=NORM.S.INV(0.995)", Z995), ("τ de Kendall = (2/π)·asen ρ", "=2/PI()*ASIN(J6)", tau_g), ("θ Clayton = 2τ/(1−τ)", "=2*J8/(1-J8)", th), ("λ_U Clayton rotada = 2^(−1/θ)", "=2^(-1/J9)", 2 ** (-1 / th))]
for i, (lab, f, v) in enumerate(der): sm.write(6 + i, 8, lab, TX); sm.write_formula(6 + i, 9, f, N4, v)
for j, h in enumerate(["u", "w", "z₁=Φ⁻¹(u)", "z₂ (Gauss)", "Pérdida Gauss", "v (Clayton cond.)", "Pérdida Clayton rot."]): sm.write(0, j, h, H)
sm.set_row(0, 32)
z1 = stats.norm.ppf(uu); z2 = .25 * z1 + np.sqrt(1 - .0625) * stats.norm.ppf(ww); Lg = 40 / Z995 * z1 + 30 / Z995 * z2
v_ = (1 + uu ** (-th) * (ww ** (-th / (1 + th)) - 1)) ** (-1 / th); Lc = 40 / Z995 * stats.norm.ppf(1 - uu) + 30 / Z995 * stats.norm.ppf(1 - v_)
for i in range(NSIM):
    r = i + 2
    sm.write(i + 1, 0, float(uu[i]), IN); sm.write(i + 1, 1, float(ww[i]), IN)
    sm.write_formula(i + 1, 2, f"=NORM.S.INV(A{r})", N4, float(z1[i])); sm.write_formula(i + 1, 3, f"=$J$6*C{r}+SQRT(1-$J$6^2)*NORM.S.INV(B{r})", N4, float(z2[i]))
    sm.write_formula(i + 1, 4, f"=$J$4/$J$7*C{r}+$J$5/$J$7*D{r}", N4, float(Lg[i]))
    sm.write_formula(i + 1, 5, f"=(1+A{r}^(-$J$9)*(B{r}^(-$J$9/(1+$J$9))-1))^(-1/$J$9)", N4, float(v_[i]))
    sm.write_formula(i + 1, 6, f"=$J$4/$J$7*NORM.S.INV(1-A{r})+$J$5/$J$7*NORM.S.INV(1-F{r})", N4, float(Lc[i]))
vg, vc = float(np.quantile(Lg, .995)), float(np.quantile(Lc, .995))
sm.write("I13", "VaR 99,5 % Gaussiana (simulado)", TX); sm.write_formula("J13", f"=PERCENTILE(E2:E{NSIM+1},0.995)", N2, vg)
sm.write("I14", "VaR 99,5 % Clayton rotada (simulado)", TX); sm.write_formula("J14", f"=PERCENTILE(G2:G{NSIM+1},0.995)", N2, vc)
sm.write("I15", "Recargo simulado de la cola", TX); sm.write_formula("J15", "=J14/J13-1", PCT, vc / vg - 1)
sm.write("I16", "VaR Gaussiana exacto = fórmula estándar", TX); sm.write_formula("J16", "=SQRT(J4^2+J5^2+2*J6*J4*J5)", N2, float(np.sqrt(1600 + 900 + 600)))
sm.write("I17", "Correlación de Pearson de las pérdidas (Gauss · Clayton rot.)", TX)
sm.write_formula("J17", f"=CORREL(C2:C{NSIM+1},D2:D{NSIM+1})", N4, float(np.corrcoef(z1, z2)[0, 1]))
sm.write("I19", f"Con {NSIM:,} filas el error de muestreo del VaR 99,5 % es de unos ±2 %; con 2·10⁶ (Python y R) el recargo converge a ≈ +11 %.".replace(",", "."), I)
wb.close(); print("xlsx ok", NSIM, n)
