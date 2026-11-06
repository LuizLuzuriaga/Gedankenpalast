# Contenido HTML explicado del Tema 1 (MathJax con \( \) y \[ \]).
T = dict(
    id="t1", num=1, slug="t1",
    title="Teoría de la utilidad y decisiones bajo riesgo",
    short="Utilidad",
    lede="Por qué el valor esperado no basta para decidir bajo riesgo, cómo se formaliza la aversión al riesgo y cómo esa idea se convierte en primas, en reaseguro óptimo y en lectura regulatoria.",
    explain=[
("La idea: el valor del dinero depende de la riqueza", r"""
<p>Un asegurado con probabilidad 0,01 de perder \(B\) pagará más de \(0{,}01\,B\) si \(B\) es grande, porque una pérdida grande compromete su solvencia. El valor de una pérdida no es solo su magnitud: depende de la riqueza que queda. La paradoja de San Petersburgo (esperanza infinita, disposición a pagar finita) dice lo mismo. Hace falta una medida de valor subjetivo del dinero: la <b>función de utilidad</b>.</p>
<div class="callout key"><h4>Idea central</h4><p>La prima de mercado de un riesgo es su valor esperado más un recargo. Ese recargo es la forma empírica de la aversión al riesgo, y toda la sesión sirve para cuantificarlo.</p></div>"""),
("El modelo de utilidad esperada (von Neumann–Morgenstern)", r"""
<p>Si un decisor es consistente (axiomas de orden, continuidad e independencia), existe \(u(\cdot)\) tal que prefiere la pérdida aleatoria \(X\) a \(Y\) si y solo si</p>
\[ \mathbb{E}[u(w-X)]\;\ge\;\mathbb{E}[u(w-Y)] . \]
<p>Una decisión compleja se reduce a comparar dos números. La utilidad es única salvo transformaciones afines positivas, \(u\sim a\,u+b\) con \(a>0\); por eso se normaliza \(u(0)=0,\ u'(0)=1\), y por eso cualquier medida útil debe ser invariante a esa transformación.</p>
<ul class="tight"><li><b>No saciedad</b> \(u'>0\): más riqueza es mejor.</li><li><b>Aversión al riesgo</b> \(u''<0\): utilidad marginal decreciente (cóncava).</li><li><b>Suavidad</b> \(u\in C^2\), para poder definir el coeficiente de aversión.</li></ul>
<p>Si \(u\) es lineal, el decisor es <b>neutral</b> al riesgo y la prima de equilibrio es la pura \(\mathbb{E}[X]\) (principio de equivalencia). Los aseguradores con ley de grandes números y capital suficiente se aproximan a ese caso.</p>"""),
("Jensen, equivalente cierto y prima de riesgo", r"""
<p>Para \(u\) cóncava, Jensen da \(\mathbb{E}[u(w-X)]\le u(w-\mathbb{E}[X])\): el averso prefiere la pérdida cierta \(\mathbb{E}[X]\) a la aleatoria \(X\). El <b>equivalente cierto</b> y la <b>prima de riesgo</b> miden esa brecha en euros:</p>
\[ u(CE)=\mathbb{E}[u(\widetilde W)],\qquad \pi=\mathbb{E}[\widetilde W]-CE\ \ge 0 . \]
<p>Si \(u\) es convexa (amante del riesgo), \(CE\ge\mathbb{E}[\widetilde W]\). La prima técnica de un seguro se puede leer como \(\mathbb{E}[X]+\pi\): \(\pi\) compensa al asegurador por asumir la variabilidad.</p>"""),
("Arrow–Pratt: la aversión como curvatura local", r"""
<p>Se define la aversión absoluta \(r(w)=-u''(w)/u'(w)\) y la relativa \(\rho(w)=w\,r(w)\). Se deduce con Taylor de segundo orden alrededor de \(w-\mu\) (\(\mu=\mathbb{E}[X]\)) sobre la ecuación de equilibrio \(u(w-P^+)=\mathbb{E}[u(w-X)]\):</p>
\[ P^+\approx\mu-\tfrac12\,\sigma^2\,\frac{u''(w-\mu)}{u'(w-\mu)}\ \Longrightarrow\ \pi\approx\tfrac12\,r(w)\,\sigma^2 . \]
<p>La prima de riesgo es, en primera aproximación, proporcional a la <b>varianza</b> y a la aversión local. Vale para riesgos pequeños frente a \(w\); ignora asimetría y curtosis, que dominan en catastróficos. \(r\) es invariante a \(a\,u+b\), y por eso permite comparar decisores sin normalizar.</p>"""),
("CARA y CRRA: las dos familias de trabajo", r"""
<div class="grid2">
<div class="card"><span class="tag">CARA · exponencial</span>
<p>\(u(w)=-e^{-\alpha w}/\alpha\), \(r(w)=\alpha\) constante. La ecuación de equilibrio da la <b>prima exponencial exacta</b></p>
\[ P=\frac1\alpha\ln M_X(\alpha). \]
<p>No depende de \(w\) (el factor \(e^{-\alpha w}\) se cancela). Es aditiva para riesgos independientes. Estándar en pricing de reaseguro. Aproximación: \(P\approx\mathbb{E}[X]+\tfrac12\alpha\,\mathrm{Var}[X]\).</p></div>
<div class="card"><span class="tag">CRRA · potencia</span>
<p>\(u(w)=\dfrac{w^{1-\gamma}}{1-\gamma}\), \(\rho(w)=\gamma\), \(r(w)=\gamma/w\) decreciente en \(w\). Con \(\gamma=1\) queda \(\ln w\) (límite de la forma normalizada \((w^{1-\gamma}-1)/(1-\gamma)\)).</p>
<p>Requiere \(w>0\) en todo estado. Típico en asignación de activos: en el modelo de Merton la fracción óptima en el activo con riesgo es \(\mu/(\gamma\sigma^2)\). Valores calibrados: \(\gamma\approx1\) a \(10\).</p></div></div>
<p class="note">La cuadrática (\(-(\alpha-w)^2\)) tiene saciedad y aversión creciente con la riqueza: solo sirve como aproximación media-varianza.</p>"""),
("Críticas al modelo", r"""
<p>Supone preferencias consistentes, probabilidades objetivas, \(u\) diferenciable y decisión sobre la <i>riqueza final</i>. La paradoja de Allais (1953) viola la independencia; la teoría prospectiva (Kahneman–Tversky, 1979) añade efecto marco y aversión a pérdidas respecto a un punto de referencia; y exige conocer \(w\), que rara vez es observable.</p>"""),
("De la utilidad al reaseguro", r"""
<p>El cedente paga como máximo \(P^+\) con \(u(w-P^+)=\mathbb{E}[u(w-X)]\); el reasegurador exige como mínimo \(P^-\) con \(U(W)=\mathbb{E}[U(W+P^--X)]\). Hay trato si \(P^-\le P^+\), y cualquier \(P\in[P^-,P^+]\) mejora a ambos.</p>
<div class="grid2">
<div class="card"><span class="tag">Stop-loss óptimo para el cedente</span>
<p>Con la misma prima esperada, entre todos los contratos con \(0\le I(x)\le x\) el stop-loss \((X-M)_+\) minimiza \(\mathrm{Var}[X-I(X)]\): lleva el riesgo retenido lo más cerca posible de la constante \(M\).</p></div>
<div class="card"><span class="tag">Proporcional óptimo para el reasegurador</span>
<p>Si el reasegurador tarifica por varianza, \(\mathbb{E}[I]+\lambda\,\mathrm{Var}[I]\), y el cedente fija la varianza retenida \(V\), el óptimo es \(I(X)=\beta X\) con \(\beta=1-\sqrt{V/\mathrm{Var}[X]}\).</p></div></div>
<p>No hay una estructura universalmente óptima: depende de qué se fije y de cómo tarifica el reasegurador. En la práctica se combinan cuota-parte y exceso de pérdida.</p>"""),
("Marco regulatorio", r"""
<ul class="tight"><li><b>Solvencia II.</b> El SCR es conceptualmente un «equivalente cierto» de capital (VaR 99,5 % a un año); el ORSA exige un apetito de riesgo coherente con la aversión implícita.</li>
<li><b>NIIF 17.</b> El ajuste de riesgo no financiero juega el papel de la prima \(\pi\): compensación por la incertidumbre de los flujos, con método y nivel de confianza revelados.</li>
<li><b>SST suizo.</b> Basado en Expected Shortfall al 99 %, más cercano a una medida coherente de cola.</li></ul>"""),
    ],
    repaso=[
dict(q=r"""Demuestra que el caso límite \(\gamma\to1\) de la utilidad potencia CRRA es la utilidad logarítmica \(u(w)=\log w\).""",
 a=r"""
<p><b>Matiz clave.</b> La expresión \(w^{1-\gamma}/(1-\gamma)\) <i>no</i> tiene límite cuando \(\gamma\to1\) (numerador \(\to1\), denominador \(\to0\)). Como la utilidad es única salvo transformación afín, se toma la versión normalizada \(\tilde u_\gamma=(w^{1-\gamma}-1)/(1-\gamma)\), que resta la constante \(1/(1-\gamma)\) y no cambia ninguna decisión.</p>
<p><b>Prueba.</b> Con \(\varepsilon=1-\gamma\to0\): \(\tilde u_\gamma(w)=\dfrac{e^{\varepsilon\ln w}-1}{\varepsilon}\to \ln w\) (L'Hôpital: derivada del numerador en \(\varepsilon\) es \(\ln w\,e^{\varepsilon\ln w}\to\ln w\)).</p>
<p><b>Comprobaciones.</b> (i) \(\rho(w)=\gamma\to1=\rho_{\ln}\). (ii) El equivalente cierto \(CE_\gamma=(\mathbb{E}[W^{1-\gamma}])^{1/(1-\gamma)}\) converge a \(\exp(\mathbb{E}[\ln W])\), la <b>media geométrica</b> de la riqueza. En el Caso 2: \(\sqrt{12.000\cdot8.500}=10.099{,}5\); con \(\gamma=0{,}99\) y \(1{,}01\) salen 10.101,0 y 10.098,0, a ambos lados.</p>"""),
dict(q=r"""Para utilidad exponencial, explica por qué \(P=\tfrac1\alpha\ln M_X(\alpha)\) no depende de \(w\) y para CRRA sí. ¿Qué implica para el pricing de reaseguro?""",
 a=r"""
<p><b>CARA.</b> En \(u(w-P)=\mathbb{E}[u(w-X)]\) aparece \(e^{-\alpha w}\) como factor común a ambos lados (la exponencial convierte sumas en productos) y se cancela: \(e^{\alpha P}=M_X(\alpha)\). <b>CRRA.</b> \((w-x)^{1-\gamma}\) no separa \(w\) de \(x\): \(P(w)=w-(\mathbb{E}[(w-X)^{1-\gamma}])^{1/(1-\gamma)}\).</p>
<p><b>Ejemplo.</b> \(X=5.000\) con prob. 0,2: CARA (\(\alpha=2\cdot10^{-4}\)) da 1.477,0 para cualquier \(w\); CRRA (\(\gamma=2\)) da 3.000 (con \(w=6.000\)), 1.667 (\(w=10.000\)), 1.250 (\(20.000\)) y 1.087 (\(50.000\)): decrece hacia la pura 1.000.</p>
<p><b>Implicación.</b> En reaseguro \(w\) no es observable ni estable: CARA solo necesita la distribución y un \(\alpha\), y es <b>aditiva</b> (\(P(X+Y)=P(X)+P(Y)\)) e iterativa. Su límite: ignora que más capital reduce la aversión (hay que recalibrar \(\alpha\)) y no existe con colas pesadas (\(M_X=\infty\)). CRRA queda para inversión y capital como % del balance.</p>"""),
dict(q=r"""Un cedente con \(\alpha_C\) y un reasegurador con \(\alpha_R<\alpha_C\): razona sin calcular por qué \([P^-,P^+]\) es no vacía y qué pasa con su anchura si \(\alpha_R\to0\).""",
 a=r"""
<p>Ambas primas son \(\Pi(\alpha)=K_X(\alpha)/\alpha\) con \(K_X=\ln M_X\) convexa y \(K_X(0)=0\). Para \(0&lt;a&lt;b\), convexidad da \(K_X(a)\le\tfrac ab K_X(b)\), o sea \(\Pi(a)\le\Pi(b)\): <b>\(\Pi\) es creciente</b> (pendiente de la cuerda desde el origen). Luego \(P^-=\Pi(\alpha_R)<\Pi(\alpha_C)=P^+\) para todo riesgo no degenerado.</p>
<p>Como \(K_X'(0)=\mathbb{E}[X]\), si \(\alpha_R\to0\) entonces \(P^-\to\mathbb{E}[X]\) y la zona se ensancha hasta \([\mathbb{E}[X],P^+]\). En el Caso 1: anchura 105,5 con \(\alpha_R=3\cdot10^{-4}\) y 188,9 (el 18,9 % de \(\mathbb{E}[X]\)) en el límite. Nota: el reparto Pareto-óptimo con exponenciales es proporcional a las tolerancias \(1/\alpha_i\) (Borch): aquí el reasegurador asumiría 2/3.</p>"""),
    ],
    debate=[
dict(q="¿Por qué un reasegurador global, muy diversificado y capitalizado, puede ofrecer primas más bajas que una aseguradora local? Relaciónalo con Arrow–Pratt.",
 a=r"""
<p>Porque su aversión \(\alpha_R\) es menor y \(\pi\approx\tfrac12 r\sigma^2\): con \(\mathrm{Var}[X]=500.000\), el recargo aproximado es 150 (cedente) frente a 75 (reasegurador); exactos, 18,9 % y 8,3 %. La aversión es tolerancia inversa (\(\tau=1/\alpha\)): más capital, más tolerancia.</p>
<p><b>Matiz.</b> Con CARA la prima de un riesgo independiente no depende del resto de la cartera (aditividad). La diversificación abarata si hay dependencia o si se lee el reasegurador como <i>pool</i> de \(m\) inversores, donde la aversión del grupo es \(\alpha/m\). Y no siempre es más barato: gastos, coste de capital (6 % del SCR futuro en el margen de riesgo), riesgo de contraparte, correlación de colas y mercado duro tras grandes eventos.</p>"""),
dict(q="Si el apetito de riesgo declarado en el ORSA no es coherente con la aversión implícita, ¿qué riesgos de gobernanza y supervisión se generan?",
 a=r"""
<p>La aversión implícita es la que reproduce el precio realmente aceptado. Si la cedente declara \(\alpha=3\cdot10^{-4}\) pero paga 1.150 por ceder el 100 %, \(\alpha_{\rm impl}\approx5\cdot10^{-4}\): un 66 % más. Esa razón \(\alpha_{\rm impl}/\alpha_{\rm decl}\) es un indicador monitorizable.</p>
<ul class="tight"><li><b>Gobernanza:</b> el apetito deja de gobernar; incentivos convexos (bonus) generan \(\alpha_{\rm impl}<\alpha_{\rm decl}\); sobrerreaseguro costoso en el sentido contrario.</li><li><b>Capital:</b> riesgo asumido por encima del dotado, o capital inmovilizado de más.</li><li><b>Supervisión:</b> cuestiona la utilidad del ORSA y el «use test» del modelo interno, exige medidas sobre el sistema de gobernanza y, en casos graves, recargo de capital.</li></ul>"""),
dict(q="En el Caso 2, ¿cómo cambiaría la decisión si \(\gamma\) bajase a 1? ¿Qué perfil tendría ese \(\gamma\)?",
 a=r"""
<p>Con \(\gamma=1\): \(CE=\sqrt{12.000\cdot8.500}=10.099{,}5>10.000\) y \(\pi=150{,}5<250\). <b>Acepta</b> (con \(\gamma=3\) rechazaba, \(CE=9.809{,}3\)). El umbral es \(\gamma^*\approx1{,}668\): aceptan \(\gamma<1{,}67\).</p>
<p><b>Perfil:</b> inversores de horizonte largo y muy capitalizados (fondos soberanos, grandes fondos de pensiones, <i>endowments</i>), criterio de Kelly; o una mesa propietaria con tolerancia explícita. No bancos regulados ni vida con garantías. Ojo: con Merton, bajar \(\gamma\) de 3 a 1 triplica la exposición deseada.</p>"""),
dict(q="El modelo asume que solo importa la riqueza final. ¿En qué situaciones de gestión de solvencia es más cuestionable?",
 a=r"""
<p>Cuando importa el <b>camino</b>: (1) liquidez y ventas forzadas (marzo 2020, fondos LDI del Reino Unido en 2022); (2) barreras regulatorias (SCR/MCR 100 %: la utilidad salta al cruzar el umbral; en el Caso 2 un límite de pérdida en 9.000 rechaza la posición para cualquier \(\gamma\)); (3) horizonte: Solvencia II mide a un año 99,5 %, pero las obligaciones son de 30 años; (4) dependencia de una referencia y aversión a pérdidas (Kahneman–Tversky); (5) resultados intermedios en NIIF 17; (6) cláusulas de rating o <i>cross-default</i>.</p>
<p>Corrección práctica: utilidad con barrera o restricción de ruina \(\Pr[W&lt;L]\le\varepsilon\) (lo que hace el VaR), modelos multiperíodo (Epstein–Zin) y <i>stress tests</i> de liquidez.</p>"""),
    ],
    practica=dict(
        intro=r"""<p>El taller pide construir las curvas CRRA/CARA para tres perfiles de aversión cada una y calcular el equivalente cierto y la prima de riesgo del Caso 2 (\(w=10.000\); \(+2.000\) o \(-1.500\) con \(p=0{,}5\)). El mismo cálculo se hace en <b>Excel, Python y R</b> con idénticos resultados, y se amplía con el Caso 1, los umbrales y la comparación con Arrow–Pratt.</p>""",
        steps=[
            r"<b>Utilidades.</b> Se definen \(u_{CRRA}\) (con rama logarítmica en \(\gamma=1\)) y \(u_{CARA}\); se dibujan normalizadas a \([0,1]\) para comparar solo la curvatura.",
            r"<b>Caso 2.</b> En cada perfil se resuelve \(u(CE)=\mathbb{E}[u(w+X)]\) en forma cerrada: \(CE=(\mathbb{E}[W^{1-\gamma}])^{1/(1-\gamma)}\) (CRRA), \(\exp\mathbb{E}[\ln W]\) (\(\gamma=1\)), \(-\tfrac1\alpha\ln\mathbb{E}[e^{-\alpha W}]\) (CARA). Después \(\pi=\mathbb{E}[W]-CE\) y se acepta si \(CE>w\).",
            r"<b>Umbrales.</b> \(\gamma^*\) y \(\alpha^*\) son las raíces de \(CE(\theta)=w\): la máxima aversión que todavía acepta. Es el límite por mesa que usaría un comité de riesgos.",
            r"<b>Caso 1.</b> Con \(X=\theta Y\), \(Y\sim\Gamma(2,1)\), \(M_X(t)=(1-\theta t)^{-2}\) y \(P(\alpha)=\ln M_X(\alpha)/\alpha\), se obtienen \(P^+\), \(P^-\) y la anchura; se explora cómo la zona se ensancha cuando \(\alpha_R\to0\).",
            r"<b>Arrow–Pratt.</b> Se compara \(\pi\approx\tfrac12 r(\mathbb{E}[W])\,\mathrm{Var}[X]\) con la prima exacta: el error crece con la aversión.",
        ],
        results=[("Perfil","Familia","Parámetro","CE","Prima π","¿Acepta?","π Arrow–Pratt"),
                 ("Agresivo CRRA","CRRA","γ = 0,5","10.174,8","75,2","Sí","74,7"),
                 ("Moderado CRRA","CRRA","γ = 2","9.951,2","298,8","No","298,8"),
                 ("Conservador CRRA","CRRA","γ = 5","9.556,5","693,5","No","747,0"),
                 ("Agresivo CARA","CARA","α = 0,0001","10.097,7","152,3","Sí","153,1"),
                 ("Moderado CARA","CARA","α = 0,0003","9.810,3","439,7","No","459,4"),
                 ("Conservador CARA","CARA","α = 0,0006","9.462,7","787,3","No","918,7")],
        results_note=r"""<p class="note">Los CE salen en miles de euros. Nota de verificación: las cifras de la diapositiva de la tabla de Excel difieren ligeramente de estos valores exactos en algunos perfiles (p. ej. CRRA \(\gamma=5\): 9.554,9 en la diapositiva frente a 9.556,5 exacto; CARA conservador: 9.463,0 frente a 9.462,7). El caso del enunciado (\(\gamma=3\)) sí coincide: 9.809,3 y \(\pi\approx440{,}7\). Excel, R y Python dan los valores de esta tabla.</p>""",
        extra=r"""<div class="stats"><div><span>Umbral CRRA γ*</span><b>1,6676</b></div><div><span>Umbral CARA α*</span><b>0,000166</b></div><div><span>γ = 1 (log): CE · π</span><b>10.099,5 · 150,5</b></div><div><span>Caso 1: P⁺ · P⁻</span><b>1.188,9 · 1.083,5</b></div><div><span>Anchura de la zona</span><b>105,5 (límite 188,9)</b></div></div>""",
        excel=r"""<p>Cinco hojas con fórmulas vivas (celdas amarillas = entradas): <b>Datos</b> (parámetros y nombres definidos), <b>Caso2_Perfiles</b> (CE, \(\pi\), aceptación y Arrow–Pratt por perfil, con gráfico), <b>Caso1_Reaseguro</b> (\(P^+\), \(P^-\), recargos y sensibilidad a \(\alpha_R\)), <b>Umbrales</b> (CE frente a \(\gamma\) y \(\alpha\), con interpolación del cruce) y <b>Curvas</b> (utilidades de los seis perfiles, normalizadas, con gráficos). Se puede cambiar \(w\), el reparto o los parámetros y todo se recalcula. Las 845 fórmulas del libro se verificaron contra el cálculo en Python.</p>""",
        files=dict(xlsx="t1/t1_practica.xlsx", ipynb="t1/t1_practica.ipynb", py="t1/t1_practica.py", r="t1/t1_practica.R"),
        figs_py=[("t1/t1_py_1.png", "Curvas de utilidad normalizadas: a mayor γ o α, más curvatura."),
                 ("t1/t1_py_2.png", "Caso 2: el CE cruza w = 10.000 en γ* ≈ 1,668."),
                 ("t1/t1_py_3.png", "Caso 1: la prima exponencial crece con α y no existe para α ≥ 1/θ = 0,002.")],
        figs_r=[("t1/t1_R_curvas.png", "R (ggplot2): curvas de utilidad por perfil."),
                ("t1/t1_R_umbral.png", "R (ggplot2): equivalente cierto frente a γ.")],
        lectura=r"""<p><b>Lectura.</b> \(\pi\) crece con la aversión y el punto de decisión separa a los perfiles agresivos (aceptan) de los conservadores (rechazan una posición de valor esperado positivo: +250). La aproximación de Arrow–Pratt acierta para riesgos pequeños y se degrada cuando el riesgo pesa (error del +17 % en CARA conservador): para riesgos grandes hay que usar la prima exacta. Los dos programas y el libro de Excel coinciden.</p>""",
        notebook_cells=[1,3,5,8,10,12,14,16],
    ),
    files=dict(repaso_pdf="t1/t1_repaso.pdf", repaso_tex="t1/t1_repaso.tex", debate_pdf="t1/t1_debate.pdf", debate_tex="t1/t1_debate.tex"),
    sources="Diapositivas «Fundamentos de la Teoría de la Utilidad y Decisiones bajo Riesgo» · Prof. Hugo González Riera",
)
