# =====================================================================
# Tema 2 - Modelo individual del coste total de siniestralidad
# Ejercicio practico en R (base R + ggplot2) - Luiz Luzuriaga
# Master en Ciencias Actuariales y Financieras - Matematica Actuarial de la
# Estabilidad y Solvencia de la Actividad Aseguradora
# (A) 8 polizas, (B) Caso 1 Vida, (C) Caso 2 Accidentes, (D) 3 polizas,
# (E) la Normal frente a la escala de la cartera.
# Nota: la diapositiva usa library(distr); aqui se usa rbinom() de base R,
# que genera exactamente la misma Binomial(n, q) sin depender del paquete.
# =====================================================================
suppressPackageStartupMessages(library(ggplot2))
P_NIVEL <- 0.995; Z <- qnorm(P_NIVEL)

# ---- funciones --------------------------------------------------------
momentos_degenerada <- function(n, q, b)               # severidad fija b, n polizas iguales
  list(E = n * q * b, V = n * q * (1 - q) * b^2, m3 = n * b^3 * q * (1 - q) * (1 - 2 * q))

aproximaciones <- function(E, V, m3, p = P_NIVEL) {
  E <- unname(E); V <- unname(V); m3 <- unname(m3)          # quita nombres para que c() devuelva etiquetas limpias
  sd <- sqrt(V); g <- m3 / sd^3; z <- qnorm(p)
  a <- 4 / g^2; beta <- 2 / (sd * g); k <- E - 2 * sd / g      # Gamma trasladada: S ~ k + Gamma(a, tasa = beta)
  c(SD = sd, asimetria = g, Normal = E + z * sd,
    Gamma_tras = k + qgamma(p, shape = a, rate = beta),
    Normal_Power = E + sd * (z + g / 6 * (z^2 - 1)), alpha = a, beta = beta, k = k)
}

conv <- function(a, b) pmax(convolve(a, rev(b), type = "open"), 0)
pmf_exacta <- function(n, q, b, unit) {                  # convolucion de b_g * Bin(n_g, q_g) en rejilla `unit`
  P <- 1
  for (g in seq_along(n)) {
    u <- round(b[g] / unit); pm <- dbinom(0:n[g], n[g], q[g])
    arr <- numeric(n[g] * u + 1); arr[seq(1, length(arr), by = u)] <- pm
    P <- conv(P, arr)
  }
  P / sum(P)
}
var_exacto <- function(P, unit, p = P_NIVEL) unit * (which(cumsum(P) >= p)[1] - 1)

# ---- (A) Cartera de 8 polizas -----------------------------------------
pol <- data.frame(q = c(.0015, .002, .0025, .003, .004, .005, .006, .008),
                  b = c(120e3, 150e3, 100e3, 200e3, 80e3, 250e3, 90e3, 300e3))
m <- momentos_degenerada(1, pol$q, pol$b); pol$E <- m$E; pol$Var <- m$V; pol$mu3 <- m$m3
cat("== (A) 8 polizas ==\n"); print(pol, digits = 10)
tot <- colSums(pol[, c("E", "Var", "mu3")]); print(tot)
ap8 <- aproximaciones(tot["E"], tot["Var"], tot["mu3"])
P8 <- pmf_exacta(rep(1, 8), pol$q, pol$b, 10000); VaR8 <- var_exacto(P8, 10000)
res8 <- data.frame(metodo = c("Normal (TCL)", "Gamma trasladada", "Normal Power", "Exacta (convolucion)"),
                   VaR995 = c(ap8["Normal"], ap8["Gamma_tras"], ap8["Normal_Power"], VaR8))
res8$capital <- res8$VaR995 - tot["E"]
cat(sprintf("\nSD = %.1f  asimetria = %.4f  alpha = %.4f  beta = %.3e  k = %.1f\n", ap8["SD"], ap8["asimetria"], ap8["alpha"], ap8["beta"], ap8["k"]))
print(res8, digits = 7)

# ---- (B) Caso 1: Vida, 1.000 polizas ----------------------------------
g1 <- data.frame(grupo = LETTERS[1:4], n = c(500, 300, 150, 50), q = c(.002, .004, .006, .010), b = c(1e5, 1.5e5, 2e5, 3e5))
m <- momentos_degenerada(g1$n, g1$q, g1$b); g1$E <- m$E; g1$Var <- m$V; g1$mu3 <- m$m3
g1$pctVar <- 100 * g1$Var / sum(g1$Var); g1$pctE <- 100 * g1$E / sum(g1$E)
cat("\n== (B) Caso 1 ==\n"); print(g1, digits = 8)
t1 <- colSums(g1[, c("E", "Var", "mu3")]); ap1 <- aproximaciones(t1["E"], t1["Var"], t1["mu3"])
P1 <- pmf_exacta(g1$n, g1$q, g1$b, 50000); VaR1 <- var_exacto(P1, 50000)
set.seed(123); n_sim <- 100000
S <- numeric(n_sim)
for (g in 1:nrow(g1)) S <- S + rbinom(n_sim, g1$n[g], g1$q[g]) * g1$b[g]
res1 <- data.frame(metodo = c("Normal (enunciado)", "Gamma trasladada", "Normal Power", "Exacta (convolucion)", "Monte Carlo (100.000)"),
                   VaR995 = c(ap1["Normal"], ap1["Gamma_tras"], ap1["Normal_Power"], VaR1, quantile(S, P_NIVEL, names = FALSE)))
res1$capital <- res1$VaR995 - t1["E"]; res1$capital_sobre_E_pct <- 100 * res1$capital / t1["E"]
cat(sprintf("\nE(S) = %.0f  Var = %.0f  SD = %.0f  asimetria = %.4f\n", t1["E"], t1["Var"], ap1["SD"], ap1["asimetria"]))
cat(sprintf("Monte Carlo: media %.0f, SD %.0f\n", mean(S), sd(S))); print(res1, digits = 8)

# ---- (C) Caso 2: Accidentes, severidad Uniforme(0, M) -----------------
g2 <- data.frame(n = c(100, 200, 50), q = c(.05, .06, .08), M = c(5e3, 8e3, 12e3))
m1 <- g2$q * g2$M / 2; m2 <- g2$q * g2$M^2 / 3; m3c <- g2$q * g2$M^3 / 4
g2$E <- g2$n * m1; g2$Var <- g2$n * (m2 - m1^2); g2$mu3 <- g2$n * (m3c - 3 * m1 * m2 + 2 * m1^3)
t2 <- colSums(g2[, c("E", "Var", "mu3")]); ap2 <- aproximaciones(t2["E"], t2["Var"], t2["mu3"])
set.seed(123); S2 <- numeric(n_sim)
for (g in 1:nrow(g2)) {
  k <- rbinom(n_sim, g2$n[g], g2$q[g])
  S2 <- S2 + vapply(k, function(kk) if (kk > 0) sum(runif(kk, 0, g2$M[g])) else 0, numeric(1))
}
res2 <- data.frame(metodo = c("Normal (enunciado)", "Gamma trasladada", "Normal Power", "Monte Carlo (100.000)"),
                   VaR995 = c(ap2["Normal"], ap2["Gamma_tras"], ap2["Normal_Power"], quantile(S2, P_NIVEL, names = FALSE)))
res2$VaR_sobre_E <- res2$VaR995 / t2["E"]
cat("\n== (C) Caso 2 ==\n"); print(g2, digits = 10)
cat(sprintf("E(S) = %.0f  Var = %.0f  SD = %.0f  asimetria = %.4f\n", t2["E"], t2["Var"], ap2["SD"], ap2["asimetria"])); print(res2, digits = 8)

# ---- (D) 3 polizas ------------------------------------------------------
q3 <- c(.01, .02, .03); b3 <- c(1e5, 1.5e5, 2e5); m <- momentos_degenerada(1, q3, b3)
E3 <- sum(m$E); V3 <- sum(m$V); m33 <- sum(m$m3); P3 <- pmf_exacta(rep(1, 3), q3, b3, 50000)
d3 <- do.call(rbind, lapply(c(.90, .95, .995), function(p) {
  a <- aproximaciones(E3, V3, m33, p)
  data.frame(p = p, Normal = a["Normal"], Gamma_tras = a["Gamma_tras"], Normal_Power = a["Normal_Power"], Exacto = var_exacto(P3, 50000, p))
}))
cat(sprintf("\n== (D) 3 polizas ==  E = %.0f  Var = %.0f  asimetria = %.3f  P(S=0) = %.4f\n", E3, V3, m33 / V3^1.5, P3[1])); print(d3, digits = 7, row.names = FALSE)

# ---- (E) Escala de la cartera -------------------------------------------
esc <- do.call(rbind, lapply(c(1, 2, 5, 10, 25, 50), function(k) {
  nk <- g1$n * k; mm <- momentos_degenerada(nk, g1$q, g1$b)
  a <- aproximaciones(sum(mm$E), sum(mm$V), sum(mm$m3)); v <- var_exacto(pmf_exacta(nk, g1$q, g1$b, 50000), 50000)
  data.frame(k = k, polizas = sum(nk), asimetria = a["asimetria"],
             err_Normal = 100 * (a["Normal"] / v - 1), err_NP = 100 * (a["Normal_Power"] / v - 1), err_Gamma = 100 * (a["Gamma_tras"] / v - 1))
}))
cat("\n== (E) Error del VaR 99,5% frente al exacto segun el tamano (%) ==\n"); print(esc, digits = 4, row.names = FALSE)

# ---- Graficos -----------------------------------------------------------
dfx <- data.frame(S = (0:(length(P1) - 1)) * 50000 / 1e6, p = P1)
g_a <- ggplot(dfx, aes(S, p)) + geom_col(width = 0.045, fill = "#1559a6") + coord_cartesian(xlim = c(0, 2.6)) +
  geom_vline(xintercept = ap1["Normal"] / 1e6, colour = "#b3261e", linetype = "dashed") +
  geom_vline(xintercept = VaR1 / 1e6, colour = "black") +
  labs(title = "Caso 1: distribucion exacta de S (negro = VaR exacto, rojo = Normal)", x = "S (millones EUR)", y = "probabilidad") + theme_minimal(base_size = 12)
ggsave("t2_R_exacta.png", g_a, width = 8, height = 3.8, dpi = 130)
g_b <- ggplot(data.frame(S = S / 1e6), aes(S)) + geom_histogram(bins = 60, fill = "#1b2a4a", colour = "white") +
  geom_vline(xintercept = quantile(S, P_NIVEL) / 1e6, colour = "#9a5b12", linewidth = 1) +
  geom_vline(xintercept = ap1["Normal"] / 1e6, colour = "#b3261e", linetype = "dashed", linewidth = 1) +
  labs(title = "Monte Carlo (100.000): VaR simulado (ocre) frente a Normal (rojo)", x = "S (millones EUR)", y = "frecuencia") + theme_minimal(base_size = 12)
ggsave("t2_R_mc.png", g_b, width = 8, height = 3.8, dpi = 130)
g_c <- ggplot(esc, aes(polizas)) + geom_line(aes(y = err_Normal, colour = "Normal")) + geom_point(aes(y = err_Normal, colour = "Normal")) +
  geom_line(aes(y = err_NP, colour = "Normal Power")) + geom_point(aes(y = err_NP, colour = "Normal Power")) +
  geom_line(aes(y = err_Gamma, colour = "Gamma trasladada")) + geom_point(aes(y = err_Gamma, colour = "Gamma trasladada")) +
  scale_x_log10() + geom_hline(yintercept = 0) + labs(x = "numero de polizas", y = "error VaR 99,5% (%)", colour = "", title = "El error de la Normal cae lentamente con el tamano") +
  theme_minimal(base_size = 12)
ggsave("t2_R_escala.png", g_c, width = 7, height = 3.8, dpi = 130)
