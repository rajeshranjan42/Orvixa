const PRICE_PATTERN = /\d[\d,]*(?:\.\d+)?/

export function parsePrice(value) {
  const match = String(value ?? '').match(PRICE_PATTERN)
  if (!match) return 0
  const amount = Number(match[0].replaceAll(',', ''))
  return Number.isFinite(amount) ? Math.round(amount * 100) / 100 : 0
}

export const toPaise = (rupees) => Math.round(rupees * 100)

export function formatPrice(amount) {
  const rounded = Math.round(amount * 100) / 100
  const fractionDigits = Number.isInteger(rounded) ? 0 : 2
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(rounded)
}

export const normalizePriceLabel = (value) => formatPrice(parsePrice(value))

export const comparePrices = (a, b) => parsePrice(a.price) - parsePrice(b.price)
