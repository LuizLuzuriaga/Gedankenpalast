/**
 * Gendanken Palast - Temarios del Máster (MUCAF), segundo bloque
 * Resúmenes, fórmulas y código de las asignaturas del máster, elaborados a partir de los apuntes
 * de cada profesor (ver "Fuentes" de cada tema). Se carga después de conocimientos.js y añade
 * sus entradas a KNOWLEDGE y CALCULATORS.
 */

// ==========================================================================
// Utilidades numéricas de las calculadoras
// ==========================================================================
const NUM = {
    // Función de distribución normal (Abramowitz y Stegun 26.2.17, error < 1e-7)
    cdf(x) {
        const t = 1 / (1 + 0.2316419 * Math.abs(x));
        const d = 0.3989422804014327 * Math.exp(-x * x / 2);
        const p = d * t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
        return x >= 0 ? 1 - p : p;
    },
    pdf(x) { return 0.3989422804014327 * Math.exp(-x * x / 2); },
    // Cuantil normal (Acklam)
    inv(p) {
        const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239];
        const b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572];
        const c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
        const d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416];
        if (p <= 0) return -Infinity;
        if (p >= 1) return Infinity;
        const lo = 0.02425;
        if (p < lo) {
            const q = Math.sqrt(-2 * Math.log(p));
            return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
        }
        if (p > 1 - lo) return -NUM.inv(1 - p);
        const q = p - 0.5, r = q * q;
        return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
    },
    fmt(n, d = 3) {
        return Number.isFinite(n) ? n.toLocaleString('es-ES', { minimumFractionDigits: d, maximumFractionDigits: d }) : '—';
    }
};

// ==========================================================================
// Calculadoras
// ==========================================================================
Object.assign(CALCULATORS, {
    // --- Matemática actuarial de vida: ley de Makeham -------------------
    makeham: {
        title: 'Seguro de vida entera con mortalidad de Makeham',
        inputs: [
            { id: 'A', label: 'Mortalidad accidental $A$', value: 0.0007, step: 0.0001 },
            { id: 'B', label: 'Parámetro $B$', value: 0.00005, step: 0.00001 },
            { id: 'c', label: 'Parámetro $c$', value: 1.1, step: 0.01 },
            { id: 'x', label: 'Edad $x$', value: 40, step: 1 },
            { id: 'i', label: 'Tipo técnico $i$ (%)', value: 2, step: 0.25 }
        ],
        compute(v) {
            const A = v.A, B = v.B, c = Math.max(v.c, 1.0001), i = v.i / 100;
            const x = Math.max(0, Math.min(110, Math.round(v.x)));
            // S0(t) = exp(-A t - B (c^t - 1) / ln c)
            const S = (t) => Math.exp(-A * t - B * (Math.pow(c, t) - 1) / Math.log(c));
            const kp = (k) => S(x + k) / S(x);
            const vv = 1 / (1 + i), d = i / (1 + i);
            const W = 120 - x;
            let Ax = 0, ax = 0, ex = 0, A2 = 0;
            for (let k = 0; k <= W; k++) {
                const q = 1 - kp(k + 1) / kp(k);
                const prob = kp(k) * q;                 // k|q_x
                Ax += Math.pow(vv, k + 1) * prob;
                A2 += Math.pow(vv, 2 * (k + 1)) * prob; // segundo momento (a tipo 2δ)
                ax += Math.pow(vv, k) * kp(k);          // ä_x prepagable
                if (k > 0) ex += kp(k);
            }
            const P = Ax / ax;
            const varZ = A2 - Ax * Ax;
            return {
                outputs: [
                    { label: 'Prob. de morir en el año $q_x$', value: NUM.fmt(1 - kp(1), 5) },
                    { label: 'Esperanza de vida curtate $e_x$', value: NUM.fmt(ex, 2) + ' años' },
                    { label: 'Seguro vida entera $A_x$ (por 1 de capital)', value: NUM.fmt(Ax, 5) },
                    { label: 'Renta vitalicia prepagable $\\ddot a_x$', value: NUM.fmt(ax, 4) },
                    { label: 'Prima nivelada anual $P_x = A_x/\\ddot a_x$', value: NUM.fmt(P, 5), note: 'Comprobación $A_x = 1 - d\\,\\ddot a_x$: ' + NUM.fmt(1 - d * ax, 5) },
                    { label: 'Desviación típica del valor actual $Z$', value: NUM.fmt(Math.sqrt(Math.max(varZ, 0)), 4) }
                ]
            };
        }
    },

    // --- Matemática no vida II: modelo individual de riesgo --------------
    modelo_individual: {
        title: 'Modelo individual: cartera de $n$ pólizas idénticas',
        inputs: [
            { id: 'n', label: 'Número de pólizas $n$', value: 1000, step: 50 },
            { id: 'q', label: 'Probabilidad de siniestro $q$ (%)', value: 2, step: 0.1 },
            { id: 'b', label: 'Suma asegurada $b$ (€)', value: 10000, step: 500 },
            { id: 'alpha', label: 'Nivel de confianza (%)', value: 99.5, step: 0.1 },
            { id: 'theta', label: 'Recargo de seguridad $\\theta$ (%)', value: 10, step: 1 }
        ],
        compute(v) {
            const n = Math.max(1, v.n), q = Math.min(0.9999, Math.max(1e-6, v.q / 100)), b = v.b;
            const alpha = Math.min(0.9999, Math.max(0.5, v.alpha / 100)), theta = v.theta / 100;
            const mean = n * q * b;
            const sd = b * Math.sqrt(n * q * (1 - q));
            const skew = (1 - 2 * q) / Math.sqrt(n * q * (1 - q));
            const z = NUM.inv(alpha);
            const varN = mean + z * sd;
            const varNP = mean + sd * (z + skew * (z * z - 1) / 6); // Normal Power
            const prima = (1 + theta) * mean / n;
            return {
                outputs: [
                    { label: 'Siniestralidad esperada $E[S]=nqb$', value: NUM.fmt(mean, 0) + ' €' },
                    { label: 'Desviación típica $\\sqrt{nq(1-q)}\\,b$', value: NUM.fmt(sd, 0) + ' €' },
                    { label: 'Asimetría $\\gamma_S$', value: NUM.fmt(skew, 3) },
                    { label: 'Cuantil con aproximación Normal', value: NUM.fmt(varN, 0) + ' €' },
                    { label: 'Cuantil con Normal Power', value: NUM.fmt(varNP, 0) + ' €', note: 'Corrige la asimetría: con $q$ pequeña la Normal infravalora la cola.' },
                    { label: 'Prima por póliza con recargo $\\theta$', value: NUM.fmt(prima, 2) + ' €' }
                ]
            };
        }
    },

    // --- Procesos estocásticos: cadena de Markov de dos estados ---------
    markov2: {
        title: 'Cadena de Markov de dos estados',
        inputs: [
            { id: 'a', label: 'Probabilidad $p_{01}$ (0 a 1)', value: 0.3, step: 0.05 },
            { id: 'b', label: 'Probabilidad $p_{10}$ (1 a 0)', value: 0.1, step: 0.05 },
            { id: 'n', label: 'Número de pasos $n$', value: 5, step: 1 },
            { id: 'lam', label: 'Tasa de Poisson $\\lambda$ por año', value: 2, step: 0.5 },
            { id: 't', label: 'Tiempo $t$ (años)', value: 1, step: 0.25 }
        ],
        compute(v) {
            const a = Math.min(1, Math.max(0, v.a)), b = Math.min(1, Math.max(0, v.b));
            const n = Math.max(0, Math.min(500, Math.round(v.n)));
            let P = [[1 - a, a], [b, 1 - b]];
            let R = [[1, 0], [0, 1]];
            for (let k = 0; k < n; k++) {
                R = [[R[0][0] * P[0][0] + R[0][1] * P[1][0], R[0][0] * P[0][1] + R[0][1] * P[1][1]],
                     [R[1][0] * P[0][0] + R[1][1] * P[1][0], R[1][0] * P[0][1] + R[1][1] * P[1][1]]];
            }
            const s = a + b;
            const pi0 = s > 0 ? b / s : NaN, pi1 = s > 0 ? a / s : NaN;
            const lam = Math.max(0, v.lam), t = Math.max(0, v.t), mu = lam * t;
            const pois = (k) => {
                let f = 1;
                for (let j = 2; j <= k; j++) f *= j;
                return Math.exp(-mu) * Math.pow(mu, k) / f;
            };
            return {
                outputs: [
                    { label: 'Matriz $P^{(n)}$, fila del estado 0', value: NUM.fmt(R[0][0], 4) + '  ·  ' + NUM.fmt(R[0][1], 4) },
                    { label: 'Matriz $P^{(n)}$, fila del estado 1', value: NUM.fmt(R[1][0], 4) + '  ·  ' + NUM.fmt(R[1][1], 4) },
                    { label: 'Distribución estacionaria $\\pi$', value: NUM.fmt(pi0, 4) + '  ·  ' + NUM.fmt(pi1, 4), note: '$\\pi P=\\pi$: $\\pi_0=p_{10}/(p_{01}+p_{10})$.' },
                    { label: 'Poisson: $P[N(t)=0]$', value: NUM.fmt(pois(0), 4) },
                    { label: 'Poisson: $P[N(t)\\ge 3]$', value: NUM.fmt(1 - pois(0) - pois(1) - pois(2), 4), note: 'Siniestros esperados $\\lambda t=' + NUM.fmt(mu, 2) + '$' }
                ]
            };
        }
    },

    // --- Derivados: Black-Scholes-Merton --------------------------------
    black_scholes_calc: {
        title: 'Opciones europeas: Black-Scholes-Merton y letras griegas',
        inputs: [
            { id: 'S', label: 'Precio del subyacente $S$', value: 100, step: 1 },
            { id: 'K', label: 'Precio de ejercicio $K$', value: 100, step: 1 },
            { id: 'r', label: 'Tipo sin riesgo $r$ (%)', value: 3, step: 0.25 },
            { id: 'q', label: 'Tasa de dividendos $q$ (%)', value: 0, step: 0.25 },
            { id: 'sigma', label: 'Volatilidad $\\sigma$ (%)', value: 20, step: 1 },
            { id: 'T', label: 'Vencimiento $T$ (años)', value: 1, step: 0.25 }
        ],
        compute(v) {
            const S = Math.max(v.S, 1e-6), K = Math.max(v.K, 1e-6), r = v.r / 100, q = v.q / 100;
            const sg = Math.max(v.sigma / 100, 1e-6), T = Math.max(v.T, 1e-6);
            const d1 = (Math.log(S / K) + (r - q + sg * sg / 2) * T) / (sg * Math.sqrt(T));
            const d2 = d1 - sg * Math.sqrt(T);
            const eq = Math.exp(-q * T), er = Math.exp(-r * T);
            const call = S * eq * NUM.cdf(d1) - K * er * NUM.cdf(d2);
            const put = K * er * NUM.cdf(-d2) - S * eq * NUM.cdf(-d1);
            const gamma = eq * NUM.pdf(d1) / (S * sg * Math.sqrt(T));
            const vega = S * eq * NUM.pdf(d1) * Math.sqrt(T) / 100;
            const thetaC = (-S * eq * NUM.pdf(d1) * sg / (2 * Math.sqrt(T)) - r * K * er * NUM.cdf(d2) + q * S * eq * NUM.cdf(d1)) / 365;
            return {
                outputs: [
                    { label: 'Call europea $c$', value: NUM.fmt(call, 4) },
                    { label: 'Put europea $p$', value: NUM.fmt(put, 4), note: 'Paridad $c-p=Se^{-qT}-Ke^{-rT}$: ' + NUM.fmt(call - put, 4) + ' frente a ' + NUM.fmt(S * eq - K * er, 4) },
                    { label: 'Delta de la call $\\Delta_c = e^{-qT}N(d_1)$', value: NUM.fmt(eq * NUM.cdf(d1), 4) },
                    { label: 'Gamma $\\Gamma$', value: NUM.fmt(gamma, 5) },
                    { label: 'Vega (por 1 punto de volatilidad)', value: NUM.fmt(vega, 4) },
                    { label: 'Theta de la call (por día)', value: NUM.fmt(thetaC, 4) }
                ]
            };
        }
    },

    // --- Renta fija: precio, duración y convexidad -----------------------
    bono: {
        title: 'Bono con cupón anual: precio, duración y convexidad',
        inputs: [
            { id: 'N', label: 'Nominal (€)', value: 100, step: 10 },
            { id: 'c', label: 'Cupón anual (%)', value: 4, step: 0.25 },
            { id: 'y', label: 'TIR $y$ (%)', value: 3, step: 0.25 },
            { id: 'n', label: 'Años hasta el vencimiento', value: 10, step: 1 },
            { id: 'dy', label: 'Variación del tipo (puntos básicos)', value: 100, step: 25 }
        ],
        compute(v) {
            const N = v.N, cp = N * v.c / 100, y = v.y / 100;
            const n = Math.max(1, Math.min(60, Math.round(v.n)));
            const price = (yy) => {
                let p = 0;
                for (let t = 1; t <= n; t++) p += (cp + (t === n ? N : 0)) / Math.pow(1 + yy, t);
                return p;
            };
            let P = 0, D = 0, C = 0;
            for (let t = 1; t <= n; t++) {
                const cf = cp + (t === n ? N : 0), pv = cf / Math.pow(1 + y, t);
                P += pv; D += t * pv; C += t * (t + 1) * pv / Math.pow(1 + y, 2);
            }
            D /= P; C /= P;
            const Dm = D / (1 + y);
            const dy = v.dy / 10000;
            const exact = price(y + dy) - P;
            const dur = -Dm * P * dy;
            const durConv = dur + 0.5 * C * P * dy * dy;
            return {
                outputs: [
                    { label: 'Precio $P=\\sum \\mathrm{CF}_t/(1+y)^t$', value: NUM.fmt(P, 3) + ' €' },
                    { label: 'Duración de Macaulay $D$', value: NUM.fmt(D, 3) + ' años' },
                    { label: 'Duración modificada $D/(1+y)$', value: NUM.fmt(Dm, 3) },
                    { label: 'Convexidad $C$', value: NUM.fmt(C, 2) },
                    { label: 'Cambio de precio exacto ante $\\Delta y$', value: NUM.fmt(exact, 3) + ' €' },
                    { label: 'Aproximación con duración / con duración y convexidad', value: NUM.fmt(dur, 3) + '  ·  ' + NUM.fmt(durConv, 3), note: 'La convexidad corrige el error de la aproximación lineal.' }
                ]
            };
        }
    },

    // --- Gestión de carteras: dos activos y activo libre de riesgo -------
    markowitz: {
        title: 'Markowitz con dos activos y activo libre de riesgo',
        inputs: [
            { id: 'm1', label: 'Rentabilidad esperada activo 1 (%)', value: 8, step: 0.5 },
            { id: 's1', label: 'Volatilidad activo 1 (%)', value: 20, step: 1 },
            { id: 'm2', label: 'Rentabilidad esperada activo 2 (%)', value: 4, step: 0.5 },
            { id: 's2', label: 'Volatilidad activo 2 (%)', value: 8, step: 1 },
            { id: 'rho', label: 'Correlación $\\rho$', value: 0.2, step: 0.1 },
            { id: 'rf', label: 'Tipo libre de riesgo $r_f$ (%)', value: 2, step: 0.25 }
        ],
        compute(v) {
            const m1 = v.m1 / 100, m2 = v.m2 / 100, s1 = v.s1 / 100, s2 = v.s2 / 100, rho = Math.max(-0.999, Math.min(0.999, v.rho)), rf = v.rf / 100;
            const c12 = rho * s1 * s2;
            const den = s1 * s1 + s2 * s2 - 2 * c12;
            const wMin = (s2 * s2 - c12) / den;                       // peso del activo 1 en la cartera de mínima varianza
            const stat = (w) => ({ mu: w * m1 + (1 - w) * m2, sd: Math.sqrt(w * w * s1 * s1 + (1 - w) * (1 - w) * s2 * s2 + 2 * w * (1 - w) * c12) });
            const mv = stat(wMin);
            // Cartera tangente: w ∝ Σ^{-1}(μ - rf)
            const e1 = m1 - rf, e2 = m2 - rf;
            const num1 = e1 * s2 * s2 - e2 * c12, num2 = e2 * s1 * s1 - e1 * c12;
            const wT = num1 / (num1 + num2);
            const tg = stat(wT);
            const sharpe = (tg.mu - rf) / tg.sd;
            return {
                outputs: [
                    { label: 'Mínima varianza: peso del activo 1', value: NUM.fmt(wMin * 100, 1) + ' %' },
                    { label: 'Mínima varianza: rentabilidad y riesgo', value: NUM.fmt(mv.mu * 100, 2) + ' %  ·  ' + NUM.fmt(mv.sd * 100, 2) + ' %' },
                    { label: 'Cartera de mercado (tangente): peso del activo 1', value: NUM.fmt(wT * 100, 1) + ' %' },
                    { label: 'Cartera de mercado: rentabilidad y riesgo', value: NUM.fmt(tg.mu * 100, 2) + ' %  ·  ' + NUM.fmt(tg.sd * 100, 2) + ' %' },
                    { label: 'Pendiente de la Línea del Mercado de Capitales', value: NUM.fmt(sharpe, 3), note: '$E[R_p]=r_f+\\dfrac{E[R_M]-r_f}{\\sigma_M}\\,\\sigma_p$' },
                    { label: '$\\beta$ del activo 1 respecto a la cartera de mercado', value: NUM.fmt((wT * s1 * s1 + (1 - wT) * c12) / (tg.sd * tg.sd), 3) }
                ]
            };
        }
    },

    // --- Fiscalidad: cuota de la base del ahorro (IRPF) ------------------
    base_ahorro: {
        title: 'IRPF: cuota íntegra de la base imponible del ahorro',
        inputs: [
            { id: 'rcm', label: 'Rendimientos del capital mobiliario (€)', value: 4000, step: 500 },
            { id: 'gan', label: 'Ganancias y pérdidas patrimoniales (€)', value: 8000, step: 500 },
            { id: 'ret', label: 'Retenciones practicadas (€)', value: 760, step: 50 }
        ],
        compute(v) {
            const base = v.rcm + v.gan;
            const tramos = [[6000, 0.19], [44000, 0.21], [150000, 0.23], [100000, 0.27], [Infinity, 0.30]];
            let rest = Math.max(base, 0), cuota = 0, lo = 0;
            const rows = [];
            for (const [width, rate] of tramos) {
                const part = Math.min(rest, width);
                cuota += part * rate;
                rest -= part;
                if (part > 0) rows.push(NUM.fmt(rate * 100, 0) + ' % sobre ' + NUM.fmt(part, 0));
                if (rest <= 0) break;
            }
            const diff = cuota - v.ret;
            return {
                outputs: [
                    { label: 'Base imponible del ahorro', value: NUM.fmt(base, 0) + ' €' },
                    { label: 'Cuota íntegra', value: NUM.fmt(cuota, 2) + ' €', note: rows.join(' · ') },
                    { label: 'Tipo medio', value: base > 0 ? NUM.fmt(cuota / base * 100, 2) + ' %' : '—' },
                    { label: diff >= 0 ? 'A ingresar en la declaración' : 'A devolver', value: NUM.fmt(Math.abs(diff), 2) + ' €' }
                ]
            };
        }
    }
});

// ==========================================================================
// Temarios
// ==========================================================================
Object.assign(KNOWLEDGE, {

    // ------------------------------------------------------------------
    mate_vida: {
        sections: [
            {
                id: 'idea', title: 'Idea clave',
                blocks: [
                    { type: 'p', text: 'La matemática actuarial del seguro de vida valora pagos que dependen de cuánto vive una persona. Todo parte de modelar el <b>tiempo de vida restante</b> $T_x$ de un individuo de edad $x$ como una variable aleatoria y de descontar sus prestaciones con un tipo técnico fijo. El valor actual de lo que pagará la aseguradora es otra variable aleatoria $Z$: su esperanza es la prima única y su varianza mide el riesgo que se asume.' },
                    { type: 'list', title: 'El hilo del curso', items: [
                        '<b>Tema 1. Modelo básico de mortalidad</b>: función de supervivencia $S_x(t)$, tanto instantáneo $\\mu_x$, tablas ($l_x$, $d_x$, $q_x$), hipótesis para fracciones de año y leyes paramétricas.',
                        '<b>Tema 2. Operaciones de seguro</b>: base técnica (mortalidad, tipo de interés, gastos), seguros de vida (riesgo), de supervivencia y mixtos, y capitales variables y diferidos.',
                        '<b>Tema 3. Rentas de supervivencia</b>: vitalicias y temporales, prepagables y pospagables, fraccionadas, variables y diferidas.',
                        '<b>Tema 4. La prima</b>: principio de equivalencia, prima neta, de inventario y de tarifa.',
                        '<b>Tema 5. El valor del contrato</b>: provisión matemática prospectiva y retrospectiva, rescate y reducción.'
                    ] },
                    { type: 'callout', text: 'La idea que lo une todo: <b>equivalencia en esperanza</b>. La prima se fija para que el valor actual esperado de las primas iguale al de las prestaciones; la provisión matemática mide después el desequilibrio que va apareciendo.' },
                    { type: 'list', title: 'Hipótesis para edades fraccionarias', items: [
                        '<b>Uniformidad</b> (interpolación lineal): $l_{x+s}=(1-s)\\,l_x+s\\,l_{x+1}$. Los fallecidos se reparten uniformemente en el año.',
                        '<b>Tanto instantáneo constante</b> (interpolación exponencial): ${}_sp_x=(p_x)^s$.',
                        '<b>Balducci</b> (interpolación armónica): la probabilidad de morir en la fracción restante del año es decreciente con la edad dentro del año.'
                    ] }
                ]
            },
            {
                id: 'formulas', title: 'Fórmulas',
                blocks: [
                    { type: 'formula', label: 'Supervivencia y tanto instantáneo', tex: 'S_x(t)=\\frac{S_0(x+t)}{S_0(x)},\\qquad \\mu_x=-\\frac{d}{dx}\\ln S_0(x),\\qquad {}_tp_x=\\exp\\!\\Big(-\\!\\int_0^t\\mu_{x+s}\\,ds\\Big)' },
                    { type: 'formula', label: 'Composición de supervivencias', tex: 'S_x(t+u)=S_x(t)\\cdot S_{x+t}(u)\\quad\\Longleftrightarrow\\quad {}_{t+u}p_x={}_tp_x\\cdot{}_up_{x+t}' },
                    { type: 'table', caption: 'Leyes de mortalidad', head: ['Ley', 'Tanto $\\mu_x$', 'Cuándo se usa'], rows: [
                        ['De Moivre', '$1/(\\omega-x)$', 'Vida máxima fija; simplificación teórica'],
                        ['Gompertz', '$B\\,c^x$', 'Mortalidad creciente con la edad; adultos y mayores'],
                        ['Makeham', '$A+B\\,c^x$', 'Gompertz con mortalidad accidental constante $A$'],
                        ['Weibull', '$\\frac{k}{\\lambda}(x/\\lambda)^{k-1}$', 'Flexible; fiabilidad y biometría'],
                        ['Heligman–Pollard', 'ocho parámetros', 'Todas las edades: infantil, accidentes juveniles, senectud']
                    ] },
                    { type: 'formula', label: 'Seguro de vida entera y su varianza', tex: 'A_x=E[v^{K+1}]=\\sum_{k\\ge 0}v^{k+1}\\,{}_{k|}q_x,\\qquad \\mathrm{Var}(Z)={}^2A_x-A_x^2', note: '${}^2A_x$ es el mismo seguro valorado con $v^2$ (el segundo momento).' },
                    { type: 'formula', label: 'Renta vitalicia prepagable', tex: '\\ddot a_x=\\sum_{k\\ge 0}v^k\\,{}_kp_x=\\sum_{k\\ge 0}{}_kE_x,\\qquad \\mathrm{Var}(Y)=\\frac{{}^2A_x-A_x^2}{d^2}', note: 'Relación entre seguro y renta: $A_x=1-d\\,\\ddot a_x$ con $d=i/(1+i)$.' },
                    { type: 'formula', label: 'Principio de equivalencia y prima nivelada', tex: 'E[\\text{VA primas}]=E[\\text{VA prestaciones}]\\ \\Rightarrow\\ P_x=\\frac{A_x}{\\ddot a_x}' },
                    { type: 'formula', label: 'Provisión matemática', tex: '{}_tV=\\underbrace{E[\\text{VA prestaciones futuras}]-E[\\text{VA primas futuras}]}_{\\text{prospectivo}}=\\underbrace{E[\\text{VA primas pasadas}]-E[\\text{VA prestaciones pasadas}]}_{\\text{retrospectivo}}' },
                    { type: 'table', caption: 'Primas según los recargos', head: ['Prima', 'Qué cubre'], rows: [
                        ['Neta o pura $P$', 'Prestaciones en término medio'],
                        ['De inventario $P\'$', 'Neta más desviaciones y gastos de gestión interna $g_i$'],
                        ['De tarifa $P\'\'$', 'Inventario más gastos de gestión externa $g_e$ (comercialización y mantenimiento)']
                    ] }
                ]
            },
            {
                id: 'calculadora', title: 'Calculadora',
                blocks: [
                    { type: 'p', text: 'Cambia los parámetros de Makeham, la edad y el tipo técnico. Los valores se calculan sumando hasta la edad 120 las probabilidades ${}_{k|}q_x$.' },
                    { type: 'calculator', id: 'makeham' }
                ]
            },
            {
                id: 'codigo', title: 'Código',
                blocks: [
                    { type: 'code', code: {
                        r: `
# Mortalidad de Makeham y seguro de vida entera
A <- 0.0007; B <- 0.00005; c <- 1.1; i <- 0.02; x <- 40
S0 <- function(t) exp(-A * t - B * (c^t - 1) / log(c))
kpx <- function(k) S0(x + k) / S0(x)
k   <- 0:(120 - x)
kq  <- kpx(k) - kpx(k + 1)             # k|q_x, probabilidad de morir en el año k+1
v   <- 1 / (1 + i); d <- i / (1 + i)

Ax   <- sum(v^(k + 1) * kq)             # seguro de vida entera
ax   <- sum(v^k * kpx(k))               # renta vitalicia prepagable
A2x  <- sum(v^(2 * (k + 1)) * kq)       # segundo momento
c(Ax = Ax, ax = ax, comprobacion = 1 - d * ax, P = Ax / ax, sd = sqrt(A2x - Ax^2))`,
                        python: `
import numpy as np

A, B, c, i, x = 0.0007, 0.00005, 1.1, 0.02, 40
S0 = lambda t: np.exp(-A * t - B * (c**t - 1) / np.log(c))
k = np.arange(0, 120 - x + 1)
kp = S0(x + k) / S0(x)
kq = kp - S0(x + k + 1) / S0(x)           # k|q_x
v, d = 1 / (1 + i), i / (1 + i)

Ax = np.sum(v ** (k + 1) * kq)
ax = np.sum(v ** k * kp)
A2x = np.sum(v ** (2 * (k + 1)) * kq)
print(Ax, ax, 1 - d * ax, Ax / ax, np.sqrt(A2x - Ax**2))` } }
                ]
            },
            {
                id: 'fuentes', title: 'Fuentes',
                blocks: [
                    { type: 'sources', items: [
                        'De la Fuente Merencio, I. (2025). Matemática actuarial de las operaciones de seguro de vida, Temas 1 a 5. Máster U. en Ciencias Actuariales y Financieras, Universidad de Alcalá.',
                        'Bowers, Gerber, Hickman, Jones y Nesbitt (1997). Actuarial Mathematics. Society of Actuaries.'
                    ] }
                ]
            }
        ]
    },

    // ------------------------------------------------------------------
    mate_no_vida: {
        sections: [
            {
                id: 'idea', title: 'Idea clave',
                blocks: [
                    { type: 'p', text: 'En seguros no vida la pregunta central es cuánto puede costar en total una cartera de pólizas en un año y cuánto capital hace falta para que sea muy improbable no poder pagarlo. La respuesta se construye en tres capas: la <b>decisión bajo riesgo</b> (por qué un riesgo vale más que su esperanza), el <b>modelo individual</b> del coste total y las <b>aproximaciones</b> de su distribución.' },
                    { type: 'list', title: 'Bloque 1. Utilidad y decisión bajo riesgo', items: [
                        'La paradoja de San Petersburgo muestra que el valor monetario esperado no basta; se introduce la <b>utilidad esperada</b> de von Neumann y Morgenstern.',
                        'Con una utilidad cóncava $u$ el decisor es averso al riesgo: la prima máxima que paga un asegurado, $P$, cumple $u(w-P)=E[u(w-X)]$ y es mayor que $E[X]$.',
                        'Medidas de aversión de Arrow y Pratt: $r(w)=-u\'\'(w)/u\'(w)$. Con utilidad exponencial la prima no depende de la riqueza.',
                        'Aplicación: diseño óptimo de contratos de reaseguro y regulación.'
                    ] },
                    { type: 'list', title: 'Bloque 2. Modelo individual de riesgo', items: [
                        'La siniestralidad agregada es $S=\\sum_{i=1}^{n}X_i$, con $X_i=I_i\\,B_i$: $I_i$ indica si hay siniestro y $B_i$ es su cuantía.',
                        'Las pólizas son independientes pero no idénticas; se obtienen la media, la varianza y las funciones generatrices (fgp y fgm) de $S$.',
                        'Se conecta con la tarificación, las reservas y el capital de Solvencia II e IFRS 17.'
                    ] },
                    { type: 'list', title: 'Bloque 3. Aproximar la distribución de $S$', items: [
                        '<b>Normal</b>: por el teorema central del límite; rápida pero ignora la asimetría.',
                        '<b>Gamma trasladada</b>: reproduce media, varianza y asimetría con tres parámetros.',
                        '<b>Normal Power</b>: corrige el cuantil normal con la asimetría $\\gamma_S$.',
                        '<b>Simulación de Monte Carlo</b> de la cartera (en Excel y en R), que sirve para contrastar las anteriores.'
                    ] },
                    { type: 'callout', text: 'Relación con el resto del atlas: los triángulos y el IBNR están en <b>Reserving</b>; el capital que exige el regulador, en <b>Solvencia II</b>; y la simulación del coste total usa los métodos de la guía de <b>Simulación</b>.' }
                ]
            },
            {
                id: 'formulas', title: 'Fórmulas',
                blocks: [
                    { type: 'formula', label: 'Utilidad esperada y prima máxima del asegurado', tex: 'E[u(W)]\\ \\text{máx.},\\qquad u(w-P)=E\\big[u(w-X)\\big]\\ \\Rightarrow\\ P\\ge E[X]\\ \\text{si }u\\text{ es cóncava}' },
                    { type: 'formula', label: 'Aversión absoluta al riesgo', tex: 'r(w)=-\\frac{u\'\'(w)}{u\'(w)},\\qquad u(w)=-e^{-\\alpha w}\\ \\Rightarrow\\ r(w)=\\alpha,\\quad P=\\frac{1}{\\alpha}\\ln M_X(\\alpha)' },
                    { type: 'formula', label: 'Principios de cálculo de la prima', tex: 'P_{\\text{esperanza}}=(1+\\theta)E[S],\\qquad P_{\\text{varianza}}=E[S]+\\beta\\,\\mathrm{Var}(S),\\qquad P_{\\text{desv. típica}}=E[S]+\\beta\\,\\sigma_S' },
                    { type: 'formula', label: 'Modelo individual', tex: 'S=\\sum_{i=1}^{n}I_iB_i,\\quad E[S]=\\sum q_i\\mu_i,\\quad \\mathrm{Var}(S)=\\sum\\big[q_i\\sigma_i^2+q_i(1-q_i)\\mu_i^2\\big]' },
                    { type: 'formula', label: 'Función generatriz de momentos', tex: 'M_S(t)=\\prod_{i=1}^{n}\\big[1-q_i+q_i\\,M_{B_i}(t)\\big]' },
                    { type: 'formula', label: 'Aproximación Normal Power', tex: 'x_\\alpha\\approx E[S]+\\sigma_S\\Big(z_\\alpha+\\frac{\\gamma_S}{6}(z_\\alpha^2-1)\\Big)', note: '$z_\\alpha$ es el cuantil normal y $\\gamma_S$ la asimetría de $S$.' }
                ]
            },
            {
                id: 'calculadora', title: 'Calculadora',
                blocks: [
                    { type: 'p', text: 'Una cartera de $n$ pólizas idénticas, cada una con probabilidad $q$ de siniestro y suma asegurada $b$. Compara el cuantil de la siniestralidad con la aproximación Normal y con Normal Power: cuanto menor es $q$, mayor es la asimetría y más se separan.' },
                    { type: 'calculator', id: 'modelo_individual' }
                ]
            },
            {
                id: 'codigo', title: 'Código',
                blocks: [
                    { type: 'code', code: {
                        r: `
# Simulación de Monte Carlo del modelo individual
set.seed(1)
n <- 1000; q <- 0.02; b <- 10000
S <- replicate(1e5, b * rbinom(1, n, q))      # n pólizas idénticas: S = b * Binomial(n, q)

mu <- n * q * b; sg <- b * sqrt(n * q * (1 - q)); g <- (1 - 2 * q) / sqrt(n * q * (1 - q))
z  <- qnorm(0.995)
c(simulado   = quantile(S, 0.995),
  normal     = mu + z * sg,
  normalPower = mu + sg * (z + g * (z^2 - 1) / 6))`,
                        python: `
import numpy as np
from statistics import NormalDist

rng = np.random.default_rng(1)
n, q, b = 1000, 0.02, 10000
S = b * rng.binomial(n, q, size=100_000)

mu = n * q * b
sg = b * np.sqrt(n * q * (1 - q))
g = (1 - 2 * q) / np.sqrt(n * q * (1 - q))
z = NormalDist().inv_cdf(0.995)
print(np.quantile(S, 0.995), mu + z * sg, mu + sg * (z + g * (z**2 - 1) / 6))` } }
                ]
            },
            {
                id: 'fuentes', title: 'Fuentes',
                blocks: [
                    { type: 'sources', items: [
                        'González Riera, H. (2026). Matemática actuarial de la estabilidad y solvencia de la actividad aseguradora: Tema 1 (utilidad y decisiones bajo riesgo) y Tema 2 (modelo individual del coste total). Máster U. en Ciencias Actuariales y Financieras, Universidad de Alcalá.',
                        'Luzuriaga, L. (2026). Manual detallado de conceptos de seguros P&C: reserving, capital, pricing y reaseguro (apuntes propios).',
                        'Kaas, Goovaerts, Dhaene y Denuit (2008). Modern Actuarial Risk Theory. Springer.',
                        'Bowers et al. (1997). Actuarial Mathematics. Society of Actuaries.'
                    ] }
                ]
            }
        ]
    },

    // ------------------------------------------------------------------
    procesos_estocasticos: {
        sections: [
            {
                id: 'idea', title: 'Idea clave',
                blocks: [
                    { type: 'p', text: 'Un proceso estocástico $\\{X(t)\\}$ es una familia de variables aleatorias indexada por el tiempo: el capital de una aseguradora tras cada partida, el número de siniestros hasta $t$ o el nivel de bonus de un asegurado. El curso se centra en los <b>procesos de Markov</b>, donde el futuro depende solo del estado presente y no de cómo se llegó a él.' },
                    { type: 'list', title: 'El programa', items: [
                        '<b>Tema 1. Introducción</b>: de las variables aleatorias a las funciones aleatorias; el problema clásico de la ruina del jugador (probabilidad de ruina y duración media).',
                        '<b>Tema 2. Cadenas de Markov</b> (tiempo y estados discretos): matriz de transición, ecuaciones de Chapman–Kolmogorov, clasificación de estados, cadenas regulares y distribución estacionaria. Aplicación al <b>seguro bonificado</b> (bonus-malus).',
                        '<b>Tema 3. Cadenas de Markov en tiempo continuo</b>: matriz de intensidades $Q$ y ecuaciones de Kolmogorov.',
                        '<b>Tema 4. Procesos de nacimiento y muerte</b>: poblaciones, colas y supervivencia.',
                        '<b>Tema 5. Procesos de Poisson</b>: procesos de recuento, tiempos entre ocurrencias exponenciales, superposición y descomposición.'
                    ] },
                    { type: 'list', title: 'Clasificación de los procesos de Markov', items: [
                        'Tiempo discreto y estados discretos: <b>cadenas de Markov</b>.',
                        'Tiempo continuo y estados discretos: <b>cadenas de Markov en tiempo continuo</b>.',
                        'Estados continuos: procesos de Markov en tiempo discreto o continuo (como el movimiento browniano de los derivados).'
                    ] },
                    { type: 'callout', text: 'Ejemplo del examen del curso: cuatro estados según el número de reclamaciones de un asegurado, con el último absorbente. De $P^2$ se lee la probabilidad de llegar al estado 4 en dos años, y de $P^n$ para $n$ grande, que a largo plazo todos acaban en el estado absorbente.' }
                ]
            },
            {
                id: 'formulas', title: 'Fórmulas',
                blocks: [
                    { type: 'formula', label: 'Propiedad de Markov', tex: 'P\\big[X_{n+1}=j\\mid X_n=i,X_{n-1}=i_{n-1},\\dots,X_0=i_0\\big]=P\\big[X_{n+1}=j\\mid X_n=i\\big]=p_{ij}' },
                    { type: 'formula', label: 'Chapman–Kolmogorov', tex: 'P^{(n+m)}=P^{(n)}P^{(m)}\\ \\Rightarrow\\ P^{(n)}=P^n,\\qquad v_n=v_0P^n' },
                    { type: 'formula', label: 'Distribución estacionaria (cadena regular)', tex: '\\pi P=\\pi,\\quad \\sum_j\\pi_j=1,\\qquad \\lim_{n\\to\\infty}P^n=\\mathbf 1\\,\\pi' },
                    { type: 'formula', label: 'Tiempo continuo: intensidades', tex: 'P(t,t+dt)=I+Q\\,dt+o(dt),\\qquad \\frac{d}{dt}P(t)=P(t)\\,Q\\ \\ \\Rightarrow\\ \\ P(t)=e^{Qt}' },
                    { type: 'formula', label: 'Nacimiento y muerte', tex: 'p_{n,n+1}(dt)=\\lambda_n\\,dt,\\qquad p_{n,n-1}(dt)=\\mu_n\\,dt' },
                    { type: 'formula', label: 'Proceso de Poisson de tasa $\\lambda$', tex: 'P[N(t+s)-N(s)=n]=\\frac{(\\lambda t)^n}{n!}\\,e^{-\\lambda t},\\qquad \\tau_k\\sim\\mathrm{Exp}(\\lambda)\\ \\text{independientes}' },
                    { type: 'formula', label: 'Ruina del jugador (probabilidad $p\\ne q$)', tex: 'P[\\text{ruina desde }z]=\\frac{(q/p)^{a}-(q/p)^{z}}{(q/p)^{a}-1}' }
                ]
            },
            {
                id: 'calculadora', title: 'Calculadora',
                blocks: [
                    { type: 'p', text: 'Calcula $P^n$ de una cadena de dos estados, su distribución estacionaria y, además, probabilidades de un proceso de Poisson.' },
                    { type: 'calculator', id: 'markov2' }
                ]
            },
            {
                id: 'codigo', title: 'Código',
                blocks: [
                    { type: 'code', code: {
                        r: `
# Cadena absorbente con 4 estados: reclamaciones de un asegurado (ejercicio del curso)
P <- matrix(c(0.7, 0.2, 0.05, 0.05,
              0,   0.5, 0.3,  0.2,
              0,   0,   0.4,  0.6,
              0,   0,   0,    1), nrow = 4, byrow = TRUE)

P2 <- P %*% P
P2[1, 4]                         # de 1 a 4 en dos años: 0.155

P3 <- P2 %*% P
1856 * P3[2, 4]                  # asegurados que pasan de 2 a 4 en tres años

Pn <- diag(4); for (k in 1:100) Pn <- Pn %*% P
round(Pn, 2)                     # a largo plazo todo es del estado absorbente 4

# Distribución estacionaria de una cadena regular: autovector por la izquierda de valor propio 1
Q <- matrix(c(0.7, 0.3, 0.1, 0.9), 2, byrow = TRUE)
e <- eigen(t(Q)); est <- Re(e$vectors[, 1]); est / sum(est)`,
                        python: `
import numpy as np

P = np.array([[0.7, 0.2, 0.05, 0.05],
              [0.0, 0.5, 0.3, 0.2],
              [0.0, 0.0, 0.4, 0.6],
              [0.0, 0.0, 0.0, 1.0]])
P2 = P @ P
print(P2[0, 3])                       # 0.155
print(1856 * np.linalg.matrix_power(P, 3)[1, 3])
print(np.round(np.linalg.matrix_power(P, 100), 2))

# Estacionaria de una cadena regular
Q = np.array([[0.7, 0.3], [0.1, 0.9]])
w, V = np.linalg.eig(Q.T)
est = np.real(V[:, np.argmin(abs(w - 1))]); print(est / est.sum())

# Poisson: simulación de los tiempos entre siniestros
rng = np.random.default_rng(0)
lam = 2.0
t = np.cumsum(rng.exponential(1 / lam, 1000))
print((t <= 1).sum())                 # siniestros en el primer año` } }
                ]
            },
            {
                id: 'fuentes', title: 'Fuentes',
                blocks: [
                    { type: 'sources', items: [
                        'Núñez Velázquez, J. J. Procesos estocásticos para las finanzas y el seguro, Temas 1 a 5 y relaciones de ejercicios. Máster U. en Ciencias Actuariales y Financieras, Universidad de Alcalá.',
                        'Análisis dinámico mediante procesos estocásticos para actuarios y finanzas (libro de referencia del curso).',
                        'Ross, S. (2014). Introduction to Probability Models. Academic Press.'
                    ] }
                ]
            }
        ]
    },

    // ------------------------------------------------------------------
    derivados: {
        sections: [
            {
                id: 'idea', title: 'Idea clave',
                blocks: [
                    { type: 'p', text: 'Un derivado es un contrato cuyo valor depende de otro activo, el subyacente. La valoración se apoya en una sola idea: <b>no arbitraje</b>. Si se puede replicar el pago del derivado con el subyacente y un activo sin riesgo, su precio tiene que ser el coste de esa réplica, y por eso no depende de la aversión al riesgo de nadie (valoración neutral al riesgo).' },
                    { type: 'list', title: 'El programa', items: [
                        '<b>Tema 1. Forwards y futuros</b>: especificación, convergencia con el contado, liquidación diaria y garantías; precio $F=Se^{rT}$ y variantes con rentas, índices, divisas y mercancías; estrategias de cobertura.',
                        '<b>Tema 2. Opciones</b>: posiciones largas y cortas en calls y puts, factores del precio, límites y paridad call–put.',
                        '<b>Tema 3. Black–Scholes</b>: movimiento browniano geométrico, lema de Itô, ecuación en derivadas parciales, fórmulas para opciones europeas, estimación de la volatilidad, dividendos, índices, divisas y futuros.',
                        '<b>Tema 4. Modelo binomial</b>: árbol de Cox–Ross–Rubinstein para opciones europeas y americanas.',
                        '<b>Tema 5. Letras griegas</b>: delta, gamma, vega, theta y rho; cobertura delta y opciones sintéticas.'
                    ] },
                    { type: 'list', title: 'Los seis factores del precio de una opción', items: [
                        'Precio del subyacente $S$ y precio de ejercicio $K$.',
                        'Volatilidad $\\sigma$ y tiempo hasta el vencimiento $T$.',
                        'Tipo de interés sin riesgo $r$ y dividendos del subyacente.'
                    ] },
                    { type: 'callout', text: 'Conexión con el atlas: el cálculo de Itô y la ecuación de Black–Scholes son la parte continua de la <b>Probabilidad</b> y del <b>Cálculo</b>; el árbol binomial es la versión discreta y se resuelve con las mismas ideas de simulación y de procesos estocásticos.' }
                ]
            },
            {
                id: 'formulas', title: 'Fórmulas',
                blocks: [
                    { type: 'formula', label: 'Precio a plazo', tex: 'F_0=S_0\\,e^{(r-q)T}\\qquad\\text{(con rentas conocidas: }F_0=(S_0-I)\\,e^{rT}\\text{)}' },
                    { type: 'formula', label: 'Movimiento browniano geométrico y lema de Itô', tex: 'dS=\\mu S\\,dt+\\sigma S\\,dW,\\qquad df(S,t)=\\Big(f_t+\\mu S f_S+\\tfrac12\\sigma^2S^2f_{SS}\\Big)dt+\\sigma S f_S\\,dW' },
                    { type: 'formula', label: 'Ecuación en derivadas parciales de Black–Scholes', tex: '\\frac{\\partial f}{\\partial t}+(r-q)S\\frac{\\partial f}{\\partial S}+\\frac12\\sigma^2S^2\\frac{\\partial^2f}{\\partial S^2}=rf' },
                    { type: 'formula', label: 'Fórmulas de Black–Scholes–Merton', tex: 'c=Se^{-qT}N(d_1)-Ke^{-rT}N(d_2),\\quad p=Ke^{-rT}N(-d_2)-Se^{-qT}N(-d_1)', note: '$d_1=\\dfrac{\\ln(S/K)+(r-q+\\sigma^2/2)T}{\\sigma\\sqrt T}$ y $d_2=d_1-\\sigma\\sqrt T$.' },
                    { type: 'formula', label: 'Paridad call–put (europeas)', tex: 'c-p=Se^{-qT}-Ke^{-rT}' },
                    { type: 'formula', label: 'Modelo binomial de Cox–Ross–Rubinstein', tex: 'u=e^{\\sigma\\sqrt{\\Delta t}},\\quad d=\\frac1u,\\quad p=\\frac{e^{(r-q)\\Delta t}-d}{u-d},\\quad f=e^{-r\\Delta t}\\big[pf_u+(1-p)f_d\\big]' },
                    { type: 'table', caption: 'Letras griegas de una call europea', head: ['Letra', 'Definición', 'Valor'], rows: [
                        ['Delta $\\Delta$', '$\\partial c/\\partial S$', '$e^{-qT}N(d_1)$'],
                        ['Gamma $\\Gamma$', '$\\partial^2c/\\partial S^2$', '$e^{-qT}N\'(d_1)/(S\\sigma\\sqrt T)$'],
                        ['Vega $\\mathcal V$', '$\\partial c/\\partial\\sigma$', '$Se^{-qT}N\'(d_1)\\sqrt T$'],
                        ['Theta $\\Theta$', '$\\partial c/\\partial t$', '$-\\dfrac{Se^{-qT}N\'(d_1)\\sigma}{2\\sqrt T}-rKe^{-rT}N(d_2)+qSe^{-qT}N(d_1)$'],
                        ['Rho $\\rho$', '$\\partial c/\\partial r$', '$KTe^{-rT}N(d_2)$']
                    ] }
                ]
            },
            {
                id: 'calculadora', title: 'Calculadora',
                blocks: [
                    { type: 'p', text: 'Valora una call y una put europeas con Black–Scholes–Merton y comprueba la paridad. Con $q=0$ es la fórmula clásica para acciones sin dividendos.' },
                    { type: 'calculator', id: 'black_scholes_calc' }
                ]
            },
            {
                id: 'codigo', title: 'Código',
                blocks: [
                    { type: 'code', code: {
                        r: `
# Black-Scholes-Merton y arbol binomial (Cox-Ross-Rubinstein)
bs <- function(S, K, r, q, sg, T, tipo = "call") {
  d1 <- (log(S / K) + (r - q + sg^2 / 2) * T) / (sg * sqrt(T)); d2 <- d1 - sg * sqrt(T)
  if (tipo == "call") S * exp(-q * T) * pnorm(d1) - K * exp(-r * T) * pnorm(d2)
  else K * exp(-r * T) * pnorm(-d2) - S * exp(-q * T) * pnorm(-d1)
}
bs(100, 100, 0.03, 0, 0.20, 1)                     # call: 9.413

crr <- function(S, K, r, sg, T, N, tipo = "call", americana = FALSE) {
  dt <- T / N; u <- exp(sg * sqrt(dt)); d <- 1 / u; p <- (exp(r * dt) - d) / (u - d)
  ST <- S * u^(N:0) * d^(0:N)
  f  <- if (tipo == "call") pmax(ST - K, 0) else pmax(K - ST, 0)
  for (j in N:1) {
    f <- exp(-r * dt) * (p * f[1:j] + (1 - p) * f[2:(j + 1)])
    if (americana) {
      Sj <- S * u^((j - 1):0) * d^(0:(j - 1))
      f  <- pmax(f, if (tipo == "call") Sj - K else K - Sj)
    }
  }
  f
}
crr(100, 100, 0.03, 0.20, 1, 500)                  # converge al valor de Black-Scholes`,
                        python: `
import numpy as np
from statistics import NormalDist

N = NormalDist().cdf

def bs(S, K, r, q, sg, T, tipo="call"):
    d1 = (np.log(S / K) + (r - q + sg**2 / 2) * T) / (sg * np.sqrt(T))
    d2 = d1 - sg * np.sqrt(T)
    if tipo == "call":
        return S * np.exp(-q * T) * N(d1) - K * np.exp(-r * T) * N(d2)
    return K * np.exp(-r * T) * N(-d2) - S * np.exp(-q * T) * N(-d1)

print(bs(100, 100, 0.03, 0.0, 0.20, 1.0))

def crr(S, K, r, sg, T, n, tipo="call", americana=False):
    dt = T / n; u = np.exp(sg * np.sqrt(dt)); d = 1 / u
    p = (np.exp(r * dt) - d) / (u - d)
    ST = S * u ** np.arange(n, -1, -1) * d ** np.arange(0, n + 1)
    f = np.maximum(ST - K, 0) if tipo == "call" else np.maximum(K - ST, 0)
    for j in range(n, 0, -1):
        f = np.exp(-r * dt) * (p * f[:j] + (1 - p) * f[1:j + 1])
        if americana:
            Sj = S * u ** np.arange(j - 1, -1, -1) * d ** np.arange(0, j)
            f = np.maximum(f, Sj - K if tipo == "call" else K - Sj)
    return f[0]

print(crr(100, 100, 0.03, 0.20, 1.0, 500))` } }
                ]
            },
            {
                id: 'fuentes', title: 'Fuentes',
                blocks: [
                    { type: 'sources', items: [
                        'Apuntes de Derivados Financieros, Temas 1 a 3 (L&L, 2026), Tema 4 (modelo binomial) y Tema 5 (letras griegas). Máster U. en Ciencias Actuariales y Financieras, Universidad de Alcalá.',
                        'Hull, J. C. Options, Futures, and Other Derivatives (8.ª y 11.ª ed.). Pearson. Capítulos sobre futuros, opciones, Black–Scholes y letras griegas.',
                        'Cox, Ross y Rubinstein (1979). Option pricing: a simplified approach. Journal of Financial Economics.',
                        'Black y Scholes (1973). The pricing of options and corporate liabilities. Journal of Political Economy.'
                    ] }
                ]
            }
        ]
    },

    // ------------------------------------------------------------------
    renta_fija: {
        sections: [
            {
                id: 'idea', title: 'Idea clave',
                blocks: [
                    { type: 'p', text: 'Un bono es una promesa de flujos de caja fijados de antemano. Su precio es el valor actual de esos flujos, y como el descuento depende de los tipos de interés, el precio se mueve en sentido contrario a los tipos. La asignatura estudia cómo valorar, qué curva de tipos usar y cuánto riesgo de tipo de interés se asume.' },
                    { type: 'list', title: 'El programa', items: [
                        '<b>Tema 1. Valoración de bonos</b>: bonos con cupón (americanos) y cupón cero, precio, TIR, bonos indexados a la inflación.',
                        '<b>Tema 2. Estructura temporal de los tipos de interés (ETTI)</b>: tipo al contado, función de descuento, TIR y sesgo del cupón, tipos forward y tipos capitalizables continuamente.',
                        '<b>Tema 3. Riesgo de variación de los tipos</b>: elasticidad del precio, duración y convexidad, evidencia empírica en deuda pública e inmunización de carteras.',
                        '<b>Trabajo. Estimación de la ETTI</b>: modelo de Nelson y Siegel (1987) y variantes.'
                    ] },
                    { type: 'list', title: 'Hipótesis sobre la forma de la ETTI', items: [
                        '<b>Expectativas puras</b>: los tipos forward son predictores insesgados de los tipos futuros.',
                        '<b>Preferencia por la liquidez</b>: el forward incorpora una prima positiva que compensa el riesgo de plazo.',
                        '<b>Segmentación de mercados</b>: cada plazo tiene su propia oferta y demanda.'
                    ] },
                    { type: 'callout', text: 'La inmunización (Redington) conecta este tema con <b>Gestión de riesgos</b>: una cartera de activos protege un pasivo frente a movimientos paralelos de la curva si iguala su valor actual y su duración, y su convexidad es mayor que la del pasivo.' }
                ]
            },
            {
                id: 'formulas', title: 'Fórmulas',
                blocks: [
                    { type: 'formula', label: 'Precio de un bono y TIR', tex: 'P=\\sum_{t=1}^{n}\\frac{\\mathrm{CF}_t}{(1+y)^t}\\quad\\text{(la TIR }y\\text{ es la raíz de esta ecuación)}' },
                    { type: 'formula', label: 'Valoración con la ETTI al contado', tex: 'P=\\sum_{t=1}^{n}\\frac{\\mathrm{CF}_t}{(1+s_t)^t},\\qquad (1+s_t)^t=\\prod_{k=1}^{t}(1+f_{k-1,k})' },
                    { type: 'formula', label: 'Tipo forward implícito', tex: 'f_{t,T}=\\left[\\frac{(1+s_T)^T}{(1+s_t)^t}\\right]^{\\frac1{T-t}}-1' },
                    { type: 'formula', label: 'Nelson y Siegel (1987): forward instantáneo', tex: 'f(t,T)=\\beta_0+\\beta_1\\,e^{-k(T-t)}+\\beta_2\\,k\\,(T-t)\\,e^{-k(T-t)}', note: '$\\beta_0$ es el tipo a muy largo plazo y $\\beta_0+\\beta_1$ el tipo a muy corto plazo (la operación a un día).' },
                    { type: 'formula', label: 'Duración de Macaulay, modificada y convexidad', tex: 'D=\\frac{\\sum t\\,\\mathrm{PV}_t}{P},\\qquad D_m=\\frac{D}{1+y},\\qquad C=\\frac{1}{P}\\sum\\frac{t(t+1)\\,\\mathrm{CF}_t}{(1+y)^{t+2}}' },
                    { type: 'formula', label: 'Cambio de precio ante $\\Delta y$', tex: '\\frac{\\Delta P}{P}\\approx -D_m\\,\\Delta y+\\tfrac12\\,C\\,(\\Delta y)^2' },
                    { type: 'formula', label: 'Inmunización de Redington', tex: 'V_A=V_L,\\qquad D_A=D_L,\\qquad C_A>C_L' }
                ]
            },
            {
                id: 'calculadora', title: 'Calculadora',
                blocks: [
                    { type: 'p', text: 'Modifica el cupón, la TIR y el plazo para ver cómo cambian el precio, la duración y la convexidad, y cuánto mejora la aproximación al añadir la convexidad.' },
                    { type: 'calculator', id: 'bono' }
                ]
            },
            {
                id: 'codigo', title: 'Código',
                blocks: [
                    { type: 'code', code: {
                        r: `
# Precio, duracion y convexidad de un bono con cupon anual
bono <- function(N = 100, cupon = 0.04, y = 0.03, n = 10) {
  t  <- 1:n; cf <- rep(N * cupon, n); cf[n] <- cf[n] + N
  pv <- cf / (1 + y)^t; P <- sum(pv)
  D  <- sum(t * pv) / P
  C  <- sum(t * (t + 1) * pv / (1 + y)^2) / P
  c(precio = P, duracion = D, modificada = D / (1 + y), convexidad = C)
}
bono()

# Nelson-Siegel: tipo al contado a partir del forward instantaneo
# s(m) = b0 + (b1 + b2) * (1 - exp(-k m)) / (k m) - b2 * exp(-k m)
ns <- function(m, b0, b1, b2, k) b0 + (b1 + b2) * (1 - exp(-k * m)) / (k * m) - b2 * exp(-k * m)
ns(1:10, b0 = 0.04, b1 = -0.02, b2 = 0.01, k = 0.5)`,
                        python: `
import numpy as np

def bono(N=100, cupon=0.04, y=0.03, n=10):
    t = np.arange(1, n + 1)
    cf = np.full(n, N * cupon); cf[-1] += N
    pv = cf / (1 + y) ** t; P = pv.sum()
    D = (t * pv).sum() / P
    C = (t * (t + 1) * pv / (1 + y) ** 2).sum() / P
    return P, D, D / (1 + y), C

print(bono())

# Nelson-Siegel (forma en tipo al contado)
def ns(m, b0, b1, b2, k):
    return b0 + (b1 + b2) * (1 - np.exp(-k * m)) / (k * m) - b2 * np.exp(-k * m)

print(ns(np.arange(1, 11), 0.04, -0.02, 0.01, 0.5))` } }
                ]
            },
            {
                id: 'fuentes', title: 'Fuentes',
                blocks: [
                    { type: 'sources', items: [
                        'Torralba, M. (2026). Renta fija: Tema I (valoración de bonos), Tema II (estructura temporal de los tipos de interés, basado en materiales de E. Navarro Arribas) y Tema III (riesgo de variación de los tipos). Máster U. en Ciencias Actuariales y Financieras, Universidad de Alcalá.',
                        'Nelson, C. R. y Siegel, A. F. (1987). Parsimonious modeling of yield curves. Journal of Business.',
                        'Redington, F. M. (1952). Review of the principles of life-office valuations. Journal of the Institute of Actuaries.'
                    ] }
                ]
            }
        ]
    },

    // ------------------------------------------------------------------
    carteras: {
        sections: [
            {
                id: 'idea', title: 'Idea clave',
                blocks: [
                    { type: 'p', text: 'La gestión de carteras responde a una pregunta: con un capital y varios activos, ¿cuánto invertir en cada uno? Markowitz propuso medir la rentabilidad de una cartera por su <b>esperanza</b> y su riesgo por su <b>varianza</b>; diversificar baja el riesgo porque las correlaciones entre activos son menores que uno. Sobre ese marco se construyen los modelos de equilibrio y de factores.' },
                    { type: 'list', title: 'El programa (Profesora Balbás Aparicio)', items: [
                        '<b>Tema 2. Media–varianza</b>: carteras como vectores de pesos, matriz de covarianzas, carteras eficientes y frontera eficiente, estimación de parámetros.',
                        '<b>Tema 3. CAPM</b>: con un activo libre de riesgo aparece la cartera de mercado, la Línea del Mercado de Capitales (CML) y la Línea del Mercado de Valores (SML). La beta mide el riesgo sistemático.',
                        '<b>Tema 4. APT y modelos de factores</b>: carteras-factor alternativas a la de mercado; el modelo de tres factores de Fama y French (mercado, tamaño y valor).',
                        '<b>Tema 5. Black–Litterman</b>: combina el equilibrio de mercado (información a priori) con las opiniones de expertos (views) para obtener la rentabilidad esperada a posteriori.',
                        '<b>Introducción a VBA</b>: automatizar en Excel el cálculo de carteras y de rentabilidades.'
                    ] },
                    { type: 'list', title: 'Ideas que hay que saber explicar', items: [
                        'El <b>riesgo específico</b> se elimina diversificando; el <b>sistemático</b> (la beta) no, y por eso es el único que el mercado remunera.',
                        'Toda cartera eficiente es una mezcla del activo libre de riesgo y de la <b>cartera de mercado</b> (teorema de separación).',
                        'Black–Litterman soluciona la inestabilidad de Markowitz: pequeñas variaciones en las rentabilidades esperadas cambian mucho los pesos óptimos.'
                    ] }
                ]
            },
            {
                id: 'formulas', title: 'Fórmulas',
                blocks: [
                    { type: 'formula', label: 'Rentabilidad y varianza de una cartera', tex: 'E[R_p]=w^\\top\\mu,\\qquad \\sigma_p^2=w^\\top\\Sigma\\,w,\\qquad w^\\top\\mathbf 1=1' },
                    { type: 'formula', label: 'Cartera de mínima varianza', tex: 'w_{\\min}=\\frac{\\Sigma^{-1}\\mathbf 1}{\\mathbf 1^\\top\\Sigma^{-1}\\mathbf 1}' },
                    { type: 'formula', label: 'Cartera de mercado (tangente)', tex: 'w_M\\propto\\Sigma^{-1}(\\mu-r_f\\mathbf 1),\\qquad \\text{CML: }E[R_p]=r_f+\\frac{E[R_M]-r_f}{\\sigma_M}\\,\\sigma_p' },
                    { type: 'formula', label: 'CAPM y Línea del Mercado de Valores', tex: 'E[R_i]-r_f=\\beta_i\\big(E[R_M]-r_f\\big),\\qquad \\beta_i=\\frac{\\mathrm{Cov}(R_i,R_M)}{\\mathrm{Var}(R_M)}' },
                    { type: 'formula', label: 'Descomposición del riesgo', tex: '\\sigma_i^2=\\underbrace{\\beta_i^2\\sigma_M^2}_{\\text{sistemático}}+\\underbrace{\\sigma_{\\varepsilon_i}^2}_{\\text{específico}}' },
                    { type: 'formula', label: 'Modelo de factores (APT) y Fama–French', tex: 'R_i-r_f=\\alpha_i+\\sum_{k}\\beta_{ik}\\,F_k+\\varepsilon_i,\\qquad F=\\{R_M-r_f,\\ \\mathrm{SMB},\\ \\mathrm{HML}\\}' },
                    { type: 'formula', label: 'Black–Litterman', tex: '\\mu_{BL}=\\big[(\\tau\\Sigma)^{-1}+P^\\top\\Omega^{-1}P\\big]^{-1}\\big[(\\tau\\Sigma)^{-1}\\pi+P^\\top\\Omega^{-1}q\\big]', note: '$\\pi$ son las rentabilidades de equilibrio, $P$ y $q$ las opiniones y $\\Omega$ su incertidumbre.' }
                ]
            },
            {
                id: 'calculadora', title: 'Calculadora',
                blocks: [
                    { type: 'p', text: 'Con dos activos riesgosos y un tipo libre de riesgo se obtiene la cartera de mínima varianza, la cartera de mercado y la pendiente de la CML. Prueba con $\\rho=1$ (sin diversificación) y con $\\rho$ negativa.' },
                    { type: 'calculator', id: 'markowitz' }
                ]
            },
            {
                id: 'codigo', title: 'Código',
                blocks: [
                    { type: 'code', code: {
                        r: `
# Markowitz con n activos: minima varianza y cartera tangente
mu <- c(0.08, 0.04, 0.06); rf <- 0.02
sg <- c(0.20, 0.08, 0.14)
R  <- matrix(c(1, .2, .4,  .2, 1, .3,  .4, .3, 1), 3)
S  <- diag(sg) %*% R %*% diag(sg)

uno  <- rep(1, 3)
wmin <- solve(S, uno);  wmin <- wmin / sum(wmin)
wtan <- solve(S, mu - rf); wtan <- wtan / sum(wtan)

rbind(minVar = wmin, tangente = wtan)
sharpe <- (sum(wtan * mu) - rf) / sqrt(t(wtan) %*% S %*% wtan); sharpe

# Beta de un activo respecto al mercado
beta <- as.numeric(S %*% wtan) / as.numeric(t(wtan) %*% S %*% wtan); beta`,
                        python: `
import numpy as np

mu = np.array([0.08, 0.04, 0.06]); rf = 0.02
sg = np.array([0.20, 0.08, 0.14])
R = np.array([[1, .2, .4], [.2, 1, .3], [.4, .3, 1]])
S = np.diag(sg) @ R @ np.diag(sg)
uno = np.ones(3)

wmin = np.linalg.solve(S, uno); wmin /= wmin.sum()
wtan = np.linalg.solve(S, mu - rf * uno); wtan /= wtan.sum()
print(wmin, wtan)
print((wtan @ mu - rf) / np.sqrt(wtan @ S @ wtan))      # ratio de Sharpe
print(S @ wtan / (wtan @ S @ wtan))                     # betas respecto a la cartera tangente` } }
                ]
            },
            {
                id: 'fuentes', title: 'Fuentes',
                blocks: [
                    { type: 'sources', items: [
                        'Balbás Aparicio, B. Modelos de gestión de carteras: Tema 2 (análisis media–varianza), Tema 3 (CAPM), Tema 4 (APT) y Tema 5 (Black–Litterman), con cuadernos de prácticas. Máster U. en Ciencias Actuariales y Financieras, Universidad de Alcalá.',
                        'Introducción a VBA (Excel). Material del curso, Universidad de Alcalá.',
                        'Markowitz, H. (1952). Portfolio selection. Journal of Finance.',
                        'Fama, E. F. y French, K. R. (1993). Common risk factors in the returns on stocks and bonds. Journal of Financial Economics.',
                        'Black, F. y Litterman, R. (1992). Global portfolio optimization. Financial Analysts Journal.'
                    ] }
                ]
            }
        ]
    },

    // ------------------------------------------------------------------
    fiscalidad: {
        sections: [
            {
                id: 'idea', title: 'Idea clave',
                blocks: [
                    { type: 'p', text: 'La fiscalidad de las operaciones y productos financieros decide cuánto de la rentabilidad bruta llega al inversor. La asignatura estudia dos impuestos principales, el <b>IRPF</b> y el <b>Impuesto sobre Sociedades</b>, y cómo tributan los productos de ahorro, los seguros, los fondos de inversión y los planes de pensiones. El IRPF es un impuesto <b>dual</b>: separa las rentas del trabajo de las del capital, que van a la base del ahorro con tipos propios.' },
                    { type: 'list', title: 'Las nueve lecciones', items: [
                        '<b>1. Marco legal e institucional</b>: sistema financiero español, entidades de crédito y aseguradoras, Administración tributaria y estructura del sistema tributario.',
                        '<b>2. IRPF (I)</b>: operaciones de pasivo (cuentas y depósitos), depósitos especiales y operaciones de activo. Adendas sobre IS, IRNR y patrimonio.',
                        '<b>3. IRPF (II)</b>: deuda pública y privada, y participación en fondos propios (dividendos, acciones). Impuesto sobre transacciones financieras.',
                        '<b>4. Seguros y capitalización</b>: seguros de vida en forma de capital y de renta, Unit Linked, planes individuales de ahorro sistemático (PIAS) y planes de ahorro a largo plazo.',
                        '<b>5. Instituciones de inversión colectiva</b>: socios personas físicas y jurídicas, SICAV y régimen especial.',
                        '<b>6. Planes y fondos de pensiones</b>: tributación de aportaciones, contribuciones y prestaciones.',
                        '<b>7. FATCA, CRS y DAC 6</b>: identificación de clientes e intercambio automático de información.',
                        '<b>8. Entidades de crédito (I)</b>: Impuesto sobre Sociedades, provisiones por insolvencias y riesgo país.',
                        '<b>9. Entidades de crédito y seguros (II)</b>: el IVA.'
                    ] },
                    { type: 'callout', text: 'Los tipos y límites de esta ficha son los de las diapositivas del curso (ejercicio 2025). Cámbialos si la normativa cambia: el esquema de cálculo sigue siendo el mismo.' }
                ]
            },
            {
                id: 'formulas', title: 'Esquemas de cálculo',
                blocks: [
                    { type: 'table', caption: 'Escala de la base imponible del ahorro (ejercicio 2025)', head: ['Tramo de la base del ahorro', 'Tipo'], rows: [
                        ['Hasta 6.000 €', '19 %'],
                        ['De 6.000,01 a 50.000 €', '21 %'],
                        ['De 50.000,01 a 200.000 €', '23 %'],
                        ['De 200.000,01 a 300.000 €', '27 %'],
                        ['Más de 300.000 €', '30 %']
                    ] },
                    { type: 'list', title: 'Reglas que se repiten en el curso', items: [
                        'Los intereses de cuentas y depósitos son rendimientos del capital mobiliario y soportan una <b>retención del 19 %</b> sobre el importe íntegro, sin reducciones.',
                        'Un seguro de capital diferido tributa por <b>rendimiento = capital percibido − primas pagadas</b>. Ejemplo del curso: capital 50.000 €, prima única 44.000 €, rendimiento 6.000 €, cuota $6.000\\times19\\%=1.140$ € y retención de 1.140 €, de modo que no hay nada que ingresar.',
                        'Planes de pensiones: la reducción de la base imponible general tiene como límite la menor de dos cantidades, el <b>30 % de los rendimientos netos</b> del trabajo y de actividades económicas, o <b>1.500 € anuales</b>. Ese límite sube hasta 8.500 € más cuando el incremento proviene de contribuciones empresariales.',
                        'El Impuesto sobre Sociedades deduce los gastos financieros netos hasta el <b>30 % del beneficio operativo</b>, con un mínimo deducible de un millón de euros; el exceso se aprovecha en ejercicios posteriores.'
                    ] }
                ]
            },
            {
                id: 'calculadora', title: 'Calculadora',
                blocks: [
                    { type: 'p', text: 'Aplica la escala de la base del ahorro a los rendimientos del capital mobiliario y a las ganancias patrimoniales, y compara la cuota con las retenciones ya practicadas.' },
                    { type: 'calculator', id: 'base_ahorro' }
                ]
            },
            {
                id: 'codigo', title: 'Código',
                blocks: [
                    { type: 'code', code: {
                        r: `
# Cuota de la base imponible del ahorro con escala por tramos (ejercicio 2025)
limites <- c(0, 6000, 50000, 200000, 300000, Inf)
tipos   <- c(0.19, 0.21, 0.23, 0.27, 0.30)

cuota_ahorro <- function(base) {
  if (base <= 0) return(0)
  sum(pmax(pmin(base, limites[-1]) - limites[-6], 0) * tipos)
}
cuota_ahorro(12000)                         # 6000*0.19 + 6000*0.21 = 2400

# Seguro de capital diferido: rendimiento y cuota
capital <- 50000; primas <- 44000
rend <- capital - primas                    # 6000
c(cuota = cuota_ahorro(rend), retencion = 0.19 * rend)`,
                        python: `
import numpy as np

limites = np.array([0, 6000, 50000, 200000, 300000, np.inf])
tipos = np.array([0.19, 0.21, 0.23, 0.27, 0.30])

def cuota_ahorro(base):
    if base <= 0:
        return 0.0
    tramo = np.clip(base - limites[:-1], 0, np.diff(limites))
    return float((tramo * tipos).sum())

print(cuota_ahorro(12000))                  # 2400
capital, primas = 50000, 44000
rend = capital - primas
print(cuota_ahorro(rend), 0.19 * rend)` } }
                ]
            },
            {
                id: 'fuentes', title: 'Fuentes',
                blocks: [
                    { type: 'sources', items: [
                        'Lagares Gómez-Abascal, J. J. Fiscalidad de las operaciones y productos financieros: Lecciones 1 a 9 y adendas (IS, IRNR, IP, FATCA, CRS, DAC 6). Máster U. en Ciencias Actuariales y Financieras, Universidad de Alcalá.',
                        'Ley 35/2006 del IRPF; Ley 27/2014 del Impuesto sobre Sociedades; Ley 37/1992 del IVA.'
                    ] }
                ]
            }
        ]
    },

    // ------------------------------------------------------------------
    seguridad_social: {
        sections: [
            {
                id: 'idea', title: 'Idea clave',
                blocks: [
                    { type: 'p', text: 'La Seguridad Social es el sistema público que protege a las personas frente a las contingencias que reducen o suprimen sus ingresos: enfermedad, desempleo, invalidez, vejez y muerte. La asignatura combina la <b>técnica</b> (cómo se financian y calculan las prestaciones) con la <b>economía</b> (qué factores sostienen el sistema).' },
                    { type: 'list', title: 'Factores que condicionan el sistema', items: [
                        '<b>Endógenos</b>: extensión del campo de aplicación, cotización (bases y tipos), recaudación, acceso y determinación de las prestaciones, revalorización, gestión y control.',
                        '<b>Exógenos</b>: demografía (natalidad y envejecimiento), flujos migratorios, ocupación y desempleo, estructura del mercado de trabajo, negociación colectiva, PIB, IPC, SMI y mercados financieros.'
                    ] },
                    { type: 'list', title: 'El programa', items: [
                        '<b>Temas 1 y 2</b>: concepto de Seguridad Social, evolución histórica y modelo español, con las tendencias actuales (sistemas mixtos Bismarck–Beveridge, universalización, retraso de la jubilación).',
                        '<b>Tema 3. Prestaciones a corto plazo</b>: incapacidad temporal, nacimiento y cuidado del menor, riesgo durante el embarazo y la lactancia, prestaciones familiares y desempleo. La incapacidad temporal dura hasta 365 días, con prórroga de 180 y, excepcionalmente, otros 180: 725 días.',
                        '<b>Tema 4. Prestaciones a largo plazo</b>: incapacidad permanente, jubilación y muerte y supervivencia.',
                        '<b>Temas 5 y 6</b>: cobertura de los riesgos profesionales y mutuas colaboradoras.',
                        '<b>Temas 7 a 10</b>: organización y gestión de la Seguridad Social.',
                        '<b>AISS</b>: desafíos 2019 y tendencias 2025 (cuidados de larga duración, brechas de cobertura, envejecimiento, economía digital y migrantes).'
                    ] },
                    { type: 'list', title: 'Jubilación contributiva (según las diapositivas)', items: [
                        'La edad ordinaria sube de forma gradual hasta los <b>67 años a partir de 2027</b>. Se mantiene la jubilación a los 65 años con 38 años y 6 meses cotizados en 2027.',
                        'Para alcanzar el <b>100 %</b> de la base reguladora hay que acreditar 37 años cotizados a partir de 2027.',
                        'Incapacidad permanente absoluta: 100 % de la base reguladora. La gran invalidez añade un complemento para disponer de ayuda de tercera persona.'
                    ] },
                    { type: 'callout', text: 'Para practicar: la plataforma de tests de Seguridad Social (64 preguntas, 19 casos jurisprudenciales y 5 ejercicios de cálculo) está en github.com/LuizLuzuriaga/asignaturas. La financiación por reparto frente a capitalización se desarrolla en <b>Previsión social y pensiones</b>.' }
                ]
            },
            {
                id: 'formulas', title: 'Reparto simple',
                blocks: [
                    { type: 'formula', label: 'Ratio de dependencia y cotización de equilibrio', tex: 'd(t)=\\frac{l^{\\text{pasivos}}_t}{l^{\\text{activos}}_t},\\qquad \\text{PAYG}_t=d(t)\\cdot\\beta_t', note: '$\\beta_t$ es la tasa de sustitución (pensión media sobre salario medio).' },
                    { type: 'p', text: 'En reparto, las cotizaciones del año pagan las pensiones del año: el tipo de cotización de equilibrio crece con el envejecimiento ($d$ sube) y con la generosidad de la pensión ($\\beta$ sube). Prueba con la calculadora cómo cambia al bajar el número de activos por pensionista.' },
                    { type: 'calculator', id: 'reparto' }
                ]
            },
            {
                id: 'fuentes', title: 'Fuentes',
                blocks: [
                    { type: 'sources', items: [
                        'Carro Santa-María, L. Economía y técnica de la Seguridad Social, Temas 1 a 10. Máster U. en Ciencias Actuariales y Financieras, Universidad de Alcalá.',
                        'AISS (2019). Desafíos en la Seguridad Social. Asociación Internacional de la Seguridad Social.',
                        'AISS (2025). Desarrollos y tendencias en la Seguridad Social. Asociación Internacional de la Seguridad Social.',
                        'Texto Refundido de la Ley General de la Seguridad Social (LGSS).'
                    ] }
                ]
            }
        ]
    }
});
