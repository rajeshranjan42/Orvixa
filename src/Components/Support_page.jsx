import './support_page.css'
import { appPath } from '../utils/paths'

const supportPages = {
  'shipping-information': {
    title: 'Shipping information',
    eyebrow: 'DELIVERY, MADE CLEAR',
    intro: 'Helpful details for getting your Orvixa order to you.',
    notice: 'Delivery options, fees, and estimated dates can vary by item and destination. Check the information shown at checkout and in your order details for the latest details.',
    sections: [
      {
        title: 'Delivery estimates',
        paragraphs: [
          'Available delivery methods and estimated dates are shown during checkout when available. Estimates may depend on your delivery address, the items in your order, and carrier conditions.',
          'If an order contains multiple items, they may arrive separately. Refer to the order details for item-level updates.',
        ],
      },
      {
        title: 'Track an order',
        paragraphs: [
          'When tracking information is available, check your order details for the latest shipment status and carrier updates.',
          'If the tracking page has not updated, allow time for the carrier to scan the package. If the estimated delivery date has passed, visit Customer Service for next steps.',
        ],
        link: '/category/customer-service',
        linkLabel: 'Go to Customer Service',
      },
      {
        title: 'Delivery address and access',
        paragraphs: [
          'Review your address carefully before placing an order. After an order is submitted, address changes may not be possible; check the order details for any available options.',
          'For building access or delivery instructions, provide clear details at checkout if that option is available.',
        ],
      },
    ],
  },
  'returns-refunds': {
    title: 'Returns & refunds',
    eyebrow: 'HERE TO HELP',
    intro: 'Find the right next step if an item is not quite right.',
    notice: 'Return eligibility, timeframes, and refund methods may differ by item. Always check the return information shown on the product page and in your order details; those details and applicable law govern your purchase.',
    sections: [
      {
        title: 'Check return eligibility',
        paragraphs: [
          'Open your order details and select the item to see whether a return or exchange option is available and what instructions apply.',
          'Some items may have different return conditions. Follow the item-specific instructions and include any required accessories or packaging.',
        ],
      },
      {
        title: 'Start a return',
        paragraphs: [
          'If the item is eligible, use the return option in your order details and follow the provided steps. Keep any return confirmation or tracking details until the process is complete.',
          'If you cannot find a return option or need help, contact Customer Service with your order information.',
        ],
        link: '/category/customer-service',
        linkLabel: 'Get Customer Service help',
      },
      {
        title: 'Refund status',
        paragraphs: [
          'Refund timing depends on the item, return progress, and payment method. Check the order details for status updates and allow the processing time shown there.',
          'If the expected timeframe has passed, contact Customer Service and include your order reference.',
        ],
      },
    ],
  },
  faq: {
    title: 'Frequently asked questions',
    eyebrow: 'QUICK ANSWERS',
    intro: 'Common questions about shopping with Orvixa.',
    questions: [
      {
        question: 'How can I check my order status?',
        answer: 'Open your order details to see the latest status, estimated delivery information, and tracking updates when available.',
      },
      {
        question: 'Where can I find shipping details?',
        answer: 'Available delivery options and estimates are shown at checkout. After ordering, check the order details for shipment updates.',
      },
      {
        question: 'How do I request a return?',
        answer: 'Open your order details, select the item, and follow the return option and item-specific instructions shown there.',
      },
      {
        question: 'When will I receive my refund?',
        answer: 'Refund timing depends on the item and payment method. Check the order details for the current status and expected processing information.',
      },
      {
        question: 'Where can I get help with a product?',
        answer: 'Review the product page for details. For help with a purchase, open the order details or visit Customer Service.',
      },
      {
        question: 'What should I do if my order is late?',
        answer: 'Check the latest tracking and estimated delivery information in your order details. If the estimated date has passed, visit Customer Service.',
      },
    ],
    callout: {
      title: 'Still need help?',
      text: 'Visit Customer Service to find support for your shopping questions.',
      href: '/category/customer-service',
      label: 'Go to Customer Service',
    },
  },
}

export const SupportPage = ({ page }) => {
  const content = supportPages[page]

  if (!content) return null

  return (
    <main className="support-page">
      <nav className="new-arrivals-breadcrumb" aria-label="Breadcrumb">
        <a href={appPath('/')}>Home</a>
        <span aria-hidden="true">/</span>
        <a href={appPath('/category/customer-service')}>Customer Service</a>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{content.title}</span>
      </nav>

      <header className="support-banner">
        <p>{content.eyebrow}</p>
        <h1>{content.title}</h1>
        <span>{content.intro}</span>
      </header>

      {content.notice && (
        <aside className="support-notice" role="note">
          <strong>Please note</strong>
          <p>{content.notice}</p>
        </aside>
      )}

      {content.sections && (
        <div className="support-sections">
          {content.sections.map((section) => (
            <section className="support-section" key={section.title}>
              <h2>{section.title}</h2>
              {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              {section.link && <a href={appPath(section.link)}>{section.linkLabel} <span aria-hidden="true">→</span></a>}
            </section>
          ))}
        </div>
      )}

      {content.questions && (
        <section className="support-faq-list" aria-label="Frequently asked questions">
          {content.questions.map((item) => (
            <details key={item.question}>
              <summary>{item.question}<span aria-hidden="true">+</span></summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </section>
      )}

      {content.callout && (
        <aside className="support-callout">
          <div>
            <h2>{content.callout.title}</h2>
            <p>{content.callout.text}</p>
          </div>
          <a href={appPath(content.callout.href)}>{content.callout.label} <span aria-hidden="true">→</span></a>
        </aside>
      )}
    </main>
  )
}
