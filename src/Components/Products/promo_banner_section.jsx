import './promo_banner_section.css'

export const PromoBannerSection = ({ banners = [] }) => {
  const featuredBanner = banners.find((banner) => banner.placement === 'featured')
  const sideBanners = banners.filter((banner) => banner.placement === 'side')
  const featuredClass = featuredBanner ? ' has-featured-banner' : ''

  return (
    <section className={`promo-banners${featuredClass}`} aria-label="Special offers">
      {featuredBanner && (
        <article className={`promo-banner promo-banner-featured promo-tone-${featuredBanner.tone}`}>
          <img
            className="promo-banner-featured-image"
            src={featuredBanner.image}
            alt=""
            loading="lazy"
          />
          <div className="promo-banner-featured-copy">
            <p className="promo-banner-eyebrow">{featuredBanner.eyebrow}</p>
            <h2>{featuredBanner.title}</h2>
            <p className="promo-banner-price"><strong>{featuredBanner.offer}</strong></p>
            <a className="promo-banner-button" href={featuredBanner.ctaHref}>
              {featuredBanner.ctaLabel}
            </a>
          </div>
        </article>
      )}

      {sideBanners.length > 0 && (
        <div className="promo-banner-side">
          {sideBanners.map((banner) => (
            <article className={`promo-banner promo-banner-small promo-tone-${banner.tone}`} key={banner.id}>
              <img className="promo-banner-small-image" src={banner.image} alt="" loading="lazy" />
              <div className="promo-banner-small-copy">
                <p className="promo-banner-eyebrow">{banner.eyebrow}</p>
                <h2>{banner.title}</h2>
                <p className="promo-banner-price"><strong>{banner.offer}</strong></p>
                <a href={banner.ctaHref}>{banner.ctaLabel} <span aria-hidden="true">→</span></a>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
