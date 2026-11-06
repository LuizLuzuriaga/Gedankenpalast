# =====================================================================
# Tema 4 - Gestion de capital y medidas coherentes de riesgo (VaR / TVaR)
# Ejercicio practico en R (PerformanceAnalytics + MASS + ggplot2) - Luiz Luzuriaga
# Master en Ciencias Actuariales y Financieras - Matematica Actuarial de la
# Estabilidad y Solvencia de la Actividad Aseguradora
# (A) Caso 1 Normal, (B) Log-normal y t, (C) bonos correlacionados, (D) simulacion con
# PerformanceAnalytics, (E) Euler, (F) formula estandar frente a copulas, (G) error de estimacion.
# =====================================================================
suppressPackageStartupMessages({ library(PerformanceAnalytics); library(MASS); library(ggplot2) })

# ---- funciones ---------------------------------------------------------
var_tvar_normal <- function(p, mu, sd) { z <- qnorm(p); c(VaR = mu + sd * z, TVaR = mu + sd * dnorm(z) / (1 - p)) }
var_tvar_lognormal <- function(p, E, sd) {
  s2 <- log(1 + (sd / E)^2); s <- sqrt(s2); m <- log(E) - s2 / 2; z <- qnorm(p)
  c(VaR = exp(m + s * z), TVaR = E * pnorm(s - z) / (1 - p), mu_L = m, sigma_L = s)
}
tvar_num <- function(ppf, p, n = 20000) mean(ppf(p + (1 - p) * (seq_len(n) - .5) / n))     # (1/(1-p)) * integral de VaR_u

# ---- (A) Caso 1: Normal(5e6, 8e5) --------------------------------------
cat("== (A) Caso 1 Normal ==\n")
mu <- 5e6; sd <- 8e5; niveles <- c(.95, .99, .995, .999)
A <- do.call(rbind, lapply(niveles, function(p) {
  v <- var_tvar_normal(p, mu, sd)
  ru <- optimize(function(tt) tt + integrate(function(x) (x - tt) * dnorm(x, mu, sd), tt, mu + 12 * sd)$value / (1 - p), c(v["VaR"] - 2e5, v["VaR"] + 2e5))$objective
  data.frame(p = p, VaR = v["VaR"], TVaR = v["TVaR"], brecha = v["TVaR"] - v["VaR"], TVaR_sobre_VaR = v["TVaR"] / v["VaR"] - 1,
             TVaR_integral = tvar_num(function(u) qnorm(u, mu, sd), p), TVaR_RU = ru, capital_VaR = v["VaR"] - mu, capital_TVaR = v["TVaR"] - mu)
}))
A$extra_capital_pct <- 100 * (A$capital_TVaR / A$capital_VaR - 1); rownames(A) <- NULL; print(A, digits = 10)

# ---- (B) Log-normal y t de Student (misma media y sd) --------------------
cat("\n== (B) Log-normal y t4 ==\n")
ln <- var_tvar_lognormal(.995, mu, sd); nn <- var_tvar_normal(.995, mu, sd)
cat(sprintf("Log-normal: sigma_L^2 = %.5f sigma_L = %.5f mu_L = %.5f\n", ln["sigma_L"]^2, ln["sigma_L"], ln["mu_L"]))
cat(sprintf("99,5%%: VaR = %.0f TVaR = %.0f | capital VaR = %.0f capital TVaR = %.0f (+%.1f%%)\n", ln["VaR"], ln["TVaR"], ln["VaR"] - mu, ln["TVaR"] - mu, 100 * ((ln["TVaR"] - mu) / (ln["VaR"] - mu) - 1)))
cat(sprintf("Frente a la Normal: capital VaR +%.1f%%  capital TVaR +%.1f%%\n", 100 * ((ln["VaR"] - mu) / (nn["VaR"] - mu) - 1), 100 * ((ln["TVaR"] - mu) / (nn["TVaR"] - mu) - 1)))
nu <- 4; sc <- sd * sqrt((nu - 2) / nu)
tab_B <- do.call(rbind, lapply(c(niveles, .9999), function(p) {
  vn <- var_tvar_normal(p, mu, sd); vl <- var_tvar_lognormal(p, mu, sd); tq <- qt(p, nu)
  data.frame(p = p, VaR_N = vn["VaR"], TVaR_N = vn["TVaR"], VaR_LN = vl["VaR"], TVaR_LN = vl["TVaR"],
             VaR_t4 = mu + sc * tq, TVaR_t4 = mu + sc * dt(tq, nu) / (1 - p) * (nu + tq^2) / (nu - 1))
})); rownames(tab_B) <- NULL; print(round(tab_B), row.names = FALSE)

# ---- (C) Bonos correlacionados ---------------------------------------------
cat("\n== (C) Bonos correlacionados ==\n")
bonos <- function(rho, q = .02, L = 100, p = .975) {
  p11 <- q^2 + rho * q * (1 - q); p10 <- q - p11; p00 <- 1 - 2 * q + p11
  xs <- c(0, L, 2 * L); pr <- c(p00, 2 * p10, p11); v <- xs[which(cumsum(pr) >= p - 1e-12)[1]]
  c(P11 = p11, PS0 = 1 - p00, VaR = v, TVaR = v + sum(pmax(xs - v, 0) * pr) / (1 - p))
}
ind <- c(VaR = 0, TVaR = .02 * 100 / .025)
Cb <- do.call(rbind, lapply(c(0, .25, .5, .75, 1), function(r) { b <- bonos(r); data.frame(rho = r, P_ambos_pct = 100 * b["P11"], P_S_mayor0_pct = 100 * b["PS0"], VaR_AB = b["VaR"], VaR_suma = 0, TVaR_AB = b["TVaR"], TVaR_suma = 160, beneficio = 160 - b["TVaR"]) }))
rownames(Cb) <- NULL; print(Cb, digits = 6)
cat(sprintf("umbral rho* = %.4f ; rango admisible [%.4f, 1]\n", (.015 - .02^2) / (.02 * .98), -.02 / .98))
# Caso 2 de credito (50 M cada una, q = 1,5 %, p = 98 %)
q <- .015; E <- 50; p <- .98; pr <- c((1 - q)^2, 2 * q * (1 - q), q^2); xs <- c(0, E, 2 * E); vAB <- xs[which(cumsum(pr) >= p - 1e-12)[1]]
tAB <- vAB + sum(pmax(xs - vAB, 0) * pr) / (1 - p); tA <- q * E / (1 - p)
cat(sprintf("Credito: VaR 0+0 = 0 < %.0f | TVaR %.1f+%.1f = %.1f >= %.4f (beneficio %.2f)\n", vAB, tA, tA, 2 * tA, tAB, 2 * tA - tAB))

# ---- (D) Demostracion por simulacion con PerformanceAnalytics --------------
cat("\n== (D) Simulacion (PerformanceAnalytics) ==\n")
set.seed(123); n <- 2000
rets <- xts(rt(n, df = 4) * 0.01, order.by = seq(as.Date("2015-01-01"), by = "day", length.out = n)); colnames(rets) <- "Cartera"
cat(sprintf("VaR 97,5%%: historico %.5f | gaussiano %.5f | modificado (Cornish-Fisher) %.5f | ES historico %.5f\n",
            VaR(rets, p = .975, method = "historical", invert = FALSE), VaR(rets, p = .975, method = "gaussian", invert = FALSE),
            VaR(rets, p = .975, method = "modified", invert = FALSE), ES(rets, p = .975, method = "historical", invert = FALSE)))
set.seed(456); n_sim <- 100000; q <- .015
loss_A <- ifelse(runif(n_sim) < q, -1, rnorm(n_sim, 0, .001)); loss_B <- ifelse(runif(n_sim) < q, -1, rnorm(n_sim, 0, .001)); portfolio <- .5 * loss_A + .5 * loss_B
R2 <- xts(cbind(A = loss_A, B = loss_B, Portfolio = portfolio), order.by = seq(as.Date("2000-01-01"), by = "day", length.out = n_sim))
V98 <- VaR(R2, p = .98, method = "historical", invert = FALSE); E98 <- ES(R2, p = .98, method = "historical", invert = FALSE)
cat(sprintf("0,5*VaR(A)+0,5*VaR(B) = %.4f | VaR(Cartera) = %.4f\n", .5 * V98[1, "A"] + .5 * V98[1, "B"], V98[1, "Portfolio"]))
cat(sprintf("0,5*ES(A)+0,5*ES(B)   = %.4f | ES(Cartera)  = %.4f\n", .5 * E98[1, "A"] + .5 * E98[1, "B"], E98[1, "Portfolio"]))
# Version en perdidas positivas (misma escala que Python)
Lp <- -portfolio; La <- -loss_A; Lb <- -loss_B; esh <- function(x, p) mean(x[x >= quantile(x, p)])
cat(sprintf("En perdidas positivas: VaR suma ponderada = %.4f | VaR cartera = %.4f | ES suma ponderada = %.4f | ES cartera = %.4f\n",
            .5 * quantile(La, .98) + .5 * quantile(Lb, .98), quantile(Lp, .98), .5 * esh(La, .98) + .5 * esh(Lb, .98), esh(Lp, .98)))

# ---- (E) Asignacion de Euler ---------------------------------------------------
cat("\n== (E) Contribuciones de Euler al TVaR ==\n")
mA <- 3; sA <- .5; mB <- 2; sB <- .4; rho <- .3; p <- .995; z <- qnorm(p); k <- dnorm(z) / (1 - p)
sS <- sqrt(sA^2 + sB^2 + 2 * rho * sA * sB); covA <- sA^2 + rho * sA * sB; covB <- sB^2 + rho * sA * sB
CA <- mA + covA / sS * k; CB <- mB + covB / sS * k
set.seed(1); XY <- mvrnorm(4e6, c(mA, mB), matrix(c(sA^2, rho * sA * sB, rho * sA * sB, sB^2), 2)); S <- rowSums(XY); sel <- S > quantile(S, p)
cat(sprintf("sigma_S = %.3f VaR = %.3f TVaR = %.3f k = %.4f\n", sS, mA + mB + sS * z, mA + mB + sS * k, k))
print(data.frame(linea = c("A", "B", "A+B"), TVaR_ind = c(mA + sA * k, mB + sB * k, mA + sA * k + mB + sB * k), C_formula = c(CA, CB, CA + CB),
                 C_simulacion = c(mean(XY[sel, 1]), mean(XY[sel, 2]), mean(S[sel])), diversificacion = c(mA + sA * k - CA, mB + sB * k - CB, mA + sA * k + mB + sB * k - (mA + mB + sS * k))), digits = 4, row.names = FALSE)

# ---- (F) Formula estandar frente a copulas ---------------------------------------
cat("\n== (F) SCR: formula estandar frente a distribucion conjunta ==\n")
cat("SCR agregado (formula):", sqrt(100^2 + 80^2 + 2 * .25 * 100 * 80), "\n")
scr_sim <- function(sig, rho, n = 1e6, nu = NA, seed = 5) {
  set.seed(seed); Zs <- mvrnorm(n, c(0, 0), matrix(c(1, rho, rho, 1), 2))
  if (!is.na(nu)) { W <- rchisq(n, nu) / nu; Zs <- qnorm(pt(Zs / sqrt(W), nu)) }
  A <- exp(sig * Zs[, 1] - sig^2 / 2) * 100; B <- exp(sig * Zs[, 2] - sig^2 / 2) * 80
  sa <- quantile(A, .995) - 100; sb <- quantile(B, .995) - 80; form <- sqrt(sa^2 + sb^2 + 2 * rho * sa * sb); real <- quantile(A + B, .995) - 180
  c(SCR_A = sa, SCR_B = sb, formula = form, real = real, pct = 100 * (real / form - 1))
}
Fs <- do.call(rbind, lapply(c(.2, .5, 1), function(s) do.call(rbind, lapply(list(NA, 4, 3), function(nu) data.frame(sigma = s, copula = if (is.na(nu)) "gaussiana" else paste0("t, nu=", nu), t(scr_sim(s, .25, nu = nu)))))))
rownames(Fs) <- NULL; print(Fs, digits = 4)

# ---- (G) Error de estimacion y niveles equivalentes --------------------------------
cat("\n== (G) Error de muestreo: VaR 99,5% y ES 99% de una t4 ==\n")
set.seed(11); nu <- 4; sc <- sqrt((nu - 2) / nu)
v995 <- sc * qt(.995, nu); tq <- qt(.99, nu); es99 <- sc * dt(tq, nu) / .01 * (nu + tq^2) / (nu - 1)
est <- do.call(rbind, lapply(c(250, 2000), function(n) {
  X <- matrix(sc * rt(4000 * n, nu), 4000, n); vv <- apply(X, 1, quantile, .995); ee <- apply(X, 1, function(x) mean(x[x >= quantile(x, .99)]))
  data.frame(n = n, VaR_medio = mean(vv), error_VaR_pct = 100 * sd(vv) / v995, ES_medio = mean(ee), error_ES_pct = 100 * sd(ee) / es99)
}))
cat(sprintf("Valores verdaderos: VaR 99,5%% = %.4f  ES 99%% = %.4f\n", v995, es99)); print(est, digits = 4, row.names = FALSE)
nivel_equiv <- function(ppf) uniroot(function(pp) tvar_num(ppf, pp, 40000) - ppf(.995), c(.9, .9949))$root
dists <- list(Normal = qnorm, "t4 escalada" = function(u) sc * qt(u, 4), "Log-normal s=0,159" = function(u) qlnorm(u, 0, .15899), "Log-normal s=1" = function(u) qlnorm(u, 0, 1),
              "Pareto I alfa=3" = function(u) (1 - u)^(-1 / 3), "Pareto I alfa=2" = function(u) (1 - u)^(-1 / 2))
print(data.frame(distribucion = names(dists), p_equiv = sapply(dists, nivel_equiv), ES99_sobre_VaR995 = sapply(dists, function(f) tvar_num(f, .99, 40000) / f(.995))), digits = 4, row.names = FALSE)

# ---- Graficos -----------------------------------------------------------------------
rr <- seq(0, 1, length.out = 201); resb <- t(sapply(rr, bonos)); dfb <- rbind(data.frame(rho = rr, y = resb[, "VaR"], medida = "VaR A+B"), data.frame(rho = rr, y = resb[, "TVaR"], medida = "TVaR A+B"))
ggsave("t4_R_bonos.png", ggplot(dfb, aes(rho, y)) + geom_line(colour = "#1559a6", linewidth = 1) + facet_wrap(~medida, scales = "free_y") +
         geom_hline(data = data.frame(medida = c("VaR A+B", "TVaR A+B"), y = c(0, 160)), aes(yintercept = y), linetype = "dotted") + geom_vline(xintercept = .745, linetype = "dashed") +
         labs(title = "Bonos correlacionados: VaR 97,5% (suma = 0) y TVaR 97,5% (suma = 160)", x = "rho", y = "") + theme_minimal(base_size = 12), width = 9, height = 3.6, dpi = 130)
ps <- c(.9, .95, .99, .995, .999, .9999, .99999)
dfc <- rbind(data.frame(p = ps, y = sapply(ps, function(p) { v <- var_tvar_normal(p, mu, sd); v["TVaR"] / v["VaR"] - 1 }), d = "Normal"),
             data.frame(p = ps, y = sapply(ps, function(p) { v <- var_tvar_lognormal(p, mu, sd); v["TVaR"] / v["VaR"] - 1 }), d = "Log-normal"),
             data.frame(p = ps, y = 1 / (3 - 1), d = "Pareto alfa=3"), data.frame(p = ps, y = 1 / (2 - 1), d = "Pareto alfa=2"))
ggsave("t4_R_cola.png", ggplot(dfc, aes(p, y, colour = d)) + geom_line(linewidth = 1) + scale_x_continuous(trans = scales::trans_new("logit", function(x) log(x / (1 - x)), function(x) exp(x) / (1 + exp(x))), breaks = ps) +
         labs(title = "TVaR/VaR - 1 segun el nivel de confianza", x = "p (escala logit)", y = "TVaR/VaR - 1", colour = "") + theme_minimal(base_size = 12), width = 8, height = 3.8, dpi = 130)
