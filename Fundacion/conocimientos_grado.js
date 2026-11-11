/**
 * Gedanken Palast - Temarios del Grado en Economía (Universidad de Alcalá)
 * Se carga después de conocimientos_mucaf.js (usa NUM, CALCULATORS y KNOWLEDGE).
 */

Object.assign(CALCULATORS, {
    // --- TFG: de un coeficiente semilogarítmico a una brecha en euros ----
    brecha_tfg: {
        title: 'De un coeficiente $\\hat\\beta$ a una brecha de renta',
        inputs: [
            { id: 'beta', label: 'Coeficiente de la dummy de mujer $\\hat\\beta$', value: -0.113, step: 0.01 },
            { id: 'se', label: 'Error estándar', value: 0.0278, step: 0.001 },
            { id: 'renta', label: 'Renta equivalente de un hogar con cabeza de familia hombre (€)', value: 28000, step: 1000 }
        ],
        compute(v) {
            const b = v.beta, se = Math.max(v.se, 1e-9);
            const pct = Math.exp(b) - 1;
            const lo = Math.exp(b - 1.96 * se) - 1, hi = Math.exp(b + 1.96 * se) - 1;
            const t = b / se;
            return {
                outputs: [
                    { label: 'Diferencia aproximada $100\\hat\\beta$', value: NUM.fmt(100 * b, 1) + ' %', note: 'Es la lectura rápida de un modelo log-lineal.' },
                    { label: 'Diferencia exacta $100\\,(e^{\\hat\\beta}-1)$', value: NUM.fmt(100 * pct, 2) + ' %' },
                    { label: 'Intervalo al 95 %', value: NUM.fmt(100 * lo, 1) + ' % a ' + NUM.fmt(100 * hi, 1) + ' %' },
                    { label: 'Estadístico $t=\\hat\\beta/\\mathrm{ee}$', value: NUM.fmt(t, 2), note: Math.abs(t) > 1.96 ? 'Significativo al 5 %.' : 'No significativo al 5 %.' },
                    { label: 'Renta esperada con cabeza de familia mujer', value: NUM.fmt(v.renta * (1 + pct), 0) + ' €', note: 'Brecha de ' + NUM.fmt(v.renta * pct, 0) + ' € al año.' }
                ]
            };
        }
    },

    // --- Política fiscal: multiplicadores keynesianos ---------------------
    multiplicadores: {
        title: 'Multiplicadores de la política fiscal keynesiana',
        inputs: [
            { id: 'c', label: 'Propensión marginal a consumir $c$', value: 0.8, step: 0.05 },
            { id: 'dG', label: 'Variación del gasto público $\\Delta G$ (millones €)', value: 100, step: 10 },
            { id: 'dT', label: 'Variación de los impuestos $\\Delta T$ (millones €)', value: 100, step: 10 },
            { id: 'dR', label: 'Variación de las transferencias $\\Delta R$ (millones €)', value: 100, step: 10 }
        ],
        compute(v) {
            const c = Math.min(0.99, Math.max(0, v.c));
            const kG = 1 / (1 - c), kT = -c / (1 - c), kR = c / (1 - c);
            return {
                outputs: [
                    { label: 'Multiplicador del gasto $K_G=1/(1-c)$', value: NUM.fmt(kG, 3), note: 'Efecto sobre la renta: ' + NUM.fmt(kG * v.dG, 1) + ' millones.' },
                    { label: 'Multiplicador de los impuestos $K_T=-c/(1-c)$', value: NUM.fmt(kT, 3), note: 'Efecto: ' + NUM.fmt(kT * v.dT, 1) + ' millones.' },
                    { label: 'Multiplicador de las transferencias $K_R=c/(1-c)$', value: NUM.fmt(kR, 3), note: 'Efecto: ' + NUM.fmt(kR * v.dR, 1) + ' millones.' },
                    { label: 'Presupuesto equilibrado $K_G+K_T$', value: NUM.fmt(kG + kT, 3), note: 'Subir $G$ y $T$ en la misma cuantía aumenta la renta en esa cuantía (teorema de Haavelmo).' }
                ]
            };
        }
    },

    // --- Estadística: intervalo y contraste para la media (σ conocida) ----
    z_media: {
        title: 'Media de una población normal con $\\sigma$ conocida',
        inputs: [
            { id: 'xbar', label: 'Media muestral $\\bar x$', value: 52, step: 0.5 },
            { id: 'mu0', label: 'Valor de $H_0$: $\\mu_0$', value: 50, step: 0.5 },
            { id: 'sigma', label: 'Desviación típica poblacional $\\sigma$', value: 8, step: 0.5 },
            { id: 'n', label: 'Tamaño muestral $n$', value: 64, step: 4 },
            { id: 'alpha', label: 'Nivel de significación $\\alpha$ (%)', value: 5, step: 1 },
            { id: 'E', label: 'Error máximo deseado $E$ (para el tamaño muestral)', value: 1, step: 0.25 }
        ],
        compute(v) {
            const n = Math.max(1, v.n), s = Math.max(v.sigma, 1e-9), a = Math.min(0.5, Math.max(0.001, v.alpha / 100));
            const se = s / Math.sqrt(n), z = (v.xbar - v.mu0) / se;
            const zc = NUM.inv(1 - a / 2);
            const p = 2 * (1 - NUM.cdf(Math.abs(z)));
            const nE = Math.pow(zc * s / Math.max(v.E, 1e-9), 2);
            return {
                outputs: [
                    { label: 'Intervalo de confianza al ' + NUM.fmt((1 - a) * 100, 1) + ' %', value: NUM.fmt(v.xbar - zc * se, 3) + ' a ' + NUM.fmt(v.xbar + zc * se, 3), note: '$\\bar x\\pm z_{\\alpha/2}\\,\\sigma/\\sqrt n$ con $z_{\\alpha/2}=' + NUM.fmt(zc, 3) + '$' },
                    { label: 'Estadístico de contraste $z=(\\bar x-\\mu_0)/(\\sigma/\\sqrt n)$', value: NUM.fmt(z, 3) },
                    { label: 'p-valor (bilateral)', value: NUM.fmt(p, 4), note: p < a ? 'Se rechaza $H_0$ al nivel $\\alpha$.' : 'No se rechaza $H_0$ al nivel $\\alpha$.' },
                    { label: 'Tamaño muestral para el error $E$: $n=(z_{\\alpha/2}\\sigma/E)^2$', value: NUM.fmt(Math.ceil(nE), 0) }
                ]
            };
        }
    },

    // --- Matemáticas financieras: capitalización simple y compuesta -----
    capitalizacion: {
        title: 'Capitalización simple frente a compuesta',
        inputs: [
            { id: 'C0', label: 'Capital inicial $C_0$ (€)', value: 1000, step: 100 },
            { id: 'i', label: 'Tanto anual $i$ (%)', value: 12, step: 0.5 },
            { id: 'n', label: 'Duración $n$ (años)', value: 1.5, step: 0.25 }
        ],
        compute(v) {
            const C0 = v.C0, i = v.i / 100, n = v.n;
            const simple = C0 * (1 + i * n), compuesto = C0 * Math.pow(1 + i, n);
            const im = i / 12, imComp = Math.pow(1 + i, 1 / 12) - 1;
            return {
                outputs: [
                    { label: 'Montante simple $C_0(1+i\\,n)$', value: NUM.fmt(simple, 2) + ' €' },
                    { label: 'Montante compuesto $C_0(1+i)^n$', value: NUM.fmt(compuesto, 2) + ' €' },
                    { label: 'Intereses simple · compuesto', value: NUM.fmt(simple - C0, 2) + ' €  ·  ' + NUM.fmt(compuesto - C0, 2) + ' €' },
                    { label: 'Tanto mensual equivalente (simple: proporcional)', value: NUM.fmt(im * 100, 4) + ' %', note: 'En compuesta el equivalente es $(1+i)^{1/12}-1=' + NUM.fmt(imComp * 100, 4) + '\\,\\%$.' }
                ]
            };
        }
    }
});

Object.assign(KNOWLEDGE, {

    // ------------------------------------------------------------------
    tfg_brecha: {
        sections: [
            {
                id: 'idea', title: 'La pregunta',
                blocks: [
                    { type: 'p', text: '<b>Trabajo de Fin de Grado</b> de Luiz Alberto Luzuriaga Izquierdo (Grado en Economía, Universidad de Alcalá, junio de 2025; tutora: Cristina Suárez Gálvez): <i>El impacto del sexo del cabeza de familia en las rentas del hogar. El caso español para 2021</i>. La pregunta es si un hogar cuyo principal sustentador es una mujer recibe, a igualdad de características observables, menos renta que uno encabezado por un hombre, y en qué punto de la distribución de la renta y de la vida laboral se produce esa brecha.' },
                    { type: 'list', title: 'Hipótesis de partida', items: [
                        '<b>Penalización por sexo</b>: los hogares liderados por mujeres (<i>breadwinner</i> femenino) obtienen una renta total inferior.',
                        '<b>Aversión al riesgo financiero</b> (finanzas conductuales, Fisher y Yao, 2017): las mujeres cabeza de familia invierten de forma más prudente, lo que reduce las rentas del capital.',
                        '<b>Poder de negociación intrafamiliar</b> (<i>bargaining</i>, Sen, 1987): quien más influye en la negociación del hogar condiciona las decisiones económicas colectivas, incluidas las de inversión.',
                        '<b>Heterogeneidad</b> (Goldin, 2014): la brecha no es igual en todos los niveles de renta ni a todas las edades; se intensifica en los tramos altos y en los años de mayor actividad laboral.'
                    ] },
                    { type: 'callout', text: 'Por eso el trabajo no se queda en la media: combina una regresión por mínimos cuadrados ponderados con <b>regresiones cuantílicas por decil</b> y gráficos por edad, además de un segundo modelo para las <b>rentas financieras</b>.' }
                ]
            },
            {
                id: 'datos', title: 'Datos y variables',
                blocks: [
                    { type: 'p', text: 'Microdatos de la <b>Encuesta Financiera de las Familias (EFF)</b> del Banco de España, octava ola (entrevistas 2022–2023; las rentas se refieren a 2021). La muestra sobrerrepresenta a los hogares con mucho patrimonio, y se corrige con los <b>factores de ponderación</b> de la encuesta, de modo que los resultados representan a los hogares españoles. Las variables más sensibles tienen <b>imputación múltiple</b> (hasta cinco valores por dato ausente).' },
                    { type: 'list', title: 'Construcción de la variable de renta', items: [
                        'Renta bruta total del hogar (<code>renthog</code>): suma de rentas laborales y no laborales de todos los miembros de 16 o más años, antes de impuestos y cotizaciones.',
                        'Se pasa a <b>renta real equivalente</b> a precios de 2021 con la <b>escala de la OCDE modificada</b>: 1 para el primer adulto, 0,5 por cada adulto adicional y 0,3 por cada menor de 14 años.',
                        'Se toma el <b>logaritmo natural</b> para reducir la asimetría de la distribución: <code>lrhocde</code>.'
                    ] },
                    { type: 'table', caption: 'Muestra: $N=6.385$ hogares', head: ['Variable', 'Descripción', 'Valor en la muestra'], rows: [
                        ['renthog', 'Renta total del hogar', 'media 60.647 €, desv. típica 117.485 €'],
                        ['rentfi', 'Rentas financieras del hogar', 'media 10.225 €, desv. típica 71.671 €'],
                        ['dsexo', 'Sexo del cabeza de familia (1 = mujer)', '42,69 % mujeres'],
                        ['neducdom', 'Nivel educativo', '31,7 % básico · 18,6 % medio · 49,7 % superior'],
                        ['sitlaboral', 'Situación laboral', '34,4 % ajena · 11,0 % propia · 28,4 % jubilado · 14,3 % inactivo · 12,0 % labores del hogar'],
                        ['prop', 'Vivienda en propiedad', '22,7 %'],
                        ['tipohog', 'Tipo de hogar', '21,9 % unipersonal · 27,1 % pareja sin hijos · 28,9 % pareja con hijos · 7,4 % monoparental'],
                        ['tienefin', 'Posee activos financieros', '59,6 %']
                    ] }
                ]
            },
            {
                id: 'metodo', title: 'Método',
                blocks: [
                    { type: 'formula', label: 'Modelo 1: mínimos cuadrados ponderados (WLS)', tex: '\\ln(\\text{renta}_i)=\\beta_0+\\beta_1\\,\\text{Mujer}_i+X_i^\\top\\gamma+\\varepsilon_i', note: 'WLS es MCO usando los pesos transversales de la EFF. $X_i$ recoge los controles del cabeza de familia (educación, edad y edad al cuadrado, situación laboral, ocupación CNO-11 y horas de trabajo) y del hogar (menores, vivienda en propiedad, tipo de hogar y si tiene activos financieros).' },
                    { type: 'formula', label: 'Modelo 2: regresión cuantílica simultánea', tex: 'Q_q\\big(\\ln\\text{renta}_i\\mid\\text{Mujer}_i,X_i\\big)=\\beta_{0q}+\\beta_{1q}\\,\\text{Mujer}_i+X_i^\\top\\gamma_q,\\qquad q=0{,}1,\\dots,0{,}9', note: 'Estima el efecto en cada decil, no solo en la media. Con menos observaciones por regresión se usan <b>errores estándar bootstrap</b> con 400 repeticiones (en Stata, <code>sqreg</code>).' },
                    { type: 'formula', label: 'Modelo 3: rentas financieras', tex: '\\ln(\\text{rentas financieras}_i)=\\delta_0+\\delta_1\\,\\text{Mujer}_i+X_i^\\top\\theta+u_i' },
                    { type: 'list', title: 'Por qué estas elecciones', items: [
                        '<b>Logaritmo</b>: el coeficiente de una dummy se lee como diferencia porcentual aproximada entre hogares.',
                        '<b>Modelos anidados</b>: se añaden controles por pasos (sin controles, controles del hogar, del individuo y todos) para ver cuánto de la brecha se explica por características observables.',
                        '<b>Cuantiles</b>: la media puede esconder que el efecto es más fuerte en rentas altas.',
                        '<b>Pesos y bootstrap</b>: los pesos corrigen la sobrerrepresentación de patrimonios altos; el bootstrap evita depender de supuestos sobre la distribución de los residuos.'
                    ] }
                ]
            },
            {
                id: 'resultados', title: 'Resultados',
                blocks: [
                    { type: 'table', caption: 'Efecto de ser mujer cabeza de familia sobre $\\ln$ de la renta (WLS, errores robustos)', head: ['Modelo', 'Coeficiente', '$R^2$'], rows: [
                        ['(1) Sin controles', '−0,313***', '3,4 %'],
                        ['(2) Controles del hogar', '−0,216***', '15,6 %'],
                        ['(3) Controles del individuo', '−0,161***', '23,9 %'],
                        ['(4) Todos los controles', '−0,113***', '29,1 %']
                    ] },
                    { type: 'p', text: 'A medida que se añaden controles el coeficiente se reduce de $-0{,}313$ a $-0{,}113$, pero sigue siendo significativo: <b>persiste un efecto residual</b> atribuible al sexo del cabeza de familia. En media, un hogar encabezado por una mujer tiene una renta equivalente en torno a un 11 % inferior (con la transformación exacta, $e^{-0{,}113}-1\\approx-10{,}7\\,\\%$).' },
                    { type: 'table', caption: 'Regresión cuantílica por deciles: coeficiente de la dummy de mujer', head: ['Decil', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9'], rows: [
                        ['Coef.', '0,001', '−0,063', '−0,052', '−0,060', '−0,079', '−0,098', '−0,119', '−0,113', '−0,101']
                    ] },
                    { type: 'list', title: 'Lectura de los deciles', items: [
                        'En el <b>decil 1</b> no hay diferencia significativa: en las rentas más bajas el sexo del cabeza de familia no añade brecha.',
                        'Desde el decil 2 la brecha es negativa y <b>crece</b> hasta los deciles 7 y 8, con $-0{,}119$ y $-0{,}113$.',
                        'La brecha se amplía en las rentas altas, donde pesan más la educación superior y las ocupaciones más cualificadas (dirección de empresas y administraciones públicas, técnicos y profesionales científicos e intelectuales, técnicos y profesionales de apoyo).'
                    ] },
                    { type: 'p', text: '<b>Rentas financieras.</b> El coeficiente de la dummy de mujer sobre el logaritmo de las rentas financieras es $-0{,}639$ sin controles y <b>$-0{,}327$</b> con todos los controles (significativo; $R^2=0{,}121$, $N=6.385$). Es coherente con la hipótesis de una menor exposición a activos de riesgo.' },
                    { type: 'p', text: '<b>Ciclo vital.</b> En el gráfico por edad la brecha aumenta durante los años de mayor actividad laboral y disminuye después. El trabajo la relaciona con la <b>penalización por maternidad</b> y con las trayectorias laborales interrumpidas por cuidados (Hupkau y Contreras, 2025), con pérdida de experiencia, de ascensos y de beneficios ligados a la antigüedad.' }
                ]
            },
            {
                id: 'calculadora', title: 'Calculadora',
                blocks: [
                    { type: 'p', text: 'Traduce un coeficiente de un modelo log-lineal a porcentaje, intervalo de confianza y euros. Con los valores por defecto reproduce el resultado principal del TFG.' },
                    { type: 'calculator', id: 'brecha_tfg' }
                ]
            },
            {
                id: 'conclusiones', title: 'Conclusiones',
                blocks: [
                    { type: 'list', title: 'Qué se concluye', items: [
                        'Incluso tras controlar por educación, ocupación, tipo de hogar y edad, existe una brecha negativa y significativa en la renta de los hogares con cabeza de familia mujer (en torno al 11 % en media).',
                        'La brecha <b>no es uniforme</b>: es nula en el decil más bajo y mayor en los deciles altos, ligada a las ocupaciones más cualificadas.',
                        'Sigue una forma de <b>ciclo vital</b>: crece entre los 18 y los 54 años aproximadamente.',
                        'Las rentas financieras son menores en los hogares liderados por mujeres, lo que apunta a diferencias de exposición al riesgo y al reparto del poder de decisión.',
                        'La desigualdad de renta familiar necesita una mirada estructural que combine políticas laborales, fiscales y de corresponsabilidad.'
                    ] },
                    { type: 'callout', text: 'Límites: el diseño es observacional y transversal, así que los coeficientes miden asociaciones condicionadas por los controles, no efectos causales; la renta se refiere a un solo año; y la <b>causa</b> de la brecha (discriminación, elecciones, cuidados) no se identifica por separado.' }
                ]
            },
            {
                id: 'codigo', title: 'Código',
                blocks: [
                    { type: 'code', code: {
                        Stata: `
* Modelo 1: MCO ponderado con la renta equivalente en logaritmos
regress lrhocde dsexo c.edad##c.edad i.neducdom i.occup i.sitlaboral horsem ///
        minors i.prop i.tipohog i.tienefin [pweight = peso], vce(robust)

* Modelo 2: regresion cuantilica simultanea por deciles, bootstrap con 400 repeticiones
sqreg lrhocde dsexo c.edad##c.edad i.neducdom i.occup i.sitlaboral horsem ///
      minors i.prop i.tipohog i.tienefin, q(.1 .2 .3 .4 .5 .6 .7 .8 .9) reps(400)

* Modelo 3: rentas financieras
regress lrfin dsexo c.edad##c.edad i.neducdom i.occup i.sitlaboral horsem ///
        minors i.prop i.tipohog i.tienefin [pweight = peso], vce(robust)`,
                        r: `
library(quantreg)
# Datos: data frame 'eff' con las variables del TFG y el factor de ponderacion 'peso'
f <- lrhocde ~ dsexo + edad + I(edad^2) + factor(neducdom) + factor(occup) +
     factor(sitlaboral) + horsem + minors + factor(prop) + factor(tipohog) + factor(tienefin)

m1 <- lm(f, data = eff, weights = peso)            # WLS
summary(m1)$coefficients["dsexo", ]
exp(coef(m1)["dsexo"]) - 1                          # diferencia porcentual exacta

taus <- seq(0.1, 0.9, 0.1)
m2 <- rq(f, tau = taus, data = eff)                 # un modelo por decil
sm <- summary(m2, se = "boot", R = 400)
sapply(sm, function(s) s$coefficients["dsexo", 1])  # coeficiente de dsexo por decil`,
                        python: `
import numpy as np
import statsmodels.formula.api as smf

# Datos: DataFrame 'eff' con las variables del TFG y el peso muestral 'peso'
f = ("lrhocde ~ dsexo + edad + I(edad**2) + C(neducdom) + C(occup) + C(sitlaboral)"
     " + horsem + minors + C(prop) + C(tipohog) + C(tienefin)")

m1 = smf.wls(f, data=eff, weights=eff["peso"]).fit(cov_type="HC1")
b = m1.params["dsexo"]; print(b, np.exp(b) - 1)

coef = {}
for q in np.arange(0.1, 1.0, 0.1):
    coef[round(q, 1)] = smf.quantreg(f, eff).fit(q=q).params["dsexo"]
print(coef)` } }
                ]
            },
            {
                id: 'fuentes', title: 'Fuentes',
                blocks: [
                    { type: 'sources', items: [
                        'Luzuriaga Izquierdo, L. A. (2025). El impacto del sexo del cabeza de familia en las rentas del hogar. El caso español para 2021. Trabajo de Fin de Grado, Grado en Economía, Universidad de Alcalá. Tutora: Cristina Suárez Gálvez.',
                        'Banco de España (2024). Encuesta Financiera de las Familias (EFF), ola 2022.',
                        'Goldin, C. (2014). A grand gender convergence: its last chapter. American Economic Review. Goldin, C. (2015). How to achieve gender equality. Milken Institute Review.',
                        'Fisher, P. J. y Yao, R. (2017). Gender differences in financial risk tolerance. Journal of Economic Psychology.',
                        'Sen, A. (1987). Gender and cooperative conflicts. Teoría de la negociación intrafamiliar (bargaining).',
                        'Hupkau, C. y Contreras, J. (2025). Reducir la brecha salarial de género: políticas para la igualdad retributiva en España.'
                    ] }
                ]
            }
        ]
    },

    // ------------------------------------------------------------------
    politica_fiscal: {
        sections: [
            {
                id: 'idea', title: 'Idea clave',
                blocks: [
                    { type: 'p', text: 'La política fiscal usa el gasto público, los impuestos y las transferencias para influir en la renta, el empleo y los precios. Su historia sigue las grandes crisis: tras la de 1929, Keynes justifica el activismo y rechaza el equilibrio presupuestario clásico; tras la de los años 70 vuelve el énfasis en el equilibrio y nace la <b>política mixta</b> (fiscal y monetaria a la vez); y en 2008 y en la COVID-19 la política fiscal vuelve al primer plano.' },
                    { type: 'list', title: 'Esquema del tema (Política económica, Grado en Economía)', items: [
                        '<b>Política fiscal keynesiana</b>: fundamentos, instrumentos y objetivos a corto y largo plazo.',
                        '<b>Instrumentos</b>: acciones discrecionales y estabilizadores automáticos.',
                        '<b>Efectos</b>: intentos de cuantificación mediante multiplicadores; efectividad y limitaciones.',
                        '<b>Crisis y críticas</b>: el paso a la política mixta; la restricción presupuestaria del Gobierno.',
                        '<b>Financiación del déficit</b>: monetaria o con emisión de deuda; efecto <i>crowding-out</i> y efecto riqueza.',
                        '<b>Aplicaciones</b>: la crisis de 2008 y la de la COVID-19.'
                    ] },
                    { type: 'list', title: 'Qué hacer según el ciclo', items: [
                        'Con <b>recesión o paro</b> (exceso de oferta agregada): política expansiva, con más gasto real, más transferencias o menos impuestos.',
                        'Con <b>inflación de demanda</b> (exceso de demanda agregada): política contractiva, con superávit presupuestario, menos gasto y más impuestos.',
                        'A <b>largo plazo</b>, una vez logrado el pleno empleo, se busca un crecimiento compatible con la menor tasa de paro y la mayor estabilidad de precios.'
                    ] }
                ]
            },
            {
                id: 'formulas', title: 'Fórmulas',
                blocks: [
                    { type: 'formula', label: 'Multiplicador del gasto público', tex: 'K_G=\\frac{1}{1-c}' },
                    { type: 'formula', label: 'Multiplicador de los impuestos', tex: 'K_T=-\\frac{c}{1-c}', note: 'Actúa en sentido inverso y es menor en valor absoluto que el del gasto.' },
                    { type: 'formula', label: 'Multiplicador de las transferencias', tex: 'K_R=\\frac{c}{1-c}', note: 'Mismo sentido que el gasto, con menor intensidad.' },
                    { type: 'formula', label: 'Restricción presupuestaria del Gobierno', tex: 'G+R+iD_{t-1}=T+\\Delta M+\\Delta D', note: '$D$ es la deuda y $M$ la base monetaria: el déficit se financia con dinero o con deuda.' }
                ]
            },
            {
                id: 'calculadora', title: 'Calculadora',
                blocks: [
                    { type: 'p', text: 'Cambia la propensión marginal a consumir $c$ y compara cuánto aumenta la renta por cada euro de gasto, de transferencia o de reducción de impuestos.' },
                    { type: 'calculator', id: 'multiplicadores' }
                ]
            },
            {
                id: 'fuentes', title: 'Fuentes',
                blocks: [
                    { type: 'sources', items: [
                        'Mancha Navarro, T. (2023-24). Política económica, Tema 6: La política fiscal. Grado en Economía, Universidad de Alcalá.',
                        'Keynes, J. M. (1936). Teoría general de la ocupación, el interés y el dinero.'
                    ] }
                ]
            }
        ]
    },

    // ------------------------------------------------------------------
    mate_financiera: {
        sections: [
            {
                id: 'idea', title: 'Idea clave',
                blocks: [
                    { type: 'p', text: 'Las matemáticas financieras valoran el dinero en el tiempo. Una operación financiera intercambia capitales en distintos momentos, y el <b>principio de equivalencia financiera</b> dice que, para un tanto dado, el valor de la prestación debe igualar al de la contraprestación. De ese principio salen los intereses, los préstamos, la <b>reserva matemática</b> y la valoración de bonos.' },
                    { type: 'list', title: 'El programa', items: [
                        '<b>Tema 3.1. Capitalización simple</b>: $I=C_0\\,i\\,n$; el interés se calcula siempre sobre el capital inicial, solo se usa a corto plazo y los tantos equivalentes son proporcionales (un 1 % mensual equivale a un 12 % anual). Año comercial (360 días) o civil.',
                        '<b>Tema 3.2. Capitalización compuesta</b>: los intereses se capitalizan, $C_n=C_0(1+i)^n$, y los tantos equivalentes se obtienen por potencia.',
                        '<b>Tema 5. Operaciones financieras compuestas</b>: equivalencia financiera, clasificación de operaciones y <b>reserva o saldo</b> (5.4).',
                        '<b>Temas 8 y 9. Introducción a la estructura temporal de los tipos de interés</b>: activos de renta fija, bonos con y sin cupón, valoración y contratos a plazo (forward).'
                    ] },
                    { type: 'list', title: 'La reserva matemática', items: [
                        'Es la cantidad que una parte debe entregar a la otra en $\\tau$ para <b>saldar la operación</b>. Si $R_\\tau>0$ la entrega el deudor; si $R_\\tau<0$, el acreedor; si es cero, la operación está saldada.',
                        '<b>Método retrospectivo</b>: lo entregado menos lo reembolsado hasta $\\tau$, ambos capitalizados a $\\tau$.',
                        '<b>Método prospectivo</b>: lo que falta por entregar menos lo que falta por reembolsar, valorados en $\\tau$.',
                        '<b>Método recurrente</b>: se calcula a partir de la reserva del periodo anterior.'
                    ] },
                    { type: 'callout', text: 'Ejemplo del curso: se intercambian $P=\\{(100;0),(100;1),(100;3)\\}$ y $CP=\\{(250;2),(X;4)\\}$ al 10 % anual. Igualando valores en $t=0$ (266,04 de cada lado) resulta $X=87{,}01$; el mismo valor sale igualando en $t=4$ (389,51 frente a 302,5 más $X$).' }
                ]
            },
            {
                id: 'formulas', title: 'Fórmulas',
                blocks: [
                    { type: 'formula', label: 'Capitalización simple', tex: 'C_n=C_0(1+i\\,n),\\qquad I_{(0,n)}=C_0\\,i\\,n,\\qquad i_m=\\frac{i}{m}' },
                    { type: 'formula', label: 'Capitalización compuesta', tex: 'C_n=C_0(1+i)^n,\\qquad i_m=(1+i)^{1/m}-1' },
                    { type: 'formula', label: 'Equivalencia financiera', tex: 'V_t(P)=V_t(CP)\\quad\\text{para cualquier }t' },
                    { type: 'formula', label: 'Reserva matemática', tex: 'R_\\tau=\\underbrace{V_\\tau(\\text{prestación pasada})-V_\\tau(\\text{contraprestación pasada})}_{\\text{retrospectivo}}=\\underbrace{V_\\tau(\\text{contraprestación futura})-V_\\tau(\\text{prestación futura})}_{\\text{prospectivo}}' },
                    { type: 'formula', label: 'Precio de un bono y TIR', tex: 'P=\\sum_{t=1}^{n}\\frac{C}{(1+r)^t}+\\frac{N}{(1+r)^n}' }
                ]
            },
            {
                id: 'calculadora', title: 'Calculadora',
                blocks: [
                    { type: 'p', text: 'Compara los montantes de una misma inversión en capitalización simple y compuesta. A partir de un año, la compuesta crece más; en periodos cortos son casi iguales.' },
                    { type: 'calculator', id: 'capitalizacion' }
                ]
            },
            {
                id: 'codigo', title: 'Código',
                blocks: [
                    { type: 'code', code: {
                        r: `
# Equivalencia financiera: el ejemplo del curso (tanto anual del 10 %)
i <- 0.10
VP  <- function(c, t, tau = 0) sum(c * (1 + i)^(tau - t))
P   <- VP(c(100, 100, 100), c(0, 1, 3))            # prestacion, valorada en 0
CPx <- VP(250, 2)                                   # contraprestacion conocida
X   <- (P - CPx) * (1 + i)^4                        # 87.01: se despeja la cuantia desconocida
c(P = P, X = X)

# Reserva en tau = 2.5: los dos metodos dan el mismo resultado (-19.93)
retro <- 100 * (1 + i)^2.5 + 100 * (1 + i)^1.5 - 250 * (1 + i)^0.5   # pasado: entregado menos reembolsado
prosp <- X * (1 + i)^(2.5 - 4) - 100 * (1 + i)^(2.5 - 3)             # futuro: por reembolsar menos por entregar
c(retrospectivo = retro, prospectivo = prosp)`,
                        python: `
i = 0.10
VP = lambda cap, t, tau=0: sum(c * (1 + i) ** (tau - tt) for c, tt in zip(cap, t))
P = VP([100, 100, 100], [0, 1, 3])
C = VP([250], [2])
X = (P - C) * (1 + i) ** 4
print(P, X)                                    # 266.04 y 87.01
retro = 100 * (1 + i) ** 2.5 + 100 * (1 + i) ** 1.5 - 250 * (1 + i) ** 0.5
prosp = X * (1 + i) ** (2.5 - 4) - 100 * (1 + i) ** (2.5 - 3)
print(retro, prosp)                            # ambos -19.93

# Capitalizacion simple frente a compuesta
C0, n = 1000, 1.5
print(C0 * (1 + 0.12 * n), C0 * (1.12) ** n)` } }
                ]
            },
            {
                id: 'fuentes', title: 'Fuentes',
                blocks: [
                    { type: 'sources', items: [
                        'Matemáticas financieras: Tema 3.1 (capitalización simple) y ejercicios, Tema 5.4 (reserva o saldo de una operación), Temas 8 y 9 (estructura temporal del tipo de interés), pruebas PEC 2023-24. Grado en Economía, Universidad de Alcalá (Móstoles).',
                        'Economía financiera, Ejercicios del Tema 1.6 y prueba sobre tipos de interés, forwards y expectativas. Grado en Economía, Universidad de Alcalá.'
                    ] }
                ]
            }
        ]
    },

    // ------------------------------------------------------------------
    contabilidad_pgc: {
        sections: [
            {
                id: 'idea', title: 'Idea clave',
                blocks: [
                    { type: 'p', text: 'La contabilidad registra las operaciones de una empresa con el método de la <b>partida doble</b>: cada hecho económico se anota en el debe de unas cuentas y en el haber de otras por el mismo importe. El Plan General de Contabilidad (PGC) ordena esas cuentas en grupos numerados, de modo que todos los profesionales usan el mismo código.' },
                    { type: 'table', caption: 'Grupos del cuadro de cuentas del PGC para pymes', head: ['Grupo', 'Contenido'], rows: [
                        ['1', 'Financiación básica (capital, reservas, resultados pendientes, subvenciones)'],
                        ['2', 'Activo no corriente (inmovilizado)'],
                        ['3', 'Existencias'],
                        ['4', 'Acreedores y deudores por operaciones comerciales'],
                        ['5', 'Cuentas financieras'],
                        ['6', 'Compras y gastos'],
                        ['7', 'Ventas e ingresos']
                    ] },
                    { type: 'list', title: 'Ejemplos de cuentas del grupo 1', items: [
                        '<b>100</b> Capital social; <b>110</b> Prima de emisión; <b>112</b> Reserva legal; <b>113</b> Reservas voluntarias.',
                        '<b>120</b> Remanente; <b>121</b> Resultados negativos de ejercicios anteriores; <b>129</b> Resultado del ejercicio.',
                        '<b>130</b> Subvenciones oficiales de capital; <b>131</b> Donaciones y legados de capital.'
                    ] },
                    { type: 'callout', text: 'La identidad contable básica es $\\text{Activo}=\\text{Pasivo}+\\text{Patrimonio neto}$. El resultado del ejercicio es la diferencia entre los ingresos (grupo 7) y los gastos (grupo 6), y pasa al patrimonio neto en la cuenta 129.' }
                ]
            },
            {
                id: 'fuentes', title: 'Fuentes',
                blocks: [
                    { type: 'sources', items: [
                        'Cuadro de cuentas del Plan General de Contabilidad para pymes. Material de Sistema fiscal y contabilidad, Grado en Economía, Universidad de Alcalá.',
                        'Real Decreto 1514/2007 (PGC) y Real Decreto 1515/2007 (PGC de pymes).'
                    ] }
                ]
            }
        ]
    },

    // ------------------------------------------------------------------
    estadistica_basica: {
        sections: [
            {
                id: 'idea', title: 'Idea clave',
                blocks: [
                    { type: 'p', text: 'La estadística da el paso de los datos a las conclusiones sobre una población. Primero se construye el modelo (probabilidad y variables aleatorias), después se estudia cómo se comportan las muestras (estadísticos y distribuciones muestrales) y, por último, se infiere: estimar un parámetro, dar un intervalo, decidir con un contraste.' },
                    { type: 'list', title: 'Los once temas (cuaderno de Estadística I, Grado en Economía)', items: [
                        '<b>1. Probabilidad</b>: fenómenos aleatorios, espacio muestral, sucesos y operaciones; definiciones clásica (Laplace), frecuentista y axiomática; probabilidad compuesta e independencia.',
                        '<b>2. Variables aleatorias y sus características</b>: función de distribución, función de cuantía (discretas) y de densidad (continuas), distribuciones bidimensionales, marginales y condicionadas.',
                        '<b>3. Distribuciones discretas</b>: Bernoulli, Binomial, Poisson y Geométrica.',
                        '<b>4. Distribuciones continuas</b>: Uniforme, Exponencial y Normal; relación de la Binomial y la Poisson con la Normal (corrección por continuidad); teorema central del límite.',
                        '<b>5. Estadísticos muestrales y sus distribuciones</b>: muestreo aleatorio simple, parámetros, estimadores, función de distribución empírica, y las distribuciones $\\chi^2$ de Pearson, $t$ de Student y $F$ de Snedecor.',
                        '<b>6. Estimación puntual</b>: propiedades (eficiencia, consistencia, suficiencia) y métodos, como el de los momentos.',
                        '<b>7. Intervalos de confianza</b>: definición, métodos de construcción, tamaño muestral necesario y resumen de casos.',
                        '<b>8. Contrastes de hipótesis paramétricas</b>: tipos de hipótesis, región crítica y de aceptación, errores de tipo I y II, potencia y fases de un contraste.',
                        '<b>9. Análisis de la varianza</b>: clasificación simple, comparaciones múltiples de Scheffé, test de esfericidad de Bartlett y diseño de doble clasificación.',
                        '<b>10. Bondad de ajuste y tablas de contingencia</b>: contraste $\\chi^2$ con parámetros conocidos y desconocidos, independencia y homogeneidad.',
                        '<b>11. Contrastes no paramétricos</b>: localización (signos y mediana) y comparación de poblaciones.'
                    ] },
                    { type: 'callout', text: 'El hilo: el <b>teorema central del límite</b> del tema 4 justifica que la media muestral sea aproximadamente normal, y de ahí salen los intervalos (tema 7) y los contrastes (tema 8). Los contrastes del 10 y el 11 son la alternativa cuando no se puede suponer esa forma.' }
                ]
            },
            {
                id: 'formulas', title: 'Fórmulas',
                blocks: [
                    { type: 'formula', label: 'Probabilidad condicionada y compuesta', tex: 'P(A\\mid B)=\\frac{P(A\\cap B)}{P(B)},\\qquad P(A\\cap B)=P(B)\\,P(A\\mid B),\\quad\\text{independientes: }P(A\\cap B)=P(A)P(B)' },
                    { type: 'formula', label: 'Teorema central del límite', tex: '\\frac{\\bar X-\\mu}{\\sigma/\\sqrt n}\\ \\xrightarrow{d}\\ N(0,1)' },
                    { type: 'formula', label: 'Distribuciones muestrales (población normal)', tex: '\\frac{\\bar X-\\mu}{S/\\sqrt n}\\sim t_{n-1},\\qquad \\frac{(n-1)S^2}{\\sigma^2}\\sim\\chi^2_{n-1},\\qquad \\frac{S_1^2/\\sigma_1^2}{S_2^2/\\sigma_2^2}\\sim F_{n_1-1,\\,n_2-1}' },
                    { type: 'formula', label: 'Intervalo de confianza para la media ($\\sigma$ conocida)', tex: '\\bar x\\pm z_{\\alpha/2}\\frac{\\sigma}{\\sqrt n},\\qquad n\\ge\\Big(\\frac{z_{\\alpha/2}\\,\\sigma}{E}\\Big)^2' },
                    { type: 'formula', label: 'Errores y potencia de un contraste', tex: '\\alpha=P(\\text{rechazar }H_0\\mid H_0\\text{ cierta}),\\quad \\beta=P(\\text{aceptar }H_0\\mid H_1\\text{ cierta}),\\quad \\text{potencia}=1-\\beta' },
                    { type: 'formula', label: 'Bondad de ajuste de Pearson', tex: '\\chi^2=\\sum_{i=1}^{k}\\frac{(O_i-E_i)^2}{E_i}\\ \\sim\\ \\chi^2_{k-1-r}\\quad(r=\\text{parámetros estimados})' },
                    { type: 'formula', label: 'ANOVA de una clasificación', tex: 'F=\\frac{SC_{\\text{entre}}/(k-1)}{SC_{\\text{dentro}}/(N-k)}\\ \\sim\\ F_{k-1,\\,N-k}' }
                ]
            },
            {
                id: 'calculadora', title: 'Calculadora',
                blocks: [
                    { type: 'p', text: 'Intervalo de confianza, contraste bilateral y tamaño muestral para la media de una población normal con $\\sigma$ conocida. Con los valores por defecto, $z=2$ y el p-valor queda justo por debajo del 5 %.' },
                    { type: 'calculator', id: 'z_media' }
                ]
            },
            {
                id: 'codigo', title: 'Código',
                blocks: [
                    { type: 'code', code: {
                        r: `
# Intervalo de confianza y contraste para la media con sigma conocida
xbar <- 52; mu0 <- 50; sigma <- 8; n <- 64; alpha <- 0.05
se <- sigma / sqrt(n); z <- (xbar - mu0) / se
c(z = z, p = 2 * (1 - pnorm(abs(z))))
xbar + c(-1, 1) * qnorm(1 - alpha / 2) * se

# Con sigma desconocida: t de Student sobre una muestra
set.seed(1); x <- rnorm(30, 52, 8)
t.test(x, mu = 50)

# Bondad de ajuste chi-cuadrado y ANOVA de una clasificacion
chisq.test(c(18, 22, 20, 40), p = c(.2, .2, .2, .4))
g <- factor(rep(c("A", "B", "C"), each = 10)); y <- rnorm(30, rep(c(0, 0.5, 1), each = 10))
summary(aov(y ~ g))`,
                        python: `
import numpy as np
from statistics import NormalDist
from scipy import stats           # si scipy no esta disponible, usa los calculos con NormalDist

xbar, mu0, sigma, n, alpha = 52, 50, 8, 64, 0.05
se = sigma / np.sqrt(n); z = (xbar - mu0) / se
p = 2 * (1 - NormalDist().cdf(abs(z)))
zc = NormalDist().inv_cdf(1 - alpha / 2)
print(z, p, xbar - zc * se, xbar + zc * se)

rng = np.random.default_rng(1); x = rng.normal(52, 8, 30)
print(stats.ttest_1samp(x, 50))
print(stats.chisquare([18, 22, 20, 40], f_exp=[20, 20, 20, 40]))
print(stats.f_oneway(*[rng.normal(m, 1, 10) for m in (0, .5, 1)]))` } }
                ]
            },
            {
                id: 'fuentes', title: 'Fuentes',
                blocks: [
                    { type: 'sources', items: [
                        'Apuntes manuscritos de Estadística I (Temas 1 a 11), Grado en Economía, Universidad de Alcalá. Están escaneados; el índice se ha reconstruido con OCR.'
                    ] }
                ]
            }
        ]
    },

    // ------------------------------------------------------------------
    coase: {
        sections: [
            {
                id: 'idea', title: 'Idea clave',
                blocks: [
                    { type: 'p', text: 'Ronald Coase (Nobel de Economía en 1991) preguntó algo sencillo: ¿por qué vemos unos acuerdos económicos concretos y no otros? Su respuesta: por los <b>costos de transacción</b>, es decir, el coste de buscar información, negociar, redactar contratos y hacerlos cumplir. Si negociar fuera gratis, los agentes llegarían siempre a un acuerdo eficiente; como no lo es, la forma de organizar la actividad (mercado o empresa) depende de cuál sale más barata.' },
                    { type: 'list', title: 'Ideas asociadas', items: [
                        '<b>La empresa</b> existe porque coordinar dentro de ella cuesta menos que contratar cada paso en el mercado.',
                        '<b>Teorema de Coase</b>: con derechos de propiedad bien definidos y costos de transacción nulos, la asignación eficiente no depende de a quién se asignen los derechos inicialmente.',
                        '<b>Rebaja de costos de transacción</b>: la tecnología (comercio electrónico, plataformas) cambia qué se compra en tiendas y qué en línea, tema del artículo de Michael Munger que se estudia en la asignatura.'
                    ] },
                    { type: 'callout', text: 'Conexión con el resto del atlas: la teoría de juegos describe la negociación estratégica y la fiscalidad modifica los costes de cada alternativa.' }
                ]
            },
            {
                id: 'fuentes', title: 'Fuentes',
                blocks: [
                    { type: 'sources', items: [
                        'Munger, M. (2019). ¿Reducir los costos de transacción será el fin del comercio minorista? Intercambio. Revista de Estudiantes de Economía, 1(3). Traducción de J. Montaño Oliveros.',
                        'Coase, R. H. (1937). The nature of the firm. Economica. Coase, R. H. (1960). The problem of social cost. Journal of Law and Economics.'
                    ] }
                ]
            }
        ]
    }
});
