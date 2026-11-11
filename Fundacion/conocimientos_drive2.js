/**
 * Gedanken Palast - Segunda tanda del archivo compartido de la promoción (Google Drive, solo lectura): segundo cuatrimestre.
 * Franquicias y garantía máxima (Matemática del seguro no vida), riesgo de suscripción no vida bajo Solvencia II (ERM)
 * y ampliación de Contabilidad (activos no financieros, pasivos financieros, derivados y provisiones).
 * Son resúmenes propios con las ideas y fórmulas de los apuntes; no reproducen el material.
 * Se carga después de conocimientos_drive.js.
 */

Object.assign(CALCULATORS, {
    franquicia_exp: {
        title: 'Franquicia y garantía máxima (siniestralidad exponencial)',
        inputs: [
            { id: 'C', label: 'Coste medio por siniestro $C=E[X]$', value: 1000, step: 50 },
            { id: 'A', label: 'Franquicia absoluta $A$', value: 300, step: 10 },
            { id: 'M', label: 'Garantía máxima $M$', value: 3000, step: 100 }
        ],
        compute(v) {
            const C = Math.max(v.C, 1e-9), A = Math.max(v.A, 0), M = Math.max(v.M, A);
            const CA = C * Math.exp(-A / C);                        // prima del seguro con franquicia A
            const CM = C * (1 - Math.exp(-M / C));                  // prima con garantía máxima M
            const CAM = CM - (C - CA);                              // franquicia A y garantía máxima M
            return {
                outputs: [
                    { label: 'Prima sin límites $C$', value: NUM.fmt(C, 2) },
                    { label: 'Prima con franquicia $C_A=C\\,e^{-A/C}$', value: NUM.fmt(CA, 2) },
                    { label: 'Ahorro de prima por la franquicia', value: NUM.fmt((1 - CA / C) * 100, 2) + ' %' },
                    { label: 'Prima con garantía máxima $C_M=C(1-e^{-M/C})$', value: NUM.fmt(CM, 2) },
                    { label: 'Prima con franquicia y garantía máxima $C_{AM}=C(e^{-A/C}-e^{-M/C})$', value: NUM.fmt(CAM, 2), note: 'Es la prima del contrato que no paga hasta $A$ y paga como máximo $M-A$.' }
                ]
            };
        }
    },
    franquicia_lognormal: {
        title: 'Franquicia absoluta (siniestralidad lognormal)',
        inputs: [
            { id: 'mu', label: 'Parámetro $\\mu$ de $\\ln X$', value: 6, step: 0.1 },
            { id: 'sg', label: 'Parámetro $\\sigma$ de $\\ln X$', value: 1, step: 0.1 },
            { id: 'A', label: 'Franquicia absoluta $A$', value: 300, step: 10 }
        ],
        compute(v) {
            const sg = Math.max(v.sg, 1e-6), A = Math.max(v.A, 1e-9);
            const media = Math.exp(v.mu + sg * sg / 2);
            const d2 = (v.mu - Math.log(A)) / sg, d1 = d2 + sg;
            const CA = media * NUM.cdf(d1) - A * NUM.cdf(d2);       // E[(X-A)+]
            return {
                outputs: [
                    { label: 'Prima sin franquicia $E[X]=e^{\\mu+\\sigma^2/2}$', value: NUM.fmt(media, 2) },
                    { label: 'Prima con franquicia $C_A=E[(X-A)_+]$', value: NUM.fmt(CA, 2) },
                    { label: 'Probabilidad de que el siniestro supere $A$', value: NUM.fmt((1 - NUM.cdf(-d2)) * 100, 2) + ' %' },
                    { label: 'Ahorro de prima por la franquicia', value: NUM.fmt((1 - CA / media) * 100, 2) + ' %' }
                ]
            };
        }
    },
    scr_suscripcion: {
        title: 'SCR de prima y reserva (fórmula estándar, un segmento por riesgo)',
        inputs: [
            { id: 'Vp', label: 'Volumen de prima $V_{prem}$ (primas imputadas, neto de reaseguro)', value: 50000000, step: 1000000 },
            { id: 'sp', label: 'Desviación típica del riesgo de prima $\\sigma_{prem}$', value: 0.10, step: 0.01 },
            { id: 'Vr', label: 'Volumen de reserva $V_{res}$ (provisión de siniestros neta)', value: 80000000, step: 1000000 },
            { id: 'sr', label: 'Desviación típica del riesgo de reserva $\\sigma_{res}$', value: 0.09, step: 0.01 },
            { id: 'rho', label: 'Correlación prima-reserva $\\rho$', value: 0.5, step: 0.1 }
        ],
        compute(v) {
            const Vp = Math.max(v.Vp, 0), Vr = Math.max(v.Vr, 1e-9), V = Vp + Vr, rho = Math.min(Math.max(v.rho, -1), 1);
            const a = v.sp * Vp, b = v.sr * Vr;
            const sigma = Math.sqrt(a * a + 2 * rho * a * b + b * b) / V;      // desviación típica combinada
            const z = 2.5758293035489004;                                      // cuantil 99,5 % de la normal
            const rhoSigma = Math.exp(z * Math.sqrt(Math.log(1 + sigma * sigma))) / Math.sqrt(1 + sigma * sigma) - 1;
            return {
                outputs: [
                    { label: 'Volumen total $V=V_{prem}+V_{res}$', value: NUM.fmt(V, 0) },
                    { label: 'Desviación típica combinada $\\sigma$', value: NUM.fmt(sigma * 100, 3) + ' %' },
                    { label: 'Factor $\\rho(\\sigma)$ (lognormal al 99,5 %)', value: NUM.fmt(rhoSigma * 100, 2) + ' %', note: 'Se aproxima por $3\\sigma$.' },
                    { label: 'SCR de prima y reserva $=\\rho(\\sigma)\\,V$', value: NUM.fmt(rhoSigma * V, 0) },
                    { label: 'Aproximación $3\\sigma V$', value: NUM.fmt(3 * sigma * V, 0) },
                    { label: 'Efecto diversificación prima-reserva', value: NUM.fmt((1 - Math.sqrt(a * a + 2 * rho * a * b + b * b) / (a + b)) * 100, 2) + ' %' }
                ]
            };
        }
    }
});

Object.assign(KNOWLEDGE, {
    franquicias: {
        sections: [
            {
                id: 'idea', title: 'Idea clave',
                blocks: [
                    { type: 'p', text: 'Una <b>franquicia</b> reparte el siniestro entre asegurado y asegurador: el asegurado soporta una parte y la prima baja en consecuencia. Con la siniestralidad $X$ y su prima pura $C=E[X]$, cada modalidad es la esperanza de la parte que paga la compañía.' },
                    { type: 'table', caption: 'Modalidades y lo que paga la compañía', head: ['Modalidad', 'Paga la compañía', 'Prima'], rows: [
                        ['Franquicia absoluta $A$', '$(X-A)_+$: nada hasta $A$ y el exceso', '$C_A=E[(X-A)_+]=\\int_A^\\infty (1-F(x))\\,dx$'],
                        ['Garantía máxima $M$', '$\\min(X,M)$: todo hasta $M$', '$C_M=C-C_M^{exc}=E[\\min(X,M)]$'],
                        ['Franquicia $A$ y garantía máxima $M$', '$\\min(X,M)-\\min(X,A)$', '$C_{AM}=C_M-(C-C_A)$'],
                        ['Autoparticipación $r$', 'el porcentaje $r$ de cada siniestro', '$rC$'],
                        ['Mixtura de franquicias', 'el asegurado paga $x$ si $x<A$, $\\alpha(x-A)$ hasta el techo $L$ y $L$ por encima', 'se obtiene por tramos']
                    ] },
                    { type: 'callout', title: 'Relación útil', text: 'La garantía máxima es el complemento de la franquicia: $C_M=C-C_A$ evaluado en $A=M$. Por eso una sola fórmula para $C_A$ resuelve las tres primeras filas.' }
                ]
            },
            {
                id: 'distribuciones', title: 'Exponencial y lognormal',
                blocks: [
                    { type: 'formula', tex: 'X\\sim\\text{Exp}(1/C):\\quad C_A=C\\,e^{-A/C},\\qquad C_M=C\\left(1-e^{-M/C}\\right),\\qquad C_{AM}=C\\left(e^{-A/C}-e^{-M/C}\\right)' },
                    { type: 'formula', tex: '\\ln X\\sim N(\\mu,\\sigma^2):\\quad C_A=e^{\\mu+\\sigma^2/2}\\,\\Phi(d_1)-A\\,\\Phi(d_2),\\quad d_2=\\frac{\\mu-\\ln A}{\\sigma},\\; d_1=d_2+\\sigma' },
                    { type: 'p', text: 'Con la exponencial la franquicia ahorra el mismo porcentaje de prima, $1-e^{-A/C}$, sea cual sea el nivel de $C$ (pérdida de memoria). La expresión lognormal tiene la misma forma que la fórmula de Black-Scholes para una opción de compra: la franquicia es una <i>call</i> sobre el siniestro con precio de ejercicio $A$.' },
                    { type: 'calculator', id: 'franquicia_exp' },
                    { type: 'calculator', id: 'franquicia_lognormal' }
                ]
            },
            {
                id: 'codigo', title: 'Código',
                blocks: [
                    { type: 'code', title: 'Prima con franquicia y garantía máxima', code: {
                        r: `
C <- 1000; A <- 300; M <- 3000                       # siniestralidad exponencial de media C
CA  <- C * exp(-A / C)                               # prima con franquicia A
CM  <- C * (1 - exp(-M / C))                         # prima con garantía máxima M
CAM <- CM - (C - CA)                                 # franquicia A y garantía máxima M
c(CA = CA, CM = CM, CAM = CAM)

# Comprobación por simulación
set.seed(1); x <- rexp(1e6, 1 / C)
c(mean(pmax(x - A, 0)), mean(pmin(x, M)), mean(pmin(x, M) - pmin(x, A)))

# Lognormal: franquicia absoluta A
mu <- 6; sg <- 1
d2 <- (mu - log(A)) / sg; d1 <- d2 + sg
exp(mu + sg^2 / 2) * pnorm(d1) - A * pnorm(d2)`,
                        python: `
import numpy as np
from scipy.stats import norm

C, A, M = 1000, 300, 3000                            # siniestralidad exponencial de media C
CA = C * np.exp(-A / C)                              # prima con franquicia A
CM = C * (1 - np.exp(-M / C))                        # prima con garantía máxima M
CAM = CM - (C - CA)                                  # franquicia A y garantía máxima M
print(CA, CM, CAM)

# Comprobación por simulación
rng = np.random.default_rng(1)
x = rng.exponential(C, 1_000_000)
print(np.mean(np.maximum(x - A, 0)), np.mean(np.minimum(x, M)), np.mean(np.minimum(x, M) - np.minimum(x, A)))

# Lognormal: franquicia absoluta A
mu, sg = 6, 1
d2 = (mu - np.log(A)) / sg
d1 = d2 + sg
print(np.exp(mu + sg**2 / 2) * norm.cdf(d1) - A * norm.cdf(d2))` } }
                ]
            },
            {
                id: 'fuentes', title: 'Fuentes',
                blocks: [
                    { type: 'sources', items: [
                        'Matemática del seguro no vida, tema 4 (franquicias y garantía máxima). Máster U. en Ciencias Actuariales y Financieras, Universidad de Alcalá. Resumen propio de los apuntes del archivo compartido de la promoción.'
                    ] }
                ]
            }
        ]
    },

    // ------------------------------------------------------------------
    riesgo_suscripcion: {
        sections: [
            {
                id: 'idea', title: 'Idea clave',
                blocks: [
                    { type: 'p', text: 'En Solvencia II el riesgo de <b>suscripción no vida</b> es la pérdida que puede sufrir la aseguradora porque las primas o las reservas resulten insuficientes, o por un suceso catastrófico, en un horizonte de 12 meses. Se mide con el capital de solvencia obligatorio (SCR) a un nivel de confianza del 99,5 %.' },
                    { type: 'table', caption: 'Los tres componentes', head: ['Riesgo', 'Qué es', 'Causas'], rows: [
                        ['Prima', 'La prima imputada del año no basta para los siniestros del periodo de cobertura más los gastos.', 'Desviaciones en siniestros, en gastos o en la prima media.'],
                        ['Reserva', 'La reserva dotada no basta para los siniestros ya ocurridos (declarados o no) hasta su liquidación total.', 'Siniestros tardíos (IBNYR), cambios en los ya conocidos (IBNER) y reaperturas de siniestros cerrados.'],
                        ['Catastrófico', 'Evento natural o humano que afecta a la vez a varios riesgos o líneas.', 'Terremoto, inundación, granizo, tormenta, hundimiento; accidentes humanos; reaseguro no proporcional.']
                    ] },
                    { type: 'p', text: 'La compañía puede calcular el SCR con la <b>fórmula estándar</b>, con la fórmula estándar con parámetros específicos de la empresa, con un <b>modelo interno parcial</b> o con un modelo interno completo. La estándar es sencilla y barata; el modelo interno mide el riesgo con la experiencia propia y permite evaluar la eficacia de los mitigadores.' }
                ]
            },
            {
                id: 'formula', title: 'Fórmula estándar',
                blocks: [
                    { type: 'formula', tex: 'V=V_{prem}+V_{res},\\qquad \\sigma=\\frac{\\sqrt{\\sigma_{prem}^2V_{prem}^2+2\\rho\\,\\sigma_{prem}V_{prem}\\sigma_{res}V_{res}+\\sigma_{res}^2V_{res}^2}}{V}' },
                    { type: 'formula', tex: '\\text{SCR}_{prem,res}=\\rho(\\sigma)\\,V,\\qquad \\rho(\\sigma)=\\frac{\\exp\\left(N_{0{,}995}\\sqrt{\\ln(\\sigma^2+1)}\\right)}{\\sqrt{\\sigma^2+1}}-1\\approx 3\\sigma' },
                    { type: 'p', text: 'El volumen de la reserva es la provisión de siniestros bajo Solvencia II, neta de reaseguro; el de la prima son las primas imputadas. Con varios segmentos (líneas de negocio) la desviación combinada se calcula con una matriz de correlaciones entre ellos.' },
                    { type: 'calculator', id: 'scr_suscripcion' }
                ]
            },
            {
                id: 'catastrofes', title: 'Riesgo catastrófico',
                blocks: [
                    { type: 'list', title: 'Subtipos en la fórmula estándar', items: [
                        '<b>Naturales</b>: granizo, tormenta, hundimiento, inundación y terremoto. Para España la fórmula estándar considera solo granizo y tormenta (cabe preguntarse si se tiene en cuenta el efecto mitigador del Consorcio de Compensación de Seguros).',
                        '<b>Provocadas por el hombre</b>: responsabilidad civil de automóviles, marítimo, aviación, incendio, responsabilidad civil general y crédito y caución.',
                        '<b>Reaseguro no proporcional</b> de daños a los bienes, y <b>otras</b> catástrofes.'
                    ] },
                    { type: 'formula', tex: '\\text{SCR}_{NatCat}=\\sqrt{\\sum_{i,j}\\text{Corr}_{ij}\\,\\text{SCR}_i\\,\\text{SCR}_j}' },
                    { type: 'p', text: 'Cada peligro natural se calcula con parámetros de pérdida y correlaciones entre zonas geográficas que fija EIOPA, aplicados a las sumas aseguradas por zona. En automóviles el SCR catastrófico parte de un importe mínimo regulatorio de pérdida de 6.000.000 €.' }
                ]
            },
            {
                id: 'reserva', title: 'Estimar la reserva',
                blocks: [
                    { type: 'p', text: 'El riesgo de reserva exige una estimación central de las provisiones. Las técnicas deterministas más comunes son el <i>chain ladder</i> (sobre siniestros incurridos, pagados o sobre coste medio y número de siniestros), Bornhuetter-Ferguson y el ratio de siniestralidad esperado; entre las demás figuran Munich chain ladder, los modelos lineales generalizados, Berquist-Sherman y Cape Cod. Las bases son el triángulo de pagos y el de incurridos (pagos más reservas caso a caso).' },
                    { type: 'code', title: 'SCR de prima y reserva', code: {
                        r: `
Vp <- 50e6; sp <- 0.10; Vr <- 80e6; sr <- 0.09; rho <- 0.5
V <- Vp + Vr
sigma <- sqrt((sp * Vp)^2 + 2 * rho * sp * Vp * sr * Vr + (sr * Vr)^2) / V   # desviación combinada
z <- qnorm(0.995)
rs <- exp(z * sqrt(log(1 + sigma^2))) / sqrt(1 + sigma^2) - 1
c(sigma = sigma, rho_sigma = rs, SCR = rs * V, aprox_3sigma = 3 * sigma * V)`,
                        python: `
import numpy as np
from scipy.stats import norm

Vp, sp, Vr, sr, rho = 50e6, 0.10, 80e6, 0.09, 0.5
V = Vp + Vr
sigma = np.sqrt((sp * Vp) ** 2 + 2 * rho * sp * Vp * sr * Vr + (sr * Vr) ** 2) / V   # desviación combinada
z = norm.ppf(0.995)
rs = np.exp(z * np.sqrt(np.log(1 + sigma**2))) / np.sqrt(1 + sigma**2) - 1
print(sigma, rs, rs * V, 3 * sigma * V)` } }
                ]
            },
            {
                id: 'fuentes', title: 'Fuentes',
                blocks: [
                    { type: 'sources', items: [
                        'Juaristi, A. Riesgo de prima y de reserva en el contexto de Solvencia II (sesión de ERM, abril 2023). Máster U. en Ciencias Actuariales y Financieras, Universidad de Alcalá. Resumen propio de la presentación del archivo compartido.',
                        'Directiva 2009/138/CE (Solvencia II) y Reglamento Delegado (UE) 2015/35, que fijan los parámetros de la fórmula estándar.'
                    ] }
                ]
            }
        ]
    }
});

// Ampliación de Contabilidad con los apuntes de activos no financieros, pasivos, derivados y provisiones
(function () {
    const k = KNOWLEDGE.contabilidad_pgc;
    if (!k || k.sections.some(s => s.id === 'otras_partidas')) return;
    const i = k.sections.findIndex(s => s.id === 'instrumentos');
    k.sections.splice(i + 1, 0, {
        id: 'otras_partidas', title: 'Otras partidas',
        blocks: [
            { type: 'list', title: 'Activos no financieros (inmovilizado material)', items: [
                'Clases: uso propio, cedidos en arrendamiento operativo, inversión inmobiliaria, existencias y disponibles para la venta.',
                '<b>Valoración inicial</b> al coste de adquisición (con el IVA no deducible). Los intereses no forman parte del valor del activo.',
                '<b>Valoración posterior</b>: coste menos amortización acumulada menos deterioro. No hay revalorización: el activo no puede valer más que su coste, y una variación del precio de mercado solo corrige un deterioro anterior en pérdidas y ganancias.',
                'Cuando pasa a disponible para la venta deja de amortizarse. Los costes de venta se actualizan si la venta se espera dentro de más de un año.',
                '<b>Deterioro</b> si el valor contable (coste menos amortización acumulada) supera el <b>importe recuperable</b>, que es el mayor entre el valor razonable y el valor de uso (este último también se actualiza).'
            ] },
            { type: 'list', title: 'Pasivos financieros y derivados', items: [
                'Un pasivo financiero (por ejemplo, un préstamo recibido) se mide a <b>coste amortizado</b>, salvo derivados, posiciones cortas y títulos emitidos para recomprarlos, que van a valor razonable con cambios en pérdidas y ganancias.',
                'Adquisición temporal de activos: te prestan títulos, los vendes y los recompras para devolverlos. Cesión temporal: vendes títulos con la promesa de recomprarlos más tarde a otro precio.',
                '<b>Derivado simétrico</b> (futuros y <i>swaps</i>): no vale nada en el momento inicial y después se valora a valor razonable con cambios en pérdidas y ganancias.',
                '<b>Derivado asimétrico</b> (opciones): la prima es un activo si genera un derecho y un pasivo si genera una obligación, y se registra aparte del cambio de valor en pérdidas y ganancias.'
            ] },
            { type: 'list', title: 'Renta variable y acciones propias', items: [
                'Reconocimiento inicial y valoración posterior a valor razonable. Si se anunció un dividendo antes de la compra, se descuenta del valor razonable.',
                'No hay deterioro salvo participaciones significativas. Con cambios en pérdidas y ganancias, los gastos de transacción van a su propia cuenta y solo el dividendo anunciado (no el pagado) se registra en resultados; con cambios en patrimonio neto, los gastos suman al precio.',
                'La compra de <b>acciones propias</b> es una variación de capital: se valora al coste, no genera beneficio ni pérdida y sus gastos tienen como contrapartida la reserva.'
            ] },
            { type: 'list', title: 'Provisiones técnicas del seguro', items: [
                'La <b>provisión para primas no consumidas</b> es un pasivo: la parte de la prima ya cobrada que corresponde a periodos posteriores al cierre.',
                'Si el riesgo en curso resulta mayor, se incrementa con la <b>provisión por riesgo en curso</b>; si no, se deja igual.',
                'En la cuenta de resultados, la prima es un ingreso y el incremento de la provisión es un gasto.'
            ] }
        ]
    });
    const f = k.sections.find(s => s.id === 'fuentes');
    if (f) f.blocks[0].items.push('Contabilidad (Máster U. en Ciencias Actuariales y Financieras): resúmenes de activos no financieros, pasivos financieros, derivados, renta variable y provisiones del archivo compartido de la promoción.');
})();
