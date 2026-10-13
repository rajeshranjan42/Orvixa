import { Buffer } from 'node:buffer'
import { createHmac, timingSafeEqual } from 'node:crypto'

export function isValidPaymentSignature(orderId, paymentId, signature, secret) {
  if (![orderId, paymentId, signature, secret].every((value) => typeof value === 'string' && value)) {
    return false
  }

  const expected = createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex')
  const expectedBuffer = Buffer.from(expected)
  const providedBuffer = Buffer.from(signature)

  return expectedBuffer.length === providedBuffer.length
    && timingSafeEqual(expectedBuffer, providedBuffer)
}

export const MIN_ORDER_AMOUNT = 100
export const MAX_ORDER_AMOUNT = 100_000_000

export function isValidOrderAmount(amount) {
  return Number.isSafeInteger(amount) && amount >= MIN_ORDER_AMOUNT && amount <= MAX_ORDER_AMOUNT
}

export function parseAllowedOrigins(value = '') {
  return value.split(',').map((origin) => origin.trim().replace(/\/+$/, '')).filter(Boolean)
}
