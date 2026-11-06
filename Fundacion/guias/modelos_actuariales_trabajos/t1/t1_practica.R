# =====================================================================
# Tema 1 - Teoria de la utilidad y decisiones bajo riesgo
# Ejercicio practico (taller) en R - Luiz Luzuriaga
# Master en Ciencias Actuariales y Financieras - Matematica Actuarial de la
# Estabilidad y Solvencia de la Actividad Aseguradora
# Contenido: (A) curvas CRRA/CARA, (B) Caso 2 por perfil (CE y prima),
#            (C) umbrales de aceptacion, (D) Caso 1 zona de acuerdo,
#            (E) Arrow-Pratt frente a la prima exacta.
# =====================================================================
suppressPackageStartupMessages({ library(ggplot2); library(tidyr) })

# ---- (A) Funciones de utilidad ---------------------------------------
u_crra <- function(w, gamma) if (gamma == 1) log(w) else w^(1 - gamma) / (1 - gamma)
u_cara <- function(w, alpha) -exp(-alpha * w) / alpha

perfiles <- data.frame(
  perfil = c("Agresivo CRRA", "Moderado CRRA", "Conservador CRRA",
             "Agresivo CARA", "Moderado CARA", "Conservador CARA"),
  tipo   = c("CRRA", "CRRA", "CRRA", "CARA", "CARA", "CARA"),
  param  = c(0.5, 2, 5, 1e-4, 3e-4, 6e-4),
  stringsAsFactors = FALSE
)

w_grid <- seq(500, 20000, by = 500)
curvas <- sapply(seq_len(nrow(perfiles)), function(i)
  if (perfiles$tipo[i] == "CRRA") u_crra(w_grid, perfiles$param[i]) else u_cara(w_grid, perfiles$param[i]))
colnames(curvas) <- perfiles$perfil

# ---- (B) Caso 2: CE y prima de riesgo por perfil ---------------------
w <- 10000; Xup <- 2000; Xdown <- -1500; p <- 0.5
EW <- w + p * Xup + (1 - p) * Xdown                    # 10.250

ce_prima <- function(tipo, param, w = 10000, up = 2000, dn = -1500, p = 0.5) {
  W <- c(w + up, w + dn); pr <- c(p, 1 - p)
  CE <- if (tipo == "CRRA") {
          if (param == 1) exp(sum(pr * log(W))) else (sum(pr * W^(1 - param)))^(1 / (1 - param))
        } else -log(sum(pr * exp(-param * W))) / param
  EWl <- sum(pr * W)
  data.frame(CE = CE, EW = EWl, prima = EWl - CE, acepta = CE > w)
}
resultado <- cbind(perfil = perfiles$perfil, do.call(rbind, Map(ce_prima, perfiles$tipo, perfiles$param)))
rownames(resultado) <- NULL
cat("\n== Caso 2: equivalente cierto y prima de riesgo por perfil ==\n")
print(resultado, digits = 7)

# ---- (C) Umbrales: aversion maxima que aun acepta la posicion --------
g_star <- uniroot(function(g) ce_prima("CRRA", g)$CE - w, c(1.01, 6), tol = 1e-12)$root
a_star <- uniroot(function(a) ce_prima("CARA", a)$CE - w, c(1e-6, 1e-3), tol = 1e-14)$root
cat(sprintf("\nUmbral CRRA gamma* = %.4f | Umbral CARA alpha* = %.6f\n", g_star, a_star))
cat(sprintf("Caso log (gamma = 1): CE = %.1f, prima = %.1f\n",
            ce_prima("CRRA", 1)$CE, ce_prima("CRRA", 1)$prima))

# ---- (D) Caso 1: zona de acuerdo cedente-reasegurador ----------------
mgf_gamma <- function(alpha, n = 2, theta = 500) (1 - theta * alpha)^(-n)   # valida si alpha < 1/theta
prima_exp <- function(alpha, n = 2, theta = 500) log(mgf_gamma(alpha, n, theta)) / alpha
P_mas   <- prima_exp(0.0006)     # cedente
P_menos <- prima_exp(0.0003)     # reasegurador
cat(sprintf("\nCaso 1: P+ = %.2f | P- = %.2f | anchura = %.2f\n", P_mas, P_menos, P_mas - P_menos))
cat(sprintf("Recargo cedente = %.1f %% | recargo reasegurador = %.1f %% sobre E[X]=1000\n",
            100 * (P_mas / 1000 - 1), 100 * (P_menos / 1000 - 1)))
# Limite alpha_R -> 0: la prima minima tiende a la prima pura E[X] = n*theta
cat(sprintf("Limite alpha_R -> 0: P- -> %.2f ; anchura maxima = %.2f\n", prima_exp(1e-9), P_mas - prima_exp(1e-9)))

# ---- (E) Arrow-Pratt: pi ~ 1/2 r(E[W]) Var[X] frente a la prima exacta
varX <- p * (1 - p) * (Xup - Xdown)^2
r_loc <- ifelse(perfiles$tipo == "CRRA", perfiles$param / EW, perfiles$param)
resultado$pi_AP <- 0.5 * r_loc * varX
resultado$error_AP_pct <- 100 * (resultado$pi_AP / resultado$prima - 1)
cat("\n== Aproximacion de Arrow-Pratt frente a la prima exacta ==\n")
print(resultado[, c("perfil", "prima", "pi_AP", "error_AP_pct")], digits = 5)

# ---- Graficos --------------------------------------------------------
norm_minmax <- function(x) (x - min(x)) / (max(x) - min(x))
df <- data.frame(w = w_grid, apply(curvas, 2, norm_minmax), check.names = FALSE)
df <- pivot_longer(df, -w, names_to = "perfil", values_to = "u")
df$familia <- ifelse(grepl("CRRA", df$perfil), "CRRA", "CARA")
g1 <- ggplot(df, aes(w, u, color = perfil)) + geom_line(linewidth = 1) +
  facet_wrap(~familia) + labs(title = "Curvas de utilidad normalizadas por perfil", x = "Riqueza (w)", y = "u(w) normalizada") +
  theme_minimal(base_size = 12)
ggsave("t1_R_curvas.png", g1, width = 9, height = 4, dpi = 130)

grid_g <- seq(0.1, 6, length.out = 300)
dfg <- data.frame(gamma = grid_g, CE = sapply(grid_g, function(g) ce_prima("CRRA", g)$CE))
g2 <- ggplot(dfg, aes(gamma, CE)) + geom_line(linewidth = 1, color = "#1559a6") +
  geom_hline(yintercept = w, linetype = "dashed") + geom_vline(xintercept = g_star, linetype = "dotted") +
  annotate("text", x = g_star + 0.1, y = 10150, hjust = 0, label = sprintf("gamma* = %.3f", g_star)) +
  labs(title = "Caso 2: equivalente cierto frente a gamma (CRRA)", x = "gamma", y = "CE") + theme_minimal(base_size = 12)
ggsave("t1_R_umbral.png", g2, width = 7, height = 4, dpi = 130)
