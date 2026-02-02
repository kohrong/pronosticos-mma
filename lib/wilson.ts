/**
 * Calcula el Wilson Score lower bound
 * Fórmula que penaliza muestras pequeñas para rankings más justos
 * @param wins - Número de aciertos
 * @param total - Número total de pronósticos
 * @param confidence - Nivel de confianza (por defecto 0.95)
 * @returns Wilson Score entre 0 y 1
 */
export function wilsonScore(wins: number, total: number, confidence = 0.95): number {
  if (total === 0) return 0

  // Valor z para el nivel de confianza (1.96 para 95%)
  const z = 1.96
  const p = wins / total

  const denominator = 1 + (z * z) / total
  const center = p + (z * z) / (2 * total)
  const spread = z * Math.sqrt((p * (1 - p) + (z * z) / (4 * total)) / total)

  return (center - spread) / denominator
}
