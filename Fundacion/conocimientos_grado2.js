/**
 * Gendanken Palast - Segundo bloque del Grado en Economía (4.º curso)
 * Econometría II, Técnicas de evaluación de impacto, y ampliaciones de Teoría de juegos
 * y Dinámica económica a partir de los libros de referencia. Se carga después de conocimientos_grado.js.
 */

Object.assign(CALCULATORS, {
    // --- Teoría de juegos: duopolio de Cournot y de Stackelberg ----------
    cournot: {
        title: 'Duopolio de Cournot y de Stackelberg (demanda lineal)',
        inputs: [
            { id: 'a', label: 'Intercepto de la demanda $a$ ($P=a-bQ$)', value: 100, step: 5 },
            { id: 'b', label: 'Pendiente $b$', value: 1, step: 0.1 },
            { id: 'c1', label: 'Coste marginal de la empresa 1', value: 10, step: 1 },
            { id: 'c2', label: 'Coste marginal de la empresa 2', value: 10, step: 1 }
        ],
        compute(v) {
            const a = v.a, b = Math.max(v.b, 1e-6), c1 = v.c1, c2 = v.c2;
            const q1 = Math.max(0, (a - 2 * c1 + c2) / (3 * b)), q2 = Math.max(0, (a - 2 * c2 + c1) / (3 * b));
            const Q = q1 + q2, P = a - b * Q;
            // Stackelberg: la empresa 1 mueve primero (induccion hacia atras)
            const s1 = Math.max(0, (a - 2 * c1 + c2) / (2 * b)), s2 = Math.max(0, (a - c2 - b * s1) / (2 * b));
            const Ps = a - b * (s1 + s2);
            // Monopolio de la empresa 1 con coste c1
            const qm = Math.max(0, (a - c1) / (2 * b)), Pm = a - b * qm;
            return {
                outputs: [
                    { label: 'Cournot: cantidades $q_1^*,\\,q_2^*$', value: NUM.fmt(q1, 2) + '  ·  ' + NUM.fmt(q2, 2), note: '$q_i^*=(a-2c_i+c_j)/(3b)$: cada empresa responde de forma óptima a la otra.' },
                    { label: 'Cournot: precio y beneficios', value: NUM.fmt(P, 2) + '  ·  ' + NUM.fmt((P - c1) * q1, 1) + '  ·  ' + NUM.fmt((P - c2) * q2, 1) },
                    { label: 'Stackelberg: cantidades del líder y del seguidor', value: NUM.fmt(s1, 2) + '  ·  ' + NUM.fmt(s2, 2), note: 'El líder produce más y el seguidor menos que en Cournot: mover primero da ventaja.' },
                    { label: 'Stackelberg: precio y beneficios', value: NUM.fmt(Ps, 2) + '  ·  ' + NUM.fmt((Ps - c1) * s1, 1) + '  ·  ' + NUM.fmt((Ps - c2) * s2, 1) },
                    { label: 'Monopolio: cantidad y precio', value: NUM.fmt(qm, 2) + '  ·  ' + NUM.fmt(Pm, 2), note: 'Con dos empresas el precio cae por debajo del de monopolio.' }
                ]
            };
        }
    },

    // --- Dinámica económica: modelo de crecimiento de Solow ---------------
    solow: {
        title: 'Modelo de crecimiento de Solow: estado estacionario',
        inputs: [
            { id: 's', label: 'Tasa de ahorro $s$ (%)', value: 25, step: 1 },
            { id: 'n', label: 'Crecimiento de la población $n$ (%)', value: 1, step: 0.25 },
            { id: 'd', label: 'Depreciación $\\delta$ (%)', value: 5, step: 0.5 },
            { id: 'alpha', label: 'Elasticidad del capital $\\alpha$', value: 0.33, step: 0.01 },
            { id: 'k0', label: 'Capital inicial por trabajador $k_0$', value: 2, step: 0.5 },
            { id: 'T', label: 'Periodos $T$ (años)', value: 20, step: 5 }
        ],
        compute(v) {
            const s = v.s / 100, g = (v.n + v.d) / 100, al = Math.min(0.95, Math.max(0.05, v.alpha));
            const T = Math.max(0, Math.min(500, Math.round(v.T)));
            const kstar = Math.pow(s / g, 1 / (1 - al)), ystar = Math.pow(kstar, al);
            // Integracion de Euler de dk/dt = s k^alpha - (n + delta) k
            let k = Math.max(v.k0, 1e-6);
            const h = 0.05;
            for (let t = 0; t < T / h; t++) k += h * (s * Math.pow(k, al) - g * k);
            const speed = (1 - al) * g;
            return {
                outputs: [
                    { label: 'Capital de estado estacionario $k^*=(s/(n+\\delta))^{1/(1-\\alpha)}$', value: NUM.fmt(kstar, 3) },
                    { label: 'Producto por trabajador $y^*=k^{*\\alpha}$', value: NUM.fmt(ystar, 3) },
                    { label: 'Consumo por trabajador $c^*=(1-s)\\,y^*$', value: NUM.fmt((1 - s) * ystar, 3), note: 'Máximo consumo (regla de oro) con $s=\\alpha$.' },
                    { label: 'Capital tras $T$ años', value: NUM.fmt(k, 3), note: 'Se aproxima a $k^*$: el estado estacionario es estable.' },
                    { label: 'Velocidad de convergencia $(1-\\alpha)(n+\\delta)$', value: NUM.fmt(speed * 100, 2) + ' % anual' }
                ]
            };
        }
    },

    // --- Econometría II: modelo de duración de Weibull --------------------
    weibull: {
        title: 'Modelo de duración de Weibull',
        inputs: [
            { id: 'lam', label: 'Parámetro de escala $\\lambda$', value: 0.02, step: 0.005 },
            { id: 'p', label: 'Parámetro de forma $p$', value: 1.5, step: 0.1 },
            { id: 't', label: 'Tiempo $t$ (meses)', value: 12, step: 1 }
        ],
        compute(v) {
            const lam = Math.max(v.lam, 1e-9), p = Math.max(v.p, 1e-3), t = Math.max(v.t, 1e-9);
            const S = Math.exp(-lam * Math.pow(t, p));
            const h = lam * p * Math.pow(t, p - 1);
            const med = Math.pow(Math.LN2 / lam, 1 / p);
            return {
                outputs: [
                    { label: 'Supervivencia $S(t)=e^{-\\lambda t^p}$', value: NUM.fmt(S, 4), note: 'Probabilidad de seguir en el estado (p. ej., desempleado) pasado $t$.' },
                    { label: 'Tasa de salida $h(t)=\\lambda p\\,t^{p-1}$', value: NUM.fmt(h, 5) },
                    { label: 'Prob. de salir antes de $t$: $1-S(t)$', value: NUM.fmt(1 - S, 4) },
                    { label: 'Duración mediana $(\\ln 2/\\lambda)^{1/p}$', value: NUM.fmt(med, 2) + ' meses' },
                    { label: 'Forma de la tasa de salida', value: p > 1 ? 'Creciente (dependencia positiva)' : (p < 1 ? 'Decreciente (dependencia negativa)' : 'Constante (modelo exponencial)') }
                ]
            };
        }
    },

    // --- Econometría II: logit multinomial y la IIA -----------------------
    mnl_iia: {
        title: 'Logit multinomial y la independencia de alternativas irrelevantes',
        inputs: [
            { id: 'vc', label: 'Utilidad determinista del coche $V_{\\text{coche}}$', value: 0, step: 0.25 },
            { id: 'vb', label: 'Utilidad del autobús rojo $V_{\\text{rojo}}$', value: 0, step: 0.25 }
        ],
        compute(v) {
            const ec = Math.exp(v.vc), eb = Math.exp(v.vb);
            const p2c = ec / (ec + eb), p2b = eb / (ec + eb);
            const den3 = ec + 2 * eb;
            return {
                outputs: [
                    { label: 'Dos alternativas: $P$(coche) · $P$(autobús)', value: NUM.fmt(p2c, 3) + '  ·  ' + NUM.fmt(p2b, 3) },
                    { label: 'Se añade un autobús azul idéntico: $P$(coche)', value: NUM.fmt(ec / den3, 3), note: 'El logit multinomial reparte el autobús entre dos colores y baja la cuota del coche, lo cual no es razonable.' },
                    { label: 'Tres alternativas: cada autobús', value: NUM.fmt(eb / den3, 3), note: 'Ambos autobuses suman ' + NUM.fmt(2 * eb / den3, 3) + ' frente a ' + NUM.fmt(p2b, 3) + ' antes.' },
                    { label: 'Cociente $P$(coche)/$P$(rojo) en ambos casos', value: NUM.fmt(ec / eb, 3), note: 'Es la IIA: el cociente no cambia al añadir alternativas. El logit anidado la relaja agrupando los dos autobuses en un nido.' }
                ]
            };
        }
    },

    // --- Evaluación de impacto: diferencias en diferencias ----------------
    did: {
        title: 'Diferencias en diferencias (2×2)',
        inputs: [
            { id: 'tpre', label: 'Tratados, antes del programa', value: 100, step: 5 },
            { id: 'tpost', label: 'Tratados, después', value: 130, step: 5 },
            { id: 'cpre', label: 'Control, antes', value: 95, step: 5 },
            { id: 'cpost', label: 'Control, después', value: 110, step: 5 }
        ],
        compute(v) {
            const dT = v.tpost - v.tpre, dC = v.cpost - v.cpre, did = dT - dC;
            return {
                outputs: [
                    { label: 'Antes–después (solo tratados)', value: NUM.fmt(dT, 1), note: 'Mezcla el efecto del programa con la tendencia común.' },
                    { label: 'Diferencia de medias después (tratados − control)', value: NUM.fmt(v.tpost - v.cpost, 1), note: 'Mezcla el efecto con las diferencias de partida.' },
                    { label: 'Cambio del grupo de control (tendencia)', value: NUM.fmt(dC, 1) },
                    { label: 'Efecto DiD $=(\\bar Y^{T}_{1}-\\bar Y^{T}_{0})-(\\bar Y^{C}_{1}-\\bar Y^{C}_{0})$', value: NUM.fmt(did, 1), note: 'Válido si, sin programa, ambos grupos habrían evolucionado igual (igualdad de tendencias).' }
                ]
            };
        }
    }
});

// ==========================================================================
// Ampliación de Teoría de juegos con Dixit y Nalebuff y con Gibbons
// ==========================================================================
(function () {
    const tj = KNOWLEDGE.teoria_juegos;
    const dinamicos = {
        id: 'dinamicos', title: 'Reglas y juegos dinámicos',
        blocks: [
            { type: 'p', text: 'Dixit y Nalebuff (<i>El arte de la estrategia</i>, traducido por profesores de la Universidad de Alcalá) condensan la teoría en reglas de comportamiento. La parte I trata los juegos que se resuelven <b>razonando hacia atrás</b> (juegos secuenciales), los dilemas de los presos y el equilibrio de Nash en juegos simultáneos.' },
            { type: 'table', caption: 'Reglas de Dixit y Nalebuff (parte I)', head: ['Regla', 'Enunciado'], rows: [
                ['1', 'Mire hacia delante y razone hacia atrás: prevea el resultado final de sus decisiones iniciales y úselo para calcular su mejor opción.'],
                ['2', 'Si tiene una estrategia dominante, utilícela. Si no la tiene pero su adversario sí, cuente con que la usará y elija su mejor respuesta.'],
                ['3', 'Descarte las estrategias dominadas y repita el proceso: pueden aparecer nuevas estrategias dominantes en el juego más pequeño.'],
                ['4', 'Busque un equilibrio: un par de estrategias en las que la acción de cada jugador sea la mejor respuesta a la del otro.'],
                ['5', 'En un juego de suma cero, si perjudica dejar que el adversario conozca su jugada, mezcle estrategias de forma aleatoria.']
            ] },
            { type: 'list', title: 'Resto del libro', items: [
                '<b>Parte II</b>: elección y azar (estrategias mixtas), jugadas estratégicas (compromisos, amenazas y promesas) y cómo hacer creíbles las estrategias.',
                '<b>Parte III</b>: interpretación y manipulación de la información, cooperación y coordinación, y subastas.',
                '<b>Subasta de Vickrey</b> (segundo precio): se paga la segunda puja más alta, y pujar la propia valoración es una estrategia dominante. En otras subastas aparece la <b>maldición del ganador</b>: ganar suele significar que se ha pagado más de lo que vale el objeto.'
            ] },
            { type: 'list', title: 'Gibbons, <i>Un primer curso de teoría de juegos</i> (contenido)', items: [
                '<b>Cap. 1. Juegos estáticos con información completa</b>: forma normal y equilibrio de Nash, eliminación iterativa de estrategias estrictamente dominadas, aplicaciones (duopolio de Cournot y de Bertrand, arbitraje de oferta final, el problema de los ejidos) y estrategias mixtas.',
                '<b>Cap. 2. Juegos dinámicos con información completa</b>: inducción hacia atrás, <b>perfección en subjuegos</b> (pánico bancario, aranceles y competencia imperfecta internacional, torneos), juegos repetidos finita e infinitamente (colusión entre duopolistas de Cournot, salarios de eficiencia, política monetaria estable) y juegos con información imperfecta.',
                '<b>Cap. 3. Juegos estáticos con información incompleta</b>: equilibrio bayesiano de Nash.',
                '<b>Cap. 4. Juegos dinámicos con información incompleta</b>: equilibrio bayesiano perfecto, señalización en el mercado de trabajo, inversión empresarial y estructura de capital, política monetaria, juegos con parloteo (<i>cheap talk</i>) y reputación en el dilema de los presos repetido.'
            ] },
            { type: 'formula', label: 'Cournot (demanda $P=a-bQ$, costes marginales $c_i$)', tex: 'q_i^*=\\frac{a-2c_i+c_j}{3b},\\qquad \\text{simétrico: }q^*=\\frac{a-c}{3b}' },
            { type: 'formula', label: 'Stackelberg (la empresa 1 mueve primero, inducción hacia atrás)', tex: 'q_2(q_1)=\\frac{a-c_2-bq_1}{2b},\\qquad q_1^S=\\frac{a-2c_1+c_2}{2b}' },
            { type: 'p', text: 'Compara el equilibrio simultáneo de Cournot con el secuencial de Stackelberg. La diferencia entre ambos es un ejemplo de que, en un juego dinámico, <b>mover primero</b> y poder comprometerse a una cantidad cambia el resultado.' },
            { type: 'calculator', id: 'cournot' }
        ]
    };
    tj.sections.splice(2, 0, dinamicos);
    const src = tj.sections.find(s => s.id === 'fuentes');
    src.blocks[0].items = [
        'Teoría de juegos. Transparencias de los Temas 1 a 4 (archivos protegidos con contraseña, no consultados), hojas de problemas y actividades voluntarias resueltas. Grado en Economía, Universidad de Alcalá.',
        'Gibbons, R. (1992). Un primer curso de teoría de juegos. Antoni Bosch (índice y capítulos de la edición del curso).',
        'Dixit, A. K. y Nalebuff, B. J. (2008). El arte de la estrategia (trad. de M.ª E. Rabasco y L. Toharia, Universidad de Alcalá). Antoni Bosch, 2010.',
        'Pérez, J., Jimeno, J. L. y Cerdá, E. (2004). Teoría de juegos. Pearson.'
    ];
})();

// ==========================================================================
// Ampliación de Dinámica económica con Chiang y Wainwright
// ==========================================================================
(function () {
    const de = KNOWLEDGE.dinamica_economica;
    const continuo = {
        id: 'continuo', title: 'Tiempo continuo y manual',
        blocks: [
            { type: 'p', text: 'El manual de referencia, <i>Métodos fundamentales de economía matemática</i> (Chiang y Wainwright, 4.ª ed.), dedica su parte quinta al análisis dinámico. Primero introduce la integral, porque una trayectoria temporal es la integral de su tasa de cambio, y después recorre el tiempo continuo (ecuaciones diferenciales) y el discreto (ecuaciones en diferencias).' },
            { type: 'table', caption: 'Parte V: análisis dinámico', head: ['Capítulo', 'Contenido'], rows: [
                ['14', 'La dinámica económica y el cálculo integral: integrales, valor presente de un flujo y modelo de crecimiento de Domar'],
                ['15', 'Tiempo continuo: ecuaciones diferenciales de primer orden; dinámica del precio de mercado; diagrama de fases; modelo de Solow'],
                ['16', 'Ecuaciones diferenciales de orden superior: raíces reales y complejas, expectativas de precios, inflación y desempleo'],
                ['17', 'Tiempo discreto: ecuaciones en diferencias de primer orden y estabilidad dinámica'],
                ['18', 'Ecuaciones en diferencias de orden superior'],
                ['19', 'Ecuaciones diferenciales y en diferencias simultáneas']
            ] },
            { type: 'formula', label: 'Primer orden en tiempo continuo', tex: '\\dot y+a\\,y=b\\ \\Rightarrow\\ y(t)=\\Big(y(0)-\\frac ba\\Big)e^{-at}+\\frac ba,\\qquad \\text{estable}\\iff a>0' },
            { type: 'formula', label: 'Segundo orden: ecuación característica', tex: '\\ddot y+a_1\\dot y+a_2y=b\\ \\Rightarrow\\ r^2+a_1r+a_2=0,\\quad r=\\frac{-a_1\\pm\\sqrt{a_1^2-4a_2}}{2}', note: 'Estable si las partes reales de las raíces son negativas. Raíces complejas $h\\pm vi$ dan oscilaciones $e^{ht}(C_1\\cos vt+C_2\\sin vt)$.' },
            { type: 'formula', label: 'Modelo de Solow', tex: '\\dot k=s\\,k^{\\alpha}-(n+\\delta)\\,k\\ \\Rightarrow\\ k^*=\\Big(\\frac{s}{n+\\delta}\\Big)^{\\frac1{1-\\alpha}}' },
            { type: 'p', text: 'En Solow el capital por trabajador converge a un estado estacionario estable. Cambia la tasa de ahorro o el crecimiento de la población y observa el nuevo equilibrio.' },
            { type: 'calculator', id: 'solow' }
        ]
    };
    de.sections.splice(3, 0, continuo);
    const src = de.sections.find(s => s.id === 'fuentes');
    src.blocks[0].items = [
        'Dinámica económica (2024-25). Transparencias de los Temas 1 y 3 (protegidas con contraseña, no consultadas), tabla de EDLCC, fórmulas trigonométricas y actividades voluntarias resueltas. Grado en Economía, Universidad de Alcalá.',
        'Chiang, A. C. y Wainwright, K. (2006). Métodos fundamentales de economía matemática, 4.ª ed. McGraw-Hill, parte quinta (capítulos 14 a 19).'
    ];
})();

Object.assign(KNOWLEDGE, {

    // ------------------------------------------------------------------
    econometria_ii: {
        sections: [
            {
                id: 'idea', title: 'Idea clave',
                blocks: [
                    { type: 'p', text: 'Econometría II (Prof. José María Arranz Muñoz, Universidad de Alcalá) trata variables dependientes que no son continuas: el <b>tiempo hasta que ocurre algo</b> (modelos de duración) y la <b>elección entre varias alternativas</b> (modelos de elección múltiple). Las prácticas se hacen con Stata.' },
                    { type: 'list', title: 'Bloque 1. Modelos de duración', items: [
                        '<b>Datos de duración</b>: el tiempo entre el inicio y el final de un suceso (desempleo, huelgas, programas de formación, mortalidad de empresas). Conceptos clave: tiempo, <b>censura</b> (no se observa el final), truncamiento y variables explicativas.',
                        '<b>Tiempo continuo</b>: función de supervivencia y función de riesgo; modelo no paramétrico (Kaplan–Meier), semiparamétrico de riesgos proporcionales (Cox) y paramétricos (exponencial, Weibull, gamma, log-normal, log-logístico, Gompertz).',
                        '<b>Tiempo discreto</b>: cuando el tiempo se mide en meses o años; se expande la muestra a una fila por individuo y periodo en riesgo y se estima un logit.',
                        '<b>Riesgos en competencia</b>: varias salidas posibles. En continuo la verosimilitud se separa por destino; en discreto se estima un logit multinomial.',
                        '<b>Efectos del tratamiento</b> con modelos de duración.'
                    ] },
                    { type: 'list', title: 'Bloque 2. Modelos de elección múltiple', items: [
                        'Se generalizan los modelos dicotómicos a varias alternativas mutuamente excluyentes: transporte (McFadden, 1974), ocupación (Boskin, 1974) o elección de crédito (Terza, 1985).',
                        '<b>Logit multinomial</b> (regresores del individuo: renta, sexo, edad) y <b>logit condicional</b> (regresores de las alternativas: precio, tiempo).',
                        '<b>Independencia de alternativas irrelevantes (IIA)</b>: el cociente de probabilidades de dos alternativas no depende de las demás, lo que da el problema del autobús rojo y el autobús azul.',
                        '<b>Logit anidado</b>, modelos de <b>utilidad aleatoria aditiva (ARUM)</b>, <b>logit de parámetros aleatorios</b> (mixed logit) y <b>probit multinomial</b>, que relajan la IIA.',
                        '<b>Datos ordenados, secuenciales y por rango</b> (logit ordenado) y <b>probit bivariado</b> para dos resultados discretos relacionados.'
                    ] },
                    { type: 'callout', text: 'Práctica de duración del curso: 75.067 perceptores de prestaciones de la MCVL (Muestra Continua de Vidas Laborales). El 94,54 % encuentra empleo (duración completa) y el 5,46 % sigue desempleado al terminar el periodo (<b>censura</b>). La duración máxima es de 1.800 días.' }
                ]
            },
            {
                id: 'formulas', title: 'Fórmulas',
                blocks: [
                    { type: 'formula', label: 'Supervivencia, riesgo y riesgo acumulado', tex: 'S(t)=P(T>t)=1-F(t),\\qquad h(t)=\\lim_{\\Delta t\\to0}\\frac{P(t\\le T<t+\\Delta t\\mid T\\ge t)}{\\Delta t}=\\frac{f(t)}{S(t)},\\qquad H(t)=-\\ln S(t)' },
                    { type: 'formula', label: 'Verosimilitud con censura', tex: '\\mathcal L=\\prod_{i=1}^N f(t_i)^{d_i}\\,S(t_i)^{1-d_i},\\qquad d_i=1\\ \\text{si la duración es completa y }0\\text{ si está censurada}' },
                    { type: 'formula', label: 'Riesgos proporcionales (Cox) y heterogeneidad', tex: 'h(t\\mid X)=h_0(t)\\,\\exp(X\\beta),\\qquad \\text{sin covariables: }h(t)=h_0(t)\\ \\text{(Kaplan–Meier)}' },
                    { type: 'table', caption: 'Modelos paramétricos de duración', head: ['Modelo', 'Riesgo $h(t)$', 'Supervivencia $S(t)$'], rows: [
                        ['Exponencial', '$\\lambda$ (constante)', '$e^{-\\lambda t}$'],
                        ['Weibull', '$\\lambda p\\,t^{p-1}$', '$e^{-\\lambda t^p}$']
                    ] },
                    { type: 'formula', label: 'Logit multinomial (regresores del individuo)', tex: 'P(y_i=j)=\\frac{\\exp(x_i^\\top\\beta_j)}{\\sum_{k=1}^{m}\\exp(x_i^\\top\\beta_k)},\\qquad \\beta_1=0' },
                    { type: 'formula', label: 'Logit condicional (regresores de las alternativas)', tex: 'P(y_i=j)=\\frac{\\exp(x_{ij}^\\top\\beta)}{\\sum_{k=1}^{m}\\exp(x_{ik}^\\top\\beta)}' },
                    { type: 'formula', label: 'Modelo de utilidad aleatoria aditiva (ARUM)', tex: 'U_{ij}=V_{ij}+\\varepsilon_{ij},\\qquad P(y_i=j)=P(U_{ij}\\ge U_{ik}\\ \\forall k)', note: 'Con errores extremo tipo I se obtiene el logit; con errores normales multivariantes, el probit multinomial; con parámetros que varían entre individuos, el mixed logit.' },
                    { type: 'formula', label: 'IIA', tex: '\\frac{P_{ij}}{P_{ik}}=\\exp\\big((x_{ij}-x_{ik})^\\top\\beta\\big)\\quad\\text{no depende de las demás alternativas}' },
                    { type: 'formula', label: 'Modelo ordenado (variable latente)', tex: 'y^*_i=x_i^\\top\\beta+\\varepsilon_i,\\qquad y_i=j\\ \\text{si}\\ \\kappa_{j-1}<y^*_i\\le\\kappa_j' }
                ]
            },
            {
                id: 'calculadora', title: 'Calculadoras',
                blocks: [
                    { type: 'p', text: 'Un modelo de Weibull: con $p>1$ la tasa de salida crece con el tiempo en desempleo; con $p<1$ disminuye (la gente con duraciones largas sale cada vez menos).' },
                    { type: 'calculator', id: 'weibull' },
                    { type: 'p', text: 'La IIA en acción: añade un autobús azul idéntico al rojo y observa cómo cae la probabilidad del coche.' },
                    { type: 'calculator', id: 'mnl_iia' }
                ]
            },
            {
                id: 'codigo', title: 'Código',
                blocks: [
                    { type: 'code', code: {
                        Stata: `
* --- Modelos de duracion en tiempo continuo (practica 1 del curso) ---
use duracion4.dta, clear
stset durtocur, failure(censu)        // declara los datos: duracion y censura
stdescribe
sts graph                              // supervivencia de Kaplan-Meier
sts graph, hazard                      // tasa de salida
sts test sexo, logrank                 // comparacion por sexo
streg sex1 nacionalidad grupo2-grupo6, distribution(exp) nolog nohr
streg sex1 nacionalidad grupo2-grupo6, distribution(weibull) nolog
stcurv, hazard

* --- Tiempo discreto: una fila por individuo y mes en riesgo ---
gen id = _n
expand time
sort id
by id: gen spell = _n
by id: gen lsta = censu & _n == _N     // variable binaria del riesgo discreto
logit lsta spell edad nacionalidad     // modelo logit del riesgo discreto

* --- Elección multiple ---
mlogit y x1 x2, baseoutcome(1)         // logit multinomial
clogit choice precio tiempo, group(id) // logit condicional
* logit anidado: ver la practica NL (nlogitgen, nlogittree y nlogit)
ologit hlthstat age linc ndisease      // logit ordenado
biprobit hlthe dmdu age linc ndisease  // probit bivariado`,
                        r: `
library(survival)
# Duracion: Kaplan-Meier, Weibull y Cox sobre datos con censura (censu = 1 si hay salida)
d <- data.frame(t = rweibull(500, shape = 1.5, scale = 20), x = rbinom(500, 1, 0.5))
d$censu <- as.integer(d$t < 40); d$t <- pmin(d$t, 40)
km <- survfit(Surv(t, censu) ~ x, data = d); plot(km)
survdiff(Surv(t, censu) ~ x, data = d)                    # log-rank
summary(survreg(Surv(t, censu) ~ x, data = d, dist = "weibull"))
summary(coxph(Surv(t, censu) ~ x, data = d))

# Eleccion multiple: logit multinomial
library(nnet)
set.seed(1); n <- 600; x <- rnorm(n)
y <- factor(sample(c("a", "b", "c"), n, TRUE, prob = c(.4, .35, .25)))
summary(multinom(y ~ x))`,
                        python: `
import numpy as np
from lifelines import KaplanMeierFitter, WeibullAFTFitter  # pip install lifelines
import pandas as pd
import statsmodels.api as sm

rng = np.random.default_rng(1)
d = pd.DataFrame({"t": rng.weibull(1.5, 500) * 20, "x": rng.integers(0, 2, 500)})
d["censu"] = (d.t < 40).astype(int); d["t"] = d.t.clip(upper=40)
KaplanMeierFitter().fit(d.t, d.censu).plot_survival_function()
print(WeibullAFTFitter().fit(d, "t", "censu").summary)

# Logit multinomial
n = 600; X = sm.add_constant(rng.normal(size=n))
y = rng.choice([0, 1, 2], n, p=[.4, .35, .25])
print(sm.MNLogit(y, X).fit().summary())` } }
                ]
            },
            {
                id: 'fuentes', title: 'Fuentes',
                blocks: [
                    { type: 'sources', items: [
                        'Arranz Muñoz, J. M. (2026). Econometría II: Modelos de duración (teoría Temas I a IV y prácticas 1 a 3 con Stata, base MCVL) y Modelos de elección múltiple (clases 1 a 9 y prácticas). Grado en Economía, Universidad de Alcalá.',
                        'Arranz, J. M. y García-Serrano, C. (2013). The effective measure of unemployment benefit duration: data on spells or individuals. Applied Economics Letters, 20(14).',
                        'Cameron, A. C. y Trivedi, P. K. (2005). Microeconometrics: Methods and applications. Cambridge University Press.',
                        'Greene, W. H. (2018). Econometric analysis, 8.ª ed. Pearson. Wooldridge, J. M. (2010). Econometric analysis of cross section and panel data, 2.ª ed. MIT Press.',
                        'Cleves, Gould y Marchenko (2016). An introduction to survival analysis using Stata. Stata Press.',
                        'McFadden, D. (1974). The measurement of urban travel demand. Journal of Public Economics.'
                    ] }
                ]
            }
        ]
    },

    // ------------------------------------------------------------------
    evaluacion_impacto: {
        sections: [
            {
                id: 'idea', title: 'Idea clave',
                blocks: [
                    { type: 'p', text: 'La evaluación de impacto responde a una pregunta causal: ¿qué cambia en una variable de interés $Y$ <b>como consecuencia</b> de una política o programa? La dificultad es que a cada individuo solo se le observa con programa o sin él, nunca en ambas situaciones: hay un problema de datos ausentes. Los métodos del curso son distintas maneras de construir el <b>contrafactual</b> que falta.' },
                    { type: 'list', title: 'Conceptos básicos (Tema 1)', items: [
                        '<b>Resultados potenciales</b>: $Y_1$ si el individuo recibe el tratamiento e $Y_0$ si no. El efecto individual $Y_1-Y_0$ no es observable.',
                        '<b>Parámetros</b>: las medias potenciales (POM), el efecto medio del tratamiento (<b>ATE</b>) y el efecto medio sobre los tratados (<b>ATET</b>).',
                        '<b>Sesgo de selección</b>: si quienes participan son distintos de quienes no, la diferencia de medias simple no es el efecto.',
                        'Tipos de evaluación de políticas públicas y estimación del contrafactual.'
                    ] },
                    { type: 'list', title: 'Los métodos', items: [
                        '<b>Selección aleatoria</b> (Tema 2): si el tratamiento se asigna al azar, el grupo de control es un contrafactual válido y el efecto es una diferencia de medias. Se estudian el diseño estadístico, sus limitaciones y variantes.',
                        '<b>Regresión en discontinuidad (RD)</b>: cuando un índice continuo y un umbral deciden quién participa (programas de pobreza, pensiones o becas), se comparan los individuos justo por encima y por debajo del corte. El efecto es local.',
                        '<b>Diferencias en diferencias (DiD)</b>: exige datos de línea base. Compara el cambio antes-después de los tratados con el de un grupo de control, bajo el supuesto de <b>igualdad de tendencias</b>. Se puede estimar con un panel de efectos fijos.',
                        '<b>Emparejamiento (propensity score matching, PSM)</b>: construye un grupo de comparación con individuos de características observables parecidas. Supone que no hay diferencias no observadas relevantes, y sufre la maldición de las dimensiones, que el índice de propensión resuelve.',
                        '<b>Variables instrumentales (VI)</b>: si la participación es endógena (p. ej., en microcréditos), se usa una variable que influye en participar pero no en el resultado: la participación se estima en una primera etapa.'
                    ] },
                    { type: 'callout', text: 'Ejemplo de la práctica: un curso de formación no asignado al azar (más probable con más educación y experiencia) con un efecto real simulado de $300$ € sobre el salario. La diferencia de medias simple sobrestima el efecto porque los que hacen el curso ya cobraban más; controlar por educación y experiencia, o emparejar, acerca la estimación a $300$.' }
                ]
            },
            {
                id: 'formulas', title: 'Fórmulas',
                blocks: [
                    { type: 'formula', label: 'Efectos del tratamiento', tex: '\\mathrm{ATE}=E[Y_1-Y_0],\\qquad \\mathrm{ATET}=E[Y_1-Y_0\\mid T=1]' },
                    { type: 'formula', label: 'Descomposición de la diferencia observada', tex: 'E[Y\\mid T=1]-E[Y\\mid T=0]=\\underbrace{E[Y_1-Y_0\\mid T=1]}_{\\text{ATET}}+\\underbrace{E[Y_0\\mid T=1]-E[Y_0\\mid T=0]}_{\\text{sesgo de selección}}' },
                    { type: 'formula', label: 'Aleatorización', tex: '\\widehat{\\mathrm{ATE}}=\\bar Y_{T=1}-\\bar Y_{T=0}\\ \\ \\Longleftrightarrow\\ \\ Y_i=\\alpha+\\beta T_i+\\varepsilon_i' },
                    { type: 'formula', label: 'Diferencias en diferencias', tex: '\\widehat{\\mathrm{DiD}}=\\big(\\bar Y^{T}_{1}-\\bar Y^{T}_{0}\\big)-\\big(\\bar Y^{C}_{1}-\\bar Y^{C}_{0}\\big),\\qquad Y_{it}=\\alpha+\\beta_1\\,\\text{post}_t+\\beta_2\\,\\text{trat}_i+\\delta\\,(\\text{post}_t\\cdot\\text{trat}_i)+\\varepsilon_{it}' },
                    { type: 'formula', label: 'Índice de propensión y efecto con emparejamiento', tex: 'p(X)=P(T=1\\mid X),\\qquad \\widehat{\\mathrm{ATET}}=\\frac1{N_1}\\sum_{i:T_i=1}\\big(Y_i-\\hat Y_{0,i}(p(X_i))\\big)' },
                    { type: 'formula', label: 'Regresión en discontinuidad (nítida)', tex: '\\tau_{RD}=\\lim_{x\\downarrow c}E[Y\\mid X=x]-\\lim_{x\\uparrow c}E[Y\\mid X=x]' },
                    { type: 'formula', label: 'Variables instrumentales en dos etapas', tex: 'T_i=\\pi_0+\\pi_1Z_i+u_i\\ \\ \\Rightarrow\\ \\ Y_i=\\alpha+\\beta\\,\\hat T_i+\\varepsilon_i' }
                ]
            },
            {
                id: 'calculadora', title: 'Calculadora',
                blocks: [
                    { type: 'p', text: 'Un programa con tratados y control medidos antes y después. Compara los tres estimadores: el antes–después, la diferencia de medias posterior y el DiD, y mira cuál se acerca al efecto cuando ambos grupos tienen distinto punto de partida.' },
                    { type: 'calculator', id: 'did' }
                ]
            },
            {
                id: 'codigo', title: 'Código',
                blocks: [
                    { type: 'code', code: {
                        Stata: `
* Practica 1: seleccion NO aleatoria al curso
summ salario if curso==1
summ salario if curso==0
reg salario curso                              // diferencia de medias (sesgada)
reg salario curso educacion experiencia        // con controles
teffects ra (salario educacion experiencia) (curso)      // ATE por regresion
teffects psmatch (salario) (curso educacion experiencia) // emparejamiento por propensity score

* Practicas 2 y 6: diferencia de medias y DiD (programa de microcreditos)
ttest lexptot, by(dfmfd)
reg lexptot dfmfd sexhead agehead educhead lnland [pw=weight]
gen dfmfdyr = dfmfd98*year
reg lexptot year dfmfd98 dfmfdyr               // el coeficiente de dfmfdyr es el DiD
xtset nh year
xtreg lexptot year dfmfd98 dfmfdyr, fe         // panel de efectos fijos
diff lexptot, treated(dfmfd98) period(year)`,
                        r: `
# Simulacion de la practica: seleccion no aleatoria al curso
set.seed(12345); n <- 200
educ <- sample(0:2, n, TRUE, c(.3, .4, .3)); exper <- pmax(round(runif(n, 25, 55)) - 22 + rnorm(n, 0, 3), 0)
curso <- as.integer(-1 + 0.8 * educ + 0.05 * exper + rnorm(n, 0, .5) > 0)
salario <- 800 + 200 * educ + 30 * exper + 300 * curso + rnorm(n, 0, 200)
coef(lm(salario ~ curso))["curso"]                      # sesgado
coef(lm(salario ~ curso + educ + exper))["curso"]       # cerca de 300

# Propensity score y diferencias en diferencias
ps <- fitted(glm(curso ~ educ + exper, family = binomial))
summary(ps[curso == 1]); summary(ps[curso == 0])        # soporte comun
# DiD con datos en formato largo: lm(y ~ post * trat)`,
                        python: `
import numpy as np
import statsmodels.formula.api as smf

rng = np.random.default_rng(12345); n = 200
educ = rng.choice([0, 1, 2], n, p=[.3, .4, .3])
exper = np.maximum(np.round(rng.uniform(25, 55, n)) - 22 + rng.normal(0, 3, n), 0)
curso = (-1 + 0.8 * educ + 0.05 * exper + rng.normal(0, .5, n) > 0).astype(int)
salario = 800 + 200 * educ + 30 * exper + 300 * curso + rng.normal(0, 200, n)
d = dict(salario=salario, curso=curso, educ=educ, exper=exper)
print(smf.ols("salario ~ curso", d).fit().params["curso"])                    # sesgado
print(smf.ols("salario ~ curso + educ + exper", d).fit().params["curso"])    # cerca de 300

# DiD en formato largo: salario ~ post * trat; el coeficiente de la interaccion es el efecto
# smf.ols("y ~ post * trat", df).fit().params["post:trat"]` } }
                ]
            },
            {
                id: 'fuentes', title: 'Fuentes',
                blocks: [
                    { type: 'sources', items: [
                        'Arranz Muñoz, J. M. (2025-26). Técnicas de evaluación de impacto: Tema 1 (conceptos básicos), Tema 2 (selección aleatoria), regresión en discontinuidad, diferencias en diferencias, métodos de emparejamiento, variables instrumentales y prácticas 1 a 8 con Stata. Universidad de Alcalá.',
                        'Material del Banco Mundial sobre evaluación de impacto citado en las prácticas (método de emparejamiento).'
                    ] }
                ]
            }
        ]
    }
});
