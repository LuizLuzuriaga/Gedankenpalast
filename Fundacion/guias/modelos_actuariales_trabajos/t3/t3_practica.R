# =====================================================================
# Tema 3 - Modelo colectivo de riesgo: frecuencia, severidad y agregacion
# Ejercicio practico en R (base R + actuar + MASS + ggplot2) - Luiz Luzuriaga
# Master en Ciencias Actuariales y Financieras - Matematica Actuarial de la
# Estabilidad y Solvencia de la Actividad Aseguradora
# (A) Panjer de la teoria, (B) Caso 1 Auto, (C) MLE Gamma vs Pareto,
# (D) Caso 2 Hogar, (E) cuatro segmentos, (F) sobredispersion, (G) cola de la Pareto.
# Nota: fitdistrplus no esta instalado; se usa MASS::fitdistr y optim() (mismo MLE).
# =====================================================================
suppressPackageStartupMessages({ library(actuar); library(MASS); library(ggplot2) })
Z <- qnorm(0.995)

# ---- funciones ----------------------------------------------------------
discretizar <- function(cdf, h, K) {                       # discretizacion central, renormalizada
  f <- numeric(K); f[1] <- cdf(h / 2)
  j <- 1:(K - 1); f[j + 1] <- cdf((j + .5) * h) - cdf((j - .5) * h)
  f / sum(f)
}
panjer_poisson <- function(f, lam, K) {                    # clase (a,b,0): a = 0, b = lambda
  g <- numeric(K + 1); g[1] <- exp(-lam * (1 - f[1]))
  for (k in 1:K) { j <- 1:min(k, length(f) - 1); g[k + 1] <- lam / k * sum(j * f[j + 1] * g[k - j + 1]) }
  g
}
panjer_nb <- function(f, r, beta, K) {                     # a = beta/(1+beta), b = (r-1) beta/(1+beta)
  a <- beta / (1 + beta); b <- (r - 1) * beta / (1 + beta)
  g <- numeric(K + 1); g[1] <- (1 - beta * (f[1] - 1))^(-r)
  for (k in 1:K) { j <- 1:min(k, length(f) - 1); g[k + 1] <- 1 / (1 - a * f[1]) * sum((a + b * j / k) * f[j + 1] * g[k - j + 1]) }
  g
}
agg_fft <- function(f, M, fgp) { fp <- c(f, rep(0, M - length(f))); pmax(Re(fft(fgp(fft(fp)), inverse = TRUE)) / M, 0) }
cuantil <- function(g, h, p) h * (which(cumsum(g) >= p)[1] - 1)
tvar <- function(g, h, p) {
  s <- h * (seq_along(g) - 1); F <- cumsum(g); v <- which(F >= p)[1]
  (sum(s[(v + 1):length(g)] * g[(v + 1):length(g)]) + s[v] * (F[v] - p)) / (1 - p)
}

# ---- (A) Ejemplo de Panjer: lambda = 5, Gamma(2, 300), h = 10 -------------
cat("== (A) Panjer de la teoria ==\n")
lam <- 5; alp <- 2; th <- 300; h <- 10; K <- 1500
f <- discretizar(function(x) pgamma(x, alp, scale = th), h, 2048)
g <- panjer_poisson(f, lam, K); s <- h * (0:K)
cat(sprintf("f0 = %.9f  g0 = %.9f  masa hasta %d = %.9f\n", f[1], g[1], h * K, sum(g)))
cat(sprintf("E[S] = %.4f (3000)  Var[S] = %.2f (2.700.000)\n", sum(s * g), sum(s^2 * g) - sum(s * g)^2))
print(sapply(c(.5, .9, .95, .99, .995), function(p) cuantil(g, h, p)))
gf <- agg_fft(f, 2048, function(z) exp(lam * (z - 1)))
cat(sprintf("FFT: max|g_FFT - g_Panjer| = %.2e\n", max(abs(gf[1:(K + 1)] - g))))
# Comparacion con actuar::aggregateDist (recursion de Panjer del paquete)
Fx <- aggregateDist("recursive", model.freq = "poisson", model.sev = f, lambda = lam, x.scale = h, maxit = 100000, tol = 1e-12)
cat("actuar::aggregateDist VaR 99,5%:", quantile(Fx, .995), "\n")

# ---- (B) Caso 1: Auto, Poisson(1200) y Gamma(2, 450) ----------------------
cat("\n== (B) Caso 1 Auto ==\n")
lam1 <- 1200; a1 <- 2; t1 <- 450; h1 <- 10; M <- 2^18
f1 <- discretizar(function(x) pgamma(x, a1, scale = t1), h1, 20000)
g1 <- agg_fft(f1, M, function(z) exp(lam1 * (z - 1)))
E1 <- lam1 * a1 * t1; V1 <- lam1 * a1 * t1^2 * (1 + a1); m3 <- lam1 * a1 * (a1 + 1) * (a1 + 2) * t1^3
sd1 <- sqrt(V1); gam1 <- m3 / sd1^3
res1 <- data.frame(metodo = c("Normal", "Normal Power", "Exacta (FFT)"),
                   VaR995 = c(E1 + Z * sd1, E1 + sd1 * (Z + gam1 / 6 * (Z^2 - 1)), cuantil(g1, h1, .995)))
res1$capital <- res1$VaR995 - E1; res1$capital_pct <- 100 * res1$capital / E1
s1 <- h1 * (0:(M - 1))
cat(sprintf("E(S) = %.1f  Var = %.0f  (teorico %.0f)  asimetria = %.4f\n", sum(s1 * g1), sum(s1^2 * g1) - sum(s1 * g1)^2, V1, gam1)); print(res1, digits = 8)

# ---- (C) MLE de la severidad: Gamma frente a Pareto -----------------------
cat("\n== (C) MLE Gamma vs Pareto ==\n")
set.seed(123); x <- rgamma(500, shape = 2, scale = 450)
fg <- fitdistr(x, "gamma"); ll_g <- as.numeric(logLik(fg)); aic_g <- 4 - 2 * ll_g
nllp <- function(p) -sum(dpareto(x, shape = exp(p[1]), scale = exp(p[2]), log = TRUE))
op <- optim(c(log(3), log(1000)), nllp, control = list(maxit = 2000, reltol = 1e-12)); ll_p <- -op$value; aic_p <- 4 - 2 * ll_p
cat(sprintf("Gamma : forma = %.3f  escala = %.1f  logL = %.2f  AIC = %.2f\n", fg$estimate["shape"], 1 / fg$estimate["rate"], ll_g, aic_g))
cat(sprintf("Pareto: alpha = %.3g  theta = %.3g  logL = %.2f  AIC = %.2f\n", exp(op$par[1]), exp(op$par[2]), ll_p, aic_p))
cat("Mejor ajuste por AIC:", if (aic_g < aic_p) "Gamma" else "Pareto", "\n")
fgm <- discretizar(function(z) pgamma(z, fg$estimate["shape"], rate = fg$estimate["rate"]), 10, 20000)
gg <- agg_fft(fgm, M, function(z) exp(1200 * (z - 1)))
Em <- sum(s1 * gg); Vm <- sum(s1^2 * gg) - Em^2
cat(sprintf("Con MLE: E(S) = %.0f  SD = %.0f  VaR 99,5%% exacto = %.0f\n", Em, sqrt(Vm), cuantil(gg, 10, .995)))

# ---- (D) Caso 2: Hogar, BN(50, 3) y Pareto(4, 3000) -----------------------
cat("\n== (D) Caso 2 Hogar ==\n")
r <- 50; beta <- 3; al <- 4; thp <- 3000
EN <- r * beta; VN <- r * beta * (1 + beta); k3N <- r * beta * (1 + beta) * (1 + 2 * beta)
EX <- thp / (al - 1); VX <- al * thp^2 / ((al - 1)^2 * (al - 2))
EX2 <- 2 * thp^2 / ((al - 1) * (al - 2)); EX3 <- 6 * thp^3 / ((al - 1) * (al - 2) * (al - 3)); m3X <- EX3 - 3 * EX * EX2 + 2 * EX^3
ES2 <- EN * EX; VS2 <- EN * VX + VN * EX^2; m3S <- EN * m3X + 3 * VN * EX * VX + k3N * EX^3
sd2 <- sqrt(VS2); gam2 <- m3S / sd2^3
h2 <- 100; M2 <- 2^13
f2 <- discretizar(function(z) ppareto(z, al, scale = thp), h2, M2)
g2 <- agg_fft(f2, M2, function(z) (1 - beta * (z - 1))^(-r))
gP <- panjer_nb(f2, r, beta, 4000)
set.seed(123); Ns <- rnbinom(20000, size = r, prob = 1 / (1 + beta))
Ssim <- vapply(Ns, function(n) if (n > 0) sum(rpareto(n, al, scale = thp)) else 0, numeric(1))
res2 <- data.frame(metodo = c("Normal", "Normal Power", "Exacta (FFT)", "Monte Carlo (20.000)"),
                   VaR995 = c(ES2 + Z * sd2, ES2 + sd2 * (Z + gam2 / 6 * (Z^2 - 1)), cuantil(g2, h2, .995), quantile(Ssim, .995, names = FALSE)))
res2$VaR_sobre_E_menos1_pct <- 100 * (res2$VaR995 / ES2 - 1)
cat(sprintf("E(S) = %.0f Var = %.0f SD = %.0f asimetria = %.4f SD/E = %.3f (Caso 1: %.3f)\n", ES2, VS2, sd2, gam2, sd2 / ES2, sd1 / E1))
cat(sprintf("Panjer(NB) vs FFT: max|dif| = %.2e   TVaR 99,5%% = %.0f\n", max(abs(gP[1:4001] - g2[1:4001])), tvar(g2, h2, .995))); print(res2, digits = 8)

# ---- (E) Cuatro segmentos: aditividad del Poisson compuesto ----------------
cat("\n== (E) Cuatro segmentos ==\n")
seg <- data.frame(lam = c(300, 250, 400, 250), alpha = c(2, 2.5, 1.8, 2.2), theta = c(400, 500, 350, 600))
seg$EX <- seg$alpha * seg$theta; seg$EX2 <- seg$alpha * (seg$alpha + 1) * seg$theta^2; seg$EX3 <- seg$alpha * (seg$alpha + 1) * (seg$alpha + 2) * seg$theta^3
seg$ES <- seg$lam * seg$EX; seg$VS <- seg$lam * seg$EX2; seg$m3 <- seg$lam * seg$EX3
tot <- colSums(seg[, c("ES", "VS", "m3")]); sdT <- sqrt(tot["VS"]); gT <- tot["m3"] / sdT^3
hh <- 50; MM <- 2^16
fseg <- lapply(1:4, function(i) discretizar(function(z) pgamma(z, seg$alpha[i], scale = seg$theta[i]), hh, MM))
lamT <- sum(seg$lam); mezcla <- Reduce(`+`, Map(function(l, fk) l * fk, seg$lam, fseg)) / lamT
gT_ <- agg_fft(mezcla, MM, function(z) exp(lamT * (z - 1)))
prod <- Reduce(`*`, Map(function(l, fk) exp(l * (fft(fk) - 1)), seg$lam, fseg)); gprod <- pmax(Re(fft(prod, inverse = TRUE)) / MM, 0)
cat(sprintf("E = %.0f Var = %.0f SD = %.0f asimetria = %.4f  lambda total = %d\n", tot["ES"], tot["VS"], sdT, gT, lamT))
cat(sprintf("max|g_mezcla - g_producto| = %.2e\n", max(abs(gT_ - gprod))))
print(data.frame(metodo = c("Normal", "Normal Power", "Exacta (FFT)"),
                 VaR995 = c(tot["ES"] + Z * sdT, tot["ES"] + sdT * (Z + gT / 6 * (Z^2 - 1)), cuantil(gT_, hh, .995))), digits = 8, row.names = FALSE)

# ---- (F) Sobredispersion ---------------------------------------------------
cat("\n== (F) Test de sobredispersion ==\n")
set.seed(7); npol <- 20000; tasa <- rgamma(npol, shape = 0.5, scale = 0.3); y <- rpois(npol, tasa)
m <- mean(y); v <- var(y); disp <- v / m; chi2 <- (npol - 1) * disp
ll_pois <- sum(dpois(y, m, log = TRUE))
nll <- function(p) -sum(dnbinom(y, size = exp(p[1]), mu = exp(p[2]), log = TRUE))
opn <- optim(c(0, log(m)), nll, control = list(reltol = 1e-12)); rhat <- exp(opn$par[1]); muhat <- exp(opn$par[2]); ll_nb <- -opn$value
LR <- 2 * (ll_nb - ll_pois)
cat(sprintf("media = %.4f var = %.4f indice dispersion = %.3f chi2 = %.0f p = %.2e\n", m, v, disp, chi2, pchisq(chi2, npol - 1, lower.tail = FALSE)))
cat(sprintf("NB: r = %.3f mu = %.4f | logL Poisson = %.1f logL NB = %.1f LR = %.1f | AIC Poisson %.1f vs NB %.1f\n", rhat, muhat, ll_pois, ll_nb, LR, 2 - 2 * ll_pois, 4 - 2 * ll_nb))

# ---- (G) La cola engorda: Pareto con E(X)=1000 y alpha decreciente ---------
cat("\n== (G) Cola de la Pareto ==\n")
cola <- do.call(rbind, lapply(c(5, 4, 3.5, 3, 2.5, 2, 1.5), function(a) {
  tt <- 1000 * (a - 1); hG <- 250; MG <- 2^17
  fG <- discretizar(function(z) ppareto(z, a, scale = tt), hG, MG)
  gG <- agg_fft(fG, MG, function(z) (1 - beta * (z - 1))^(-r)); EG <- EN * 1000
  VG <- if (a > 2) EN * a * tt^2 / ((a - 1)^2 * (a - 2)) + VN * 1000^2 else NA
  nG <- if (a > 2) EG + Z * sqrt(VG) else NA
  npG <- NA
  if (a > 3) { E2 <- 2 * tt^2 / ((a - 1) * (a - 2)); E3 <- 6 * tt^3 / ((a - 1) * (a - 2) * (a - 3)); m3g <- E3 - 3 * 1000 * E2 + 2 * 1000^3
               VXg <- E2 - 1000^2; m3Sg <- EN * m3g + 3 * VN * 1000 * VXg + k3N * 1000^3; npG <- EG + sqrt(VG) * (Z + m3Sg / VG^1.5 / 6 * (Z^2 - 1)) }
  data.frame(alpha = a, theta = tt, VaR_exacto = cuantil(gG, hG, .995), VaR_sobre_E_menos1 = cuantil(gG, hG, .995) / EG - 1,
             Normal = nG, Normal_Power = npG, TVaR = tvar(gG, hG, .995))
}))
print(cola, digits = 7, row.names = FALSE)

# ---- Graficos ---------------------------------------------------------------
xs <- seq(E1 - 4 * sd1, E1 + 5 * sd1, by = 100); i0 <- as.integer(xs / h1) + 1
d1 <- rbind(data.frame(x = xs / 1e6, F = cumsum(g1)[i0], tipo = "exacta (FFT)"), data.frame(x = xs / 1e6, F = pnorm((xs - E1) / sd1), tipo = "Normal"))
ggsave("t3_R_auto.png", ggplot(d1, aes(x, F, colour = tipo, linetype = tipo)) + geom_line(linewidth = 1) + labs(title = "Caso 1 Auto: F(x)", x = "S (millones EUR)", y = "F(x)", colour = "", linetype = "") + theme_minimal(base_size = 12), width = 7, height = 3.8, dpi = 130)
xs2 <- seq(100000, 600000, by = 2000); sf <- 1 - cumsum(g2)
yy <- -3 / gam2 + sqrt(9 / gam2^2 + 1 + 6 * ((xs2 - ES2) / sd2) / gam2)
d2 <- rbind(data.frame(x = xs2 / 1e3, p = sf[as.integer(xs2 / h2) + 1], tipo = "exacta (FFT)"), data.frame(x = xs2 / 1e3, p = pnorm((xs2 - ES2) / sd2, lower.tail = FALSE), tipo = "Normal"),
            data.frame(x = xs2 / 1e3, p = pnorm(yy, lower.tail = FALSE), tipo = "Normal Power"))
ggsave("t3_R_hogar.png", ggplot(d2, aes(x, p, colour = tipo, linetype = tipo)) + geom_line(linewidth = 1) + scale_y_log10(limits = c(1e-6, .5)) + labs(title = "Caso 2 Hogar: P(S > x), escala log", x = "S (miles EUR)", y = "P(S > x)", colour = "", linetype = "") + theme_minimal(base_size = 12), width = 7, height = 3.8, dpi = 130)
ggsave("t3_R_cola.png", ggplot(cola, aes(alpha, VaR_sobre_E_menos1)) + geom_line(colour = "#1559a6", linewidth = 1) + geom_point() + scale_x_reverse() +
         labs(title = "Capital relativo (VaR/E - 1) al engordar la cola", x = "alpha de la Pareto (media fija 1000)", y = "VaR 99,5% / E(S) - 1") + theme_minimal(base_size = 12), width = 7, height = 3.6, dpi = 130)
