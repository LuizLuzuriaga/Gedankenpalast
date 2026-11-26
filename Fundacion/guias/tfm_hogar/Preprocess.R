# Copia publica del script: sin datos de la base (la base de datos NO esta en este repositorio).
# ============================================================
# Preprocess.R - Carga de la BBDD de Hogar
# Ejecutar con el directorio de trabajo en la carpeta TFM
# (comprueba con getwd())
# Librerias============================================================

library(tidyverse)
library(readxl)
library(dplyr)

# --- 1. Ruta del archivo -------------------------------------
getwd() #Solo te muestra dónde estás parado en la consola

readxl::excel_sheets("Datos//base de datos de hogar.xlsx") # Muestra las hojas del Excel.
#Utiliza read_excel y guarda el contenido en una variable (ej: mi_base)
mi_base <- read_excel("Datos//base de datos de hogar.xlsx")
#Por defecto, read_excel lee la primera hoja del archivo.
head(mi_base)  #Muestra las primeras filas de la base de datos
#Como solo nos interesa la primera hoja, etsa bien asi.
tail(mi_base) #Muestra las últimas filas de la base de datos
dim(mi_base) #Muestra dimensiones del DataFrame (filas, columnas)

#--- 2. Guardar la BBDD tratada como .RDATA -------------------------------------
#Ahora revisaremos los tipos de datos de cada Variable.
str(mi_base) #Muestra los tipos de datos de cada variable
gplots::textplot(data.frame(Variable = names(mi_base), Tipo = vapply(mi_base, function(x) paste(class(x), collapse=", "), character(1))), show.rownames = FALSE)


#PRNETA11, PRNETA12 (primas netas, sin descriptivo: confirmar que son 11 y 12), CAP_ENSERES,
#CAP_RCGENERAL, CAP_VIVIENDA (capitales) y COSTE (coste de siniestros) son importes y deberian ser num.
#ULT_REFORMA (codigos 1, 2, "*", "." sin descriptivo) y HPOL_MOT_FIN (91 Voluntaria, 92 Falta de pago,
#  BS Siniestralidad, BR Cambio de producto, BX Deuda, BP Baja) son chr.
#  OJO: en HPOL_MOT_FIN el NA NO es dato perdido: significa que la poliza NO se ha anulado.
#  En ULT_REFORMA "." y "*" parecen marcas de "sin informar": unificarlos con NA y valorar si es informativa.
#TVIVIENDA (A,B,C,D,E,H,I,M,U; 9 tipos agrupables en 5 familias: pisos, chalets, adosados/bajos/aticos,
#  movil/caravana, otros), INQPRO (P/I), HABSE (H/S), FPAGO (A/S/T) y cliente descuento (NO/SI)
#  estan como chr. Pasarlas a factor (y fijar el nivel de referencia para el GLM).
#CANAL es un codigo de MODALIDAD (1 a 93, no 1 a 7) que esta como num: pasarlo a factor, pero con 93 niveles
#  y muchos vacios conviene derivar de el el canal (Agentes 01 / Corredores 02) y el proveedor (1-10)
#  y agrupar niveles raros. Su "0" significa sin modalidad y el vacio sin informar.
#ID es un identificador (chr): no es predictor. NUMSINIESTROS_TOTAL, SS_*, REHUSADOS, SINIESTRO, EDAD, M2,
#  ANO_CONSTR, mes y anti_poliza son numericas (conteos o medidas), no factores.
#AVISO FUGA: SINIESTRO y COSTE son del periodo actual (variables respuesta); NUMSINIESTROS_TOTAL y SS_* son
#  historicos y pueden incluir ese periodo: no usarlos como predictores sin fijar antes el corte temporal.

df_hogar <- mi_base #Renombramos la base de datos para trabajar con ella

# 2.1 FECHAALTA
#  Se pasa a Date con as.Date(). Util para derivar la EXPOSICION (no hay columna explicita).

class(df_hogar$FECHAALTA)            # que tipo ha leido readxl
head(df_hogar$FECHAALTA)             # como son los valores crudos
sum(is.na(df_hogar$FECHAALTA))       # NA antes de convertir

# readxl ya la ha leido como fecha-hora (POSIXct), asi que NO hace falta el origen de Excel:
# solo quitamos la hora para quedarnos con la fecha (Date).
df_hogar <- df_hogar %>%
  mutate(FECHAALTA = as.Date(FECHAALTA))

class(df_hogar$FECHAALTA)            # ahora debe ser "Date"
sum(is.na(df_hogar$FECHAALTA))       # si sube respecto al de antes, hubo valores no convertibles
range(df_hogar$FECHAALTA, na.rm = TRUE) # comprobar que el rango de altas es razonable
# Resultado: Date, sin NA y rango coherente. FECHAALTA queda lista.

# 2.2 PRNETA11 (prima neta; sin descriptivo)
class(df_hogar$PRNETA11)                 # tipo: deberia ser numerico
# Resultado: es "character", asi que summary no da cuartiles y ggplot no puede dibujarla.
# Antes de convertir, hay que ver POR QUE es texto.
head(df_hogar$PRNETA11, 20)              # como son los valores (coma decimal? simbolos?)
sum(is.na(df_hogar$PRNETA11))            # NA que ya trae

# Valores que NO se pueden pasar a numero (sin modificar df_hogar):
num_prueba <- suppressWarnings(as.numeric(df_hogar$PRNETA11))
no_convertibles <- df_hogar$PRNETA11[is.na(num_prueba) & !is.na(df_hogar$PRNETA11)]
length(no_convertibles)                  # cuantos son
head(sort(table(no_convertibles), decreasing = TRUE), 20)  # cuales y cuantas veces
# Resultado: 0 no convertibles, asi que as.numeric no pierde ningun dato.

df_hogar <- df_hogar %>%
  mutate(PRNETA11 = as.numeric(PRNETA11))

class(df_hogar$PRNETA11)                 # ahora "numeric"
summary(df_hogar$PRNETA11)               # minimo, cuartiles, media, maximo y NA
sum(df_hogar$PRNETA11 <= 0)              # primas a 0 o negativas
ggplot(df_hogar, aes(PRNETA11)) + geom_histogram(bins = 50)   # forma de la distribucion
ggplot(df_hogar, aes(y = PRNETA11)) + geom_boxplot()          # outliers
# Resultado: sin NA ni primas <= 0, pero el maximo es muchas veces la mediana:
# cola derecha muy larga (el histograma casi no la deja ver). Ver cuanto pesa y si se justifica.

quantile(df_hogar$PRNETA11, c(.90, .99, .999, .9999, 1))   # donde empieza a dispararse la cola
sum(df_hogar$PRNETA11 > 500)             # cuantas pólizas pasan de 500
sum(df_hogar$PRNETA11 > 1000)            # y de 1000
df_hogar %>%                             # las 10 primas mas altas, con variables que las explican
  arrange(desc(PRNETA11)) %>%
  select(PRNETA11, TVIVIENDA, M2, CAP_VIVIENDA, CAP_ENSERES, EDAD, NUMSINIESTROS_TOTAL) %>%
  head(10)





str(df_hogar)

save(mi_base, df_hogar, file = "R//BBDDhog.RDATA") #Guarda la BBDD (original y tratada) como .RDATA
