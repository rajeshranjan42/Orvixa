import { createServer } from 'node:http'
import { Buffer } from 'node:buffer'
import { randomUUID } from 'node:crypto'
import process from 'node:process'
import { isValidPaymentSignature } from './payment-utils.js'

const port = Number(process.env.PAYMENT_API_PORT ?? 3001)
const keyId = process.env.RAZORPAY_KEY_ID ?? ''
const keySecret = process.env.RAZORPAY_KEY_SECRET ?? ''
const isTestMode = process.env.PAYMENT_MODE === 'test' && keyId.startsWith('rzp_test_')

function respond(response, status, payload) {
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
  })
  response.end(JSON.stringify(payload))
}

async function readJson(request) {
  let body = ''
  for await (const chunk of request) {
    body += chunk
    if (body.length > 16_384) {
      const error = new Error('Request body is too large.')
      error.status = 413
      throw error
    }
  }

  try {
    return JSON.parse(body)
  } catch {
    const error = new Error('Request body must be valid JSON.')
    error.status = 400
    throw error
  }
}

async function razorpayRequest(path, method, payload) {
  const authorization = Buffer.from(`${keyId}:${keySecret}`).toString('base64')
  const response = await fetch(`https://api.razorpay.com/v1${path}`, {
    method,
    headers: {
      authorization: `Basic ${authorization}`,
      'content-type': 'application/json',
    },
    ...(payload ? { body: JSON.stringify(payload) } : {}),
  })

  const data = await response.json()
  if (!response.ok) {
    console.error(`Razorpay API request failed (${response.status}).`)
    const error = new Error('Razorpay could not process the request. Check the server credentials and gateway dashboard.')
    error.status = 502
    throw error
  }

  return data
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? '/', 'http://127.0.0.1')

  if (request.method === 'GET' && url.pathname === '/api/health') {
    respond(response, 200, { ready: isTestMode && Boolean(keySecret), mode: 'test' })
    return
  }

  if (request.method !== 'POST' || !['/api/checkout/create-order', '/api/checkout/verify-payment'].includes(url.pathname)) {
    respond(response, 404, { error: 'API route not found.' })
    return
  }

  if (!isTestMode || !keySecret) {
    respond(response, 503, { error: 'Razorpay test mode is not configured. Add test credentials to the server .env file.' })
    return
  }

  try {
    const body = await readJson(request)
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      respond(response, 400, { error: 'Request body must be a JSON object.' })
      return
    }

    if (url.pathname === '/api/checkout/create-order') {
      const { amount, customer } = body
      if (!Number.isSafeInteger(amount) || amount < 100 || amount > 100_000_000 || amount % 100 !== 0) {
        respond(response, 400, { error: 'Order amount must be a whole-rupee amount between ₹1 and ₹10,00,000.' })
        return
      }

      const name = typeof customer?.name === 'string' ? customer.name.trim() : ''
      const email = typeof customer?.email === 'string' ? customer.email.trim() : ''
      const phone = typeof customer?.phone === 'string' ? customer.phone.trim() : ''
      const address = typeof customer?.address === 'string' ? customer.address.trim() : ''
      const city = typeof customer?.city === 'string' ? customer.city.trim() : ''
      const postalCode = typeof customer?.postalCode === 'string' ? customer.postalCode.trim() : ''
      if (name.length < 2 || name.length > 80
        || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        || email.length > 120
        || !/^[6-9]\d{9}$/.test(phone)
        || address.length < 5 || address.length > 160
        || city.length < 2 || city.length > 80
        || !/^[1-9]\d{5}$/.test(postalCode)) {
        respond(response, 400, { error: 'Enter a valid name, email, Indian mobile number, and delivery address.' })
        return
      }

      const order = await razorpayRequest('/orders', 'POST', {
        amount,
        currency: 'INR',
        receipt: `orvixa_${randomUUID().replaceAll('-', '').slice(0, 24)}`,
        notes: {
          customer_name: name,
          customer_email: email,
          customer_phone: phone,
          shipping_address: `${address}, ${city}, ${postalCode}`,
        },
      })
      respond(response, 201, {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId,
      })
      return
    }

    const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = body
    if (!isValidPaymentSignature(orderId, paymentId, signature, keySecret)) {
      respond(response, 400, { error: 'Payment signature verification failed.' })
      return
    }

    const [order, payment] = await Promise.all([
      razorpayRequest(`/orders/${encodeURIComponent(orderId)}`, 'GET'),
      razorpayRequest(`/payments/${encodeURIComponent(paymentId)}`, 'GET'),
    ])

    if (payment.order_id !== order.id
      || payment.amount !== order.amount
      || payment.currency !== order.currency
      || payment.status !== 'captured') {
      respond(response, 409, { error: 'The payment is not confirmed as captured. Check the Razorpay dashboard before retrying.' })
      return
    }

    respond(response, 200, {
      verified: true,
      orderId: order.id,
      paymentId: payment.id,
      amount: order.amount,
      currency: order.currency,
    })
  } catch (error) {
    console.error('Checkout API request failed.', error)
    respond(response, error.status ?? 502, {
      error: error.status ? error.message : 'Checkout could not be completed. Please try again.',
    })
  }
})

server.listen(port, '127.0.0.1', () => {
  console.info(`Orvixa Razorpay test API listening on http://127.0.0.1:${port}`)
  if (!isTestMode || !keySecret) {
    console.warn('Payment API is disabled until PAYMENT_MODE=test and Razorpay test credentials are configured.')
  }
})
