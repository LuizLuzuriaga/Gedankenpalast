# Contenido HTML explicado del Tema 4 (MathJax con \( \) y \[ \]).
T = dict(
    id="t4", num=4, slug="t4",
    title="Gestión de capital y medidas coherentes de riesgo: VaR y TVaR",
    short="VaR / TVaR",
    lede="Qué propiedades debe tener una cifra de capital, por qué el VaR puede fallar la diversificación, por qué el TVaR no, y qué dicen Solvencia II, Basilea y el SST.",
    explain=[
("De la distribución al capital: por qué una axiomática", r"""
<p>Los temas anteriores dieron la distribución de la siniestralidad agregada \(S\); falta convertirla en una cifra de capital. No cualquier función sirve: tras LTCM (1998) y 2008 se vio que el VaR, estándar de facto, podía dar señales erróneas de diversificación. Artzner, Delbaen, Eber y Heath (1999) fijaron un conjunto mínimo de propiedades: las medidas <b>coherentes</b>.</p>"""),
("Los cuatro axiomas de Artzner", r"""
<p>Sea \(X\) una pérdida y \(\rho(X)\) el capital exigido. \(\rho\) es coherente si cumple:</p>
<ol class="walk"><li><b>Monotonía:</b> \(X\le Y\Rightarrow\rho(X)\le\rho(Y)\).</li><li><b>Subaditividad:</b> \(\rho(X+Y)\le\rho(X)+\rho(Y)\): diversificar no aumenta el capital.</li><li><b>Homogeneidad positiva:</b> \(\rho(\lambda X)=\lambda\rho(X)\).</li><li><b>Invariancia por traslación:</b> \(\rho(X+c)=\rho(X)+c\).</li></ol>
<p>Consecuencias: \(\rho(0)=0\), \(\rho(c)=c\), \(\rho(X-\rho(X))=0\), \(|\rho(X)-\rho(Y)|\le\|X-Y\|_\infty\) (estabilidad) y \(\mathrm{ess\,inf}X\le\rho(X)\le\mathrm{ess\,sup}X\). El conjunto de aceptación \(\mathcal A_\rho=\{X:\rho(X)\le0\}\) es un cono convexo y \(\rho(X)=\inf\{m:X-m\in\mathcal A_\rho\}\). Con homogeneidad, subaditividad \(\Leftrightarrow\) convexidad. Solvencia II acepta si \(P(X>0)\le0{,}5\%\): ese conjunto no es convexo en general, la versión geométrica de que el VaR no es subaditivo.</p>
<div class="callout"><h4>Contraejemplo</h4><p>\(\rho=\mathbb{E}X+k\sigma\) no es monótona: con \(Y=1\) y \(X=1\) (99 %) o −99 (1 %), \(X\le Y\) pero \(\rho(X)=9{,}95>1=\rho(Y)\).</p></div>"""),
("VaR: definición y propiedades", r"""
<p>\(\mathrm{VaR}_p(X)=\inf\{x:P(X>x)\le1-p\}=F_X^{-1}(p)\): un cuantil. Ventajas: sencillo y comunicable. Cumple monotonía, homogeneidad y traslación (prueba directa con \(P(X+c>x)=P(X>x-c)\), etc.) y es equivariante bajo funciones crecientes. <b>No garantiza subaditividad</b> y no ve la cola más allá del percentil: dos carteras con igual VaR pueden tener colas radicalmente distintas.</p>"""),
("TVaR / Expected Shortfall", r"""
\[ \mathrm{TVaR}_p(X)=\mathbb{E}[X\,|\,X>\mathrm{VaR}_p]=\frac1{1-p}\int_p^1\mathrm{VaR}_u(X)\,du=\min_t\Big\{t+\frac{\mathbb{E}[(X-t)^+]}{1-p}\Big\}\quad(t^*=\mathrm{VaR}_p). \]
<p>La última forma (Rockafellar–Uryasev) da la prueba de subaditividad: con \((a+b)^+\le a^++b^+\), \(\mathrm{TVaR}_p(X+Y)\le t_1+t_2+\frac{\mathbb{E}(X-t_1)^++\mathbb{E}(Y-t_2)^+}{1-p}\) y, con \(t_1=\mathrm{VaR}_p(X)\), \(t_2=\mathrm{VaR}_p(Y)\), queda \(\mathrm{TVaR}_p(X)+\mathrm{TVaR}_p(Y)\), <b>sin hipótesis de dependencia ni de normalidad</b>. Es coherente, \(\ge\mathrm{VaR}_p\), captura la severidad de la cola, pero es más difícil de estimar y exige más capital.</p>
<div class="tbl"><table class="mini"><thead><tr><th>Distribución</th><th>VaR\(_p\)</th><th>TVaR\(_p\)</th><th>TVaR/VaR (p→1)</th></tr></thead><tbody>
<tr><td>Normal</td><td>\(\mu+\sigma z_p\)</td><td>\(\mu+\sigma\varphi(z_p)/(1-p)\)</td><td>1</td></tr>
<tr><td>Exponencial</td><td>\(-\theta\ln(1-p)\)</td><td>VaR + θ</td><td>1</td></tr>
<tr><td>Log-normal</td><td>\(e^{\mu+\sigma z_p}\)</td><td>\(e^{\mu+\sigma^2/2}\Phi(\sigma-z_p)/(1-p)\)</td><td>1 (muy lento)</td></tr>
<tr><td>Pareto(\(x_m,\alpha>1\))</td><td>\(x_m(1-p)^{-1/\alpha}\)</td><td>\(\tfrac\alpha{\alpha-1}\mathrm{VaR}_p\)</td><td>\(\alpha/(\alpha-1)\)</td></tr></tbody></table></div>"""),
("Subaditividad, bonos y comonotonía", r"""
<p><b>Dos bonos independientes</b> (\(q=2\%\), pérdida 100, \(p=97{,}5\%\)): \(\mathrm{VaR}(A)=\mathrm{VaR}(B)=0\) porque \(q<1-p\), pero \(P(\text{al menos un impago})=3{,}96\%>2{,}5\%\) y \(\mathrm{VaR}(A+B)=100\): el VaR no es subaditivo (efecto acantilado). TVaR: 80 cada uno, 101,6 la cartera (\(\le160\)). Con correlación \(\rho\): \(P(A{=}B{=}1)=q^2+\rho q(1-q)\); el VaR de la cartera es 100 para \(\rho<\rho^*\approx0{,}745\) y cae a 0 después (discontinuidad); \(\mathrm{TVaR}(A+B)=101{,}6+78{,}4\rho\) si \(\rho<\rho^*\) y 160 si no.</p>
<p><b>Comonotonía</b> (\(X=f(Z)\), \(Y=g(Z)\) con \(f,g\) no decrecientes): \(\mathrm{VaR}_p\) y \(\mathrm{TVaR}_p\) son aditivos: es el capital sin diversificación (correlación 1 en la fórmula estándar). <b>Normalidad:</b> \(\mathrm{VaR}_p(X+Y)\le\mathrm{VaR}_p(X)+\mathrm{VaR}_p(Y)\) si \(p\ge50\%\), porque \(\sigma(X+Y)\le\sigma_X+\sigma_Y\); fórmula estándar: \(SCR=\sqrt{\sum_{ij}\mathrm{Corr}_{ij}SCR_iSCR_j}\) (con 100, 80 y \(\rho=0{,}25\): 142,83, un 20,7 % menos que 180), exacta solo bajo normalidad.</p>"""),
("Asignación de capital (Euler)", r"""
<p>\(C_i=\mathbb{E}[X_i\,|\,S>\mathrm{VaR}_p(S)]\) cumple \(\sum_iC_i=\mathrm{TVaR}_p(S)\) por linealidad. Para una normal conjunta, \(C_i=\mu_i+\frac{\mathrm{Cov}(X_i,S)}{\sigma_S}\frac{\varphi(z_p)}{1-p}\): cada línea paga su media más su covarianza con el total, no su desviación individual. Con \(A\sim N(3;0{,}5^2)\), \(B\sim N(2;0{,}4^2)\), \(\rho=0{,}3\), \(p=99{,}5\%\): \(C_A=4{,}231\), \(C_B=2{,}874\), total 7,105. Uso: \(RORAC_i=\) beneficio\(_i/C_i\).</p>"""),
("Aplicación: Solvencia II frente a banca", r"""
<div class="tbl"><table class="mini"><thead><tr><th>Marco</th><th>Medida</th><th>Nivel</th><th>Horizonte</th></tr></thead><tbody>
<tr><td>Solvencia II (UE)</td><td>VaR</td><td>99,5 %</td><td>1 año</td></tr><tr><td>SST (Suiza)</td><td>Expected Shortfall</td><td>99 %</td><td>1 año</td></tr>
<tr><td>Basilea II (mercado)</td><td>VaR</td><td>99 %</td><td>10 días</td></tr><tr><td>FRTB (desde 2019)</td><td>Expected Shortfall</td><td>97,5 %</td><td>10–120 días (liquidez)</td></tr></tbody></table></div>
<p>Solvencia II mantiene el VaR por simplicidad, comparabilidad y menor error de estimación con pocos datos; sus limitaciones: no coherente, ciego a la cola sistémica y propenso a la «optimización de cola». La banca ya hizo la transición a ES.</p>"""),
("Los casos de las diapositivas", r"""
<p><b>Caso 1</b> (\(S\sim N(5\text{ M€};0{,}8\text{ M€})\), \(p=99{,}5\%\)): VaR 7.060.663, TVaR 7.313.559; capital 2.060.663 frente a 2.313.559 (+12,3 %). <b>Extensión Log-normal</b> (misma media y varianza): \(\sigma_L^2=0{,}02528\), \(\mu_L=15{,}41231\), VaR 7.435.977, TVaR 7.827.963; capital +18,2 % (VaR) y +22,2 % (TVaR) sobre la Normal; TVaR/VaR del capital sube del 12,3 % al 16,1 %.</p>
<p><b>Caso 2</b> (crédito, 50 M€ cada cartera, \(q=1{,}5\%\), \(p=98\%\)): VaR 0+0 < 50; TVaR 37,5+37,5=75 ≥ 50,56 (beneficio 24,4 M€).</p>
<div class="callout"><h4>Matiz sobre la diapositiva</h4><p>Se dice que con colas pesadas la brecha TVaR−VaR «aumenta con \(p\)». Es cierto para Pareto o t de Student (brecha \(\mathrm{VaR}_p/(\alpha-1)\) creciente), pero con la Log-normal suave de la extensión la brecha absoluta también decrece (452.842 al 95 % → 352.312 al 99,99 %), solo que más despacio que con la Normal.</p></div>"""),
    ],
    repaso=[
dict(q="Enuncia los cuatro axiomas de Artzner y explica el papel de cada uno en la gestión de capital.",
 a=r"""
<p><b>Monotonía</b>: si una cartera pierde siempre más, no puede exigir menos capital (\(E+k\sigma\) la viola). <b>Subaditividad</b>: diversificar no aumenta el capital; permite medir el beneficio de diversificación y evita incentivar la fragmentación. <b>Homogeneidad positiva</b>: el capital escala con la posición (supuesto fuerte: ignora iliquidez). <b>Traslación</b>: da sentido de «capital»: \(\rho(X-\rho(X))=0\).</p>
<p>Consecuencias: \(\rho(0)=0\), \(\rho(c)=c\), Lipschitz \(|\rho(X)-\rho(Y)|\le\|X-Y\|_\infty\), cotas por \(\mathrm{ess\,inf}\) y \(\mathrm{ess\,sup}\), y conjunto de aceptación convexo. El VaR cumple tres; el TVaR, los cuatro.</p>"""),
dict(q="¿Por qué los dos bonos independientes rompen la subaditividad del VaR pero no la del TVaR?",
 a=r"""
<p>Cada bono tiene \(q=2\%<1-p=2{,}5\%\): el VaR por separado es 0. Pero \(P(\text{algún impago})=3{,}96\%>2{,}5\%\): al combinar, el evento cruza el umbral y \(\mathrm{VaR}(A+B)=100\) (efecto acantilado). El VaR es un punto de la distribución y no ve lo que hay bajo ni sobre el percentil.</p>
<p>El TVaR promedia la cola (\(\tfrac1{1-p}\int_p^1\mathrm{VaR}_u\,du\)): 80 + 80 = 160 \(\ge\) 101,6. Matemáticamente, la desigualdad \((a+b)^+\le a^++b^+\) con la fórmula de Rockafellar–Uryasev prueba la subaditividad sin hipótesis de dependencia. El VaR de la cartera cae a 0 para \(\rho\ge0{,}745\) (más dependencia, menos capital: absurdo).</p>"""),
dict(q="¿Qué le aconsejarías a un regulador sobre migrar de VaR a TVaR?",
 a=r"""
<p><b>A favor del TVaR:</b> coherencia; sensibilidad a la cola (dos carteras con igual VaR pueden tener TVaR de 7,3 y 25,4 M€); precedente de FRTB y SST; capital +12 % (Normal) a +16 % (Log-normal). <b>A favor del VaR:</b> el ES se estima peor (error típico 25 % frente a 21 % con 250 datos de una t₄), no existe con α≤1, es menos contrastable (elicitabilidad), y toda la fórmula estándar está calibrada al VaR 99,5 %.</p>
<p><b>Recomendación:</b> no migrar de golpe; mantener el VaR 99,5 % como capital y exigir TVaR (99 % y 99,5 %), cociente TVaR/VaR y análisis de cola en el ORSA y en modelos internos; estudio de impacto para una eventual convergencia al ES 99 % (SST); vigilar la fragmentación del grupo. No hay un nivel equivalente único (p′ de 98,7 % a 98,0 % según la cola).</p>"""),
    ],
    debate=[
dict(q="¿Por qué crees que Solvencia II mantiene el VaR 99,5 % mientras la banca migró al ES (FRTB)?",
 a=r"""
<p>Los argumentos del VaR pesan más en seguros: <b>datos</b> (un dato por año frente a series diarias; error del ES 25,2 % frente a 21,2 % del VaR con 250 observaciones), <b>contrastación</b> (el VaR es elicitable), <b>calibración</b> de toda la fórmula estándar y los modelos internos, y <b>comparabilidad</b> (el ICS de la IAIS usa VaR 99,5 %). A favor del ES: coherencia (en el crédito del banco el VaR «crea» 50 M€ al consolidar), información de cola y menos incentivo a optimizarla.</p>
<p>Relativiza el debate que \(\mathrm{TVaR}_{p'}=\mathrm{VaR}_{99,5}\) para \(p'\) entre 98,7 % (Normal) y 98,0 % (Pareto α=2): pasar a ES 99 % cambia el capital un 3 % (Normal) a un 41 % (Pareto α=2). Vía razonable: VaR como capital y TVaR obligatorio en ORSA.</p>"""),
dict(q="Dos carteras con el mismo VaR 99,5 % pero una con una pequeña probabilidad de pérdidas catastróficas: ¿mismo capital?",
 a=r"""
<p><b>No.</b> Ejemplo: \(X\sim N(5;0{,}8^2)\) M€ y \(Y\) con una parte normal \(N(5;0{,}667^2)\) más una catástrofe de 30 M€ con probabilidad 0,4 % (< 0,5 %), ajustada para igual VaR 99,5 % = 7,06 M€. Pero \(\mathrm{TVaR}_{99,5}\): 7,31 frente a 25,45 M€ (×3,5); \(\mathrm{VaR}_{99,6}\): 7,12 frente a 10,75; \(\mathrm{VaR}_{99,9}\): 7,47 frente a 30; incluso el VaR 99 % de \(Y\) (6,67) es menor que el de \(X\) (6,86).</p>
<p>Métricas adicionales: TVaR/ES a varios niveles y su cociente con el VaR; curva VaR\(_p\) en un rango de \(p\); índice de cola (EVT, Tema 5); escenarios extremos y pérdida máxima; medidas espectrales; neto de reaseguro.</p>"""),
dict(q="¿Qué riesgos de gobernanza o incentivos surgen si se usa el VaR para decidir cómo estructurar filiales?",
 a=r"""
<p><b>Arbitraje regulatorio.</b> Con \(n\) bonos independientes (\(q=2\%\), \(p=97{,}5\%\)): en \(n\) filiales el capital por VaR es 0; consolidado, 100 (n=2) a 500 (n=100). Con TVaR, fragmentar (8.000) cuesta más que consolidar (582,8). <b>Optimización de cola:</b> añadir una pérdida de 1.000 o 10.000 con probabilidad 0,4 % deja el VaR 97,5 % en 0 pero sube el TVaR de 96 a 256 y 1.696.</p>
<p>Riesgos: estructura guiada por capital, retribución ligada a RoC/RORAC, información engañosa al Consejo y al supervisor, riesgo sistémico si todos lo hacen, riesgo legal. Mitigación: medida coherente (o complementaria) a nivel de grupo, supervisión de grupo, ORSA con TVaR y límites de concentración en cola, retribución ajustada por riesgo de cola y diferida.</p>"""),
dict(q="¿Es razonable la homogeneidad positiva para posiciones muy grandes y poco líquidas? ¿Qué extensión del marco abordaría esto?",
 a=r"""
<p>No siempre: con impacto de liquidación creciente, \(\rho_{liq}(\lambda)=\lambda\rho+\kappa\lambda^2>\lambda\rho\) (con \(\kappa=5\%\rho\): ×1,10 a escala 2, ×1,50 a escala 10). Extensión: <b>medidas de riesgo convexas</b> (Föllmer–Schied; Frittelli–Rosazza Gianin), que sustituyen homogeneidad y subaditividad por convexidad (diversificar sigue sin aumentar el riesgo, pero el riesgo puede crecer más que proporcionalmente con el tamaño), y <b>medidas con liquidez</b> (Acerbi–Scandolo; Çetin–Jarrow–Protter), que miden sobre el valor neto del coste de liquidación.</p>
<p>La medida entrópica \(\rho_a(X)=\tfrac1a\ln\mathbb{E}e^{aX}\) es convexa y no homogénea (con \(a=10^{-6}\): escala 2, 11,28 M€ frente a 10,64 M€; escala 10, +54 %): la utilidad exponencial del Tema 1 convertida en capital. El FRTB lo incorpora con horizontes de liquidez de 10 a 120 días.</p>"""),
    ],
    practica=dict(
        intro=r"""<p>El taller de Excel pide tabular VaR y TVaR de una Normal(5 M€; 0,8 M€) para \(p=95\%\), 99 %, 99,5 % y 99,9 %; el de R, calcular VaR y ES con <code>PerformanceAnalytics</code> sobre una serie de cola pesada y reproducir por simulación la no-subaditividad del VaR. Se resuelve en <b>Excel, Python y R</b> y se amplía con la Log-normal y la t de Student, los bonos y el crédito, la asignación de Euler, la fórmula estándar frente a cópulas y el error de estimación.</p>""",
        steps=[
            r"<b>Caso 1 Normal.</b> \(\mathrm{VaR}_p=\mu+\sigma z_p\), \(\mathrm{TVaR}_p=\mu+\sigma\varphi(z_p)/(1-p)\); se comprueba con la integral \(\tfrac1{1-p}\int_p^1\mathrm{VaR}_u\,du\) y con el mínimo de Rockafellar–Uryasev.",
            r"<b>Extensión.</b> Log-normal con \(\sigma_L^2=\ln(1+(\sigma/E)^2)\), \(\mu_L=\ln E-\sigma_L^2/2\), \(\mathrm{TVaR}=E\,\Phi(\sigma_L-z_p)/(1-p)\); t de Student de 4 g.l. con la misma media y desviación.",
            r"<b>Bonos y crédito.</b> Distribución conjunta con \(P(1,1)=q^2+\rho q(1-q)\); VaR y TVaR exactos para \(\rho\) de 0 a 1, umbral \(\rho^*=0{,}745\); Caso 2 del banco (50 M€, \(q=1{,}5\%\), \(p=98\%\)).",
            r"<b>Simulación (taller de R).</b> Dos carteras con pérdida 1 con prob. 1,5 % y ruido pequeño; cartera 0,5A+0,5B; VaR y ES históricos al 98 % con 100.000 escenarios; y VaR/ES de una serie t₄ con los métodos histórico, gaussiano y modificado de <code>PerformanceAnalytics</code>.",
            r"<b>Euler.</b> \(C_i=\mu_i+\mathrm{Cov}(X_i,S)/\sigma_S\cdot\varphi(z_p)/(1-p)\), comprobado con simulación (\(E[X_i|S>\mathrm{VaR}]\)).",
            r"<b>Fórmula estándar.</b> \(SCR=\sqrt{\sum\mathrm{Corr}_{ij}SCR_iSCR_j}\) frente a la distribución conjunta de dos Log-normales con cópula gaussiana y cópula t.",
            r"<b>Error de estimación y niveles equivalentes.</b> Error típico de VaR 99,5 % y ES 99 % con 250 y 2.000 datos de una t₄, y nivel \(p'\) tal que \(\mathrm{ES}_{p'}=\mathrm{VaR}_{99,5}\).",
        ],
        results=[("Resultado","Normal","Log-normal","t₄ (misma media y sd)"),
                 ("VaR 99,5 %","7.060.663","7.435.977","7.604.469"),
                 ("TVaR 99,5 %","7.313.559","7.827.963","8.577.865"),
                 ("Capital VaR","2.060.663","2.435.977","2.604.469"),
                 ("Capital TVaR","2.313.559","2.827.963","3.577.865"),
                 ("TVaR/VaR − 1 (capital)","12,3 %","16,1 %","37,4 %"),
                 ("Brecha TVaR − VaR al 95 % → 99,9 %","334.287 → 221.486 (decrece)","452.842 → 370.544 (decrece, lento)","605.862 → 1.421.588 (crece)")],
        results_note=r"""<p class="note">Bonos (\(p=97{,}5\%\)): \(\rho=0\): VaR(A+B)=100, TVaR=101,6; \(\rho=0{,}5\): 100 y 140,8; \(\rho=0{,}75\): 0 y 160; suma de TVaR individuales = 160 y suma de VaR = 0. Crédito (p=98 %): VaR 0+0 < 50; TVaR 75 ≥ 50,5625. Simulación (semilla 456, 100.000 escenarios): \(0{,}5\mathrm{VaR}(A)+0{,}5\mathrm{VaR}(B)\approx0{,}003\) frente a \(\mathrm{VaR}(0{,}5A+0{,}5B)\approx0{,}50\); ES: 0,75–0,76 frente a 0,51. Los valores simulados cambian ligeramente entre Python y R por usar generadores distintos.</p>""",
        extra=r"""<div class="stats"><div><span>ρ* (VaR cae a 0)</span><b>0,7449</b></div><div><span>Beneficio TVaR del crédito</span><b>24,4 M€</b></div><div><span>Euler: C_A · C_B · total</span><b>4,231 · 2,874 · 7,105</b></div><div><span>Fórmula estándar (100, 80, 0,25)</span><b>142,83 (−20,7 %)</b></div><div><span>ES 99 % / VaR 99,5 % (Normal · t₄ · Pareto α=2)</span><b>1,03 · 1,13 · 1,41</b></div><div><span>Error ES 99 % / VaR 99,5 % (n=250)</span><b>25 % / 21 %</b></div></div>""",
        excel=r"""<p>Seis hojas con fórmulas vivas: <b>Caso1_Normal</b> (\(z_p\), \(\varphi\), VaR, TVaR, brecha, control con <code>NORMINV</code>, capitales y gráfico), <b>Lognormal_t</b> (extensión con <code>NORMSDIST</code>, <code>TINV</code> y <code>GAMMALN</code> para la densidad de la t), <b>Bonos</b> (21 valores de \(\rho\), VaR y TVaR con <code>IF</code>, \(\rho^*\), rango admisible y dos gráficos), <b>Credito</b> (Caso 2 del banco), <b>Euler</b> (contribuciones y comprobación \(\sum C_i=\mathrm{TVaR}\)) y <b>SCR_agregacion</b> (matriz de correlaciones tipo Solvencia II). La verificación detectó un error real de precedencia de Excel (<code>-z^2</code> se evalúa como \((-z)^2\)), corregido con <code>-(z^2)</code>; las 365 fórmulas finales coinciden con Python.</p>""",
        files=dict(xlsx="t4/t4_practica.xlsx", ipynb="t4/t4_practica.ipynb", py="t4/t4_practica.py", r="t4/t4_practica.R"),
        figs_py=[("t4/t4_py_1.png", "Cola: TVaR/VaR − 1 frente a p; Normal y Log-normal tienden a 1 y la Pareto a α/(α−1)."), ("t4/t4_py_2.png", "Bonos: VaR 97,5 % discontinuo y no subaditivo (izq.); TVaR continuo y subaditivo (der.).")],
        figs_r=[("t4/t4_R_bonos.png", "R: VaR y TVaR de la cartera de dos bonos según ρ."), ("t4/t4_R_cola.png", "R: TVaR/VaR − 1 según el nivel de confianza.")],
        lectura=r"""<p><b>Lectura.</b> El TVaR cuesta un 12 % más de capital que el VaR con la Normal y un 16–37 % con colas más pesadas; la brecha absoluta decrece con \(p\) en la Normal y crece con la t₄. El VaR falla la subaditividad en los bonos y el crédito y la simulación lo confirma. La fórmula estándar acierta a unos pocos puntos (−8 % a +5 %) según la asimetría y la dependencia en la cola. El ES se estima peor que el VaR con pocos datos.</p>""",
    ),
    files=dict(repaso_pdf="t4/t4_repaso.pdf", repaso_tex="t4/t4_repaso.tex", debate_pdf="t4/t4_debate.pdf", debate_tex="t4/t4_debate.tex"),
    sources="Diapositivas «Gestión de Capital y Medidas Coherentes de Riesgo — VaR / TVaR» · Prof. Hugo González Riera",
)
