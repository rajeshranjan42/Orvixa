import sareeBanner from '../assets/Images/products/Popular/rnnsaree.jpg'
import homeBanner from '../assets/Images/category-placeholders/home.svg'
import mobileBanner from '../assets/Images/category-placeholders/mobile.svg'

export const defaultPromoBanners = [
  {
    id: 'promo-featured',
    placement: 'featured',
    eyebrow: 'Big saving days sale',
    title: 'RNN Saree New Pakhi Iata Cotton Silk Dhakai Jamdani Saree',
    offer: 'Starting at only ₹651.00',
    image: sareeBanner,
    ctaLabel: 'Shop now',
    ctaHref: '/category/fashion',
    tone: 'rose',
  },
  {
    id: 'promo-home',
    placement: 'side',
    eyebrow: 'A home to love',
    title: 'Make yourself at home',
    offer: 'Under ₹1,200',
    image: homeBanner,
    ctaLabel: 'Shop now',
    ctaHref: '/category/home-kitchen',
    tone: 'home',
  },
  {
    id: 'promo-mobile',
    placement: 'side',
    eyebrow: 'Smart upgrades',
    title: 'More phone for less',
    offer: 'Starting ₹12,000',
    image: mobileBanner,
    ctaLabel: 'Shop now',
    ctaHref: '/category/mobile-phones',
    tone: 'mint',
  },
]
