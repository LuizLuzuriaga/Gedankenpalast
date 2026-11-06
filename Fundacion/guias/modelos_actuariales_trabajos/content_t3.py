# Contenido HTML explicado del Tema 3 (MathJax con \( \) y \[ \]).
T = dict(
    id="t3", num=3, slug="t3",
    title="Modelo colectivo de riesgo: frecuencia, severidad y agregación",
    short="Colectivo",
    lede="Cómo se separa el riesgo de cuántos siniestros hay del de cuánto cuesta cada uno, qué distribuciones se usan y cómo se obtiene la distribución exacta de la siniestralidad total con Panjer y la FFT.",
    explain=[
("Por qué un enfoque colectivo", r"""
<p>El modelo individual necesita \(q_i\) y la severidad de cada póliza; en carteras grandes y heterogéneas (Auto, Hogar) esa información es costosa. El colectivo modela directamente el <b>número de siniestros</b> de toda la cartera y, por separado, el <b>coste unitario</b>. Es el estándar de Seguros Generales y separa dos fuentes de riesgo: frecuencia y severidad.</p>"""),
("El modelo y sus momentos", r"""
<p>\(S=X_1+\dots+X_N\) con \(N\) aleatorio (frecuencia) y \(X_i\) i.i.d. (severidad), independientes de \(N\). Por la fórmula de la varianza total (Wald / Blackwell–Girshick):</p>
\[ \mathbb{E}(S)=\mathbb{E}(N)\,\mathbb{E}(X),\qquad \mathrm{Var}(S)=\underbrace{\mathbb{E}(N)\,\mathrm{Var}(X)}_{\text{severidad}}+\underbrace{\mathrm{Var}(N)\,\mathbb{E}(X)^2}_{\text{frecuencia}},\qquad M_S(t)=M_N\big(\ln M_X(t)\big). \]
<p>Con Poisson, \(\mathrm{Var}(S)=\lambda\,\mathbb{E}(X^2)\). Hay un tercer momento análogo: \(\mu_3(S)=\mathbb{E}(N)\mu_3(X)+3\mathrm{Var}(N)\mathbb{E}(X)\mathrm{Var}(X)+\kappa_3(N)\mathbb{E}(X)^3\). La variación relativa es \(CV_S^2=\mathrm{Var}(N)/\mathbb{E}(N)^2+CV_X^2/\mathbb{E}(N)\): el segundo sumando se diversifica con el volumen; el primero, con sobredispersión, deja un suelo.</p>
<div class="callout"><h4>Hipótesis</h4><p>Independencia entre \(N\) y las \(X_i\); severidades i.i.d. (hay que segmentar bien); sin dependencia entre siniestros (no recoge catástrofes sin extensiones); una mala elección de frecuencia o severidad distorsiona la cola, donde está el capital.</p></div>"""),
("Distribuciones de frecuencia", r"""
<div class="grid2">
<div class="card"><span class="tag">Poisson(λ)</span><p>\(P(N=n)=e^{-\lambda}\lambda^n/n!\), \(\mathbb{E}N=\mathrm{Var}N=\lambda\) (equidispersión), \(P_N(z)=e^{\lambda(z-1)}\). Límite de muchos riesgos con probabilidad pequeña; modelo por defecto sin evidencia de sobredispersión.</p></div>
<div class="card"><span class="tag">Binomial Negativa(r, β)</span><p>\(\mathbb{E}N=r\beta\), \(\mathrm{Var}N=r\beta(1+\beta)>\mathbb{E}N\). Es una <b>mezcla Poisson–Gamma</b>: \(\Lambda\sim\Gamma(r,\beta)\), \(N|\Lambda\sim\mathrm{Poisson}(\Lambda)\); \(P_N(z)=(1-\beta(z-1))^{-r}\). Modela heterogeneidad no observada.</p></div></div>"""),
("Distribuciones de severidad", r"""
<div class="tbl"><table class="mini"><thead><tr><th>Distribución</th><th>Media</th><th>Varianza</th><th>Cola</th><th>Uso típico</th></tr></thead><tbody>
<tr><td>Gamma(α,θ)</td><td>\(\alpha\theta\)</td><td>\(\alpha\theta^2\)</td><td>ligera (exponencial)</td><td>Auto: daño propio, lunas</td></tr>
<tr><td>Log-normal</td><td>\(e^{\mu+\sigma^2/2}\)</td><td>\((e^{\sigma^2}-1)e^{2\mu+\sigma^2}\)</td><td>moderada</td><td>Hogar: agua, robo</td></tr>
<tr><td>Pareto(α,θ)</td><td>\(\theta/(\alpha-1)\), α&gt;1</td><td>\(\alpha\theta^2/[(\alpha-1)^2(\alpha-2)]\), α&gt;2</td><td>pesada (potencia)</td><td>RC, incendio, grandes siniestros</td></tr></tbody></table></div>
<p class="note">Una Pareto tiene \(\mathbb{E}[X^k]<\infty\) solo si \(k<\alpha\): con \(\alpha\le2\) no hay varianza; con \(\alpha\le3\), no hay tercer momento.</p>"""),
("Cálculo exacto: convolución, Panjer y FFT", r"""
<p>La distribución exacta es \(P(S=x)=\sum_n P(N=n)f_X^{*n}(x)\), prohibitiva por convolución directa.</p>
<div class="card"><span class="tag">Recursión de Panjer (clase (a,b,0))</span>
<p>Si \(p_n=(a+b/n)p_{n-1}\) (Poisson: \(a=0,b=\lambda\); BN: \(a=\beta/(1+\beta)\), \(b=(r-1)\beta/(1+\beta)\)), con la severidad discretizada \(f_j\) en una malla \(h\):</p>
\[ g_0=P_N(f_0),\qquad g_k=\frac{1}{1-af_0}\sum_{j=1}^{k}\Big(a+\frac{bj}{k}\Big)f_jg_{k-j}\ \ \Big(\text{Poisson: }g_k=\frac\lambda k\sum_{j=1}^kj f_jg_{k-j}\Big). \]
<p>Coste \(O(M^2)\). Pasos: elegir \(N\); hallar \(a,b\); discretizar la cuantía; calcular \(f_k\); \(g_0=P_N(f_0)\); aplicar la recursión; comprobar que suman 1; extraer momentos y cuantiles. Limitaciones: discretización, precisión según \(h\), colas muy pesadas, y <i>underflow</i>: con \(\lambda=1.200\), \(g_0=e^{-1200}\) desborda.</p></div>
<div class="card"><span class="tag">FFT</span>
<p>La función generatriz de \(S\) es \(P_N(\varphi_X)\): se transforma el vector de severidad, se aplica la fgp de \(N\) punto a punto y se invierte: \(g=\mathrm{IFFT}\big(P_N(\mathrm{FFT}(f))\big)\); para Poisson, \(\exp\{\lambda(\widehat f-1)\}\). Coste \(O(M\log M)\); no tiene el problema del desbordamiento. Riesgo: <b>aliasing</b> (si \(S\) supera la rejilla, la cola reaparece por la izquierda) → relleno de ceros hasta \(M\) suficientemente grande.</p></div>
<p>En el ejemplo \(\lambda=5\), \(\Gamma(2,300)\), \(h=10\): \(g_0=0{,}006742576\), masa hasta 15.000 € = 0,999999184, \(\mathbb{E}S=3.000\), \(\sigma_S=1.643\) y \(VaR_{99,5\%}=8.290\); Panjer y FFT coinciden (diferencia \(\sim10^{-12}\)).</p>"""),
("Aproximaciones, riesgo de cola y medidas", r"""
<p>Normal y Normal Power usan los mismos momentos que en el Tema 2. Funcionan con muchos siniestros esperados (TCL) y severidad ligera; <b>fallan con Pareto</b> (\(\alpha\le3\) para NP; \(\alpha\le2\) para la Normal), donde hay que usar Panjer/FFT o simulación. El reaseguro de exceso de pérdida trunca la severidad y mejora la fiabilidad de las aproximaciones. Medidas: <b>VaR</b> \(=F_S^{-1}(p)\) (SCR, \(p=99{,}5\%\)) y <b>TVaR</b> \(=\mathbb{E}[S\,|\,S>VaR_p]\) (SST), más sensible a la cola.</p>"""),
("Los casos de las diapositivas", r"""
<p><b>Caso 1 · Auto</b> (Poisson 1.200; Gamma(2,450)): \(\mathbb{E}(S)=1.080.000\), \(\mathrm{Var}=\lambda\alpha\theta^2(1+\alpha)=1{,}458\cdot10^9\), \(SD=38.184\), VaR Normal 1.178.361 (capital 98.361, el 9,1 % de la media). Con la FFT, el VaR exacto es 1.180.040: la brecha sistemática es ≈1.700 € por la asimetría de la Gamma.</p>
<p><b>Caso 2 · Hogar</b> (BN(50,3); Pareto(4,3.000)): \(\mathbb{E}N=150\), \(\mathrm{Var}N=600\), \(\mathbb{E}X=1.000\), \(\mathrm{Var}X=2\cdot10^6\), \(\mathbb{E}S=150.000\), \(\mathrm{Var}S=9\cdot10^8\), VaR Normal 227.280 (capital = 51 % de la media). VaR exacto 238.300; Normal Power 238.545.</p>
<div class="callout"><h4>Verificación</h4><p>La diapositiva dice que ambas carteras tienen \(SD/E\) «similar»: no lo es (3,5 % en Auto frente a 20 % en Hogar). Con la BN el cociente tiene un suelo \(\sqrt{1/r}=14{,}1\%\) que ningún aumento de tamaño elimina. Las tablas «ilustrativas» de R de la diapositiva (VaR Panjer ≈ 1.192.500 con el MLE de la semilla) dependen de la muestra: con los parámetros teóricos sale 1.180.040.</p></div>"""),
("Marco regulatorio", r"""
<ul class="tight"><li><b>Solvencia II:</b> el submódulo de suscripción No Vida se basa en frecuencia y severidad; SCR = VaR 99,5 % a un año sobre la distribución agregada.</li>
<li><b>NIIF 17:</b> ajuste de riesgo de No Vida calculado sobre la distribución de la siniestralidad futura, habitualmente con modelos colectivos con severidad ajustada por MLE.</li>
<li><b>SST:</b> Expected Shortfall, más exigente con severidades de cola pesada.</li>
<li><b>Modelos internos:</b> deben justificar frecuencia y severidad frente a los datos (bondad de ajuste, <i>back-testing</i>).</li></ul>"""),
    ],
    repaso=[
dict(q=r"""¿Por qué \(\mathrm{Var}(S)\) tiene dos términos (\(\mathbb{E}(N)\mathrm{Var}(X)\) y \(\mathrm{Var}(N)\mathbb{E}(X)^2\)) y qué mide cada uno?""",
 a=r"""
<p>Varianza total con \(\mathbb{E}[S|N]=N\mathbb{E}X\) y \(\mathrm{Var}(S|N)=N\mathrm{Var}X\): \(\mathrm{Var}S=\mathbb{E}[N]\mathrm{Var}X+\mathrm{Var}(N)\mathbb{E}X^2\). El primer término es el <b>riesgo de severidad</b> (aunque supiéramos cuántos siniestros hay, cada uno cuesta distinto); el segundo, el de <b>frecuencia</b> (aunque todos costaran lo mismo, cambia cuántos hay).</p>
<p>Numéricamente, en Auto \(4{,}86\cdot10^8+9{,}72\cdot10^8\) y en Hogar \(3\cdot10^8+6\cdot10^8\): <b>dos tercios de la varianza vienen de la frecuencia</b>. Además \(CV_S^2=\mathrm{Var}N/\mathbb{E}N^2+CV_X^2/\mathbb{E}N\): el segundo sumando se diversifica con el volumen, el primero deja un suelo con BN (Hogar: \(\sqrt{1/50}=14{,}1\%\)).</p>"""),
dict(q="¿Por qué la Binomial Negativa se interpreta como una mezcla Poisson–Gamma y qué papel juega en la sobredispersión?",
 a=r"""
<p>Si \(\Lambda\sim\Gamma(r,\beta)\) y \(N|\Lambda\sim\mathrm{Poisson}(\Lambda)\), integrando resulta \(P(N=n)=\frac{\Gamma(n+r)}{n!\Gamma(r)}(\tfrac1{1+\beta})^r(\tfrac\beta{1+\beta})^n\); su fgp es \((1-\beta(z-1))^{-r}\). Por varianza total, \(\mathrm{Var}N=\mathbb{E}\Lambda+\mathrm{Var}\Lambda=r\beta(1+\beta)>\mathbb{E}N\): la sobredispersión es la varianza de la tasa aleatoria.</p>
<p>Representa heterogeneidad no observada (los asegurados tienen distinta tasa), correlación entre siniestros del mismo asegurado (bonus-malus) y factores comunes de año (no diversificables). Ignorarla subestima el capital: en Hogar, con Poisson de la misma media, el VaR Normal baja de 227.275 a 204.642 (−10 %).</p>"""),
dict(q="Si el MLE de severidad arroja una Pareto con α = 1,8, ¿qué implica para el capital y para la Normal Power?",
 a=r"""
<p>\(\mathbb{E}X\) existe (\(1{,}25\theta\)) pero \(\mathrm{Var}X=\infty\) y \(\mu_3=\infty\): <b>ni Normal ni Normal Power son aplicables</b>; la varianza muestral no converge (3,7·10⁶ con n=100 → 7,2·10⁷ con n=10⁵). Hay que usar Panjer/FFT, simulación o EVT.</p>
<p>El capital lo fija un solo siniestro: \(VaR_p\approx F_X^{-1}(1-(1-p)/\mathbb{E}N)+\mathbb{E}S\) (con \(\theta=800\), E(N)=150: 394.886, 2,6 veces la media). Es hipersensible a \(\alpha\) (VaR 249.750 con α=3; 337.500 con α=2; 633.750 con α=1,5) y el TVaR es mucho mayor que el VaR. Respuesta: Pareto generalizada sobre umbral (Tema 5), reaseguro de exceso de pérdida, límites de póliza y márgenes por incertidumbre de α.</p>"""),
    ],
    debate=[
dict(q="¿Cómo detectarías si la frecuencia tiene sobredispersión y requiere Binomial Negativa en lugar de Poisson?",
 a=r"""
<p>(1) Normalizar por exposición (offset). (2) Índice de dispersión \(s^2/\bar y\) (≈1 si Poisson; \(=1+\beta\) en BN). (3) Contraste \(\chi^2\) de dispersión, o test de Cameron–Trivedi en regresión. (4) Razón de verosimilitudes Poisson vs BN (en la frontera: mezcla \(\tfrac12\chi^2_0+\tfrac12\chi^2_1\)). (5) AIC/BIC y recuentos observados frente a esperados.</p>
<p><b>Ejemplo (20.000 pólizas con tasa Gamma):</b> media 0,1514, varianza 0,2024, índice 1,337, \(\chi^2=26.738\) (p≈10⁻²⁰⁵), \(LR=587\), AIC 18.409 (Poisson) frente a 17.824 (BN); con 3 siniestros hay 82 pólizas observadas frente a 10 esperadas por Poisson y 74 por la BN. Después se investiga la causa (variables tarifarias, siniestros agrupados, factores de año, exceso de ceros).</p>"""),
dict(q="En Hogar, ¿qué estructura de reaseguro de exceso de pérdida recomendarías para reducir la asimetría de S?",
 a=r"""
<p><b>XL por riesgo con prioridad ≈5.000–10.000 € (5–10 veces la media) más cat XL por evento.</b> Con la cartera de Hogar (exacto por FFT): d=5.000 baja el VaR de 238.300 a 218.400 (−8 %), pero \(\gamma_S\) solo de 0,40 a 0,31, porque la asimetría viene sobre todo de la frecuencia. Con carga 30 % y coste de capital 6 %, la carga máxima rentable es 10,8 % (d=1.500), 15,1 % (d=5.000), 23,8 % (d=10.000) y 48,6 % (d=20.000): solo prioridades altas compensan.</p>
<p>El XL por riesgo no protege contra acumulación (tormenta con miles de siniestros pequeños): hace falta cat XL o stop-loss. La cuota-parte deja \(\gamma_S\) invariante.</p>"""),
dict(q="¿Qué riesgos asume quien usa la Normal con severidad Pareto de cola muy pesada (α cercano a 1)?",
 a=r"""
<p>Con α≤2 la Normal no existe (varianza infinita) y con α≤3 tampoco la Normal Power. Un estimador de varianza muestral es inestable y arbitrario. El capital exacto se dispara (VaR/E−1 = 56 % con α=5, 80 % con 2,5, 125 % con 2, 323 % con 1,5) mientras la Normal permanece casi plana: <b>infracapitalización silenciosa</b>. El VaR está dominado por un solo siniestro (\(P(S>x)\approx\mathbb{E}N\,P(X>x)\); con α=1,5, 632.245 frente a 633.750 exacto), la diversificación es ilusoria y el TVaR es varias veces el VaR (1,42 M€ frente a 0,63 M€). Hay que usar Panjer/FFT, EVT y reaseguro de cola, con márgenes por incertidumbre de α.</p>"""),
dict(q="¿Cuándo sería más adecuado el modelo individual en una cartera grande de Generales?",
 a=r"""
<p>Cuando fallan las hipótesis del colectivo o se necesitan decisiones por póliza: <b>grandes riesgos identificables</b> con capital y límite propios; <b>severidad acotada por póliza</b> (capital fijo); <b>un solo siniestro posible por póliza</b> (con \(q\) no pequeña el Poisson sobrestima la varianza en \(\sum q_i^2\mu_i^2\)); decisiones de suscripción, recargos y reaseguro por riesgo; y calibraciones por póliza (GLM) con trazabilidad.</p>
<p><b>Matiz:</b> la heterogeneidad por sí sola no justifica el individual con frecuencia Poisson, porque la suma de Poisson compuestos independientes es Poisson compuesto con severidad mezcla (en la hoja de los cuatro segmentos, \(\mathrm{Var}=1{,}715\cdot10^9\) por ambos caminos). Pierde información con sobredispersión o si cambia la composición. Práctica habitual: modelo híbrido (colectivo para la cartera atritional, individual para riesgos singulares).</p>"""),
    ],
    practica=dict(
        intro=r"""<p>El taller de Excel pide la <b>recursión de Panjer</b> de uno de los cuatro segmentos de Auto y la agregación por aditividad del Poisson compuesto; el de R, el ajuste MLE de la severidad (Gamma frente a Pareto) y la agregación exacta por Panjer y FFT. Se resuelve todo en <b>Excel, Python y R</b> y se amplía con el Caso 2 de Hogar (Binomial Negativa–Pareto), un test de sobredispersión y un estudio de la cola al bajar \(\alpha\).</p>""",
        steps=[
            r"<b>Ejemplo de Panjer (λ=5, Γ(2,300), h=10).</b> Se discretiza la Gamma de forma central (\(f_0=F(h/2)\), \(f_j=F((j+\tfrac12)h)-F((j-\tfrac12)h)\)) y se aplica \(g_k=\tfrac\lambda k\sum j f_jg_{k-j}\). Se comprueba \(g_0=0{,}006742576\), media 3.000, desviación 1.643 y \(VaR_{99,5}=8.290\).",
            r"<b>Caso 1 Auto con FFT.</b> Con \(\lambda=1.200\) la recursión desborda, así que \(g=\mathrm{IFFT}(\exp\{\lambda(\mathrm{FFT}(f)-1)\})\) con \(M=2^{18}\) puntos y \(h=10\) €.",
            r"<b>MLE de severidad.</b> Muestra de 500 siniestros \(\Gamma(2,450)\) (semilla 123): ajuste de Gamma y Pareto por máxima verosimilitud y comparación por AIC; agregación con la Gamma estimada.",
            r"<b>Caso 2 Hogar.</b> Momentos de la BN y de la Pareto (incluido \(\mu_3(S)\)), VaR Normal y Normal Power, distribución exacta por FFT con \(P_N(z)=(1-\beta(z-1))^{-r}\), Panjer para la BN (\(a=\beta/(1+\beta)\), \(b=(r-1)\beta/(1+\beta)\)), TVaR y Monte Carlo.",
            r"<b>Cuatro segmentos.</b> \(\lambda_j,\alpha_j,\theta_j\): se suman \(E\), \(\mathrm{Var}\), \(\mu_3\) y se comprueba que la mezcla con \(\lambda=\sum\lambda_j\) coincide con el producto de las cuatro transformadas.",
            r"<b>Sobredispersión y cola.</b> Contraste de dispersión y razón de verosimilitudes en una cartera simulada, y VaR exacto de Hogar al bajar \(\alpha\) de 5 a 1,5 con \(\mathbb{E}X=1.000\) fija.",
        ],
        results=[("Cartera","Método","E(S)","SD","VaR 99,5 % Normal","VaR 99,5 % Normal Power","VaR 99,5 % exacto"),
                 ("Ejemplo teórico (λ=5, Γ(2,300))","Panjer = FFT","3.000","1.643","7.232","—","8.290"),
                 ("Caso 1 · Auto (Poisson 1.200, Γ(2,450))","FFT","1.080.000","38.184","1.178.355","1.180.045","1.180.040"),
                 ("Caso 2 · Hogar (BN(50,3), Pareto(4,3.000))","FFT = Panjer(BN)","150.000","30.000","227.275","238.545","238.300"),
                 ("Cuatro segmentos de Auto","FFT","1.134.500","41.418","1.241.185","1.243.165","1.243.150")],
        results_note=r"""<p class="note">VaR en euros, con \(z=2{,}5758\). La diapositiva usa \(z=2{,}576\): 1.178.361 y 227.280. TVaR 99,5 % del Caso 2: 252.671. Las muestras aleatorias (MLE, Monte Carlo, test de sobredispersión) <b>difieren entre Python y R</b> porque sus generadores son distintos, y por eso las cifras de ajuste pueden variar ligeramente; los resultados analíticos y exactos coinciden en las tres herramientas. Con el ajuste MLE de cada muestra, el VaR exacto pasa de 1,18 M€ (parámetros teóricos) a 1,19 M€ (Python) y 1,11 M€ (R): esa es la incertidumbre de parámetros con 500 siniestros.</p>""",
        extra=r"""<div class="stats"><div><span>Auto: SD/E</span><b>3,5 %</b></div><div><span>Hogar: SD/E</span><b>20 %</b></div><div><span>Hogar: Normal frente al exacto</span><b>−4,6 %</b></div><div><span>Pareto α=2 · VaR/E−1</span><b>125 %</b></div><div><span>Pareto α=1,5 · VaR/E−1</span><b>323 %</b></div><div><span>Dispersión simulada</span><b>1,337 (p≈10⁻²⁰⁵)</b></div></div>""",
        excel=r"""<p>Cinco hojas con fórmulas vivas: <b>Caso1_Auto</b> y <b>Caso2_Hogar</b> (momentos de frecuencia y severidad, \(\mathbb{E}S\), \(\mathrm{Var}S\), \(\mu_3(S)\), asimetría, VaR Normal y Normal Power con las fórmulas de Wald y de cumulantes), <b>Segmentos</b> (taller: los cuatro segmentos Poisson–Gamma, suma de medias y varianzas, severidad mezcla y comprobación \(\mathrm{Var}=\lambda E[X^2]\)) y <b>Panjer</b>: la recursión completa con 1.001 filas (\(h=10\), hasta 10.000 €), con <code>GAMMADIST</code> para discretizar, la columna auxiliar «\(g_k\) invertida» para alinear \(\sum jf_jg_{k-j}\) con <code>SUMPRODUCT</code>, \(F_S\), \(\mathbb{E}S\), \(\mathrm{Var}S\), VaR 90/95/99,5 % y gráficos. Los valores exactos de los Casos 1 y 2 vienen de Python/R (en azul). Las 7.113 fórmulas se verificaron contra Python.</p>""",
        files=dict(xlsx="t3/t3_practica.xlsx", ipynb="t3/t3_practica.ipynb", py="t3/t3_practica.py", r="t3/t3_practica.R"),
        figs_py=[("t3/t3_py_1.png", "Caso 1 Auto (izquierda): F(x) exacta frente a Normal; Caso 2 Hogar (derecha): cola P(S>x) en escala log.")],
        figs_r=[("t3/t3_R_auto.png", "R: Caso 1 Auto, F(x) exacta frente a Normal."), ("t3/t3_R_hogar.png", "R: Caso 2 Hogar, cola exacta, Normal y Normal Power."), ("t3/t3_R_cola.png", "R: capital relativo al engordar la cola de la Pareto.")],
        lectura=r"""<p><b>Lectura.</b> Con 1.200 siniestros esperados y severidad ligera, la Normal es casi suficiente (diferencia de 1.700 € sobre 1,18 M€). Con frecuencia BN y Pareto, la Normal se queda un 4,6 % corta y la Normal Power funciona porque \(\alpha=4>3\). Al engordar la cola el capital exacto se dispara y la Normal ni siquiera existe: es el momento de pasar a Panjer/FFT, EVT y reaseguro de cola. Python, R y Excel coinciden en todo lo analítico.</p>""",
    ),
    files=dict(repaso_pdf="t3/t3_repaso.pdf", repaso_tex="t3/t3_repaso.tex", debate_pdf="t3/t3_debate.pdf", debate_tex="t3/t3_debate.tex"),
    sources="Diapositivas «Modelo Colectivo de Riesgo — Frecuencia, Severidad y Agregación» · Prof. Hugo González Riera",
)
