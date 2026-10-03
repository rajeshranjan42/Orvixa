import { useRef, useState } from 'react'
import './Product_view_page.css'
import suggestedSaree from '../../assets/Images/products/Popular/rnnsaree.jpg'
import suggestedKurta from '../../assets/Images/products/Popular/Floral-Kurta-Women.jpg'
import suggestedTop from '../../assets/Images/products/Popular/blend-top.jpg'
import suggestedPolo from '../../assets/Images/products/Popular/polotshirt.jpg'

const suggestedProducts = [
  {
    name: 'Printed Party Wear Saree',
    brand: 'RNN Collection',
    image: suggestedSaree,
    rating: '4.7',
    reviews: '92',
    price: '₹1,699',
    originalPrice: '₹1,999',
    discount: '15%',
  },
  {
    name: 'Floral Kurta for Women',
    brand: 'Orvixa Style',
    image: suggestedKurta,
    rating: '4.5',
    reviews: '73',
    price: '₹1,299',
    originalPrice: '₹1,599',
    discount: '19%',
  },
  {
    name: 'Everyday Casual Top',
    brand: 'Blend',
    image: suggestedTop,
    rating: '4.4',
    reviews: '58',
    price: '₹749',
    originalPrice: '₹999',
    discount: '25%',
  },
  {
    name: 'Classic Polo T-Shirt',
    brand: 'Orvixa Essentials',
    image: suggestedPolo,
    rating: '4.5',
    reviews: '67',
    price: '₹699',
    originalPrice: '₹899',
    discount: '22%',
  },
]

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 4h2l2.2 11.2a2 2 0 0 0 2 1.6h8.9a2 2 0 0 0 1.9-1.4L22 8H6" />
      <circle cx="10" cy="21" r="1" />
      <circle cx="18" cy="21" r="1" />
    </svg>
  )
}

export const ProductViewPage = ({ product, onBack, onProductSelect, onAddToCart, onBuyNow }) => {
  const suggestionsRef = useRef(null)
  const [selectedImage, setSelectedImage] = useState(product.image)
  const [zoomOrigin, setZoomOrigin] = useState('50% 50%')
  const [quantity, setQuantity] = useState(1)
  const [isAdded, setIsAdded] = useState(false)
  const [customerReviews, setCustomerReviews] = useState([])
  const galleryImages = [...new Set([
    product.image,
    ...(product.additionalImages ?? []),
    product.hoverImage,
  ].filter(Boolean))]
  const highlights = product.highlights?.length
    ? product.highlights
    : [
      `Selected from the ${product.brand} collection`,
      'Multiple product images available to view',
      'Easy returns and customer support',
    ]
  const baseReviewCount = Number(product.reviews) || 0
  const reviewCount = baseReviewCount + customerReviews.length
  const averageRating = reviewCount
    ? (
      (Number(product.rating || 0) * baseReviewCount
        + customerReviews.reduce((total, review) => total + review.rating, 0))
      / reviewCount
    ).toFixed(1)
    : '0.0'

  const scrollSuggestions = (direction) => {
    suggestionsRef.current?.scrollBy({ left: direction * 280, behavior: 'smooth' })
  }

  const submitReview = (event) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const review = {
      id: Date.now(),
      name: formData.get('reviewerName').trim(),
      rating: Number(formData.get('reviewRating')),
      comment: formData.get('reviewComment').trim(),
    }

    setCustomerReviews((current) => [...current, review])
    form.reset()
  }

  const updateZoomOrigin = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - bounds.left) / bounds.width) * 100
    const y = ((event.clientY - bounds.top) / bounds.height) * 100
    setZoomOrigin(`${x}% ${y}%`)
  }

  return (
    <main className="product-view-page">
      <button className="product-view-back" type="button" onClick={onBack}>
        <span aria-hidden="true">←</span> Back to shopping
      </button>

      <div className="product-view-layout">
        <section className="product-view-gallery" aria-label="Product images">
          <div className="product-view-thumbnails">
            {galleryImages.map((image, index) => (
              <button
                className={selectedImage === image ? 'product-thumbnail is-selected' : 'product-thumbnail'}
                type="button"
                aria-label={`View product image ${index + 1}`}
                aria-pressed={selectedImage === image}
                key={image}
                onClick={() => setSelectedImage(image)}
              >
                <img src={image} alt="" />
              </button>
            ))}
          </div>
          <div
            className="product-view-image-frame"
            onMouseMove={updateZoomOrigin}
            onMouseLeave={() => setZoomOrigin('50% 50%')}
          >
            {product.discount && <span className="product-view-discount">{product.discount} OFF</span>}
            <img
              className="product-view-image"
              src={selectedImage}
              alt={product.name}
              title="Hover to zoom"
              style={{ transformOrigin: zoomOrigin }}
            />
          </div>
        </section>

        <section className="product-view-details" aria-labelledby="product-view-title">
          <p className="product-view-brand">{product.brand}</p>
          <h1 id="product-view-title">{product.name}</h1>
          <div
            className="product-view-rating"
            aria-label={`${averageRating} out of 5 stars, ${reviewCount} reviews`}
          >
            <span aria-hidden="true">★★★★★</span>
            <strong>{averageRating}</strong>
            <span className="product-view-review-count">{reviewCount} customer reviews</span>
          </div>

          <div className="product-view-price">
            {product.originalPrice && <del>{product.originalPrice}</del>}
            <strong>{product.price}</strong>
            {product.discount && <span>{product.discount} off</span>}
          </div>
          <p className="product-view-tax-note">Inclusive of all taxes</p>

          <div className="product-view-divider" />
          <p className="product-view-description">
            {product.description
              || 'A thoughtfully selected style made for comfort and everyday confidence. Add a fresh favourite to your wardrobe with this versatile design.'}
          </p>

          <div className="product-view-delivery">
            <span className="delivery-icon" aria-hidden="true">✓</span>
            <span><strong>Easy returns</strong><small>Hassle-free returns and support</small></span>
            <span className="delivery-icon" aria-hidden="true">↗</span>
            <span><strong>Free delivery</strong><small>On eligible orders</small></span>
          </div>

          <div className="product-view-actions">
            <label className="quantity-control">
              <span>Qty</span>
              <select
                value={quantity}
                onChange={(event) => setQuantity(Number(event.target.value))}
              >
                {[1, 2, 3, 4, 5].map((amount) => (
                  <option key={amount} value={amount}>{amount}</option>
                ))}
              </select>
            </label>
            <button
              className={isAdded ? 'product-view-add is-added' : 'product-view-add'}
              type="button"
              onClick={() => {
                onAddToCart?.(product, quantity)
                setIsAdded(true)
              }}
            >
              <CartIcon />
              {isAdded ? 'Added to cart' : 'Add to cart'}
            </button>
            <button
              className="product-view-buy"
              type="button"
              onClick={() => {
                onBuyNow?.(product, quantity)
                setIsAdded(true)
              }}
            >
              Buy now
            </button>
          </div>
          <p className="product-view-feedback" aria-live="polite">
            {isAdded ? `${quantity} × ${product.name} added to cart.` : ''}
          </p>
        </section>
      </div>

      <section className="product-information" aria-label="More product information">
        <article className="product-information-card product-overview">
          <p className="product-information-eyebrow">A CLOSER LOOK</p>
          <h2>About this product</h2>
          <p>{product.description || `Meet the ${product.name} from ${product.brand}. Explore the product photos, compare the available details, and find the right addition for your everyday style.`}</p>
          <ul className="product-highlights">
            {highlights.map((highlight) => (
              <li key={highlight}><span aria-hidden="true">✓</span> {highlight}</li>
            ))}
          </ul>
        </article>

        <article className="product-information-card product-specifications">
          <p className="product-information-eyebrow">AT A GLANCE</p>
          <h2>Product details</h2>
          <dl>
            <div><dt>Product</dt><dd>{product.name}</dd></div>
            <div><dt>Brand</dt><dd>{product.brand}</dd></div>
            <div><dt>Price</dt><dd>{product.price}</dd></div>
            <div><dt>Customer rating</dt><dd>{product.rating} out of 5</dd></div>
            <div><dt>Customer reviews</dt><dd>{product.reviews}</dd></div>
            {product.discount && (
              <div><dt>Offer</dt><dd>{product.discount} off</dd></div>
            )}
          </dl>
        </article>

        <article className="product-information-card product-reviews">
          <p className="product-information-eyebrow">SHOPPER FEEDBACK</p>
          <h2>Customer reviews</h2>
          <div className="product-reviews-summary">
            <strong>{averageRating}</strong>
            <span className="product-review-stars" aria-hidden="true">★★★★★</span>
            <span>out of 5</span>
          </div>
          <p>
            Based on {reviewCount} customer {reviewCount === 1 ? 'review' : 'reviews'}.
          </p>
          <div className="customer-review-list">
            {customerReviews.length === 0 ? (
              <div className="product-reviews-note">
                Be the first to share your experience with this product.
              </div>
            ) : (
              customerReviews.map((review) => (
                <article className="customer-review" key={review.id}>
                  <div className="customer-review-heading">
                    <strong>{review.name}</strong>
                    <span aria-label={`${review.rating} out of 5 stars`}>
                      {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                    </span>
                  </div>
                  <p>{review.comment}</p>
                </article>
              ))
            )}
          </div>
          <form className="review-form" onSubmit={submitReview}>
            <h3>Write a review</h3>
            <div className="review-form-fields">
              <label>
                Your name
                <input name="reviewerName" type="text" autoComplete="name" required maxLength={60} />
              </label>
              <label>
                Your rating
                <select name="reviewRating" defaultValue="5" required>
                  <option value="5">5 - Excellent</option>
                  <option value="4">4 - Very good</option>
                  <option value="3">3 - Good</option>
                  <option value="2">2 - Fair</option>
                  <option value="1">1 - Poor</option>
                </select>
              </label>
            </div>
            <label className="review-comment-field">
              Your review
              <textarea name="reviewComment" required minLength={5} maxLength={1000} rows={4} />
            </label>
            <button className="review-submit" type="submit">Submit review</button>
            <p className="review-submission-note" aria-live="polite">
              Reviews are shown on this page for this browsing session.
            </p>
          </form>
        </article>
      </section>

      <section className="product-suggestions" aria-labelledby="product-suggestions-title">
        <div className="product-suggestions-heading">
          <div>
            <p className="product-information-eyebrow">MORE TO LOVE</p>
            <h2 id="product-suggestions-title">You may also like</h2>
          </div>
          <div className="product-suggestions-controls">
            <button
              className="products-arrow"
              type="button"
              aria-label="Scroll suggestions left"
              onClick={() => scrollSuggestions(-1)}
            >
              <span aria-hidden="true">‹</span>
            </button>
            <button
              className="products-arrow"
              type="button"
              aria-label="Scroll suggestions right"
              onClick={() => scrollSuggestions(1)}
            >
              <span aria-hidden="true">›</span>
            </button>
          </div>
        </div>
        <div className="product-suggestions-list" ref={suggestionsRef}>
          {suggestedProducts
            .filter((suggestion) => suggestion.name !== product.name)
            .map((suggestion) => (
              <article className="product-card suggestion-card" key={suggestion.name}>
                <button
                  className="suggestion-image-button"
                  type="button"
                  aria-label={`View ${suggestion.name}`}
                  onClick={() => onProductSelect?.(suggestion)}
                >
                  <img src={suggestion.image} alt={suggestion.name} loading="lazy" />
                  <span>{suggestion.discount} OFF</span>
                </button>
                <div className="product-details">
                  <p className="product-brand">{suggestion.brand}</p>
                  <h3>
                    <button
                      className="product-name-button"
                      type="button"
                      onClick={() => onProductSelect?.(suggestion)}
                    >
                      {suggestion.name}
                    </button>
                  </h3>
                  <div
                    className="product-rating"
                    aria-label={`${suggestion.rating} out of 5 stars, ${suggestion.reviews} reviews`}
                  >
                    <span aria-hidden="true">★★★★★</span>
                    <small>({suggestion.reviews})</small>
                  </div>
                  <div className="product-pricing">
                    <del>{suggestion.originalPrice}</del>
                    <strong>{suggestion.price}</strong>
                  </div>
                </div>
              </article>
            ))}
        </div>
      </section>
    </main>
  )
}
