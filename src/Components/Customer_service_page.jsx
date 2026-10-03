import './customer_service.css'
import { appPath } from '../utils/paths'

const helpTopics = [
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

const commonQuestions = [
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

export const CustomerServicePage = ({ content }) => {
  const page = content ?? {
    title: 'How can we help?',
    eyebrow: 'HERE WHEN YOU NEED US',
    description: 'Find answers and support for your Orvixa shopping experience.',
    ctaLabel: 'Explore help topics',
  }
  const topics = page.helpTopics ?? helpTopics
  const questions = page.commonQuestions ?? commonQuestions

  return (
    <main className="customer-service-page">
      <nav className="new-arrivals-breadcrumb" aria-label="Breadcrumb">
        <a href={appPath('/')}>Home</a>
        <span aria-hidden="true">/</span>
        <span aria-current="page">Customer Service</span>
      </nav>

      <header
        className={`customer-service-banner${page.bannerImage ? ' has-custom-banner-image' : ''}`}
        style={page.bannerImage ? {
          backgroundImage: `linear-gradient(90deg, rgb(7 26 61 / 88%), rgb(7 26 61 / 48%)), url("${page.bannerImage}")`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        } : undefined}
      >
        <p>{page.eyebrow}</p>
        <h1>{page.title}</h1>
        <span>{page.description}</span>
        <a href="#customer-service-topics">{page.ctaLabel ?? 'Explore help topics'} <span aria-hidden="true">↓</span></a>
      </header>

      <section id="customer-service-topics" className="customer-service-topics">
        <div className="customer-service-section-heading">
          <p>SUPPORT, MADE SIMPLE</p>
          <h2>What do you need help with?</h2>
        </div>
        <div className="customer-service-topic-grid">
          {topics.map((topic) => (
            <a className="customer-service-topic" href={appPath(topic.href)} key={topic.title}>
              <span className="customer-service-topic-icon" aria-hidden="true">{topic.icon}</span>
              <span>
                <strong>{topic.title}</strong>
                <small>{topic.description}</small>
              </span>
              <span className="customer-service-topic-arrow" aria-hidden="true">→</span>
            </a>
          ))}
        </div>
      </section>

      <section id="customer-service-faq" className="customer-service-faq">
        <div className="customer-service-section-heading">
          <p>QUICK ANSWERS</p>
          <h2>Frequently asked questions</h2>
        </div>
        <div className="customer-service-questions">
          {questions.map((item) => (
            <details key={item.question}>
              <summary>{item.question}<span aria-hidden="true">+</span></summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <aside className="customer-service-contact">
        <span className="customer-service-contact-icon" aria-hidden="true">✦</span>
        <div>
          <h2>Still need a hand?</h2>
          <p>Visit your order details for order-specific help and support options.</p>
        </div>
        <a href={appPath('/pages/faq')}>Browse frequently asked questions <span aria-hidden="true">→</span></a>
      </aside>
    </main>
  )
}
