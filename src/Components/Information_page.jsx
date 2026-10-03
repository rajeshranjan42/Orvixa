import './information_page.css'
import { appPath } from '../utils/paths'

const pageContent = {
  'our-story': {
    eyebrow: 'A LITTLE ABOUT US',
    title: 'Our story',
    intro: 'Everything. One Place.',
    sections: [
      {
        title: 'Shopping should feel simple',
        paragraphs: [
          'Orvixa is built around a straightforward idea: finding the things you need and the things you love should feel easy.',
          'We bring a mix of everyday essentials, thoughtful discoveries, and fresh finds together in one place, so you can spend less time searching and more time enjoying what you choose.',
        ],
      },
      {
        title: 'Made for the things you love',
        paragraphs: [
          'From home and style to technology and more, Orvixa is designed to make exploring feel welcoming. We believe a good shopping experience is clear, dependable, and centered on helping you find the right fit.',
          'We’re continuing to shape Orvixa with that purpose in mind: a useful place to discover more of what matters to you.',
        ],
      },
    ],
    calloutTitle: 'Discover more of what you love.',
    calloutText: 'Explore the latest arrivals and customer favourites.',
    calloutHref: '/category/new-arrivals',
    calloutLabel: 'Explore new arrivals',
  },
  'contact-us': {
    eyebrow: 'WE’RE HERE TO HELP',
    title: 'Contact us',
    intro: 'How can we help you today?',
    sections: [
      {
        title: 'Help with an order',
        paragraphs: [
          'For delivery updates, returns, refunds, or help with a recent purchase, visit Customer Service. You’ll find quick answers and guidance for common order questions.',
        ],
        link: '/category/customer-service',
        linkLabel: 'Visit Customer Service',
      },
      {
        title: 'Product and shopping questions',
        paragraphs: [
          'Looking for help choosing an item? Start with the product information on its page. For other shopping questions, the Customer Service page is the best place to begin.',
        ],
        link: '/category/customer-service',
        linkLabel: 'Find support options',
      },
    ],
    calloutTitle: 'Need help with something else?',
    calloutText: 'Visit our help page for answers about orders, returns, payments, and products.',
    calloutHref: '/category/customer-service',
    calloutLabel: 'Go to Customer Service',
  },
  'privacy-policy': {
    eyebrow: 'YOUR INFORMATION',
    title: 'Privacy policy',
    intro: 'A starter overview of how privacy information should be presented on Orvixa.',
    notice: 'This is starter content, not a finalized legal policy. Before launch, replace it with a policy that accurately reflects the data Orvixa collects, its service providers, retention practices, and applicable laws.',
    sections: [
      {
        title: 'Information you provide',
        paragraphs: [
          'When you contact or use a shopping service, information such as your name, contact details, delivery information, and messages may be needed to respond to you or provide the requested service.',
          'Only collect information that is needed for a clearly explained purpose, and update this section to describe the exact information this website collects.',
        ],
      },
      {
        title: 'How information may be used',
        paragraphs: [
          'Information may be used to provide requested services, respond to questions, support orders, maintain website operations, and meet legal obligations, as applicable.',
          'Describe any additional uses, including analytics or marketing, and explain the choices available to visitors.',
        ],
      },
      {
        title: 'Cookies and similar technologies',
        paragraphs: [
          'Websites may use cookies or similar technologies for essential functionality, preferences, analytics, or advertising. Update this policy to list the technologies Orvixa actually uses and how visitors can manage them.',
        ],
      },
      {
        title: 'Sharing, security, and retention',
        paragraphs: [
          'Explain whether and when information is shared with service providers or other parties, what safeguards are used, and how long information is retained. These details depend on Orvixa’s actual systems and practices.',
        ],
      },
      {
        title: 'Your choices and how to contact us',
        paragraphs: [
          'Privacy rights and choices depend on where you live and the services in use. Add the applicable process for access, correction, deletion, or other requests, along with an official privacy contact before publishing this policy.',
        ],
        link: '/pages/contact-us',
        linkLabel: 'Contact us',
      },
    ],
    updated: 'Last updated: October 3, 2026',
  },
  'terms-conditions': {
    eyebrow: 'USING ORVIXA',
    title: 'Terms & conditions',
    intro: 'A starter overview of terms for using the Orvixa website.',
    notice: 'This is starter content, not a finalized agreement. Before launch, have the terms reviewed and customize them for Orvixa’s business, sales process, governing law, and customer support practices.',
    sections: [
      {
        title: 'Using this website',
        paragraphs: [
          'By using this website, you agree to use it lawfully and not to interfere with its operation or other visitors’ use of it. If you do not agree with the applicable terms, do not use the website.',
        ],
      },
      {
        title: 'Product information and availability',
        paragraphs: [
          'Product descriptions, images, prices, and availability should be reviewed before an order is placed. Add Orvixa’s policies for pricing errors, product changes, order acceptance, and cancellations here.',
        ],
      },
      {
        title: 'Orders, delivery, and returns',
        paragraphs: [
          'Any purchase, delivery, return, or refund is subject to the specific policies presented at checkout and for the relevant product. Add links to Orvixa’s complete and applicable purchase, shipping, cancellation, return, and refund terms before accepting orders.',
        ],
        link: '/category/customer-service',
        linkLabel: 'Visit Customer Service',
      },
      {
        title: 'Website content and availability',
        paragraphs: [
          'Unless stated otherwise, website text, design, and branding may not be copied or reused without permission. Website features may change; explain any warranties, limitations, or availability commitments only as permitted by applicable law.',
        ],
      },
      {
        title: 'Applicable terms and questions',
        paragraphs: [
          'Specify the business operating Orvixa, its official contact details, governing law, dispute process, and any other required terms before publishing. Mandatory consumer rights remain unaffected where applicable law says they cannot be waived.',
        ],
        link: '/pages/contact-us',
        linkLabel: 'Contact us',
      },
    ],
    updated: 'Last updated: October 3, 2026',
  },
}

export const InformationPage = ({ page }) => {
  const content = pageContent[page]

  if (!content) return null

  return (
    <main className="information-page">
      <nav className="new-arrivals-breadcrumb" aria-label="Breadcrumb">
        <a href={appPath('/')}>Home</a>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{content.title}</span>
      </nav>

      <header className="information-banner">
        <p>{content.eyebrow}</p>
        <h1>{content.title}</h1>
        <span>{content.intro}</span>
      </header>

      {content.notice && (
        <aside className="information-notice" role="note">
          <strong>Before you publish</strong>
          <p>{content.notice}</p>
        </aside>
      )}

      <div className="information-content">
        {content.sections.map((section) => (
          <section className="information-section" key={section.title}>
            <h2>{section.title}</h2>
            {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            {section.link && <a href={section.link}>{section.linkLabel} <span aria-hidden="true">→</span></a>}
          </section>
        ))}
      </div>

      {content.calloutTitle && (
        <aside className="information-callout">
          <div>
            <h2>{content.calloutTitle}</h2>
            <p>{content.calloutText}</p>
          </div>
          <a href={content.calloutHref}>{content.calloutLabel} <span aria-hidden="true">→</span></a>
        </aside>
      )}

      {content.updated && <p className="information-updated">{content.updated}</p>}
    </main>
  )
}
