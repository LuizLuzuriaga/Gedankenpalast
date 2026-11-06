# =====================================================================
# Tema 5 - Teoria de valores extremos y riesgos catastroficos (POT / GPD)
# Ejercicio practico en R (base R + actuar + ggplot2) - Luiz Luzuriaga
# Master en Ciencias Actuariales y Financieras - Matematica Actuarial de la
# Estabilidad y Solvencia de la Actividad Aseguradora
# Nota: evd e ismev no estan instalados en este equipo; el MLE de la GPD se hace con optim()
# (equivalente a evd::fpot) y los graficos de umbral con ggplot2 (equivalentes a mrlplot/tcplot).
# Con evd instalado: fit <- evd::fpot(claims, threshold = 10, model = "gpd") da las mismas estimaciones.
# =====================================================================
suppressPackageStartupMessages({ library(actuar); library(ggplot2) })
T_ANOS <- 40; N_TOT <- 2000

# ---- Datos: la muestra de la practica de la diapositiva (Burr, semilla 123) -------
set.seed(123); claims <- rburr(2000, shape1 = 2, shape2 = 1.5, scale = 5)
write.csv(data.frame(perdida_MEUR = claims), "t5_siniestros.csv", row.names = FALSE)     # mismo fichero que usan Excel y Python
x <- sort(claims, decreasing = TRUE)
cat(sprintf("n = %d  mediana = %.2f  p95 = %.2f  maximo = %.2f  siguiente = %.2f\n", length(claims), median(claims), quantile(claims, .95), x[1], x[2]))
burr_sf <- function(z) (1 / (1 + (z / 5)^1.5))^2; burr_ppf <- function(p) 5 * ((1 - p)^(-1 / 2) - 1)^(1 / 1.5)
var_verd <- burr_ppf(.995); tv_verd <- var_verd + integrate(burr_sf, var_verd, Inf)$value / burr_sf(var_verd)
cat(sprintf("Verdad: xi = %.4f  VaR 99,5%% = %.2f  TVaR 99,5%% = %.2f\n", 1 / 3, var_verd, tv_verd))

# ---- Funciones POT-GPD ---------------------------------------------------------------
var_gpd <- function(p, u, xi, sg, n, Nu) { r <- (n / Nu) * (1 - p); if (abs(xi) > 1e-8) u + sg * expm1(-xi * log(r)) / xi else u - sg * log(r) }
tvar_gpd <- function(p, u, xi, sg, n, Nu) (var_gpd(p, u, xi, sg, n, Nu) + sg - xi * u) / (1 - xi)
nivel_retorno <- function(m, u, xi, sg, lam) if (abs(xi) > 1e-8) u + sg * expm1(xi * log(lam * m)) / xi else u + sg * log(lam * m)
dgpd <- function(y, xi, sg, log = FALSE) { z <- 1 + xi * y / sg; l <- ifelse(z > 0, -log(sg) - (1 + 1 / xi) * log(z), -Inf); if (log) l else exp(l) }
pgpd <- function(y, xi, sg) 1 - pmax(1 + xi * y / sg, 0)^(-1 / xi)
mle_gpd <- function(exc) {
  nll <- function(p) if (p[2] <= 0) Inf else -sum(dgpd(exc, p[1], p[2], log = TRUE))
  o <- optim(c(.2, mean(exc)), nll, method = "Nelder-Mead", control = list(reltol = 1e-12, maxit = 4000), hessian = TRUE)
  list(xi = o$par[1], sg = o$par[2], ll = -o$value, cov = solve(o$hessian))
}
ajuste <- function(u) { e <- claims[claims > u] - u; f <- mle_gpd(e); f$u <- u; f$Nu <- length(e); f$exc <- e; f }

# ---- (A) Casos 1 y 2 y la tabla del taller ----------------------------------------------
cat("\n== (A) Casos 1 y 2 ==\n")
caso <- list(Terremoto = c(n = 2000, T = 40, u = 10, Nu = 80, xi = .35, sg = 6), Inundacion = c(n = 1500, T = 30, u = 5, Nu = 60, xi = .25, sg = 4))
for (nm in names(caso)) { c <- caso[[nm]]; v <- var_gpd(.995, c["u"], c["xi"], c["sg"], c["n"], c["Nu"]); t <- tvar_gpd(.995, c["u"], c["xi"], c["sg"], c["n"], c["Nu"]); lam <- c["Nu"] / c["T"]
  cat(sprintf("%s: VaR %.3f TVaR %.3f brecha %.3f (+%.1f%%) | retorno 100 a %.2f 200 a %.2f\n", nm, v, t, t - v, 100 * (t / v - 1), nivel_retorno(100, c["u"], c["xi"], c["sg"], lam), nivel_retorno(200, c["u"], c["xi"], c["sg"], lam))) }
tab <- data.frame(p = c(.97, .99, .995, .999)); tab$VaR <- sapply(tab$p, var_gpd, u = 10, xi = .35, sg = 6, n = 2000, Nu = 80); tab$TVaR <- sapply(tab$p, tvar_gpd, u = 10, xi = .35, sg = 6, n = 2000, Nu = 80)
tab$TVaR_VaR <- tab$TVaR / tab$VaR; tab$brecha <- tab$TVaR - tab$VaR; print(tab, digits = 5)

# ---- (B) Umbral: sensibilidad ----------------------------------------------------------------
cat("\n== (B) Sensibilidad al umbral ==\n")
us <- c(5, 7.5, 10, 12.5, 15, 20); fits <- lapply(us, ajuste)
sens <- do.call(rbind, lapply(fits, function(f) data.frame(u = f$u, Nu = f$Nu, lam_u = f$Nu / T_ANOS, xi = f$xi, xi_inf = f$xi - 1.96 * sqrt(f$cov[1, 1]), xi_sup = f$xi + 1.96 * sqrt(f$cov[1, 1]),
                  sigma = f$sg, sigma_star = f$sg - f$xi * f$u, VaR995 = var_gpd(.995, f$u, f$xi, f$sg, N_TOT, f$Nu), TVaR995 = tvar_gpd(.995, f$u, f$xi, f$sg, N_TOT, f$Nu))))
print(sens, digits = 4, row.names = FALSE)

# ---- (C) Ajuste en u = 10 e incertidumbre ----------------------------------------------------
cat("\n== (C) MLE en u = 10 ==\n")
u <- 10; f10 <- fits[[3]]; exc <- f10$exc; Nu <- f10$Nu
cat(sprintf("Nu = %d  lambda_u = %.2f  xi = %.4f (EE %.4f)  sigma = %.4f (EE %.4f)  logL = %.3f\n", Nu, Nu / T_ANOS, f10$xi, sqrt(f10$cov[1, 1]), f10$sg, sqrt(f10$cov[2, 2]), f10$ll))
vf <- function(p) var_gpd(.995, u, p[1], p[2], N_TOT, Nu); gr <- c((vf(c(f10$xi + 1e-5, f10$sg)) - vf(c(f10$xi - 1e-5, f10$sg))) / 2e-5, (vf(c(f10$xi, f10$sg + 1e-4)) - vf(c(f10$xi, f10$sg - 1e-4))) / 2e-4)
se_var <- sqrt(t(gr) %*% f10$cov %*% gr); v10 <- vf(c(f10$xi, f10$sg)); t10 <- tvar_gpd(.995, u, f10$xi, f10$sg, N_TOT, Nu)
cat(sprintf("VaR 99,5%% = %.2f (Wald [%.2f; %.2f])  TVaR 99,5%% = %.2f\n", v10, v10 - 1.96 * se_var, v10 + 1.96 * se_var, t10))
xg <- seq(.05, .9, length.out = 200)
prof <- sapply(xg, function(xv) -optimize(function(s) -sum(dgpd(exc, xv, s, log = TRUE)), c(.1, 30))$objective)
ok <- xg[prof >= f10$ll - qchisq(.95, 1) / 2]; cat(sprintf("Perfil de xi (95%%): [%.2f; %.2f]\n", min(ok), max(ok)))
set.seed(2024); B <- 1000; boot <- t(sapply(1:B, function(b) { yb <- qgpd_r <- NULL; yb <- (f10$sg / f10$xi) * ((1 - runif(Nu))^(-f10$xi) - 1); fb <- mle_gpd(yb); c(fb$xi, var_gpd(.995, u, fb$xi, fb$sg, N_TOT, Nu), tvar_gpd(.995, u, fb$xi, fb$sg, N_TOT, Nu)) }))
boot[boot[, 1] >= .98, 2:3] <- NA
cat("Bootstrap parametrico (B=1000), IC 95%:\n"); print(apply(boot, 2, quantile, probs = c(.025, .975), na.rm = TRUE), digits = 4)
y <- sort(exc); ne <- length(y); Fp <- (seq_len(ne) - .35) / ne; a0 <- mean(y); a1 <- mean(y * (1 - Fp)); xi_pwm <- 2 - a0 / (a0 - 2 * a1); sg_pwm <- 2 * a0 * a1 / (a0 - 2 * a1)
k <- Nu; xi_hill <- mean(log(x[1:k] / x[k + 1])); kk <- Nu %/% 4; xi_pick <- log((x[kk] - x[2 * kk]) / (x[2 * kk] - x[4 * kk])) / log(2)
cat(sprintf("PWM: xi = %.3f sigma = %.3f VaR = %.2f | Hill (k=%d): xi = %.3f VaR = %.2f | Pickands (k=%d): xi = %.3f | verdad: xi = 0.333\n",
            xi_pwm, sg_pwm, var_gpd(.995, u, xi_pwm, sg_pwm, N_TOT, Nu), k, xi_hill, x[k + 1] * (k / (N_TOT * .005))^xi_hill, kk, xi_pick))

# ---- (E) De la severidad al SCR anual ----------------------------------------------------------
cat("\n== (E) SCR anual por simulacion ==\n")
sim_anual <- function(N, xi, sg, u0 = 10) {
  tot <- sum(N); anio <- rep(seq_along(N), N); xi_v <- if (length(xi) > 1) rep(xi, N) else xi; sg_v <- if (length(sg) > 1) rep(sg, N) else sg
  xs <- u0 + (sg_v / xi_v) * ((1 - runif(tot))^(-xi_v) - 1)
  S <- numeric(length(N)); sb <- rowsum(xs, anio); S[as.integer(rownames(sb))] <- sb[, 1]       # los anios sin eventos suman 0
  M <- numeric(length(N)); mb <- tapply(xs, anio, max); M[as.integer(names(mb))] <- as.numeric(mb)
  list(S = S, M = M)
}
set.seed(321); NY <- 1e6; xi0 <- .35; sg0 <- 6; lam0 <- 2
res <- function(r) c(E = mean(r$S), VaR = quantile(r$S, .995, names = FALSE), SCR = quantile(r$S, .995, names = FALSE) - mean(r$S), OEP200 = quantile(r$M, 1 - 1 / 200, names = FALSE))
r1 <- sim_anual(rpois(NY, lam0), xi0, sg0)
rr <- lam0^2 / (2.5 * lam0 - lam0); r2 <- sim_anual(rnbinom(NY, size = rr, mu = lam0), xi0, sg0)
Nu_ <- 80; cov_p <- matrix(c((1 + xi0)^2, -sg0 * (1 + xi0), -sg0 * (1 + xi0), 2 * sg0^2 * (1 + xi0)), 2) / Nu_; L <- t(chol(cov_p))
par <- cbind(xi0, sg0) [rep(1, NY), ] + t(L %*% matrix(rnorm(2 * NY), 2)); xi_s <- pmin(pmax(par[, 1], -.3), .95); sg_s <- pmax(par[, 2], 1)
r3 <- sim_anual(rpois(NY, lam0), xi_s, sg_s)
print(round(rbind("Poisson (lambda=2)" = res(r1), "Bin. Negativa (var = 2,5 media)" = res(r2), "Poisson + incertidumbre xi, sigma" = res(r3)), 1))
cat(sprintf("VaR 99,5%% de severidad por evento = %.2f M (%.0f%% del SCR simulado)\n", var_gpd(.995, 10, .35, 6, 2000, 80), 100 * var_gpd(.995, 10, .35, 6, 2000, 80) / res(r1)["SCR"]))

# ---- (F) Capa XL 40 xs 20 -------------------------------------------------------------------------
cat("\n== (F) Capa 40 xs 20 ==\n")
esp_exc <- function(d, u0, xi, sg) (sg + xi * (d - u0)) / (1 - xi) * (1 + xi * (d - u0) / sg)^(-1 / xi)
capa <- function(D, L, u0, xi, sg, lam) {
  sfy <- function(y) (1 + xi * (D + y - u0) / sg)^(-1 / xi)
  EL <- lam * (esp_exc(D, u0, xi, sg) - esp_exc(D + L, u0, xi, sg)); EY2 <- integrate(function(y) 2 * y * sfy(y), 0, L)$value; prima <- EL + .25 * sqrt(lam * EY2)
  c(xi = xi, perdida_evento = esp_exc(D, u0, xi, sg) - esp_exc(D + L, u0, xi, sg), EL_anual = EL, P_contacto = 1 - exp(-lam * sfy(0)), P_agot = 1 - exp(-lam * sfy(L)), prima_tecnica = prima, ROL = prima / L)
}
print(do.call(rbind, lapply(c(.25, .35, .45), function(xi) capa(20, 40, 10, xi, 6, 2))), digits = 4)

# ---- (G) Censura por limites de poliza -------------------------------------------------------------
cat("\n== (G) Censura ==\n")
c_lim <- 30; capped <- pmin(claims, c_lim); e_c <- capped[capped > u] - u; cens <- capped[capped > u] >= c_lim
f_naive <- mle_gpd(e_c)
nll_c <- function(p) if (p[2] <= 0) Inf else -(sum(dgpd(e_c[!cens], p[1], p[2], log = TRUE)) + sum(log(pmax(1 - pgpd(e_c[cens], p[1], p[2]), 1e-300))))
oc <- optim(c(.2, 4), nll_c, method = "Nelder-Mead", control = list(reltol = 1e-12, maxit = 4000))
cat(sprintf("Datos completos: xi = %.3f VaR = %.2f | topados (%d en 30): ingenuo xi = %.3f VaR = %.2f | censurado xi = %.3f VaR = %.2f\n", f10$xi, v10, sum(cens),
            f_naive$xi, var_gpd(.995, u, f_naive$xi, f_naive$sg, N_TOT, length(e_c)), oc$par[1], var_gpd(.995, u, oc$par[1], oc$par[2], N_TOT, length(e_c))))

# ---- Graficos -----------------------------------------------------------------------------------------
ug <- seq(1, 24, length.out = 47)
mrl <- do.call(rbind, lapply(ug, function(uu) { e <- claims[claims > uu] - uu; data.frame(u = uu, m = mean(e), lo = mean(e) - 1.96 * sd(e) / sqrt(length(e)), hi = mean(e) + 1.96 * sd(e) / sqrt(length(e))) }))
ggsave("t5_R_mrl.png", ggplot(mrl, aes(u, m)) + geom_ribbon(aes(ymin = lo, ymax = hi), alpha = .15, fill = "#1559a6") + geom_line(colour = "#1559a6") + labs(title = "Exceso medio e(u)", x = "u (M EUR)", y = "e(u)") + theme_minimal(base_size = 12), width = 6, height = 3.6, dpi = 130)
ugs <- seq(3, 22, by = 1); est <- do.call(rbind, lapply(ugs, function(uu) { f <- ajuste(uu); data.frame(u = uu, xi = f$xi, lo = f$xi - 1.96 * sqrt(f$cov[1, 1]), hi = f$xi + 1.96 * sqrt(f$cov[1, 1]), sigma_star = f$sg - f$xi * uu) }))
ggsave("t5_R_estabilidad.png", ggplot(est, aes(u, xi)) + geom_ribbon(aes(ymin = lo, ymax = hi), alpha = .15, fill = "#9a5b12") + geom_line(colour = "#9a5b12") + geom_hline(yintercept = 1 / 3, linetype = "dashed") +
         labs(title = "Estabilidad de xi (verdad 1/3)", x = "u (M EUR)", y = "xi") + theme_minimal(base_size = 12), width = 6, height = 3.6, dpi = 130)
pe <- seq_len(ne) / (ne + 1); dq <- data.frame(teo = (f10$sg / f10$xi) * ((1 - pe)^(-f10$xi) - 1), emp = y)
ggsave("t5_R_qq.png", ggplot(dq, aes(teo, emp)) + geom_point(size = .8, colour = "#1559a6") + geom_abline() + labs(title = "QQ-plot de los excesos (GPD)", x = "cuantil teorico", y = "exceso observado") + theme_minimal(base_size = 12), width = 5, height = 3.8, dpi = 130)
