import { useRef, useState } from 'react'
import './product.css'
import { newArrivals as latestItems } from '../../data/newArrivals'

function ArrowIcon({ direction }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {direction === 'left' ? (
        <path d="m15 18-6-6 6-6" />
      ) : (
        <path d="m9 18 6-6-6-6" />
      )}
    </svg>
  )
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 4h2l2.2 11.2a2 2 0 0 0 2 1.6h8.9a2 2 0 0 0 1.9-1.4L22 8H6" />
      <circle cx="10" cy="21" r="1" />
      <circle cx="18" cy="21" r="1" />
    </svg>
  )
}

export const LatestProducts = ({ items = latestItems, onProductSelect, onAddToCart }) => {
  const carouselRef = useRef(null)
  const [addedItems, setAddedItems] = useState(() => new Set())

  const scrollItems = (direction) => {
    carouselRef.current?.scrollBy({
      left: direction * carouselRef.current.clientWidth * 0.8,
      behavior: 'smooth',
    })
  }

  return (
    <section className="latest-products" aria-labelledby="latest-products-title">
      <div className="latest-products-heading">
        <div>
          <p className="latest-products-eyebrow">FRESHLY PICKED</p>
          <h2 id="latest-products-title">Latest products</h2>
          <p className="latest-products-subtitle">
            New arrivals, ready to find their place in your day.
          </p>
        </div>
        <div className="latest-products-controls">
          <button
            className="view-all-products"
            type="button"
            onClick={() => carouselRef.current?.scrollTo({ left: carouselRef.current.scrollWidth, behavior: 'smooth' })}
          >
            View all
          </button>
          <button
            className="products-arrow"
            type="button"
            aria-label="Show previous latest products"
            onClick={() => scrollItems(-1)}
          >
            <ArrowIcon direction="left" />
          </button>
          <button
            className="products-arrow"
            type="button"
            aria-label="Show more latest products"
            onClick={() => scrollItems(1)}
          >
            <ArrowIcon direction="right" />
          </button>
        </div>
      </div>

      <div className="products-carousel" ref={carouselRef}>
        {items.map((item) => {
          const isAdded = addedItems.has(item.name)
          const hoverImage = item.hoverImage ?? item.additionalImages?.[0]

          return (
            <article className="product-card latest-product-card" key={item.name}>
              <div className="product-image-wrap">
                <button
                  className="product-image-button"
                  type="button"
                  aria-label={`View ${item.name}`}
                  onClick={() => onProductSelect?.({
                    ...item,
                    originalPrice: item.oldPrice,
                  })}
                >
                  <img className="product-image" src={item.image} alt="" loading="lazy" />
                  {hoverImage && (
                    <img
                      className="product-image product-image-hover"
                      src={hoverImage}
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                    />
                  )}
                </button>
                {item.badge && <span className="latest-product-badge">{item.badge}</span>}
              </div>
              <div className="product-details">
                <p className="product-brand">{item.brand}</p>
                <h3 title={item.name}>
                  <button
                    className="product-name-button"
                    type="button"
                    onClick={() => onProductSelect?.({
                      ...item,
                      originalPrice: item.oldPrice,
                    })}
                  >
                    {item.name}
                  </button>
                </h3>
                <div
                  className="product-rating"
                  aria-label={`${item.rating} out of 5 stars, ${item.reviews} reviews`}
                >
                  <span aria-hidden="true">★★★★★</span>
                  <small>({item.reviews})</small>
                </div>
                <div className="product-pricing">
                  {item.oldPrice && <del>{item.oldPrice}</del>}
                  <strong>{item.price}</strong>
                </div>
                <button
                  className={isAdded ? 'add-to-cart is-added' : 'add-to-cart'}
                  type="button"
                  aria-pressed={isAdded}
                  onClick={() => {
                    onAddToCart?.(item)
                    setAddedItems((current) => new Set(current).add(item.name))
                  }}
                >
                  <CartIcon />
                  {isAdded ? 'Added to Cart' : 'Add to Cart'}
                </button>
              </div>
            </article>
          )
        })}
      </div>
      <p className="cart-feedback" aria-live="polite">
        {addedItems.size > 0
          ? `${addedItems.size} ${addedItems.size === 1 ? 'product' : 'products'} added to cart.`
          : ''}
      </p>
    </section>
  )
}