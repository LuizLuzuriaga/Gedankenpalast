/* Exámenes de Contabilidad 2 resueltos. Cada asiento cuadra (Debe = Haber) y las cifras oficiales se contrastaron con las calculadas. */
const EXAMENES = [
{
"id": "e20160201",
"fecha": "2016-02-01",
"fechaTxt": "1 de febrero de 2016",
"tipo": "No consta en el documento",
"titulo": "Contabilidad de operaciones financieras y del seguro",
"archivos": [
[
"Examen 20160201 (enunciado).pdf",
"Enunciado"
],
[
"Examen 20160201 (solución).pdf",
"Solución"
],
[
"Examen 20160201.xlsx",
"Hoja de cálculo"
]
],
"ejercicios": [
{
"n": 1,
"titulo": "Cartera de bonos con swap de cobertura del valor razonable",
"tema": "Coberturas",
"origen": "oficial",
"enunciado": "Bonos de 1.000.000 € comprados en emisión el 1.7.14 por su nominal, cupón del 2 % pagadero el 30.6 y vencimiento a cuatro años. El 28.6.15 se contrata un swap (cede fijo 1,65 %, recibe variable) que cubre el bono desde el 1.7.15. El bono se descuenta al 1,75 % (31.12.14), 1,65 % (30.6.15) y 1,45 % (31.12.15). El swap vale 3.209,75 € a 31.12.15. Se pide completar la ficha contable.",
"pasos": [
{
"t": "Clasificación",
"p": "El bono es «disponible para la venta» (hoy, VR con cambios en ORG): sus variaciones de valor van a patrimonio. Desde que existe la cobertura, las variaciones del bono pasan a la cuenta de resultados para compensar las del swap. La solución escrita dice «PN» al hablar de la cobertura, pero la ficha pone esa cifra en la columna ROF (resultados): es lo coherente con una cobertura de valor razonable."
},
{
"t": "Compra y primer cierre (31.12.14)",
"p": "El bono entra por el nominal. A 31.12.14 se devengan seis meses de cupón y la diferencia entre el valor razonable (1.018.372,84) y el coste amortizado (1.010.000) va a patrimonio.",
"a": [
{
"f": "1.7.14",
"l": [
[
"Bonos (disponibles para la venta)",
"A",
1000000,
0.0
],
[
"Tesorería",
"A",
0,
1000000
]
],
"n": "",
"t": "Compra de los bonos"
},
{
"f": "31.12.14",
"l": [
[
"Intereses devengados no vencidos",
"A",
10000,
0.0
],
[
"Ingresos financieros",
"R",
0,
10000
]
],
"n": "",
"t": "Devengo del cupón"
},
{
"f": "31.12.14",
"l": [
[
"Bonos (ajuste a valor razonable)",
"A",
8372.84,
0.0
],
[
"Ajustes por valoración (ORG)",
"O",
0,
8372.84
]
],
"n": "La ganancia aún no realizada va a patrimonio, no a resultados.",
"t": "Valoración a valor razonable"
}
]
},
{
"t": "Cobro del cupón y antes de la cobertura (30.6.15)",
"p": "Se cobra el cupón de 20.000 €: la mitad estaba devengada y la otra mitad se devenga ahora, por eso los intereses devengados no vencidos vuelven a cero. El bono sube hasta 1.010.162,80 y la diferencia con el coste amortizado crece 1.789,95 €, todavía a patrimonio porque la cobertura empieza el 1.7.15.",
"a": [
{
"f": "30.6.15",
"l": [
[
"Tesorería",
"A",
20000,
0.0
],
[
"Intereses devengados no vencidos",
"A",
0,
10000
],
[
"Ingresos financieros",
"R",
0,
10000
]
],
"n": "",
"t": "Cobro del cupón"
},
{
"f": "30.6.15",
"l": [
[
"Bonos (ajuste a valor razonable)",
"A",
1789.95,
0.0
],
[
"Ajustes por valoración (ORG)",
"O",
0,
1789.95
]
],
"n": "El valor oficial es 1.789,95; la resta exacta da 1.789,96 (redondeo).",
"t": "Valoración (aún sin cobertura)"
}
]
},
{
"t": "Con la cobertura (31.12.15)",
"p": "Del 1.7.15 al 31.12.15 el valor razonable del bono sube otros 3.209,75 € (de 10.162,80 a 13.372,54 sobre el coste amortizado). Esa subida va ahora a resultados (ROF) y el swap, que pierde esa misma cantidad, se registra como pasivo: el efecto neto en resultados es cero.",
"a": [
{
"f": "31.12.15",
"l": [
[
"Intereses devengados no vencidos",
"A",
10000,
0.0
],
[
"Ingresos financieros",
"R",
0,
10000
]
],
"n": "",
"t": "Devengo del cupón"
},
{
"f": "31.12.15",
"l": [
[
"Bonos (ajuste a valor razonable)",
"A",
3209.75,
0.0
],
[
"Resultado de operaciones financieras (ROF)",
"R",
0,
3209.75
]
],
"n": "",
"t": "Bono cubierto: variación a resultados"
},
{
"f": "31.12.15",
"l": [
[
"Resultado de operaciones financieras (ROF)",
"R",
3209.75,
0.0
],
[
"Swap de cobertura (pasivo)",
"P",
0,
3209.75
]
],
"n": "El tipo bajó: el bono gana valor y el swap (paga fijo, recibe variable) lo pierde.",
"t": "Swap de cobertura"
}
]
},
{
"t": "Ficha oficial",
"p": "",
"tabla": {
"cap": "Resultados desde la última valoración",
"head": [
"TIR",
"Fecha",
"Valor",
"Principal",
"IDNV",
"CA−VR",
"Intereses",
"ROF",
"PN"
],
"rows": [
[
"2,00 %",
"30/06/2014",
"1.000.000,00",
"1.000.000,00",
"—",
"—",
"—",
"—",
"—"
],
[
"1,75 %",
"31/12/2014",
"1.018.372,84",
"1.000.000,00",
"10.000",
"8.372,84",
"10.000,00",
"—",
"8.372,84"
],
[
"1,65 %",
"30/06/2015",
"1.010.162,80",
"1.000.000,00",
"—",
"10.162,80",
"10.000,00",
"—",
"1.789,95"
],
[
"1,45 %",
"31/12/2015",
"1.023.372,54",
"1.000.000,00",
"10.000",
"13.372,54",
"10.000,00",
"3.209,75",
"—"
]
]
}
}
],
"claves": [
"Antes de la cobertura el bono va por ORG; con la cobertura, sus variaciones van a PyG y compensan al derivado.",
"IDNV = intereses devengados no vencidos: se queda a cero cada 30.6, cuando se cobra el cupón."
]
},
{
"n": 2,
"titulo": "Depósito estructurado que cubre un seguro de vida (el tomador asume el riesgo)",
"tema": "Seguros · derivados implícitos",
"origen": "oficial",
"enunciado": "El 1.1.15 se materializa una provisión de seguro de vida de 100.000 € en un depósito estructurado a 18 meses que devuelve el principal más el 50 % de la revalorización del IBEX 35 si es positiva. Tipo a 18 meses: 1 % anual. El 31.12.15 la opción implícita vale 10.000 € y los depósitos a 6 meses se remuneran al 0,5 %. No se segrega el derivado.",
"pasos": [
{
"t": "Descomponer para valorar",
"p": "Aunque no se segregue, hay que separar mentalmente el depósito y la opción. El depósito vale 100.000 / 1,01^1,5 = 98.518,53 y la opción el resto: 1.481,47. A 31.12.15 quedan seis meses: el coste amortizado es 99.503,72, el valor razonable del depósito al 0,5 % es 99.750,93 y la opción vale 10.000."
},
{
"t": "Efecto en el activo y en la provisión",
"p": "Todo el depósito se valora a valor razonable con cambios en resultados, y la provisión del seguro de vida se mueve en la misma cuantía para evitar asimetrías: lo que gana el activo lo debe el asegurador al tomador.",
"a": [
{
"f": "1.1.15",
"l": [
[
"Depósito estructurado",
"A",
100000,
0.0
],
[
"Tesorería",
"A",
0,
100000
]
],
"n": "La provisión del seguro (100.000 €, pasivo) ya figuraba en el balance.",
"t": "Materialización de la provisión"
},
{
"f": "31.12.15",
"l": [
[
"Depósito estructurado",
"A",
9750.93,
0.0
],
[
"Ingresos por intereses",
"R",
0,
985.19
],
[
"Variación de valor razonable (ROF)",
"R",
0,
8765.74
]
],
"n": "Variación = 247,21 (depósito) + 8.518,53 (opción).",
"t": "Intereses y variación de valor del depósito"
},
{
"f": "31.12.15",
"l": [
[
"Variación de la provisión por contrato de seguro",
"R",
9750.93,
0.0
],
[
"Provisión por contrato de seguro",
"P",
0,
9750.93
]
],
"n": "El resultado neto del contrato es cero.",
"t": "La provisión sigue al activo"
}
]
},
{
"t": "Ficha oficial",
"p": "La hoja de soluciones muestra 109.503,72 en la última fila, pero 100.000 + 985,19 + 8.765,75 = 109.750,94: faltan los 247,21 € de diferencia entre valor razonable y coste amortizado del depósito. Uso la cifra que cuadra.",
"tabla": {
"cap": "Balance y resultados",
"head": [
"",
"01/01/2015",
"31/12/2015",
"Intereses",
"Var. VR"
],
"rows": [
[
"CA del depósito implícito",
"98.518,53",
"99.503,72",
"985,19",
""
],
[
"Dif. VR−CA",
"—",
"247,21",
"",
"247,21"
],
[
"VR del depósito implícito",
"98.518,53",
"99.750,93",
"",
""
],
[
"VR de la opción implícita",
"1.481,47",
"10.000,00",
"",
"8.518,53"
],
[
"VR del depósito estructurado",
"100.000,00",
"109.750,93",
"",
""
],
[
"Provisión del contrato de seguro",
"100.000,00",
"109.750,93",
"985,19",
"8.765,74"
]
]
}
}
],
"claves": [
"No segregar el derivado no evita separar sus variaciones en la cuenta de resultados.",
"La provisión del seguro de vida con riesgo para el tomador se mueve igual que el activo que la cubre."
]
},
{
"n": 3,
"titulo": "Crédito al consumo: de normal a dudoso por morosidad",
"tema": "Deterioro · morosidad",
"origen": "oficial",
"enunciado": "Crédito de 10.000 € a 24 cuotas mensuales (30.9.14 a 31.8.16), sin comisiones ni garantías. El cliente no paga las cuotas vencidas después del 1.7.15; la demora devenga el 24 % anual liquidable por trimestres. La entidad lo mantiene como normal con 6.259,38 € de deuda. Se piden las correcciones y su impacto en resultados.",
"pasos": [
{
"t": "Cuándo pasa a dudoso",
"p": "El último recibo pagado es el de 30.6.15. El primer impagado (31.7.15) cumple tres meses el 31.10.15: ese día el crédito es dudoso y deja de devengar intereses, normales y de demora. Solo se reconocen los normales de los cuatro primeros recibos impagados (31.7 a 31.10)."
},
{
"t": "Intereses reconocibles",
"p": "Intereses normales: 29,89 + 27,82 + 25,75 + 23,66 = 107,12 €. Demora al 24 % anual (6 % por trimestre) sobre la cuota de 443,21 €: 6 % el primer recibo, 4 % el segundo y 2 % el tercero, es decir 26,59 + 17,73 + 8,86 = 53,18 €."
},
{
"t": "Correcciones",
"p": "La deuda corregida es 6.138,59 €, frente a 6.259,38 € de la ficha: la entidad había reconocido 120,79 € de más. Además hay que dotar la cobertura del 25 % del valor contable (el primer recibo impagado tiene entre tres y seis meses): 25 % de 6.138,59 = 1.534,65 €.",
"a": [
{
"f": "31.12.15",
"l": [
[
"Ingresos por intereses",
"R",
120.79,
0.0
],
[
"Inversión crediticia (intereses no atendidos)",
"A",
0,
120.79
]
],
"n": "Es la diferencia entre 6.259,38 y 6.138,59 (los importes sueltos suman 120,80 por redondeo).",
"t": "Quitar los ingresos de más"
},
{
"f": "31.12.15",
"l": [
[
"Pérdidas por deterioro de activos financieros",
"R",
1534.65,
0.0
],
[
"Cobertura del crédito (activo, signo negativo)",
"A",
0,
1534.65
]
],
"n": "Impacto total en resultados: −120,79 − 1.534,65 = −1.655,44 €.",
"t": "Cobertura por deterioro (25 %)"
}
]
},
{
"t": "Ficha oficial",
"p": "",
"tabla": {
"cap": "Clasificación del crédito",
"head": [
"Concepto",
"Ficha de la entidad (normal)",
"Corregida (dudoso)"
],
"rows": [
[
"Capital no vencido",
"3.467,18",
"3.467,18"
],
[
"Capital vencido",
"2.511,09",
"2.511,09"
],
[
"Intereses normales no atendidos",
"148,14",
"107,12"
],
[
"Intereses de demora",
"132,96",
"53,18"
],
[
"Valor contable de la deuda",
"6.259,38",
"6.138,59"
],
[
"Cobertura",
"—",
"1.534,65"
],
[
"Valor contable corregido",
"6.259,38",
"4.603,94"
]
]
}
}
],
"claves": [
"Dudoso por morosidad: no se reconocen más intereses (ni normales ni de demora) desde que el recibo más antiguo cumple 3 meses.",
"La cobertura se calcula sobre el valor contable de la deuda, en tramos por antigüedad de la morosidad."
]
}
]
},
{
"id": "e20160415",
"fecha": "2016-04-15",
"fechaTxt": "15 de abril de 2016",
"tipo": "No consta en el documento",
"titulo": "Contabilidad de operaciones financieras y del seguro",
"archivos": [
[
"Examen 20160415 (enunciado).pdf",
"Enunciado"
],
[
"Examen 20160415 (solución).pdf",
"Solución"
],
[
"Examen 20160415.xlsx",
"Hoja de cálculo"
]
],
"ejercicios": [
{
"n": 1,
"titulo": "Bono cupón cero ligado al IBEX sin segregar el derivado",
"tema": "Derivados implícitos",
"origen": "oficial",
"enunciado": "Bono de 1.000.000 € comprado el 1.7.13, a tres años y sin cupones, con reembolso Máx[N, N·(Ibex_t / Ibex_0)]. Se descontaba al 1,6 % en emisión; bonos similares al 1,8 % (31.12.14) y al 2 % (31.12.15). No se segrega el derivado. El valor del híbrido es 1.000.200 € (2014) y 1.080.000 € (2015).",
"pasos": [
{
"t": "Valorar el híbrido entero",
"p": "Sin segregar, todo el bono se mide a valor razonable con cambios en resultados: 1.000.200 € a 31.12.14 y 1.080.000 € a 31.12.15. El resultado de 2015 es la diferencia: 79.800 €."
},
{
"t": "Trocear el resultado",
"p": "Hay que saber cuánto son intereses y cuánto variación de valor. Coste amortizado del componente de deuda: 976.471,20 (31.12.14) y 992.094,74 (31.12.15), así que los intereses son 15.623,54 €. El resto, 64.176,46 €, es variación de valor razonable (del bono y de la opción).",
"a": [
{
"f": "31.12.15",
"l": [
[
"Instrumento híbrido (valor razonable)",
"A",
79800,
0.0
],
[
"Ingresos por intereses",
"R",
0,
15623.54
],
[
"Variación de valor razonable (ROF)",
"R",
0,
64176.46
]
],
"n": "",
"t": "Resultado del año 2015"
}
]
},
{
"t": "Ficha oficial",
"p": "",
"tabla": {
"cap": "Instrumento híbrido sin segregar",
"head": [
"",
"31/12/2014",
"31/12/2015",
"Intereses",
"Var. VR"
],
"rows": [
[
"Coste amortizado del bono",
"976.471,20",
"992.094,74",
"15.623,54",
""
],
[
"Dif. VR−CA del bono",
"−2.876,20",
"−1.947,19",
"",
"929,01"
],
[
"VR del bono",
"973.595,00",
"990.147,54",
"",
""
],
[
"VR del derivado implícito",
"26.605,00",
"89.852,46",
"",
"63.247,46"
],
[
"VR del instrumento híbrido",
"1.000.200,00",
"1.080.000,00",
"79.800,00 (total)",
""
]
]
}
}
],
"claves": [
"El derivado implícito sale por diferencia: valor del híbrido menos valor razonable del componente de deuda."
]
},
{
"n": 2,
"titulo": "La misma inversión segregando el derivado",
"tema": "Derivados implícitos",
"origen": "oficial",
"enunciado": "Qué reflejo contable habría tenido la inversión anterior a 31.12.14 y 31.12.15 si se hubiera contabilizado el derivado por separado.",
"pasos": [
{
"t": "Dos partidas",
"p": "El bono (componente de deuda) va a coste amortizado: 976.471,20 y 992.094,74. El derivado va a valor razonable: 26.605,00 y 89.852,46. El balance suma 1.003.076,20 € y 1.081.947,19 €."
},
{
"t": "Resultados",
"p": "Intereses 15.623,54 € más variación de valor del derivado 63.247,46 €: 78.871,00 €. Con la contabilización conjunta eran 79.800 €: la diferencia (929 €) es la variación de la diferencia entre valor razonable y coste amortizado del bono, que al segregar ya no se reconoce.",
"a": [
{
"f": "31.12.15",
"l": [
[
"Bono (coste amortizado)",
"A",
15623.54,
0.0
],
[
"Ingresos por intereses",
"R",
0,
15623.54
]
],
"n": "",
"t": "Bono a coste amortizado"
},
{
"f": "31.12.15",
"l": [
[
"Derivado implícito",
"A",
63247.46,
0.0
],
[
"Variación de valor razonable (ROF)",
"R",
0,
63247.46
]
],
"n": "",
"t": "Derivado implícito a valor razonable"
}
]
},
{
"t": "Comparación",
"p": "",
"tabla": {
"cap": "Segregar o no segregar",
"head": [
"",
"Sin segregar",
"Segregando"
],
"rows": [
[
"Valor en balance 2015",
"1.080.000,00",
"1.081.947,19"
],
[
"Resultados 2015",
"79.800,00",
"78.871,00"
]
]
}
}
],
"claves": [
"Segregar: el bono sigue a coste amortizado y solo el derivado va a valor razonable.",
"Al segregar, el balance no coincide con el valor razonable del híbrido (aquí 1.947,19 € de diferencia)."
]
},
{
"n": 3,
"titulo": "Préstamo con comisión de apertura, impago y liquidación anticipada",
"tema": "Coste amortizado · morosidad",
"origen": "oficial",
"enunciado": "Préstamo de 120.000 € al 4 % nominal anual liquidable por trimestres con comisión de apertura del 0,5 % y ocho cuotas trimestrales de 15.682,84 €. El cliente impaga la 5.ª y la 6.ª; a 30.9.15 pasa a mora (sin garantía) con demora del 8 % anual capitalizable anualmente. El cliente pide liquidar completamente a 31.12.15.",
"pasos": [
{
"t": "Comisión de apertura y tipo efectivo",
"p": "La comisión (600 €) no es un ingreso inmediato: reduce el valor inicial del préstamo a 119.400 € y se reparte por el método del interés efectivo (1,113965 % trimestral). Cada trimestre el ingreso es el interés efectivo sobre el coste amortizado: 119.400 × 1,113965 % = 1.330,07 €, de los cuales 1.200 € son intereses nominales y 130,07 € periodificación de la comisión.",
"a": [
{
"f": "Concesión",
"l": [
[
"Inversión crediticia (principal)",
"A",
120000,
0.0
],
[
"Tesorería",
"A",
0,
119400
],
[
"Comisiones pendientes de periodificar (menor valor del crédito)",
"A",
0,
600
]
],
"n": "",
"t": "Entrega del préstamo con comisión"
},
{
"f": "1.er trimestre",
"l": [
[
"Tesorería",
"A",
15682.84,
0.0
],
[
"Comisiones pendientes de periodificar",
"A",
130.07,
0.0
],
[
"Inversión crediticia (principal)",
"A",
0,
14482.84
],
[
"Ingresos por intereses",
"R",
0,
1200
],
[
"Ingresos por comisiones periodificadas",
"R",
0,
130.07
]
],
"n": "",
"t": "Devengo y cobro de la 1.ª cuota"
}
]
},
{
"t": "Situación a 30.9.15 (mora)",
"p": "Las cuotas 5 y 6 están impagadas. Capital no vencido 30.901,38 €, capital vencido 30.292,50 €, intereses normales no atendidos 1.073,17 € y demora 313,66 €, menos la comisión inicial (600) más la comisión ya reconocida (547,86): valor contable 62.528,57 €. Cobertura del 25 %: 15.632,14 €; valor corregido 46.896,43 €.",
"a": [
{
"f": "30.9.15",
"l": [
[
"Pérdidas por deterioro de activos financieros",
"R",
15632.14,
0.0
],
[
"Cobertura del crédito (activo, signo negativo)",
"A",
0,
15632.14
]
],
"n": "",
"t": "Cobertura por deterioro"
}
]
},
{
"t": "Liquidación a 31.12.15",
"p": "Se reclama el capital completo y los intereses no atendidos con su demora: capital no vencido 15.527,56 + capital vencido 45.666,32 (cuotas 5, 6 y 7) + intereses normales 1.382,18 + demora 940,97 = 63.517,03 €.",
"tabla": {
"cap": "Importe a pagar",
"head": [
"Concepto",
"Importe"
],
"rows": [
[
"Capital no vencido",
"15.527,56"
],
[
"Capital vencido",
"45.666,32"
],
[
"Intereses normales no atendidos",
"1.382,18"
],
[
"Intereses de demora",
"940,97"
],
[
"Importe a pagar",
"63.517,03"
]
]
}
}
],
"claves": [
"La comisión de apertura forma parte del tipo efectivo: se periodifica, no se reconoce de golpe.",
"En mora (dudoso) el valor contable no coincide con el importe reclamable al cliente."
]
}
]
},
{
"id": "e20170403",
"fecha": "2017-04-03",
"fechaTxt": "3 de abril de 2017",
"tipo": "No consta en el documento",
"titulo": "Contabilidad de operaciones financieras y del seguro",
"archivos": [
[
"Examen 20170403 (enunciado).pdf",
"Enunciado"
],
[
"Examen 20170403 (solución).pdf",
"Solución"
],
[
"Examen 20170403.xlsx",
"Hoja de cálculo"
]
],
"ejercicios": [
{
"n": 1,
"titulo": "Cartera de bonos disponible para la venta con venta parcial (40 %)",
"tema": "Clasificación · ORG",
"origen": "oficial",
"enunciado": "10.000 bonos de 1.000 € comprados el 1.10.15 al 99 % ex cupón, cupón anual del 2 % el 30.6 y vencimiento el 30.6.17 (TIR 2,58901 %). Clasificados como disponibles para la venta. El mercado los descuenta al 1,9 % (31.12.15) y al 1,8 % (31.12.16). El 31.12.16 se vende la mitad de la cartera.",
"pasos": [
{
"t": "Dos tipos de intereses",
"p": "Los intereses explícitos son los cupones (2 % de 1.000 € al año). Los implícitos son la diferencia entre el precio de compra ex cupón y el valor de reembolso, que se va reconociendo cada ejercicio. Ambos van a resultados. Lo que va a patrimonio es solo la variación de la diferencia entre valor razonable y coste amortizado."
},
{
"t": "2015: compra y primer cierre",
"p": "Se pagan 9.900.000 € por los bonos más 50.000 € de cupón corrido (tres meses). A 31.12.15 se reconocen 50.000 € de intereses explícitos y 13.785,53 € de implícitos. La diferencia VR−CA (100.395,41 €) va a patrimonio.",
"a": [
{
"f": "1.10.15",
"l": [
[
"Bonos (disponibles para la venta)",
"A",
9900000,
0.0
],
[
"Intereses devengados no vencidos (cupón corrido)",
"A",
50000,
0.0
],
[
"Tesorería",
"A",
0,
9950000
]
],
"n": "",
"t": "Compra"
},
{
"f": "31.12.15",
"l": [
[
"Intereses devengados no vencidos",
"A",
50000,
0.0
],
[
"Ingresos por intereses explícitos",
"R",
0,
50000
]
],
"n": "",
"t": "Intereses explícitos (cupón)"
},
{
"f": "31.12.15",
"l": [
[
"Bonos (periodificación del descuento)",
"A",
13785.53,
0.0
],
[
"Ingresos por intereses implícitos",
"R",
0,
13785.53
]
],
"n": "",
"t": "Intereses implícitos (descuento)"
},
{
"f": "31.12.15",
"l": [
[
"Bonos (ajuste a valor razonable)",
"A",
100395.41,
0.0
],
[
"Ajustes por valoración (ORG)",
"O",
0,
100395.41
]
],
"n": "",
"t": "Valoración a valor razonable"
}
]
},
{
"t": "2016: cierre y venta de la mitad",
"p": "En 2016 hay 200.000 € de intereses explícitos y 56.684,98 € de implícitos. La diferencia VR−CA baja y el patrimonio recoge −61.444,93 €. Al vender la mitad, el ajuste que corresponde a esos bonos (19.475,24 €) se traspasa de patrimonio a resultados: es el beneficio en la venta.",
"a": [
{
"f": "30.6.16",
"l": [
[
"Tesorería",
"A",
200000,
0.0
],
[
"Intereses devengados no vencidos",
"A",
0,
100000
],
[
"Ingresos por intereses explícitos",
"R",
0,
100000
]
],
"n": "",
"t": "Cobro del cupón anual"
},
{
"f": "31.12.16",
"l": [
[
"Intereses devengados no vencidos",
"A",
100000,
0.0
],
[
"Ingresos por intereses explícitos",
"R",
0,
100000
]
],
"n": "",
"t": "Devengo del cupón del segundo semestre"
},
{
"f": "31.12.16",
"l": [
[
"Bonos (periodificación del descuento)",
"A",
56684.98,
0.0
],
[
"Ingresos por intereses implícitos",
"R",
0,
56684.98
]
],
"n": "",
"t": "Intereses implícitos"
},
{
"f": "31.12.16",
"l": [
[
"Ajustes por valoración (ORG)",
"O",
61444.93,
0.0
],
[
"Bonos (ajuste a valor razonable)",
"A",
0,
61444.93
]
],
"n": "",
"t": "Valoración a valor razonable"
},
{
"f": "31.12.16",
"l": [
[
"Tesorería",
"A",
5054710.5,
0.0
],
[
"Bonos",
"A",
0,
5054710.5
]
],
"n": "Importe aproximado = mitad de la cartera a valor razonable (incluye el cupón corrido).",
"t": "Venta de la mitad de la cartera (a valor razonable)"
},
{
"f": "31.12.16",
"l": [
[
"Ajustes por valoración (ORG)",
"O",
19475.24,
0.0
],
[
"Beneficios en la venta (resultados)",
"R",
0,
19475.24
]
],
"n": "En patrimonio quedan 19.475,24 € de la mitad que no se vendió.",
"t": "Traspaso del ajuste de los bonos vendidos"
}
]
},
{
"t": "Resultados de la cartera",
"p": "",
"tabla": {
"cap": "Resultados reconocidos (€)",
"head": [
"Ejercicio",
"Intereses explícitos",
"Intereses implícitos",
"Beneficios en venta",
"PN: dif. VR−CA",
"PN: traspasado a resultados"
],
"rows": [
[
"2015",
"50.000,00",
"13.785,53",
"—",
"100.395,41",
"—"
],
[
"2016",
"200.000,00",
"56.684,98",
"19.475,24",
"−61.444,93",
"−19.475,24"
]
]
}
}
],
"claves": [
"En disponible para la venta: intereses a resultados, variación de valor a patrimonio.",
"Al vender, lo acumulado en patrimonio de esos títulos pasa a resultados."
]
},
{
"n": 2,
"titulo": "Crédito con amortización alemana: importe reclamable y valor contable",
"tema": "Morosidad · deterioro",
"origen": "oficial",
"enunciado": "Crédito de 5 millones concedido el 1.7.14 con vencimiento el 30.6.18, al 4 % con intereses trimestrales y amortización alemana (312.500 € cada trimestre). A 31.12.16 están impagados los tres últimos recibos (30.6, 30.9 y 31.12.16); demora del 12 % anual liquidable anualmente. Se pide el importe reclamable y el valor contable a 31.12.15 y 31.12.16 y el beneficio si el deudor se pone al corriente el 31.12.16.",
"pasos": [
{
"t": "Cuándo es dudoso",
"p": "Desde el 30.9.16 el préstamo es dudoso por morosidad (el recibo impagado del 30.6.16 cumple tres meses). A partir de ahí no se reconocen intereses, ordinarios ni de demora, aunque sean reclamables. Se reconocen los intereses ordinarios de los dos primeros recibos impagados (no los del tercero) y la demora del primer recibo hasta el 30.9.16."
},
{
"t": "Reclamable frente a contable",
"p": "",
"tabla": {
"cap": "Valor de la deuda a 31.12.16 (€)",
"head": [
"Concepto",
"Reclamable",
"Reconocido en contabilidad"
],
"rows": [
[
"Capital pendiente de vencimiento",
"1.875.000,00",
"1.875.000,00"
],
[
"Capital vencido",
"937.500,00",
"937.500,00"
],
[
"Intereses impagados",
"75.000,00",
"53.125,00"
],
[
"Intereses de demora",
"30.562,50",
"10.218,75"
],
[
"Total",
"2.918.062,50",
"2.875.843,75"
]
]
}
},
{
"t": "Beneficio si paga los tres recibos",
"p": "Pagaría capital vencido, intereses y demora: 937.500 + 75.000 + 30.562,50 = 1.043.062,50 €. De eso, lo que ya estaba reconocido se cancela contra el crédito y lo demás es ingreso: 21.875 € de intereses ordinarios y 20.343,75 € de demora, en total 42.218,75 €.",
"a": [
{
"f": "31.12.16",
"l": [
[
"Tesorería",
"A",
1043062.5,
0.0
],
[
"Inversión crediticia (capital vencido)",
"A",
0,
937500
],
[
"Intereses ordinarios reconocidos",
"A",
0,
53125
],
[
"Intereses de demora reconocidos",
"A",
0,
10218.75
],
[
"Ingresos por intereses (no reconocidos hasta hoy)",
"R",
0,
42218.75
]
],
"n": "Beneficio = importe reclamable − valor contable = 42.218,75 €.",
"t": "El deudor se pone al corriente"
}
]
}
],
"claves": [
"En dudoso por morosidad, valor contable ≠ importe reclamable: la diferencia es beneficio si el cliente paga."
]
},
{
"n": 3,
"titulo": "Bono emitido con rendimiento ligado al IBEX: derivado segregado",
"tema": "Derivados implícitos",
"origen": "oficial",
"enunciado": "El 31.12.15 la entidad emite un bono de 3 millones a dos años con reembolso Máx[3 M, 3 M + 50 % de la variación del IBEX × 3 M]. Rendimiento implícito 1,5 % anual y sin otros pagos. El derivado vale 150.000 € a 31.12.16. El emisor lo contabiliza por separado.",
"pasos": [
{
"t": "Al segregar",
"p": "El bono cupón cero se mide a coste amortizado actualizando al 1,5 % el capital a vencimiento (3 M): 3 M / 1,015² = 2.911.985,25 € al emitir. Lo que falta hasta los 3 M cobrados es el valor del derivado implícito: 88.014,75 €. Es un pasivo para el emisor: ha vendido una opción al inversor.",
"a": [
{
"f": "31.12.15",
"l": [
[
"Tesorería",
"A",
3000000,
0.0
],
[
"Bono cupón cero (coste amortizado)",
"P",
0,
2911985.25
],
[
"Derivado implícito (valor razonable)",
"P",
0,
88014.75
]
],
"n": "",
"t": "Emisión del bono"
}
]
},
{
"t": "Año 2016",
"p": "El coste amortizado sube al descontar un año menos: 2.955.665,02 €, es decir 43.679,78 € de gastos financieros. El derivado pasa a 150.000 €: pérdida de 61.985,25 € en resultados de operaciones financieras. El IBEX subió: la opción emitida ha ganado más valor intrínseco del que ha perdido por tiempo.",
"a": [
{
"f": "31.12.16",
"l": [
[
"Gastos financieros",
"R",
43679.78,
0.0
],
[
"Bono cupón cero (coste amortizado)",
"P",
0,
43679.78
]
],
"n": "",
"t": "Gasto financiero del bono"
},
{
"f": "31.12.16",
"l": [
[
"Resultado de operaciones financieras (ROF)",
"R",
61985.25,
0.0
],
[
"Derivado implícito (valor razonable)",
"P",
0,
61985.25
]
],
"n": "",
"t": "Variación del derivado"
}
]
},
{
"t": "Resumen",
"p": "",
"tabla": {
"cap": "Valores en balance y resultados (€)",
"head": [
"Fecha",
"Coste amortizado",
"VR derivado",
"Gastos financieros",
"ROF",
"Total resultados"
],
"rows": [
[
"31.12.15",
"2.911.985,25",
"88.014,75",
"—",
"—",
"—"
],
[
"31.12.16",
"2.955.665,02",
"150.000,00",
"43.679,78",
"61.985,25",
"105.665,02"
]
]
}
}
],
"claves": [
"Variaciones del coste amortizado → gasto financiero; variaciones del derivado → ROF."
]
}
]
},
{
"id": "e20180125",
"fecha": "2018-01-25",
"fechaTxt": "25 de enero de 2018",
"tipo": "Examen final",
"titulo": "Contabilidad de entidades financieras y de seguro",
"archivos": [
[
"Examen 20180125.pdf",
"Enunciado"
],
[
"Examen 20180125 (resolución).pdf",
"Resolución"
],
[
"Examen 20180125.xlsx",
"Hoja de cálculo"
]
],
"ejercicios": [
{
"n": 1,
"titulo": "Inmueble recibido por dación en pago",
"tema": "Activos adjudicados",
"origen": "oficial",
"enunciado": "Crédito de 1 M € al 3 % con intereses trimestrales. El 1.7.17 el deudor había impagado los recibos de 31.12.16, 31.3.17 y 30.6.17; demora del 12 % anual liquidable anualmente. Dación en pago del inmueble (alquilado): tasación 1.020.000 € (80 % suelo, 20 % vuelo), vuelo con 25 años de vida y sin valor residual. El 31.12.17 el valor en uso es 1.015.000 €. Se pide revisar la valoración del inmueble.",
"pasos": [
{
"t": "Valor contable de la deuda",
"p": "El crédito entró en mora el 31.3.17 (el recibo del 31.12.16 cumplió 90 días). Desde esa fecha no se reconocen más intereses, ordinarios ni de demora. La deuda contable es 1.015.225 €: capital 1.000.000, dos recibos de 7.500 € y 225 € de demora. No coincide con el reclamable (1.023.175 €)."
},
{
"t": "Valor inicial del inmueble",
"p": "Tras la dación, el activo se valora por el menor entre la tasación (1.020.000 €) y el valor contable de la deuda (1.015.225 €). Se reparte 80 % al suelo (812.180 €) y 20 % al vuelo (203.045 €). El vuelo se amortiza en 25 años: 203.045 / 25 × 6/12 = 4.060,90 € hasta 31.12.17.",
"a": [
{
"f": "1.7.17",
"l": [
[
"Inversión inmobiliaria (suelo)",
"A",
812180,
0.0
],
[
"Inversión inmobiliaria (vuelo)",
"A",
203045,
0.0
],
[
"Inversión crediticia (valor contable de la deuda)",
"A",
0,
1015225
]
],
"n": "",
"t": "Dación en pago"
},
{
"f": "31.12.17",
"l": [
[
"Amortización",
"R",
4060.9,
0.0
],
[
"Amortización acumulada",
"A",
0,
4060.9
]
],
"n": "",
"t": "Amortización del vuelo"
}
]
},
{
"t": "Deterioro a 31.12.17",
"p": "Valor neto contable: 1.015.225 − 4.060,90 = 1.011.164,10 €. Importe recuperable: el mayor entre la tasación (1.020.000) y el valor en uso (1.015.000), es decir 1.020.000 €. Como supera al valor neto contable, no hay deterioro.",
"tabla": {
"cap": "Ficha de valoración del inmueble",
"head": [
"Concepto",
"Ficha de la entidad",
"Revisado"
],
"rows": [
[
"Suelo",
"816.000,00",
"812.180,00"
],
[
"Vuelo",
"204.000,00",
"203.045,00"
],
[
"Precio de adquisición",
"1.020.000,00",
"1.015.225,00"
],
[
"Amortización acumulada",
"4.080,00",
"4.060,90"
],
[
"Valor neto contable",
"1.015.920,00",
"1.011.164,10"
],
[
"Deterioro",
"—",
"—"
]
]
}
}
],
"claves": [
"Al adjudicarse, el activo se valora por el menor de tasación y valor contable de la deuda (no por el reclamable).",
"El enunciado dice «20 % suelo»: es una errata, quiere decir vuelo."
]
},
{
"n": 2,
"titulo": "Bonos emitidos con swap de cobertura del valor razonable",
"tema": "Coberturas",
"origen": "oficial",
"enunciado": "Bonos cupón cero emitidos el 1.10.15, vencimiento 30.9.18, reembolso 10.000.000 €, TIR de emisión 1,25 %. La entidad contrata un swap que convierte el coste en variable. Los bonos se descuentan al 1,10 % (31.12.16) y al 0,95 % (31.12.17). Se piden los valores de bonos y swap y los resultados, y explicar qué cobertura es.",
"pasos": [
{
"t": "Valores de partida",
"p": "Valor de emisión: 10.000.000 / 1,0125³ = 9.634.183,29 €. El coste amortizado crece con el 1,25 %: 9.784.951,88 € (31.12.16) y 9.907.263,78 € (31.12.17). El valor razonable al 1,10 % y 0,95 % es 9.810.372,04 € y 9.929.337,15 €."
},
{
"t": "Qué es el swap",
"p": "El swap vale siempre la diferencia entre valor razonable y coste amortizado de los bonos desde que se contrató: al contratarse ambos coincidían, así que valía cero. A 31.12.16 vale 25.420,17 € y a 31.12.17 22.073,38 €. Es una cobertura de valor razonable: convierte un pasivo a tipo fijo en un pasivo a tipo variable y asegura que la entidad pueda cancelar los bonos por su coste amortizado."
},
{
"t": "Resultados de 2017",
"p": "El gasto por intereses del año es 122.311,90 €. El valor razonable del bono se aleja menos del coste amortizado: la diferencia baja 3.346,79 € (ganancia para el emisor) y el swap pierde esos mismos 3.346,79 €. Neto: cero.",
"a": [
{
"f": "31.12.17",
"l": [
[
"Gastos financieros",
"R",
122311.9,
0.0
],
[
"Bonos emitidos (coste amortizado)",
"P",
0,
122311.9
]
],
"n": "",
"t": "Intereses devengados"
},
{
"f": "31.12.17",
"l": [
[
"Bonos emitidos (ajuste a valor razonable)",
"P",
3346.79,
0.0
],
[
"Resultado de operaciones financieras (ROF)",
"R",
0,
3346.79
]
],
"n": "",
"t": "Bono cubierto: baja la diferencia VR−CA"
},
{
"f": "31.12.17",
"l": [
[
"Resultado de operaciones financieras (ROF)",
"R",
3346.79,
0.0
],
[
"Swap de cobertura (activo)",
"A",
0,
3346.79
]
],
"n": "",
"t": "Swap de cobertura"
}
]
},
{
"t": "Cuadro oficial",
"p": "",
"tabla": {
"cap": "Bonos y swap (€)",
"head": [
"Fecha",
"Coste amortizado",
"Dif. VR−CA",
"Valor razonable",
"Valor del swap"
],
"rows": [
[
"31.12.16",
"9.784.951,88",
"25.420,17",
"9.810.372,04",
"25.420,17"
],
[
"31.12.17",
"9.907.263,78",
"22.073,38",
"9.929.337,15",
"22.073,38"
]
]
}
}
],
"claves": [
"Cobertura de valor razonable: la partida cubierta pasa a valor razonable y las variaciones de ambos van a resultados, compensándose.",
"Convierte deuda a tipo fijo en deuda a tipo variable."
]
},
{
"n": 3,
"titulo": "Una aseguradora compra esos bonos para cubrir un seguro",
"tema": "Seguros · valor razonable",
"origen": "oficial",
"enunciado": "Los bonos del ejercicio anterior los compra una aseguradora el 31.12.16 para cubrir obligaciones de un contrato de seguro. Se piden el valor de los bonos a 31.12.16 y 31.12.17 y de la provisión del contrato.",
"pasos": [
{
"t": "Mismos valores razonables, distinto coste amortizado",
"p": "El valor razonable coincide con el del emisor (9.810.372,04 € y 9.929.337,15 €) pero el coste amortizado no: la aseguradora compra a 31.12.16, así que su TIR de entrada es otra. Parte de 9.810.372,04 € y a 31.12.17 el coste amortizado es 9.918.286,14 €, con 107.914,09 € de intereses."
},
{
"t": "La provisión sigue al activo",
"p": "La provisión iguala el valor razonable de la inversión y obliga a valorar los bonos a valor razonable con cambios en resultados: lo que gana el activo lo recoge la provisión, y el resultado neto es cero. (Si se hubiera elegido llevar los bonos a patrimonio, las variaciones de la provisión también irían a patrimonio.)",
"a": [
{
"f": "31.12.17",
"l": [
[
"Bonos (coste amortizado)",
"A",
107914.09,
0.0
],
[
"Ingresos por intereses",
"R",
0,
107914.09
]
],
"n": "",
"t": "Intereses de los bonos"
},
{
"f": "31.12.17",
"l": [
[
"Bonos (ajuste a valor razonable)",
"A",
11051.02,
0.0
],
[
"Resultado de operaciones financieras (ROF)",
"R",
0,
11051.02
]
],
"n": "",
"t": "Variación de valor razonable de los bonos"
},
{
"f": "31.12.17",
"l": [
[
"Variación de la provisión por contrato de seguro",
"R",
118965.11,
0.0
],
[
"Provisión por contrato de seguro",
"P",
0,
118965.11
]
],
"n": "Resultado neto de la operación: 107.914,09 + 11.051,02 − 118.965,11 = 0.",
"t": "La provisión recoge las dos partidas"
}
]
}
],
"claves": [
"El valor razonable es igual para cualquiera; el coste amortizado depende del precio de entrada."
]
}
]
},
{
"id": "e20190125",
"fecha": "2019-01-25",
"fechaTxt": "25 de enero de 2019",
"tipo": "Examen final",
"titulo": "Contabilidad de las operaciones financieras y de seguro",
"archivos": [
[
"Examen 20190125.docx",
"Enunciado"
],
[
"Examen 20190125 (SOL).docx",
"Solución"
],
[
"Examen 20190125 (SOL).pdf",
"Solución (cuadros)"
]
],
"ejercicios": [
{
"n": 1,
"titulo": "Bonos a coste amortizado cubiertos con una opción de venta (put)",
"tema": "Coberturas · coste amortizado",
"origen": "oficial",
"enunciado": "1.000 bonos de 10.000 € (10 M), cupón del 1,5 % el 30.9, vencimiento 30.9.20, comprados el 1.10.17 con TIR del 1,75 %; se mantienen solo para cobrar los flujos. El 1.10.18 se compra una put sobre todos los bonos por 80.000 €, designada como cobertura del valor razonable; vale 98.013,69 € a 31.12.18. Descuentos de los bonos: 1,5 % (31.12.17), 1,3 % (1.10.18) y 1,4 % (31.12.18).",
"pasos": [
{
"t": "Valoración de los bonos",
"p": "Como el modelo de negocio es cobrar los flujos, los bonos van a coste amortizado: 9.970.701,28 € (31.12.17), 9.951.282,53 € (1.10.18) y 9.994.536,56 € (31.12.18). La diferencia con el valor razonable no se reconoce, salvo la parte que cubre la opción desde el 1.10.18."
},
{
"t": "Qué se reconoce de la diferencia",
"p": "La diferencia VR−CA pasó de 87.950,77 € (1.10.18) a 59.937,08 € (31.12.18): bajó 28.013,69 €. Solo esa variación, la posterior a la cobertura, se reconoce en resultados, y la put la compensa con su valor intrínseco (28.013,69 €). El valor temporal de la opción se pierde: 80.000 → 70.000, es decir 10.000 € de gasto.",
"a": [
{
"f": "1.10.18",
"l": [
[
"Opción put (derivado de cobertura)",
"A",
80000,
0.0
],
[
"Tesorería",
"A",
0,
80000
]
],
"n": "",
"t": "Compra de la opción de venta"
},
{
"f": "2018",
"l": [
[
"Tesorería",
"A",
150000,
0.0
],
[
"Bonos (coste amortizado)",
"A",
23835.29,
0.0
],
[
"Ingresos por intereses",
"R",
0,
173835.29
]
],
"n": "",
"t": "Intereses de los bonos (cupón + devengo)"
},
{
"f": "31.12.18",
"l": [
[
"Variación de la diferencia VR−CA de los bonos (resultados)",
"R",
28013.69,
0.0
],
[
"Bonos (ajuste de cobertura)",
"A",
0,
28013.69
]
],
"n": "",
"t": "Bono cubierto: baja la diferencia VR−CA"
},
{
"f": "31.12.18",
"l": [
[
"Opción put (derivado de cobertura)",
"A",
28013.69,
0.0
],
[
"Variación del valor intrínseco de la put (resultados)",
"R",
0,
28013.69
]
],
"n": "",
"t": "Put: sube el valor intrínseco"
},
{
"f": "31.12.18",
"l": [
[
"Pérdida de valor temporal de la opción",
"R",
10000,
0.0
],
[
"Opción put (derivado de cobertura)",
"A",
0,
10000
]
],
"n": "",
"t": "Put: se pierde valor temporal"
}
]
},
{
"t": "Cuenta de resultados",
"p": "",
"tabla": {
"cap": "Resultados 2018 (€)",
"head": [
"Partida",
"Importe"
],
"rows": [
[
"Ingresos por intereses",
"173.835,29"
],
[
"Variación de la diferencia VR−CA (bonos)",
"−28.013,69"
],
[
"Pérdida de valor temporal de la opción",
"−10.000,00"
],
[
"Variación del valor intrínseco (put)",
"28.013,69"
],
[
"Total",
"163.835,29"
]
]
}
}
],
"claves": [
"La put compensa la bajada de valor de los bonos pero cuesta su valor temporal.",
"Con modelo de «cobrar flujos», sin cobertura la diferencia VR−CA no se reconoce."
]
},
{
"n": 2,
"titulo": "Acciones disponibles para la venta que cubren un seguro",
"tema": "Seguros · ORG",
"origen": "oficial",
"enunciado": "10.000 acciones de SUSPENSA adquiridas a 4,35 € y cotizadas a 5 € a 31.12.17, valoradas a valor razonable con cambios en ORG y destinadas a cubrir obligaciones de seguros. En 2018 no pagan dividendos y el 31.12.18 se vende la mitad a 5,10 €; la liquidez sigue cubriendo las obligaciones.",
"pasos": [
{
"t": "Balance",
"p": "31.12.17: 10.000 acciones a 5 € = 50.000 € (precio de adquisición 43.500 + diferencia 6.500). 31.12.18: quedan 5.000 acciones a 5,10 € = 25.500 € (precio de adquisición 21.750 + diferencia 3.750) más 25.500 € de liquidez. Los activos que cubren el contrato suman 51.000 €, igual que la provisión."
},
{
"t": "Resultados",
"p": "Todo va por patrimonio (ORG): la variación de la diferencia VR−PA de las acciones (−2.750 €), el resultado realizado en la venta (+3.750 €) y la variación de la provisión (−1.000 €) suman cero. El contrato de seguro no deja resultado.",
"a": [
{
"f": "31.12.18",
"l": [
[
"Acciones (valor razonable)",
"A",
1000,
0.0
],
[
"Ajustes por valoración (ORG)",
"O",
0,
1000
]
],
"n": "",
"t": "Las acciones suben de 5 a 5,10 €"
},
{
"f": "31.12.18",
"l": [
[
"Ajustes por valoración (ORG)",
"O",
1000,
0.0
],
[
"Provisión por contrato de seguro",
"P",
0,
1000
]
],
"n": "",
"t": "La provisión sube lo mismo"
},
{
"f": "31.12.18",
"l": [
[
"Tesorería",
"A",
25500,
0.0
],
[
"Acciones (valor razonable)",
"A",
0,
25500
]
],
"n": "La liquidez sigue afecta a la cobertura de la provisión.",
"t": "Venta de la mitad a 5,10 €"
}
]
},
{
"t": "Cuadros oficiales",
"p": "",
"tabla": {
"cap": "Valoraciones en balance (€)",
"head": [
"",
"31.12.17",
"31.12.18"
],
"rows": [
[
"Precio de adquisición",
"43.500,00",
"21.750,00"
],
[
"Dif. VR−PA",
"6.500,00",
"3.750,00"
],
[
"Valor razonable",
"50.000,00",
"25.500,00"
],
[
"Liquidez",
"—",
"25.500,00"
],
[
"Activos para la cobertura",
"50.000,00",
"51.000,00"
],
[
"Provisión por contrato de seguro",
"50.000,00",
"51.000,00"
]
]
}
}
],
"claves": [
"Activo y provisión se mueven juntos y por el mismo sitio (aquí, patrimonio)."
]
},
{
"n": 3,
"titulo": "Depósito emitido con opción implícita ligada al IBEX",
"tema": "Derivados implícitos",
"origen": "oficial",
"enunciado": "El 30.9.18 se emiten 500 bonos de 10.000 € con reembolso a 30.9.20 de Máx[(Ibex_20 / Ibex_18) × 10.075, 10.075]. Sin cupones; los depósitos a dos años sin cláusulas de rentabilidad cuestan el 1,25 %. La entidad no quiere que los tipos afecten al valor contable de sus pasivos. El 31.12.18 el derivado implícito vale 100.000 €.",
"pasos": [
{
"t": "Descomponer",
"p": "Se reciben 5.000.000 €. El depósito sin opción garantiza como mínimo 500 × 10.075 = 5.037.500 € a dos años: vale 5.037.500 / 1,0125² = 4.913.885,08 €. La opción implícita es la diferencia: 86.114,92 €. Como la entidad no quiere que los tipos muevan el valor contable, el depósito se deja a coste amortizado (sin cobertura ni valor razonable).",
"a": [
{
"f": "30.9.18",
"l": [
[
"Tesorería",
"A",
5000000,
0.0
],
[
"Depósito (coste amortizado)",
"P",
0,
4913885.08
],
[
"Derivado implícito (valor razonable)",
"P",
0,
86114.92
]
],
"n": "",
"t": "Emisión"
}
]
},
{
"t": "A 31.12.18",
"p": "El depósito devenga tres meses: 4.929.169,51 €, es decir 15.284,43 € de intereses. La opción pasa de 86.114,92 € a 100.000 €: pérdida de 13.885,08 €. Gasto total: 29.169,51 €.",
"a": [
{
"f": "31.12.18",
"l": [
[
"Gasto por intereses",
"R",
15284.43,
0.0
],
[
"Depósito (coste amortizado)",
"P",
0,
15284.43
]
],
"n": "",
"t": "Intereses del depósito"
},
{
"f": "31.12.18",
"l": [
[
"Resultado de operaciones financieras (ROF)",
"R",
13885.08,
0.0
],
[
"Derivado implícito (valor razonable)",
"P",
0,
13885.08
]
],
"n": "",
"t": "Variación de la opción emitida"
}
]
}
],
"claves": [
"Si los tipos no deben afectar al valor contable del pasivo: coste amortizado y derivado aparte."
]
}
]
},
{
"id": "e20190620",
"fecha": "2019-06-20",
"fechaTxt": "20 de junio de 2019",
"tipo": "Examen extraordinario",
"titulo": "Contabilidad de las operaciones financieras y de seguro",
"archivos": [
[
"Examen 20190620.docx",
"Enunciado"
],
[
"Examen 20190620.pdf",
"Enunciado"
],
[
"Examen 20190620.xlsx",
"Hoja de cálculo con la solución"
]
],
"ejercicios": [
{
"n": 1,
"titulo": "Bonos para cobrar y vender, cubiertos con un swap",
"tema": "Coberturas · ORG",
"origen": "oficial",
"enunciado": "1.000 bonos de 10.000 € (10 M), cupón del 1 % el 30.6 y vencimiento 30.6.20, comprados el 1.7.17 con TIR del 1,5 %, para cobrar flujos y vender ocasionalmente. El 1.7.18 se contrata un swap de tipos sobre todos los bonos hasta su vencimiento, designado como cobertura de valor razonable. Descuento: 1,2 % (31.12.17), 1,25 % (1.7.18) y 1,30 % (31.12.18).",
"pasos": [
{
"t": "Valoraciones",
"p": "",
"tabla": {
"cap": "Bonos y swap (€)",
"head": [
"",
"31.12.17",
"1.7.18",
"31.12.18"
],
"rows": [
[
"Coste amortizado",
"9.928.022,81",
"9.902.205,83",
"9.976.195,94"
],
[
"Valor razonable",
"10.000.882,30",
"9.950.922,12",
"10.005.558,87"
],
[
"Dif. VR−CA",
"72.859,49",
"48.716,29",
"29.362,92"
],
[
"Swap (valor razonable)",
"no existía",
"0",
"19.353,36"
]
]
}
},
{
"t": "Hasta la cobertura y desde la cobertura",
"p": "Con modelo de cobrar y vender, el bono va a valor razonable con cambios en ORG. Entre el 1.1.18 y el 1.7.18 la diferencia VR−CA baja 24.143,21 € y eso va a patrimonio. Desde el 1.7.18 (con el swap) baja otros 19.353,36 € y va a resultados, compensado por el swap, que gana lo mismo.",
"a": [
{
"f": "2018",
"l": [
[
"Tesorería",
"A",
100000,
0.0
],
[
"Bonos (coste amortizado)",
"A",
48173.13,
0.0
],
[
"Ingresos por intereses",
"R",
0,
148173.13
]
],
"n": "",
"t": "Intereses (cupón y devengo)"
},
{
"f": "1.1 a 1.7.18",
"l": [
[
"Ajustes por valoración (ORG)",
"O",
24143.21,
0.0
],
[
"Bonos (ajuste a valor razonable)",
"A",
0,
24143.21
]
],
"n": "",
"t": "Antes de la cobertura: sube el tipo y baja el valor"
},
{
"f": "1.7 a 31.12.18",
"l": [
[
"Variación de la diferencia VR−CA (resultados)",
"R",
19353.36,
0.0
],
[
"Bonos (ajuste a valor razonable)",
"A",
0,
19353.36
]
],
"n": "",
"t": "Con la cobertura: el bono pasa por resultados"
},
{
"f": "31.12.18",
"l": [
[
"Swap de cobertura (activo)",
"A",
19353.36,
0.0
],
[
"Variación de valor razonable del swap (resultados)",
"R",
0,
19353.36
]
],
"n": "",
"t": "Swap de cobertura"
}
]
},
{
"t": "Resultados 2018",
"p": "",
"tabla": {
"cap": "Resultados (€)",
"head": [
"Partida",
"PyG",
"PN"
],
"rows": [
[
"Ingresos por intereses",
"148.173,13",
""
],
[
"Variación dif. VR−CA de los bonos",
"−19.353,36",
"−24.143,21"
],
[
"Variación del valor del swap",
"19.353,36",
""
]
]
}
}
],
"claves": [
"Antes de la cobertura el bono va por ORG; después, por resultados junto al derivado."
]
},
{
"n": 2,
"titulo": "Acciones a valor razonable con cambios en ORG: venta parcial y dividendo",
"tema": "Acciones · ORG",
"origen": "oficial",
"enunciado": "50.000 acciones del Banco de Torrejón adquiridas a 4,50 € y cotizadas a 5,25 € a 31.12.17, valoradas a valor razonable con cambios en ORG. El 30.6.18 se vende la mitad a 5 €. El 30.9.18 se cobra un dividendo de 0,40 € por acción. El 31.12.18 cotizan a 5,40 €.",
"pasos": [
{
"t": "Venta de la mitad",
"p": "Antes de vender, las 25.000 acciones a vender bajan de 5,25 € a 5 €: −6.250 € a patrimonio. Al venderlas, el ajuste que les corresponde (25.000 × 0,50 = 12.500 €) pasa de patrimonio a resultados: es el beneficio en la venta, medido contra el precio de compra.",
"a": [
{
"f": "30.6.18",
"l": [
[
"Ajustes por valoración (ORG)",
"O",
6250,
0.0
],
[
"Acciones (valor razonable)",
"A",
0,
6250
]
],
"n": "",
"t": "Las acciones a vender bajan a 5 €"
},
{
"f": "30.6.18",
"l": [
[
"Tesorería",
"A",
125000,
0.0
],
[
"Acciones (valor razonable)",
"A",
0,
125000
]
],
"n": "",
"t": "Venta de 25.000 acciones a 5 €"
},
{
"f": "30.6.18",
"l": [
[
"Ajustes por valoración (ORG)",
"O",
12500,
0.0
],
[
"Beneficios en la venta (resultados)",
"R",
0,
12500
]
],
"n": "",
"t": "Traspaso del ajuste a resultados"
}
]
},
{
"t": "Dividendo y cierre",
"p": "El dividendo se cobra de las 25.000 acciones que quedan: 10.000 € de ingreso en resultados. Al cierre las acciones restantes suben de 5,25 € a 5,40 €: +3.750 € a patrimonio. El patrimonio pasa de 37.500 € a 22.500 € (−15.000 € = −6.250 − 12.500 + 3.750).",
"a": [
{
"f": "30.9.18",
"l": [
[
"Tesorería",
"A",
10000,
0.0
],
[
"Ingresos por dividendos",
"R",
0,
10000
]
],
"n": "",
"t": "Cobro del dividendo"
},
{
"f": "31.12.18",
"l": [
[
"Acciones (valor razonable)",
"A",
3750,
0.0
],
[
"Ajustes por valoración (ORG)",
"O",
0,
3750
]
],
"n": "",
"t": "Valoración de las 25.000 acciones restantes"
}
]
},
{
"t": "Cuadros oficiales",
"p": "",
"tabla": {
"cap": "Valoraciones y resultados (€)",
"head": [
"",
"31.12.17",
"31.12.18"
],
"rows": [
[
"Valor razonable",
"262.500,00",
"135.000,00"
],
[
"Precio de adquisición",
"225.000,00",
"112.500,00"
],
[
"Dif. VR−PA",
"37.500,00",
"22.500,00"
],
[
"Ingresos por dividendos (PyG)",
"",
"10.000,00"
],
[
"Beneficios en venta (PyG)",
"",
"12.500,00"
],
[
"Variación dif. VR−PA (PN)",
"",
"−15.000,00"
]
]
}
}
],
"claves": [
"Dividendos y beneficio realizado en la venta, a resultados; las variaciones de valor intermedias, a patrimonio."
]
},
{
"n": 3,
"titulo": "Bono convertible emitido: pasivo y patrimonio",
"tema": "Instrumento compuesto",
"origen": "oficial",
"enunciado": "1.000 bonos de 10.000 € (10 M) emitidos el 1.7.18 con vencimiento el 1.7.20, sin remuneración. Al vencimiento el inversor elige entre el reembolso o 500 acciones de la sociedad. En la emisión la sociedad paga el 1,5 % por pasivos a dos años. La hoja de soluciones es coherente con una emisión a la par: el enunciado no da el precio.",
"pasos": [
{
"t": "Dos componentes",
"p": "La opción de convertir en acciones es un instrumento de patrimonio. El pasivo vale lo que costaría un pasivo sin conversión: 10.000.000 / 1,015² = 9.706.617,49 €. Lo que resta de los 10.000.000 recibidos, 293.382,51 €, es el componente de patrimonio. No se vuelve a medir.",
"a": [
{
"f": "1.7.18",
"l": [
[
"Tesorería",
"A",
10000000,
0.0
],
[
"Pasivo financiero (coste amortizado)",
"P",
0,
9706617.49
],
[
"Instrumento de patrimonio (opción de conversión)",
"O",
0,
293382.51
]
],
"n": "",
"t": "Emisión del bono convertible"
}
]
},
{
"t": "A 31.12.18",
"p": "El pasivo devenga seis meses al 1,5 % efectivo: 9.779.146,15 €, es decir 72.528,66 € de gasto financiero.",
"a": [
{
"f": "31.12.18",
"l": [
[
"Gastos financieros",
"R",
72528.66,
0.0
],
[
"Pasivo financiero (coste amortizado)",
"P",
0,
72528.66
]
],
"n": "",
"t": "Gasto financiero del semestre"
}
]
},
{
"t": "Cuadros oficiales",
"p": "",
"tabla": {
"cap": "Balance y resultados (€)",
"head": [
"",
"31.12.18"
],
"rows": [
[
"Pasivo financiero",
"9.779.146,15"
],
[
"Instrumento de capital",
"293.382,51"
],
[
"Gastos financieros (PyG)",
"72.528,66"
]
]
}
}
],
"claves": [
"Convertible a precio fijo en un número fijo de acciones: parte pasivo (coste amortizado) y parte patrimonio."
]
}
]
},
{
"id": "e20200519",
"fecha": "2020-05-19",
"fechaTxt": "19 de mayo de 2020",
"tipo": "Examen final",
"titulo": "Elementos de contabilidad financiera",
"archivos": [
[
"Examen 20200519.pdf",
"Enunciado"
]
],
"aviso": "Tus archivos solo traen el enunciado de este examen, sin solución. Todo lo de este examen es una resolución propia, con los supuestos que se indican: compárala con la que dieran en clase.",
"ejercicios": [
{
"n": 1,
"titulo": "Acciones: venta parcial con gastos de corretaje",
"tema": "Acciones",
"origen": "propia",
"enunciado": "10.000 acciones adquiridas por 50.050 € (gastos incluidos). El 30.6.19 se vende la mitad a 5,40 € con gastos de corretaje del 0,1 % del efectivo. Cotización: 5,20 € (31.12.18) y 4,90 € (31.12.19).",
"supuestos": [
"El enunciado no indica la cartera. Se supone valor razonable con cambios en resultados (en el punto 3 sí aclara que van a patrimonio, aquí no).",
"La venta se mide contra el último valor razonable (5,20 €) y los gastos de corretaje van a resultados."
],
"pasos": [
{
"t": "Balance y venta",
"p": "A 31.12.18 las acciones valen 10.000 × 5,20 = 52.000 €. El 30.6.19 se venden 5.000 por 27.000 €, con 27 € de corretaje. Frente al valor en libros (26.000 €), el resultado de la venta es +1.000 € menos 27 € de gastos. A 31.12.19 quedan 5.000 acciones a 4,90 € = 24.500 €: pérdida de 1.500 €.",
"a": [
{
"f": "30.6.19",
"l": [
[
"Tesorería",
"A",
27000,
0.0
],
[
"Acciones (valor razonable)",
"A",
0,
26000
],
[
"Beneficios en la venta",
"R",
0,
1000
]
],
"n": "",
"t": "Venta de la mitad"
},
{
"f": "30.6.19",
"l": [
[
"Gastos de corretaje",
"R",
27,
0.0
],
[
"Tesorería",
"A",
0,
27
]
],
"n": "",
"t": "Gastos de corretaje (0,1 %)"
},
{
"f": "31.12.19",
"l": [
[
"Pérdida por valoración (resultados)",
"R",
1500,
0.0
],
[
"Acciones (valor razonable)",
"A",
0,
1500
]
],
"n": "",
"t": "Valoración de las acciones que quedan"
}
]
},
{
"t": "Impacto 2019",
"p": "Resultados: +1.000 − 27 − 1.500 = −527 €. Flujo de efectivo (inversión): +26.973 €. Balance: 52.000 € (31.12.18) y 24.500 € (31.12.19)."
}
],
"claves": [
"En valor razonable con cambios en resultados los gastos de transacción son gasto del ejercicio."
]
},
{
"n": 2,
"titulo": "Inmueble de uso propio: deterioro y paso a «mantenido para la venta»",
"tema": "Inmovilizado",
"origen": "propia",
"enunciado": "Inmueble de uso propio comprado el 1.4.2004 por 2.000.000 € (suelo 40 %, vuelo con 40 años de vida). Valor de mercado/valor en uso: 1.450.000/1.500.000 € (2018) y 1.525.000/1.550.000 € (2019). El 30.9.19 se decide venderlo y se desaloja el 1.10.19, mudándose a oficinas alquiladas por 160.000 € al año, pagaderos por anticipado.",
"supuestos": [
"El deterioro se asigna al vuelo y el nuevo plazo de amortización es el que quedaba (25,25 años).",
"Sin costes de venta. Al pasar a mantenido para la venta se deja de amortizar y se valora por el menor entre valor contable y valor razonable."
],
"pasos": [
{
"t": "Valor neto contable en 2018",
"p": "Suelo 800.000 € y vuelo 1.200.000 € (30.000 € de amortización al año). Hasta el 31.12.18 han pasado 14,75 años: amortización acumulada 442.500 € y valor neto 1.557.500 €. El importe recuperable es el mayor entre el valor de mercado (1.450.000) y el valor en uso (1.500.000): 1.500.000 €. Hay que reconocer un deterioro de 57.500 €.",
"a": [
{
"f": "31.12.18",
"l": [
[
"Pérdida por deterioro del inmovilizado",
"R",
57500,
0.0
],
[
"Deterioro de valor del inmueble",
"A",
0,
57500
]
],
"n": "",
"t": "Deterioro del inmueble"
}
]
},
{
"t": "2019",
"p": "Tras el deterioro el vuelo queda en 700.000 € y se amortiza en 25,25 años: 27.722,77 € al año, es decir 20.792,08 € hasta el 30.9.19. Valor contable a esa fecha: 1.479.207,92 €. El 30.9.19 pasa a mantenido para la venta: deja de amortizarse y el valor de mercado (1.525.000 €) es superior, así que se mantiene el valor contable.",
"a": [
{
"f": "30.9.19",
"l": [
[
"Amortización",
"R",
20792.08,
0.0
],
[
"Amortización acumulada",
"A",
0,
20792.08
]
],
"n": "",
"t": "Amortización de enero a septiembre"
},
{
"f": "1.10.19",
"l": [
[
"Gasto de alquiler (3 meses de 2019)",
"R",
40000,
0.0
],
[
"Gastos anticipados",
"A",
120000,
0.0
],
[
"Tesorería",
"A",
0,
160000
]
],
"n": "",
"t": "Pago anticipado del alquiler de un año"
}
]
},
{
"t": "Balance",
"p": "Inmueble a 31.12.18: 1.500.000 €. A 31.12.19: 1.479.207,92 € como activo no corriente mantenido para la venta. Resultados 2019: −20.792,08 (amortización) −40.000 (alquiler). Efectivo: −160.000 € de alquiler."
}
],
"claves": [
"Importe recuperable = mayor entre valor razonable (menos costes de venta) y valor en uso.",
"Un activo mantenido para la venta no se amortiza."
]
},
{
"n": 3,
"titulo": "Acciones a valor razonable con cambios en patrimonio y dividendo",
"tema": "Acciones · ORG",
"origen": "propia",
"enunciado": "50.000 títulos de LORUSA adquiridos a 5 € (gastos incluidos); el 30.6.19 se cobra un dividendo de 0,25 € por título. Cotizan a 4,90 € (31.12.18) y 4,75 € (31.12.19), con las variaciones a patrimonio.",
"supuestos": [
"No se supone deterioro irreversible: las bajadas van a patrimonio."
],
"pasos": [
{
"t": "Balance",
"p": "31.12.18: 50.000 × 4,90 = 245.000 € (ajuste de patrimonio −5.000 €). 31.12.19: 50.000 × 4,75 = 237.500 € (ajuste acumulado −12.500 €).",
"a": [
{
"f": "30.6.19",
"l": [
[
"Tesorería",
"A",
12500,
0.0
],
[
"Ingresos por dividendos",
"R",
0,
12500
]
],
"n": "",
"t": "Dividendo de 0,25 € por título"
},
{
"f": "31.12.19",
"l": [
[
"Ajustes por valoración (ORG)",
"O",
7500,
0.0
],
[
"Acciones (valor razonable)",
"A",
0,
7500
]
],
"n": "",
"t": "Valoración a 4,75 €"
}
]
},
{
"t": "Impacto 2019",
"p": "Resultados: +12.500 € de dividendos. Patrimonio: −7.500 € en el ejercicio. Efectivo: +12.500 €."
}
],
"claves": [
"Dividendos a resultados; cambios de cotización a patrimonio mientras no se vendan."
]
},
{
"n": 4,
"titulo": "Préstamo recibido con cuotas constantes",
"tema": "Pasivos · coste amortizado",
"origen": "propia",
"enunciado": "Préstamo de 3.000.000 € recibido el 31.12.16, amortizado en cuatro pagos iguales (capital más intereses) cada 31.12, al 2 % anual.",
"supuestos": [
"Sin gastos de formalización: el coste amortizado coincide con el saldo pendiente."
],
"pasos": [
{
"t": "Cuota y cuadro",
"p": "Cuota = 3.000.000 × 2 % / (1 − 1,02⁻⁴) = 787.871,26 €.",
"tabla": {
"cap": "Cuadro de amortización (€)",
"head": [
"Año",
"Saldo inicial",
"Intereses",
"Amortización",
"Saldo final"
],
"rows": [
[
"2017",
"3.000.000,00",
"60.000,00",
"727.871,26",
"2.272.128,74"
],
[
"2018",
"2.272.128,74",
"45.442,57",
"742.428,68",
"1.529.700,06"
],
[
"2019",
"1.529.700,06",
"30.594,00",
"757.277,26",
"772.422,80"
],
[
"2020",
"772.422,80",
"15.448,46",
"772.422,80",
"0,00"
]
]
}
},
{
"t": "Ejercicio 2019",
"p": "Intereses de 2019: 30.594,00 €. Pago de 787.871,26 €. Saldo a 31.12.18: 1.529.700,06 €; a 31.12.19: 772.422,80 €.",
"a": [
{
"f": "31.12.19",
"l": [
[
"Gastos financieros",
"R",
30594.0,
0.0
],
[
"Préstamo recibido (coste amortizado)",
"P",
757277.26,
0.0
],
[
"Tesorería",
"A",
0,
787871.26
]
],
"n": "",
"t": "Intereses y pago de la cuota"
}
]
},
{
"t": "Impacto 2019",
"p": "Resultados: −30.594,00 €. Efectivo: −787.871,26 € (de los cuales 757.277,26 € son amortización de deuda). Pasivo: de 1.529.700,06 € a 772.422,80 €."
}
],
"claves": [
"Cuota constante: los intereses bajan y la amortización sube cada año."
]
},
{
"n": 5,
"titulo": "Deuda pública a valor razonable con cambios en resultados",
"tema": "Renta fija · PyG",
"origen": "propia",
"enunciado": "Deuda pública de 1.000 € de nominal con vencimiento 30.6.20 y cupón del 1 % el 30.6. Descuento: 0,75 % (31.12.18) y 0,50 % (31.12.19); el 1.7.19 se venden 1.000 títulos con el mercado al 0,6 %. 5.000 títulos a 31.12.18 y 4.000 a 31.12.19.",
"supuestos": [
"Los valores incluyen el cupón corrido. El cupón del 30.6.19 se cobra de los 5.000 títulos; el 1.7.19 los vendidos ya no lo llevan.",
"Plazos medidos en años exactos (semestres)."
],
"pasos": [
{
"t": "Valores",
"p": "31.12.18: 5.000 × [10/1,0075^0,5 + 1.010/1,0075^1,5] = 5.043.529,04 €. 31.12.19: 4.000 × 1.010/1,005^0,5 = 4.029.937,72 €. Venta del 1.7.19: 1.000 × 1.010/1,006 = 1.003.976,14 €.",
"a": [
{
"f": "30.6.19",
"l": [
[
"Tesorería",
"A",
50000,
0.0
],
[
"Intereses devengados no vencidos",
"A",
0,
25000
],
[
"Ingresos por intereses",
"R",
0,
25000
]
],
"n": "",
"t": "Cobro del cupón de los 5.000 títulos"
},
{
"f": "1.7.19",
"l": [
[
"Tesorería",
"A",
1003976.14,
0.0
],
[
"Deuda pública (valor razonable)",
"A",
0,
1003976.14
]
],
"n": "Se vende a su valor razonable de ese día: no deja resultado adicional.",
"t": "Venta de 1.000 títulos a su valor razonable"
}
]
},
{
"t": "Resultado 2019",
"p": "Resultado total = valor final + flujos cobrados − valor inicial = 4.029.937,72 + (1.003.976,14 + 50.000) − 5.043.529,04 = 40.384,82 €. De ellos, 45.000 € son intereses (25.000 € de enero a junio sobre 5.000 títulos y 20.000 € de julio a diciembre sobre 4.000) y -4.615,18 € son variación de valor razonable."
},
{
"t": "Impacto 2019",
"p": "Balance: 5.043.529,04 € a 31.12.18 y 4.029.937,72 € a 31.12.19. Resultados: +40.384,82 €. Efectivo: +1.053.976,14 € (cupón y venta)."
}
],
"claves": [
"Con valor razonable en resultados, el resultado total del año es valor final más flujos cobrados menos valor inicial."
]
},
{
"n": 6,
"titulo": "Opciones emitidas",
"tema": "Derivados",
"origen": "propia",
"enunciado": "Se emiten opciones el 30.9.19 por 250.000 €; el 31.12.19 cotizan a 325.000 €.",
"supuestos": [
"Derivado a valor razonable con cambios en resultados; la prima cobrada es un pasivo."
],
"pasos": [
{
"t": "Asientos",
"p": "Se cobra la prima y queda un pasivo por la opción emitida. A 31.12.19 el pasivo sube a 325.000 €: pérdida de 75.000 €.",
"a": [
{
"f": "30.9.19",
"l": [
[
"Tesorería",
"A",
250000,
0.0
],
[
"Opciones emitidas (pasivo)",
"P",
0,
250000
]
],
"n": "",
"t": "Emisión de las opciones"
},
{
"f": "31.12.19",
"l": [
[
"Pérdida por valoración (resultados)",
"R",
75000,
0.0
],
[
"Opciones emitidas (pasivo)",
"P",
0,
75000
]
],
"n": "",
"t": "Variación de valor razonable"
}
]
},
{
"t": "Impacto",
"p": "Balance: pasivo de 325.000 €. Resultados: −75.000 €. Efectivo: +250.000 € de prima cobrada."
}
],
"claves": [
"Quien vende la opción cobra la prima y asume un pasivo que se revalúa."
]
},
{
"n": 7,
"titulo": "Contratos de seguro: primas, riesgo en curso y siniestros",
"tema": "Seguros",
"origen": "propia",
"enunciado": "Primas facturadas 2019: 2.000.000 €. Riesgo en curso 4.000.000 € (2018) y 5.300.000 € (2019); provisión de primas no consumidas 4.200.000 € y 4.900.000 €. Deudores por primas: 200.000 € y 500.000 €. Provisión por siniestros 150.000 € y 200.000 €; acreedores por siniestros 100.000 € y 175.000 €; gastos por siniestros 700.000 €.",
"supuestos": [
"La provisión por riesgo en curso es el exceso del riesgo en curso sobre las primas no consumidas.",
"Los 700.000 € de siniestros incluyen la variación de la provisión por siniestros; los acreedores por siniestros se pagan después."
],
"pasos": [
{
"t": "Provisiones",
"p": "Riesgo en curso 2018: 4.000.000 < 4.200.000 (primas no consumidas): no hace falta provisión adicional. 2019: 5.300.000 − 4.900.000 = 400.000 €. Provisión técnica de primas: 4.200.000 → 5.300.000 € (4.900.000 + 400.000)."
},
{
"t": "Cuenta técnica",
"p": "Primas devengadas: 2.000.000 − (4.900.000 − 4.200.000) = 1.300.000 €. Provisión por riesgo en curso: −400.000 €. Siniestralidad: −700.000 €. Resultado técnico: 1.300.000 − 400.000 − 700.000 = 200.000 €.",
"a": [
{
"f": "2019",
"l": [
[
"Deudores por primas",
"A",
2000000,
0.0
],
[
"Primas (ingresos)",
"R",
0,
2000000
]
],
"n": "",
"t": "Primas facturadas"
},
{
"f": "31.12.19",
"l": [
[
"Variación de la provisión de primas no consumidas",
"R",
700000,
0.0
],
[
"Provisión para primas no consumidas",
"P",
0,
700000
]
],
"n": "",
"t": "Provisión para primas no consumidas"
},
{
"f": "31.12.19",
"l": [
[
"Dotación a la provisión por riesgo en curso",
"R",
400000,
0.0
],
[
"Provisión por riesgo en curso",
"P",
0,
400000
]
],
"n": "",
"t": "Provisión por riesgo en curso"
}
]
},
{
"t": "Flujos",
"p": "Cobros de primas: 2.000.000 − (500.000 − 200.000) = 1.700.000 €. Pagos de siniestros: 700.000 − 50.000 (provisión) − 75.000 (acreedores) = 575.000 €. Flujo neto de la actividad: +1.125.000 €."
}
],
"claves": [
"PPNC reparte la prima en el tiempo; la provisión por riesgo en curso cubre lo que la PPNC no basta para cubrir."
]
}
]
},
{
"id": "e20250124",
"fecha": "2025-01-24",
"fechaTxt": "24 de enero de 2025",
"tipo": "Examen final",
"titulo": "Contabilidad de entidades financieras y de seguro (MUCAF, 2.º curso)",
"archivos": [
[
"Examen MACAF 2 20250124.docx",
"Enunciado"
],
[
"Soluciones 20250124.xlsx",
"Hoja de cálculo con las soluciones"
]
],
"ejercicios": [
{
"n": 1,
"titulo": "Depósito con opción implícita sobre el S&P 500 y cobertura comprada",
"tema": "Derivados implícitos · coberturas",
"origen": "oficial",
"enunciado": "Bono cupón cero a tres años emitido el 1.7.23, que devuelve 1 M € más el 50 % de la revalorización del S&P 500. Tipo de pasivos a tres años: 3 %. La sociedad compra la cobertura del riesgo de mercado. La opción implícita vale 100.000 € (31.12.23) y 120.000 € (31.12.24); tipos de pasivos de igual plazo remanente: 3,1 % y 2,9 %.",
"pasos": [
{
"t": "Al emitir",
"p": "El depósito sin opción vale 1.000.000 / 1,03³ = 915.141,66 €; la opción implícita es la diferencia (84.858,34 €), un pasivo para el emisor. La cobertura que compra tiene el mismo valor: es un activo que compensa las subidas de la opción.",
"a": [
{
"f": "1.7.23",
"l": [
[
"Tesorería",
"A",
1000000,
0.0
],
[
"Depósito implícito (coste amortizado)",
"P",
0,
915141.66
],
[
"Opción implícita (pasivo)",
"P",
0,
84858.34
]
],
"n": "",
"t": "Emisión del depósito estructurado"
},
{
"f": "1.7.23",
"l": [
[
"Cobertura (opción comprada)",
"A",
84858.34,
0.0
],
[
"Tesorería",
"A",
0,
84858.34
]
],
"n": "",
"t": "Compra de la cobertura"
}
]
},
{
"t": "31.12.23",
"p": "Coste amortizado del depósito: 928.767,35 € (13.625,69 € de gasto financiero). Valor razonable del depósito al 3,1 %: 926.516,88 €, así que su diferencia con el coste amortizado es −2.250,47 € (ingreso). La opción sube a 100.000 € (pérdida de 15.141,66 €) y la cobertura gana lo mismo.",
"a": [
{
"f": "31.12.23",
"l": [
[
"Gastos financieros",
"R",
13625.69,
0.0
],
[
"Depósito implícito (coste amortizado)",
"P",
0,
13625.69
]
],
"n": "",
"t": "Gastos financieros del depósito"
},
{
"f": "31.12.23",
"l": [
[
"Depósito implícito (ajuste a valor razonable)",
"P",
2250.47,
0.0
],
[
"Variación de valor razonable del depósito (resultados)",
"R",
0,
2250.47
]
],
"n": "",
"t": "Valor razonable del depósito implícito"
},
{
"f": "31.12.23",
"l": [
[
"Variación de valor razonable de la opción (resultados)",
"R",
15141.66,
0.0
],
[
"Opción implícita (pasivo)",
"P",
0,
15141.66
]
],
"n": "",
"t": "La opción implícita sube"
},
{
"f": "31.12.23",
"l": [
[
"Cobertura (opción comprada)",
"A",
15141.66,
0.0
],
[
"Rendimiento de la cobertura (resultados)",
"R",
0,
15141.66
]
],
"n": "",
"t": "La cobertura compensa"
}
]
},
{
"t": "31.12.24",
"p": "Gastos financieros 27.863,02 €; la diferencia VR−CA pasa a +1.394,84 € (pérdida de 3.645,31 € en el año); la opción sube de 100.000 a 120.000 € (pérdida de 20.000 €) y la cobertura gana otros 20.000 €.",
"tabla": {
"cap": "Balance y resultados (€)",
"head": [
"",
"1.7.23",
"31.12.23",
"31.12.24"
],
"rows": [
[
"Coste amortizado del depósito",
"915.141,66",
"928.767,35",
"956.630,37"
],
[
"Dif. VR−CA del depósito",
"—",
"−2.250,47",
"1.394,84"
],
[
"VR del depósito implícito",
"915.141,66",
"926.516,88",
"958.025,21"
],
[
"VR de la opción implícita",
"84.858,34",
"100.000,00",
"120.000,00"
],
[
"VR del depósito estructurado",
"1.000.000,00",
"1.026.516,88",
"1.078.025,21"
],
[
"VR de la cobertura",
"84.858,34",
"100.000,00",
"120.000,00"
]
]
}
},
{
"t": "Coste total",
"p": "",
"tabla": {
"cap": "Cuenta de resultados (€)",
"head": [
"",
"2023",
"2024"
],
"rows": [
[
"Gastos financieros",
"13.625,69",
"27.863,02"
],
[
"Variación VR del depósito implícito",
"−2.250,47",
"3.645,31"
],
[
"Variación VR de la opción implícita",
"15.141,66",
"20.000,00"
],
[
"Coste total del depósito",
"26.516,88",
"51.508,33"
],
[
"Rendimiento de la cobertura",
"−15.141,66",
"−20.000,00"
],
[
"Coste total tras la cobertura",
"11.375,22",
"31.508,33"
]
]
}
}
],
"claves": [
"La cobertura neutraliza la opción, pero no los cambios de valor del depósito por los tipos de interés."
]
},
{
"n": 2,
"titulo": "Deuda pública que pasa de coste amortizado a valor razonable",
"tema": "Clasificación · reclasificación",
"origen": "oficial",
"enunciado": "Bonos del Tesoro de 1.000.000 € nominales, a tres años, comprados el 1.7.23 en subasta con TIR 3,17737 %, para cobrar los flujos. El mercado los descuenta al 3,05 % (31.12.23) y al 2,95 % (31.12.24). El 31.12.24 la sociedad decide venderlos en cuanto pueda.",
"pasos": [
{
"t": "Al comprar y a 31.12.23",
"p": "Cupón del 3 %, precio de compra 995.000 € (por debajo del nominal). A coste amortizado: 995.000 × (1 + TIR)^0,5 = 1.010.683,80 € a 31.12.23, que incluye 15.000 € de cupón corrido; los intereses del año son 15.683,80 €.",
"a": [
{
"f": "1.7.23",
"l": [
[
"Bonos del Tesoro (coste amortizado)",
"A",
995000,
0.0
],
[
"Tesorería",
"A",
0,
995000
]
],
"n": "",
"t": "Compra"
},
{
"f": "31.12.23",
"l": [
[
"Intereses devengados no vencidos",
"A",
15000,
0.0
],
[
"Bonos del Tesoro (periodificación del descuento)",
"A",
683.8,
0.0
],
[
"Ingresos financieros",
"R",
0,
15683.8
]
],
"n": "",
"t": "Intereses (cupón corrido y descuento)"
}
]
},
{
"t": "2024 y cambio de modelo de negocio",
"p": "Se cobra el cupón de 30.000 € y los intereses del año son 31.640,27 €; el coste amortizado a 31.12.24 es 1.012.324,07 €. Al decidir vender «en cuanto haya oportunidad», cambia el modelo de negocio: se reclasifica de coste amortizado a valor razonable con cambios en resultados. La diferencia (3.290,17 €) va a la cuenta de pérdidas y ganancias y cambia el TIE.",
"a": [
{
"f": "2024",
"l": [
[
"Tesorería",
"A",
30000,
0.0
],
[
"Bonos del Tesoro (coste amortizado)",
"A",
1640.27,
0.0
],
[
"Ingresos financieros",
"R",
0,
31640.27
]
],
"n": "",
"t": "Cobro del cupón y devengo"
},
{
"f": "31.12.24",
"l": [
[
"Bonos del Tesoro (ajuste a valor razonable)",
"A",
3290.17,
0.0
],
[
"Resultado por valoración (resultados)",
"R",
0,
3290.17
]
],
"n": "Valor razonable a 2,95 %: 1.015.614,24 € (oficial: 3.290,18 €).",
"t": "Reclasificación a valor razonable con cambios en resultados"
}
]
},
{
"t": "Cuadro oficial",
"p": "",
"tabla": {
"cap": "Bonos del Tesoro (€)",
"head": [
"",
"1.7.23",
"31.12.23",
"31.12.24 (antes)",
"31.12.24 (después)"
],
"rows": [
[
"Nominal",
"1.000.000",
"1.000.000",
"1.000.000",
"1.000.000"
],
[
"Dif. CA−nominal",
"−5.000,00",
"10.683,80",
"12.324,07",
"15.614,24"
],
[
"Coste amortizado / valor",
"995.000,00",
"1.010.683,80",
"1.012.324,07",
"1.015.614,24"
],
[
"Ingresos financieros",
"",
"15.683,80",
"31.640,27",
""
],
[
"Resultados por valoración",
"",
"",
"3.290,18",
""
]
]
}
}
],
"claves": [
"La reclasificación CA → VR con cambios en PyG lleva la diferencia a resultados y cambia el TIE."
]
},
{
"n": 3,
"titulo": "IFRS 17: pasivo por contrato de seguro y margen de servicio contractual",
"tema": "IFRS 17",
"origen": "oficial",
"enunciado": "Contrato de seguro que cubre siniestros durante dos años. Prima de 1.000 €; flujos de caja negativos estimados de 500 €; ajuste por riesgo no financiero de 50 € anuales; descuento al 6 %. ¿Qué pasivo por contrato de seguro y qué margen de servicio hay al comienzo y al acabar el primer año, con hipótesis sin cambios?",
"avisos": [
"El enunciado no dice cuándo se producen los flujos. La hoja de soluciones usa 500 − 50 = 450 € por año, y es lo que reproduzco aquí."
],
"pasos": [
{
"t": "Pasivo y margen al inicio",
"p": "La hoja de soluciones trata el pasivo por contrato de seguro como el valor actual de 450 € por año (500 de flujos menos 50 de ajuste por riesgo, según la hoja) durante dos años: 450 / 1,06 + 450 / 1,06² = 424,53 + 400,50 = 825,03 €. La prima cobrada (1.000 €) menos ese pasivo es el margen de servicio contractual: 174,97 €.",
"a": [
{
"f": "Inicio",
"l": [
[
"Tesorería (prima cobrada)",
"A",
1000,
0.0
],
[
"Pasivo por contrato de seguro (flujos de cumplimiento)",
"P",
0,
825.03
],
[
"Margen de servicio contractual",
"P",
0,
174.97
]
],
"n": "Sin ganancia el primer día: la diferencia queda en el margen y se libera durante la cobertura.",
"t": "Reconocimiento inicial del contrato"
}
]
},
{
"t": "Al acabar el primer año",
"p": "Queda un año de flujos: 450 / 1,06 = 424,53 € de pasivo, y el margen de servicio baja a 75,47 €. Entre pasivo y margen suman 500 €, la mitad de lo del inicio.",
"tabla": {
"cap": "Pasivo y margen (€)",
"head": [
"",
"Inicio",
"Fin del año 1"
],
"rows": [
[
"Pasivo por contrato de seguro",
"825,03",
"424,53"
],
[
"Margen de servicio contractual",
"174,97",
"75,47"
],
[
"Total",
"1.000,00",
"500,00"
]
]
}
},
{
"t": "Cálculo de la hoja",
"p": "",
"tabla": {
"cap": "Flujos (€)",
"head": [
"",
"Total",
"Año 1",
"Año 2"
],
"rows": [
[
"Suma de flujos",
"1.000",
"500",
"500"
],
[
"Ajuste por riesgo no financiero",
"−100",
"−50",
"−50"
],
[
"Neto",
"900",
"450",
"450"
],
[
"Valor actual al 6 %",
"825,03",
"424,53",
"400,50"
]
]
}
}
],
"claves": [
"IFRS 17: el beneficio esperado no se reconoce al emitir el contrato; se difiere en el margen de servicio contractual."
]
},
{
"n": 4,
"titulo": "Deterioro de un préstamo hipotecario (modelo del Banco de España)",
"tema": "Deterioro",
"origen": "oficial",
"enunciado": "Préstamo hipotecario a una familia (primera vivienda) concedido el 31.12.23, con carencia de principal los dos primeros ejercicios, al 2,5 %. Importe bruto 200.000 €, tasación 205.000 €. El 31.12.24 hay un incremento significativo del riesgo. Registrar los efectos en balance, cuenta de resultados, estado de cambios del patrimonio neto (ECPN) y estado de flujos de efectivo (EFE) en 2023 y 2024 con el modelo de deterioro del Banco de España. Este ejercicio aparece en la hoja «Soluciones», no en el enunciado en Word.",
"avisos": [
"La tabla de la hoja da un 1 % de cobertura para «normal» en hipotecas de familias, pero la fórmula de la solución aplica un 0,7 %: usa 0,7 % para el stage 1 (395,50 €). Es lo que sale de la hoja."
],
"pasos": [
{
"t": "Importe sin cobertura",
"p": "La garantía (vivienda) se descuenta un 30 %: 205.000 × (1 − 30 %) = 143.500 €. El importe sin cobertura es 200.000 − 143.500 = 56.500 €. Sobre ese importe se aplican los porcentajes de la tabla: normal (stage 1) y vigilancia especial (stage 2, 18 %).",
"tabla": {
"cap": "Deterioro (€)",
"head": [
"Concepto",
"Importe"
],
"rows": [
[
"Riesgo vivo",
"200.000,00"
],
[
"Valor de referencia (tasación)",
"205.000,00"
],
[
"Garantía tras el descuento del 30 %",
"143.500,00"
],
[
"Importe sin cobertura",
"56.500,00"
],
[
"Deterioro stage 1 (normal)",
"395,50"
],
[
"Deterioro stage 2 (vigilancia especial, 18 %)",
"10.170,00"
]
]
}
},
{
"t": "Asientos",
"p": "En 2023 se concede el préstamo y se dota el deterioro del stage 1. En 2024 se cobran 5.000 € de cupón (2,5 % de 200.000) y, por el aumento significativo del riesgo, el deterioro pasa a stage 2: de 395,50 a 10.170 €, es decir 9.774,50 € más.",
"a": [
{
"f": "31.12.23",
"l": [
[
"Inversión crediticia",
"A",
200000,
0.0
],
[
"Tesorería",
"A",
0,
200000
]
],
"n": "",
"t": "Concesión del préstamo"
},
{
"f": "31.12.23",
"l": [
[
"Pérdidas por deterioro de activos financieros",
"R",
395.5,
0.0
],
[
"Deterioro de activos financieros",
"A",
0,
395.5
]
],
"n": "El deterioro resta del activo (signo negativo).",
"t": "Deterioro stage 1"
},
{
"f": "31.12.24",
"l": [
[
"Tesorería",
"A",
5000,
0.0
],
[
"Ingresos financieros",
"R",
0,
5000
]
],
"n": "",
"t": "Cobro del cupón del 2,5 %"
},
{
"f": "31.12.24",
"l": [
[
"Pérdidas por deterioro de activos financieros",
"R",
9774.5,
0.0
],
[
"Deterioro de activos financieros",
"A",
0,
9774.5
]
],
"n": "",
"t": "Deterioro stage 2"
}
]
},
{
"t": "Impacto en los estados de 2024",
"p": "",
"tabla": {
"cap": "Estados financieros 2024 (€)",
"head": [
"Estado",
"Partida",
"Importe"
],
"rows": [
[
"Balance",
"Inversión crediticia / Deterioro",
"200.000,00 / −10.170,00"
],
[
"Cuenta de resultados",
"Pérdidas por deterioro",
"−9.774,50"
],
[
"Cuenta de resultados",
"Ingresos financieros",
"5.000,00"
],
[
"ECPN",
"Resultado del ejercicio (PyG)",
"−4.774,50"
],
[
"EFE",
"Cupones cobrados",
"5.000,00"
]
]
}
}
],
"claves": [
"El deterioro por stages: stage 1 por riesgo normal, stage 2 por incremento significativo, stage 3 por dudosos.",
"El deterioro no mueve el efectivo; solo lo hace el cupón cobrado."
]
}
]
},
{
"id": "esuper",
"fecha": "",
"fechaTxt": "Fecha no indicada",
"tipo": "Examen superextraordinario",
"titulo": "Contabilidad de entidades financieras y de seguro",
"archivos": [
[
"Examen superextraordinario.xlsx",
"Hoja de cálculo"
],
[
"Examen superextraordinario (solución).docx",
"Solución"
]
],
"aviso": "El documento no lleva fecha. Por los datos (cierres hasta 31.12.16) es posterior a esa fecha. El tipo «superextraordinario» sale del nombre del archivo.",
"ejercicios": [
{
"n": 1,
"titulo": "Bono estructurado con opción de conversión: segregado o no",
"tema": "Derivados implícitos",
"origen": "oficial",
"enunciado": "Bono emitido el 1.7.14 por 5.000.000 € a cinco años, reembolsable en efectivo o con un paquete de acciones a elección del inversor; rentabilidad implícita 2 %. La sociedad lo contabilizó segregando los componentes. El componente de deuda se descuenta al 1,75 % (31.12.14), 1,5 % (31.12.15) y 1,25 % (31.12.16); el derivado vale 100.000, 125.000 y 75.000 €. El Consejo quiere saber qué habría pasado sin segregar.",
"pasos": [
{
"t": "Valores de la deuda",
"p": "El componente de deuda se mide por 5.000.000 / 1,02⁵ = 4.528.654,05 € al emitir, y su coste amortizado crece al 2 %: 4.573.716,39 € (31.12.14), 4.665.190,72 € (31.12.15) y 4.758.494,54 € (31.12.16). Su valor razonable se obtiene descontando a los tipos de mercado: 4.624.503,62 €, 4.746.121,55 € y 4.847.104,97 €.",
"tabla": {
"cap": "Valoración (€)",
"head": [
"",
"31.12.14",
"31.12.15",
"31.12.16"
],
"rows": [
[
"Coste amortizado de la deuda",
"4.573.716,39",
"4.665.190,72",
"4.758.494,54"
],
[
"Dif. VR−CA",
"50.787,23",
"80.930,83",
"88.610,43"
],
[
"Valor razonable de la deuda",
"4.624.503,62",
"4.746.121,55",
"4.847.104,97"
],
[
"Valor razonable del derivado",
"100.000,00",
"125.000,00",
"75.000,00"
],
[
"VR del bono estructurado",
"4.724.503,62",
"4.871.121,55",
"4.922.104,97"
]
]
}
},
{
"t": "Lo que figura en balance según la opción",
"p": "Opción elegida (segregar): el balance recoge el coste amortizado de la deuda y el valor razonable del derivado en cuentas separadas, es decir, el valor razonable del bono estructurado menos la diferencia VR−CA de la deuda. Opción alternativa (sin segregar): el bono estructurado figura entero por su valor razonable.",
"tabla": {
"cap": "Balance (€)",
"head": [
"",
"31.12.14",
"31.12.15",
"31.12.16"
],
"rows": [
[
"Segregando (CA deuda + VR derivado)",
"4.673.716,39",
"4.790.190,72",
"4.833.494,54"
],
[
"Sin segregar (VR del bono)",
"4.724.503,62",
"4.871.121,55",
"4.922.104,97"
]
]
}
},
{
"t": "Resultados",
"p": "Segregando solo se reconocen los intereses de la deuda y la variación del derivado. Sin segregar se añade, además, la variación de la diferencia VR−CA de la deuda. Para el emisor, un aumento del valor razonable del pasivo es un gasto (la solución lo describe como una partida más reconocida).",
"tabla": {
"cap": "Resultados (€)",
"head": [
"",
"2015",
"2016"
],
"rows": [
[
"Intereses (coste amortizado)",
"91.474,33",
"93.303,81"
],
[
"Variación del derivado (valor)",
"25.000,00",
"−50.000,00"
],
[
"Variación dif. VR−CA de la deuda (solo sin segregar)",
"30.143,60",
"7.679,60"
]
]
}
},
{
"t": "Asientos de 2015 al segregar",
"p": "",
"a": [
{
"f": "31.12.15",
"l": [
[
"Gastos financieros",
"R",
91474.33,
0.0
],
[
"Deuda del bono (coste amortizado)",
"P",
0,
91474.33
]
],
"n": "",
"t": "Intereses de la deuda"
},
{
"f": "31.12.15",
"l": [
[
"Resultado de operaciones financieras (ROF)",
"R",
25000,
0.0
],
[
"Derivado implícito (pasivo)",
"P",
0,
25000
]
],
"n": "",
"t": "Derivado: sube de 100.000 a 125.000 €"
}
]
}
],
"claves": [
"Segregar: deuda a coste amortizado y derivado a valor razonable; sin segregar: todo a valor razonable, con una partida más en resultados."
]
},
{
"n": 2,
"titulo": "Préstamo con tres cuotas impagadas: cuánto debe pagar el deudor",
"tema": "Morosidad",
"origen": "oficial",
"enunciado": "Préstamo de 1.000.000 € concedido el 30.9.15 al 6 % nominal anual, reembolsable en ocho cuotas trimestrales constantes (133.584,02 €). Las cuotas no atendidas devengan un 4 % trimestral capitalizable trimestralmente. A 31.12.16 están impagadas las tres últimas cuotas (30.6, 30.9 y 31.12.16). Se pide el importe para cancelar la deuda el 31.12.16.",
"pasos": [
{
"t": "Cuándo es dudoso",
"p": "El 30.9.16 el préstamo pasa a dudoso: el recibo del 30.6.16 acumula tres meses de impago. Desde ahí no se reconocen intereses, ordinarios ni de demora. A 31.12.16 la deuda reconocida incluye los intereses ordinarios de las cuotas tercera y cuarta, pero los de la quinta (devengados desde el 30.9.16) y la demora posterior al 30.9.16 son reclamables sin estar reconocidos."
},
{
"t": "Situación contable a 31.12.16",
"p": "",
"tabla": {
"cap": "Situación contable y reclamable (€)",
"head": [
"Concepto",
"Importe"
],
"rows": [
[
"Capital vencido (cuotas 3, 4 y 5)",
"372.029,74"
],
[
"Capital no vencido",
"389.023,45"
],
[
"Intereses ordinarios devengados no vencidos",
"20.999,07"
],
[
"Intereses de demora contabilizados (hasta el 30.9.16)",
"5.343,36"
],
[
"Valor contable de la deuda",
"787.395,62"
],
[
"Intereses ordinarios no contabilizados (5.ª cuota)",
"7.723,26"
],
[
"Intereses de demora no contabilizados (desde el 30.9.16)",
"10.900,46"
],
[
"Importe a pagar",
"806.019,34"
]
]
}
},
{
"t": "Una discrepancia en la hoja",
"p": "La hoja de cálculo da 800.675,98 €, pero su «valor contable de la deuda» (782.052,26 €) suma solo el capital y los intereses ordinarios: deja fuera los 5.343,36 € de demora que ella misma contabiliza. La solución escrita dice «el importe contable de la deuda más los intereses de la quinta cuota más la demora de las cuotas tercera y cuarta desde el 30.9.16»; incluyendo la demora contabilizada el total es 806.019,34 €. Es la cifra coherente con el texto."
},
{
"t": "Cobro y efecto",
"p": "Al cobrar todo, la parte ya reconocida cancela el crédito y lo demás es ingreso.",
"a": [
{
"f": "31.12.16",
"l": [
[
"Tesorería",
"A",
806019.34,
0.0
],
[
"Inversión crediticia (capital)",
"A",
0,
761053.19
],
[
"Intereses ordinarios reconocidos",
"A",
0,
20999.07
],
[
"Intereses de demora reconocidos",
"A",
0,
5343.36
],
[
"Ingresos por intereses (no reconocidos hasta hoy)",
"R",
0,
18623.72
]
],
"n": "",
"t": "El deudor cancela la deuda"
}
]
}
],
"claves": [
"Los intereses de demora se capitalizan: el saldo vencido más su demora devenga más demora."
]
}
]
}
];
