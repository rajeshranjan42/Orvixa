import { bestSellers } from './bestSellers'

export const todaysDeals = bestSellers.map((product, index) => ({
  ...product,
  discount: ['25%', '20%', '30%', '22%', '35%', '28%', '18%'][index],
  badge: 'Today’s deal',
}))
