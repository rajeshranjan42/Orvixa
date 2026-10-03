import { useMemo, useState } from 'react'
import './returns_orders_page.css'

const statusClass = (status) => status.toLowerCase().replaceAll(/[^a-z]+/g, '-')

export const ReturnsOrdersPage = ({ orders = [] }) => {
  const [query, setQuery] = useState('')
  const normalizedQuery = query.trim().toLocaleLowerCase()

  const filteredOrders = useMemo(() => orders.filter((order) =>
    [order.id, order.customer, order.item, order.status]
      .some((value) => String(value ?? '').toLocaleLowerCase().includes(normalizedQuery))),
  [orders, normalizedQuery])

  return (
    <main className="returns-orders-page">
      <nav className="new-arrivals-breadcrumb" aria-label="Breadcrumb">
        <a href="/">Home</a>
        <span aria-hidden="true">/</span>
        <span aria-current="page">Returns &amp; Orders</span>
      </nav>

      <header className="returns-orders-hero">
        <div>
          <p>YOUR ORVIXA SHOPPING</p>
          <h1>Returns &amp; Orders</h1>
          <span>Review order updates and find help with a return or refund.</span>
        </div>
        <span className="returns-orders-hero-icon" aria-hidden="true">↩</span>
      </header>

      <aside className="returns-orders-demo-note" role="note">
        <strong>Demo order history</strong>
        <span>These sample orders demonstrate the storefront experience. No customer orders or real return requests are connected.</span>
      </aside>

      <section className="returns-orders-listing" aria-labelledby="returns-orders-heading">
        <div className="returns-orders-heading">
          <div>
            <p>ORDER HISTORY</p>
            <h2 id="returns-orders-heading">Your orders</h2>
          </div>
          <label className="returns-orders-search">
            <span className="visually-hidden">Search your sample orders</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search orders"
            />
          </label>
        </div>

        {filteredOrders.length ? (
          <div className="returns-order-list">
            {filteredOrders.map((order) => (
              <article className="returns-order-card" key={order.id}>
                <div className="returns-order-card-header">
                  <div><span>ORDER PLACED</span><strong>Demo order</strong></div>
                  <div><span>ORDER NUMBER</span><strong>{order.id}</strong></div>
                  <div><span>TOTAL</span><strong>{order.total}</strong></div>
                  <span className={`returns-order-status returns-order-status-${statusClass(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <div className="returns-order-card-content">
                  <div className="returns-order-icon" aria-hidden="true">O</div>
                  <div className="returns-order-item">
                    <p>{order.item}</p>
                    <span>Ordered for {order.customer}</span>
                  </div>
                  <a href="/pages/returns-refunds">Return &amp; refund help <span aria-hidden="true">→</span></a>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="returns-orders-empty" role="status">
            <span aria-hidden="true">⌕</span>
            <h3>{orders.length ? 'No matching orders' : 'No demo orders yet'}</h3>
            <p>{orders.length
              ? 'Try a different order number, item, customer, or status.'
              : 'Sample orders added in the admin dashboard will appear here.'}</p>
          </div>
        )}
      </section>

      <section className="returns-orders-help">
        <div>
          <p>NEED A HAND?</p>
          <h2>We’ll help you find the next step.</h2>
          <span>Learn about return eligibility, refund timing, and where to get support.</span>
        </div>
        <div className="returns-orders-help-actions">
          <a href="/pages/returns-refunds">Returns &amp; refunds <span aria-hidden="true">→</span></a>
          <a href="/category/customer-service">Customer Service <span aria-hidden="true">→</span></a>
        </div>
      </section>
    </main>
  )
}
