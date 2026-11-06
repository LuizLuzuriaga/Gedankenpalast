# Contenido HTML explicado del Tema 2 (MathJax con \( \) y \[ \]).
T = dict(
    id="t2", num=2, slug="t2",
    title="Modelo individual del coste total de siniestralidad",
    short="Individual",
    lede="Cómo se describe la siniestralidad agregada de una cartera póliza a póliza, qué se puede calcular de forma exacta y cuándo (y por qué) hay que corregir la aproximación Normal con tres momentos.",
    explain=[
("Por qué modelar la siniestralidad agregada", r"""
<p>Una aseguradora no gestiona pólizas aisladas: paga y provisiona el <b>agregado</b> de toda la cartera en un periodo. El capital depende de la <i>cola</i> de ese agregado, no solo de la media: ¿con qué probabilidad la siniestralidad total \(S\) supera el capital disponible? ¿cuál es su percentil 99,5 %? De \(S\) dependen la tarificación, las reservas, el reaseguro y el SCR.</p>"""),
("El modelo: una suma de variables independientes no idénticas", r"""
<p>Con \(n\) pólizas en un periodo (habitualmente un año), \(X_i\) es el coste total de la póliza \(i\) y</p>
\[ S=X_1+\dots+X_n,\qquad X_i=I_i\,B_i,\quad I_i\sim\mathrm{Bernoulli}(q_i),\quad B_i\ \text{severidad con media }\mu_i\text{ y varianza }\sigma_i^2 . \]
<p>Es un esquema de «urna dentro de urna»: primero se sortea si hay siniestro y, solo si lo hay, su coste. Así se modela la masa de probabilidad en cero junto con la parte continua o discreta del coste. Las \(X_i\) son <b>independientes</b> (hipótesis) pero <b>no idénticas</b> (cada póliza tiene su \(q_i\), su capital, su perfil). Es la diferencia con el colectivo, donde \(S=Y_1+\dots+Y_N\) con \(Y_j\) i.i.d.</p>
<div class="tbl"><table class="mini"><thead><tr><th></th><th>Individual</th><th>Colectivo</th></tr></thead><tbody>
<tr><td>Unidad</td><td>cada póliza \(i\)</td><td>nº de siniestros \(N\) y severidad \(Y\)</td></tr>
<tr><td>Cálculo</td><td>convolución, De Pril, FFT</td><td>Panjer, Poisson compuesto, FFT</td></tr>
<tr><td>Ventaja</td><td>realismo y trazabilidad por póliza</td><td>agilidad de cálculo</td></tr></tbody></table></div>"""),
("Momentos y funciones generatrices", r"""
<p>Por la fórmula de la varianza total, \(\mathrm{Var}(X_i)=\mathbb{E}[\mathrm{Var}(X_i|I_i)]+\mathrm{Var}[\mathbb{E}(X_i|I_i)]\), y por independencia entre pólizas se suman las esperanzas y las <b>varianzas</b> (no las desviaciones típicas):</p>
\[ \mathbb{E}(S)=\sum_i q_i\mu_i,\qquad \mathrm{Var}(S)=\sum_i\Big[\,q_i\sigma_i^2+q_i(1-q_i)\mu_i^2\Big]. \]
<p>El primer sumando es incertidumbre de <i>severidad</i>; el segundo, de <i>ocurrencia</i>. Con severidad fija \(b_i\) (vida) queda \(\mathrm{Var}(X_i)=q_i(1-q_i)b_i^2\) y el tercer momento central \(\mu_3(X_i)=b_i^3q_i(1-q_i)(1-2q_i)\); también se suman.</p>
<p>Las transformadas convierten sumas en productos: \(M_S(t)=\prod_i[1-q_i+q_iM_{B_i}(t)]\), \(P_S(z)=\prod_i[1-q_i+q_iP_{B_i}(z)]\). Permiten recuperar momentos por derivación y probabilidades por inversión (FFT, recursiones).</p>
<div class="callout"><h4>Limitaciones</h4><p>Independencia (no capta pandemias ni catástrofes que correlacionan pólizas); a lo sumo un siniestro por póliza; necesidad de datos granulares; coste computacional del cálculo exacto.</p></div>"""),
("Cálculo exacto", r"""
<p>La <b>convolución</b> directa es prohibitiva para \(n\) grande. La <b>recursión de De Pril</b> (1986) da la distribución exacta cuando las cuantías son enteras (múltiplos de una unidad), y la <b>FFT</b> invierte la transformada sobre cuantías discretizadas. En el ejercicio práctico se implementa la convolución recursiva \(P_k(s)=(1-q_k)P_{k-1}(s)+q_kP_{k-1}(s-u_k)\) y se usa como <i>referencia exacta</i> para juzgar las aproximaciones.</p>"""),
("Aproximación Normal y por qué se queda corta", r"""
<p>\(F_S(x)\approx\Phi\big((x-\mathbb{E}S)/\sqrt{\mathrm{Var}S}\big)\), válida asintóticamente si ninguna póliza domina la suma (condición de Lindeberg). Es sencilla, pero ignora la asimetría positiva \(\gamma_S=\mu_3(S)/\sigma_S^3\). El primer término de Edgeworth, \(F_S\approx\Phi(z)-\varphi(z)\tfrac{\gamma_S}{6}(z^2-1)\), es negativo para \(z>1\): la cola real es más gruesa y el cuantil verdadero, mayor que el Normal. El error se concentra justo en el nivel regulatorio.</p>"""),
("Aproximaciones de tres momentos", r"""
<div class="grid2">
<div class="card"><span class="tag">Gamma trasladada</span>
<p>\(S\approx k+\Gamma(\alpha,\beta)\) con la Gamma de forma \(\alpha\) y tasa \(\beta\). Una Gamma tiene asimetría \(2/\sqrt\alpha\), varianza \(\alpha/\beta^2\) y media \(\alpha/\beta\); igualando los tres momentos de \(S\):</p>
\[ \alpha=\frac{4}{\gamma_S^2},\quad \beta=\frac{2}{\sigma_S\gamma_S},\quad k=\mathbb{E}(S)-\frac{2\sigma_S}{\gamma_S}. \]
<p>El desplazamiento \(k\) puede ser negativo y no altera ni varianza ni asimetría.</p></div>
<div class="card"><span class="tag">Normal Power (Cornish–Fisher)</span>
\[ x_p\approx\mathbb{E}(S)+\sigma_S\Big[z_p+\frac{\gamma_S}{6}(z_p^2-1)\Big]. \]
<p>Corrige el cuantil Normal con un término proporcional a la asimetría; crece con \(z_p^2\), así que es pequeño al 90 % y grande al 99,5 %. Si \(\gamma_S=0\) recupera la Normal.</p></div></div>
<p class="note">Progresión natural: Normal → Gamma → Gamma trasladada → Normal Power. Las dos últimas ajustan tres momentos y son las que mejor reproducen la cola derecha.</p>"""),
("Ejemplo de tres pólizas y su advertencia", r"""
<p>\(q=(0{,}01;0{,}02;0{,}03)\), \(b=(100.000;150.000;200.000)\): \(\mathbb{E}(S)=10.000\), \(\mathrm{Var}=1{,}704\cdot10^9\), \(SD\approx41.280\), \(\gamma_S\approx4{,}15\). VaR 99,5 %: Normal 116.329; Gamma trasladada 240.076; Normal Power 277.284 (las diapositivas dan 116.336 y 277.316 por redondeo de \(z\)).</p>
<div class="callout"><h4>Lectura que conviene hacer</h4><p>Con tres pólizas \(S\) solo toma 8 valores y \(P(S=0)=0{,}94\). El percentil 99,5 % <b>exacto es 200.000</b>: la Normal infravalora, pero Gamma y Normal Power <i>sobrestiman</i> mucho. Ninguna aproximación continua es fiable en una cartera tan pequeña; ahí se usa la distribución exacta.</p></div>"""),
("Los casos de las diapositivas", r"""
<p><b>Caso 1 (Vida, 1.000 pólizas en 4 grupos):</b> \(\mathbb{E}(S)=610.000\), \(\mathrm{Var}\approx1{,}172\cdot10^{11}\), \(SD\approx342.354\), VaR Normal \(\approx1.491.844\) (capital \(\approx882.000\), el 145 % de la prima de riesgo). El grupo D (50 pólizas) aporta el 38 % de la varianza con el 24,6 % de la prima esperada (la diapositiva habla del 5 %, que es su peso en número de pólizas).</p>
<p><b>Caso 2 (Accidentes, severidad \(U(0,M_i)\)):</b> \(\mu_i=M_i/2\), \(\sigma_i^2=M_i^2/12\). \(\mathbb{E}(S)=84.500\), \(\mathrm{Var}\approx4{,}651\cdot10^8\), VaR Normal \(\approx140.049\) (VaR/E ≈ 1,66). La severidad aleatoria añade riesgo de proceso ausente en el Caso 1.</p>
<div class="callout"><h4>Verificación importante</h4><p>La tabla de la diapositiva de Monte Carlo (VaR ≈ 1.486.900 €, por debajo del Normal) no es reproducible: la distribución exacta y la simulación dan <b>≈ 1,65–1,70 M€</b>, por encima del Normal, como la propia diapositiva comenta. Ver el ejercicio práctico.</p></div>"""),
("Marco regulatorio", r"""
<ul class="tight"><li><b>Solvencia II:</b> SCR basado en el VaR 99,5 % a un año; el modelo individual alimenta el Best Estimate y el riesgo de suscripción.</li>
<li><b>NIIF 17:</b> flujos de cumplimiento y ajuste de riesgo, que dependen de la distribución y no solo de la media.</li>
<li><b>SST suizo:</b> Expected Shortfall, más sensible a la forma de la cola.</li>
<li><b>Modelos internos:</b> hay que justificar y documentar la independencia entre pólizas.</li></ul>"""),
    ],
    repaso=[
dict(q=r"""¿Por qué las \(X_i\) son independientes pero no idénticamente distribuidas? ¿Qué implica para \(\mathrm{Var}(S)\)?""",
 a=r"""
<p><b>No idénticas:</b> cada póliza trae su propio \((q_i,\mu_i,\sigma_i^2)\) o capital \(b_i\). <b>Independientes:</b> hipótesis de modelización (condicionada a lo conocido de cada póliza).</p>
<p><b>Implicaciones.</b> (1) Se suman <i>varianzas</i>: \(\mathrm{Var}(S)=\sum\mathrm{Var}(X_i)\), y \(\sqrt{\sum\mathrm{Var}}\ll\sum SD\) es toda la ganancia de diversificación. (2) No hay fórmula \(n\,\mathrm{Var}(X)\): se calcula póliza a póliza o por grupos homogéneos. (3) La varianza se concentra en los capitales altos (entra \(b^2\)): la póliza 8 del taller aporta el 41,1 % de la prima pura pero el 54,5 % de la varianza. (4) Con una correlación \(\rho\) constante, \(\mathrm{Var}(S)=(1-\rho)\sum\mathrm{Var}(X_i)+\rho(\sum SD_i)^2\): con \(\rho=0{,}001\) en el Caso 1 la varianza se multiplica por 1,67 y el VaR Normal pasa de 1,49 a 1,75 M€. (5) El TCL requiere Lindeberg, no solo i.i.d.</p>"""),
dict(q="Explica con tus palabras por qué la aproximación Normal tiende a infravalorar el capital necesario.",
 a=r"""
<p>El capital se mide en la cola derecha (99,5 %) y la Normal es simétrica, mientras que \(S\) tiene asimetría positiva \(\gamma_S>0\). El término de Edgeworth \(-\varphi(z)\tfrac{\gamma_S}{6}(z^2-1)\) hace que la distribución real deje más masa a la derecha; invirtiendo, el cuantil real excede al Normal en \(\sigma_S\tfrac{\gamma_S}{6}(z_p^2-1)\) (Cornish–Fisher).</p>
<p><b>Caso 1:</b> la corrección es 0,589 desviaciones típicas = +201.630 €. Normal 1.491.844; Normal Power 1.693.480; Gamma trasladada 1.690.793; exacto 1.700.000. La Normal queda un 12,2 % corta y la probabilidad real de superar su «VaR 99,5 %» es 1,50 %, tres veces la nominal. Se suman: valores negativos con probabilidad positiva, discretización con pocas pólizas, convergencia lenta (\(\gamma\sim1/\sqrt n\)) y la dependencia, que engorda aún más la cola.</p>"""),
dict(q="Si solo hay datos agregados de siniestralidad, ¿individual o colectivo? Justifica.",
 a=r"""
<p><b>Colectivo.</b> El individual necesita \(q_i\) y la severidad por póliza; el colectivo solo necesita un modelo de frecuencia \(N\) y de cuantía \(Y\) estimables con datos por siniestro. Si solo hay totales anuales, habría que ajustar directamente una distribución a \(S\) con credibilidad.</p>
<p>Para \(q_i\) pequeñas son casi equivalentes: la varianza colectiva excede a la individual en \(\sum q_i^2\mu_i^2\) (+0,68 % en el Caso 1; +5,3 % en el Caso 2), así que el Poisson compuesto es algo más conservador. Se pierde la heterogeneidad de la cartera y la capacidad de decidir por póliza; solución habitual: individual para grandes riesgos y colectivo para el resto.</p>"""),
    ],
    debate=[
dict(q="¿Qué ocurre con la validez del modelo individual si aparece una pandemia o catástrofe que correlaciona las \(X_i\)?",
 a=r"""
<p>Deja de medir el riesgo: aparecen \(n(n-1)\) covarianzas y la desviación relativa no baja como \(1/\sqrt n\). Con un factor común de mortalidad \(\Theta\) (media 1, desv. \(\tau\)): \(\mathrm{Var}(S)\approx\mathrm{Var}_{ind}+\tau^2\mathbb{E}[S]^2\). Con \(\tau=0{,}3\) la varianza sube ×1,29 y el VaR Normal +7,9 %; con \(\tau=0{,}5\), +20 %.</p>
<p><b>La diversificación mata el riesgo idiosincrático, no el sistémico.</b> A ×1.000 pólizas el capital independiente es 27,9 M€ (4,6 % de la media) mientras la catástrofe de mortalidad de Solvencia II (+0,15 pp) es 210 M€: 7,5 veces más. Con 1.000 pólizas ocurre lo contrario (210.000 frente a 881.844). Soluciones: factor común explícito (Poisson–Gamma, Binomial Negativa), módulo de catástrofe con correlaciones, reaseguro catastrófico y bonos de mortalidad.</p>"""),
dict(q="¿Cómo cambiaría el capital si sustituyéramos el modelo individual por el colectivo en la misma cartera?",
 a=r"""
<p>Casi nada si \(q\) es pequeña: \(\mathrm{Var}_{col}-\mathrm{Var}_{ind}=\sum q_i^2\mu_i^2\). Caso 1: +0,68 % en varianza y +0,20 % en VaR Normal (1.491.844 → 1.494.826). Caso 2 (\(q\) 5–8 %): +5,3 % y +1,0 %. Lo que sí mueve el capital es la sobredispersión: con \(\mathrm{Var}(N)=1{,}5\lambda\) el VaR sube un 12 %; con \(2\lambda\), un 22 %. El modelo debe elegirse por la información y el uso (Panjer y FFT son más ágiles), no por el capital.</p>"""),
dict(q="¿Qué papel juega el reaseguro en reducir la asimetría de \(S\) y por qué importa para la fiabilidad de las aproximaciones?",
 a=r"""
<p><b>Menos de lo que parece.</b> La cuota-parte deja \(\gamma_S\) invariante (solo reescala). El exceso de pérdida por riesgo con retención \(d\) reduce el capital pero la asimetría solo baja de 0,63 a 0,52 (d = 100.000) y el error de la Normal sigue en el 6–12 %. La razón: la asimetría de esta cartera viene de la baja frecuencia (\(\lambda=3{,}6\) siniestros esperados), y su suelo es \(1/\sqrt\lambda=0{,}527\). Solo más volumen o un stop-loss agregado la reducen de verdad.</p>
<p>Importa porque el error de la Normal es del orden \(\gamma_S(z_p^2-1)/6\) desviaciones típicas; con tres momentos el error queda en torno al 1 % si \(S\) no es demasiado discreta. Reasegurar no sustituye a usar una aproximación que capte la asimetría; además tiene coste y riesgo de contraparte.</p>"""),
dict(q="Ante datos escasos de severidad en capitales elevados, ¿qué compromisos hay entre individual y colectivo?",
 a=r"""
<p>Sesgo frente a varianza: el individual tiene poco sesgo pero mucha varianza de estimación con pocos datos; el colectivo agrupa (poca varianza) pero sesga a la baja la cola de los capitales altos. En vida con capital fijo no hay problema (\(b_i\) conocido). La incertidumbre de parámetros pesa tanto como la elección de modelo: con \(q_D\times1{,}2\) el VaR sube 62.513 € (+4,2 %) y con todas las \(q\) un 20 % más altas, +13,8 %.</p>
<p><b>Práctica:</b> modelo híbrido (individual para grandes riesgos, colectivo para el resto), credibilidad de Bühlmann, cola con Pareto generalizada (Tema 5), análisis bayesiano de la incertidumbre de parámetros y reaseguro de cola. La Directiva exige datos apropiados, completos y exactos (art. 82) y márgenes de prudencia documentados.</p>"""),
    ],
    practica=dict(
        intro=r"""<p>El taller de Excel pide calcular, para una cartera de 8 pólizas de vida, esperanza, varianza, asimetría y el capital al 99,5 % con Normal, Gamma trasladada y Normal Power. Aquí se hace lo mismo en <b>Excel, Python y R</b> y se amplía: se añade la <b>distribución exacta</b> (convolución) y <b>Monte Carlo</b> (100.000 escenarios) para los Casos 1 y 2, el ejemplo de 3 pólizas y un estudio de cuándo converge la Normal.</p>""",
        steps=[
            r"<b>Momentos por póliza.</b> \(E(X_i)=q_ib_i\), \(\mathrm{Var}(X_i)=q_i(1-q_i)b_i^2\), \(\mu_3(X_i)=b_i^3q_i(1-q_i)(1-2q_i)\); se suman los tres (independencia). Asimetría \(\gamma_S=\mu_3(S)/SD^3\).",
            r"<b>Aproximaciones.</b> Normal \(E+z\,SD\); Gamma trasladada con \(\alpha=4/\gamma^2\), \(\beta=2/(SD\,\gamma)\), \(k=E-2SD/\gamma\) y VaR \(=k+\Gamma^{-1}(p;\alpha,1/\beta)\); Normal Power \(E+SD[z+\gamma(z^2-1)/6]\).",
            r"<b>Distribución exacta.</b> Se discretiza el capital en una rejilla (10.000 € en la cartera de 8; 50.000 € en el Caso 1) y se convoluciona póliza a póliza (Excel: una columna por póliza; Python y R: FFT/convolución). El VaR exacto es el primer \(s\) con \(F(s)\ge0{,}995\).",
            r"<b>Monte Carlo.</b> En cada escenario se simula el nº de siniestros de cada grupo con \(\mathrm{Bin}(n_g,q_g)\) y se multiplica por \(b_g\) (Caso 1); en el Caso 2 se suman \(k\) uniformes \(U(0,M)\). Semilla 123, 100.000 escenarios.",
            r"<b>Escala de la cartera.</b> Se multiplica el nº de pólizas por \(k\) y se mide el error de cada aproximación frente al exacto: la asimetría cae como \(1/\sqrt k\).",
        ],
        results=[("Cartera","Pólizas","E(S)","SD","γ","Normal","Gamma tras.","Normal Power","Exacto","Monte Carlo"),
                 ("8 pólizas (taller)","8","5.840","36.194","6,953","99.071","238.949","335.411","300.000","—"),
                 ("Caso 1 · Vida","1.000","610.000","342.354","0,627","1.491.844","1.690.793","1.693.480","1.700.000","1.650.000"),
                 ("Caso 2 · Accidentes","350","84.500","21.565","0,295","140.049","146.003","146.028","—","145.107 (Py) · 146.038 (R)"),
                 ("Ejemplo 3 pólizas","3","10.000","41.280","4,152","116.329","240.076","277.284","200.000","—")],
        results_note=r"""<p class="note">VaR 99,5 % en euros. Los valores de la diapositiva (116.336 y 277.316 en el ejemplo de 3 pólizas; 1.491.780 en el Caso 1) difieren de estos en la tercera cifra porque usan \(z=2{,}576\) redondeado; aquí \(z=2{,}5758\). La rejilla exacta de la cartera de 8 pólizas es de 10.000 € y la del Caso 1 de 50.000 €, por lo que el exacto y la simulación caen en escalones contiguos. <b>La fila de Monte Carlo de la diapositiva (≈1.486.900) no es reproducible</b> (queda por debajo del Normal, y la diapositiva dice lo contrario).</p>""",
        extra=r"""<div class="stats"><div><span>Caso 1: capital Normal / E(S)</span><b>144,6 %</b></div><div><span>Caso 1: capital exacto / E(S)</span><b>178,7 %</b></div><div><span>Error Normal, 1.000 pólizas</span><b>−12,2 %</b></div><div><span>Error Normal, 50.000 pólizas</span><b>−0,6 %</b></div><div><span>Error Normal Power (todos los k)</span><b>&lt; 0,8 %</b></div><div><span>P(S &gt; VaR Normal) real</span><b>1,50 %</b></div></div>""",
        excel=r"""<p>Siete hojas con fórmulas vivas: <b>Datos</b> (nivel \(p\) y \(z_p\)), <b>Cartera8</b> (taller: \(E\), \(\mathrm{Var}\), \(\mu_3\), \(\gamma\), Normal, Gamma trasladada con <code>GAMMAINV</code>, Normal Power y comparación con gráfico), <b>Exacta8</b> (convolución recursiva en 130 filas × 8 columnas y VaR exacto con <code>COUNTIF</code>), <b>Caso1_Vida</b> y <b>Caso2_Accidentes</b> (momentos por grupo, aproximaciones y aportación de cada grupo a la varianza), <b>Ejemplo3</b> y <b>Escala</b> (error frente al tamaño). Los valores exactos y de Monte Carlo de los Casos 1 y 2 vienen de Python/R y están en azul. Las 1.710 fórmulas se verificaron contra Python.</p>""",
        files=dict(xlsx="t2/t2_practica.xlsx", ipynb="t2/t2_practica.ipynb", py="t2/t2_practica.py", r="t2/t2_practica.R"),
        figs_py=[("t2/t2_py_1.png", "Caso 1: distribución exacta de S (izquierda) y Monte Carlo (derecha) con el VaR Normal."),
                 ("t2/t2_py_2.png", "El error de la Normal cae despacio con el tamaño; Normal Power y Gamma trasladada aciertan a la primera.")],
        figs_r=[("t2/t2_R_exacta.png", "R: distribución exacta del Caso 1."), ("t2/t2_R_mc.png", "R: histograma de Monte Carlo."), ("t2/t2_R_escala.png", "R: error de la Normal frente al tamaño de la cartera.")],
        lectura=r"""<p><b>Lectura.</b> En carteras pequeñas y asimétricas la Normal se queda corta (−12 % en el Caso 1, −67 % en la de 8 pólizas) y las correcciones de tres momentos recuperan casi todo, salvo cuando \(S\) es muy discreta (8 y 3 pólizas), donde ninguna aproximación continua es fiable y hay que usar la distribución exacta. En el Caso 2 (severidad uniforme y 350 pólizas) las tres aproximaciones son parecidas. La Normal solo se justifica con muchas pólizas y baja asimetría, bajo independencia.</p>""",
    ),
    files=dict(repaso_pdf="t2/t2_repaso.pdf", repaso_tex="t2/t2_repaso.tex", debate_pdf="t2/t2_debate.pdf", debate_tex="t2/t2_debate.tex"),
    sources="Diapositivas «Modelos del Coste Total de Siniestralidad — Modelo Individual» y notas de deducción (Gamma trasladada, Normal Power, momentos) · Prof. Hugo González Riera",
)
