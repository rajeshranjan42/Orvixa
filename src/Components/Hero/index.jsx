import { useEffect, useRef, useState } from 'react'
import './hero.css'

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

export const Hero = ({ promotions = [] }) => {
  const carouselRef = useRef(null)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (promotions.length < 2 || isPaused) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const timer = window.setInterval(() => {
      const carousel = carouselRef.current
      const firstCard = carousel?.firstElementChild
      if (!carousel || !firstCard) return

      const step = firstCard.getBoundingClientRect().width
        + Number.parseFloat(window.getComputedStyle(carousel).columnGap || '0')
      const atEnd = carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 8

      carousel.scrollTo({
        left: atEnd ? 0 : carousel.scrollLeft + step,
        behavior: 'smooth',
      })
    }, 5000)

    return () => window.clearInterval(timer)
  }, [promotions.length, isPaused])

  const scrollPromotions = (direction) => {
    carouselRef.current?.scrollBy({
      left: direction * (carouselRef.current.clientWidth * 0.78),
      behavior: 'smooth',
    })
  }

  return (
    <main className="hero-section" aria-label="Featured offers">
      <div
        className="hero-carousel-wrap"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocusCapture={() => setIsPaused(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setIsPaused(false)
        }}
      >
        <button
          className="hero-arrow hero-arrow-previous"
          type="button"
          aria-label="Show previous offers"
          onClick={() => scrollPromotions(-1)}
        >
          <ArrowIcon direction="left" />
        </button>
        <div className="hero-carousel" ref={carouselRef}>
          {promotions.map((promotion, index) => (
            <article
              className={`promotion-card promotion-card-${promotion.tone}`}
              key={promotion.id ?? promotion.image}
            >
              <img
                className="promotion-image"
                src={promotion.image}
                alt={`Promotion for ${promotion.category}`}
                loading={index === 0 ? 'eager' : 'lazy'}
              />
              <div className="promotion-copy">
                <h2>{promotion.title}</h2>
                <h3>{promotion.category}</h3>
                <p>Get up to ₹150 cashback*</p>
                <div className="promotion-benefits">
                  <span>Free<br />Delivery</span>
                  <span>Easy<br />Returns</span>
                </div>
              </div>
            </article>
          ))}
        </div>
        <button
          className="hero-arrow hero-arrow-next"
          type="button"
          aria-label="Show more offers"
          onClick={() => scrollPromotions(1)}
        >
          <ArrowIcon direction="right" />
        </button>
      </div>
    </main>
  )
}
