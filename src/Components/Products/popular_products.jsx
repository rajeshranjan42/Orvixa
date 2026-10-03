import { useRef, useState } from 'react'
import './product.css'
import { popularProducts } from '../../data/popularProducts'

function ProductArrow({ direction }) {
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

export const PopularProducts = ({ products = popularProducts, onProductSelect, onAddToCart }) => {
  const carouselRef = useRef(null)
  const [addedProducts, setAddedProducts] = useState(() => new Set())

  const scrollProducts = (direction) => {
    carouselRef.current?.scrollBy({
      left: direction * carouselRef.current.clientWidth * 0.8,
      behavior: 'smooth',
    })
  }

  const scrollToLastProduct = () => {
    carouselRef.current?.scrollTo({
      left: carouselRef.current.scrollWidth,
      behavior: 'smooth',
    })
  }

  return (
    <section className="popular-products" aria-labelledby="popular-products-title">
      <div className="popular-products-heading">
        <div>
          <p className="popular-products-eyebrow">CURATED FOR YOU</p>
          <h2 id="popular-products-title">Popular products</h2>
          <p className="popular-products-subtitle">
            Discover the styles everyone’s loving right now.
          </p>
        </div>
        <div className="popular-products-controls">
          <button className="view-all-products" type="button" onClick={scrollToLastProduct}>
            View all
          </button>
          <button
            className="products-arrow"
            type="button"
            aria-label="Show previous products"
            onClick={() => scrollProducts(-1)}
          >
            <ProductArrow direction="left" />
          </button>
          <button
            className="products-arrow"
            type="button"
            aria-label="Show more products"
            onClick={() => scrollProducts(1)}
          >
            <ProductArrow direction="right" />
          </button>
        </div>
      </div>

      <div className="products-carousel" ref={carouselRef}>
        {products.map((product) => {
          const hoverImage = product.hoverImage ?? product.additionalImages?.[0]
          return (
          <article className="product-card" key={product.id ?? product.name}>
            <div className="product-image-wrap">
              <button
                className="product-image-button"
                type="button"
                aria-label={`View ${product.name}`}
                onClick={() => onProductSelect?.({
                  ...product,
                  originalPrice: product.originalPrice,
                })}
              >
                <img
                  className="product-image"
                  src={product.image}
                  alt=""
                  loading="lazy"
                />
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
              {product.discount && <span className="product-discount">{product.discount} OFF</span>}
            </div>
            <div className="product-details">
              <p className="product-brand">{product.brand}</p>
              <h3 title={product.name}>
                <button
                  className="product-name-button"
                  type="button"
                  onClick={() => onProductSelect?.({
                    ...product,
                    originalPrice: product.originalPrice,
                  })}
                >
                  {product.name}
                </button>
              </h3>
              <div className="product-rating" aria-label={`${product.rating} out of 5 stars, ${product.reviews} reviews`}>
                <span aria-hidden="true">★★★★★</span>
                <small>({product.reviews})</small>
              </div>
              <div className="product-pricing">
                {product.originalPrice && <del>{product.originalPrice}</del>}
                <strong>{product.price}</strong>
              </div>
              <button
                className={addedProducts.has(product.name) ? 'add-to-cart is-added' : 'add-to-cart'}
                type="button"
                aria-pressed={addedProducts.has(product.name)}
                onClick={() => {
                  onAddToCart?.(product)
                  setAddedProducts((current) => new Set(current).add(product.name))
                }}
              >
                <CartIcon />
                {addedProducts.has(product.name) ? 'Added to Cart' : 'Add to Cart'}
              </button>
            </div>
          </article>
          )
        })}
      </div>

      <p className="cart-feedback" aria-live="polite">
        {addedProducts.size > 0
          ? `${addedProducts.size} ${addedProducts.size === 1 ? 'product' : 'products'} added to cart.`
          : ''}
      </p>
    </section>
  )
}