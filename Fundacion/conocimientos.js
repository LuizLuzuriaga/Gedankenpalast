/**
 * Gendanken Palast - Base de conocimientos desplegable
 * Cada entrada se asocia a un concepto de main.js mediante su campo `knowledge`.
 * Texto con matemáticas en línea entre $...$ (KaTeX). Bloques disponibles:
 *   p, list, callout, formula, steps, table, calculator, sources, guide
 * Una entrada con `guide` abre esa guía de estudio a pantalla completa al entrar en el tema.
 */

// --- FUNCIONES FINANCIERO-ACTUARIALES (Tema 1 y Tema 2, Previsión social complementaria) ---
const PENSION_MATH = {
    // Valor actual de una renta prepagable de n términos que crecen al ritmo g: VA(1, g, R, n)
    va(R, n, g = 0) {
        let s = 0;
        for (let i = 0; i < n; i++) s += Math.pow((1 + g) / (1 + R), i);
        return s;
    },
    // Valor final en N de N aportaciones prepagables crecientes al ritmo g: VF(1, g, R, N)
    vf(R, N, g = 0) {
        let s = 0;
        for (let i = 0; i < N; i++) s += Math.pow(1 + g, i) * Math.pow(1 + R, N - i);
        return s;
    }
};

const CALCULATORS = {
    ciclo_vida: {
        title: 'Ciclo de vida: ahorro, consumo y tasa de intercambio',
        inputs: [
            { id: 'R', label: 'Rentabilidad nominal $R$ (%)', value: 6.168, step: 0.1 },
            { id: 'g', label: 'Crecimiento salarial $g$ (%)', value: 2, step: 0.1 },
            { id: 'pi', label: 'Inflación $\\pi$ (%)', value: 2, step: 0.1 },
            { id: 'x', label: 'Edad de entrada $x$', value: 25, step: 1 },
            { id: 'N', label: 'Años de actividad $N$', value: 40, step: 1 },
            { id: 'D', label: 'Años de jubilación $D$', value: 30, step: 1 }
        ],
        compute(v) {
            const R = v.R / 100, g = v.g / 100, pi = v.pi / 100;
            const N = Math.min(80, Math.max(1, Math.round(v.N))), D = Math.min(80, Math.max(1, Math.round(v.D)));
            const f = PENSION_MATH.va(R, N, g) / PENSION_MATH.va(R, N + D, g);
            const S0 = 1 - f;
            const alpha = PENSION_MATH.vf(R, N, g) / PENSION_MATH.va(R, D, g);
            const alphaReal = alpha / Math.pow(1 + pi, N);
            const realRate = (R - pi) / (1 + pi);

            // Riqueza acumulada por unidad de salario inicial (nominal y real)
            const nominal = [];
            let F = 0;
            for (let i = 0; i < N; i++) {
                F = F * (i === 0 ? 1 : 1 + R) + S0 * Math.pow(1 + g, i);
                nominal.push(F);
            }
            F = F * (1 + R);
            nominal.push(F);
            for (let j = 0; j < D; j++) {
                F = (F - f * Math.pow(1 + g, N + j)) * (1 + R);
                nominal.push(Math.max(F, 0));
            }
            const real = nominal.map((w, t) => w / Math.pow(1 + pi, t));

            const fmt = (n, d = 3) => Number.isFinite(n) ? n.toLocaleString('es-ES', { minimumFractionDigits: d, maximumFractionDigits: d }) : '—';
            const pct = (n) => fmt(n * 100, 2) + ' %';
            const outputs = [
                { label: 'Consumo óptimo $C_0/W_0 = f$', value: fmt(f) },
                { label: 'Ahorro óptimo $S_0/W_0 = 1-f$', value: fmt(S0) },
                { label: 'Tasa de intercambio $\\alpha$', value: fmt(alpha) },
                { label: 'Ahorro por u.m. de prestación $1/\\alpha$', value: fmt(1 / alpha, 4) },
                { label: 'Tasa de sustitución $C_N/W_{N-1}$', value: pct(f * (1 + g)) },
                { label: 'Rentabilidad real $R^\\pi$', value: pct(realRate) },
                { label: 'Tasa de intercambio real $\\alpha^\\pi$', value: fmt(alphaReal), note: Math.abs(g - pi) > 1e-9 ? 'Exacta solo si $g=\\pi$' : '' },
                { label: 'Tasa de sustitución real $C_0/W_0$', value: pct(f), note: Math.abs(g - pi) > 1e-9 ? 'Exacta solo si $g=\\pi$' : '' }
            ];
            return {
                outputs,
                chart: {
                    caption: 'Riqueza acumulada por unidad de salario inicial',
                    startAge: Math.round(v.x),
                    retireIndex: N,
                    series: [
                        { name: 'Nominal', values: nominal, color: 'var(--hue-act)' },
                        { name: 'Real (u.m. del momento 0)', values: real, color: 'var(--hue-ds)' }
                    ]
                }
            };
        }
    },

    reparto: {
        title: 'Reparto simple anual: tasa de cotización',
        inputs: [
            { id: 'activos', label: 'Cotizantes activos $l^{activos}_t$', value: 567, step: 1 },
            { id: 'pasivos', label: 'Pensionistas $l^{pasivos}_t$', value: 100, step: 1 },
            { id: 'beta', label: 'Tasa de sustitución $\\beta_t$ (%)', value: 85, step: 1 }
        ],
        compute(v) {
            const d = v.pasivos / Math.max(v.activos, 1e-9);
            const beta = v.beta / 100;
            const payg = d * beta;
            const fmt = (n, dg = 3) => Number.isFinite(n) ? n.toLocaleString('es-ES', { minimumFractionDigits: dg, maximumFractionDigits: dg }) : '—';
            return {
                outputs: [
                    { label: 'Ratio de dependencia $d(t)$', value: fmt(d) },
                    { label: 'Activos por pensionista $1/d(t)$', value: fmt(1 / d, 2) },
                    { label: 'Cotización necesaria $PAYG_t = d(t)\\cdot\\beta_t$', value: fmt(payg * 100, 2) + ' %' }
                ]
            };
        }
    }
};

const KNOWLEDGE = {
    prevision_pensiones: {
        guide: 'guias/prevision_social.html',
        sections: [
            {
                id: 'idea',
                title: 'Idea clave',
                blocks: [
                    { type: 'guide', text: 'Guía de estudio completa: líneas temporales de cada apartado, preguntas posibles resueltas, calculadora y tarjetas de repaso.' },
                    { type: 'p', text: 'La previsión social busca que una persona mantenga, cuando deja de cobrar su salario, un nivel de vida parecido al de su etapa activa. El fundamento económico es la hipótesis del ciclo vital de Modigliani: se ahorra durante la vida laboral para consumir de forma estable durante toda la vida.' },
                    { type: 'list', title: 'Contingencias que cubre', items: [
                        'Jubilación, invalidez y fallecimiento: impiden o terminan la obtención de rentas del trabajo, por lo que el sistema debe dar rentas sustitutivas al trabajador o a sus beneficiarios.'
                    ] },
                    { type: 'list', title: 'Tres pilares', items: [
                        '1º Seguridad Social pública, de afiliación obligatoria.',
                        '2º Previsión social complementaria en el ámbito laboral (planes de empresa).',
                        '3º Previsión individual y voluntaria. El desarrollo del 2º y 3º depende de la suficiencia del 1º.'
                    ] },
                    { type: 'list', title: 'Cómo se financia', items: [
                        '<b>Reparto</b> (pay as you go): las cotizaciones de los activos de hoy pagan las pensiones de hoy. No hay fondo individual, pero hay riesgo demográfico: con 85 de pensión y 15 de cotización hacen falta $85/15 \\simeq 5{,}67$ activos por jubilado.',
                        '<b>Capitalización</b>: cada aportación se invierte y forma un fondo que paga las prestaciones futuras. Expone al riesgo financiero (y, de forma indirecta, al demográfico a través de los mercados).'
                    ] },
                    { type: 'list', title: 'Cómo se diseña', items: [
                        '<b>Prestación definida</b>: se fija la prestación $C$ y se calcula la aportación $S$. El promotor asume el riesgo financiero y el de longevidad.',
                        '<b>Aportación definida</b>: se fija $S$ y la prestación $C$ resulta del fondo acumulado. Los riesgos los asume el partícipe.'
                    ] },
                    { type: 'callout', text: 'La pregunta central del tema: ¿cuántas unidades de pensión compra cada unidad ahorrada? La respuesta es la tasa de intercambio financiero $\\alpha = C/S$.' }
                ]
            },
            {
                id: 'formulas',
                title: 'Fórmulas',
                blocks: [
                    { type: 'table', caption: 'Notación', head: ['Símbolo', 'Significado'], rows: [
                        ['$x$, $x_r = x+N$', 'Edad actual y edad de jubilación'],
                        ['$N$, $D$', 'Años de actividad y años de jubilación'],
                        ['$W$, $C$, $S$', 'Salario, consumo (prestación) y ahorro anual; $W = C + S$'],
                        ['$R$, $g$, $\\pi$', 'Rentabilidad, crecimiento salarial e inflación anuales'],
                        ['$l_x$, ${}_tp_x$', 'Supervivientes a la edad $x$ y probabilidad de sobrevivir $t$ años']
                    ] },
                    { type: 'formula', label: 'Valor actual de una renta prepagable', tex: '\\mathrm{VA}(1,R,n)=\\sum_{i=0}^{n-1}(1+R)^{-i}' },
                    { type: 'formula', label: 'Valor final de las aportaciones', tex: '\\mathrm{VF}(1,R,N)=\\sum_{i=0}^{N-1}(1+R)^{N-i}=\\frac{(1+R)^{N+1}-(1+R)}{R}', note: 'Para $R=0$, por continuidad, $\\mathrm{VF}(S,0,N)=S\\,N$.' },
                    { type: 'formula', label: 'Capital humano', tex: 'H_x = W\\cdot \\mathrm{VA}(1,R,N)' },
                    { type: 'formula', label: 'Consumo y ahorro óptimos', tex: 'C = W\\cdot\\underbrace{\\frac{\\mathrm{VA}(1,R,N)}{\\mathrm{VA}(1,R,N+D)}}_{f(R,N,D)},\\qquad S = W\\,(1-f)' },
                    { type: 'formula', label: 'Equilibrio en la fecha de jubilación', tex: 'S\\cdot\\mathrm{VF}(1,R,N) = C\\cdot\\mathrm{VA}(1,R,D)' },
                    { type: 'formula', label: 'Tasa de intercambio financiero', tex: '\\alpha=\\frac{C}{S}=\\frac{\\mathrm{VF}(1,R,N)}{\\mathrm{VA}(1,R,D)},\\qquad \\frac{1}{\\alpha}=\\frac{S}{C}' },
                    { type: 'formula', label: 'Tasa de sustitución', tex: '\\mathrm{TS}=\\frac{C}{W}=\\frac{\\alpha}{1+\\alpha}' },
                    { type: 'formula', label: 'Dinámica del fondo en la etapa pasiva', tex: 'F_{N+t}=(F_{N+t-1}-C)(1+R),\\qquad F_{N+D}=0 \\text{ (plan óptimo)}' },
                    { type: 'formula', label: 'Valor descontado del ciclo de vida', tex: '\\mathrm{VD}=\\sum_{i=N}^{N+D-1}\\frac{C}{(1+R)^i}-\\sum_{i=0}^{N-1}\\frac{S}{(1+R)^i}=0 \\text{ (plan equilibrado)}' },
                    { type: 'formula', label: 'Relación de Fisher', tex: '(1+R)=(1+R^{\\pi})(1+\\pi)\\;\\Rightarrow\\; R^{\\pi}=\\frac{R-\\pi}{1+\\pi}\\approx R-\\pi' },
                    { type: 'formula', label: 'Con crecimiento salarial $g$', tex: '\\mathrm{VA}(1,g,R,n)=\\sum_{i=0}^{n-1}\\Big(\\frac{1+g}{1+R}\\Big)^{i},\\qquad \\alpha=\\frac{C_N}{S_0}=\\frac{\\mathrm{VF}(1,g,R,N)}{\\mathrm{VA}(1,g,R,D)}' },
                    { type: 'formula', label: 'Magnitudes reales si $g=\\pi$', tex: '\\alpha^{\\pi}=\\frac{\\alpha}{(1+\\pi)^N},\\qquad \\mathrm{TS}^{\\pi}=\\frac{C_0}{W_0}=\\frac{\\alpha^{\\pi}}{1+\\alpha^{\\pi}},\\qquad \\mathrm{TS}=\\mathrm{TS}^{\\pi}(1+\\pi)' },
                    { type: 'formula', label: 'Reparto simple anual', tex: 'PAYG_t=\\frac{B(t)}{W(t)}=\\underbrace{\\frac{l^{pasivos}_t}{l^{activos}_t}}_{d(t)}\\cdot\\underbrace{\\frac{B(t)/l^{pasivos}_t}{W(t)/l^{activos}_t}}_{\\beta_t}' },
                    { type: 'formula', label: 'Pensionistas tras $s$ años de funcionamiento', tex: '\\sum_{h=0}^{s-1} l^{s}_{x+r+h}=\\sum_{h=1}^{s} l^{s-h}_{x+r-1}\\cdot {}_hp_{x+r-1}' },
                    { type: 'formula', label: 'Cuota media escalonada (quinquenio)', tex: 'Ctz_1=\\frac{\\sum_{j=0}^{4}B(j+1)(1+i)^{-(j+\\frac12)}}{\\sum_{j=0}^{4}Sal(j+1)(1+i)^{-(j+\\frac12)}}' },
                    { type: 'formula', label: 'Prima única de una renta vitalicia', tex: 'F_{x_r}=C\\sum_{t=1}^{\\omega-x_r}{}_tp_{x_r}\\,(1+i)^{-t}' },
                    { type: 'formula', label: 'Provisión matemática y efecto mutualidad', tex: 'V_{x_r+t}=V_{x_r+t-1}(1+i)(1+\\theta_{x_r+t})-C,\\qquad \\theta_{x_r+t}=\\frac{l_{x_r+t-1}-l_{x_r+t}}{l_{x_r+t}}' }
                ]
            },
            {
                id: 'desarrollo',
                title: 'Desarrollo',
                blocks: [
                    { type: 'steps', items: [
                        { title: 'Igualar recursos y consumo de toda la vida', text: 'El valor actual del salario (capital humano) debe financiar el consumo de las etapas activa y pasiva:', tex: 'W\\cdot\\mathrm{VA}(1,R,N)=C\\cdot\\mathrm{VA}(1,R,N+D)\\;\\Rightarrow\\; C=W\\,f(R,N,D)' },
                        { title: 'Acumular el ahorro hasta la jubilación', text: 'Cada aportación $S$ se capitaliza hasta $N$:', tex: 'F_N=\\sum_{i=0}^{N-1}S(1+R)^{N-i}=S\\cdot\\mathrm{VF}(1,R,N)' },
                        { title: 'Consumir el fondo durante la jubilación', text: 'Al inicio de cada año se retira $C$ y el resto rinde $R$. Desarrollando la recurrencia:', tex: 'F_{N+D}=F_N(1+R)^D-C\\sum_{j=0}^{D-1}(1+R)^{D-j}' },
                        { title: 'Condición de plan óptimo', text: 'El fondo se agota justo al final ($F_{N+D}=0$), luego el fondo en la jubilación coincide con el valor actual de las prestaciones:', tex: 'F_N=C\\cdot\\mathrm{VA}(1,R,D)' },
                        { title: 'Tasa de intercambio', text: 'Igualando los pasos 2 y 4:', tex: 'S\\cdot\\mathrm{VF}(1,R,N)=C\\cdot\\mathrm{VA}(1,R,D)\\;\\Rightarrow\\;\\alpha=\\frac{C}{S}=\\frac{\\mathrm{VF}(1,R,N)}{\\mathrm{VA}(1,R,D)}' },
                        { title: 'Tasa de sustitución', text: 'Como $W=C+S$ y $C=\\alpha S$:', tex: 'C=\\alpha(W-C)\\;\\Rightarrow\\;C(1+\\alpha)=\\alpha W\\;\\Rightarrow\\;\\mathrm{TS}=\\frac{\\alpha}{1+\\alpha}' },
                        { title: 'Introducir la inflación', text: 'Salario, ahorro y consumo crecen a $g$. Si $g=\\pi$, en términos reales todo es constante y basta deflactar: $W^\\pi_i=W_i/(1+\\pi)^i=W_0$. Analizar en nominal y en real evita la ilusión monetaria.' },
                        { title: 'Pasar al colectivo: reparto', text: 'En reparto simple anual, cada año las cotizaciones igualan a las pensiones, $PAYG_t\\cdot W(t)=B(t)$. La tasa crece a medida que las cohortes llegan a la jubilación y se estabiliza cuando la estructura de edades del colectivo abierto se vuelve constante. Por eso es muy sensible a la demografía y a los salarios.' },
                        { title: 'Atenuar el reparto', text: 'En la cuota media escalonada la cotización se fija para varios años (3 a 5) igualando valores actuales al tipo $i$. Aparece una reserva de nivelación $V_{t+\\frac12}=V_{t-\\frac12}(1+i)+Ctz\\cdot Sal(t+1)-B(t+1)$ que se anula al final del periodo. En capitales de cobertura, los activos financian el valor actuarial de las pensiones que nacen ese año.' },
                        { title: 'Incertidumbre', text: 'Acumulación: riesgo financiero y de mortalidad (diversificable por el número de partícipes). Desacumulación: riesgo financiero y de longevidad (sistemático). En prestación definida los gestiona el promotor (LDI/ALM, reaseguro, derivados de longevidad); en aportación definida, el partícipe. Mecanismos de subsidio cruzado: mutualidad (ex post), solidaridad (ex ante, requiere obligatoriedad) y tontinas.' }
                    ] }
                ]
            },
            {
                id: 'calculadora',
                title: 'Calculadora',
                blocks: [
                    { type: 'p', text: 'Cambia los parámetros y observa cómo responden $\\alpha$, la tasa de sustitución y la riqueza. Los valores iniciales reproducen el ejemplo de los apuntes ($R=6{,}168\\%$, $g=\\pi=2\\%$, $N=40$, $D=30$).' },
                    { type: 'calculator', id: 'ciclo_vida' },
                    { type: 'calculator', id: 'reparto' }
                ]
            },
            {
                id: 'ejemplos',
                title: 'Ejemplos',
                blocks: [
                    { type: 'p', text: '<b>Tasa de intercambio sin inflación.</b> Con $R=4{,}09\\%$, $N=40$ y $D=30$, cada unidad ahorrada compra $\\alpha=5{,}67$ unidades de pensión anual: ahorrando 15 um al año se obtienen $15\\times5{,}67\\approx85$ um. A la inversa, cada um de pensión exige $1/5{,}67=0{,}1764$ um de ahorro, y $\\mathrm{TS}=5{,}67/6{,}67\\approx85\\%$.' },
                    { type: 'table', caption: 'Tasa de intercambio $\\alpha$ con $N=40$ años de actividad', head: ['$R$', 'D=15', 'D=20', 'D=25', 'D=30', 'D=35', 'D=40'], rows: [
                        ['0,00 %', '2,67', '2,00', '1,60', '1,33', '1,14', '1,00'],
                        ['1,00 %', '3,53', '2,71', '2,22', '1,89', '1,66', '1,49'],
                        ['2,00 %', '4,70', '3,69', '3,09', '2,70', '2,42', '2,21'],
                        ['3,00 %', '6,32', '5,07', '4,33', '3,85', '3,51', '3,26'],
                        ['4,09 %', '8,77', '7,19', '6,26', '5,67', '5,26', '4,96'],
                        ['5,00 %', '11,64', '9,69', '8,57', '7,86', '7,38', '7,04'],
                        ['6,00 %', '15,93', '13,49', '12,11', '11,24', '10,67', '10,29']
                    ] },
                    { type: 'p', text: '<b>Con inflación.</b> $R=6{,}168\\%$, $g=\\pi=2\\%$: $C_0=0{,}85$, $S_0=0{,}15$, $\\alpha=12{,}51$ en nominal pero $\\alpha^\\pi=12{,}51/1{,}02^{40}=5{,}667$ en real, que equivale a una rentabilidad real $R^\\pi=4{,}086\\%$. La tasa de sustitución nominal es $0{,}85\\cdot1{,}02=86{,}7\\%$ y la real, $85\\%$.' },
                    { type: 'p', text: '<b>Con $R=3\\%$ y $g=\\pi=2\\%$:</b> $\\alpha=4{,}154$ en nominal y $\\alpha^\\pi=1{,}881$ en real.' },
                    { type: 'table', caption: 'Mismo rendimiento medio (6 %), distinto orden: 1 um al año durante 10 años', head: ['Orden de las rentabilidades', 'Fondo final'], rows: [
                        ['De menor a mayor (−9 % … 20 %)', '17,05 um'],
                        ['De mayor a menor (20 % … −9 %)', '11,58 um']
                    ] },
                    { type: 'table', caption: 'Renta unitaria de 30 años según la estructura temporal de tipos (ETTI)', head: ['ETTI', 'Valor actual', 'Prestación por 100 um de fondo'], rows: [
                        ['A: pendiente negativa (4 % → 2 %)', '20,14', '4,96'],
                        ['B: plana (3 %)', '19,60', '5,10'],
                        ['C: pendiente positiva (2 % → 4 %)', '19,21', '5,20']
                    ] },
                    { type: 'table', caption: 'Efecto mutualidad $\\theta_x$ (PER2020, 1er orden, 2023)', head: ['Edad', 'Hombres', 'Mujeres'], rows: [
                        ['65', '0,64 %', '0,31 %'],
                        ['75', '1,45 %', '0,76 %'],
                        ['80', '3,02 %', '1,64 %'],
                        ['90', '10,53 %', '7,43 %'],
                        ['100', '27,00 %', '22,01 %']
                    ] },
                    { type: 'p', text: 'Entre 65 y 75 años el efecto mutualidad es pequeño y puede compensarse con rentabilidad; a edades avanzadas crece rápido, y la renta vitalicia se convierte en la herramienta más eficaz frente al riesgo de longevidad.' },
                    { type: 'p', text: '<b>Rentabilidad de un plan de pensiones.</b> 6.000 € cada 20 de julio de 2017 a 2025 compran 593,877 participaciones; al jubilarse el 15/12/2025 con la participación a 150 € el fondo vale 89.081,55 €. La rentabilidad media anual $R_m$ resuelve $89.081{,}55=6.000\\sum_{k=0}^{8}(1+R_m)^{k+148/365}$, de donde $R_m\\approx11{,}10\\%$. El rendimiento absoluto es $89.081{,}55-54.000=35.081{,}55$ €.' },
                    { type: 'callout', text: 'La solución de clase da $R_m=11{,}01\\%$, pero con ese tipo el fondo saldría 88.697,84 €; el valor que cuadra es $11{,}10\\%$ (probable errata).' },
                    { type: 'list', title: 'Para practicar (Tema 2, colectivo de 25 a 64 años, jubilación a los 65)', items: [
                        'Caso 1: tasa de cotización en reparto simple anual con pensión del 80 % del último salario o del salario medio.',
                        'Caso 2: igual, con inflación del 2 % y pensiones que crecen un punto menos, igual o un punto más que la inflación.',
                        'Caso 3: cuota media escalonada por quinquenios al 2 %.',
                        'Caso 4: reparto de capitales de cobertura al 2 %.',
                        'Caso 5: capitalización colectiva al 2 %.'
                    ] }
                ]
            },
            {
                id: 'fuentes',
                title: 'Fuentes',
                blocks: [
                    { type: 'sources', items: [
                        'Tema 1. Previsión social en el modelo del ciclo de vida de ahorro y consumo. Mario Torralba, profesora Pilar Requena. Máster U. en Ciencias Actuariales y Financieras, Universidad de Alcalá.',
                        'Tema 1, epígrafes 1.4 y 1.5 (inflación e incertidumbre). Pilar Requena.',
                        'Tema 2. Análisis actuarial de los sistemas de financiación de la previsión social. Pilar Requena.',
                        'Tema 2. Casos prácticos 1 a 5. Curso 2026/27.',
                        'Ejercicios sesión 3: cálculo de rentabilidades.',
                        'Dickson, Hardy y Waters (2020). Actuarial Mathematics for Life Contingent Risks, 3ª ed. Cambridge University Press.',
                        'Milevsky (2006). The Calculus of Retirement Income. Cambridge University Press.',
                        'Navarro Arribas (2019). Matemáticas de las operaciones financieras. Pirámide.',
                        'Pitacco, Denuit, Haberman y Olivieri (2009). Modelling Longevity Dynamics for Pensions and Annuity Business. Oxford University Press.'
                    ] }
                ]
            }
        ]
    }
};
