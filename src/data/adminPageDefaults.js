import { additionalCategories } from './additionalCategories'
import { bestSellers } from './bestSellers'
import { todaysDeals } from './todaysDeals'
import { electronics } from './electronics'
import { newArrivals } from './newArrivals'

const customerServiceTopics = [
  {
    icon: '▣',
    title: 'Orders & delivery',
    description: 'Find help with order status, delivery dates, and tracking.',
    href: '/pages/shipping-information',
  },
  {
    icon: '↩',
    title: 'Returns & refunds',
    description: 'Learn about returns, exchanges, and refund timelines.',
    href: '/pages/returns-refunds',
  },
  {
    icon: '◉',
    title: 'Payments & offers',
    description: 'Get answers about payment methods and applying offers.',
    href: '/pages/faq',
  },
  {
    icon: '?',
    title: 'Product help',
    description: 'Get support choosing or learning about a product.',
    href: '/pages/faq',
  },
]

const customerServiceQuestions = [
  {
    question: 'How can I check my order status?',
    answer: 'Visit Your Orders in your account and select the order to see its latest status and delivery updates.',
  },
  {
    question: 'How do I request a return?',
    answer: 'Open Your Orders, choose the item, and select the return option if it is available for that product.',
  },
  {
    question: 'When will I receive my refund?',
    answer: 'Refund timing depends on the payment method. You can check the latest refund status from the order details.',
  },
  {
    question: 'How do I get help with a product?',
    answer: 'Open the product details and use the available product information, or contact the seller through the order details after purchase.',
  },
]

const pageDefinitions = [
  {
    id: 'new-arrivals',
    label: 'New Arrivals',
    title: 'New Arrivals',
    eyebrow: 'JUST LANDED AT ORVIXA',
    description: 'Fresh finds, new favourites. Discover what’s just arrived.',
    countLabel: 'new finds to explore',
    bannerMark: 'NEW',
    products: newArrivals,
  },
  {
    id: 'best-sellers',
    label: 'Best Sellers',
    title: 'Best Sellers',
    eyebrow: 'MOST LOVED AT ORVIXA',
    description: 'Shop the customer favourites everyone’s talking about.',
    countLabel: 'customer favourites',
    bannerMark: 'TOP\nPICKS',
    products: bestSellers,
  },
  {
    id: 'todays-deals',
    label: 'Today’s Deals',
    title: 'Today’s Deals',
    eyebrow: 'LIMITED-TIME FINDS',
    description: 'A little more value on the things you’ll love.',
    countLabel: 'deals to explore',
    badgeClass: 'deals-listing',
    products: todaysDeals,
  },
  {
    id: 'electronics',
    label: 'Electronics',
    title: 'Electronics',
    eyebrow: 'TECH THAT FITS YOUR LIFE',
    description: 'Everyday audio, storage, and desk essentials.',
    countLabel: 'tech finds to explore',
    badgeClass: 'electronics-listing',
    products: electronics,
  },
  {
    id: 'home-kitchen',
    label: 'Home & Kitchen',
    ...additionalCategories['home-kitchen'],
  },
  {
    id: 'fashion',
    label: 'Fashion',
    ...additionalCategories.fashion,
  },
  {
    id: 'beauty',
    label: 'Beauty',
    ...additionalCategories.beauty,
  },
  {
    id: 'mobile-phones',
    label: 'Mobile Phones',
    ...additionalCategories['mobile-phones'],
  },
  {
    id: 'computers',
    label: 'Computers',
    ...additionalCategories.computers,
  },
  {
    id: 'customer-service',
    label: 'Customer Service',
    title: 'How can we help?',
    eyebrow: 'HERE WHEN YOU NEED US',
    description: 'Find answers and support for your Orvixa shopping experience.',
    countLabel: 'support topics',
    bannerMark: 'HELP',
    ctaLabel: 'Explore help topics',
    helpTopics: customerServiceTopics,
    commonQuestions: customerServiceQuestions,
    products: [],
  },
]

export const adminPages = pageDefinitions.map((page) => Object.fromEntries(
  Object.entries(page).filter(([key]) => key !== 'products'),
))

export const defaultAdminPageContent = Object.fromEntries(
  pageDefinitions.map((page) => [
    page.id,
    {
      ...Object.fromEntries(Object.entries(page).filter(
        ([key]) => !['id', 'label', 'products'].includes(key),
      )),
      bannerImage: '',
    },
  ]),
)

export const defaultAdminPageProducts = Object.fromEntries(
  pageDefinitions.map(({ id, products }) => [
    id,
    products.map((product, index) => ({
      ...product,
      id: `${id}-seed-${index}`,
    })),
  ]),
)
