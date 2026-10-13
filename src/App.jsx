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
import { appPath, appPathname } from './utils/paths'
import { usePersistentState } from './utils/usePersistentState'

function getCurrentPage() {
  const pathname = appPathname()
  if (pathname === '/admin' || pathname === '/admin/') return 'admin'
  if (pathname === '/cart' || pathname === '/cart/') return 'cart'
  if (pathname === '/checkout' || pathname === '/checkout/') return 'checkout'
  if (pathname === '/login' || pathname === '/login/') return 'login'
  if (pathname === '/search' || pathname === '/search/') return 'search'
  const match = pathname.match(/^\/(?:category|pages)\/([^/]+)\/?$/)
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

const isObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value)

const isProduct = (value) => isObject(value)
  && typeof value.name === 'string'
  && typeof value.image === 'string'
  && typeof value.price === 'string'
  && (value.brand === undefined || typeof value.brand === 'string')

const getCartKey = (product) => [product.name, product.brand ?? '', product.price].join('|')

const toCartItem = (product, quantity) => ({
  cartKey: getCartKey(product),
  ...(product.id ? { id: product.id } : {}),
  name: product.name,
  brand: product.brand,
  image: product.image,
  price: product.price,
  ...(product.oldPrice ? { oldPrice: product.oldPrice } : {}),
  ...(product.originalPrice ? { originalPrice: product.originalPrice } : {}),
  quantity,
})

const validateCart = (value) => Array.isArray(value)
  ? value
    .filter((item) => isProduct(item) && Number.isInteger(item.quantity) && item.quantity > 0)
    .map((item) => toCartItem(item, item.quantity))
  : null

const validateProductLists = (keys) => (value) => isObject(value)
  && keys.every((key) => Array.isArray(value[key]))
  ? Object.fromEntries(keys.map((key) => [key, value[key].filter(isProduct)]))
  : null

const validateAdminProducts = validateProductLists(['popular', 'latest', 'featured'])
const validateAdminPageProducts = validateProductLists(Object.keys(defaultAdminPageProducts))

const validateBanners = (value) => Array.isArray(value)
  ? value.filter((banner) => isObject(banner) && typeof banner.image === 'string' && typeof banner.title === 'string')
  : null

const validateOrders = (value) => Array.isArray(value)
  ? value.filter((order) => isObject(order) && typeof order.id === 'string' && typeof order.status === 'string')
  : null

const validatePageContent = (value) => isObject(value)
  && Object.keys(defaultAdminPageContent).every((pageId) =>
    isObject(value[pageId])
    && typeof value[pageId].title === 'string'
    && typeof value[pageId].eyebrow === 'string'
    && typeof value[pageId].description === 'string')
  ? value
  : null

const emptyCart = []

function getInitialProduct() {
  const pathname = appPathname()
  if (!pathname.startsWith('/product/')) return null

  if (window.history.state?.product) return window.history.state.product

  const savedProduct = window.sessionStorage.getItem('orvixa-current-product')
  if (!savedProduct) return null

  try {
    const product = JSON.parse(savedProduct)
    if (!product || typeof product.name !== 'string') return null

    const productSlug = product.name?.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')
    const requestedSlug = pathname.split('/').filter(Boolean).at(-1)

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
  const [cart, setCart, cartLoaded] = usePersistentState(CART_STORAGE_KEY, emptyCart, validateCart)
  const [authUser, setAuthUser] = useState(null)
  const [authLoaded, setAuthLoaded] = useState(!supabase)
  const [adminProducts, setAdminProducts, adminProductsLoaded] = usePersistentState(
    ADMIN_PRODUCTS_KEY,
    defaultAdminProducts,
    validateAdminProducts,
  )
  const [adminBanners, setAdminBanners, adminBannersLoaded] = usePersistentState(
    ADMIN_BANNERS_KEY,
    defaultAdminBanners,
    validateBanners,
  )
  const [adminPromoBanners, setAdminPromoBanners, adminPromoBannersLoaded] = usePersistentState(
    ADMIN_PROMO_BANNERS_KEY,
    initialPromoBanners,
    validateBanners,
  )
  const [adminOrders, setAdminOrders, adminOrdersLoaded] = usePersistentState(
    ADMIN_ORDERS_KEY,
    defaultAdminOrders,
    validateOrders,
  )
  const [adminPageContent, setAdminPageContent, adminPageContentLoaded] = usePersistentState(
    ADMIN_PAGE_CONTENT_KEY,
    defaultAdminPageContent,
    validatePageContent,
  )
  const [adminPageProducts, setAdminPageProducts, adminPageProductsLoaded] = usePersistentState(
    ADMIN_PAGE_PRODUCTS_KEY,
    defaultAdminPageProducts,
    validateAdminPageProducts,
  )
  const storageLoaded = cartLoaded
    && adminProductsLoaded
    && adminBannersLoaded
    && adminPromoBannersLoaded
    && adminOrdersLoaded
    && adminPageContentLoaded
    && adminPageProductsLoaded

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
    try {
      window.sessionStorage.setItem('orvixa-current-product', JSON.stringify(product))
    } catch (error) {
      console.error('Could not keep the product page for refresh in session storage.', error)
    }
    window.history.pushState({ product }, '', appPath(`/product/${productSlug}`))
    setSelectedProduct(product)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  const addToCart = (product, quantity = 1) => {
    const cartKey = getCartKey(product)
    setCart((currentCart) => currentCart.some((item) => item.cartKey === cartKey)
      ? currentCart.map((item) =>
        item.cartKey === cartKey ? { ...item, quantity: item.quantity + quantity } : item)
      : [...currentCart, toCartItem(product, quantity)])
  }

  const updateCartQuantity = (cartKey, quantity) => {
    setCart((currentCart) => currentCart.map((item) =>
      item.cartKey === cartKey ? { ...item, quantity } : item))
  }

  const removeFromCart = (cartKey) => {
    setCart((currentCart) => currentCart.filter((item) => item.cartKey !== cartKey))
  }

  const navigateToCart = () => {
    window.history.pushState({}, '', appPath('/cart'))
    setSelectedProduct(null)
    setSelectedPage('cart')
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  const navigateToLogin = () => {
    window.history.pushState({}, '', appPath('/login'))
    setSelectedProduct(null)
    setSelectedPage('login')
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  const navigateToCheckout = () => {
    if (cart.length === 0) return
    window.history.pushState({}, '', appPath('/checkout'))
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
      window.history.pushState({}, '', appPath(`/search?category=${encodeURIComponent(category)}`))
      window.scrollTo({ top: 0, behavior: 'instant' })
      return
    }

    setSearchQuery(normalizedQuery)
    setSearchCategory(category)
    setSelectedProduct(null)
    setSelectedPage('search')
    const params = new URLSearchParams({ q: normalizedQuery, category })
    window.history.pushState({}, '', appPath(`/search?${params.toString()}`))
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  const returnToShopping = () => {
    window.history.back()
  }

  if (!storageLoaded) return null

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
