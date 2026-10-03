import './seasonal_promo_banner.css'

export const SeasonalPromoBanner = () => {
  return (
    <section className="seasonal-promo" aria-labelledby="seasonal-promo-title">
      <div className="seasonal-promo-copy">
        <p className="seasonal-promo-eyebrow">THE ORVIXA EDIT</p>
        <h2 id="seasonal-promo-title">
          A little more joy.
          <span>A lot more value.</span>
        </h2>
        <p className="seasonal-promo-description">
          Your next favourite find is closer than you think.
        </p>
        <a className="seasonal-promo-cta" href="#popular-products-title">
          Explore the collection
          <span aria-hidden="true">→</span>
        </a>
      </div>

      <div className="seasonal-promo-art" aria-hidden="true">
        <div className="promo-glow" />
        <div className="promo-ring promo-ring-back" />
        <div className="promo-ring promo-ring-front" />
        <div className="promo-gift promo-gift-large">
          <span className="gift-ribbon gift-ribbon-vertical" />
          <span className="gift-ribbon gift-ribbon-horizontal" />
          <span className="gift-bow gift-bow-left" />
          <span className="gift-bow gift-bow-right" />
        </div>
        <div className="promo-gift promo-gift-small">
          <span className="gift-ribbon gift-ribbon-vertical" />
          <span className="gift-ribbon gift-ribbon-horizontal" />
        </div>
        <span className="promo-spark promo-spark-one">✦</span>
        <span className="promo-spark promo-spark-two">✧</span>
      </div>

      <span className="seasonal-promo-tag">GOOD THINGS INSIDE</span>
    </section>
  )
}
