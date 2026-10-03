import { useEffect, useState } from 'react'
import './Header.css'
import logo from '../../assets/Images/logo.png'


const navigationItems = [
  'New Arrivals',
  'Best Sellers',
  'Today’s Deals',
  'Electronics',
  'Home & Kitchen',
  'Fashion',
  'Beauty',
  'Mobile Phones',
  'Computers',
  'Customer Service',
]

const categoryPaths = {
  'New Arrivals': '/category/new-arrivals',
  'Best Sellers': '/category/best-sellers',
  'Today’s Deals': '/category/todays-deals',
  Electronics: '/category/electronics',
  'TV, Appliances & Electronics': '/category/electronics',
  'Home & Kitchen': '/category/home-kitchen',
  Fashion: '/category/fashion',
  Beauty: '/category/beauty',
  'Fashion & Beauty': '/category/fashion',
  'Mobile Phones': '/category/mobile-phones',
  'Mobiles & Computers': '/category/mobile-phones',
  Computers: '/category/computers',
  'Customer Service': '/category/customer-service',
  'Returns & Orders': '/pages/returns-orders',
  'Admin Dashboard': '/admin',
  'Your Account': '/login',
  'Sign in': '/login',
}

const getNavigationHref = (label) =>
  categoryPaths[label] ?? `#${label.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}`

const menuSections = [
  {
    title: 'Trending',
    links: ['Best Sellers', 'New Arrivals', 'Today’s Deals'],
  },
  {
    title: 'Shop by Category',
    links: [
      'Mobiles & Computers',
      'TV, Appliances & Electronics',
      'Home & Kitchen',
      'Fashion & Beauty',
      'Sports & Outdoors',
      'Toys, Kids & Baby',
      'Books & Stationery',
    ],
  },
  {
    title: 'Help & Settings',
    links: ['Returns & Orders', 'Your Account', 'Customer Service', 'Admin Dashboard', 'Sign in'],
  },
]

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="10.8" cy="10.8" r="6.8" />
      <path d="m16 16 5 5" />
    </svg>
  )
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
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

const searchCategories = [
  ['All', 'All'],
  ['New Arrivals', 'new-arrivals'],
  ['Best Sellers', 'best-sellers'],
  ['Today’s Deals', 'todays-deals'],
  ['Electronics', 'electronics'],
  ['Home & Kitchen', 'home-kitchen'],
  ['Fashion', 'fashion'],
  ['Beauty', 'beauty'],
  ['Mobile Phones', 'mobile-phones'],
  ['Computers', 'computers'],
]

export const Header = ({
  cartCount = 0,
  user = null,
  onAccountClick = () => {},
  searchQuery = '',
  searchCategory = 'All',
  onSearchQueryChange = () => {},
  onSearchCategoryChange = () => {},
  onSearch = () => {},
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    if (!isMenuOpen) return undefined

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setIsMenuOpen(false)
    }

    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [isMenuOpen])

  return (
    <header className="site-header">
      <div className="header-main">
        <a className="brand" href="/" aria-label="Orvixa home">
          <img className="brand-logo" src={logo} alt="Orvixa" />
        </a>

        <button className="header-location" type="button">
          <PinIcon />
          <span className="header-copy">
            <span className="header-eyebrow">Delivering to your area</span>
            <strong>Update location</strong>
          </span>
        </button>

        <form
          className="header-search"
          role="search"
          onSubmit={(event) => {
            event.preventDefault()
            onSearch(searchQuery, searchCategory)
          }}
        >
          <label className="visually-hidden" htmlFor="site-search">
            Search Orvixa
          </label>
          <select
            aria-label="Search category"
            value={searchCategory}
            onChange={(event) => onSearchCategoryChange(event.target.value)}
          >
            {searchCategories.map(([label, value]) => (
              <option value={value} key={value}>{label}</option>
            ))}
          </select>
          <input
            id="site-search"
            type="search"
            placeholder="Search Orvixa"
            value={searchQuery}
            onChange={(event) => onSearchQueryChange(event.target.value)}
          />
          <button className="search-submit" type="submit" aria-label="Search">
            <SearchIcon />
          </button>
        </form>

        <button className="header-locale" type="button" aria-label="Language: English">
          <span className="indian-flag" aria-hidden="true" />
          <strong>EN</strong>
          <span className="dropdown-caret" aria-hidden="true" />
        </button>

        <button className="header-account" type="button" onClick={onAccountClick}>
          <span className="header-copy">
            <span className="header-eyebrow">{user ? `Hello, ${user.user_metadata?.full_name || 'welcome back'}` : 'Hello, sign in'}</span>
            <strong>Account &amp; Lists</strong>
          </span>
          <span className="dropdown-caret" aria-hidden="true" />
        </button>

        <a className="header-orders" href="/pages/returns-orders">
          <span className="header-copy">
            <span className="header-eyebrow">Returns</span>
            <strong>&amp; Orders</strong>
          </span>
        </a>

        <a className="header-cart" href="/cart" aria-label={`Cart, ${cartCount} items`}>
          <span className="cart-icon-wrap">
            <CartIcon />
            <span className="cart-count">{cartCount}</span>
          </span>
          <strong>Cart</strong>
        </a>
      </div>

      <nav className="header-nav" aria-label="Main navigation">
        <div className="header-nav-inner">
          <button
            className="nav-item nav-all"
            type="button"
            aria-expanded={isMenuOpen}
            aria-controls="all-menu"
            onClick={() => setIsMenuOpen(true)}
          >
            <span className="menu-icon" aria-hidden="true">☰</span>
            All
          </button>
          {navigationItems.map((item) => (
            <a
              className="nav-item"
              href={getNavigationHref(item)}
              key={item}
            >
              {item}
            </a>
          ))}
        </div>
      </nav>

      {isMenuOpen && (
        <div className="menu-backdrop" onClick={() => setIsMenuOpen(false)}>
          <aside
            className="all-menu"
            id="all-menu"
            aria-label="All navigation"
            aria-modal="true"
            role="dialog"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="all-menu-heading">
              <svg className="user-icon" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21a8 8 0 0 1 16 0" />
              </svg>
              <strong>{user?.user_metadata?.full_name || user?.email || user?.phone || 'Hello, sign in'}</strong>
              <button
                className="menu-close"
                type="button"
                aria-label="Close menu"
                onClick={() => setIsMenuOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="all-menu-content">
              {menuSections.map((section) => (
                <section className="menu-section" key={section.title}>
                  <h2>{section.title}</h2>
                  {section.links.map((link) => (
                    <a
                      href={getNavigationHref(link)}
                      key={link}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link}
                      {section.title !== 'Trending' && (
                        <span className="menu-chevron" aria-hidden="true">›</span>
                      )}
                    </a>
                  ))}
                </section>
              ))}
            </div>
          </aside>
        </div>
      )}
    </header>
  )
}
