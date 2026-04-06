import { Product } from '../types/Product';

export const allProducts: Product[] = [
  {
    id: '1',
    name: 'Y2K Washed Denim Overshirt',
    price: 1499,
    image: 'https://images.pexels.com/photos/1464624/pexels-photo-1464624.jpeg?auto=compress&cs=tinysrgb&w=900&h=900&fit=crop',
    category: 'clothing',
    description: 'Boxy thrift-fit denim overshirt with faded wash and relaxed street silhouette.',
    isVintage: true
  },
  {
    id: '2',
    name: 'Indie Crochet Shoulder Bag',
    price: 999,
    image: 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=900&h=900&fit=crop',
    category: 'bags',
    description: 'Handmade crochet mini bag in pastel tones, perfect for everyday indie thrift looks.',
    isVintage: true
  },
  {
    id: '3',
    name: 'Retro Silver Hoop Set',
    price: 699,
    image: 'https://images.pexels.com/photos/1721558/pexels-photo-1721558.jpeg?auto=compress&cs=tinysrgb&w=900&h=900&fit=crop',
    category: 'accessories',
    description: 'Chunky hoop and stud combo inspired by 90s Bollywood styling.',
    isVintage: true
  },
  {
    id: '4',
    name: 'Campus Club Graphic Tee',
    price: 799,
    image: 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=900&h=900&fit=crop',
    category: 'men',
    description: 'Oversized cotton graphic tee with washed print and dropped shoulders.',
    isVintage: true
  },
  {
    id: '5',
    name: 'Pleated Satin Slip Dress',
    price: 1699,
    image: 'https://images.pexels.com/photos/985635/pexels-photo-985635.jpeg?auto=compress&cs=tinysrgb&w=900&h=900&fit=crop',
    category: 'women',
    description: 'Soft satin thrift dress with pleated fall and minimalist evening vibe.',
    isVintage: true
  },
  {
    id: '6',
    name: 'Ajrakh Patchwork Kurta',
    price: 1399,
    image: 'https://images.pexels.com/photos/3771839/pexels-photo-3771839.jpeg?auto=compress&cs=tinysrgb&w=900&h=900&fit=crop',
    category: 'ethnic',
    description: 'Block-print patchwork kurta with handcrafted thrift finish and relaxed fit.',
    isVintage: true
  },
  {
    id: '7',
    name: 'Vintage Racing Windbreaker',
    price: 1899,
    image: 'https://images.pexels.com/photos/6311392/pexels-photo-6311392.jpeg?auto=compress&cs=tinysrgb&w=900&h=900&fit=crop',
    category: 'men',
    description: 'Colorblock nylon windbreaker with retro motorsport-inspired stripes.',
    isVintage: true
  },
  {
    id: '8',
    name: 'Thrift Chunky Dad Sneakers',
    price: 2199,
    image: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=900&h=900&fit=crop',
    category: 'shoes',
    description: 'Chunky sole sneakers with throwback 2000s streetwear profile.',
    isVintage: true
  },
  {
    id: '9',
    name: 'Coquette Pearl Hair Clips',
    price: 499,
    image: 'https://images.pexels.com/photos/2697786/pexels-photo-2697786.jpeg?auto=compress&cs=tinysrgb&w=900&h=900&fit=crop',
    category: 'accessories',
    description: 'Pair of pearl and bow clips for soft-girl and coquette styling.',
    isVintage: true
  },
  {
    id: '10',
    name: 'Handloom Saree (Pastel Weave)',
    price: 2499,
    image: 'https://images.pexels.com/photos/1294886/pexels-photo-1294886.jpeg?auto=compress&cs=tinysrgb&w=900&h=900&fit=crop',
    category: 'ethnic',
    description: 'Elegant pre-loved handloom saree with lightweight drape and subtle zari border.',
    isVintage: true
  },
  {
    id: '11',
    name: 'Structured Tote in Tan Leather',
    price: 1899,
    image: 'https://images.pexels.com/photos/2081199/pexels-photo-2081199.jpeg?auto=compress&cs=tinysrgb&w=900&h=900&fit=crop',
    category: 'bags',
    description: 'Roomy thrift tote with office-friendly shape and durable handles.',
    isVintage: true
  },
  {
    id: '12',
    name: 'Mary Jane Platform Heels',
    price: 1799,
    image: 'https://images.pexels.com/photos/267320/pexels-photo-267320.jpeg?auto=compress&cs=tinysrgb&w=900&h=900&fit=crop',
    category: 'shoes',
    description: 'Pre-loved platform heels with polished buckle strap and retro finish.',
    isVintage: true
  },
  {
    id: '13',
    name: 'Kalamkari Crop Jacket',
    price: 1599,
    image: 'https://images.pexels.com/photos/6311393/pexels-photo-6311393.jpeg?auto=compress&cs=tinysrgb&w=900&h=900&fit=crop',
    category: 'women',
    description: 'Printed cropped jacket with handcrafted motifs and statement layering vibe.',
    isVintage: true
  },
  {
    id: '14',
    name: 'Upcycled Utility Cargo Pants',
    price: 1699,
    image: 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=900&h=900&fit=crop',
    category: 'clothing',
    description: 'Relaxed cargo pants with thrifted utility pockets and street-ready fit.',
    isVintage: true
  }
];

export const featuredProducts = allProducts.slice(0, 8);