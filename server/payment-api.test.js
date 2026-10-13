import test from 'node:test'
import assert from 'node:assert/strict'
import { createHmac } from 'node:crypto'
import { isValidOrderAmount, isValidPaymentSignature, parseAllowedOrigins } from './payment-utils.js'

test('accepts a matching Razorpay payment signature', () => {
  const orderId = 'order_test_123'
  const paymentId = 'pay_test_456'
  const secret = 'test-secret'
  const signature = createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex')

  assert.equal(isValidPaymentSignature(orderId, paymentId, signature, secret), true)
})

test('rejects altered and missing payment signature values', () => {
  assert.equal(isValidPaymentSignature('order_test_123', 'pay_test_456', 'invalid', 'test-secret'), false)
  assert.equal(isValidPaymentSignature('', 'pay_test_456', 'signature', 'test-secret'), false)
})

test('accepts order amounts in whole paise, including fractional rupees', () => {
  assert.equal(isValidOrderAmount(100), true)
  assert.equal(isValidOrderAmount(129_950), true)
  assert.equal(isValidOrderAmount(100_000_000), true)
})

test('rejects out-of-range or non-integer order amounts', () => {
  assert.equal(isValidOrderAmount(99), false)
  assert.equal(isValidOrderAmount(100_000_001), false)
  assert.equal(isValidOrderAmount(1299.5), false)
  assert.equal(isValidOrderAmount('12995'), false)
})

test('parses the comma-separated CORS origin allowlist', () => {
  assert.deepEqual(
    parseAllowedOrigins(' https://rajeshranjan42.github.io/ , http://localhost:5173,,'),
    ['https://rajeshranjan42.github.io', 'http://localhost:5173'],
  )
  assert.deepEqual(parseAllowedOrigins(), [])
})
