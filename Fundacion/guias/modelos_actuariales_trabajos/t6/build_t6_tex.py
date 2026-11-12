r"""Genera t6_repaso.tex y t6_debate.tex con la estructura de los demás temas (portada con Resumen/Abstract, índice, secciones) y los compila con Tectonic."""
import pathlib, sys
HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE.parent))
import lib, fixtex

PRE = (HERE / "_pre.txt").read_text(encoding="utf-8")

PORTADA = r"""\begin{document}

% Primera página (Título, Resumen y Abstract)
\begin{titlepage}
    \centering
    \vspace*{0.1cm}
    \huge\textbf{Tema 6: Preguntas de @@KIND@@}\\
    \vspace{1cm}
    \small{Luiz Alberto Luzuriaga Izquierdo}\\
    \vspace{0.1cm}
    Facultad de ciencias económicas, empresariales y turismo. \\
    \vspace{0.1cm}
    Universidad de Alcalá de Henares. \\
    \vspace{0.1cm}
    Curso 2026-2027\\
    \vspace{0.5cm}

{\bfseries Resumen}

\vspace{0.1cm}
\noindent
\begin{justify}
@@RES@@\\\\
\vspace{0.1cm}
\noindent
\textbf{Palabras clave}: @@KW@@.
\end{justify}
\begin{center}
    {\bfseries Abstract}
\end{center}
\vspace{0.1cm}
\noindent
\begin{justify}
@@ABS@@\\\\
\vspace{0.1cm}
\noindent
\textbf{Keywords}: @@KWEN@@.
\end{justify}

\end{titlepage}

% Índice
\newpage\pagenumbering{gobble}
\renewcommand{\contentsname}{Índice}
\newgeometry{left=4cm, right=4cm, top=3cm, bottom=2.5cm}
\tableofcontents

\restoregeometry
\newpage
\numberwithin{equation}{section}
\pagenumbering{arabic}
\setcounter{page}{1}

"""

def portada(kind, resumen, kw, abstract, kwen):
    return (PORTADA.replace("@@KIND@@", kind).replace("@@RES@@", resumen).replace("@@KW@@", kw).replace("@@ABS@@", abstract).replace("@@KWEN@@", kwen))

REFS = r"""
\subsubsection*{Referencias}
\begin{itemize}[leftmargin=*,itemsep=0pt]
\item Sklar, A. (1959). Fonctions de r\'epartition \`a $n$ dimensions et leurs marges. \emph{Publ. Inst. Statist. Univ. Paris}, 8.
\item Nelsen, R. B. \emph{An Introduction to Copulas}. Springer.
\item Embrechts, P., McNeil, A. y Straumann, D. (2002). Correlation and dependence in risk management: properties and pitfalls.
\item McNeil, A. J., Frey, R. y Embrechts, P. \emph{Quantitative Risk Management}. Princeton University Press.
\item Li, D. X. (2000). On default correlation: a copula function approach. \emph{Journal of Fixed Income}, 9(4).
\item Genest, C., Ghoudi, K. y Rivest, L.-P. (1995). A semiparametric estimation procedure of dependence parameters in multivariate families of distributions. \emph{Biometrika}, 82.
\item Demarta, S. y McNeil, A. J. (2005). The $t$ copula and related copulas. \emph{International Statistical Review}, 73.
\item Directiva 2009/138/CE (Solvencia II) y Reglamento Delegado (UE) 2015/35.
\end{itemize}
"""

# ============================================================== REPASO
REPASO = r"""
\section{Tema 6: Dependencia no lineal y modelización de colas con cópulas}
\label{sec:tema6repaso}
\noindent
Respuestas razonadas a las tres preguntas de repaso del tema. Material de referencia: diapositivas del Tema 6 (Prof. Hugo González Riera). Las cifras proceden del taller (Excel, Python y R) con las mismas semillas y datos.

\subsection{Pregunta 1 -- $\rho=0$ pero $\lambda_U>0$: significado y ejemplo de negocio}

\noindent\textbf{Enunciado.} Explica con tus propias palabras qué significa que dos variables tengan $\rho=0$ pero $\lambda_U>0$, y pon un ejemplo de negocio donde esto sería relevante.

\paragraph{Planteamiento.} Son dos afirmaciones sobre objetos distintos: $\rho$ es un promedio lineal sobre toda la distribución conjunta; $\lambda_U$ es el límite de una probabilidad condicionada en la cola. Que ambas sean compatibles no es una paradoja: es la razón de ser de las cópulas.

\subsubsection*{1. Qué dice cada número}
\begin{itemize}[leftmargin=*,itemsep=2pt]
\item $\rho(X,Y)=\operatorname{Cov}(X,Y)/(\sigma_X\sigma_Y)=0$: no hay tendencia \emph{lineal} a que $X$ e $Y$ se muevan juntas \emph{en promedio}. No implica independencia (el ejemplo clásico es $Y=X^2$: dependencia exacta y, en la simulación, $\rho\approx0{,}00$ y $\rho_S\approx0{,}00$).
\item $\lambda_U=\lim_{u\to1^-}P(V>u\mid U>u)>0$: si un riesgo ya está en su peor escenario, la probabilidad de que el otro también lo esté \emph{no se desvanece} al endurecer el escenario. Con independencia, $P(V>u\mid U>u)=1-u\to0$.
\end{itemize}
Pueden coexistir porque el número $\rho$ mezcla todas las regiones del plano: en el centro y en los cuadrantes de signo contrario puede cancelar lo que ocurre en la cola.

\subsubsection*{2. Un ejemplo explícito: la cópula $t$ con $\rho=0$}
En la cópula $t$ con parámetros $(\rho,\nu)$,
\[
\lambda_U=\lambda_L=2\,t_{\nu+1}\!\left(-\sqrt{\frac{(\nu+1)(1-\rho)}{1+\rho}}\right),\qquad
\rho=0\;\Rightarrow\;\lambda=2\,t_{\nu+1}(-\sqrt{\nu+1}).
\]
Con $\nu=4$: $\lambda=2\,t_5(-\sqrt5)=0{,}0756$. Se genera con un factor común: $(Z_1,Z_2)\sim N(0,I)$ independientes y $W\sim\chi^2_\nu/\nu$ común, $T_i=Z_i/\sqrt W$. Cuando $W$ es pequeño, \emph{ambas} coordenadas se inflan a la vez; $\operatorname{Cov}(T_1,T_2)=0$, pero $\operatorname{Cov}(T_1^2,T_2^2)>0$: hay dependencia en las \emph{magnitudes}.

Simulación con $2\cdot10^6$ pares (cópula $t$, $\rho=0$, $\nu=4$):
\begin{center}
\small
\begin{tabular}{lrrr}
\toprule
 & $q=0{,}95$ & $q=0{,}99$ & $q=0{,}999$\\
\midrule
$P(V>q\mid U>q)$ & 0,127 & 0,093 & 0,082\\
Si fueran independientes ($1-q$) & 0,050 & 0,010 & 0,001\\
Razón & $\times2{,}5$ & $\times9$ & $\times82$\\
\bottomrule
\end{tabular}
\end{center}
La correlación de Pearson de las normalizadas es $0{,}002$, la de Spearman $0{,}001$ y $\tau=-0{,}000$: ninguna medida de asociación media ve nada, y sin embargo, a $q=0{,}999$, un extremo arrastra a otro con probabilidad 82 veces mayor que la independiente.

\paragraph{Por qué la correlación cancela.} La cópula $t$ es simétrica: infla por igual los cuadrantes $(+,+)$ y $(+,-)$. Para pérdidas, solo el cuadrante conjunto importa; por eso el negocio necesita cópulas asimétricas (Gumbel, Clayton rotada) cuando se sabe que el contagio es \emph{en la dirección adversa}.

\subsubsection*{3. Efecto sobre el capital}
Con los SCR del Caso 1 (mercado 40, suscripción 30 M\euro) y marginales normales, la independencia ($\rho=0$) da $\sqrt{40^2+30^2}=50{,}00$ M\euro. Con cópula $t$ ($\rho=0$, $\nu=4$) el VaR 99,5\,\% simulado es $54{,}97$ M\euro ($+9{,}9\%$): \textbf{4,97 M\euro de capital} que la fórmula con $\rho=0$ no ve.

\subsubsection*{4. Ejemplo de negocio}
Riesgo catastrófico natural (inundación, granizo) y riesgo de contraparte del reasegurador (o impago de los derivados de cobertura): en tiempos normales sus series no se relacionan ($\rho\approx0$), pero una catástrofe grande \emph{coincide} con rebajas de rating, litigios y retrasos de pago del reaseguro justo cuando más se necesita. Es el mismo mecanismo de «riesgo de camino equivocado» que en banca: la exposición crece cuando la solvencia de la contraparte cae.

\subsubsection*{5. Cuidado con el valor asintótico}
Con $\rho=0$ y $\nu=15$ el límite es $\lambda=0{,}0010$ (casi nulo) y con $\nu=10$, $0{,}0069$. Lo relevante para un SCR 99,5\,\% no es el límite sino la probabilidad condicionada a $q$ finito (aquí $0{,}09$ a $q=0{,}99$). Con datos reales el $q=0{,}99$ se apoya en pocos puntos (en una muestra de $n=1.500$, 15), de modo que el estimador es muy ruidoso (ver Debate~3).

\paragraph{Conclusión.} $\rho=0$ más $\lambda_U>0$ significa «sin tendencia lineal media, pero con \emph{acumulación en los extremos}». Es el punto ciego de Pearson y el motivo para estimar y vigilar la dependencia de cola.

\subsection{Pregunta 2 -- ¿Por qué la fórmula estándar de Solvencia II es una cópula Gaussiana?}

\noindent\textbf{Enunciado.} ¿Por qué se dice que la fórmula estándar de Solvencia II es, matemáticamente, una cópula Gaussiana? ¿Qué implicación tiene esto para las líneas de negocio con riesgo de contagio extremo?

\paragraph{Planteamiento.} Se demuestra en qué condiciones $SCR=\sqrt{\sum_{ij}\rho_{ij}SCR_iSCR_j}$ \emph{es} el VaR 99,5\,\% de la suma, se comprueba por simulación qué pasa fuera de esas condiciones y se cuantifica lo que cuesta ignorar el contagio.

\subsubsection*{1. La demostración}
Sea $L=(L_1,\dots,L_d)\sim N(0,\Sigma)$ con $\sigma_i=SCR_i/z_{0{,}995}$ y matriz de correlación $P$. La suma $S=\sum_iL_i$ es normal con $\operatorname{Var}(S)=\sum_{ij}\rho_{ij}\sigma_i\sigma_j$, luego
\[
\operatorname{VaR}_{99{,}5\%}(S)=z_{0{,}995}\sqrt{\sum_{ij}\rho_{ij}\sigma_i\sigma_j}=\sqrt{\sum_{ij}\rho_{ij}SCR_iSCR_j}.
\]
Normal multivariante = marginales normales + cópula Gaussiana con matriz $P$. La fórmula estándar \emph{es} ese cálculo, con $P$ prescrita por el regulador.

\paragraph{Generalización.} El resultado vale para cualquier distribución \emph{elíptica} (también la $t$ multivariante): toda combinación lineal $w^\top L$ es una variable de la misma familia escalada por $\sqrt{w^\top\Sigma w}$; si las marginales se calibran en el mismo cuantil, $\operatorname{VaR}(S)=\sqrt{SCR^\top P\,SCR}$. Es decir, lo que la fórmula supone no es solo «Gaussiana» sino \emph{elipticidad} (en particular, ausencia de asimetría y de cola conjunta distinta de la marginal).

\subsubsection*{2. Comprobación por simulación (Caso 1, $2\cdot10^6$ escenarios)}
\begin{center}
\small
\begin{tabular}{lcr}
\toprule
Modelo para $(L_{mkt},L_{uw})$ con $\rho=0{,}25$ & Elíptico & VaR 99,5\,\% (M\euro)\\
\midrule
Fórmula estándar & -- & 55,68\\
(a) Normal bivariante & sí & 55,75\\
(b) $t$ bivariante, $\nu=4$ & sí & 56,02\\
(c) Cópula $t(\nu=4)$ con marginales normales & no & 59,80\\
(d) Cópula Gaussiana, marginales lognormales $\sigma=0{,}8$ & no & 54,38\\
(d') Cópula Gaussiana, marginales lognormales $\sigma=1{,}2$ & no & 53,90\\
(e) Cópula Gaussiana, marginales Pareto $\alpha=3$ & no & 54,36\\
\bottomrule
\end{tabular}
\end{center}
(a) y (b) reproducen la fórmula (la diferencia en (b) es el error de Monte Carlo de un cuantil 99,5\,\% de una $t_4$). En cuanto se sale de la familia elíptica la fórmula deja de ser exacta: con cola de dependencia (c) \textbf{infravalora} ($+7{,}4\%$); con marginales asimétricas (d,e) la \textbf{sobrevalora} ($-2$ a $-3\%$). La fórmula no es ni conservadora ni prudente «por construcción»: depende de la estructura real.

\subsubsection*{3. Implicación para líneas con contagio extremo}
La cópula Gaussiana es asintóticamente independiente ($\lambda=0$ si $\rho<1$), de modo que \textbf{da por hecho} que el beneficio de diversificación del nivel medio (aquí $70-55{,}68=14{,}32$ M\euro, el 20,5\,\%) se mantiene en el percentil 99,5. Con una Clayton rotada de la \emph{misma} $\tau$ de Kendall ($\theta=0{,}383$, $\lambda_U=0{,}16$) el VaR simulado es $62{,}00$ ($+11{,}3\%$) y el beneficio cae a $70-62{,}00=8{,}00$ M\euro: \textbf{se evapora el 44\,\% de la diversificación} precisamente en el escenario que fija el capital. El TVaR 99,5\,\% sube de $62{,}57$ a $70{,}76$ ($+13{,}1\%$), que coincide con el recargo del $13\%$ del Caso~1.

\paragraph{Qué hacer.} (i) Si la entidad usa fórmula estándar, evaluar en el ORSA la desviación del perfil de riesgo respecto a los supuestos del SCR (art.~45.1.c de la Directiva 2009/138/CE) con tablas de sensibilidad a la cola; (ii) para los módulos con contagio conocido (mercado--suscripción de caución o crédito, catastrófico--contraparte) aplicar un modelo interno parcial con cópulas con cola; (iii) justificar ante el supervisor cualquier cópula distinta de la implícita (carga de la prueba en la aseguradora).

\subsection{Pregunta 3 -- Clayton, Gumbel o $t$-Student para crédito y mercado}

\noindent\textbf{Enunciado.} Si tuvieras que elegir entre Clayton, Gumbel y una $t$-Student para modelar la dependencia entre el riesgo de crédito y el de mercado de una cartera de inversión, ¿cuál elegirías y por qué?

\paragraph{Planteamiento.} Se razona sobre las pérdidas (cola superior), se compara qué ofrece cada familia, se comprueba por simulación si los datos permiten distinguirlas y se concluye con una recomendación y su contraste.

\subsubsection*{1. Qué necesita el negocio}
Pérdidas de crédito (ampliación de \emph{spreads}, impagos) y de renta variable: en las crisis financieras se materializan a la vez; en las fases de euforia, una caída conjunta de pérdidas no pone en riesgo la solvencia. El interés está, por tanto, en la \textbf{cola superior de las pérdidas}, que puede ser distinta de la inferior.

\subsubsection*{2. Qué ofrece cada familia (misma $\tau=0{,}5$)}
\begin{center}
\small
\begin{tabular}{lcccp{5.6cm}}
\toprule
Familia & Parámetros & $\lambda_L$ & $\lambda_U$ & Comentario\\
\midrule
Clayton (sobre rentabilidades) & $\theta=2$ & 0,707 & 0 & Cola inferior de rentabilidad = pérdidas conjuntas si se rota; asimétrica\\
Gumbel (sobre pérdidas) & $\theta=2$ & 0 & 0,586 & Cola superior de pérdidas; asimétrica\\
$t$ ($\nu=15$) & $\rho=0{,}707,\nu$ & 0,117 & 0,117 & Cola simétrica y débil\\
$t$ ($\nu=4$) & $\rho=0{,}707,\nu$ & 0,397 & 0,397 & Cola simétrica fuerte\\
\bottomrule
\end{tabular}
\end{center}
Clayton y Gumbel son \emph{intercambiables} en $d>2$ (un único $\theta$) y solo admiten dependencia positiva; la $t$ tiene una matriz $P$ completa (cada par su $\rho$), pero un único $\nu$.

\subsubsection*{3. ¿Los datos distinguen las familias? (simulación, $n=1.500$)}
AIC (menor es mejor) de cada modelo ajustado a muestras generadas con distintas verdades:
\begin{center}
\small
\begin{tabular}{lrrr}
\toprule
 & Verdad: Gumbel $\theta=1{,}8$ & Verdad: Clayton rot.\ $\theta=1{,}2$ & Verdad: Gaussiana $\rho=0{,}68$\\
\midrule
Gaussiana & $-861{,}1$ & $-512{,}8$ & $\mathbf{-888{,}3}$\\
$t$-Student & $-886{,}0$ ($\hat\nu=8{,}2$) & $-534{,}1$ ($\hat\nu=7{,}8$) & $-885{,}3$ ($\hat\nu=129$)\\
Clayton & $-510{,}6$ & $-187{,}2$ & $-644{,}6$\\
Clayton rotada & $-880{,}7$ & $\mathbf{-737{,}2}$ & $-660{,}8$\\
Gumbel & $\mathbf{-944{,}1}$ & $-685{,}4$ & $-795{,}7$\\
Frank & $-803{,}1$ & $-484{,}0$ & $-819{,}2$\\
\bottomrule
\end{tabular}
\end{center}
Con asimetría real y $n=1.500$ el AIC la detecta con claridad: la $t$ intenta imitar la cola con $\hat\nu\approx8$ pero pierde unos 58 puntos frente a la familia correcta; con datos gaussianos la $t$ se degenera ($\hat\nu=129$) y la Gaussiana gana.

\subsubsection*{4. Qué cuesta equivocarse (ejercicio de ajuste, VaR 99,5\,\% de $X+Y$, muestra $t_{15}$)}
Elegir una cola \emph{con la orientación equivocada} es lo más caro: Clayton sin rotar $-13{,}2\%$ (respecto a la $t$ ajustada), Frank (sin cola) $-8{,}4\%$, Gaussiana $-1{,}2\%$, Clayton rotada $+4{,}6\%$, Gumbel $+3{,}9\%$.

\subsubsection*{5. Recomendación}
\begin{enumerate}[leftmargin=*,itemsep=2pt]
\item \textbf{Modelo base: cópula $t$} (matriz $P$ ajustada por pares, $\nu$ estimado), porque crédito y mercado se mueven juntos en ambas direcciones, se generaliza a $d$ riesgos, se calibra con una matriz de correlación coherente con el marco regulatorio y su $\nu$ cuantifica el contagio.
\item \textbf{Alternativa/estrés: Gumbel sobre pérdidas} (o Clayton rotada) si el contraste de asimetría de las colas lo apoya: es más severa a igual $\tau$ y es la prueba de robustez habitual.
\item Decidir con AIC/BIC, bondad de ajuste ($S_n$), $\lambda$ empírico con IC y sensibilidad del capital; \textbf{no} Gaussiana ni Frank como modelo final si hay evidencia de cola; \textbf{nunca} Clayton sin rotar con pérdidas.
\end{enumerate}
\paragraph{Conclusión.} La $t$ es la mejor opción como punto de partida general; si los datos o la economía muestran contagio solo en la dirección adversa, Gumbel (o Clayton rotada) es más fiel; Clayton directa es la cola equivocada para pérdidas.
""" + REFS

# ============================================================== DEBATE
DEBATE = r"""
\section{Tema 6: Dependencia no lineal y modelización de colas con cópulas}
\label{sec:tema6debate}
\noindent
Respuestas argumentadas a las cuatro preguntas para el debate en clase. Material de referencia: diapositivas del Tema 6 (Prof. Hugo González Riera). Las cifras proceden del taller (Excel, Python y R).

\subsection{Debate 1 -- ¿Por qué la fórmula estándar sigue usando agregación tipo Gaussiana?}

\noindent\textbf{Enunciado.} ¿Por qué crees que la fórmula estándar de Solvencia II sigue usando una agregación tipo Gaussiana (sin dependencia de cola) pese a sus limitaciones conocidas? ¿Qué argumentos de simplicidad regulatoria hay en juego?

\paragraph{Planteamiento.} Se separa lo que hace que la fórmula sea deseable como estándar (argumentos a favor) de su coste en riesgo de modelo, que se cuantifica.

\subsubsection*{1. Argumentos a favor de mantenerla}
\begin{itemize}[leftmargin=*,itemsep=2pt]
\item \textbf{Transparencia y comparabilidad.} Una fórmula cerrada, con una matriz de correlaciones prescrita, produce el mismo SCR para dos entidades con el mismo perfil: condición de «campo de juego nivelado» entre 27 Estados miembros.
\item \textbf{Auditabilidad y coste.} Se reproduce en una hoja de cálculo; no exige simulación ni validación estadística. Para la gran mayoría de aseguradoras pequeñas y medianas es la única opción proporcionada.
\item \textbf{Agregación jerárquica y asignación.} La raíz cuadrada se aplica por niveles (riesgos, módulo, BSCR, SCR) y permite asignar el capital por Euler. Una cópula con cola obligaría a simular el conjunto y a decidir quién «contribuye» a la cola.
\item \textbf{Calibración sin datos suficientes.} Los riesgos de baja frecuencia no tienen historia conjunta para estimar $\lambda$ (ver Debate 3); un único parámetro por par ($\rho_{ij}$) es lo máximo que se puede defender con datos europeos.
\item \textbf{Prudencia incorporada.} Los coeficientes prescritos se calibraron con criterio de prudencia (según la documentación de calibración de EIOPA/CEIOPS), en parte para recoger la dependencia en estrés; y el regulador abre la válvula: modelos internos totales o parciales, con carga de la prueba en la entidad.
\item \textbf{Estabilidad.} Evita que el SCR cambie por la elección de una familia de cópulas, que es una decisión de modelización difícil de contrastar.
\end{itemize}

\subsubsection*{2. Qué cuesta (riesgo de modelo)}
La fórmula es exacta solo para estructuras elípticas (ver Repaso~2). Con la misma dependencia media ($\tau$ de Kendall igual):
\begin{center}
\small
\begin{tabular}{lrrr}
\toprule
Caso & Fórmula estándar & Con cola & Diferencia\\
\midrule
2 módulos (40; 30), Clayton rotada & 55,68 & 62,00 & $+11{,}3\%$\\
4 módulos (40; 30; 20; 10), $t$ con $\nu=4$ & 70,00 & 75,99 & $+8{,}6\%$\\
4 módulos, $t$ con $\nu=10$ & 70,00 & 72,45 & $+3{,}5\%$\\
4 módulos, Clayton rotada & 70,00 & 81,78 & $+16{,}8\%$\\
4 módulos, Gumbel & 70,00 & 84,32 & $+20{,}5\%$\\
\bottomrule
\end{tabular}
\end{center}
Y la probabilidad de que los cuatro módulos superen a la vez su percentil 99 pasa de $0{,}8$ por cada 100.000 escenarios (Gaussiana) a $23{,}7$ ($t$, $\nu=4$), $41{,}5$ (Clayton rotada) y $127$ (Gumbel). Las arquimedianas usan un único $\theta$ para todos los pares: son escenarios de estrés, no calibraciones.

\subsubsection*{3. Una lectura equilibrada}
La simplicidad regulatoria es un \emph{bien público} (comparabilidad, supervisión, proporcionalidad) pagado con riesgo de modelo que la propia norma reconoce en el ORSA (evaluación de la desviación del perfil de riesgo respecto a los supuestos del SCR, art.~45.1.c) y en el proceso de aprobación de modelos internos. El problema no es que la fórmula sea Gaussiana, sino que se interprete su resultado como el capital «verdadero» y no como un \emph{mínimo regulatorio razonable} que la entidad debe contrastar con su perfil, sobre todo cuando el contagio es conocido.

\paragraph{Conclusión.} Se mantiene por simplicidad, comparabilidad y proporcionalidad, con la salvaguarda de los modelos internos y el ORSA; su coste (de $+4$ a $+20\%$ de capital en nuestros ejemplos) es el precio de esa simplicidad.

\subsection{Debate 2 -- Decisiones con los 7,24 M\euro{} de capital adicional}

\noindent\textbf{Enunciado.} En el Caso 1, ¿qué decisiones de negocio podrían tomarse con los 7,24 M\euro{} de capital adicional identificado bajo Clayton: reaseguro, cambios en la política de inversión, límites de suscripción?

\paragraph{Planteamiento.} Primero se cuantifica el coste y el reparto de ese capital; después se evalúan las palancas por su efecto sobre la \emph{cola conjunta}, no sobre el promedio.

\subsubsection*{1. Coste y reparto}
Al 6\,\% de coste de capital, 7,24 M\euro{} cuestan $0{,}434$ M\euro{} al año: es el \emph{presupuesto máximo} razonable para cubrir ese riesgo antes de que la cobertura deje de compensar. Su reparto (esperanza condicionada al VaR 99,5\,\%) no es proporcional al SCR individual:
\begin{center}
\small
\begin{tabular}{lrrr}
\toprule
 & VaR 99,5\,\% & Mercado & Suscripción\\
\midrule
Gaussiana & 55,71 & 34,20 (61,4\,\%) & 21,48 (38,6\,\%)\\
Clayton rotada & 62,07 & 36,61 (59,0\,\%) & 25,46 (41,0\,\%)\\
\emph{Incremento} & \emph{6,36} & \emph{2,41 (38\,\%)} & \emph{3,98 (62\,\%)}\\
\bottomrule
\end{tabular}
\end{center}
El \textbf{62\,\% del recargo de cola recae en suscripción}, aunque su SCR es el menor: en la cola conjunta, suscripción es la que más se arrastra. Es una pista de dónde actuar.

\subsubsection*{2. Palancas}
\begin{enumerate}[leftmargin=*,itemsep=3pt]
\item \textbf{Reaseguro.} Lo que reduce la cola conjunta no es el reaseguro proporcional (reduce ambos de forma parecida) sino el \emph{no proporcional}: \emph{stop-loss} agregado o XL por evento que limite la suscripción en el escenario adverso. Cada euro de recargo de capital evitado vale $6\%$ al año: una cobertura que recorte, por ejemplo, 3 M\euro{} de capital se justifica si su coste neto es inferior a $0{,}18$ M\euro/año. Hay que descontar el riesgo de contraparte del reasegurador, que es otro ejemplo de dependencia de cola (Debate~4).
\item \textbf{Política de inversión.} Reducir la beta de renta variable o cubrirla con opciones \emph{put} (coste de la prima frente a capital liberado), acortar el riesgo de crédito y aumentar liquidez. El objetivo es reducir la pata \emph{mercado} del evento conjunto; como la cola de mercado aporta el 59\,\% del VaR, es la palanca más grande en euros.
\item \textbf{Límites de suscripción.} Topes de exposición por zona, ramo y cliente en los ramos sensibles a la crisis (caución, crédito, responsabilidad civil de directivos) y revisión de precios: la tarifa debe incorporar un \emph{margen de cola} (no solo la correlación media).
\item \textbf{Capital y gobierno.} Mantener el colchón en fondos propios o en capital contingente, fijar umbrales de aviso en el ORSA y definir acciones de gestión previas (reducir dividendos, recomprar reaseguro).
\item \textbf{Modelo.} Antes de gastar, validar la cola: el $+13\%$ es ilustrativo (la simulación con igual $\tau$ da $+11\%$ en VaR y $+13\%$ en TVaR) y su valor depende de $\theta$ (para un $+13\%$ en VaR basta $\theta\approx0{,}45$, $\lambda_U\approx0{,}21$).
\end{enumerate}

\paragraph{Conclusión.} El criterio no es «cubrir los 7,24 M\euro», sino comparar el coste de cada palanca con el coste de capital que libera (6\,\%), priorizando las que actúan sobre la cola conjunta (reaseguro no proporcional en suscripción, cobertura de renta variable) y reflejando el recargo en el precio.

\subsection{Debate 3 -- ¿Cómo validar con pocos datos si hay dependencia de cola?}

\noindent\textbf{Enunciado.} ¿Cómo podrías validar, con datos históricos limitados (típico en riesgos de baja frecuencia), si la verdadera estructura de dependencia entre dos riesgos tiene o no dependencia de cola?

\paragraph{Planteamiento.} Honestidad estadística: con pocos datos la cola no se \emph{demuestra}; lo que se hace es acotar su plausibilidad, medir la incertidumbre y gestionar el riesgo de modelo. Se cuantifica con la muestra del ejercicio.

\subsubsection*{1. El estimador empírico es muy ruidoso}
$\hat\lambda(q)=P(V>q\mid U>q)$ en la muestra ($n=1.500$) con IC al 95\,\% por \emph{bootstrap} (1.000 remuestreos):
\begin{center}
\small
\begin{tabular}{lrrr}
\toprule
$q$ & Puntos en la cola & $\hat\lambda(q)$ & IC 95\,\%\\
\midrule
0,90 & 150 & 0,467 & [0,407; 0,544]\\
0,95 & 75 & 0,360 & [0,253; 0,453]\\
0,99 & 15 & 0,267 & [0,067; 0,533]\\
\bottomrule
\end{tabular}
\end{center}
A $q=0{,}99$ el intervalo va de $0{,}07$ a $0{,}53$: compatible con independencia casi total y con un contagio fuerte. Nada se aprende de un solo $q$.

\subsubsection*{2. Qué sí se puede hacer}
\begin{enumerate}[leftmargin=*,itemsep=2pt]
\item \textbf{Perfil $\hat\lambda(q)$ y $\hat\chi(q)$ para varios $q$} con IC: comprobar si el perfil converge a un valor positivo o decae a 0 (a $\tau=0{,}5$ la Gaussiana sigue en $\approx0{,}28$ a $q=0{,}99$ pese a $\lambda=0$: la convergencia es lentísima, no basta una cifra).
\item \textbf{Comparar modelos con y sin cola} con la \emph{misma} base de datos: AIC/BIC y contraste de razón de verosimilitudes (la Gaussiana es el límite $\nu\to\infty$ de la $t$), más bondad de ajuste $S_n$ (p-valores por \emph{bootstrap}). En nuestro ejercicio: $2\Delta\ell=11{,}95$, $\Delta$AIC $=9{,}95$, $\hat\nu=15{,}6$; pero la Gaussiana tampoco se rechaza ($p=0{,}96$).
\item \textbf{Potencia.} Con $\rho=0{,}7$ (60 réplicas por caso), el AIC elige la $t$ frente a la Gaussiana en el $47\%$ de las muestras con $n=250$ y $\nu=15$, en el $100\%$ con $n=1.500$ y $\nu=15$, y en el $98$--$100\%$ con $\nu=4$. Si el generador es Gaussiano elige la $t$ en el $10\%$ (error de tipo I). Con colas débiles y muestras pequeñas no hay potencia: no rechazar la Gaussiana no demuestra que no haya cola.
\item \textbf{Aprovechar la estructura de valores extremos.} Estimar con POT (Tema 5) las marginales y usar excedencias conjuntas por encima de umbrales altos (modelos bivariantes de extremos, función de dependencia de Pickands, $\eta$ de Ledford--Tawn) en lugar del cuerpo de la distribución.
\item \textbf{Aumentar los datos}: periodos de estrés específicos, datos de grupo o de mercado, series externas homogeneizadas, simulaciones de escenarios físicos o económicos (catastróficos, crisis).
\item \textbf{Argumento causal}: contagio por un canal real (litigiosidad, impago del reasegurador) vale más que un estadístico. Si hay un mecanismo, se modela una cola aunque la muestra no la detecte.
\item \textbf{Sensibilidad y prudencia.} Si no se puede probar ni descartar la cola, se acota: calcular el capital con Gaussiana, $t$ y Gumbel, usar la peor o un promedio y publicar el rango en el ORSA; \emph{reverse stress test} de coincidencia de extremos.
\end{enumerate}

\paragraph{Conclusión.} Con datos limitados la pregunta correcta no es «¿hay cola?» sino «¿cuánto capital cambia si la hay, y qué evidencia hay en contra?». Se valida combinando perfil $\hat\lambda(q)$ con IC, selección de modelos y potencia, extremos bivariantes, juicio experto causal y sensibilidad.

\subsection{Debate 4 -- Otros pares de riesgos con dependencia de cola}

\noindent\textbf{Enunciado.} ¿Qué otros pares de riesgos, además de mercado--siniestralidad, sospechas que podrían tener dependencia de cola relevante para una aseguradora o un banco?

\paragraph{Planteamiento.} Se propone una lista con el \emph{canal} que genera la cola, el signo de la cola en pérdidas y la familia que se probaría primero.

\begin{center}
\small
\begin{tabular}{p{3.6cm}p{5.4cm}p{3.2cm}}
\toprule
Par de riesgos & Canal de contagio & Cola/familia a probar\\
\midrule
Catastrófico natural -- contraparte del reaseguro & Gran siniestro y rebaja de rating o retraso de pago del reasegurador a la vez (riesgo de camino equivocado) & Superior; Gumbel, $t$\\
Hogar -- Autos (granizo, inundación) & Un mismo evento climático dispara ambos ramos & Superior; Gumbel\\
Pandemia: mortalidad -- salud -- interrupción de negocio -- crédito & Un \emph{shock} común sistémico & $t$ con $\nu$ bajo; vines\\
Tipos de interés -- caída de renta variable -- caducidad masiva (vida) & Crisis financiera con salidas de ahorro y devaluación de activos & Superior; $t$\\
Crédito -- renta variable (cartera de inversión) & Ampliación de \emph{spreads} y caída bursátil en crisis & Superior de pérdidas; Gumbel/$t$\\
Inflación social -- responsabilidad civil -- daños materiales & Alza común de costes de reparación, indemnizaciones y litigiosidad & Superior; $t$\\
Ciber: pérdidas de asegurados distintos & Un mismo proveedor, fallo o vulnerabilidad afecta a muchos clientes & Superior; Gumbel jerárquica\\
Crédito/caución -- ciclo económico & Quiebras encadenadas y sequía de financiación & Superior; $t$\\
Banca: soberano -- banca doméstica (\emph{doom loop}) & Deuda pública en el balance bancario y rescates & Superior; asimétrica\\
Banca: inmobiliario -- hipotecas -- empleo & Caída de precios y desempleo simultáneos & Superior; $t$\\
\bottomrule
\end{tabular}
\end{center}

\paragraph{Cómo decidir.} (i) Hay un canal causal creíble. (ii) El contagio es en la dirección adversa y, por tanto, la cola de pérdidas es la superior; se rota la cópula si se trabaja con rentabilidades. (iii) Se contrasta con datos (perfil $\hat\lambda(q)$, AIC, potencia) o con escenarios. (iv) En dimensión $d>2$ se prefieren $t$ agrupada, HAC o vines si los pares son heterogéneos.

\paragraph{Conclusión.} La dependencia de cola aparece donde un \emph{factor común} (clima, crisis financiera, pandemia, fallo tecnológico, solvencia del reasegurador) conecta riesgos que en tiempos normales parecen independientes; son justo los que la agregación Gaussiana no ve.
""" + REFS

def build():
    r = PRE + portada("repaso",
        "Respuestas razonadas a las tres preguntas de repaso del tema. Tema 6 (Dependencia no lineal y modelización de colas con cópulas): correlación nula con dependencia de cola, la fórmula estándar de Solvencia II como cópula Gaussiana y la elección de familia para crédito y mercado.",
        "cópulas, dependencia de cola, Solvencia II, correlación, preguntas de repaso",
        "Class work for Topic 6 of Actuarial Mathematics of Stability and Solvency of Insurance Activity: review questions on copulas and tail dependence with actuarial reasoning and numerical evidence.",
        "copulas, tail dependence, Solvency II, correlation, review questions") + REPASO + "\n\\end{document}\n"
    d = PRE + portada("debate",
        "Respuestas argumentadas a las cuatro preguntas de debate del tema. Tema 6 (Dependencia no lineal y modelización de colas con cópulas): simplicidad regulatoria de la fórmula estándar, decisiones sobre el capital adicional, validación de la cola con pocos datos y otros pares de riesgos con contagio.",
        "cópulas, dependencia de cola, capital de solvencia, validación, debate",
        "Class debate for Topic 6 of Actuarial Mathematics of Stability and Solvency of Insurance Activity: regulatory simplicity, tail-dependence capital, validation with limited data and other contagion pairs.",
        "copulas, tail dependence, solvency capital, validation, debate") + DEBATE + "\n\\end{document}\n"
    for nm, txt in (("t6_repaso.tex", r), ("t6_debate.tex", d)):
        txt = txt.replace("¿", r"\textquestiondown{}").replace("¡", r"\textexclamdown{}").replace("«", r"\guillemotleft{}").replace("»", r"\guillemotright{}")
        (HERE / nm).write_text(txt, encoding="utf-8"); fixtex.fix(HERE / nm)
        print(nm, lib.compile_tex(HERE / nm))

if __name__ == "__main__":
    build()
