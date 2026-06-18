// Formato de moneda en pesos colombianos (COP) sin decimales.
export function formatCOP(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value || 0)
}

// Parsea un string con separadores ($, puntos) a numero.
export function parseCOP(value: string): number {
  const cleaned = value.replace(/[^\d]/g, "")
  return cleaned ? Number.parseInt(cleaned, 10) : 0
}

export function formatFecha(fecha: string): string {
  const d = new Date(fecha + "T00:00:00")
  return d.toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}
