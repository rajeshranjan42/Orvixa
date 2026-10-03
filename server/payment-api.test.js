import test from 'node:test'
import assert from 'node:assert/strict'
import { createHmac } from 'node:crypto'
import { isValidPaymentSignature } from './payment-utils.js'

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
