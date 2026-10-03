import { useMemo, useState } from 'react'
import { fetchApiJson } from '../utils/apiResponse'
import { appPath } from '../utils/paths'
import './checkout_page.css'

const formatPrice = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)

const getUnitPrice = (product) => Number(String(product.price).replace(/[^\d]/g, '')) || 0

let razorpayScriptPromise

function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve()
  if (razorpayScriptPromise) return razorpayScriptPromise

  razorpayScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => {
      razorpayScriptPromise = null
      reject(new Error('Razorpay Checkout could not be loaded. Check your connection and try again.'))
    }
    document.body.appendChild(script)
  })

  return razorpayScriptPromise
}

async function requestApi(path, payload) {
  return fetchApiJson(path, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  }, 'Orvixa checkout backend', 'Start it with `npm run dev:payment`.')
}

export const CheckoutPage = ({ cart, onClearCart, onBack }) => {
  const [customer, setCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [confirmation, setConfirmation] = useState(null)
  const amount = useMemo(
    () => cart.reduce((total, item) => total + getUnitPrice(item) * item.quantity, 0),
    [cart],
  )

  const updateCustomer = (event) => {
    setCustomer((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const placeOrder = async (event) => {
    event.preventDefault()
    if (submitting || cart.length === 0) return

    setSubmitting(true)
    setError('')

    try {
      await loadRazorpay()
      const order = await requestApi('/api/checkout/create-order', {
        amount: amount * 100,
        customer,
      })

      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Orvixa',
        description: `Order for ${cart.length} ${cart.length === 1 ? 'item' : 'items'}`,
        order_id: order.orderId,
        prefill: {
          name: customer.name.trim(),
          email: customer.email.trim(),
          contact: customer.phone.trim(),
        },
        theme: { color: '#0969d8' },
        modal: {
          ondismiss: () => setSubmitting(false),
        },
        handler: async (payment) => {
          try {
            const verified = await requestApi('/api/checkout/verify-payment', payment)
            setConfirmation(verified)
            onClearCart()
          } catch (verificationError) {
            setError(`${verificationError.message} If you were charged, contact Orvixa support with payment ID ${payment.razorpay_payment_id}.`)
          } finally {
            setSubmitting(false)
          }
        },
      })

      checkout.on('payment.failed', (event) => {
        setError(event.error?.description ?? 'Payment was not completed. Please try again.')
        setSubmitting(false)
      })
      checkout.open()
    } catch (checkoutError) {
      setError(checkoutError.message)
      setSubmitting(false)
    }
  }

  if (confirmation) {
    return (
      <main className="checkout-page">
        <section className="checkout-confirmation" aria-live="polite">
          <span className="checkout-confirmation-icon" aria-hidden="true">✓</span>
          <p className="checkout-eyebrow">PAYMENT VERIFIED</p>
          <h1>Thank you for your order</h1>
          <p>Your Razorpay test payment was verified successfully. No real money was collected.</p>
          <dl>
            <div><dt>Order reference</dt><dd>{confirmation.orderId}</dd></div>
            <div><dt>Payment reference</dt><dd>{confirmation.paymentId}</dd></div>
            <div><dt>Paid in test mode</dt><dd>{formatPrice(confirmation.amount / 100)}</dd></div>
          </dl>
          <a href={appPath('/')}>Continue shopping</a>
        </section>
      </main>
    )
  }

  if (cart.length === 0) {
    return (
      <main className="checkout-page">
        <section className="checkout-empty">
          <h1>Your cart is empty</h1>
          <p>Add an item before continuing to checkout.</p>
          <button type="button" onClick={onBack}>Return to cart</button>
        </section>
      </main>
    )
  }

  return (
    <main className="checkout-page">
      <nav className="checkout-breadcrumb" aria-label="Breadcrumb">
        <a href={appPath('/')}>Home</a><span aria-hidden="true">/</span><button type="button" onClick={onBack}>My Cart</button><span aria-hidden="true">/</span><span aria-current="page">Checkout</span>
      </nav>
      <header className="checkout-heading">
        <p className="checkout-eyebrow">SECURE CHECKOUT · TEST MODE</p>
        <h1>Delivery & payment</h1>
        <p>Enter your delivery details, then choose UPI or another available method in Razorpay Checkout.</p>
      </header>

      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={placeOrder}>
          <section className="checkout-panel">
            <div className="checkout-section-heading">
              <span>1</span>
              <div><h2>Contact & delivery</h2><p>Where should we send this order?</p></div>
            </div>
            <div className="checkout-fields">
              <label className="checkout-field checkout-field-full">
                Full name
                <input name="name" value={customer.name} onChange={updateCustomer} autoComplete="name" minLength="2" maxLength="80" required />
              </label>
              <label className="checkout-field">
                Email address
                <input name="email" type="email" value={customer.email} onChange={updateCustomer} autoComplete="email" maxLength="120" required />
              </label>
              <label className="checkout-field">
                Mobile number
                <input name="phone" type="tel" value={customer.phone} onChange={updateCustomer} autoComplete="tel-national" inputMode="numeric" pattern="[6-9][0-9]{9}" maxLength="10" placeholder="10-digit Indian number" required />
              </label>
              <label className="checkout-field checkout-field-full">
                Street address
                <input name="address" value={customer.address} onChange={updateCustomer} autoComplete="street-address" minLength="5" maxLength="160" required />
              </label>
              <label className="checkout-field">
                City
                <input name="city" value={customer.city} onChange={updateCustomer} autoComplete="address-level2" minLength="2" maxLength="80" required />
              </label>
              <label className="checkout-field">
                PIN code
                <input name="postalCode" value={customer.postalCode} onChange={updateCustomer} autoComplete="postal-code" inputMode="numeric" pattern="[1-9][0-9]{5}" maxLength="6" required />
              </label>
            </div>
          </section>

          <section className="checkout-panel checkout-payment-panel">
            <div className="checkout-section-heading">
              <span>2</span>
              <div><h2>Payment method</h2><p>Choose a method securely in Razorpay Checkout.</p></div>
            </div>
            <div className="checkout-method-list" aria-label="Available payment methods">
              <span>UPI</span><span>Cards</span><span>Netbanking</span><span>Wallets</span>
            </div>
            <p className="checkout-method-note">Payment methods shown by Razorpay depend on your test account and device.</p>
          </section>

          {error && <p className="checkout-error" role="alert">{error}</p>}
          <p className="checkout-test-notice">Test mode only. Do not enter real payment details; use Razorpay’s test credentials.</p>
          <button className="checkout-submit" type="submit" disabled={submitting}>
            {submitting ? 'Connecting to Razorpay…' : `Pay ${formatPrice(amount)}`}
          </button>
        </form>

        <aside className="checkout-order-summary">
          <p className="checkout-eyebrow">YOUR ORDER</p>
          {cart.map((item) => (
            <div className="checkout-summary-item" key={`${item.brand ?? ''}-${item.name}`}>
              <div className="checkout-summary-image"><img src={item.image} alt="" /></div>
              <div><strong>{item.name}</strong><span>Qty {item.quantity}</span></div>
              <strong>{formatPrice(getUnitPrice(item) * item.quantity)}</strong>
            </div>
          ))}
          <div className="checkout-summary-total"><span>Total</span><strong>{formatPrice(amount)}</strong></div>
          <p className="checkout-summary-note">Order and payment verification are handled by the server. Shipping/tax rules are not configured in this demo.</p>
        </aside>
      </div>
    </main>
  )
}
