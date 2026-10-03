import './cart_page.css'
import { appPath } from '../utils/paths'

const formatPrice = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)

const getUnitPrice = (product) => Number(String(product.price).replace(/[^\d]/g, '')) || 0

export const CartPage = ({ cart, onQuantityChange, onRemove, onClear, onCheckout }) => {
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0)
  const subtotal = cart.reduce((total, item) => total + getUnitPrice(item) * item.quantity, 0)

  return (
    <main className="cart-page">
      <nav className="new-arrivals-breadcrumb" aria-label="Breadcrumb">
        <a href={appPath('/')}>Home</a>
        <span aria-hidden="true">/</span>
        <span aria-current="page">My Cart</span>
      </nav>

      <header className="cart-page-heading">
        <div>
          <p>YOUR ORVIXA PICKS</p>
          <h1>My Cart</h1>
          <span>{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
        </div>
        {cart.length > 0 && (
          <button className="cart-clear-button" type="button" onClick={onClear}>
            Clear cart
          </button>
        )}
      </header>

      {cart.length === 0 ? (
        <section className="cart-empty-state">
          <span className="cart-empty-icon" aria-hidden="true">🛒</span>
          <h2>Your cart is waiting for something lovely</h2>
          <p>Explore Orvixa and add products you’d like to keep.</p>
          <a href={appPath('/')}>Continue shopping <span aria-hidden="true">→</span></a>
        </section>
      ) : (
        <div className="cart-layout">
          <section className="cart-items" aria-label="Cart items">
            {cart.map((item) => (
              <article className="cart-item" key={`${item.brand ?? ''}-${item.name}`}>
                <a className="cart-item-image" href={appPath('/')} aria-label={`Continue shopping for ${item.name}`}>
                  <img src={item.image} alt="" />
                </a>
                <div className="cart-item-details">
                  <p className="cart-item-brand">{item.brand}</p>
                  <h2>{item.name}</h2>
                  <div className="cart-item-pricing">
                    <strong>{item.price}</strong>
                    {(item.oldPrice || item.originalPrice) && (
                      <del>{item.oldPrice ?? item.originalPrice}</del>
                    )}
                  </div>
                  <div className="cart-item-actions">
                    <label>
                      Qty
                      <select
                        value={item.quantity}
                        onChange={(event) => onQuantityChange(item.name, item.brand, Number(event.target.value))}
                        aria-label={`Quantity for ${item.name}`}
                      >
                        {Array.from({ length: 10 }, (_, index) => index + 1).map((quantity) => (
                          <option key={quantity} value={quantity}>{quantity}</option>
                        ))}
                      </select>
                    </label>
                    <span aria-hidden="true" />
                    <button type="button" onClick={() => onRemove(item.name, item.brand)}>
                      Remove
                    </button>
                  </div>
                </div>
                <strong className="cart-item-total">
                  {formatPrice(getUnitPrice(item) * item.quantity)}
                </strong>
              </article>
            ))}
          </section>

          <aside className="cart-summary">
            <p className="cart-summary-eyebrow">ORDER SUMMARY</p>
            <div className="cart-summary-row">
              <span>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
              <strong>{formatPrice(subtotal)}</strong>
            </div>
            <p className="cart-summary-note">Shipping and any applicable taxes are shown at checkout.</p>
            <button className="cart-checkout-button" type="button" onClick={onCheckout}>
              Continue to checkout
            </button>
            <a className="cart-continue-link" href={appPath('/')}>Continue shopping</a>
            <div className="cart-summary-assurance">
              <span aria-hidden="true">✓</span>
              <span>Order details remain available in your cart on this device.</span>
            </div>
          </aside>
        </div>
      )}
    </main>
  )
}
