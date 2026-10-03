import './footer.css'
import logo from '../../assets/Images/logo.png'

const footerGroups = [
  {
    title: 'Shop',
    links: [
      ['Popular products', '#popular-products-title'],
      ['Latest arrivals', '#latest-products-title'],
      ['Featured picks', '#featured-products-title'],
      ['Today’s deals', '#today-s-deals'],
    ],
  },
  {
    title: 'Help & support',
    links: [
      ['Customer service', '/category/customer-service'],
      ['Shipping information', '/pages/shipping-information'],
      ['Returns & refunds', '/pages/returns-refunds'],
      ['Frequently asked questions', '/pages/faq'],
    ],
  },
  {
    title: 'About Orvixa',
    links: [
      ['Our story', '/pages/our-story'],
      ['Contact us', '/pages/contact-us'],
      ['Privacy policy', '/pages/privacy-policy'],
      ['Terms & conditions', '/pages/terms-conditions'],
    ],
  },
]

const assuranceItems = [
  { icon: '✓', title: 'Quality finds', detail: 'Thoughtful picks for you' },
  { icon: '↗', title: 'Easy shopping', detail: 'A smooth experience, end to end' },
  { icon: '♡', title: 'Here to help', detail: 'Support when you need it' },
]

export const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-assurances" aria-label="Shopping with Orvixa">
        {assuranceItems.map((item) => (
          <div className="footer-assurance" key={item.title}>
            <span className="footer-assurance-icon" aria-hidden="true">{item.icon}</span>
            <span>
              <strong>{item.title}</strong>
              <small>{item.detail}</small>
            </span>
          </div>
        ))}
      </div>

      <div className="footer-main">
        <div className="footer-brand">
          <a className="footer-logo-link" href="/" aria-label="Orvixa home">
            <img src={logo} alt="Orvixa" />
          </a>
          <p>Everything. One Place.</p>
          <span>Discover more of what you love.</span>
        </div>

        {footerGroups.map((group) => (
          <nav className="footer-link-group" aria-label={group.title} key={group.title}>
            <h2>{group.title}</h2>
            <ul>
              {group.links.map(([label, href]) => (
                <li key={label}>
                  <a href={href}>{label}</a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Orvixa. All rights reserved.</p>
        <p>Made for the things you love <span aria-hidden="true">♥</span></p>
      </div>
    </footer>
  )
}