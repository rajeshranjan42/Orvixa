import floralSaree from '../assets/Images/products/Popular/Floaral-Saree.jpg'
import floralSareeAlt from '../assets/Images/products/Popular/Floaral-Saree1.jpg'
import kurta from '../assets/Images/products/Popular/Floral-Kurta-Women.jpg'
import kurtaAlt from '../assets/Images/products/Popular/Floral-Kurta-Women1.jpg'
import casualTop from '../assets/Images/products/Popular/blend-top.jpg'
import casualTopAlt from '../assets/Images/products/Popular/blend-top1.jpg'
import jeans from "../assets/Images/products/Popular/Men's-Jeans.jpg"
import jeansAlt from "../assets/Images/products/Popular/Men's-Jeans1.jpg"
import polo from '../assets/Images/products/Popular/polotshirt.jpg'
import poloAlt from '../assets/Images/products/Popular/polotshirt1.jpg'
import homeImage from '../assets/Images/category-placeholders/home.svg'
import beautyImage from '../assets/Images/category-placeholders/beauty.svg'
import mobileImage from '../assets/Images/category-placeholders/mobile.svg'
import computerImage from '../assets/Images/category-placeholders/computer.svg'

const makeProduct = (image, hoverImage, brand, name, price, oldPrice, rating = '4.6') => ({
  image,
  hoverImage,
  brand,
  name,
  rating,
  reviews: '36',
  price,
  oldPrice,
  badge: 'Popular',
})

const home1 = makeProduct(homeImage, homeImage, 'Orvixa Home', 'Comfort Living Room Essentials', '₹1,499', '₹1,999')
const home2 = makeProduct(homeImage, homeImage, 'Orvixa Home', 'Modern Home Decor Collection', '₹899', '₹1,299')
const beauty1 = makeProduct(beautyImage, beautyImage, 'Orvixa Beauty', 'Everyday Skincare Essentials', '₹599', '₹799')
const beauty2 = makeProduct(beautyImage, beautyImage, 'Orvixa Beauty', 'Beauty & Self-care Set', '₹749', '₹999')
const mobile1 = makeProduct(mobileImage, mobileImage, 'Orvixa Mobile', 'Everyday Smartphone', '₹12,999', '₹15,999', '4.7')
const mobile2 = makeProduct(mobileImage, mobileImage, 'Orvixa Mobile', 'Smartphone with Bright Display', '₹16,499', '₹19,999', '4.6')
const computer1 = makeProduct(computerImage, computerImage, 'Orvixa Computing', 'Everyday Laptop', '₹39,999', '₹46,999', '4.7')
const computer2 = makeProduct(computerImage, computerImage, 'Orvixa Computing', 'Wireless Keyboard & Mouse Set', '₹1,499', '₹1,999')

export const additionalCategories = {
  'home-kitchen': {
    title: 'Home & Kitchen',
    eyebrow: 'MAKE YOUR SPACE YOURS',
    description: 'Thoughtful finds for the spaces and moments that feel like home.',
    countLabel: 'home finds to explore',
    badgeClass: 'home-kitchen-listing',
    products: [
      home1,
      home2,
      makeProduct(homeImage, homeImage, 'Orvixa Home', 'Cozy Decor for Every Room', '₹1,099', '₹1,499'),
      makeProduct(homeImage, homeImage, 'Orvixa Kitchen', 'Kitchen & Dining Essentials', '₹699', '₹999'),
    ],
  },
  fashion: {
    title: 'Fashion',
    eyebrow: 'FIND YOUR EVERYDAY STYLE',
    description: 'Wearable favourites for wherever the day takes you.',
    countLabel: 'styles to explore',
    badgeClass: 'fashion-listing',
    products: [
      makeProduct(floralSaree, floralSareeAlt, 'Florence', 'Floral Print Saree', '₹2,500', '₹2,580', '4.8'),
      makeProduct(kurta, kurtaAlt, 'Orvixa Style', 'Floral Kurta for Women', '₹1,299', '₹1,599', '4.5'),
      makeProduct(casualTop, casualTopAlt, 'Blend', 'Everyday Casual Top', '₹749', '₹999', '4.4'),
      makeProduct(jeans, jeansAlt, 'Orvixa Essentials', 'Classic Fit Men’s Jeans', '₹1,399', '₹1,799'),
      makeProduct(polo, poloAlt, 'Orvixa Essentials', 'Classic Polo T-Shirt', '₹699', '₹899'),
    ],
  },
  beauty: {
    title: 'Beauty',
    eyebrow: 'A MOMENT FOR YOU',
    description: 'Discover everyday beauty and self-care essentials.',
    countLabel: 'beauty finds to explore',
    badgeClass: 'beauty-listing',
    products: [
      beauty1,
      beauty2,
      makeProduct(beautyImage, beautyImage, 'Orvixa Beauty', 'Daily Glow Care Kit', '₹499', '₹699', '4.7'),
      makeProduct(beautyImage, beautyImage, 'Orvixa Beauty', 'At-home Self-care Set', '₹899', '₹1,199'),
    ],
  },
  'mobile-phones': {
    title: 'Mobile Phones',
    eyebrow: 'SMART PICKS, EVERY DAY',
    description: 'Find a phone that keeps up with everything you do.',
    countLabel: 'mobile picks to explore',
    badgeClass: 'mobile-listing',
    products: [
      mobile1,
      mobile2,
      makeProduct(mobileImage, mobileImage, 'Orvixa Mobile', 'All-day Battery Smartphone', '₹18,999', '₹22,999', '4.8'),
      makeProduct(mobileImage, mobileImage, 'Orvixa Mobile', 'Slim Design 5G Smartphone', '₹21,999', '₹25,999', '4.7'),
    ],
  },
  computers: {
    title: 'Computers',
    eyebrow: 'POWER YOUR NEXT BIG IDEA',
    description: 'Laptops and everyday accessories for work, study, and play.',
    countLabel: 'computing picks to explore',
    badgeClass: 'computer-listing',
    products: [
      computer1,
      computer2,
      makeProduct(computerImage, computerImage, 'Orvixa Computing', 'Compact Wireless Keyboard', '₹899', '₹1,299'),
      makeProduct(computerImage, computerImage, 'Orvixa Computing', 'Work & Study Laptop', '₹48,999', '₹55,999', '4.8'),
    ],
  },
}
