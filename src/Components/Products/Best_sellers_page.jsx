import { useMemo, useState } from 'react'
import './new_arrivals.css'
import { bestSellers } from '../../data/bestSellers'
import { appPath } from '../../utils/paths'

export const BestSellersPage = ({ content, products = bestSellers, onProductSelect, onAddToCart }) => {
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

  const page = content ?? {
    title: 'Best Sellers',
    eyebrow: 'MOST LOVED AT ORVIXA',
    description: 'Shop the customer favourites everyone’s talking about.',
    countLabel: 'customer favourites',
    bannerMark: 'TOP\nPICKS',
  }

  return (
    <main className="new-arrivals-page">
      <nav className="new-arrivals-breadcrumb" aria-label="Breadcrumb">
        <a href={appPath('/')}>Home</a>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{page.title}</span>
      </nav>

      <header
        className={`new-arrivals-banner best-sellers-banner${page.bannerImage ? ' has-custom-banner-image' : ''}`}
        style={page.bannerImage ? {
          backgroundImage: `linear-gradient(90deg, rgb(7 26 61 / 88%), rgb(7 26 61 / 48%)), url("${page.bannerImage}")`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        } : undefined}
      >
        <div>
          <p>{page.eyebrow}</p>
          <h1>{page.title}</h1>
          <span>{page.description}</span>
        </div>
        <span className="new-arrivals-banner-mark" aria-hidden="true">{page.bannerMark}</span>
      </header>

      <div className="new-arrivals-toolbar">
        <p><strong>{sortedProducts.length}</strong> {page.countLabel}</p>
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
                <img
                  className="product-image product-image-hover"
                  src={product.hoverImage}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                />
              </button>
              <span className="best-seller-product-badge">{product.badge}</span>
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
                className="new-arrival-view-button best-seller-view-button"
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
    </main>
  )
}
