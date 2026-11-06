/**
 * Gendanken Palast - Brazo de Contabilidad: temarios de Contabilidad 2 (instrumentos financieros, NIIF 9)
 * y de IFRS 17 (contratos de seguro). Contabilidad 1 sigue siendo `contabilidad_pgc` (PGC).
 * Son resúmenes propios con las ideas de las diapositivas, la clase del 6/11/2026 y los enunciados de examen;
 * no reproducen el material. Se carga después de conocimientos_drive2.js.
 */

Object.assign(KNOWLEDGE, {
    contabilidad2: {
        sections: [
            {
                id: 'idea', title: 'Idea clave',
                blocks: [
                    { type: 'p', text: 'Contabilidad 2 trata los <b>instrumentos financieros</b> bajo la <b>NIIF 9</b>: cómo se clasifica un activo o un pasivo, con qué criterio se mide al entrar y después, y qué parte del cambio de valor llega a la cuenta de pérdidas y ganancias (PyG) o al otro resultado global (ORG).' },
                    { type: 'callout', text: 'Tres decisiones, en este orden: <b>1)</b> ¿se usa la opción de designar a valor razonable con cambios en PyG? <b>2)</b> ¿el contrato paga solo principal e intereses (test SPPI)? <b>3)</b> ¿cuál es el modelo de negocio? Con eso sale la cartera.' }
                ]
            },
            {
                id: 'clasificacion', title: 'Clasificación de activos financieros',
                blocks: [
                    { type: 'steps', items: [
                        { title: '1. Opción de designación', text: '¿Se designó el instrumento a valor razonable con cambios en PyG para eliminar una asimetría contable? Si sí, esa es su cartera.' },
                        { title: '2. Test SPPI', text: '¿Los flujos contractuales son solo pagos de principal e intereses sobre el principal pendiente? Si no lo son, va a VR con cambios en PyG (o, en un instrumento de patrimonio no mantenido para negociar, a VR con cambios en ORG por elección).' },
                        { title: '3. Modelo de negocio', text: 'Si pasa el SPPI: cobrar flujos contractuales, a coste amortizado (CA); cobrar flujos y vender, a VR con cambios en ORG; cualquier otro caso, a VR con cambios en PyG.' }
                    ] },
                    { type: 'p', text: '<b>Test SPPI.</b> El principal es el valor razonable al reconocimiento inicial. Los intereses compensan el valor temporal del dinero, el riesgo de crédito, el de liquidez, los costes de estructura y el margen de beneficio. Un préstamo que paga 50 de cupón por cada 1.000 y devuelve 1.050 al vencimiento lo pasa; uno que paga un porcentaje del EBITDA de la compañía no, porque la remuneración depende de otra variable.' },
                    { type: 'list', title: 'Qué pasa y qué no pasa el SPPI', items: [
                        '<b>Pasan</b>: tipos fijos y variables, <i>caps</i> y <i>floors</i>, tasas de mercado negativas, valores emitidos al descuento, cupón cero, activos con garantía de otros activos, financiación devuelta con un número variable de acciones y perpetuos.',
                        '<b>No pasan</b> (a revisar caso a caso): préstamo participativo con parte variable ligada al resultado, bono convertible en acciones, CoCo con activación por capital regulatorio y bonos de titulización cuyos activos subyacentes incluyen derivados.',
                        'El test SPPI se pasa <b>una sola vez</b>, en el reconocimiento inicial.'
                    ] },
                    { type: 'list', title: 'Modelo de negocio', items: [
                        '<b>Cobrar flujos contractuales</b>: es compatible con ventas por aumento del riesgo de crédito, por gestión de la concentración de riesgo o cercanas al vencimiento.',
                        '<b>Cobrar flujos y vender</b>: se vende para gestionar la liquidez, casar duraciones de cartera o mantener un perfil de rendimiento por intereses.',
                        '<b>Otros</b>: la entidad obtiene los flujos mediante la venta de los activos.'
                    ] }
                ]
            },
            {
                id: 'carteras', title: 'Carteras y medición',
                blocks: [
                    { type: 'table', caption: 'Instrumentos de deuda: resumen', head: ['', 'Coste amortizado', 'VR con cambios en PyG', 'VR con cambios en ORG'], rows: [
                        ['Reconocimiento inicial', 'VR con costes de transacción', 'VR sin costes de transacción', 'VR con costes de transacción'],
                        ['Valoración posterior', 'Coste amortizado', 'VR, cambios al PyG', 'VR, cambios al ORG'],
                        ['Venta de la inversión', 'Resultado del ejercicio', 'No se reconoce resultado adicional', 'Resultado del ejercicio (se recicla el ORG)'],
                        ['Deterioro', 'Pérdida esperada (PE)', 'No procede', 'Pérdida esperada (PE)']
                    ] },
                    { type: 'table', caption: 'Instrumentos de patrimonio: resumen', head: ['', 'Criterio general', 'Opción de ORG'], rows: [
                        ['Reconocimiento inicial', 'VR sin costes de transacción', 'VR con costes de transacción'],
                        ['Valoración posterior', 'VR, cambios al PyG', 'VR, cambios al ORG'],
                        ['Venta de la inversión', 'No se reconoce resultado adicional', 'No se reconoce resultado (el ORG no se recicla)'],
                        ['Deterioro', 'No procede', 'No procede']
                    ] },
                    { type: 'list', title: 'Las carteras', items: [
                        '<b>Coste amortizado</b>: SPPI y modelo de negocio de cobro de flujos contractuales.',
                        '<b>VR con cambios en ORG</b>: SPPI y modelo mixto, o instrumentos de patrimonio no mantenidos para negociar con elección irrevocable.',
                        '<b>VR con cambios en PyG obligatorio</b>: mantenidos para negociar (venta a corto plazo), gestionados conjuntamente a VR, derivados no de cobertura, y deuda que no pasa el SPPI.',
                        '<b>VR con cambios en PyG por designación</b>: elección irrevocable para eliminar o reducir una asimetría contable.',
                        '<b>Derivados de cobertura</b> e <b>inversiones en dependientes, negocios conjuntos y asociadas</b>, fuera de esta clasificación.'
                    ] },
                    { type: 'callout', text: 'Las acciones suelen ir a VR con cambios en PyG o a VR con cambios en ORG por opción. Si se mantienen para negociar, la valoración a VR con cambios en PyG es <b>obligatoria</b>.' }
                ]
            },
            {
                id: 'coste_amortizado', title: 'Coste amortizado y tipo de interés efectivo',
                blocks: [
                    { type: 'p', text: 'El coste amortizado devenga intereses con el <b>tipo de interés efectivo</b> (TIE): la tasa que iguala el valor inicial del instrumento con el valor actual de sus flujos futuros. En cada fecha, el coste amortizado es el anterior más los intereses devengados menos los cobros.' },
                    { type: 'formula', tex: 'CA_t = CA_{t-1}\\,(1+\\text{TIE}) - F_t', label: 'Evolución del coste amortizado con un flujo $F_t$ cobrado en $t$' },
                    { type: 'p', text: 'Los exámenes lo piden como una <b>ficha contable</b> de la cartera con columnas de TIR, fecha, valor, principal, intereses devengados no vencidos, diferencia entre coste amortizado y valor razonable, intereses, resultado de operaciones financieras (ROF) y patrimonio neto (PN).' }
                ]
            },
            {
                id: 'reclasificacion', title: 'Reclasificaciones',
                blocks: [
                    { type: 'table', caption: 'Efectos de cambiar de cartera', head: ['De', 'A', 'Efecto'], rows: [
                        ['Coste amortizado', 'VR con cambios en PyG', 'La diferencia va a PyG y cambia el TIE'],
                        ['VR con cambios en PyG', 'Coste amortizado', 'Cambia el TIE: el último VR pasa a ser el primer valor a coste amortizado'],
                        ['Coste amortizado', 'VR con cambios en ORG', 'La diferencia va a ORG y no cambia el TIE'],
                        ['VR con cambios en ORG', 'Coste amortizado', 'No cambia el TIE: el ORG acumulado se cancela contra el importe en libros'],
                        ['VR con cambios en ORG', 'VR con cambios en PyG', 'Los cambios acumulados en ORG pasan a PyG'],
                        ['VR con cambios en PyG', 'VR con cambios en ORG', 'Los cambios de PyG no pasan a ORG']
                    ] },
                    { type: 'callout', text: 'Solo se reclasifica cuando <b>cambia el modelo de negocio</b>. En un examen, comprobar si la decisión de vender los bonos (por ejemplo, tomada a 31.12.24) cambia el modelo de negocio es el paso clave.' }
                ]
            },
            {
                id: 'pasivos', title: 'Pasivos financieros',
                blocks: [
                    { type: 'p', text: 'Un pasivo financiero es una obligación contractual de entregar efectivo u otro activo financiero, o de intercambiar instrumentos en condiciones potencialmente desfavorables. Ejemplos: deudas comerciales, emisión de bonos o pagarés y derivados con evolución desfavorable.' },
                    { type: 'list', title: 'Medición', items: [
                        '<b>Inicial</b>: valor razonable, que sin evidencia en contra es el precio de la transacción, más los costes de transacción si después no se valora a VR.',
                        '<b>Posterior</b>: coste amortizado con el método del interés efectivo, salvo derivados e híbridos, posiciones cortas de valores y títulos propios emitidos para recomprar a corto plazo, que van a VR.',
                        'Excepciones adicionales: pasivos por transferencias que no cumplen la baja, contratos de garantía financiera y préstamos con tipo inferior al de mercado.'
                    ] },
                    { type: 'list', title: 'Designación a VR con cambios en resultados', items: [
                        'Si elimina o reduce asimetrías contables.',
                        'Si forma parte de una cartera gestionada y evaluada por su valor razonable.',
                        'Si contiene un derivado implícito que se designa para valorarse así.',
                        'Cuando se mide a VR, el cambio atribuible al <b>riesgo de crédito propio</b> va a ORG (salvo que cree asimetría) y el resto a PyG.'
                    ] },
                    { type: 'p', text: '<b>Posición corta de valores.</b> La entidad toma prestados títulos (por ejemplo, de Endesa), paga un alquiler por cada título y los vende. Pasa a deber títulos, no dinero, así que el préstamo de valores es un pasivo a VR con cambios en PyG; el alquiler es un gasto financiero.' }
                ]
            },
            {
                id: 'derivados', title: 'Derivados, híbridos y coberturas',
                blocks: [
                    { type: 'list', title: 'Ideas que piden los exámenes', items: [
                        '<b>Depósito estructurado</b>: un bono cupón cero con una prima ligada a un índice (S&P 500, IBEX 35) es un contrato anfitrión más una <b>opción implícita</b>. Se segrega el derivado o se valora el conjunto a VR si no se segrega.',
                        'La opción implícita se valora a mercado en cada cierre; el anfitrión devenga al tipo de pasivos de igual plazo en la fecha de emisión.',
                        '<b>Swap de cobertura</b>: un bono a tipo fijo cubierto con un <i>swap</i> que cede fijo y recibe variable. El derivado se registra a VR y se comprueba qué parte del bono queda cubierta (desde la fecha de cobertura).',
                        '<b>Derivado simétrico</b> (futuro, <i>swap</i>): valor inicial cero. <b>Asimétrico</b> (opción): la prima es un activo o un pasivo según el derecho o la obligación.'
                    ] }
                ]
            },
            {
                id: 'deterioro', title: 'Deterioro por pérdida esperada',
                blocks: [
                    { type: 'p', text: 'La NIIF 9 sustituye la pérdida incurrida por la <b>pérdida esperada (PE)</b>. Se aplica a los activos a coste amortizado y a VR con cambios en ORG; no a los de VR con cambios en PyG.' },
                    { type: 'formula', tex: 'PE = PD \\times LGD \\times EAD', label: 'Probabilidad de impago, pérdida en caso de impago y exposición' },
                    { type: 'callout', text: 'La clase del 6/11/2026 fija el programa del bloque: <b>clasificación, coberturas contables y deterioro</b>, con IFRS 9 e IFRS 17 como marco.' }
                ]
            },
            {
                id: 'practica', title: 'Práctica con los exámenes',
                blocks: [
                    { type: 'table', caption: 'Qué cae en cada convocatoria (según los enunciados)', head: ['Convocatoria', 'Temas'], rows: [
                        ['1/2/2016', 'Bonos con swap de cobertura y ficha contable; depósito estructurado de un seguro de vida con riesgo de inversión para el tomador'],
                        ['2020 (mayo)', 'Acciones (venta parcial, gastos de corretaje), inmueble de uso propio que pasa a disponible para la venta, títulos a VR con cambios en patrimonio, préstamo con cuotas constantes'],
                        ['24/1/2025', 'Bono cupón cero con prima ligada al S&P 500, deuda pública a coste amortizado con decisión de venta, contrato de seguro con CSM'],
                        ['Resto', 'Exámenes de 2016 a 2019 y el superextraordinario, con soluciones en PDF, DOCX y XLSX']
                    ] },
                    { type: 'sources', items: [
                        'Clasificación de activos financieros y reclasificación; Clasificación de pasivos financieros e instrumentos de patrimonio propios (diapositivas de Instrumentos Financieros). Máster U. en Ciencias Actuariales y Financieras, Universidad de Alcalá.',
                        'Exámenes de Contabilidad de operaciones financieras y del seguro (2016 a 2019), Elementos de contabilidad financiera (2020) y Contabilidad de entidades financieras y de seguro (2025).',
                        'Notas de la clase del 6/11/2026.',
                        'NIIF 9 Instrumentos financieros.'
                    ] }
                ]
            }
        ]
    },

    ifrs17: {
        sections: [
            {
                id: 'idea', title: 'Idea clave',
                blocks: [
                    { type: 'p', text: 'La <b>IFRS 17</b> mide los contratos de seguro con una fotografía actual: los flujos futuros se estiman sin sesgo, se descuentan y se les añade un ajuste por riesgo no financiero. El beneficio esperado no se reconoce al emitir el contrato: queda en un <b>margen de servicio contractual</b> (CSM) que se libera a lo largo de la cobertura.' },
                    { type: 'formula', tex: '\\text{Pasivo} = \\underbrace{\\text{BEL}}_{\\text{flujos descontados}} + \\underbrace{\\text{RA}}_{\\text{ajuste por riesgo}} + \\underbrace{\\text{CSM}}_{\\text{margen de servicio}}', label: 'Bloques de medición del grupo de contratos' }
                ]
            },
            {
                id: 'bloques', title: 'Los tres bloques',
                blocks: [
                    { type: 'list', items: [
                        '<b>Mejor estimación de los flujos (BEL)</b>: entradas por primas y salidas por siniestros y gastos, ponderadas por probabilidad y descontadas con un tipo que refleje las características de los flujos.',
                        '<b>Ajuste por riesgo no financiero (RA)</b>: la compensación que exige la aseguradora por soportar la incertidumbre sobre el importe y el calendario de los flujos.',
                        '<b>Margen de servicio contractual (CSM)</b>: el beneficio aún no devengado. En el reconocimiento inicial se fija para que el contrato no genere ganancia el primer día; si el contrato es oneroso, la pérdida va a PyG de inmediato.'
                    ] },
                    { type: 'callout', text: 'En el ejemplo de examen de 2025 (prima 1.000, salidas esperadas 500, ajuste por riesgo 50 anuales, descuento al 6 %, cobertura de dos años) se pregunta qué pasivo por contrato y qué margen de servicio hay al inicio y al cierre del primer año, con hipótesis sin cambios.' }
                ]
            },
            {
                id: 'liberacion', title: 'Reconocimiento del resultado',
                blocks: [
                    { type: 'list', items: [
                        'El CSM se libera según las <b>unidades de cobertura</b> prestadas en el periodo.',
                        'El resultado del servicio de seguro recoge los ingresos por el servicio prestado menos los gastos por siniestros y costes incurridos; el efecto del descuento aparece como gasto o ingreso financiero del seguro.',
                        'Con hipótesis sin cambios, el pasivo evoluciona por el devengo del descuento, la liberación del ajuste por riesgo y la liberación del CSM.'
                    ] }
                ]
            },
            {
                id: 'conexiones', title: 'Conexiones',
                blocks: [
                    { type: 'p', text: 'La IFRS 17 comparte con Solvencia II la mejor estimación (BEL) y un margen de riesgo, pero su objetivo es contable. Vincula con Contabilidad 2 por la NIIF 9, que mide los activos que respaldan los contratos, y con la conciliación contable-actuarial de Contabilidad 1.' },
                    { type: 'sources', items: [
                        'NIIF 17 Contratos de seguro.',
                        'Examen final de Contabilidad de entidades financieras y de seguro, 24 de enero de 2025. Máster U. en Ciencias Actuariales y Financieras, Universidad de Alcalá.'
                    ] }
                ]
            }
        ]
    }
});
