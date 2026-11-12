# =====================================================================
# Tema 6 - Dependencia no lineal y modelizacion de colas con copulas
# Ejercicio practico en R (base R + MASS + mvtnorm) - Luiz Luzuriaga
# Master en Ciencias Actuariales y Financieras - Matematica Actuarial de la
# Estabilidad y Solvencia de la Actividad Aseguradora
# Nota: el paquete 'copula' no esta instalado en este equipo; las copulas se programan desde cero
# (equivalen a normalCopula/tCopula/claytonCopula/gumbelCopula/frankCopula, rCopula, fitCopula y gofCopula del paquete).
# Con 'copula' instalado: rCopula(n, claytonCopula(th)), fitCopula(tCopula(dim=2, df.fixed=FALSE), pobs(cbind(X,Y)), method="mle"), etc.
# El fichero t6_muestra_copula_t15.csv es el mismo que usan Excel y Python (se regenera con el proceso de las diapositivas).
# =====================================================================
suppressPackageStartupMessages({ library(MASS); library(mvtnorm) })
z995 <- qnorm(0.995)
scr_gauss <- function(S, P) sqrt(drop(S %*% P %*% S))
lam_clayton <- function(th) 2^(-1 / th)
lam_gumbel  <- function(th) 2 - 2^(1 / th)
lam_t       <- function(rho, nu) 2 * pt(-sqrt((nu + 1) * (1 - rho) / (1 + rho)), nu + 1)
debye1      <- function(th) integrate(function(t) t / expm1(t), 0, th)$value / th
tau_frank   <- function(th) 1 - 4 * (1 - debye1(th)) / th
th_frank    <- function(tau) uniroot(function(th) tau_frank(th) - tau, c(1e-6, 60), tol = 1e-12)$root
rho_from_tau <- function(t) sin(pi * t / 2)
th_clayton  <- function(t) 2 * t / (1 - t)
th_gumbel   <- function(t) 1 / (1 - t)

# ---------------- (A) Casos 1 y 2 ----------------
m <- 40; u <- 30; rho <- 0.25; rec <- 0.13
scr <- scr_gauss(c(m, u), matrix(c(1, rho, rho, 1), 2))
cat(sprintf("CASO 1  SCR estandar = %.4f   beneficio de diversificacion = %.4f (%.1f%% de la suma)\n", scr, m + u - scr, 100 * (m + u - scr) / (m + u)))
cat(sprintf("        SCR con recargo de cola = %.4f   capital adicional = %.4f M euros\n", scr * (1 + rec), scr * rec))
sens <- data.frame(rho = c(0, .25, .5, .75))
sens$SCR_estandar <- sapply(sens$rho, function(r) scr_gauss(c(m, u), matrix(c(1, r, r, 1), 2)))
sens$SCR_mas_13 <- sens$SCR_estandar * 1.13; sens$adicional <- sens$SCR_estandar * .13; sens$adicional_sobre_suma <- sens$adicional / (m + u)
print(round(sens, 4), row.names = FALSE)
th2 <- 1.5
cat(sprintf("\nCASO 2  lambda_L = 2^(-1/%.1f) = %.4f  ->  %.1f%% de contagio asintotico\n", th2, lam_clayton(th2), 100 * lam_clayton(th2)))
cat(sprintf("        tau = theta/(theta+2) = %.4f; rho Gaussiana con igual tau = %.4f\n", th2 / (th2 + 2), rho_from_tau(th2 / (th2 + 2))))
tau0 <- .5
perfil <- data.frame(familia = c("Gaussiana", "t (nu=15)", "t (nu=4)", "Clayton", "Gumbel", "Frank"),
  parametro = c(rho_from_tau(tau0), rho_from_tau(tau0), rho_from_tau(tau0), th_clayton(tau0), th_gumbel(tau0), th_frank(tau0)),
  lambda_L = c(0, lam_t(rho_from_tau(tau0), 15), lam_t(rho_from_tau(tau0), 4), lam_clayton(th_clayton(tau0)), 0, 0),
  lambda_U = c(0, lam_t(rho_from_tau(tau0), 15), lam_t(rho_from_tau(tau0), 4), 0, lam_gumbel(th_gumbel(tau0)), 0))
cat("\ntheta de cada familia con tau = 0,5 y su cola:\n"); print(format(perfil, digits = 4), row.names = FALSE)

# ---------------- (B) Limites de Pearson ----------------
set.seed(2026)
X1 <- rnorm(5e5); Y1 <- X1^2
cat(sprintf("\n1) Y = X^2: Pearson = %+.4f  Spearman = %+.4f\n", cor(X1, Y1), cor(X1, Y1, method = "spearman")))
Z <- matrix(rnorm(8e5), ncol = 2); Z[, 2] <- .7 * Z[, 1] + sqrt(1 - .49) * Z[, 2]
cat(sprintf("2) normales rho=0,7: Pearson = %.4f; tras exp(): %.4f (teorico %.4f); tau antes %.4f y despues %.4f\n", cor(Z[, 1], Z[, 2]), cor(exp(Z[, 1]), exp(Z[, 2])),
            (exp(.7) - 1) / (exp(1) - 1), cor(Z[1:5000, 1], Z[1:5000, 2], method = "kendall"), cor(exp(Z[1:5000, 1]), exp(Z[1:5000, 2]), method = "kendall")))

# ---------------- (D) Simuladores desde cero ----------------
r_gauss <- function(n, rho) pnorm(matrix(rnorm(2 * n), n) %*% chol(matrix(c(1, rho, rho, 1), 2)))
r_t <- function(n, rho, nu) pt((matrix(rnorm(2 * n), n) %*% chol(matrix(c(1, rho, rho, 1), 2))) / sqrt(rchisq(n, nu) / nu), nu)
r_clayton <- function(n, th, d = 2) { V <- rgamma(n, shape = 1 / th); E <- matrix(rexp(d * n), n); (1 + E / V)^(-1 / th) }
r_gumbel <- function(n, th, d = 2) {
  a <- 1 / th; Th <- runif(n, 0, pi); W <- rexp(n)
  V <- sin(a * Th) / sin(Th)^(1 / a) * (sin((1 - a) * Th) / W)^((1 - a) / a); E <- matrix(rexp(d * n), n); exp(-(E / V)^(1 / th))
}
r_clayton_cond <- function(n, th) { u <- runif(n); w <- runif(n); cbind(u, (1 + u^(-th) * (w^(-th / (1 + th)) - 1))^(-1 / th)) }
r_frank_cond <- function(n, th) { u <- runif(n); w <- runif(n); cbind(u, -log1p(w * expm1(-th) / (w + (1 - w) * exp(-th * u))) / th) }
rot <- function(U) 1 - U
lam_emp <- function(U, q, upper = TRUE) if (upper) mean(U[, 1] > q & U[, 2] > q) / mean(U[, 1] > q) else mean(U[, 1] < 1 - q & U[, 2] < 1 - q) / mean(U[, 1] < 1 - q)

set.seed(123); N <- 4e5
sims <- list("Gaussiana" = r_gauss(N, rho_from_tau(.5)), "t nu=4" = r_t(N, rho_from_tau(.5), 4), "Clayton (MO)" = r_clayton(N, th_clayton(.5)),
             "Clayton (condicional)" = r_clayton_cond(N, th_clayton(.5)), "Gumbel (MO)" = r_gumbel(N, th_gumbel(.5)), "Frank (condicional)" = r_frank_cond(N, th_frank(.5)))
val <- do.call(rbind, lapply(names(sims), function(k) { U <- sims[[k]]
  data.frame(simulador = k, KS_marginal = max(ks.test(U[1:50000, 1], "punif")$statistic, ks.test(U[1:50000, 2], "punif")$statistic),
             tau_emp = cor(U[1:20000, 1], U[1:20000, 2], method = "kendall"), lamL_099 = lam_emp(U, .99, FALSE), lamU_099 = lam_emp(U, .99, TRUE)) }))
cat("\nValidacion con 400.000 pares: marginales U(0,1), tau empirica (objetivo 0,5) y P(V>q|U>q) con q=0,99\n"); print(format(val, digits = 3), row.names = FALSE)
png("t6_R_galeria.png", 1500, 950, res = 150); par(mfrow = c(2, 3), mar = c(3, 3, 2, 1))
for (k in names(sims)) plot(sims[[k]][1:2500, 1], sims[[k]][1:2500, 2], pch = 20, cex = .35, col = rgb(0, .2, .6, .5), main = paste(k, "· tau = 0,5"), xlab = "", ylab = "", xlim = 0:1, ylim = 0:1, asp = 1)
dev.off()

# ---------------- (C) Gaussiana frente a Clayton rotada (practica del PDF) ----------------
tau_g <- 2 / pi * asin(rho); th_c <- th_clayton(tau_g)
cat(sprintf("\ntau de Kendall de la Gaussiana(0,25) = %.6f   theta de Clayton con esa tau = %.6f   lambda_U de la Clayton rotada = %.4f\n", tau_g, th_c, lam_clayton(th_c)))
sd_m <- m / z995; sd_u <- u / z995
perdida <- function(U) qnorm(U[, 1], 0, sd_m) + qnorm(U[, 2], 0, sd_u)
vt <- function(L, q = .995) { v <- unname(quantile(L, q)); c(VaR = v, TVaR = mean(L[L >= v])) }
for (cfg in list(c(1e5, 123), c(2e6, 7))) {
  set.seed(cfg[2]); ns <- cfg[1]
  g <- vt(perdida(r_gauss(ns, rho))); c1 <- vt(perdida(rot(r_clayton(ns, th_c)))); c0 <- vt(perdida(r_clayton(ns, th_c)))
  cat(sprintf("\nn = %s:  VaR99,5  Gaussiana = %.2f   Clayton rotada = %.2f (%+.1f%%)   Clayton sin rotar = %.2f (%+.1f%%)\n", format(ns, big.mark = ".", scientific = FALSE), g[1], c1[1], 100 * (c1[1] / g[1] - 1), c0[1], 100 * (c0[1] / g[1] - 1)))
  cat(sprintf("             TVaR99,5 Gaussiana = %.2f   Clayton rotada = %.2f (%+.1f%%)\n", g[2], c1[2], 100 * (c1[2] / g[2] - 1)))
}
cat(sprintf("\nFormula estandar (Caso 1) = %.2f M euros; con +13%% = %.2f M euros.\n", scr, scr * 1.13))
set.seed(99); uu <- runif(1e6); ww <- runif(1e6)
var_rot_clayton <- function(th) { v <- (1 + uu^(-th) * (ww^(-th / (1 + th)) - 1))^(-1 / th); unname(quantile(perdida(rot(cbind(uu, v))), .995)) }
th13 <- uniroot(function(th) var_rot_clayton(th) / scr - 1.13, c(.05, 6), tol = 1e-6)$root
cat(sprintf("theta de la Clayton rotada para un recargo del 13%%: theta = %.3f  ->  tau = %.3f, lambda_U = %.3f\n", th13, th13 / (th13 + 2), lam_clayton(th13)))
ths <- c(.2, .384, .6, 1, 1.5, 2, 3)
cat("Curva recargo(theta) respecto a la formula estandar (VaR Gaussiana exacto = 55,68):\n")
print(format(data.frame(theta = ths, tau = ths / (ths + 2), lambda_U = lam_clayton(ths), recargo = sapply(ths, function(t) var_rot_clayton(t) / scr - 1)), digits = 4), row.names = FALSE)

# ---------------- (E) Ajuste de copulas ----------------
dat <- read.csv("t6_muestra_copula_t15.csv"); X <- dat$X_perdida_mercado; Y <- dat$Y_siniestralidad; n <- length(X)
cat("\nDescriptivos:\n"); print(round(sapply(dat[, 2:3], function(v) c(mean = mean(v), sd = sd(v), min = min(v), mediana = median(v), max = max(v))), 3))
cat(sprintf("\nPearson = %.3f  Spearman = %.3f  Kendall = %.3f   (verdad sin ruido: tau = %.3f)\n", cor(X, Y), cor(X, Y, method = "spearman"), cor(X, Y, method = "kendall"), 2 / pi * asin(.7)))
Uh <- cbind(rank(X), rank(Y)) / (n + 1)
cat("pseudo-observaciones: min =", round(min(Uh), 5), " max =", round(max(Uh), 5), "\n")
ll_gauss <- function(U, r) { x <- qnorm(U[, 1]); y <- qnorm(U[, 2]); -.5 * log1p(-r^2) - (r^2 * (x^2 + y^2) - 2 * r * x * y) / (2 * (1 - r^2)) }
ll_t <- function(U, r, nu) { x <- qt(U[, 1], nu); y <- qt(U[, 2], nu)
  l2 <- lgamma((nu + 2) / 2) - lgamma(nu / 2) - log(nu * pi) - .5 * log1p(-r^2) - (nu + 2) / 2 * log1p((x^2 - 2 * r * x * y + y^2) / (nu * (1 - r^2)))
  l2 - dt(x, nu, log = TRUE) - dt(y, nu, log = TRUE) }
ll_clayton <- function(U, th) log1p(th) - (1 + th) * (log(U[, 1]) + log(U[, 2])) - (2 + 1 / th) * log(U[, 1]^-th + U[, 2]^-th - 1)
ll_gumbel <- function(U, th) { a <- -log(U[, 1]); b <- -log(U[, 2]); A <- a^th + b^th
  -A^(1 / th) + a + b + (th - 1) * (log(a) + log(b)) + (2 / th - 2) * log(A) + log1p((th - 1) * A^(-1 / th)) }
ll_frank <- function(U, th) { e <- 1 - exp(-th); log(th * e) - th * (U[, 1] + U[, 2]) - 2 * log(e - (1 - exp(-th * U[, 1])) * (1 - exp(-th * U[, 2]))) }
C_clayton <- function(a, b, th) (a^-th + b^-th - 1)^(-1 / th)
C_gumbel <- function(a, b, th) exp(-((-log(a))^th + (-log(b))^th)^(1 / th))
C_frank <- function(a, b, th) -log1p((exp(-th * a) - 1) * (exp(-th * b) - 1) / (exp(-th) - 1)) / th
C_gauss <- function(a, b, r) { Sg <- matrix(c(1, r, r, 1), 2); x <- cbind(qnorm(a), qnorm(b)); apply(x, 1, function(p) pmvnorm(upper = p, sigma = Sg)) }
mle1 <- function(ll, lo, hi, U = Uh) { o <- optimize(function(t) -sum(ll(U, t)), c(lo, hi), tol = 1e-10); c(par = o$minimum, ll = -o$objective) }
mle_t <- function(U = Uh) { o <- optim(c(.7, 10), function(p) -sum(ll_t(U, p[1], p[2])), method = "L-BFGS-B", lower = c(.01, 2.2), upper = c(.99, 150)); c(rho = o$par[1], nu = o$par[2], ll = -o$value) }
fg <- mle1(ll_gauss, .01, .99); ft <- mle_t(); fc <- mle1(ll_clayton, .01, 20); fr <- mle1(ll_clayton, .01, 20, 1 - Uh); fu <- mle1(ll_gumbel, 1.0001, 20); ff <- mle1(ll_frank, .01, 40)
tab <- data.frame(copula = c("Gaussiana", "t-Student", "Clayton", "Clayton rotada", "Gumbel", "Frank"),
  par1 = c(fg[1], ft[1], fc[1], fr[1], fu[1], ff[1]), par2 = c(NA, ft[2], NA, NA, NA, NA), logLik = c(fg[2], ft[3], fc[2], fr[2], fu[2], ff[2]), k = c(1, 2, 1, 1, 1, 1))
tab$AIC <- -2 * tab$logLik + 2 * tab$k; tab$BIC <- -2 * tab$logLik + tab$k * log(n)
tab$lamL <- c(0, lam_t(ft[1], ft[2]), lam_clayton(fc[1]), 0, 0, 0); tab$lamU <- c(0, lam_t(ft[1], ft[2]), 0, lam_clayton(fr[1]), lam_gumbel(fu[1]), 0)
rownames(tab) <- NULL; cat("\nAjuste por maxima verosimilitud (pseudo-observaciones):\n"); print(format(tab, digits = 4), row.names = FALSE)
tau_hat <- cor(X, Y, method = "kendall")
cat(sprintf("\nInversion de tau (tau=%.4f): Gaussiana rho = %.3f; Clayton theta = %.3f (MLE %.3f); Gumbel theta = %.3f (MLE %.3f); Frank theta = %.3f (MLE %.3f)\n",
            tau_hat, rho_from_tau(tau_hat), th_clayton(tau_hat), fc[1], th_gumbel(tau_hat), fu[1], th_frank(tau_hat), ff[1]))
cat(sprintf("Contraste LR t frente a Gaussiana: 2*Delta ll = %.2f (nu = %.1f); Delta AIC = %.2f, Delta BIC = %.2f\n", 2 * (ft[3] - fg[2]), ft[2], tab$AIC[1] - tab$AIC[2], tab$BIC[1] - tab$BIC[2]))

# Bondad de ajuste Sn (bootstrap parametrico)
Cn_at <- function(U) rowMeans(outer(U[, 1], U[, 1], ">=") & outer(U[, 2], U[, 2], ">="))
pobs <- function(U) cbind(rank(U[, 1]), rank(U[, 2])) / (nrow(U) + 1)
Sn_fun <- function(U, Cfun, p) sum((Cn_at(U) - Cfun(U[, 1], U[, 2], p))^2)
gof <- function(name, par, Cfun, sim, fit, B) {
  s0 <- Sn_fun(Uh, Cfun, par); sb <- replicate(B, { Ub <- pobs(sim(n, par)); Sn_fun(Ub, Cfun, fit(Ub)) })
  c(Sn = s0, p = (1 + sum(sb >= s0)) / (B + 1)) }
set.seed(321); B <- 200
g1 <- gof("Gaussiana", fg[1], C_gauss, function(n, p) r_gauss(n, p), function(U) mle1(ll_gauss, .01, .99, U)[1], B)
g2 <- gof("Clayton", fc[1], C_clayton, function(n, p) r_clayton(n, p), function(U) mle1(ll_clayton, .01, 20, U)[1], B)
g3 <- gof("Gumbel", fu[1], C_gumbel, function(n, p) r_gumbel(n, p), function(U) mle1(ll_gumbel, 1.0001, 20, U)[1], B)
g4 <- gof("Frank", ff[1], C_frank, function(n, p) r_frank_cond(n, p), function(U) mle1(ll_frank, .01, 40, U)[1], B)
# pmvt exige df entero: para el contraste Sn se redondea nu (16 en lugar de 15,6); en Python se usa el nu exacto
Ct_fun <- function(a, b, p) { Sg <- matrix(c(1, p[1], p[1], 1), 2); x <- cbind(qt(a, round(p[2])), qt(b, round(p[2]))); apply(x, 1, function(z) pmvt(upper = z, sigma = Sg, df = round(p[2]), algorithm = GenzBretz(abseps = 1e-4))) }
set.seed(5); s0t <- Sn_fun(Uh, Ct_fun, c(ft[1], ft[2])); Bt <- 25
sbt <- replicate(Bt, { Ub <- pobs(r_t(n, ft[1], ft[2])); pb <- mle_t(Ub); Sn_fun(Ub, Ct_fun, c(pb[1], pb[2])) })
g5 <- c(Sn = s0t, p = (1 + sum(sbt >= s0t)) / (Bt + 1))
gt <- rbind("Gaussiana" = g1, "t-Student (B=25)" = g5, "Clayton" = g2, "Gumbel" = g3, "Frank" = g4)
cat("\nBondad de ajuste Sn (bootstrap parametrico, B = 200; t con B = 25):\n"); print(round(gt, 4))

# Cola empirica y capital de X+Y
sim_model <- function(name, nn) switch(name, "Gaussiana" = r_gauss(nn, fg[1]), "t-Student" = r_t(nn, ft[1], ft[2]), "Clayton" = r_clayton(nn, fc[1]),
  "Clayton rotada" = rot(r_clayton(nn, fr[1])), "Gumbel" = r_gumbel(nn, fu[1]), "Frank" = r_frank_cond(nn, ff[1]))
fx <- fitdistr(X, "lognormal"); fy <- fitdistr(Y, "gamma")
cat(sprintf("\nMarginales ajustadas: X lognormal(mu=%.3f, sigma=%.3f) · Y gamma(forma=%.3f, escala=%.3f)\n", fx$estimate[1], fx$estimate[2], fy$estimate[1], 1 / fy$estimate[2]))
inv <- function(U) qlnorm(U[, 1], fx$estimate[1], fx$estimate[2]) + qgamma(U[, 2], shape = fy$estimate[1], rate = fy$estimate[2])
set.seed(2027); NS <- 1e6; qs <- c(.90, .95, .99)
fila <- function(U, S) c(sapply(qs, function(q) lam_emp(U, q)), vt(S))
res <- rbind(fila(Uh, X + Y))
Ut <- r_t(NS, .7, 15); res <- rbind(res, fila(Ut, qlnorm(Ut[, 1], log(12), .45) + qgamma(Ut[, 2], shape = 3, scale = 4)))
for (nm in tab$copula) { U <- sim_model(nm, NS); res <- rbind(res, fila(U, inv(U))) }
rownames(res) <- c("Datos", "Verdad (t15, rho=0,70)", tab$copula)
colnames(res) <- c("lam q=.90", "lam q=.95", "lam q=.99", "VaR 99,5", "TVaR 99,5")
cat("\nCola empirica y capital de X+Y por modelo:\n"); print(round(res, 3))
cat("\nDiferencia del VaR 99,5 % frente a la copula t ajustada (%):\n"); print(round((res[, "VaR 99,5"] / res["t-Student", "VaR 99,5"] - 1) * 100, 2))
png("t6_R_ajuste.png", 1500, 950, res = 150); par(mfrow = c(2, 3), mar = c(3, 3, 2, 1))
set.seed(8); plot(Uh, pch = 20, cex = .35, col = rgb(0, .2, .6, .5), main = "Datos", xlab = "", ylab = "", asp = 1)
for (nm in c("Gaussiana", "t-Student", "Clayton rotada", "Gumbel")) { U <- sim_model(nm, n); plot(U, pch = 20, cex = .35, col = rgb(0, .2, .6, .5), main = nm, xlab = "", ylab = "", asp = 1) }
barplot(res[, "VaR 99,5"], horiz = TRUE, las = 1, cex.names = .55, xlim = c(60, max(res[, "VaR 99,5"]) * 1.03), xpd = FALSE, main = "VaR 99,5 % de X+Y (M euros)", col = "#1559A6")
dev.off()

# ---------------- (F) Cuatro modulos ----------------
S <- c(40, 30, 20, 10); P <- matrix(c(1, .25, .25, .25, .25, 1, .5, 0, .25, .5, 1, .25, .25, 0, .25, 1), 4, byrow = TRUE)
cat("\nAutovalores de P:", round(eigen(P)$values, 3), "· SCR formula estandar =", round(scr_gauss(S, P), 4), "· suma simple =", sum(S), "\n")
tau_m <- mean(2 / pi * asin(P[upper.tri(P)])); th_c4 <- th_clayton(tau_m); th_g4 <- th_gumbel(tau_m)
cat(sprintf("tau medio = %.4f  ->  Clayton theta = %.3f, Gumbel theta = %.3f\n", tau_m, th_c4, th_g4))
Ch <- chol(P)
u_gauss <- function(nn) pnorm(matrix(rnorm(4 * nn), nn) %*% Ch)
u_t <- function(nn, nu) pt((matrix(rnorm(4 * nn), nn) %*% Ch) / sqrt(rchisq(nn, nu) / nu), nu)
agg <- function(U) { L <- drop(qnorm(U) %*% (S / z995)); v <- unname(quantile(L, .995)); ex <- rowSums(U > .99)
  c(VaR = v, TVaR = mean(L[L >= v]), P2 = mean(ex >= 2), P4_x100k = mean(ex == 4) * 1e5) }
set.seed(4); NN <- 1e6
mods <- list("Gaussiana(P)" = u_gauss(NN), "t nu=4" = u_t(NN, 4), "t nu=10" = u_t(NN, 10), "Clayton rotada" = rot(r_clayton(NN, th_c4, 4)), "Gumbel" = r_gumbel(NN, th_g4, 4))
out <- t(sapply(mods, agg)); out <- cbind(out, "VaR vs 70" = out[, "VaR"] / 70 - 1)
cat("\n"); print(round(out, 3))
nearest_corr <- function(A, it = 200) { Y_ <- A; dS <- 0 * A
  for (i in 1:it) { R <- Y_ - dS; e <- eigen(R, symmetric = TRUE); X_ <- e$vectors %*% diag(pmax(e$values, 0)) %*% t(e$vectors); dS <- X_ - R; Y_ <- X_; diag(Y_) <- 1 }
  Y_ }
Pb <- matrix(c(1, .9, .9, .9, 1, -.9, .9, -.9, 1), 3)
cat("\nAutovalores de (0,9; 0,9; -0,9):", round(eigen(Pb)$values, 3), "\n"); Pn <- nearest_corr(Pb)
cat("Matriz mas cercana, autovalores:", round(eigen(Pn)$values, 4), "\n"); print(round(Pn, 3))
g <- expand.grid(rep(list(0:1), 3)); vol <- sum(apply(g, 1, function(c) (-1)^(3 - sum(c)) * max(sum(ifelse(c == 1, 1, .5)) - 2, 0)))
cat("Volumen de W_3 en [1/2,1]^3 =", vol, "(negativo: W_d no es copula si d >= 3)\n")
png("t6_R_modulos.png", 1500, 650, res = 150); par(mfrow = c(1, 2), mar = c(7, 4, 3, 1))
b <- barplot(out[, "VaR"], ylim = c(60, 90), xpd = FALSE, las = 2, cex.names = .8, col = c("#555", "#1559A6", "#1559A6", "#B03A2E", "#B03A2E"), main = "VaR 99,5 % de la suma de 4 modulos (M euros)"); abline(h = 70, lty = 2)
text(b, out[, "VaR"] + 1, sprintf("%.1f", out[, "VaR"]), cex = .8)
barplot(out[, "P4_x100k"], log = "y", las = 2, cex.names = .8, col = c("#555", "#1559A6", "#1559A6", "#B03A2E", "#B03A2E"), main = "Los 4 modulos > percentil 99 (casos por 100.000)")
dev.off()

# ---------------- (G) Apoyo cuantitativo a repaso y debate ----------------
# G1) t con rho = 0: sin correlacion y con dependencia de cola
set.seed(61); U0 <- r_t(2e6, 0, 4)
cat(sprintf("\nG1  t(rho=0, nu=4): Spearman = %.4f  tau = %.4f  lambda teorico = %.4f (nu=10: %.4f; nu=15: %.4f)\n",
            cor(U0[1:2e5, 1], U0[1:2e5, 2], method = "spearman"), cor(U0[1:2e4, 1], U0[1:2e4, 2], method = "kendall"), lam_t(0, 4), lam_t(0, 10), lam_t(0, 15)))
for (q in c(.95, .99, .999)) cat(sprintf("    q = %.3f: P(V>q|U>q) = %.4f frente a %.3f si fueran independientes (x%.1f)\n", q, lam_emp(U0, q), 1 - q, lam_emp(U0, q) / (1 - q)))
Lt0 <- qnorm(U0[, 1]) * sd_m + qnorm(U0[, 2]) * sd_u
cat(sprintf("    VaR99,5 con marginales normales y copula t(0; 4) = %.2f (%+.1f%% sobre 50,00 de la independencia)\n", quantile(Lt0, .995), 100 * (quantile(Lt0, .995) / 50 - 1)))
# G2) en que sentido es 'Gaussiana' la formula estandar
set.seed(62); NG <- 2e6; S2 <- c(40, 30); Pm <- matrix(c(1, .25, .25, 1), 2)
Z2 <- matrix(rnorm(2 * NG), NG) %*% chol(Pm); Ug <- pnorm(Z2)
cat(sprintf("\nG2  formula estandar = %.2f\n", scr_gauss(S2, Pm)))
cat(sprintf("    (a) normal multivariante                      VaR99,5 = %.2f\n", quantile(drop(Z2 %*% (S2 / z995)), .995)))
Tm <- Z2 / sqrt(rchisq(NG, 4) / 4); cat(sprintf("    (b) t multivariante nu=4 (eliptica)           VaR99,5 = %.2f\n", quantile(drop(Tm %*% (S2 / qt(.995, 4))), .995)))
cat(sprintf("    (c) copula t(4) con marginales normales       VaR99,5 = %.2f\n", quantile(drop(qnorm(pt(Tm, 4)) %*% (S2 / z995)), .995)))
for (sg in c(.8, 1.2)) cat(sprintf("    (d) copula Gaussiana + lognormal sigma=%.1f     VaR99,5 = %.2f\n", sg, quantile(drop(exp(sg * qnorm(Ug)) %*% (S2 / exp(sg * z995))), .995)))
cat(sprintf("    (e) copula Gaussiana + Pareto alpha=3         VaR99,5 = %.2f\n", quantile(drop(((1 - Ug)^(-1 / 3) - 1) %*% (S2 / (0.005^(-1 / 3) - 1))), .995)))
# G4) reparto del capital (esperanza condicional en el entorno del VaR)
set.seed(64); NE <- 2e6
contrib <- function(U) { mk <- qnorm(U[, 1]) * sd_m; uw <- qnorm(U[, 2]) * sd_u; L <- mk + uw; v <- unname(quantile(L, .995)); s <- abs(L - v) < .5
  c(VaR = v, mercado = mean(mk[s]), suscripcion = mean(uw[s]), n = sum(s)) }
cat("\nG4  contribuciones al VaR99,5 (E[Li | L ~ VaR]):\n"); print(round(rbind(Gaussiana = contrib(r_gauss(NE, rho)), "Clayton rotada" = contrib(rot(r_clayton(NE, th_c)))), 2))
cat(sprintf("    Coste anual del capital adicional (%.2f M euros al 6%%): %.3f M euros\n", scr * rec, .06 * scr * rec))
# G5) IC bootstrap de lambda(q) en la muestra
set.seed(65); bs <- sapply(c(.90, .95, .99), function(q) replicate(500, { ix <- sample(n, n, TRUE); lam_emp(pobs(cbind(X[ix], Y[ix])), q) }))
cat("\nG5  IC 95% bootstrap (B=500) de P(V>q|U>q) en la muestra:\n"); print(round(rbind(estimador = sapply(c(.90, .95, .99), function(q) lam_emp(Uh, q)), low = apply(bs, 2, quantile, .025), high = apply(bs, 2, quantile, .975)), 3))
