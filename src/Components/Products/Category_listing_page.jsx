import { useMemo, useState } from 'react'
import './new_arrivals.css'
import { appPath } from '../../utils/paths'

const categoryMarks = {
  'deals-listing': 'DEAL',
  'best-sellers-listing': 'BEST',
  'electronics-listing': 'TECH',
  'home-kitchen-listing': 'HOME',
  'fashion-listing': 'STYLE',
  'beauty-listing': 'GLOW',
  'mobile-listing': '5G',
  'computer-listing': 'TECH',
}

export const CategoryListingPage = ({
  title,
  eyebrow,
  description,
  products,
  countLabel,
  badgeClass = '',
  bannerImage = '',
  bannerMark,
  onProductSelect,
  onAddToCart,
}) => {
  const [sortBy, setSortBy] = useState('featured')

  const sortedProducts = useMemo(() => {
    const items = [...products]
    if (sortBy === 'price-low') {
      items.sort((a, b) => Number(a.price.replace(/[^\d]/g, '')) - Number(b.price.replace(/[^\d]/g, '')))
    } else if (sortBy === 'price-high') {
      items.sort((a, b) => Number(b.price.replace(/[^\d]/g, '')) - Number(a.price.replace(/[^\d]/g, '')))
    } else if (sortBy === 'rating') {
      items.sort((a, b) => Number(b.rating) - Number(a.rating))
    }
    return items
  }, [products, sortBy])

  return (
    <main className={`new-arrivals-page ${badgeClass}`}>
      <nav className="new-arrivals-breadcrumb" aria-label="Breadcrumb">
        <a href={appPath('/')}>Home</a>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{title}</span>
      </nav>

      <header
        className={`new-arrivals-banner${bannerImage ? ' has-custom-banner-image' : ''}`}
        style={bannerImage ? {
          backgroundImage: `linear-gradient(90deg, rgb(7 26 61 / 88%), rgb(7 26 61 / 48%)), url("${bannerImage}")`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        } : undefined}
      >
        <div>
          <p>{eyebrow}</p>
          <h1>{title}</h1>
          <span>{description}</span>
        </div>
        <span
          className={`new-arrivals-banner-mark${!bannerMark && !categoryMarks[badgeClass] ? ' is-logo-mark' : ''}`}
          aria-hidden="true"
        >
          {!bannerMark && !categoryMarks[badgeClass]
            ? <img src={`${import.meta.env.BASE_URL}favicon.png`} alt="" />
            : bannerMark ?? categoryMarks[badgeClass]}
        </span>
      </header>

      <div className="new-arrivals-toolbar">
        <p><strong>{sortedProducts.length}</strong> {countLabel}</p>
        <label>
          Sort by
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="featured">Featured</option>
            <option value="rating">Top rated</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
          </select>
        </label>
      </div>

      <div className="new-arrivals-grid">
        {sortedProducts.map((product) => (
          <article className="product-card latest-product-card" key={product.id ?? product.name}>
            <div className="product-image-wrap">
              <button
                className="product-image-button"
                type="button"
                aria-label={`View ${product.name}`}
                onClick={() => onProductSelect?.(product)}
              >
                <img className="product-image" src={product.image} alt="" loading="lazy" />
                {product.hoverImage && (
                  <img
                    className="product-image product-image-hover"
                    src={product.hoverImage}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                  />
                )}
              </button>
              <span className={badgeClass === 'deals-listing'
                ? 'deal-product-badge'
                : badgeClass === 'best-sellers-listing'
                  ? 'best-seller-product-badge'
                  : badgeClass === 'search-listing'
                    ? 'search-product-badge'
                    : badgeClass === 'electronics-listing'
                      || badgeClass === 'mobile-listing'
                      || badgeClass === 'computer-listing'
                      ? 'electronics-product-badge'
                      : 'latest-product-badge'}>
                {product.badge}
              </span>
            </div>
            <div className="product-details">
              <p className="product-brand">{product.brand}</p>
              <h2>
                <button
                  className="product-name-button"
                  type="button"
                  onClick={() => onProductSelect?.(product)}
                >
                  {product.name}
                </button>
              </h2>
              <div
                className="product-rating"
                aria-label={`${product.rating} out of 5 stars, ${product.reviews} reviews`}
              >
                <span aria-hidden="true">★★★★★</span>
                <small>({product.reviews})</small>
              </div>
              <div className="product-pricing">
                <del>{product.oldPrice}</del>
                <strong>{product.price}</strong>
              </div>
              <button
                className="new-arrival-view-button category-product-button"
                type="button"
                onClick={() => onProductSelect?.(product)}
              >
                View product
                <span aria-hidden="true">→</span>
              </button>
              <button
                className="add-to-cart"
                type="button"
                onClick={() => onAddToCart?.(product)}
              >
                Add to Cart
              </button>
            </div>
          </article>
        ))}
      </div>
      {sortedProducts.length === 0 && (
        <div className="category-empty-state" role="status">
          <span aria-hidden="true">⌕</span>
          <h2>{badgeClass === 'search-listing' ? 'No matching products found' : 'Products coming soon'}</h2>
          <p>
            {badgeClass === 'search-listing'
              ? 'Try a different keyword or select another category.'
              : 'Please check back soon for products in this collection.'}
          </p>
        </div>
      )}
    </main>
  )
}
