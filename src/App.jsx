import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { Header } from './Components/Header'
import { Hero } from './Components/Hero'
import { PopularProducts } from './Components/Products/popular_products'
import { PromoBannerSection } from './Components/Products/promo_banner_section'
import { LatestProducts } from './Components/Products/latest_product'
import { SeasonalPromoBanner } from './Components/Products/seasonal_promo_banner'
import { FeaturedProducts } from './Components/Products/featured_product'
import { Footer } from './Components/Footer'
import { ProductViewPage } from './Components/Products/Product_view_page'
import { NewArrivalsPage } from './Components/Products/New_arrivals_page'
import { BestSellersPage } from './Components/Products/Best_sellers_page'
import { CategoryListingPage } from './Components/Products/Category_listing_page'
import { additionalCategories } from './data/additionalCategories'
import { CustomerServicePage } from './Components/Customer_service_page'
import { InformationPage } from './Components/Information_page'
import { SupportPage } from './Components/Support_page'
import { CartPage } from './Components/Cart_page'
import { ReturnsOrdersPage } from './Components/Returns_orders_page'
import { CheckoutPage } from './Components/Checkout_page'
import { LoginPage } from './Components/Login_page'
import { supabase } from './lib/supabase'
import { AdminDashboard } from './Components/Admin_dashboard'
import { newArrivals } from './data/newArrivals'
import { popularProducts } from './data/popularProducts'
import { featuredProducts } from './data/featuredProducts'
import { defaultPromotions } from './data/promotions'
import { defaultPromoBanners } from './data/promoBanners'
import { defaultAdminPageContent, defaultAdminPageProducts } from './data/adminPageDefaults'

function getCurrentPage() {
  if (window.location.pathname === '/admin' || window.location.pathname === '/admin/') return 'admin'
  if (window.location.pathname === '/cart' || window.location.pathname === '/cart/') return 'cart'
  if (window.location.pathname === '/checkout' || window.location.pathname === '/checkout/') return 'checkout'
  if (window.location.pathname === '/login' || window.location.pathname === '/login/') return 'login'
  if (window.location.pathname === '/search' || window.location.pathname === '/search/') return 'search'
  const match = window.location.pathname.match(/^\/(?:category|pages)\/([^/]+)\/?$/)
  return match?.[1] ?? null
}

function getSearchState() {
  const params = new URLSearchParams(window.location.search)
  return {
    query: params.get('q') ?? '',
    category: params.get('category') ?? 'All',
  }
}

const searchCategoryLabels = {
  'new-arrivals': 'New Arrivals',
  'best-sellers': 'Best Sellers',
  'todays-deals': 'Today’s Deals',
  electronics: 'Electronics',
  'home-kitchen': 'Home & Kitchen',
  fashion: 'Fashion',
  beauty: 'Beauty',
  'mobile-phones': 'Mobile Phones',
  computers: 'Computers',
}

const normalizeSearchText = (value) => String(value ?? '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLocaleLowerCase()

const CART_STORAGE_KEY = 'orvixa-cart'
const ADMIN_PRODUCTS_KEY = 'orvixa-admin-products'
const ADMIN_BANNERS_KEY = 'orvixa-admin-banners'
const ADMIN_PROMO_BANNERS_KEY = 'orvixa-admin-promo-banners'
const ADMIN_ORDERS_KEY = 'orvixa-admin-orders'
const ADMIN_PAGE_CONTENT_KEY = 'orvixa-admin-page-content'
const ADMIN_PAGE_PRODUCTS_KEY = 'orvixa-admin-page-products'

const seedCollection = (items, collection) => items.map((item, index) => ({
  ...item,
  oldPrice: item.oldPrice ?? item.originalPrice,
  originalPrice: item.originalPrice ?? item.oldPrice,
  id: `${collection}-seed-${index}`,
}))

const defaultAdminProducts = {
  popular: seedCollection(popularProducts, 'popular'),
  latest: seedCollection(newArrivals, 'latest'),
  featured: seedCollection(featuredProducts, 'featured'),
}

const defaultAdminBanners = defaultPromotions.map((banner, index) => ({
  ...banner,
  id: `banner-seed-${index}`,
}))

const initialPromoBanners = defaultPromoBanners

const defaultAdminOrders = [
  { id: 'DEMO-1001', customer: 'Aarav S.', item: 'Everyday Casual Top', total: '₹749', status: 'Confirmed' },
  { id: 'DEMO-1002', customer: 'Diya M.', item: 'Classic Polo T-Shirt', total: '₹1,398', status: 'Shipped' },
]

function readLocalData(key, fallback, validate = (value) => value) {
  const saved = window.localStorage.getItem(key)
  if (!saved) return fallback

  try {
    const parsed = JSON.parse(saved)
    const validated = validate(parsed)
    if (validated === null) throw new TypeError(`Saved data for ${key} has an invalid shape.`)
    return validated
  } catch (error) {
    console.error(`Could not restore ${key} from local storage.`, error)
    window.localStorage.removeItem(key)
    return fallback
  }
}

function getInitialCart() {
  const savedCart = window.localStorage.getItem(CART_STORAGE_KEY)
  if (!savedCart) return []

  try {
    const cart = JSON.parse(savedCart)
    if (!Array.isArray(cart)) throw new TypeError('Saved cart is not a list.')

    return cart.filter((item) =>
      item
      && typeof item.name === 'string'
      && typeof item.image === 'string'
      && typeof item.price === 'string'
      && Number.isInteger(item.quantity)
      && item.quantity > 0)
  } catch (error) {
    console.error('Could not restore the cart from local storage.', error)
    window.localStorage.removeItem(CART_STORAGE_KEY)
    return []
  }
}

function getInitialProduct() {
  if (!window.location.pathname.startsWith('/product/')) return null

  if (window.history.state?.product) return window.history.state.product

  const savedProduct = window.sessionStorage.getItem('orvixa-current-product')
  if (!savedProduct) return null

  try {
    const product = JSON.parse(savedProduct)
    if (!product || typeof product.name !== 'string') return null

    const productSlug = product.name?.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')
    const requestedSlug = window.location.pathname.split('/').filter(Boolean).at(-1)

    if (productSlug !== requestedSlug || typeof product.image !== 'string' || !product.price) return null
    return product
  } catch (error) {
    if (!(error instanceof SyntaxError)) throw error
    console.error('Could not restore the product page from session storage.', error)
    window.sessionStorage.removeItem('orvixa-current-product')
    return null
  }
}

function App() {
  const initialSearch = getSearchState()
  const [selectedProduct, setSelectedProduct] = useState(getInitialProduct)
  const [selectedPage, setSelectedPage] = useState(getCurrentPage)
  const [searchQuery, setSearchQuery] = useState(initialSearch.query)
  const [searchCategory, setSearchCategory] = useState(initialSearch.category)
  const [cart, setCart] = useState(getInitialCart)
  const [authUser, setAuthUser] = useState(null)
  const [authLoaded, setAuthLoaded] = useState(!supabase)
  const [adminProducts, setAdminProducts] = useState(() => readLocalData(
    ADMIN_PRODUCTS_KEY,
    defaultAdminProducts,
    (value) => value && ['popular', 'latest', 'featured'].every((key) => Array.isArray(value[key]))
      ? value
      : null,
  ))
  const [adminBanners, setAdminBanners] = useState(() => readLocalData(
    ADMIN_BANNERS_KEY,
    defaultAdminBanners,
    (value) => Array.isArray(value) ? value : null,
  ))
  const [adminPromoBanners, setAdminPromoBanners] = useState(() => readLocalData(
    ADMIN_PROMO_BANNERS_KEY,
    initialPromoBanners,
    (value) => Array.isArray(value) ? value : null,
  ))
  const [adminOrders, setAdminOrders] = useState(() => readLocalData(
    ADMIN_ORDERS_KEY,
    defaultAdminOrders,
    (value) => Array.isArray(value) ? value : null,
  ))
  const [adminPageContent, setAdminPageContent] = useState(() => readLocalData(
    ADMIN_PAGE_CONTENT_KEY,
    defaultAdminPageContent,
    (value) => value
      && typeof value === 'object'
      && !Array.isArray(value)
      && Object.keys(defaultAdminPageContent).every((pageId) =>
        value[pageId]
        && typeof value[pageId].title === 'string'
        && typeof value[pageId].eyebrow === 'string'
        && typeof value[pageId].description === 'string')
      ? value
      : null,
  ))
  const [adminPageProducts, setAdminPageProducts] = useState(() => readLocalData(
    ADMIN_PAGE_PRODUCTS_KEY,
    defaultAdminPageProducts,
    (value) => value && typeof value === 'object'
      && !Array.isArray(value)
      && Object.keys(defaultAdminPageProducts).every((key) => Array.isArray(value[key]))
      ? value
      : null,
  ))

  useEffect(() => {
    if (!supabase) return undefined

    let active = true
    supabase.auth.getSession()
      .then(({ data, error }) => {
        if (error) throw error
        if (active) setAuthUser(data.session?.user ?? null)
      })
      .catch((error) => {
        console.error('Could not restore the Supabase authentication session.', error)
      })
      .finally(() => {
        if (active) setAuthLoaded(true)
      })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session?.user ?? null)
    })
    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    const storageKeys = {
      [ADMIN_PROMO_BANNERS_KEY]: [setAdminPromoBanners, initialPromoBanners],
      [ADMIN_PAGE_CONTENT_KEY]: [setAdminPageContent, defaultAdminPageContent],
      [ADMIN_PAGE_PRODUCTS_KEY]: [setAdminPageProducts, defaultAdminPageProducts],
    }
    const syncAdminData = (event) => {
      const entry = storageKeys[event.key]
      if (!entry) return
      const [setValue, fallback] = entry
      if (event.newValue === null) {
        setValue(fallback)
        return
      }

      try {
        const savedValue = JSON.parse(event.newValue)
        const validValue = event.key === ADMIN_PROMO_BANNERS_KEY
          ? Array.isArray(savedValue)
          : event.key === ADMIN_PAGE_CONTENT_KEY
            ? Object.keys(defaultAdminPageContent).every((pageId) =>
              savedValue?.[pageId]
              && typeof savedValue[pageId].title === 'string'
              && typeof savedValue[pageId].eyebrow === 'string'
              && typeof savedValue[pageId].description === 'string')
            : Object.keys(defaultAdminPageProducts).every((pageId) =>
              Array.isArray(savedValue?.[pageId]))
        if (!validValue) {
          throw new TypeError(`Saved data for ${event.key} has an invalid shape.`)
        }
        setValue(savedValue)
      } catch (error) {
        console.error(`Could not sync ${event.key} from another browser tab.`, error)
        window.dispatchEvent(new CustomEvent('orvixa-storage-error', {
          detail: 'Could not load admin page changes saved in another tab.',
        }))
      }
    }

    window.addEventListener('storage', syncAdminData)
    return () => window.removeEventListener('storage', syncAdminData)
  }, [])

  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
  }, [cart])

  useEffect(() => {
    try {
      window.localStorage.setItem(ADMIN_PRODUCTS_KEY, JSON.stringify(adminProducts))
      window.localStorage.setItem(ADMIN_BANNERS_KEY, JSON.stringify(adminBanners))
      window.localStorage.setItem(ADMIN_PROMO_BANNERS_KEY, JSON.stringify(adminPromoBanners))
      window.localStorage.setItem(ADMIN_ORDERS_KEY, JSON.stringify(adminOrders))
      window.localStorage.setItem(ADMIN_PAGE_CONTENT_KEY, JSON.stringify(adminPageContent))
      window.localStorage.setItem(ADMIN_PAGE_PRODUCTS_KEY, JSON.stringify(adminPageProducts))
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        window.dispatchEvent(new CustomEvent('orvixa-storage-error', {
          detail: 'Browser storage is full. The latest admin edits are visible now but may not persist after reload; remove unused large images or clear site storage.',
        }))
      } else {
        console.error('Could not save admin changes to browser storage.', error)
        window.dispatchEvent(new CustomEvent('orvixa-storage-error', {
          detail: 'Could not save admin changes in this browser. Check browser storage permissions.',
        }))
      }
    }
  }, [adminProducts, adminBanners, adminPromoBanners, adminOrders, adminPageContent, adminPageProducts])

  useEffect(() => {
    const handleHistoryChange = (event) => {
      setSelectedProduct(event.state?.product ?? getInitialProduct())
      const page = event.state?.product ? null : getCurrentPage()
      setSelectedPage(page)
      if (page === 'search') {
        const search = getSearchState()
        setSearchQuery(search.query)
        setSearchCategory(search.category)
      }
    }

    window.addEventListener('popstate', handleHistoryChange)
    return () => window.removeEventListener('popstate', handleHistoryChange)
  }, [])

  const openProduct = (product) => {
    const productSlug = product.name.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')
    window.sessionStorage.setItem('orvixa-current-product', JSON.stringify(product))
    window.history.pushState({ product }, '', `/product/${productSlug}`)
    setSelectedProduct(product)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  const addToCart = (product, quantity = 1) => {
    setCart((currentCart) => {
      const matchingItem = currentCart.find(
        (item) => item.name === product.name && item.brand === product.brand,
      )

      if (matchingItem) {
        return currentCart.map((item) =>
          item.name === product.name && item.brand === product.brand
            ? { ...item, quantity: item.quantity + quantity }
            : item)
      }

      return [...currentCart, { ...product, quantity }]
    })
  }

  const updateCartQuantity = (name, brand, quantity) => {
    setCart((currentCart) => currentCart.map((item) =>
      item.name === name && item.brand === brand ? { ...item, quantity } : item))
  }

  const removeFromCart = (name, brand) => {
    setCart((currentCart) =>
      currentCart.filter((item) => item.name !== name || item.brand !== brand))
  }

  const navigateToCart = () => {
    window.history.pushState({}, '', '/cart')
    setSelectedProduct(null)
    setSelectedPage('cart')
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  const navigateToLogin = () => {
    window.history.pushState({}, '', '/login')
    setSelectedProduct(null)
    setSelectedPage('login')
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  const navigateToCheckout = () => {
    if (cart.length === 0) return
    window.history.pushState({}, '', '/checkout')
    setSelectedProduct(null)
    setSelectedPage('checkout')
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  const buyNow = (product, quantity) => {
    addToCart(product, quantity)
    navigateToCart()
  }

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0)

  const searchProducts = useMemo(() => {
    const pageIds = searchCategory === 'All'
      ? Object.keys(adminPageProducts)
      : [searchCategory]
    const sourceProducts = searchCategory === 'All'
      ? [
        ...Object.values(adminProducts).flat(),
        ...Object.values(adminPageProducts).flat(),
      ]
      : adminPageProducts[searchCategory] ?? []
    const categoryMembership = new Map()
    for (const pageId of Object.keys(adminPageProducts)) {
      for (const product of adminPageProducts[pageId]) {
        const key = `${normalizeSearchText(product.name)}|${normalizeSearchText(product.brand)}`
        categoryMembership.set(key, [...(categoryMembership.get(key) ?? []), pageId])
      }
    }

    const tokens = normalizeSearchText(searchQuery).trim().split(/\s+/).filter(Boolean)
    const seenProducts = new Set()
    return sourceProducts.filter((product) => {
      const productKey = `${normalizeSearchText(product.name)}|${normalizeSearchText(product.brand)}`
      if (seenProducts.has(productKey)) return false
      seenProducts.add(productKey)
      if (searchCategory !== 'All' && !pageIds.includes(searchCategory)) return false
      const searchableText = normalizeSearchText([
        product.name,
        product.brand,
        product.description,
        ...((categoryMembership.get(productKey) ?? []).map((pageId) => searchCategoryLabels[pageId])),
        ...(Array.isArray(product.highlights) ? product.highlights : []),
      ].join(' '))
      return tokens.every((token) => searchableText.includes(token))
    })
  }, [adminProducts, adminPageProducts, searchCategory, searchQuery])

  const submitSearch = (query, category) => {
    const normalizedQuery = query.trim()
    if (!normalizedQuery) {
      setSelectedProduct(null)
      setSelectedPage('search')
      setSearchQuery('')
      setSearchCategory(category)
      window.history.pushState({}, '', `/search?category=${encodeURIComponent(category)}`)
      window.scrollTo({ top: 0, behavior: 'instant' })
      return
    }

    setSearchQuery(normalizedQuery)
    setSearchCategory(category)
    setSelectedProduct(null)
    setSelectedPage('search')
    const params = new URLSearchParams({ q: normalizedQuery, category })
    window.history.pushState({}, '', `/search?${params.toString()}`)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  const returnToShopping = () => {
    window.history.back()
  }

  return (
    <div>
      <Header
        cartCount={cartItemCount}
        user={authUser}
        onAccountClick={navigateToLogin}
        searchQuery={searchQuery}
        searchCategory={searchCategory}
        onSearchQueryChange={setSearchQuery}
        onSearchCategoryChange={setSearchCategory}
        onSearch={submitSearch}
      />
      {selectedProduct ? (
        <ProductViewPage
          key={selectedProduct.name}
          product={selectedProduct}
          onBack={returnToShopping}
          onProductSelect={openProduct}
          onAddToCart={addToCart}
          onBuyNow={buyNow}
        />
      ) : (
        selectedPage === 'admin' ? (
          <AdminDashboard
            products={adminProducts}
            setProducts={setAdminProducts}
            banners={adminBanners}
            setBanners={setAdminBanners}
            promoBanners={adminPromoBanners}
            setPromoBanners={setAdminPromoBanners}
            orders={adminOrders}
            setOrders={setAdminOrders}
            pageContent={adminPageContent}
            setPageContent={setAdminPageContent}
            pageProducts={adminPageProducts}
            setPageProducts={setAdminPageProducts}
          />
        ) : selectedPage === 'cart' ? (
          <CartPage
            cart={cart}
            onQuantityChange={updateCartQuantity}
            onRemove={removeFromCart}
            onClear={() => setCart([])}
            onCheckout={navigateToCheckout}
          />
        ) : selectedPage === 'checkout' ? (
          <CheckoutPage cart={cart} onClearCart={() => setCart([])} onBack={navigateToCart} />
        ) : selectedPage === 'login' ? (
          <LoginPage client={supabase} user={authUser} isLoading={!authLoaded} onAuthChange={setAuthUser} />
        ) : selectedPage === 'returns-orders' ? (
          <ReturnsOrdersPage orders={adminOrders} />
        ) : selectedPage === 'search' ? (
          <CategoryListingPage
            title={searchQuery ? `Results for “${searchQuery}”` : 'Search Orvixa'}
            eyebrow={searchCategory === 'All' ? 'FIND YOUR NEXT FAVOURITE' : `SEARCHING ${searchCategoryLabels[searchCategory]?.toUpperCase() ?? 'ORVIXA'}`}
            description={searchQuery
              ? `Products matching “${searchQuery}”${searchCategory === 'All' ? '' : ` in ${searchCategoryLabels[searchCategory] ?? searchCategory}`}.`
              : 'Enter a product, brand, or keyword in the search bar above.'}
            products={searchQuery ? searchProducts : []}
            countLabel="matching products"
            badgeClass="search-listing"
            onProductSelect={openProduct}
            onAddToCart={addToCart}
          />
        ) : selectedPage === 'new-arrivals' ? (
          <NewArrivalsPage
            content={adminPageContent['new-arrivals']}
            products={adminPageProducts['new-arrivals']}
            onProductSelect={openProduct}
            onAddToCart={addToCart}
          />
        ) : selectedPage === 'best-sellers' ? (
          <BestSellersPage
            content={adminPageContent['best-sellers']}
            products={adminPageProducts['best-sellers']}
            onProductSelect={openProduct}
            onAddToCart={addToCart}
          />
        ) : selectedPage === 'todays-deals' ? (
          <CategoryListingPage
            {...adminPageContent['todays-deals']}
            products={adminPageProducts['todays-deals']}
            badgeClass={adminPageContent['todays-deals'].badgeClass}
            onProductSelect={openProduct}
            onAddToCart={addToCart}
          />
        ) : selectedPage === 'electronics' ? (
          <CategoryListingPage
            {...adminPageContent.electronics}
            products={adminPageProducts.electronics}
            badgeClass={adminPageContent.electronics.badgeClass}
            onProductSelect={openProduct}
            onAddToCart={addToCart}
          />
        ) : additionalCategories[selectedPage] ? (
          <CategoryListingPage
            {...adminPageContent[selectedPage]}
            products={adminPageProducts[selectedPage]}
            onProductSelect={openProduct}
            onAddToCart={addToCart}
          />
        ) : selectedPage === 'customer-service' ? (
          <CustomerServicePage content={adminPageContent['customer-service']} />
        ) : ['shipping-information', 'returns-refunds', 'faq'].includes(selectedPage) ? (
          <SupportPage page={selectedPage} />
        ) : ['our-story', 'contact-us', 'privacy-policy', 'terms-conditions'].includes(selectedPage) ? (
          <InformationPage page={selectedPage} />
        ) : (
          <>
            <Hero promotions={adminBanners} />
            <PromoBannerSection banners={adminPromoBanners} />
            <PopularProducts products={adminProducts.popular} onProductSelect={openProduct} onAddToCart={addToCart} />
            <LatestProducts items={adminProducts.latest} onProductSelect={openProduct} onAddToCart={addToCart} />
            <SeasonalPromoBanner />
            <FeaturedProducts items={adminProducts.featured} onProductSelect={openProduct} onAddToCart={addToCart} />
          </>
        )
      )}
      <Footer />
    </div>
  )
}

export default App
