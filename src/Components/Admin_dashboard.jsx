import { useEffect, useState } from 'react'
import './admin_dashboard.css'
import { readImageUpload } from '../utils/imageUpload'
import { adminPages } from '../data/adminPageDefaults'

const collectionNames = {
  popular: 'Popular',
  latest: 'Latest',
  featured: 'Featured',
}

const orderStatuses = ['Placed', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled']

const priceNumber = (price) => Number(String(price).replace(/[^\d]/g, '')) || 0

export const AdminDashboard = ({
  products,
  setProducts,
  banners,
  setBanners,
  promoBanners,
  setPromoBanners,
  orders,
  setOrders,
  pageContent,
  setPageContent,
  pageProducts,
  setPageProducts,
}) => {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedManagedPage, setSelectedManagedPage] = useState(adminPages[0].id)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [storageWarning, setStorageWarning] = useState('')

  useEffect(() => {
    const handleStorageError = (event) => setStorageWarning(event.detail)
    window.addEventListener('orvixa-storage-error', handleStorageError)
    return () => window.removeEventListener('orvixa-storage-error', handleStorageError)
  }, [])

  const clearStorageWarning = () => setStorageWarning('')

  const allProducts = Object.values(products).flat()
  const productCount = allProducts.length
  const orderCount = orders.length
  const managedPage = pageContent[selectedManagedPage]
  const managedPageProducts = pageProducts[selectedManagedPage] ?? []

  const addProduct = async (event) => {
    event.preventDefault()
    const form = event.currentTarget
    setError('')
    setNotice('')
    clearStorageWarning()

    const formData = new FormData(form)
    const name = String(formData.get('name') ?? '').trim()
    const brand = String(formData.get('brand') ?? '').trim()
    const imageFile = formData.get('image')
    const alternateImageFiles = formData.getAll('alternateImages').filter(
      (file) => file instanceof File && file.size > 0,
    )
    const price = String(formData.get('price') ?? '').trim()
    const oldPrice = String(formData.get('oldPrice') ?? '').trim()
    const description = String(formData.get('description') ?? '').trim()
    const highlights = String(formData.get('highlights') ?? '')
      .split('\n')
      .map((highlight) => highlight.trim())
      .filter(Boolean)
    const collections = formData.getAll('collections').filter((value) => value in collectionNames)

    if (!name || !brand || !(imageFile instanceof File) || imageFile.size === 0 || !price || collections.length === 0) {
      setError('Complete the required product details and select at least one collection.')
      return
    }

    if (!priceNumber(price) || (oldPrice && !priceNumber(oldPrice))) {
      setError('Enter a valid numeric product price and, if provided, original price.')
      return
    }

    const duplicateCollection = collections.find((collection) =>
      products[collection].some((product) => product.name.toLowerCase() === name.toLowerCase()))
    if (duplicateCollection) {
      setError(`${name} is already in the ${collectionNames[duplicateCollection]} collection.`)
      return
    }

    try {
      const image = await readImageUpload(imageFile)
      const additionalImages = await Promise.all(alternateImageFiles.map(readImageUpload))
      const product = {
        id: `admin-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name,
        brand,
        image,
        ...(additionalImages.length ? {
          additionalImages,
        } : {}),
        price: price.startsWith('₹') ? price : `₹${price}`,
        ...(oldPrice ? { oldPrice: oldPrice.startsWith('₹') ? oldPrice : `₹${oldPrice}` } : {}),
        ...(description ? { description } : {}),
        ...(highlights.length ? { highlights } : {}),
        rating: '0',
        reviews: '0',
        badge: 'New',
      }
      product.originalPrice = product.oldPrice

      setProducts((current) => ({
        ...current,
        ...Object.fromEntries(collections.map((collection) => [
          collection,
          [product, ...current[collection]],
        ])),
      }))
      form.reset()
      setNotice(`${name} added to ${collections.map((collection) => collectionNames[collection]).join(', ')}.`)
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Could not upload the selected image.')
    }
  }

  const removeProduct = (collection, productId) => {
    clearStorageWarning()
    setProducts((current) => ({
      ...current,
      [collection]: current[collection].filter((product) => product.id !== productId),
    }))
    setNotice(`Product removed from the ${collectionNames[collection]} collection.`)
  }

  const updateProductContent = (event, collection, productId) => {
    event.preventDefault()
    clearStorageWarning()
    const formData = new FormData(event.currentTarget)
    const description = String(formData.get('description') ?? '').trim()
    const highlights = String(formData.get('highlights') ?? '')
      .split('\n')
      .map((highlight) => highlight.trim())
      .filter(Boolean)

    if (!description) {
      setError('Product description cannot be empty.')
      return
    }

    setError('')
    setProducts((current) => Object.fromEntries(
      Object.entries(current).map(([key, items]) => [
        key,
        items.map((product) => product.id === productId
          ? { ...product, description, highlights }
          : product),
      ]),
    ))
    setNotice('Product view content saved.')
  }

  const addBanner = async (event) => {
    event.preventDefault()
    const form = event.currentTarget
    setError('')
    setNotice('')
    clearStorageWarning()
    const formData = new FormData(form)
    const title = String(formData.get('title') ?? '').trim()
    const category = String(formData.get('category') ?? '').trim()
    const imageFiles = formData.getAll('images').filter(
      (file) => file instanceof File && file.size > 0,
    )

    if (!title || !category || imageFiles.length === 0) {
      setError('Enter a banner title and category, and choose one or more images from your device.')
      return
    }

    try {
      const images = await Promise.all(imageFiles.map(readImageUpload))
      const batchId = Date.now()
      const slides = images.map((image, index) => ({
        id: `banner-${batchId}-${index}`,
        title: images.length === 1 ? title : `${title} ${index + 1}`,
        category,
        image,
        tone: String(formData.get('tone') ?? 'dark'),
      }))
      setBanners((current) => [...current, ...slides])
      form.reset()
      setNotice(`${slides.length} ${slides.length === 1 ? 'slide' : 'slides'} added to the homepage carousel.`)
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Could not upload the selected image.')
    }
  }

  const updateBanner = async (event, bannerId, currentImage) => {
    event.preventDefault()
    const form = event.currentTarget
    setError('')
    setNotice('')
    clearStorageWarning()
    const formData = new FormData(form)
    const title = String(formData.get('title') ?? '').trim()
    const category = String(formData.get('category') ?? '').trim()
    const imageFile = formData.get('image')

    if (!title || !category) {
      setError('Banner title and category are required.')
      return
    }

    try {
      const image = imageFile instanceof File && imageFile.size > 0
        ? await readImageUpload(imageFile)
        : currentImage
      setBanners((current) => current.map((banner) => banner.id === bannerId
        ? { ...banner, title, category, image, tone: String(formData.get('tone') ?? 'dark') }
        : banner))
      setNotice('Banner changes saved.')
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Could not upload the selected image.')
    }
  }

  const removeBanner = (bannerId) => {
    clearStorageWarning()
    setBanners((current) => current.filter((banner) => banner.id !== bannerId))
    setNotice('Banner removed from the homepage carousel.')
  }

  const moveBanner = (bannerId, direction) => {
    clearStorageWarning()
    setBanners((current) => {
      const index = current.findIndex((banner) => banner.id === bannerId)
      const targetIndex = index + direction
      if (index < 0 || targetIndex < 0 || targetIndex >= current.length) return current
      const updated = [...current]
      ;[updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]]
      return updated
    })
    setNotice('Homepage slide order updated.')
  }

  const addPromoBanner = async (event) => {
    event.preventDefault()
    const form = event.currentTarget
    setError('')
    setNotice('')
    clearStorageWarning()
    const formData = new FormData(form)
    const imageFile = formData.get('image')
    const placement = String(formData.get('placement') ?? 'side')
    const title = String(formData.get('title') ?? '').trim()
    const eyebrow = String(formData.get('eyebrow') ?? '').trim()
    const offer = String(formData.get('offer') ?? '').trim()
    const ctaLabel = String(formData.get('ctaLabel') ?? '').trim()
    const ctaHref = String(formData.get('ctaHref') ?? '').trim()

    if (
      !(imageFile instanceof File)
      || imageFile.size === 0
      || !title
      || !eyebrow
      || !offer
      || !ctaLabel
      || !ctaHref
      || !['featured', 'side'].includes(placement)
    ) {
      setError('Complete all promo banner content fields and choose an image.')
      return
    }

    try {
      const image = await readImageUpload(imageFile)
      const banner = {
        id: `promo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        placement,
        title,
        eyebrow,
        offer,
        ctaLabel,
        ctaHref,
        tone: String(formData.get('tone') ?? 'blue'),
        image,
      }
      const hasFeaturedBanner = placement === 'featured'
        && promoBanners.some((currentBanner) => currentBanner.placement === 'featured')
      setPromoBanners((current) => hasFeaturedBanner
        ? current.map((currentBanner) => currentBanner.placement === 'featured' ? banner : currentBanner)
        : [...current, banner])
      form.reset()
      setNotice(hasFeaturedBanner
        ? 'Featured promo banner replaced on the homepage.'
        : 'Promo banner added to the homepage.')
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Could not upload the selected promo image.')
    }
  }

  const updatePromoBanner = async (event, bannerId, currentImage) => {
    event.preventDefault()
    const form = event.currentTarget
    setError('')
    setNotice('')
    clearStorageWarning()
    const formData = new FormData(form)
    const imageFile = formData.get('image')
    const title = String(formData.get('title') ?? '').trim()
    const eyebrow = String(formData.get('eyebrow') ?? '').trim()
    const offer = String(formData.get('offer') ?? '').trim()
    const ctaLabel = String(formData.get('ctaLabel') ?? '').trim()
    const ctaHref = String(formData.get('ctaHref') ?? '').trim()

    if (!title || !eyebrow || !offer || !ctaLabel || !ctaHref) {
      setError('Complete all promo banner content fields before saving.')
      return
    }
    const placement = String(formData.get('placement'))
    if (!['featured', 'side'].includes(placement)) {
      setError('Choose a valid promo banner position.')
      return
    }

    try {
      const image = imageFile instanceof File && imageFile.size > 0
        ? await readImageUpload(imageFile)
        : currentImage
      setPromoBanners((current) => {
        const updated = current.map((banner) => banner.id === bannerId
          ? {
            ...banner,
            title,
            eyebrow,
            offer,
            ctaLabel,
            ctaHref,
            placement,
            tone: String(formData.get('tone')),
            image,
          }
          : banner)
        if (placement !== 'featured') return updated
        return updated.filter((banner) => banner.id === bannerId || banner.placement !== 'featured')
      })
      setNotice('Promo banner changes saved.')
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Could not upload the selected promo image.')
    }
  }

  const removePromoBanner = (bannerId) => {
    clearStorageWarning()
    setPromoBanners((current) => current.filter((banner) => banner.id !== bannerId))
    setNotice('Promo banner removed from the homepage.')
  }

  const movePromoBanner = (bannerId, direction) => {
    clearStorageWarning()
    setPromoBanners((current) => {
      const index = current.findIndex((banner) => banner.id === bannerId)
      const targetIndex = index + direction
      if (index < 0 || targetIndex < 0 || targetIndex >= current.length) return current
      const updated = [...current]
      ;[updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]]
      return updated
    })
    setNotice('Promo banner order updated.')
  }

  const updateOrderStatus = (orderId, status) => {
    clearStorageWarning()
    setOrders((current) => current.map((order) =>
      order.id === orderId ? { ...order, status } : order))
    setNotice(`Order ${orderId} status updated.`)
  }

  const saveManagedPage = async (event) => {
    event.preventDefault()
    const form = event.currentTarget
    setError('')
    setNotice('')
    clearStorageWarning()
    const formData = new FormData(form)
    const title = String(formData.get('title') ?? '').trim()
    const eyebrow = String(formData.get('eyebrow') ?? '').trim()
    const description = String(formData.get('description') ?? '').trim()
    const countLabel = String(formData.get('countLabel') ?? '').trim()
    const bannerMark = String(formData.get('bannerMark') ?? '').trim()
    const ctaLabel = String(formData.get('ctaLabel') ?? '').trim()
    const imageFile = formData.get('bannerImage')
    const removeBannerImage = formData.get('removeBannerImage') === 'on'
    const topicsInput = String(formData.get('helpTopics') ?? '').trim()
    const questionsInput = String(formData.get('commonQuestions') ?? '').trim()
    const topics = topicsInput
      ? topicsInput.split('\n').map((line) => line.split('|').map((part) => part.trim()))
      : []
    const questions = questionsInput
      ? questionsInput.split('\n').map((line) => line.split('|').map((part) => part.trim()))
      : []

    if (!title || !eyebrow || !description
      || (selectedManagedPage !== 'customer-service' && (!countLabel || !bannerMark))
      || (selectedManagedPage === 'customer-service'
        && (!ctaLabel
          || topics.length === 0
          || topics.some((topic) => topic.length !== 3
            || !topic[0]
            || !topic[1]
            || !topic[2].startsWith('/')
            || topic[2].startsWith('//'))
          || questions.length === 0
          || questions.some((question) => question.length !== 2 || !question[0] || !question[1])))) {
      setError('Complete all page banner fields before saving.')
      return
    }

    try {
      const bannerImage = removeBannerImage
        ? ''
        : imageFile instanceof File && imageFile.size > 0
          ? await readImageUpload(imageFile)
          : pageContent[selectedManagedPage].bannerImage ?? ''
      setPageContent((current) => ({
        ...current,
        [selectedManagedPage]: {
          ...current[selectedManagedPage],
          title,
          eyebrow,
          description,
          ...(selectedManagedPage !== 'customer-service' ? { countLabel, bannerMark } : {}),
          ...(selectedManagedPage === 'customer-service' ? {
            ctaLabel,
            helpTopics: topics.map(([topicTitle, topicDescription, href], index) => ({
              icon: pageContent[selectedManagedPage].helpTopics?.[index]?.icon ?? '?',
              title: topicTitle,
              description: topicDescription,
              href,
            })),
            commonQuestions: questions.map(([question, answer]) => ({ question, answer })),
          } : {}),
          bannerImage,
        },
      }))
      setNotice(`${adminPages.find((item) => item.id === selectedManagedPage)?.label} page content saved.`)
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Could not upload the selected page banner.')
    }
  }

  const addManagedPageProduct = async (event) => {
    event.preventDefault()
    const form = event.currentTarget
    setError('')
    setNotice('')
    clearStorageWarning()
    const formData = new FormData(form)
    const name = String(formData.get('name') ?? '').trim()
    const brand = String(formData.get('brand') ?? '').trim()
    const price = String(formData.get('price') ?? '').trim()
    const oldPrice = String(formData.get('oldPrice') ?? '').trim()
    const imageFile = formData.get('image')
    const alternateImageFiles = formData.getAll('alternateImages').filter(
      (file) => file instanceof File && file.size > 0,
    )

    if (!name || !brand || !price || !(imageFile instanceof File) || imageFile.size === 0) {
      setError('Enter the product name, brand, price, and select an image.')
      return
    }
    if (!priceNumber(price) || (oldPrice && !priceNumber(oldPrice))) {
      setError('Enter a valid numeric product price and, if provided, original price.')
      return
    }
    if (pageProducts[selectedManagedPage].some((product) =>
      product.name.toLowerCase() === name.toLowerCase())) {
      setError(`${name} is already shown on this page.`)
      return
    }

    try {
      const image = await readImageUpload(imageFile)
      const additionalImages = await Promise.all(alternateImageFiles.map(readImageUpload))
      const product = {
        id: `page-${selectedManagedPage}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name,
        brand,
        image,
        ...(additionalImages.length ? { hoverImage: additionalImages[0], additionalImages } : {}),
        price: price.startsWith('₹') ? price : `₹${price}`,
        ...(oldPrice ? { oldPrice: oldPrice.startsWith('₹') ? oldPrice : `₹${oldPrice}` } : {}),
        rating: '0',
        reviews: '0',
        badge: 'New',
      }
      product.originalPrice = product.oldPrice
      setPageProducts((current) => ({
        ...current,
        [selectedManagedPage]: [product, ...current[selectedManagedPage]],
      }))
      form.reset()
      setNotice(`${name} added to the ${adminPages.find((item) => item.id === selectedManagedPage)?.label} page.`)
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Could not upload the selected product image.')
    }
  }

  const updateManagedPageProduct = async (event, productId, currentProduct) => {
    event.preventDefault()
    const form = event.currentTarget
    setError('')
    setNotice('')
    clearStorageWarning()
    const formData = new FormData(form)
    const name = String(formData.get('name') ?? '').trim()
    const brand = String(formData.get('brand') ?? '').trim()
    const price = String(formData.get('price') ?? '').trim()
    const oldPrice = String(formData.get('oldPrice') ?? '').trim()
    const imageFile = formData.get('image')
    const alternateImageFiles = formData.getAll('alternateImages').filter(
      (file) => file instanceof File && file.size > 0,
    )

    if (!name || !brand || !price || !priceNumber(price) || (oldPrice && !priceNumber(oldPrice))) {
      setError('Enter a product name, brand, and valid prices before saving.')
      return
    }

    try {
      const image = imageFile instanceof File && imageFile.size > 0
        ? await readImageUpload(imageFile)
        : currentProduct.image
      const additionalImages = alternateImageFiles.length
        ? await Promise.all(alternateImageFiles.map(readImageUpload))
        : currentProduct.additionalImages
      setPageProducts((current) => ({
        ...current,
        [selectedManagedPage]: current[selectedManagedPage].map((product) =>
          product.id === productId
            ? {
              ...product,
              name,
              brand,
              image,
              ...(additionalImages?.length ? {
                hoverImage: additionalImages[0],
                additionalImages,
              } : {}),
              price: price.startsWith('₹') ? price : `₹${price}`,
              oldPrice: oldPrice ? (oldPrice.startsWith('₹') ? oldPrice : `₹${oldPrice}`) : '',
              originalPrice: oldPrice ? (oldPrice.startsWith('₹') ? oldPrice : `₹${oldPrice}`) : '',
            }
            : product),
      }))
      setNotice(`${name} updated on the ${adminPages.find((item) => item.id === selectedManagedPage)?.label} page.`)
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Could not upload the selected product image.')
    }
  }

  const removeManagedPageProduct = (productId) => {
    clearStorageWarning()
    setPageProducts((current) => ({
      ...current,
      [selectedManagedPage]: current[selectedManagedPage].filter((product) => product.id !== productId),
    }))
    setNotice('Product removed from this page.')
  }

  return (
    <main className="admin-dashboard">
      <header className="admin-header">
        <div>
          <p>ORVIXA STORE TOOLS</p>
          <h1>Admin Dashboard</h1>
          <span>Manage homepage products, banners, and demo order statuses.</span>
        </div>
        <a href="/" className="admin-store-link">View storefront <span aria-hidden="true">→</span></a>
      </header>

      <aside className="admin-demo-warning" role="note">
        <strong>Local demo only</strong>
        <span>Changes are saved in this browser. This dashboard has no sign-in, server, or real order connection and is not secure for production administration.</span>
      </aside>
      {storageWarning && <p className="admin-feedback is-error" role="alert">{storageWarning}</p>}

      <nav className="admin-tabs" aria-label="Admin sections">
        {[
          ['overview', 'Overview'],
          ['pages', 'Pages'],
          ['products', 'Products'],
          ['banners', 'Slides'],
          ['promo-banners', 'Promo banners'],
          ['orders', 'Orders'],
        ].map(([tab, label]) => (
          <button
            className={activeTab === tab ? 'admin-tab is-active' : 'admin-tab'}
            type="button"
            key={tab}
            onClick={() => {
              setActiveTab(tab)
              setError('')
              setNotice('')
            }}
          >
            {label}
          </button>
        ))}
      </nav>

      {error && <p className="admin-feedback is-error" role="alert">{error}</p>}
      {notice && <p className="admin-feedback" role="status">{notice}</p>}

      {activeTab === 'overview' && (
        <section className="admin-overview" aria-labelledby="admin-overview-title">
          <div className="admin-overview-heading">
            <div>
              <p>YOUR STORE AT A GLANCE</p>
              <h2 id="admin-overview-title">Overview</h2>
              <span>Here’s what’s happening across your Orvixa storefront.</span>
            </div>
            <a href="/" className="admin-overview-store-link">
              View storefront <span aria-hidden="true">↗</span>
            </a>
          </div>
          <div className="admin-overview-welcome">
            <div>
              <span className="admin-overview-welcome-kicker">WELCOME TO YOUR COMMAND CENTER</span>
              <h3>Make today a great day to shop.</h3>
              <p>Keep your products fresh, your promotions shining, and your customers moving.</p>
            </div>
            <span className="admin-overview-welcome-mark" aria-hidden="true">O</span>
          </div>
          <div className="admin-stat-grid">
            <article className="admin-stat-card admin-stat-products">
              <span className="admin-stat-icon" aria-hidden="true">▦</span>
              <span className="admin-stat-label">Homepage products</span>
              <strong>{productCount}</strong>
              <small>Across all collections</small>
            </article>
            <article className="admin-stat-card admin-stat-slides">
              <span className="admin-stat-icon" aria-hidden="true">▣</span>
              <span className="admin-stat-label">Hero slides</span>
              <strong>{banners.length}</strong>
              <small>Featured on your homepage</small>
            </article>
            <article className="admin-stat-card admin-stat-promos">
              <span className="admin-stat-icon" aria-hidden="true">✦</span>
              <span className="admin-stat-label">Promo banners</span>
              <strong>{promoBanners.length}</strong>
              <small>Offers in your promo section</small>
            </article>
            <article className="admin-stat-card admin-stat-orders">
              <span className="admin-stat-icon" aria-hidden="true">↗</span>
              <span className="admin-stat-label">Demo orders</span>
              <strong>{orderCount}</strong>
              <small>Sample orders for status updates</small>
            </article>
          </div>
          <div className="admin-overview-lower">
            <section className="admin-overview-actions" aria-labelledby="admin-overview-actions-title">
              <div className="admin-overview-panel-heading">
                <div>
                  <p>QUICK ACCESS</p>
                  <h3 id="admin-overview-actions-title">Store management</h3>
                </div>
              </div>
              <div className="admin-quick-actions">
                <button type="button" onClick={() => setActiveTab('products')}>
                  <span className="admin-action-icon" aria-hidden="true">＋</span>
                  <span><strong>Manage products</strong><small>Add items or update your collections</small></span>
                  <span className="admin-action-arrow" aria-hidden="true">→</span>
                </button>
                <button type="button" onClick={() => setActiveTab('banners')}>
                  <span className="admin-action-icon" aria-hidden="true">▧</span>
                  <span><strong>Manage hero slides</strong><small>Refresh the images shoppers see first</small></span>
                  <span className="admin-action-arrow" aria-hidden="true">→</span>
                </button>
                <button type="button" onClick={() => setActiveTab('promo-banners')}>
                  <span className="admin-action-icon" aria-hidden="true">✦</span>
                  <span><strong>Manage promotions</strong><small>Update featured and side banners</small></span>
                  <span className="admin-action-arrow" aria-hidden="true">→</span>
                </button>
              </div>
            </section>
            <section className="admin-overview-orders" aria-labelledby="admin-overview-orders-title">
              <div className="admin-overview-panel-heading">
                <div>
                  <p>ORDER DESK</p>
                  <h3 id="admin-overview-orders-title">Recent demo orders</h3>
                </div>
                <button type="button" onClick={() => setActiveTab('orders')}>View all <span aria-hidden="true">→</span></button>
              </div>
              {orders.length ? (
                <div className="admin-overview-order-list">
                  {orders.slice(0, 3).map((order) => (
                    <article className="admin-overview-order" key={order.id}>
                      <span className="admin-overview-order-mark" aria-hidden="true">O</span>
                      <div>
                        <strong>{order.customer}</strong>
                        <span>{order.id} · {order.item}</span>
                      </div>
                      <span className={`admin-order-status admin-order-status-${order.status.toLowerCase()}`}>{order.status}</span>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="admin-overview-empty">No demo orders yet. Sample order activity will appear here.</p>
              )}
              <p className="admin-demo-caption">Sample data only — these are not customer orders.</p>
            </section>
          </div>
        </section>
      )}

      {activeTab === 'pages' && managedPage && (
        <section className="admin-pages" aria-labelledby="admin-pages-title">
          <div className="admin-section-heading">
            <p>STOREFRONT CONTENT</p>
            <h2 id="admin-pages-title">Manage pages</h2>
            <span>Edit page banners and copy, and manage the products shown on each shopping page.</span>
          </div>
          <label className="admin-page-picker">
            Choose a page
            <select
              value={selectedManagedPage}
              onChange={(event) => {
                setSelectedManagedPage(event.target.value)
                setError('')
                setNotice('')
              }}
            >
              {adminPages.map((page) => <option value={page.id} key={page.id}>{page.label}</option>)}
            </select>
          </label>

          <form className="admin-form admin-page-content-form" key={selectedManagedPage} onSubmit={saveManagedPage}>
            <div className="admin-page-form-heading">
              <div>
                <p>PAGE BANNER & COPY</p>
                <h3>{managedPage.label}</h3>
              </div>
              {managedPage.bannerImage && <img src={managedPage.bannerImage} alt={`${managedPage.label} banner preview`} />}
            </div>
            <label>Page title<input name="title" defaultValue={managedPage.title} required maxLength="80" /></label>
            <label>Eyebrow text<input name="eyebrow" defaultValue={managedPage.eyebrow} required maxLength="80" /></label>
            <label className="admin-page-wide-field">Description<textarea name="description" defaultValue={managedPage.description} required maxLength="240" rows="3" /></label>
            {selectedManagedPage !== 'customer-service' && (
              <>
                <label>Product count label<input name="countLabel" defaultValue={managedPage.countLabel} required maxLength="60" /></label>
                <label>Banner mark<input name="bannerMark" defaultValue={managedPage.bannerMark ?? ''} required maxLength="24" /></label>
              </>
            )}
            {selectedManagedPage === 'customer-service' && (
              <>
                <label>Banner button label<input name="ctaLabel" defaultValue={managedPage.ctaLabel ?? 'Explore help topics'} required maxLength="40" /></label>
                <label className="admin-page-wide-field">
                  Help topics <span>(one per line: title | description | internal link)</span>
                  <textarea
                    name="helpTopics"
                    defaultValue={(managedPage.helpTopics ?? []).map((topic) =>
                      `${topic.title} | ${topic.description} | ${topic.href}`).join('\n')}
                    required
                    rows="5"
                  />
                </label>
                <label className="admin-page-wide-field">
                  Frequently asked questions <span>(one per line: question | answer)</span>
                  <textarea
                    name="commonQuestions"
                    defaultValue={(managedPage.commonQuestions ?? []).map((item) =>
                      `${item.question} | ${item.answer}`).join('\n')}
                    required
                    rows="6"
                  />
                </label>
              </>
            )}
            <label className="admin-page-wide-field">
              Replace banner image <span>(optional — leave empty to keep current)</span>
              <input name="bannerImage" type="file" accept="image/*" />
            </label>
            {managedPage.bannerImage && (
              <label className="admin-page-remove-image">
                <input type="checkbox" name="removeBannerImage" />
                Remove the current custom banner image
              </label>
            )}
            <button className="admin-primary-button" type="submit">Save page content</button>
          </form>

          {selectedManagedPage !== 'customer-service' ? (
            <>
              <div className="admin-section-heading admin-page-product-heading">
                <p>PAGE CATALOG</p>
                <h2>Products on {managedPage.label}</h2>
                <span>Add products with device images, edit listing details, or remove products from this page.</span>
              </div>
              <form className="admin-form admin-page-product-add" key={selectedManagedPage} onSubmit={addManagedPageProduct}>
                <label>Product name<input name="name" required maxLength="120" /></label>
                <label>Brand<input name="brand" required maxLength="80" /></label>
                <label>Price<input name="price" required inputMode="decimal" placeholder="1,299" /></label>
                <label>Original price<input name="oldPrice" inputMode="decimal" placeholder="1,599" /></label>
                <label>Product image<input name="image" type="file" accept="image/*" required /></label>
                <label>Alternate images<input name="alternateImages" type="file" accept="image/*" multiple /></label>
                <button className="admin-primary-button" type="submit">Add product to page</button>
              </form>
              <div className="admin-page-product-list">
                {managedPageProducts.length === 0 && <p className="admin-empty-list">No products on this page. Add a product above.</p>}
                {managedPageProducts.map((product) => (
                  <form
                    className="admin-page-product-card"
                    key={product.id ?? product.name}
                    onSubmit={(event) => updateManagedPageProduct(event, product.id, product)}
                  >
                    <img src={product.image} alt="" />
                    <label>Name<input name="name" defaultValue={product.name} required maxLength="120" /></label>
                    <label>Brand<input name="brand" defaultValue={product.brand} required maxLength="80" /></label>
                    <label>Price<input name="price" defaultValue={product.price} required inputMode="decimal" /></label>
                    <label>Original price<input name="oldPrice" defaultValue={product.oldPrice ?? ''} inputMode="decimal" /></label>
                    <label className="admin-page-product-image-field">Replace image <span>(optional)</span><input name="image" type="file" accept="image/*" /></label>
                    <label className="admin-page-product-image-field">Replace alternate images <span>(optional)</span><input name="alternateImages" type="file" accept="image/*" multiple /></label>
                    <div className="admin-banner-actions">
                      <button className="admin-primary-button" type="submit">Save product</button>
                      <button className="admin-danger-button" type="button" onClick={() => removeManagedPageProduct(product.id)}>Remove from page</button>
                    </div>
                  </form>
                ))}
              </div>
            </>
          ) : (
            <p className="admin-page-service-note">Customer Service is a support page, so it has editable page banner and copy but no product catalog.</p>
          )}
        </section>
      )}

      {activeTab === 'products' && (
        <section className="admin-products" aria-labelledby="admin-products-title">
          <div className="admin-section-heading">
            <p>HOMEPAGE CATALOG</p>
            <h2 id="admin-products-title">Add a product</h2>
            <span>Add the same product to one or more homepage collections.</span>
          </div>
          <form className="admin-form" onSubmit={addProduct}>
            <label>Product name<input name="name" required maxLength="100" /></label>
            <label>Brand<input name="brand" required maxLength="70" /></label>
            <label>Product image<input name="image" type="file" accept="image/*" required /></label>
            <label>Alternate images <span>(optional, select multiple)</span><input name="alternateImages" type="file" accept="image/*" multiple /></label>
            <label>Price<input name="price" required placeholder="1299" inputMode="decimal" /></label>
            <label>Original price <span>(optional)</span><input name="oldPrice" placeholder="1599" inputMode="decimal" /></label>
            <label className="admin-product-content-field">
              Product description <span>(shown on product view)</span>
              <textarea name="description" maxLength="1200" rows="4" placeholder="Describe the product, its use, fit, materials, or key details." />
            </label>
            <label className="admin-product-content-field">
              Product highlights <span>(one per line)</span>
              <textarea name="highlights" maxLength="1000" rows="4" placeholder={'Everyday comfort\nThoughtful details\nEasy care'} />
            </label>
            <fieldset className="admin-collection-options">
              <legend>Show in collections</legend>
              {Object.entries(collectionNames).map(([key, label]) => (
                <label key={key}><input type="checkbox" name="collections" value={key} />{label}</label>
              ))}
            </fieldset>
            <button className="admin-primary-button" type="submit">Add product</button>
          </form>

          <div className="admin-collection-list">
            {Object.entries(collectionNames).map(([collection, label]) => (
              <section className="admin-collection" key={collection}>
                <div className="admin-collection-heading">
                  <h3>{label} products</h3>
                  <span>{products[collection].length} items</span>
                </div>
                {products[collection].length === 0 ? (
                  <p className="admin-empty-list">No products in this collection.</p>
                ) : products[collection].map((product) => (
                  <article className="admin-product-row" key={product.id}>
                    <img src={product.image} alt="" />
                    <div><strong>{product.name}</strong><span>{product.brand} · {product.price}</span></div>
                    <button type="button" onClick={() => removeProduct(collection, product.id)}>Remove</button>
                    <details className="admin-product-content-editor">
                      <summary>Edit product view content</summary>
                      <form onSubmit={(event) => updateProductContent(event, collection, product.id)}>
                        <label>
                          Description
                          <textarea name="description" defaultValue={product.description ?? `Meet the ${product.name} from ${product.brand}.`} maxLength="1200" rows="4" required />
                        </label>
                        <label>
                          Highlights <span>(one per line)</span>
                          <textarea name="highlights" defaultValue={(product.highlights ?? []).join('\n')} maxLength="1000" rows="4" />
                        </label>
                        <button className="admin-primary-button" type="submit">Save product content</button>
                      </form>
                    </details>
                  </article>
                ))}
              </section>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'banners' && (
        <section className="admin-banners" aria-labelledby="admin-banners-title">
          <div className="admin-section-heading">
            <p>HOMEPAGE SLIDER</p>
            <h2 id="admin-banners-title">Manage sliding banners</h2>
            <span>Select multiple images to add several slides at once. Edit or remove any slide below.</span>
          </div>
          <form className="admin-form admin-banner-add-form" onSubmit={addBanner}>
            <label>Slide title<input name="title" required maxLength="70" placeholder="Offer (slide number is added for batches)" /></label>
            <label>Category or offer<input name="category" required maxLength="70" /></label>
            <label>Slide images<input name="images" type="file" accept="image/*" multiple required /></label>
            <label>Text contrast<select name="tone" defaultValue="dark"><option value="dark">Dark text</option><option value="light">Light text</option></select></label>
            <button className="admin-primary-button" type="submit">Add slide(s)</button>
          </form>
          <div className="admin-banner-list">
            {banners.length === 0 && <p className="admin-empty-list">No homepage banners. Add one above.</p>}
            {banners.map((banner, index) => (
              <form className="admin-banner-card" key={banner.id} onSubmit={(event) => updateBanner(event, banner.id, banner.image)}>
                <img src={banner.image} alt="" />
                <label>Title<input name="title" defaultValue={banner.title} required maxLength="70" /></label>
                <label>Category or offer<input name="category" defaultValue={banner.category} required maxLength="70" /></label>
                <label>Replace banner image <span>(optional)</span><input name="image" type="file" accept="image/*" /></label>
                <label>Text contrast<select name="tone" defaultValue={banner.tone}><option value="dark">Dark text</option><option value="light">Light text</option></select></label>
                <div className="admin-banner-actions">
                  <button className="admin-primary-button" type="submit">Save changes</button>
                  <button className="admin-danger-button" type="button" onClick={() => removeBanner(banner.id)}>Remove banner</button>
                  <button className="admin-order-button" type="button" disabled={index === 0} onClick={() => moveBanner(banner.id, -1)}>Move up</button>
                  <button className="admin-order-button" type="button" disabled={index === banners.length - 1} onClick={() => moveBanner(banner.id, 1)}>Move down</button>
                </div>
              </form>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'promo-banners' && (
        <section className="admin-banners" aria-labelledby="admin-promo-banners-title">
          <div className="admin-section-heading">
            <p>HOMEPAGE PROMO SECTION</p>
            <h2 id="admin-promo-banners-title">Manage promo banners</h2>
            <span>Change the large promotion and side banners, add more promos, or reorder them.</span>
          </div>
          <form className="admin-form admin-promo-add-form" onSubmit={addPromoBanner}>
            <label>Position<select name="placement" defaultValue="side"><option value="featured">Large feature banner</option><option value="side">Side banner</option></select></label>
            <label>Theme<select name="tone" defaultValue="blue"><option value="blue">Blue</option><option value="rose">Rose</option><option value="home">Warm home</option><option value="mint">Mint</option><option value="navy">Navy</option></select></label>
            <label>Eyebrow<input name="eyebrow" required maxLength="60" placeholder="Big saving days sale" /></label>
            <label>Headline<input name="title" required maxLength="110" /></label>
            <label>Offer text<input name="offer" required maxLength="60" placeholder="Starting at ₹999" /></label>
            <label>Button label<input name="ctaLabel" required maxLength="30" defaultValue="Shop now" /></label>
            <label>Button link<input name="ctaHref" required maxLength="180" defaultValue="/category/new-arrivals" /></label>
            <label>Banner image<input name="image" type="file" accept="image/*" required /></label>
            <button className="admin-primary-button" type="submit">Add promo banner</button>
          </form>
          <div className="admin-banner-list admin-promo-banner-list">
            {promoBanners.length === 0 && <p className="admin-empty-list">No promo banners. Add one above.</p>}
            {promoBanners.map((banner, index) => (
              <form
                className="admin-banner-card"
                key={banner.id}
                onSubmit={(event) => updatePromoBanner(event, banner.id, banner.image)}
              >
                <img src={banner.image} alt="" />
                <label>Position<select name="placement" defaultValue={banner.placement}><option value="featured">Large feature banner</option><option value="side">Side banner</option></select></label>
                <label>Theme<select name="tone" defaultValue={banner.tone}><option value="blue">Blue</option><option value="rose">Rose</option><option value="home">Warm home</option><option value="mint">Mint</option><option value="navy">Navy</option></select></label>
                <label>Eyebrow<input name="eyebrow" defaultValue={banner.eyebrow} required maxLength="60" /></label>
                <label>Headline<input name="title" defaultValue={banner.title} required maxLength="110" /></label>
                <label>Offer text<input name="offer" defaultValue={banner.offer} required maxLength="60" /></label>
                <label>Button label<input name="ctaLabel" defaultValue={banner.ctaLabel} required maxLength="30" /></label>
                <label>Button link<input name="ctaHref" defaultValue={banner.ctaHref} required maxLength="180" /></label>
                <label>Replace image <span>(optional)</span><input name="image" type="file" accept="image/*" /></label>
                <div className="admin-banner-actions">
                  <button className="admin-primary-button" type="submit">Save changes</button>
                  <button className="admin-danger-button" type="button" onClick={() => removePromoBanner(banner.id)}>Remove banner</button>
                  <button className="admin-order-button" type="button" disabled={index === 0} onClick={() => movePromoBanner(banner.id, -1)}>Move up</button>
                  <button className="admin-order-button" type="button" disabled={index === promoBanners.length - 1} onClick={() => movePromoBanner(banner.id, 1)}>Move down</button>
                </div>
              </form>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'orders' && (
        <section className="admin-orders" aria-labelledby="admin-orders-title">
          <div className="admin-section-heading">
            <p>ORDER WORKFLOW DEMO</p>
            <h2 id="admin-orders-title">Update order status</h2>
            <span>Change a sample order status to preview the admin workflow.</span>
          </div>
          <div className="admin-order-list">
            {orders.map((order) => (
              <article className="admin-order-row" key={order.id}>
                <div className="admin-order-main">
                  <strong>{order.id}</strong>
                  <span>{order.customer} · {order.item}</span>
                </div>
                <div className="admin-order-meta"><span>{order.total}</span><small>Sample order</small></div>
                <label>Status
                  <select value={order.status} onChange={(event) => updateOrderStatus(order.id, event.target.value)}>
                    {orderStatuses.map((status) => <option key={status}>{status}</option>)}
                  </select>
                </label>
              </article>
            ))}
            {orders.length === 0 && <p className="admin-empty-list">No demo orders are available.</p>}
          </div>
        </section>
      )}
    </main>
  )
}
