import numpy as np, pandas as pd, xlsxwriter
from scipy import stats, optimize

claims = pd.read_csv("t5_siniestros.csv")["perdida_MEUR"].to_numpy(); N = len(claims); T_AN = 40
wb = xlsxwriter.Workbook("t5_practica.xlsx")
H = wb.add_format({"bold": 1, "bg_color": "#1559A6", "font_color": "white", "border": 1, "align": "center", "valign": "vcenter", "text_wrap": 1})
T = wb.add_format({"bold": 1, "font_size": 14}); I = wb.add_format({"italic": 1, "font_color": "#57667A"})
IN = wb.add_format({"bg_color": "#FFF2CC", "border": 1, "num_format": "#,##0.####"}); REF = wb.add_format({"bg_color": "#E6EEF7", "border": 1, "italic": 1, "num_format": "0.0000"})
N0 = wb.add_format({"border": 1, "num_format": "#,##0"}); N2 = wb.add_format({"border": 1, "num_format": "#,##0.00"}); N4 = wb.add_format({"border": 1, "num_format": "0.0000"}); N6 = wb.add_format({"border": 1, "num_format": "0.000000"})
TX = wb.add_format({"border": 1}); PCT = wb.add_format({"border": 1, "num_format": "0.0%"}); OKF = wb.add_format({"border": 1, "align": "center", "bold": 1})

def var_gpd(p, u, xi, sg, n, Nu):
    r = (n/Nu)*(1 - p); return u + sg*np.expm1(-xi*np.log(r))/xi if abs(xi) > 1e-8 else u - sg*np.log(r)
def tvar_gpd(p, u, xi, sg, n, Nu): return (var_gpd(p, u, xi, sg, n, Nu) + sg - xi*u)/(1 - xi)
def nivel(m, u, xi, sg, lam): return u + sg*np.expm1(xi*np.log(lam*m))/xi

# ---------------- Casos ----------------
cs = wb.add_worksheet("Casos"); cs.set_column("A:A", 56); cs.set_column("B:C", 18)
cs.write("A1", "Casos 1 y 2 · VaR y TVaR de severidad por POT–GPD", T); cs.write("A2", "Amarillo = entrada. Luiz Luzuriaga · MUCAF", I)
cs.write(2, 1, "Caso 1 · Terremoto", H); cs.write(2, 2, "Caso 2 · Inundación", H); cs.set_row(2, 32)
par = [("n (pérdidas por evento)", 2000, 1500), ("T (años de historia)", 40, 30), ("u (umbral, M€)", 10, 5), ("Nu (excesos)", 80, 60), ("ξ̂", .35, .25), ("σ̂ (M€)", 6, 4), ("p", .995, .995)]
for i, (lab, a, b) in enumerate(par): cs.write(3 + i, 0, lab, TX); cs.write(3 + i, 1, a, IN); cs.write(3 + i, 2, b, IN)
vals = {}
for col, (n, T_, u, Nu, xi, sg, p) in (("B", (2000, 40, 10, 80, .35, 6, .995)), ("C", (1500, 30, 5, 60, .25, 4, .995))):
    c = 1 if col == "B" else 2; lam = Nu/T_; r = (n/Nu)*(1 - p); v = var_gpd(p, u, xi, sg, n, Nu); t = tvar_gpd(p, u, xi, sg, n, Nu)
    rows = [("λ_u = Nu/T (eventos/año)", f"={col}7/{col}5", lam, N2), ("r = (n/Nu)(1−p)", f"=({col}4/{col}7)*(1-{col}10)", r, N4), ("Factor de cola r^(−ξ)", f"={col}13^(-{col}8)", r ** (-xi), N4),
            ("VaR_p = u + (σ/ξ)[r^(−ξ) − 1]", f"={col}6+({col}9/{col}8)*({col}14-1)", v, N2), ("TVaR_p = (VaR + σ − ξu)/(1−ξ)", f"=({col}15+{col}9-{col}8*{col}6)/(1-{col}8)", t, N2),
            ("Brecha TVaR − VaR", f"={col}16-{col}15", t - v, N2), ("TVaR/VaR − 1", f"={col}16/{col}15-1", t/v - 1, PCT),
            ("Periodo de retorno del VaR de severidad (años) = 1/[(n/T)(1−p)]", f"=1/(({col}4/{col}5)*(1-{col}10))", 1/((n/T_)*(1 - p)), N2),
            ("Nivel de retorno a 100 años", f"={col}6+({col}9/{col}8)*(({col}12*100)^{col}8-1)", nivel(100, u, xi, sg, lam), N2),
            ("Nivel de retorno a 200 años (1-en-200)", f"={col}6+({col}9/{col}8)*(({col}12*200)^{col}8-1)", nivel(200, u, xi, sg, lam), N2)]
    for i, (lab, f, v_, fm) in enumerate(rows):
        if c == 1: cs.write(11 + i, 0, lab, TX)
        cs.write_formula(11 + i, c, f, fm, float(v_))
cs.write(22, 0, "Nota: la fila «Periodo de retorno del VaR de severidad» = 1/[(n/T)(1−p)]: 4 años en ambos casos. El 1-en-200 es ≈ 4,7 veces mayor.", I)
cs.write(24, 0, "El VaR 99,5 % de severidad por EVENTO NO es el capital anual: falta frecuencia, agregación, reaseguro y horizonte de un año (ver Python/R).", I)

# ---------------- Taller ----------------
tl = wb.add_worksheet("Taller_p"); tl.set_column("A:A", 12); tl.set_column("B:I", 15)
tl.write("A1", "Taller de Excel · VaR y TVaR del Caso 1 por nivel de confianza y estabilidad numérica", T)
tl.write("A3", "n", TX); tl.write("B3", 2000, IN); tl.write("A4", "Nu", TX); tl.write("B4", 80, IN); tl.write("A5", "u", TX); tl.write("B5", 10, IN); tl.write("A6", "ξ̂", TX); tl.write("B6", .35, IN); tl.write("A7", "σ̂", TX); tl.write("B7", 6, IN)
for j, h in enumerate(["p", "r = (n/Nu)(1−p)", "VaR (M€)", "TVaR (M€)", "TVaR/VaR", "TVaR − VaR", "VaR(p)/VaR(97 %)", "TVaR(p)/TVaR(97 %)"]): tl.write(8, j, h, H)
tl.set_row(8, 32)
base = None
for i, p in enumerate((.97, .99, .995, .999)):
    r_ = 9 + i; x = r_ + 1; v = var_gpd(p, 10, .35, 6, 2000, 80); t = tvar_gpd(p, 10, .35, 6, 2000, 80); base = base or (v, t)
    tl.write(r_, 0, p, IN); tl.write_formula(r_, 1, f"=($B$3/$B$4)*(1-A{x})", N4, 25*(1 - p)); tl.write_formula(r_, 2, f"=$B$5+($B$7/$B$6)*(B{x}^(-$B$6)-1)", N2, v)
    tl.write_formula(r_, 3, f"=(C{x}+$B$7-$B$6*$B$5)/(1-$B$6)", N2, t); tl.write_formula(r_, 4, f"=D{x}/C{x}", N4, t/v); tl.write_formula(r_, 5, f"=D{x}-C{x}", N2, t - v)
    tl.write_formula(r_, 6, f"=C{x}/$C$10", N4, v/base[0]); tl.write_formula(r_, 7, f"=D{x}/$D$10", N4, t/base[1])
tl.write(14, 0, "¿TVaR/VaR decrece con p?", TX); tl.write_formula(14, 3, '=IF(E13<E10,"Sí","No")', OKF, "Sí"); tl.write(15, 0, "¿La brecha TVaR−VaR crece con p?", TX); tl.write_formula(15, 3, '=IF(F13>F10,"Sí","No")', OKF, "Sí")
tl.write(17, 0, "Estabilidad numérica cuando ξ → 0 (u=10, σ=6, r=0,125)", T)
for j, h in enumerate(["ξ", "VaR 99,5 %", "TVaR 99,5 %", "Punto final x_F = u − σ/ξ"]): tl.write(18, j, h, H)
tl.set_row(18, 32)
for i, xi in enumerate((-.2, 0.0, 0.0001, .35)):
    r_ = 19 + i; x = r_ + 1; v = var_gpd(.995, 10, xi, 6, 2000, 80); t = tvar_gpd(.995, 10, xi, 6, 2000, 80)
    tl.write(r_, 0, xi, IN)
    tl.write_formula(r_, 1, f"=IF(ABS(A{x})<0.000001,$B$5-$B$7*LN(0.125),$B$5+($B$7/A{x})*(EXP(-A{x}*LN(0.125))-1))", N2, v)
    tl.write_formula(r_, 2, f"=IF(ABS(A{x})<0.000001,B{x}+$B$7,(B{x}+$B$7-A{x}*$B$5)/(1-A{x}))", N2, t)
    tl.write_formula(r_, 3, f'=IF(A{x}<0,$B$5-$B$7/A{x},"∞")', N2 if xi < 0 else TX, float(10 - 6/xi) if xi < 0 else "∞")
tl.write(24, 0, "Con ξ<0 el soporte está acotado: todo cuantil debe quedar por debajo de x_F. Con ξ≈0 se usa la rama exponencial (VaR = u − σ ln r).", I)
ch = wb.add_chart({"type": "column"}); ch.add_series({"name": "VaR", "categories": "=Taller_p!$A$10:$A$13", "values": "=Taller_p!$C$10:$C$13", "fill": {"color": "#1559A6"}})
ch.add_series({"name": "TVaR", "categories": "=Taller_p!$A$10:$A$13", "values": "=Taller_p!$D$10:$D$13", "fill": {"color": "#9A5B12"}}); ch.set_title({"name": "VaR y TVaR de severidad (M€) según p"}); ch.set_size({"width": 560, "height": 300}); tl.insert_chart("F18", ch)

# ---------------- Muestra ----------------
ms = wb.add_worksheet("Muestra"); ms.set_column("A:A", 14); ms.set_column("C:K", 15)
ms.write(0, 0, "Pérdida (M€)", H)
for i, v in enumerate(claims): ms.write(1 + i, 0, float(v), IN)
ms.write("C1", "Muestra Burr(2; 1,5; 5): 2.000 siniestros de actuar::rburr con set.seed(123) en R. Misma muestra en Python y R.", I)
ms.write("C3", "n", TX); ms.write_formula("D3", f"=COUNT(A2:A{N+1})", N0, N); ms.write("C4", "Mediana", TX); ms.write_formula("D4", f"=MEDIAN(A2:A{N+1})", N2, float(np.median(claims)))
ms.write("C5", "Percentil 95", TX); ms.write_formula("D5", f"=PERCENTILE(A2:A{N+1},0.95)", N2, float(np.percentile(claims, 95))); ms.write("C6", "Máximo", TX); ms.write_formula("D6", f"=MAX(A2:A{N+1})", N2, float(claims.max()))
ms.write("C7", "Segundo mayor", TX); ms.write_formula("D7", f"=LARGE(A2:A{N+1},2)", N2, float(np.sort(claims)[-2]))
ms.write("C8", "Verdad: ξ = 1/(αγ)", TX); ms.write("D8", 1/3, REF); ms.write("C9", "Verdad: VaR 99,5 %", TX); ms.write("D9", 5*((.005)**(-1/2) - 1)**(1/1.5), REF)
rng_ = f"$A$2:$A${N+1}"
for j, h in enumerate(["u (M€)", "Nu = COUNTIF", "e(u) = media de excesos", "λ_u = Nu/T"]): ms.write(11, 2 + j, h, H)
ms.set_row(11, 32); ugr = list(range(1, 25))
for i, uu in enumerate(ugr):
    r_ = 12 + i; x = r_ + 1; Nu_ = int((claims > uu).sum()); mr = float(claims[claims > uu].mean() - uu)
    ms.write(r_, 2, uu, IN); ms.write_formula(r_, 3, f'=COUNTIF({rng_},">"&C{x})', N0, Nu_); ms.write_formula(r_, 4, f'=AVERAGEIF({rng_},">"&C{x})-C{x}', N2, mr); ms.write_formula(r_, 5, f"=D{x}/$D$22", N2, Nu_/T_AN)
ms.write("C10", "T (años)", TX); ms.write("D10", 40, IN)
for i in range(len(ugr)): ms.write_formula(12 + i, 5, f"=D{13+i}/$D$10", N2, int((claims > ugr[i]).sum())/T_AN)
ch = wb.add_chart({"type": "scatter", "subtype": "straight"}); ch.add_series({"name": "e(u)", "categories": f"=Muestra!$C$13:$C${12+len(ugr)}", "values": f"=Muestra!$E$13:$E${12+len(ugr)}", "line": {"color": "#1559A6"}})
ch.set_title({"name": "Gráfico de exceso medio (aprox. lineal → GPD)"}); ch.set_x_axis({"name": "u (M€)"}); ch.set_legend({"none": True}); ch.set_size({"width": 560, "height": 300}); ms.insert_chart("H3", ch)

# ---------------- Ajuste en u=10 ----------------
fx = wb.add_worksheet("Ajuste_u10"); fx.set_column("A:A", 44); fx.set_column("B:D", 16)
fx.write("A1", "Ajuste de la GPD en u = 10 M€: log-verosimilitud, PWM y Hill con fórmulas", T)
u = 10.0; exc = np.sort(claims[claims > u] - u); Nu = len(exc)
def nll(p): return np.inf if p[1] <= 0 else -np.sum(stats.genpareto.logpdf(exc, p[0], 0, p[1]))
o = optimize.minimize(nll, [.2, exc.mean()], method="Nelder-Mead", options=dict(xatol=1e-9, fatol=1e-10, maxiter=4000)); xi_m, sg_m = o.x; ll_m = -o.fun
fx.write("A3", "u (M€)", TX); fx.write("B3", u, IN); fx.write("A4", "Nu = COUNTIF(muestra > u)", TX); fx.write_formula("B4", f'=COUNTIF(Muestra!{rng_},">"&B3)', N0, Nu)
fx.write("A5", "λ_u = Nu/T", TX); fx.write_formula("B5", "=B4/Muestra!D10", N2, Nu/T_AN)
fx.write("A7", "MLE: ξ̂ (de Python/R; use Solver para recalcular)", TX); fx.write("B7", float(xi_m), IN); fx.write("A8", "MLE: σ̂", TX); fx.write("B8", float(sg_m), IN)
fx.write("A9", "Log-verosimilitud ℓ(ξ,σ) = −Nu ln σ − (1+1/ξ) Σ ln(1+ξ yᵢ/σ)", TX)
fx.write_formula("B9", "=-B4*LN(B8)-(1+1/B7)*SUMPRODUCT(LN(1+B7*$E$14:$E$150/B8))", N4, float(ll_m))
fx.write("A10", "Verificación: ℓ en el MLE debe ser máxima (Solver: maximizar B9 variando B7:B8)", I)
fx.write("A12", "Excesos ordenados yᵢ = SMALL(muestra, n−Nu+i) − u", H)
fx.write(12, 3, "i", H); fx.write(12, 4, "yᵢ", H); fx.write(12, 5, "z_i = LARGE(muestra, i)", H); fx.write(12, 6, "Fᵢ = (i−0,35)/Nu", H); fx.set_row(12, 32)
fx.set_column("D:G", 16)
for i in range(Nu):
    r_ = 13 + i; x = r_ + 1
    fx.write(r_, 3, i + 1, TX); fx.write_formula(r_, 4, f"=SMALL(Muestra!{rng_},Muestra!$D$3-$B$4+D{x})-$B$3", N4, float(exc[i]))
    fx.write_formula(r_, 5, f"=LARGE(Muestra!{rng_},D{x})", N4, float(np.sort(claims)[::-1][i])); fx.write_formula(r_, 6, f"=(D{x}-0.35)/$B$4", N4, (i + 1 - .35)/Nu)
a0 = exc.mean(); a1 = np.mean(exc*(1 - (np.arange(1, Nu + 1) - .35)/Nu)); xi_p = 2 - a0/(a0 - 2*a1); sg_p = 2*a0*a1/(a0 - 2*a1)
srt = np.sort(claims)[::-1]; xi_hill = np.mean(np.log(srt[:Nu])) - np.log(srt[Nu])
lastr = 13 + Nu
fx.write("A14", "PWM: a₀ = media(yᵢ)", TX); fx.write_formula("B14", f"=AVERAGE(E14:E{lastr})", N4, float(a0))
fx.write("A15", "PWM: a₁ = media(yᵢ(1−Fᵢ))", TX); fx.write_formula("B15", f"=SUMPRODUCT(E14:E{lastr},1-G14:G{lastr})/B4", N4, float(a1))
fx.write("A16", "ξ̂ PWM = 2 − a₀/(a₀ − 2a₁)", TX); fx.write_formula("B16", "=2-B14/(B14-2*B15)", N4, float(xi_p))
fx.write("A17", "σ̂ PWM = 2a₀a₁/(a₀ − 2a₁)", TX); fx.write_formula("B17", "=2*B14*B15/(B14-2*B15)", N4, float(sg_p))
fx.write("A18", "ξ̂ Hill (k = Nu) = media ln(z_i) − ln z_(k+1)", TX); fx.write_formula("B18", f"=SUMPRODUCT(LN(F14:F{lastr}))/B4-LN(LARGE(Muestra!{rng_},B4+1))", N4, float(xi_hill))
fx.write("A19", "VaR 99,5 % con el MLE", TX); fx.write_formula("B19", "=B3+(B8/B7)*((Muestra!D3/B4*0.005)^(-B7)-1)", N2, float(var_gpd(.995, u, xi_m, sg_m, N, Nu)))
fx.write("A20", "TVaR 99,5 % con el MLE", TX); fx.write_formula("B20", "=(B19+B8-B7*B3)/(1-B7)", N2, float(tvar_gpd(.995, u, xi_m, sg_m, N, Nu)))
fx.write("A21", "VaR 99,5 % con PWM", TX); fx.write_formula("B21", "=B3+(B17/B16)*((Muestra!D3/B4*0.005)^(-B16)-1)", N2, float(var_gpd(.995, u, xi_p, sg_p, N, Nu)))
fx.write("A22", "VaR 99,5 % con Hill: z_(k+1)·(k/(n(1−p)))^ξ", TX); fx.write_formula("B22", f"=LARGE(Muestra!{rng_},B4+1)*(B4/(Muestra!D3*0.005))^B18", N2, float(srt[Nu]*(Nu/(N*.005))**xi_hill))
fx.write("A23", "Verdad: VaR 99,5 % / TVaR 99,5 %", TX); fx.write("B23", 5*((.005)**(-1/2) - 1)**(1/1.5), REF); fx.write("C23", 42.67, REF)

# ---------------- Sensibilidad al umbral ----------------
sn = wb.add_worksheet("Sensibilidad_u"); sn.set_column("A:J", 15)
sn.write("A1", "Sensibilidad al umbral: Nu, ξ̂, σ̂, σ* = σ̂ − ξ̂u, VaR y TVaR 99,5 %", T)
for j, h in enumerate(["u (M€)", "Nu", "λ_u", "ξ̂ (MLE, Python/R)", "σ̂ (MLE, Python/R)", "σ* = σ̂ − ξ̂u", "VaR 99,5 %", "TVaR 99,5 %"]): sn.write(2, j, h, H)
sn.set_row(2, 32)
for i, uu in enumerate((5, 7.5, 10, 12.5, 15, 20)):
    e = claims[claims > uu] - uu; Nu_ = len(e); r0 = optimize.minimize(lambda p: np.inf if p[1] <= 0 else -np.sum(stats.genpareto.logpdf(e, p[0], 0, p[1])), [.2, e.mean()], method="Nelder-Mead", options=dict(xatol=1e-9, fatol=1e-10, maxiter=4000)).x
    r_ = 3 + i; x = r_ + 1; sn.write(r_, 0, uu, IN); sn.write_formula(r_, 1, f'=COUNTIF(Muestra!{rng_},">"&A{x})', N0, Nu_); sn.write_formula(r_, 2, f"=B{x}/Muestra!$D$10", N2, Nu_/T_AN)
    sn.write(r_, 3, float(r0[0]), IN); sn.write(r_, 4, float(r0[1]), IN); sn.write_formula(r_, 5, f"=E{x}-D{x}*A{x}", N4, float(r0[1] - r0[0]*uu))
    sn.write_formula(r_, 6, f"=A{x}+(E{x}/D{x})*((Muestra!$D$3/B{x}*0.005)^(-D{x})-1)", N2, float(var_gpd(.995, uu, r0[0], r0[1], N, Nu_))); sn.write_formula(r_, 7, f"=(G{x}+E{x}-D{x}*A{x})/(1-D{x})", N2, float(tvar_gpd(.995, uu, r0[0], r0[1], N, Nu_)))
sn.write(10, 0, "Verdad", TX); sn.write(10, 3, 1/3, REF); sn.write(10, 6, 5*((.005)**(-1/2) - 1)**(1/1.5), REF); sn.write(10, 7, 42.67, REF)
sn.write(12, 0, "Lectura: el VaR 99,5 % es muy robusto al umbral (está cerca de los datos); el TVaR depende de ξ̂ y varía más; por encima de u≈15 hay menos de 55 excesos y ξ̂, σ* se vuelven erráticos.", I)
ch = wb.add_chart({"type": "scatter", "subtype": "straight_with_markers"}); ch.add_series({"name": "ξ̂", "categories": "=Sensibilidad_u!$A$4:$A$9", "values": "=Sensibilidad_u!$D$4:$D$9", "line": {"color": "#9A5B12"}})
ch.set_title({"name": "ξ̂ según el umbral u"}); ch.set_legend({"none": True}); ch.set_size({"width": 520, "height": 280}); sn.insert_chart("A15", ch)

# ---------------- Capa XL ----------------
cp = wb.add_worksheet("Capa_XL"); cp.set_column("A:A", 52); cp.set_column("B:H", 15)
cp.write("A1", "Capa de reaseguro XL 40 xs 20 M€ (Caso 1: u=10, σ=6, λ_u=2)", T)
for i, (lab, v) in enumerate([("u (M€)", 10), ("σ̂ (M€)", 6), ("λ_u (eventos/año)", 2), ("D (prioridad, M€)", 20), ("L (límite, M€)", 40), ("k (recargo por σ_S)", .25)]): cp.write(2 + i, 0, lab, TX); cp.write(2 + i, 1, v, IN)
for j, h in enumerate(["ξ", "E[(X−D)⁺|X>u]", "E[(X−D−L)⁺|X>u]", "Pérdida esperada por evento", "EL anual (prima pura)", "P(contacto) anual", "P(agotamiento) anual", "Prima técnica = EL + k·σ_S", "Rate on line"]): cp.write(9, j, h, H)
cp.set_row(9, 44); cp.set_column("I:I", 15)
yg = np.arange(0, 40.0001, .1)
for i, xi in enumerate((.25, .35, .45)):
    r_ = 10 + i; x = r_ + 1
    ee = lambda d: (6 + xi*(d - 10))/(1 - xi)*(1 + xi*(d - 10)/6)**(-1/xi)
    sf = lambda y: (1 + xi*(20 + y - 10)/6)**(-1/xi); EL = 2*(ee(20) - ee(60)); ey2 = np.trapezoid(2*yg*sf(yg), yg); prima = EL + .25*np.sqrt(2*ey2)
    cp.write(r_, 0, xi, IN)
    cp.write_formula(r_, 1, f"=($B$4+A{x}*($B$6-$B$3))/(1-A{x})*(1+A{x}*($B$6-$B$3)/$B$4)^(-1/A{x})", N4, ee(20))
    cp.write_formula(r_, 2, f"=($B$4+A{x}*($B$6+$B$7-$B$3))/(1-A{x})*(1+A{x}*($B$6+$B$7-$B$3)/$B$4)^(-1/A{x})", N4, ee(60))
    cp.write_formula(r_, 3, f"=B{x}-C{x}", N4, ee(20) - ee(60)); cp.write_formula(r_, 4, f"=$B$5*D{x}", N4, EL)
    cp.write_formula(r_, 5, f"=1-EXP(-$B$5*(1+A{x}*($B$6-$B$3)/$B$4)^(-1/A{x}))", N4, 1 - np.exp(-2*sf(0))); cp.write_formula(r_, 6, f"=1-EXP(-$B$5*(1+A{x}*($B$6+$B$7-$B$3)/$B$4)^(-1/A{x}))", N4, 1 - np.exp(-2*sf(40)))
    colS = chr(75 + i)   # K, L, M
    cp.write_formula(r_, 7, f"=E{x}+$B$8*SQRT($B$5*{colS}$503)", N4, prima); cp.write_formula(r_, 8, f"=H{x}/$B$7", N4, prima/40)
# integral numérica de E[Y²] = ∫0^L 2y S(D+y) dy por trapecio (rejilla 0,1)
cp.write("J12", "Rejilla de y (M€)", H); cp.write("K12", "ξ=0,25: 2y·S", H); cp.write("L12", "ξ=0,35: 2y·S", H); cp.write("M12", "ξ=0,45: 2y·S", H)
cp.write("K500", "Σ trapecio = E[Y²]", H)
for k_, y in enumerate(yg):
    r_ = 12 + k_ - 0 + 0
    cp.write(r_ + 0, 9, float(y), IN)
    for i, xi in enumerate((.25, .35, .45)):
        col = chr(65 + 10 + i)
        cp.write_formula(r_, 10 + i, f"=2*$J{r_+1}*(1+{xi}*($B$6+$J{r_+1}-$B$3)/$B$4)^(-1/{xi})", N6, float(2*y*(1 + xi*(20 + y - 10)/6)**(-1/xi)))
# fila 503 = integral (trapecio): posiciones fijas
last = 12 + len(yg) - 1   # índice 0-based de la última fila de la rejilla
for i, xi in enumerate((.25, .35, .45)):
    col = chr(75 + i); sf = lambda y: (1 + xi*(20 + y - 10)/6)**(-1/xi); ey2 = np.trapezoid(2*yg*sf(yg), yg)
    cp.write_formula(502, 10 + i, f"=0.1*(SUM({col}13:{col}{last+1})-({col}13+{col}{last+1})/2)", N4, float(ey2))
wb.close(); print("xlsx ok", Nu)
