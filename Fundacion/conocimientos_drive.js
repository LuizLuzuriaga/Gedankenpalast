/**
 * Gendanken Palast - Temarios a partir del archivo compartido de la promoción (Google Drive, solo lectura)
 * Biometría, Derecho bancario, Derecho del seguro, ERM y MCEV, Deontología y ampliación de Contabilidad.
 * Son resúmenes propios con las ideas y fórmulas de las diapositivas; no reproducen el material.
 * Se carga después de conocimientos_grado2.js.
 */

Object.assign(CALCULATORS, {
    // --- Biometría: crecimiento de una población ---------------------------------------
    poblacion: {
        title: 'Crecimiento de una población',
        inputs: [
            { id: 'P0', label: 'Población inicial $P_0$', value: 46000000, step: 100000 },
            { id: 'Pt', label: 'Población final $P_t$', value: 48500000, step: 100000 },
            { id: 'n', label: 'Años transcurridos $n$', value: 10, step: 1 },
            { id: 'nac', label: 'Nacimientos en el periodo', value: 3600000, step: 50000 },
            { id: 'def', label: 'Defunciones en el periodo', value: 4000000, step: 50000 }
        ],
        compute(v) {
            const n = Math.max(v.n, 1e-9), P0 = Math.max(v.P0, 1), Pt = Math.max(v.Pt, 1);
            const acum = Math.pow(Pt / P0, 1 / n) - 1;                 // tasa de crecimiento acumulativo anual
            const inst = Math.log(Pt / P0) / n;                          // tasa instantánea: Pt = P0 e^{rt}
            const bruta = ((Pt - P0) / n) / ((Pt + P0) / 2);             // tasa bruta de crecimiento
            const natural = v.nac - v.def, saldo = (Pt - P0) - natural;
            return {
                outputs: [
                    { label: 'Crecimiento absoluto $P_t-P_0$', value: NUM.fmt(Pt - P0, 0) },
                    { label: 'Crecimiento relativo', value: NUM.fmt((Pt - P0) / P0 * 100, 2) + ' %' },
                    { label: 'Tasa acumulativa anual $r=(P_t/P_0)^{1/n}-1$', value: NUM.fmt(acum * 100, 3) + ' %' },
                    { label: 'Tasa instantánea ($P_t=P_0e^{rt}$)', value: NUM.fmt(inst * 100, 3) + ' %' },
                    { label: 'Tasa bruta de crecimiento', value: NUM.fmt(bruta * 100, 3) + ' %' },
                    { label: 'Tiempo en duplicar la población $\\ln 2/r$', value: inst > 0 ? NUM.fmt(Math.LN2 / inst, 1) + ' años' : 'no se duplica' },
                    { label: 'Crecimiento natural · saldo migratorio implícito', value: NUM.fmt(natural, 0) + '  ·  ' + NUM.fmt(saldo, 0), note: 'Balance: $P_t=P_0+\\text{crecimiento natural}+\\text{saldo migratorio}$.' }
                ]
            };
        }
    },

    // --- Biometría: mortalidad estandarizada --------------------------------------------
    estandarizacion: {
        title: 'Índice de mortalidad estándar (SMR)',
        inputs: [
            { id: 'p1', label: 'Población local, menores de 40 años', value: 600000, step: 10000 },
            { id: 'p2', label: 'Población local, 40 a 64 años', value: 300000, step: 10000 },
            { id: 'p3', label: 'Población local, 65 o más años', value: 100000, step: 10000 },
            { id: 'q1', label: 'Tasa estándar por mil, menores de 40', value: 1.0, step: 0.1 },
            { id: 'q2', label: 'Tasa estándar por mil, 40 a 64', value: 6.0, step: 0.5 },
            { id: 'q3', label: 'Tasa estándar por mil, 65 o más', value: 45.0, step: 1 },
            { id: 'obs', label: 'Defunciones observadas en la población local', value: 7600, step: 100 }
        ],
        compute(v) {
            const esp = v.p1 * v.q1 / 1000 + v.p2 * v.q2 / 1000 + v.p3 * v.q3 / 1000;
            const pob = v.p1 + v.p2 + v.p3;
            const smr = v.obs / esp * 100;
            return {
                outputs: [
                    { label: 'Defunciones esperadas con las tasas estándar', value: NUM.fmt(esp, 0), note: '$\\sum_i P_i\\,m_i^{\\text{estándar}}$: lo que habría si la población local muriera como la de referencia.' },
                    { label: 'Tasa bruta local (por mil)', value: NUM.fmt(v.obs / pob * 1000, 2) },
                    { label: 'Índice de mortalidad estándar $=\\text{observadas}/\\text{esperadas}\\times100$', value: NUM.fmt(smr, 1), note: smr > 100 ? 'Sobremortalidad respecto a la referencia, una vez controlada la estructura por edad.' : 'Mortalidad igual o inferior a la de referencia.' }
                ]
            };
        }
    },

    // --- Derecho del seguro / Solvencia II: ratios de solvencia ------------------------
    ratio_solvencia: {
        title: 'Balance económico y ratio de solvencia (Solvencia II)',
        inputs: [
            { id: 'A', label: 'Activos a valor de mercado (M€)', value: 1200, step: 10 },
            { id: 'BEL', label: 'Mejor estimación de las provisiones técnicas, BEL (M€)', value: 950, step: 10 },
            { id: 'RM', label: 'Margen de riesgo (M€)', value: 35, step: 1 },
            { id: 'SCR', label: 'Capital de solvencia obligatorio, SCR (M€)', value: 160, step: 5 },
            { id: 'MCR', label: 'Capital mínimo obligatorio, MCR (M€)', value: 55, step: 5 }
        ],
        compute(v) {
            const pt = v.BEL + v.RM, fp = v.A - pt;
            const rs = v.SCR > 0 ? fp / v.SCR : NaN, rm = v.MCR > 0 ? fp / v.MCR : NaN;
            return {
                outputs: [
                    { label: 'Provisiones técnicas $=\\text{BEL}+\\text{margen de riesgo}$', value: NUM.fmt(pt, 0) + ' M€' },
                    { label: 'Fondos propios disponibles $=$ activos $-$ provisiones', value: NUM.fmt(fp, 0) + ' M€', note: 'El exceso del valor de los activos sobre los pasivos cubre el capital (balance total).' },
                    { label: 'Ratio de solvencia (SCR)', value: NUM.fmt(rs * 100, 0) + ' %', note: rs >= 1 ? 'Cubre el SCR.' : 'No cubre el SCR: el supervisor exigirá un plan de recuperación.' },
                    { label: 'Ratio sobre el capital mínimo (MCR)', value: NUM.fmt(rm * 100, 0) + ' %', note: rm >= 1 ? 'Cubre el MCR.' : 'Por debajo del MCR: riesgo de retirada de la autorización.' }
                ]
            };
        }
    },

    // --- ERM: valor intrínseco de una cartera de vida (MCEV) ---------------------------
    mcev: {
        title: 'Valor intrínseco de mercado (MCEV): componentes',
        inputs: [
            { id: 'anav', label: 'Patrimonio neto ajustado (M€)', value: 120, step: 5 },
            { id: 'pvfp', label: 'Valor actual de beneficios futuros PVFP (M€)', value: 90, step: 5 },
            { id: 'tvog', label: 'Valor temporal de opciones y garantías (M€)', value: 8, step: 1 },
            { id: 'coc', label: 'Coste de mantener el capital requerido (M€)', value: 12, step: 1 },
            { id: 'rie', label: 'Coste de riesgos no cubiertos (M€)', value: 4, step: 1 }
        ],
        compute(v) {
            const vif = v.pvfp - v.tvog - v.coc - v.rie;
            return {
                outputs: [
                    { label: 'Valor del negocio en vigor $=\\text{PVFP}-\\text{TVOG}-\\text{coste de capital}-\\text{riesgos no cubiertos}$', value: NUM.fmt(vif, 1) + ' M€', note: 'Ajusta el valor esperado por las garantías de los contratos y por el capital que hay que inmovilizar.' },
                    { label: 'MCEV $=\\text{PN ajustado}+\\text{valor del negocio en vigor}$', value: NUM.fmt(v.anav + vif, 1) + ' M€' },
                    { label: 'Peso del negocio en vigor en el MCEV', value: NUM.fmt(vif / (v.anav + vif) * 100, 1) + ' %' }
                ]
            };
        }
    },

    // --- Contabilidad: coste amortizado frente a valor razonable de un bono ------------
    coste_amortizado: {
        title: 'Bono: coste amortizado y valor razonable',
        inputs: [
            { id: 'pc', label: 'Precio de compra (% del nominal)', value: 97, step: 0.5 },
            { id: 'cup', label: 'Cupón anual (% del nominal)', value: 3, step: 0.25 },
            { id: 'n', label: 'Años hasta el vencimiento', value: 3, step: 1 },
            { id: 'mkt', label: 'TIR de mercado al valorar (%)', value: 4, step: 0.25 }
        ],
        compute(v) {
            const n = Math.max(1, Math.min(30, Math.round(v.n))), cup = v.cup, P = v.pc;
            const precio = (y) => { let s = 0; for (let t = 1; t <= n; t++) s += (cup + (t === n ? 100 : 0)) / Math.pow(1 + y, t); return s; };
            let lo = -0.5, hi = 1.5;
            for (let i = 0; i < 200; i++) { const mid = (lo + hi) / 2; if (precio(mid) > P) lo = mid; else hi = mid; }
            const tie = (lo + hi) / 2;                                   // TIE: TIR en el momento de la compra
            const ingreso1 = P * tie, ca1 = P + ingreso1 - cup;          // intereses del primer año y coste amortizado al cierre
            const vr = (() => { let s = 0; for (let t = 2; t <= n; t++) s += (cup + (t === n ? 100 : 0)) / Math.pow(1 + v.mkt / 100, t - 1); return s; })();
            return {
                outputs: [
                    { label: 'Tipo de interés efectivo (TIE) de la compra', value: NUM.fmt(tie * 100, 4) + ' %', note: 'Es la TIR al precio de compra; fija el devengo del ingreso financiero.' },
                    { label: 'Ingreso financiero del 1.er año $=P\\cdot\\mathrm{TIE}$', value: NUM.fmt(ingreso1, 3) },
                    { label: 'Coste amortizado al final del 1.er año', value: NUM.fmt(ca1, 3), note: 'Descuenta los flujos pendientes al TIE: va acercándose al nominal.' },
                    { label: 'Valor razonable al final del 1.er año (TIR de mercado)', value: NUM.fmt(vr, 3), note: 'Descuenta los flujos pendientes a la TIR de mercado del momento de la valoración.' },
                    { label: 'Diferencia valor razonable − coste amortizado', value: NUM.fmt(vr - ca1, 3) }
                ]
            };
        }
    }
});

Object.assign(KNOWLEDGE, {

    // ------------------------------------------------------------------
    biometria: {
        sections: [
            {
                id: 'idea', title: 'Idea clave',
                blocks: [
                    { type: 'p', text: 'La biometría actuarial describe una población con números: cuántos son, cómo están repartidos por edad y sexo, cuántos nacen, cuántos mueren y cuántos migran, y a partir de eso calcula la probabilidad de vivir o morir a cada edad. Es la base de las tablas de mortalidad que usan los seguros de vida y las pensiones. El curso va de la <b>demografía descriptiva</b> a la <b>teoría de la supervivencia</b>.' },
                    { type: 'list', title: 'Programa (Temas 1 a 9)', items: [
                        '<b>1. Introducción a la demografía</b>: definición, aspectos estáticos y dinámicos (censos y registros), fuentes, estructura por sexo y edad y pirámides de población.',
                        '<b>2. Los fenómenos demográficos y su medición</b>: el tiempo en demografía (diagrama de Lexis, cohortes y generaciones), intensidad y calendario, análisis longitudinal y transversal, tasas, ratios, proporciones y probabilidades. Se cumple $\\text{cohorte}+\\text{duración}=\\text{calendario}$.',
                        '<b>3. Mortalidad</b>: tasas brutas y específicas, tasas comparativas (estandarización), mortalidad infantil y por causa de muerte.',
                        '<b>4. Tablas de mortalidad</b>: de generación y de momento, completas y abreviadas, funciones biométricas, construcción y tablas-tipo.',
                        '<b>5. Aplicaciones</b>: efecto de la mortalidad en fecundidad y migración, proyecciones de población (método de los componentes), proyecciones derivadas (actividad y hogares), tablas de fenómenos no renovables (emigrabilidad, nupcialidad) y de fenómenos renovables (método de Sullivan, esperanza de vida activa y libre de discapacidad).',
                        '<b>6. Teoría de la supervivencia</b>: supuestos del modelo biométrico, funciones asociadas y esperanza de vida completa e incompleta.',
                        '<b>7. Supervivencia en grupos homogéneos</b>: grupos de dos o más cabezas, con probabilidades de supervivencia, <b>disolución</b> (primer fallecimiento) y <b>extinción</b> (último fallecimiento).',
                        '<b>8. Leyes de supervivencia</b>: De Moivre, Dormoy, Sang, Gompertz y Makeham.',
                        '<b>9. Estimación</b>: graduación de la mortalidad, interpolación polinómica y procedimientos de ajuste (paramétricos y no paramétricos).'
                    ] },
                    { type: 'callout', text: 'Hay dos formas de mirar los datos. El <b>análisis transversal</b> compara a todas las edades en un mismo año (tabla de momento). El <b>análisis longitudinal</b> sigue a una misma generación durante toda su vida (tabla de generación). La primera es la que se calcula con datos disponibles; la segunda es la que importa para valorar una renta vitalicia.' }
                ]
            },
            {
                id: 'formulas', title: 'Fórmulas',
                blocks: [
                    { type: 'table', caption: 'Crecimiento y estructura de la población', head: ['Medida', 'Fórmula'], rows: [
                        ['Crecimiento absoluto y relativo', '$P_t-P_{t-1}$ y $(P_t-P_{t-1})/P_{t-1}\\times100$'],
                        ['Tasa acumulativa anual', '$r=(P_t/P_0)^{1/n}-1$'],
                        ['Crecimiento instantáneo', '$P_t=P_0\\,e^{rt}$'],
                        ['Tasa bruta de crecimiento', '$\\dfrac{(P_t-P_0)/n}{(P_t+P_0)/2}$'],
                        ['Tiempo en duplicar la población', '$n=\\ln 2/r$'],
                        ['Balance', '$P_t=P_0+\\text{nacimientos}-\\text{defunciones}+\\text{inmigración}-\\text{emigración}$'],
                        ['Razón de masculinidad', 'varones/mujeres $\\times100$'],
                        ['Grado de envejecimiento · de juventud', 'más de 65 años/población $\\times100$ · menos de 15/población $\\times100$'],
                        ['Índice de envejecimiento', 'más de 65/menos de 15 $\\times100$'],
                        ['Potencial de actividad', 'población de 15 a 65 años/población $\\times100$']
                    ] },
                    { type: 'formula', label: 'Tabla de mortalidad', tex: 'q_x=\\frac{d_x}{l_x},\\quad p_x=1-q_x,\\quad l_{x+1}=l_x\\,p_x,\\quad L_x\\approx\\frac{l_x+l_{x+1}}2,\\quad T_x=\\sum_{y\\ge x}L_y,\\quad e_x=\\frac{T_x}{l_x}' },
                    { type: 'formula', label: 'Mortalidad estandarizada', tex: '\\mathrm{SMR}=\\frac{\\sum_i D_i^{\\text{obs}}}{\\sum_i P_i\\,m_i^{\\text{estándar}}}\\times100' },
                    { type: 'formula', label: 'Grupo de dos cabezas: disolución y extinción', tex: '{}_tp_{xy}={}_tp_x\\,{}_tp_y\\ \\ (\\text{disolución: viven ambos}),\\qquad {}_tp_{\\overline{xy}}={}_tp_x+{}_tp_y-{}_tp_x\\,{}_tp_y\\ \\ (\\text{extinción: vive al menos uno})', note: 'Con independencia entre las vidas. La disolución ocurre en el primer fallecimiento y la extinción en el último.' },
                    { type: 'formula', label: 'Leyes de supervivencia (tanto instantáneo)', tex: '\\text{De Moivre: }\\mu_x=\\frac1{\\omega-x},\\qquad \\text{Gompertz: }\\mu_x=Bc^x,\\qquad \\text{Makeham: }\\mu_x=A+Bc^x' }
                ]
            },
            {
                id: 'calculadora', title: 'Calculadoras',
                blocks: [
                    { type: 'p', text: 'Crecimiento de una población con las medidas del Tema 1. Los valores por defecto son los de un país de unos 46 millones de habitantes.' },
                    { type: 'calculator', id: 'poblacion' },
                    { type: 'p', text: 'Estandarización indirecta: dos poblaciones con distinta estructura por edad no se comparan con la tasa bruta. El índice de mortalidad estándar usa las tasas de una población de referencia.' },
                    { type: 'calculator', id: 'estandarizacion' }
                ]
            },
            {
                id: 'codigo', title: 'Código',
                blocks: [
                    { type: 'code', code: {
                        r: `
# Tabla de mortalidad a partir de las probabilidades de muerte q_x (edades 0..110)
A <- 0.0007; B <- 0.00005; c <- 1.1               # Makeham para generar q_x de ejemplo
x  <- 0:110
mu <- A + B * c^x
qx <- 1 - exp(-(A + B * (c^(x + 1) - c^x) / log(c)))   # q_x = 1 - exp(-integral de mu)
lx <- numeric(length(x)); lx[1] <- 100000
for (i in 2:length(x)) lx[i] <- lx[i - 1] * (1 - qx[i - 1])
dx <- lx * qx
Lx <- (lx + c(lx[-1], 0)) / 2                      # personas-año vividas (hipótesis de uniformidad)
Tx <- rev(cumsum(rev(Lx)))
ex <- Tx / lx
head(data.frame(edad = x, lx = round(lx), dx = round(dx), qx = round(qx, 5), ex = round(ex, 2)), 5)

# Crecimiento de una población
P0 <- 46e6; Pt <- 48.5e6; n <- 10
r_acum <- (Pt / P0)^(1 / n) - 1
r_inst <- log(Pt / P0) / n
c(acumulativa = r_acum, instantanea = r_inst, duplicar = log(2) / r_inst)

# Índice de mortalidad estándar
pob <- c(6e5, 3e5, 1e5); tasa_std <- c(1, 6, 45) / 1000; obs <- 7600
smr <- obs / sum(pob * tasa_std) * 100
smr`,
                        python: `
import numpy as np
import pandas as pd

# Tabla de mortalidad a partir de las probabilidades de muerte q_x (edades 0..110)
A, B, c = 0.0007, 0.00005, 1.1                      # Makeham para generar q_x de ejemplo
x = np.arange(0, 111)
qx = 1 - np.exp(-(A + B * (c ** (x + 1) - c ** x) / np.log(c)))    # q_x = 1 - exp(-integral de mu)
lx = np.empty(len(x)); lx[0] = 100000
for i in range(1, len(x)):
    lx[i] = lx[i - 1] * (1 - qx[i - 1])
dx = lx * qx
Lx = (lx + np.r_[lx[1:], 0]) / 2                    # personas-año vividas (hipótesis de uniformidad)
Tx = np.cumsum(Lx[::-1])[::-1]
ex = Tx / lx
print(pd.DataFrame({"edad": x, "lx": lx.round(), "dx": dx.round(), "qx": qx.round(5), "ex": ex.round(2)}).head())

# Crecimiento de una población
P0, Pt, n = 46e6, 48.5e6, 10
r_acum = (Pt / P0) ** (1 / n) - 1
r_inst = np.log(Pt / P0) / n
print(r_acum, r_inst, np.log(2) / r_inst)

# Índice de mortalidad estándar
pob = np.array([6e5, 3e5, 1e5]); tasa_std = np.array([1, 6, 45]) / 1000; obs = 7600
print(obs / (pob * tasa_std).sum() * 100)` } }
                ]
            },
            {
                id: 'fuentes', title: 'Fuentes',
                blocks: [
                    { type: 'sources', items: [
                        'Introducción a la biometría: diapositivas de los Temas 1 a 9 y formulario de la Parte 1. Máster U. en Ciencias Actuariales y Financieras, Universidad de Alcalá (material del archivo compartido de la promoción).',
                        'Preston, Heuveline y Guillot (2001). Demography: Measuring and Modeling Population Processes. Blackwell.',
                        'Bowers et al. (1997). Actuarial Mathematics. Society of Actuaries.'
                    ] }
                ]
            }
        ]
    },

    // ------------------------------------------------------------------
    derecho_bancario: {
        sections: [
            {
                id: 'idea', title: 'Idea clave',
                blocks: [
                    { type: 'p', text: 'El derecho bancario forma parte del <b>Derecho del mercado financiero</b>: las reglas de entidades de crédito, valores y, cada vez más, seguros. Tiene poca autonomía nacional, porque casi todo se crea en la Unión Europea y bajo la influencia de organismos internacionales como el Comité de Basilea. La asignatura (Francisco Sola, Departamento de Ciencias Jurídicas, curso 2022/23) tiene siete temas.' },
                    { type: 'list', title: 'Los siete temas', items: [
                        '<b>1. El derecho bancario dentro del derecho del mercado financiero</b>: noción, función económica y fuentes.',
                        '<b>2. Elementos clave</b>: derecho frente a regulación bancaria, principios comunes a instrumentos financieros y seguros.',
                        '<b>3. Cambios tras la crisis de 2008</b>: respuesta del G-20 de Washington (15-11-2008) con más transparencia, rendición de cuentas y supervisión de los productos complejos, y el proceso legislativo europeo (propuesta de la Comisión, planes de acción como la Unión de Mercados de Capitales y el Plan de Acción de Servicios Financieros).',
                        '<b>4. La Unión Bancaria</b>: supervisión prudencial, mecanismo único de supervisión, resolución y garantía de depósitos.',
                        '<b>5. Condiciones generales y consumidores de servicios bancarios</b>, y la contratación bancaria.',
                        '<b>6. El crédito documentario</b>: operación de mediación entre el pago del comprador y la entrega del vendedor en el comercio internacional.',
                        '<b>7. Titulización financiera y bonos garantizados</b> (<i>covered bonds</i>).'
                    ] },
                    { type: 'list', title: 'Ideas que hay que saber explicar', items: [
                        '<b>Por qué se supervisa un banco</b>: hace arbitraje de plazos entre activo y pasivo, con fuerte apalancamiento; hay asimetría de información y eso produce una externalidad que el supervisor corrige.',
                        '<b>Principios frente a reglas</b>: tras la crisis se avanzó hacia reglas precisas comunes (<i>single rule book</i>).',
                        '<b>No hay ley específica de contratos bancarios</b> en el derecho español: se apoyan en el Código de Comercio y en la normativa de condiciones generales y de consumidores.',
                        '<b>Titulización</b>: se agrupan préstamos (ABS, MBS con sus variantes CMBS y RMBS, CDO) y se venden como valores, transfiriendo el riesgo. Los <i>covered bonds</i> <b>no son titulización</b>: los emite la propia entidad que conserva los activos.'
                    ] }
                ]
            },
            {
                id: 'union', title: 'La Unión Bancaria',
                blocks: [
                    { type: 'p', text: 'Nace de tres elementos: el fáctico (la crisis bancaria de la UE desde 2008, con decisiones descoordinadas y un círculo vicioso entre crisis bancaria y de deuda soberana), el político (el Consejo Europeo de 28 y 29 de junio de 2012) y el normativo. Es obligatoria para los países del euro.' },
                    { type: 'table', caption: 'Cronología', head: ['Año', 'Hito'], rows: [
                        ['2008', 'Cumbre del G-20 en Washington y comienzo de la crisis bancaria europea'],
                        ['2009', 'Informe Larosière y creación de las autoridades europeas de supervisión financiera (ESAs)'],
                        ['2010', 'Primeras pruebas de esfuerzo y Fondo Europeo de Estabilidad Financiera (temporal)'],
                        ['2011', 'Mecanismo Europeo de Estabilidad (permanente)'],
                        ['2012', 'Consejo Europeo de junio y Comunicación de la Comisión de 19 de septiembre']
                    ] },
                    { type: 'list', title: 'Los pilares que propone la Comisión en 2012', items: [
                        '<b>Mecanismo Único de Supervisión (SSM)</b>: el Banco Central Europeo recibe competencias de supervisión.',
                        '<b>Mecanismo Único de Resolución (SRM)</b>: gestiona la crisis de un banco inviable.',
                        '<b>Sistema europeo de garantía de depósitos.</b>',
                        'A medio o largo plazo, unión fiscal (mutualización de deuda).'
                    ] }
                ]
            },
            {
                id: 'fuentes', title: 'Fuentes',
                blocks: [
                    { type: 'sources', items: [
                        'Sola, F. Derecho bancario, Temas 1 a 7 y documentos de resolución bancaria (curso 2022/23). Máster U. en Ciencias Actuariales y Financieras, Universidad de Alcalá.',
                        'Comisión Europea. Banking Union factsheet (2023) y Financial Services Action Plan.',
                        'Zunzunegui, F. Concepto y sistema del derecho del mercado financiero.'
                    ] }
                ]
            }
        ]
    },

    // ------------------------------------------------------------------
    derecho_seguro: {
        sections: [
            {
                id: 'idea', title: 'Idea clave',
                blocks: [
                    { type: 'p', text: 'El derecho del seguro privado regula las relaciones jurídicas en torno a la actividad aseguradora. Es un derecho especial, profesional y muy integrado en el derecho de la Unión Europea. La asignatura (Francisco Sola, curso 2019/20) combina la <b>ley del contrato</b> con la <b>supervisión y la solvencia</b> de las entidades.' },
                    { type: 'list', title: 'Programa', items: [
                        '<b>Tema 1. Concepto, antecedentes y fuentes</b> del derecho de los seguros privados.',
                        '<b>Temas 2 a 4. La Ley de Contrato de Seguro</b> (Ley 50/1980, de 8 de octubre): 109 artículos organizados en disposiciones generales, seguros contra daños, seguros de personas y normas de derecho internacional privado. Es una ley tuitiva, de protección del asegurado. Definición, clases y elementos del contrato.',
                        '<b>Seguros de personas</b> (artículos 80 a 106 de la ley): los ramos de vida figuran en el anexo de la Ley 20/2015 de ordenación, supervisión y solvencia de entidades aseguradoras y reaseguradoras, con obligaciones de información (artículo 96.3 y artículo 124 del Reglamento, Real Decreto 1060/2015).',
                        '<b>Tema 5. Seguros de daños</b>: de cosas, que afectan a objetos concretos, y de patrimonio, que protegen un derecho (seguro de crédito), una obligación (seguro de responsabilidad civil) o una expectativa (lucro cesante).',
                        '<b>Tema 6. Seguro de responsabilidad civil</b>: sus elementos son la acción u omisión, el daño, la relación de causalidad y la culpa o negligencia.',
                        '<b>Solvencia II</b>: introducción al sistema de supervisión y capital.'
                    ] }
                ]
            },
            {
                id: 'solvencia', title: 'Solvencia II',
                blocks: [
                    { type: 'p', text: 'Solvencia II es un proyecto de la Unión Europea para garantizar la estabilidad de las aseguradoras mediante la supervisión y un marco normativo complejo, con EIOPA como autoridad europea. Sustituye a Solvencia I, que solo cubría los riesgos de suscripción, calculaba las provisiones de formas dispares y daba poco peso a lo cualitativo.' },
                    { type: 'list', title: 'Ideas principales', items: [
                        '<b>Tres pilares</b>: cuantitativo (capital), cualitativo (gobernanza y gestión de riesgos) e informativo (transparencia y supervisión).',
                        '<b>Balance económico total</b>: los activos se valoran a mercado y los pasivos de forma consistente con el mercado, sin prudencia implícita. El exceso de activos sobre pasivos cubre el capital.',
                        '<b>Provisiones técnicas</b> = mejor estimación (valor actual de los flujos futuros con la curva libre de riesgo) + margen de riesgo (que valora la incertidumbre de forma armonizada).',
                        '<b>SCR</b> (capital de solvencia obligatorio): cálculo estándar a un año con un nivel de confianza del 99,5 % y VaR como medida de riesgo. Cubre como mínimo los riesgos de suscripción (vida, no vida y salud), mercado, crédito y operacional, agregados por módulos y submódulos (hasta 28) con correlaciones.',
                        '<b>MCR</b>: capital mínimo, por debajo del cual se retira la autorización.'
                    ] },
                    { type: 'p', text: 'Calcula el balance económico y los dos ratios con tus propias cifras.' },
                    { type: 'calculator', id: 'ratio_solvencia' }
                ]
            },
            {
                id: 'fuentes', title: 'Fuentes',
                blocks: [
                    { type: 'sources', items: [
                        'Sola, F. Derecho del seguro: lecciones 1 a 6, seguros sobre la vida y Solvencia II (curso 2019/20). Máster U. en Ciencias Actuariales y Financieras, Universidad de Alcalá.',
                        'Ley 50/1980 de Contrato de Seguro; Ley 20/2015 de ordenación, supervisión y solvencia de las entidades aseguradoras y reaseguradoras; Directiva 2009/138/CE (Solvencia II).'
                    ] }
                ]
            }
        ]
    },

    // ------------------------------------------------------------------
    erm_mcev: {
        sections: [
            {
                id: 'idea', title: 'Idea clave',
                blocks: [
                    { type: 'p', text: 'La gestión integral de riesgos (ERM) de una aseguradora de vida necesita medir cuánto vale la compañía y cuánto cambia ese valor al cambiar los riesgos. Dos herramientas centrales: el <b>MCEV</b> (valor intrínseco de mercado, <i>Market Consistent Embedded Value</i>) y el <b>BEL</b> (mejor estimación de las provisiones técnicas, <i>Best Estimate Liability</i>) de Solvencia II.' },
                    { type: 'list', title: 'MCEV', items: [
                        'Es una medida de valor que incorpora un método objetivo para la tasa de descuento, las opciones y garantías de los contratos y el coste de mantener el capital de solvencia.',
                        'El CFO Forum publicó unos <b>Principios</b> para evitar procedimientos dispares: valoración a mercado de los flujos y revisión por un agente externo. El informe explica el valor, los inductores de cambio y los riesgos para realizarlo.',
                        '<b>Patrimonio neto ajustado</b>: valor de mercado de los activos por encima del capital requerido para el negocio en vigor, más el valor de mercado de ese capital requerido.',
                        '<b>PVFP</b> (valor actual de beneficios futuros): beneficios del negocio en vigor, netos de impuestos, proyectados con ingresos financieros libres de riesgo y descontados a la tasa libre de riesgo (curva swap). Se calcula de forma determinista por el enfoque de balance consistente con el mercado o por el enfoque de equivalente cierto.'
                    ] },
                    { type: 'list', title: 'BEL en vida (curso del ICEA)', items: [
                        '<b>Marco</b>: Solvencia II, <i>embedded value</i> y normativa contable; balance realista con fórmula estándar o modelo interno.',
                        '<b>Hipótesis</b>: gastos, mortalidad, <b>caída de cartera</b> (anulaciones) y rendimiento financiero.',
                        '<b>Proyección de flujos</b> con aplicación a productos como el temporal anual renovable (TAR) y la vida universal con participación en beneficios.'
                    ] },
                    { type: 'callout', text: 'En la asignatura de ERM la parte práctica es valorar en Excel una cartera de vida del mercado español bajo MCEV, derivando las hipótesis no económicas. Los trabajos tratan tendencias del sector (insurtech), la influencia de la UE, las cautivas, el reaseguro y la nueva regulación.' }
                ]
            },
            {
                id: 'calculadora', title: 'Calculadora',
                blocks: [
                    { type: 'p', text: 'El MCEV suma el patrimonio neto ajustado y el valor del negocio en vigor, que es el PVFP reducido por el valor temporal de opciones y garantías, el coste del capital y los riesgos no cubiertos.' },
                    { type: 'calculator', id: 'mcev' }
                ]
            },
            {
                id: 'codigo', title: 'Código',
                blocks: [
                    { type: 'code', code: {
                        r: `
# BEL de una cartera de seguros temporales: flujos esperados descontados con la curva libre de riesgo
horizonte <- 20
t   <- 1:horizonte
q   <- 0.002 * 1.05^(t - 1)                    # mortalidad anual (hipótesis de mortalidad)
w   <- 0.06                                     # caída de cartera anual (anulaciones)
prima <- 1200; capital <- 150000; gasto <- 40; n_pol <- 1000
curva <- 0.02 + 0.001 * t                       # curva libre de riesgo (tipos spot)

en_vigor <- n_pol * cumprod(c(1, (1 - q) * (1 - w)))[1:horizonte]   # pólizas al inicio de cada año
flujo <- -en_vigor * prima + en_vigor * q * capital + en_vigor * gasto   # (siniestros + gastos - primas)
BEL <- sum(flujo / (1 + curva)^t)
BEL                                             # negativo: la cartera tiene valor para la compañía`,
                        python: `
import numpy as np

# BEL de una cartera de seguros temporales: flujos esperados descontados con la curva libre de riesgo
horizonte = 20
t = np.arange(1, horizonte + 1)
q = 0.002 * 1.05 ** (t - 1)                      # mortalidad anual (hipótesis de mortalidad)
w = 0.06                                         # caída de cartera anual (anulaciones)
prima, capital, gasto, n_pol = 1200, 150000, 40, 1000
curva = 0.02 + 0.001 * t                         # curva libre de riesgo (tipos spot)

en_vigor = n_pol * np.cumprod(np.r_[1, (1 - q) * (1 - w)])[:horizonte]   # pólizas al inicio de cada año
flujo = -en_vigor * prima + en_vigor * q * capital + en_vigor * gasto    # (siniestros + gastos - primas)
BEL = np.sum(flujo / (1 + curva) ** t)
print(BEL)                                       # negativo: la cartera tiene valor para la compañía` } }
                ]
            },
            {
                id: 'fuentes', title: 'Fuentes',
                blocks: [
                    { type: 'sources', items: [
                        'Sánchez Sustaeta, A. Introducción al MCEV. Máster U. en Ciencias Actuariales y Financieras, Universidad de Alcalá.',
                        'Orza, A. C. Cálculo del Best Estimate en las provisiones técnicas de seguros de vida. ICEA (material de uso exclusivo del curso: aquí solo se resumen sus ideas).',
                        'ERM de compañías de seguros (2022): esquema de la asignatura. Universidad de Alcalá.',
                        'CFO Forum (2009). Market Consistent Embedded Value Principles.'
                    ] }
                ]
            }
        ]
    },

    // ------------------------------------------------------------------
    deontologia: {
        sections: [
            {
                id: 'idea', title: 'Idea clave',
                blocks: [
                    { type: 'p', text: 'Un código deontológico fija cómo debe comportarse una profesión. El de los actuarios españoles sigue el Código de Conducta del Instituto de Actuarios Españoles (IAE, 2021), que regula a quién se aplica, qué persigue y qué principios sigue. El Instituto de Actuarios se encarga de regular la profesión y de promover el desarrollo de sus miembros y la formación continua.' },
                    { type: 'list', title: 'Los seis principios', items: [
                        '<b>Integridad</b>.',
                        '<b>Competencia y atención</b>.',
                        '<b>Imparcialidad</b>.',
                        '<b>Obediencia y responsabilidad</b>.',
                        '<b>Iniciativa</b>.',
                        '<b>Comunicación</b>.'
                    ] },
                    { type: 'list', title: 'Consecuencias de aplicar los principios', items: [
                        'Integridad profesional y estándares de cualificación y de práctica.',
                        'Comunicación y confidencialidad; conflictos de interés.',
                        'Control del trabajo realizado; formalidad y cooperación.',
                        'Publicidad de la actividad, títulos y designaciones.',
                        'Régimen de violaciones del código.'
                    ] }
                ]
            },
            {
                id: 'fuentes', title: 'Fuentes',
                blocks: [
                    { type: 'sources', items: [
                        'Esquema de trabajo y reseña de la charla del Instituto de Actuarios (21-2-2023). Máster U. en Ciencias Actuariales y Financieras, Universidad de Alcalá.',
                        'Instituto de Actuarios Españoles (2021). Código de Conducta (Code of Conduct IAE 2021), actuarios.org.'
                    ] }
                ]
            }
        ]
    }
});

// Ampliación de Contabilidad con las diapositivas de instrumentos financieros y activos no financieros
(function () {
    const k = KNOWLEDGE.contabilidad_pgc;
    k.sections.splice(1, 0, {
        id: 'instrumentos', title: 'Estados e instrumentos',
        blocks: [
            { type: 'table', caption: 'Los cuatro estados financieros y la pregunta que responde cada uno', head: ['Estado', 'Pregunta'], rows: [
                ['Balance', '¿Qué tenemos? ¿Qué debemos? ¿Cuánto de ricos somos?'],
                ['Pérdidas y ganancias', '¿Nos estamos enriqueciendo?'],
                ['Cambios en el patrimonio neto', '¿Cómo nos estamos enriqueciendo?'],
                ['Flujos de efectivo', '¿Por qué o cómo varía nuestra liquidez?']
            ] },
            { type: 'list', title: 'Activos financieros', items: [
                'Se clasifican y miden a <b>coste amortizado</b> o a <b>valor razonable</b>.',
                '<b>Coste amortizado</b>: se descuentan los flujos pendientes al tipo de interés efectivo (TIE) de la operación, que es la TIR en el momento de la compra.',
                '<b>Valor razonable</b>: se descuentan los flujos pendientes a la TIR de mercado en el momento de la valoración.',
                '<b>Renta variable</b>: reconocimiento inicial a valor razonable más costes de transacción (si no va a cambios en resultados). Los cambios posteriores van a pérdidas y ganancias o a otro resultado global, según la categoría.',
                '<b>Activos no financieros</b>: la amortización depende del <b>valor residual</b> (lo que se obtendría hoy por venderlo, deducidos los costes de venta, como si ya tuviera la antigüedad esperada al final de su vida) y de la <b>vida útil</b> (periodo en que la empresa espera usarlo).'
            ] },
            { type: 'p', text: 'Compara los dos criterios con un bono comprado por debajo del nominal. Con el precio al 97 %, un cupón del 3 % y tres años, el ingreso financiero se devenga al TIE y el valor razonable cambia con la TIR de mercado.' },
            { type: 'calculator', id: 'coste_amortizado' },
            { type: 'code', code: {
                r: `
# Cuadro de coste amortizado de un bono (precio de compra 97, cupón 3, 3 años, nominal 100)
P <- 97; cup <- 3; n <- 3
f <- function(y) sum(c(rep(cup, n - 1), cup + 100) / (1 + y)^(1:n)) - P
tie <- uniroot(f, c(-0.5, 1))$root                  # TIE = TIR en la compra
ca <- P; tabla <- NULL
for (t in 1:n) {
  ingreso <- ca * tie
  ca_nuevo <- ca + ingreso - cup
  tabla <- rbind(tabla, c(anio = t, ca_inicial = ca, ingreso = ingreso, cupon = cup, ca_final = ca_nuevo))
  ca <- ca_nuevo
}
round(tabla, 4)                                      # el coste amortizado termina en 100 (el nominal)`,
                python: `
import numpy as np
from scipy.optimize import brentq

# Cuadro de coste amortizado de un bono (precio de compra 97, cupón 3, 3 años, nominal 100)
P, cup, n = 97, 3, 3
flujos = np.r_[np.full(n - 1, cup), cup + 100]
tie = brentq(lambda y: np.sum(flujos / (1 + y) ** np.arange(1, n + 1)) - P, -0.5, 1)   # TIE = TIR en la compra
ca = P
for t in range(1, n + 1):
    ingreso = ca * tie
    ca_nuevo = ca + ingreso - cup
    print(t, round(ca, 4), round(ingreso, 4), cup, round(ca_nuevo, 4))
    ca = ca_nuevo                                    # el coste amortizado termina en 100 (el nominal)` } }
        ]
    });
    const f = k.sections.find(s => s.id === 'fuentes').blocks[0];
    f.items.push('Contabilidad (Máster U. en Ciencias Actuariales y Financieras): lo que son y muestran los estados financieros, valoración contable de la renta fija, renta variable y autocartera, y activos no financieros. Universidad de Alcalá.');
})();
