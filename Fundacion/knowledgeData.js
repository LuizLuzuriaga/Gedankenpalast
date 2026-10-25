/**
 * Gedankenpalast - Grafo de Conocimiento Actuarial y Cuantitativo
 * Dataset con especificaciones matemáticas (LaTeX), implementaciones en código (R, Python, VBA)
 * y dependencias topológicas (Upstream / Downstream).
 */

const KNOWLEDGE_GRAPH = [
    {
        id: "gran_atractor",
        name: "Evaluación y Mitigación del Riesgo Financiero y Vital",
        shortName: "Gran Atractor (Núcleo de Ruina y Solvencia)",
        category: "Núcleo",
        position: { x: 0, y: 0, z: 0 },
        color: "#ffd066",
        beaconColor: "#ffcc00",
        size: 16,
        languages: ["Python", "R", "LaTeX"],
        frameworks: ["Solvencia II", "IFRS 17", "ALM", "Reservas", "Tarificación"],
        description: "El problema unificador central: modelización de insolvencia, probabilidad de ruina del fondo y cálculo de suficiencia de capital bajo marcos reglamentarios estrictos (Solvencia II y NIIF 17).",
        math: `
\\textbf{Capital de Solvencia Obligatorio (SCR) bajo Solvencia II:}
$$\\text{SCR} = \\text{VaR}_{99.5\\%}(\\Delta \\text{NAV}_{1\\text{ año}})$$
$$\\text{SCR}_{\\text{Global}} = \\sqrt{ \\sum_{i,j} \\text{Corr}_{i,j} \\cdot \\text{SCR}_i \\cdot \\text{SCR}_j } + \\text{SCR}_{\\text{Op}}$$

\\textbf{Balance Económico bajo IFRS 17:}
$$\\text{Pasivo Total} = \\text{BEL} + \\text{RA} + \\text{CSM}$$
donde $\\text{BEL} = \\sum_{t=1}^T \\mathbb{E}[CF_t] \\cdot P(0, t)$ son los flujos descontados insesgados, $\\text{RA}$ es el ajuste por riesgo no financiero, y $\\text{CSM}$ es el margen de servicio contractual.
        `,
        code: {
            python: `# Agregación de SCR por Matriz de Correlación EIOPA
import numpy as np
import polars as pl

scr_modules = np.array([120.5, 85.0, 45.2, 30.1])  # [Mercado, Suscrip_Vida, Suscrip_NoVida, Contraparte]
corr_matrix = np.array([
    [1.00, 0.25, 0.25, 0.25],
    [0.25, 1.00, 0.00, 0.25],
    [0.25, 0.00, 1.00, 0.25],
    [0.25, 0.25, 0.25, 1.00]
])

scr_bs = np.sqrt(scr_modules @ corr_matrix @ scr_modules)
scr_operativo = 18.4
scr_total = scr_bs + scr_operativo
print(f"SCR Básico: {scr_bs:.2f} M€ | SCR Total: {scr_total:.2f} M€")`,
            r: `# Agregación de Capital de Solvencia Obligatorio (Solvencia II)
scr_vec <- c(Mercado = 120.5, Vida = 85.0, NoVida = 45.2, Contraparte = 30.1)
corr_mat <- matrix(c(
  1.00, 0.25, 0.25, 0.25,
  0.25, 1.00, 0.00, 0.25,
  0.25, 0.00, 1.00, 0.25,
  0.25, 0.25, 0.25, 1.00
), nrow = 4, byrow = TRUE)

scr_basico <- sqrt(t(scr_vec) %*% corr_mat %*% scr_vec)
scr_total <- as.numeric(scr_basico) + 18.4 # Op Risk
cat(sprintf("SCR Total: %.2f M€\\n", scr_total))`,
            vba: `' Macro para cálculo de SCR Agregado en Excel
Function CalcularSCR(rngModulos As Range, rngCorr As Range) As Double
    Dim vec() As Variant, mat() As Variant
    vec = rngModulos.Value
    mat = rngCorr.Value
    Dim n As Integer, i As Integer, j As Integer
    n = UBound(vec, 1)
    Dim suma As Double: suma = 0#
    For i = 1 To n
        For j = 1 To n
            suma = suma + vec(i, 1) * mat(i, j) * vec(j, 1)
        Next j
    Next i
    CalcularSCR = Sqr(suma)
End Function`
        },
        upstream: ["lee_carter", "lundberg", "chain_ladder", "vasicek", "alm_redington", "copulas"],
        downstream: ["Comité de Auditoría y Riesgos", "Supervisión Regulatoria (DGSFP / EIOPA)", "ORSA (Own Risk and Solvency Assessment)"]
    },

    // --- FILAMENTO 1: TEORÍA ACTUARIAL CLÁSICA ---
    {
        id: "lee_carter",
        name: "Modelo Lee-Carter (Longevidad & Mortalidad)",
        shortName: "Lee-Carter",
        category: "Actuarial",
        position: { x: 210, y: 75, z: -35 },
        color: "#5be5ff",
        beaconColor: "#00d0ff",
        size: 11,
        languages: ["R", "Python", "LaTeX"],
        frameworks: ["Solvencia II", "IFRS 17"],
        description: "Piedra angular estocástica para proyectar tablas biométricas dinámicas y cuantificar el riesgo de longevidad en carteras de rentas vitalicias.",
        math: `
$$\\ln(m_{x,t}) = \\alpha_x + \\beta_x \\kappa_t + \\epsilon_{x,t}$$
sujeto a las restricciones de identificabilidad:
$$\\sum_t \\kappa_t = 0, \\quad \\sum_x \\beta_x = 1$$
donde:
- $\\alpha_x = \\frac{1}{T}\\sum_t \\ln(m_{x,t})$ es el perfil etario base.
- $\\kappa_t$ es el índice temporal de mortalidad proyectado mediante un paseo aleatorio con deriva $\\text{ARIMA}(0,1,0)$:
$$\\kappa_t = \\kappa_{t-1} + d + e_t, \\quad e_t \\sim \\mathcal{N}(0, \\sigma_e^2)$$
        `,
        code: {
            r: `# Ajuste y proyección Lee-Carter en R usando StMoMo
library(StMoMo)
# Asumiendo objeto de datos demográficos 'EspanaData'
constLC <- function(ax, bx, kt, b0x, gc, wxt, ages) {
  list(ax = ax, bx = bx, kt = kt, b0x = b0x, gc = gc)
}
lc_model <- lc(link = "log")
# Ajuste mediante Quasi-Poisson (manejo de sobredispersión)
lc_fit <- fit(lc_model, data = EspanaData, ages.fit = 50:90, years.fit = 1980:2024)
# Proyección de kappa_t a 30 años
lc_proj <- forecast(lc_fit, h = 30)
plot(lc_proj)`,
            python: `# Ajuste Lee-Carter vía Descomposición en Valores Singulares (SVD)
import numpy as np
from statsmodels.tsa.arima.model import ARIMA

# log_m: Matriz (edades x años) de tasas log-mortalidad
def fit_lee_carter(log_m):
    ax = np.mean(log_m, axis=1, keepdims=True)
    centered = log_m - ax
    U, S, Vt = np.linalg.svd(centered, full_matrices=False)
    # Primera componente principal
    bx = U[:, 0] / np.sum(U[:, 0])
    kt = Vt[0, :] * S[0] * np.sum(U[:, 0])
    kt = kt - np.mean(kt)
    return ax.flatten(), bx, kt

# Proyección de kappa con ARIMA(0,1,0) con drift
# arima = ARIMA(kt, order=(0,1,0), trend='t').fit()
# kt_forecast = arima.forecast(steps=30)`
        },
        upstream: ["tablas_biometricas"],
        downstream: ["gran_atractor", "alm_redington"]
    },

    {
        id: "lundberg",
        name: "Ecuación de Renovación de Lundberg & Ruina",
        shortName: "Lundberg / Ruina",
        category: "Actuarial",
        position: { x: 160, y: 130, z: 40 },
        color: "#7ae8ff",
        beaconColor: "#33ddff",
        size: 10,
        languages: ["R", "Python", "LaTeX"],
        frameworks: ["Solvencia II", "Tarificación"],
        description: "Teoría clásica de riesgo colectivo del proceso de Cramer-Lundberg para determinar la probabilidad asintótica de insolvencia condicionada al capital inicial.",
        math: `
\\textbf{Proceso de Superávit de Cramér-Lundberg:}
$$U(t) = u + c t - \\sum_{i=1}^{N(t)} X_i, \\quad N(t) \\sim \\text{Poisson}(\\lambda)$$
\\textbf{Ecuación Integro-Diferencial de Probabilidad de Ruina $\\psi(u)$:}
$$\\psi'(u) = \\frac{\\lambda + \\delta}{c} \\psi(u) - \\frac{\\lambda}{c} \\int_0^u \\psi(u-x) dF_X(x) - \\frac{\\lambda}{c}(1 - F_X(u))$$
\\textbf{Desigualdad y Coeficiente de Ajuste $R$:}
$$\\psi(u) \\le e^{-R u}, \\quad \\text{donde } \\mathbb{E}[e^{R(X - c T)}] = 1$$
        `,
        code: {
            r: `# Cálculo del coeficiente de ajuste R y probabilidad de ruina en R
library(actuar)
# Severidad Exponencial con media 100, prima con recargo del 20%
lambda <- 10; mean_claim <- 100; theta <- 0.20
c_premium <- (1 + theta) * lambda * mean_claim

# Coeficiente de ajuste analítico para severidad exponencial
R_adj <- theta / ((1 + theta) * mean_claim)
capital_u <- 1500
prob_ruina_exacta <- (1 / (1 + theta)) * exp(-R_adj * capital_u)
cat(sprintf("Probabilidad de Ruina: %.4f%%\\n", prob_ruina_exacta * 100))`,
            python: `# Simulación Monte Carlo del Proceso de Ruina de Cramér-Lundberg
import numpy as np

def simulate_ruin(u_init, premium_rate, claim_rate, mean_sev, n_sims=50000, horizon=1.0):
    ruined = 0
    for _ in range(n_sims):
        n_claims = np.random.poisson(claim_rate * horizon)
        if n_claims == 0: continue
        claim_times = np.sort(np.random.uniform(0, horizon, n_claims))
        claims = np.random.exponential(mean_sev, n_claims)
        surplus = u_init + premium_rate * claim_times - np.cumsum(claims)
        if np.any(surplus < 0):
            ruined += 1
    return ruined / n_sims

p_ruina = simulate_ruin(1200, 12000, 100, 100)
print(f"Psi(u) simulada: {p_ruina:.4f}")`
        },
        upstream: ["tarificacion_poisson_gamma"],
        downstream: ["gran_atractor"]
    },

    {
        id: "chain_ladder",
        name: "Reservas Chain Ladder & Bornhuetter-Ferguson",
        shortName: "Chain Ladder (IBNR)",
        category: "Actuarial",
        position: { x: 250, y: 25, z: 70 },
        color: "#66d9ff",
        beaconColor: "#00bfff",
        size: 11,
        languages: ["R", "Python", "Excel/VBA", "LaTeX"],
        frameworks: ["Solvencia II", "IFRS 17", "Reservas"],
        description: "Estimación determinista y estocástica de siniestros pendientes de declaración y liquidación (IBNR/IBNER) para el Best Estimate de Pasivos.",
        math: `
\\textbf{Factores de Desarrollo de Mack ($f_j$):}
$$\\hat{f}_j = \\frac{\\sum_{i=1}^{n-j} C_{i, j+1}}{\\sum_{i=1}^{n-j} C_{i,j}}$$
\\textbf{Estimación de la Provisión Total de Siniestros:}
$$\\widehat{\\text{IBNR}} = \\sum_{i=2}^n \\left( \\hat{C}_{i,n} - C_{i, n-i+1} \\right)$$
\\textbf{Error Cuadrático Medio de Predicción (Mack MSE):}
$$\\operatorname{mse}(\\hat{C}_{i,n}) = \\hat{C}_{i,n}^2 \\sum_{j=n-i+1}^{n-1} \\frac{\\sigma_j^2}{\\hat{f}_j^2} \\left( \\frac{1}{C_{i,j}} + \\frac{1}{\\sum_{k=1}^{n-j} C_{k,j}} \\right)$$
        `,
        code: {
            r: `# Paquete ChainLadder en R
library(ChainLadder)
data(RAA)
mack_fit <- MackChainLadder(RAA, est.sigma = "Mack")
summary(mack_fit)
# Provisión total con intervalo de confianza al 99.5% (Solvencia II)
ibnr_total <- sum(mack_fit$IBNR)
se_mack <- mack_fit$Total.Mack.S.E`,
            python: `# Triangular Loss Development en Python con Polars/Numpy
import numpy as np

triangle = np.array([
    [100, 150, 180, 200],
    [110, 168, 205, np.nan],
    [125, 190, np.nan, np.nan],
    [140, np.nan, np.nan, np.nan]
])
n = triangle.shape[0]
factors = []
for j in range(n - 1):
    c_curr = triangle[:n-j-1, j]
    c_next = triangle[:n-j-1, j+1]
    factors.append(np.sum(c_next) / np.sum(c_curr))

# Proyección diagonal inferior
for i in range(1, n):
    for j in range(n - i, n):
        triangle[i, j] = triangle[i, j-1] * factors[j-1]
print("Factores de desarrollo:", np.round(factors, 3))`
        },
        upstream: ["triangulos_siniestros"],
        downstream: ["gran_atractor"]
    },

    {
        id: "tarificacion_poisson_gamma",
        name: "Tarificación No Vida (Poisson-Gamma & Tweedie)",
        shortName: "Tarificación Poisson-Gamma",
        category: "Actuarial",
        position: { x: 200, y: -45, z: 120 },
        color: "#4ad5ff",
        beaconColor: "#00b4d8",
        size: 10,
        languages: ["R", "Python", "LaTeX"],
        frameworks: ["Tarificación", "Solvencia II"],
        description: "Modelización clásica de prima pura separando frecuencia (Poisson) e intensidad/severidad (Gamma) con factor de heterogeneidad no observada.",
        math: `
$$\\text{Prima Pura} = \\mathbb{E}[N] \\cdot \\mathbb{E}[X]$$
$$N|\\Theta=\\theta \\sim \\operatorname{Poisson}(\\lambda \\theta), \\quad \\Theta \\sim \\operatorname{Gamma}(\\alpha, \\alpha)$$
$$\\implies P(N = k) = \\binom{k + \\alpha - 1}{k} \\left( \\frac{\\alpha}{\\alpha + \\lambda} \\right)^\\alpha \\left( \\frac{\\lambda}{\\alpha + \\lambda} \\right)^k \\quad (\\text{Binomial Negativa})$$
        `,
        code: {
            r: `# GLM en R para Frecuencia y Severidad
library(MASS)
# fit_freq <- glm(n_claims ~ offset(log(exposure)) + bonus_malus + age_group, 
#                 family = poisson(link = "log"), data = portfolio)
# fit_sev  <- glm(claim_amount ~ vehicle_type, 
#                 family = Gamma(link = "log"), data = subset(portfolio, n_claims > 0))`,
            python: `# Modelo Tweedie GLM en scikit-learn
from sklearn.linear_model import TweedieRegressor
reg = TweedieRegressor(power=1.5, link='log', max_iter=300)
# reg.fit(X_train, y_train, sample_weight=exposure_train)`
        },
        upstream: ["xgboost_tweedie"],
        downstream: ["lundberg", "gran_atractor"]
    },

    // --- FILAMENTO 2: DATA SCIENCE, ML & SIMULACIÓN ---
    {
        id: "xgboost_tweedie",
        name: "Gradient Boosting Tweedie & ML Actuarial",
        shortName: "XGBoost Tweedie",
        category: "Data Science",
        position: { x: -180, y: 130, z: 70 },
        color: "#ff9933",
        beaconColor: "#ff7700",
        size: 11,
        languages: ["Python", "R", "LaTeX"],
        frameworks: ["Tarificación", "Solvencia II"],
        description: "Salto evolutivo desde los GLMs tradicionales hacia modelos basados en árboles potenciados para la modelización directa del coste total de siniestros con masa en cero.",
        math: `
\\textbf{Densidad Tweedie con $1 < p < 2$ (Compuesta Poisson-Gamma):}
$$\\operatorname{Var}(Y) = \\phi \\mu^p$$
\\textbf{Función de Pérdida Deviance en Gradient Boosting:}
$$\\mathcal{L}(y, \\hat{y}) = 2 \\sum_{i=1}^n w_i \\left( \\frac{y_i^{2-p}}{(1-p)(2-p)} - \\frac{y_i \\hat{y}_i^{1-p}}{1-p} + \\frac{\\hat{y}_i^{2-p}}{2-p} \\right)$$
Optimización por descenso de gradiente funcional de segundo orden con regularización $L_1$ y $L_2$.
        `,
        code: {
            python: `# Entrenamiento XGBoost con Objetivo Tweedie en Python
import xgboost as xgb

params = {
    'objective': 'reg:tweedie',
    'tweedie_variance_power': 1.65,
    'learning_rate': 0.05,
    'max_depth': 6,
    'subsample': 0.8,
    'colsample_bytree': 0.8,
    'eval_metric': 'tweedie-nloglik@1.65'
}
# dtrain = xgb.DMatrix(X_train, label=y_train, weight=exposure_train)
# bst = xgb.train(params, dtrain, num_boost_round=500)`,
            r: `# XGBoost Tweedie en R
library(xgboost)
# dtrain <- xgb.DMatrix(data = as.matrix(X), label = y, weight = exposure)
# bst <- xgboost(data = dtrain, max_depth = 5, eta = 0.05, nrounds = 400,
#                objective = "reg:tweedie", tweedie_variance_power = 1.6)`
        },
        upstream: ["tarificacion_poisson_gamma"],
        downstream: ["gran_atractor"]
    },

    {
        id: "mcmc_bayesian",
        name: "Inferencia Bayesiana & MCMC (Hamiltonian & Gibbs)",
        shortName: "MCMC & Bayes",
        category: "Data Science",
        position: { x: -230, y: 80, z: 15 },
        color: "#ffaa44",
        beaconColor: "#ff8800",
        size: 10,
        languages: ["Python", "R", "LaTeX"],
        frameworks: ["Solvencia II", "Reservas"],
        description: "Generación de distribuciones a posteriori completas para calibrar parámetros en eventos de baja frecuencia y extrema severidad (colas pesadas).",
        math: `
$$P(\\theta | \\mathcal{D}) = \\frac{P(\\mathcal{D} | \\theta) \\pi(\\theta)}{\\int P(\\mathcal{D} | \\theta') \\pi(\\theta') d\\theta'}$$
\\textbf{Probabilidad de Aceptación Metropolis-Hastings:}
$$\\alpha(\\theta, \\theta^*) = \\min\\left(1, \\frac{P(\\theta^* | \\mathcal{D}) q(\\theta | \\theta^*)}{P(\\theta | \\mathcal{D}) q(\\theta^* | \\theta)} \\right)$$
        `,
        code: {
            python: `# Modelado de Reservas Estocásticas con PyMC
import pymc as pm
import numpy as np

with pm.Model() as bayes_model:
    alpha = pm.Normal('alpha', mu=0, sigma=10)
    beta = pm.HalfNormal('beta', sigma=5)
    mu = pm.Deterministic('mu', alpha + beta)
    # y_obs = pm.Poisson('y_obs', mu=pm.math.exp(mu), observed=data)
    # idata = pm.sample(2000, tune=1000, target_accept=0.95)`,
            r: `# Inferencia Bayesiana con Stan en R
library(rstan)
# stan_fit <- stan(file = "reserva_ibnr.stan", data = stan_data, chains = 4, iter = 2000)`
        },
        upstream: [],
        downstream: ["gran_atractor", "copulas"]
    },

    {
        id: "bootstrap_resampling",
        name: "Bootstrap Paramétrico & No Paramétrico",
        shortName: "Bootstrap",
        category: "Data Science",
        position: { x: -130, y: 170, z: 120 },
        color: "#ffbb55",
        beaconColor: "#ffa200",
        size: 9,
        languages: ["R", "Python", "LaTeX"],
        frameworks: ["Solvencia II", "Reservas"],
        description: "Remuestreo intensivo para calcular intervalos de confianza no paramétricos y la distribución empírica del IBNR en Mack Chain Ladder.",
        math: `
$$\\hat{\\theta}^{*(b)} = T(X_1^{*(b)}, \\dots, X_n^{*(b)}), \\quad b = 1, \\dots, B$$
$$\\widehat{\\operatorname{se}}_B = \\sqrt{\\frac{1}{B-1}\\sum_{b=1}^B \\left( \\hat{\\theta}^{*(b)} - \\bar{\\theta}^* \\right)^2 }$$
        `,
        code: {
            python: `# Bootstrap No Paramétrico del VaR de Siniestros
import numpy as np

def bootstrap_var(claims, alpha=0.995, n_boot=10000):
    n = len(claims)
    boot_vars = [np.percentile(np.random.choice(claims, size=n, replace=True), alpha*100) for _ in range(n_boot)]
    return np.mean(boot_vars), np.percentile(boot_vars, [2.5, 97.5])`,
            r: `# BootChainLadder en R
library(ChainLadder)
# boot_res <- BootChainLadder(RAA, R = 5000, process.distr = "gamma")
# quantile(boot_res, c(0.75, 0.95, 0.995))`
        },
        upstream: [],
        downstream: ["chain_ladder", "gran_atractor"]
    },

    // --- FILAMENTO 3: MACROECONOMÍA & FINANZAS CUANTITATIVAS ---
    {
        id: "vasicek",
        name: "Modelos de Tipos de Interés (Vasicek & Hull-White)",
        shortName: "Vasicek / Hull-White",
        category: "Finanzas",
        position: { x: -90, y: -160, z: -80 },
        color: "#ffcc66",
        beaconColor: "#e6a800",
        size: 11,
        languages: ["Python", "R", "LaTeX"],
        frameworks: ["Solvencia II", "ALM", "IFRS 17"],
        description: "Ecuaciones diferenciales estocásticas con reversión a la media para modelar la curva libre de riesgo y calcular el Best Estimate de pasivos a largo plazo.",
        math: `
\\textbf{SDE de Hull-White de un factor:}
$$dr(t) = (\\theta(t) - a r(t))dt + \\sigma dW(t)$$
\\textbf{Precio del Bono Cupón Cero $P(t, T)$:}
$$P(t, T) = A(t, T) \\exp\\left( -B(t, T) r(t) \\right)$$
donde $B(t, T) = \\frac{1 - e^{-a(T-t)}}{a}$, y $\\ln A(t, T)$ se calibra a la estructura temporal inicial $f(0, t)$.
        `,
        code: {
            python: `# Calibración y Simulación de Hull-White con QuantLib en Python
import QuantLib as ql
import numpy as np

today = ql.Date(20, 10, 2026)
ql.Settings.instance().evaluationDate = today
rate = 0.035
curve = ql.FlatForward(today, rate, ql.Actual365Fixed())
yts = ql.YieldTermStructureHandle(curve)

hw_model = ql.HullWhite(yts, a=0.05, sigma=0.015)
# Simulación de caminos de tipos cortos r(t)
process = hw_model.tree(ql.TimeGrid(30, 360))`,
            r: `# Simulación de Vasicek en R
sim_vasicek <- function(n_paths, T_years, dt, r0, a, b, sigma) {
  N <- T_years / dt
  r <- matrix(0, nrow = N + 1, ncol = n_paths)
  r[1, ] <- r0
  for (t in 1:N) {
    dW <- rnorm(n_paths, mean = 0, sd = sqrt(dt))
    r[t+1, ] <- r[t, ] + a * (b - r[t, ]) * dt + sigma * dW
  }
  return(r)
}`
        },
        upstream: ["calculo_ito"],
        downstream: ["alm_redington", "gran_atractor"]
    },

    {
        id: "black_scholes",
        name: "Black-Scholes & Valoración Neutral al Riesgo",
        shortName: "Black-Scholes",
        category: "Finanzas",
        position: { x: 70, y: -180, z: -120 },
        color: "#ffe066",
        beaconColor: "#d4a000",
        size: 10,
        languages: ["Python", "R", "LaTeX"],
        frameworks: ["IFRS 17", "Solvencia II"],
        description: "Valoración de opciones financieras y garantías embebidas de rentabilidad mínima en pólizas de vida Unit-Linked y seguros con participación en beneficios.",
        math: `
\\textbf{EDP Fundamental de Black-Scholes:}
$$\\frac{\\partial V}{\\partial t} + \\frac{1}{2}\\sigma^2 S^2 \\frac{\\partial^2 V}{\\partial S^2} + r S \\frac{\\partial V}{\\partial S} - r V = 0$$
\\textbf{Fórmula de Black-Scholes para Call Europea con Garantía $K$:}
$$C(S, t) = S_t N(d_1) - K e^{-r(T-t)} N(d_2)$$
$$d_1 = \\frac{\\ln(S_t/K) + \\left(r + \\frac{1}{2}\\sigma^2\\right)(T-t)}{\\sigma \\sqrt{T-t}}, \\quad d_2 = d_1 - \\sigma \\sqrt{T-t}$$
        `,
        code: {
            python: `# Valoración Vectorizada de Garantías Unit-Linked en Python
import numpy as np
from scipy.stats import norm

def black_scholes_call(S, K, T, r, sigma):
    d1 = (np.log(S / K) + (r + 0.5 * sigma**2) * T) / (sigma * np.sqrt(T))
    d2 = d1 - sigma * np.sqrt(T)
    call_price = S * norm.cdf(d1) - K * np.exp(-r * T) * norm.cdf(d2)
    return call_price

# Garantía de capital 100k con subyacente a 95k
print(f"Valor de la garantía embebida: {black_scholes_call(95000, 100000, 5, 0.03, 0.18):.2f} €")`,
            r: `# Black-Scholes en R
bs_call <- function(S, K, T, r, sigma) {
  d1 <- (log(S / K) + (r + 0.5 * sigma^2) * T) / (sigma * sqrt(T))
  d2 <- d1 - sigma * sqrt(T)
  S * pnorm(d1) - K * exp(-r * T) * pnorm(d2)
}`
        },
        upstream: ["calculo_ito"],
        downstream: ["gran_atractor"]
    },

    {
        id: "alm_redington",
        name: "Inmunización ALM de Redington & Matching Pasivo-Activo",
        shortName: "Inmunización ALM",
        category: "Finanzas",
        position: { x: 120, y: -130, z: -30 },
        color: "#ffd477",
        beaconColor: "#e6b800",
        size: 11,
        languages: ["Python", "R", "Excel/VBA", "LaTeX"],
        frameworks: ["Solvencia II", "ALM"],
        description: "Casamiento de flujos de caja y neutralización de la exposición a variaciones en tipos de interés para preservar el valor neto contable y de solvencia.",
        math: `
\\textbf{Condiciones de Inmunización de Redington:}
1. Valor actual casador:
$$PV(A) = PV(L)$$
2. Duración de Macaulay coincidente:
$$\\mathcal{D}(A) = \\mathcal{D}(L) \\implies \\frac{\\partial PV(A)}{\\partial y} = \\frac{\\partial PV(L)}{\\partial y}$$
3. Convexidad del activo superior a la del pasivo (Garantía de superávit ante shocks):
$$\\mathcal{C}(A) > \\mathcal{C}(L) \\implies \\frac{\\partial^2 PV(A)}{\\partial y^2} > \\frac{\\partial^2 PV(L)}{\\partial y^2}$$
        `,
        code: {
            python: `# Cálculo de Duración y Convexidad de Flujos Pasivos
import numpy as np

def cashflow_metrics(cf_times, cashflows, yield_rate):
    discount_factors = (1 + yield_rate) ** (-cf_times)
    pv_cf = cashflows * discount_factors
    pv_total = np.sum(pv_cf)
    
    # Duración de Macaulay
    macaulay_duration = np.sum(cf_times * pv_cf) / pv_total
    # Convexidad
    convexity = np.sum(cf_times * (cf_times + 1) * pv_cf) / (pv_total * (1 + yield_rate)**2)
    return pv_total, macaulay_duration, convexity

times = np.arange(1, 21)
liabilities = np.full(20, 500000)
pv, dur, conv = cashflow_metrics(times, liabilities, 0.035)
print(f"PV: {pv:,.0f} € | Duración: {dur:.2f} años | Convexidad: {conv:.2f}")`,
            vba: `' Función de Duración de Macaulay en VBA
Function MacDuration(rngFlujos As Range, tasa As Double) As Double
    Dim t As Integer, n As Integer
    Dim pvTotal As Double, num As Double, cf As Double
    n = rngFlujos.Rows.Count
    pvTotal = 0: num = 0
    For t = 1 To n
        cf = rngFlujos.Cells(t, 1).Value
        pvTotal = pvTotal + cf / (1 + tasa) ^ t
        num = num + t * cf / (1 + tasa) ^ t
    Next t
    MacDuration = num / pvTotal
End Function`
        },
        upstream: ["vasicek"],
        downstream: ["gran_atractor"]
    },

    {
        id: "kalman_filter",
        name: "Filtro de Kalman & Series Temporales (VAR/VECM)",
        shortName: "Filtro de Kalman",
        category: "Finanzas",
        position: { x: -160, y: -100, z: -40 },
        color: "#e6b844",
        beaconColor: "#cca000",
        size: 9,
        languages: ["Python", "R", "LaTeX"],
        frameworks: ["ALM", "Solvencia II"],
        description: "Estimación óptima recursiva de variables de estado latentes (como el tipo natural $r^*$ o factores de la curva de tipos de Nelson-Siegel dinámico).",
        math: `
\\textbf{Ecuación de Estado y de Medida:}
$$x_t = F_t x_{t-1} + w_t, \\quad w_t \\sim \\mathcal{N}(0, Q_t)$$
$$z_t = H_t x_t + v_t, \\quad v_t \\sim \\mathcal{N}(0, R_t)$$
\\textbf{Ganancia de Kalman ($K_t$):}
$$K_t = P_{t|t-1} H_t^T \\left( H_t P_{t|t-1} H_t^T + R_t \\right)^{-1}$$
        `,
        code: {
            python: `# Filtro de Kalman con FilterPy en Python
from filterpy.kalman import KalmanFilter
import numpy as np

kf = KalmanFilter(dim_x=2, dim_z=1)
kf.x = np.array([[0.03], [0.0]]) # [nivel_tipo, pendiente]
kf.F = np.array([[1.0, 1.0], [0.0, 0.98]]) # Matriz de transición
kf.H = np.array([[1.0, 0.0]]) # Medida
kf.P *= 1000.
kf.R = 5.
kf.Q = np.eye(2) * 0.0001`
        },
        upstream: [],
        downstream: ["vasicek"]
    },

    // --- NODOS TRANSVERSALES (PUENTES TÉCNICOS) ---
    {
        id: "calculo_ito",
        name: "Cálculo de Itô & Ecuaciones Diferenciales Estocásticas",
        shortName: "Cálculo de Itô",
        category: "Transversal",
        position: { x: -110, y: -30, z: 40 },
        color: "#ffffff",
        beaconColor: "#ffffff",
        size: 11,
        languages: ["Python", "R", "LaTeX"],
        frameworks: ["ALM", "Tarificación", "Solvencia II"],
        description: "Puente matemático fundamental que une los procesos continuos de difusión financiera con el aprendizaje automático probabilístico.",
        math: `
\\textbf{Lema de Itô Fundamental:}
$$df(t, X_t) = \\left( \\frac{\\partial f}{\\partial t} + \\mu_t \\frac{\\partial f}{\\partial x} + \\frac{1}{2} \\sigma_t^2 \\frac{\\partial^2 f}{\\partial x^2} \\right) dt + \\sigma_t \\frac{\\partial f}{\\partial x} dW_t$$
donde $(dW_t)^2 = dt$, $dt \\cdot dW_t = 0$.
        `,
        code: {
            python: `# Simulación del Movimiento Browniano Geométrico (Itô SDE)
import numpy as np

def simulate_gbm(S0, mu, sigma, T=1.0, steps=252, n_paths=1000):
    dt = T / steps
    paths = np.zeros((steps + 1, n_paths))
    paths[0] = S0
    for t in range(1, steps + 1):
        z = np.random.standard_normal(n_paths)
        paths[t] = paths[t-1] * np.exp((mu - 0.5 * sigma**2) * dt + sigma * np.sqrt(dt) * z)
    return paths`
        },
        upstream: [],
        downstream: ["vasicek", "black_scholes"]
    },

    {
        id: "copulas",
        name: "Teoría de Cópulas & Dependencia No Lineal de Colas",
        shortName: "Cópulas (Dependencia)",
        category: "Transversal",
        position: { x: 50, y: 55, z: -110 },
        color: "#a370f7",
        beaconColor: "#9355f7",
        size: 11,
        languages: ["R", "Python", "LaTeX"],
        frameworks: ["Solvencia II", "Tarificación", "Reservas"],
        description: "Estructura de interconexión para modelar la dependencia asimétrica en caídas extremas de mercado y siniestros catastróficos concurrentes.",
        math: `
\\textbf{Teorema de Sklar:}
$$F(x_1, \\dots, x_d) = C\\left( F_1(x_1), \\dots, F_d(x_d) \\right)$$
\\textbf{Cópula de Clayton (Dependencia en cola inferior):}
$$C(u, v) = \\left( \\max\\left( u^{-\\theta} + v^{-\\theta} - 1, \\, 0 \\right) \\right)^{-1/\\theta}, \\quad \\lambda_L = 2^{-1/\\theta}$$
\\textbf{Cópula de Gumbel (Dependencia en cola superior):}
$$C(u, v) = \\exp\\left( -\\left( (-\\ln u)^\\theta + (-\\ln v)^\\theta \\right)^{1/\\theta} \\right), \\quad \\lambda_U = 2 - 2^{1/\\theta}$$
        `,
        code: {
            r: `# Ajuste de Cópulas en R con el paquete copula
library(copula)
# Definir cópula de Gumbel para siniestros catastróficos
gumbel_cop <- gumbelCopula(param = 2.5, dim = 2)
# Ajuste por Máxima Verosimilitud Canónica
# fit_cop <- fitCopula(gumbel_cop, pobs(matriz_retornos), method = "mpl")
# coef(fit_cop)`,
            python: `# Modelado de Cópulas Arquimedianas en Python
import numpy as np
from copulas.bivariate import Clayton, Gumbel

# gumbel = Gumbel()
# gumbel.fit(uniform_data)`
        },
        upstream: [],
        downstream: ["gran_atractor"]
    }
];
