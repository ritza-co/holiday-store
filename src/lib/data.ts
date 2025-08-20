export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  stock: number;
  featured?: boolean;
  tags: string[];
}

export interface CartItem extends Product {
  quantity: number;
}

export interface CouponCode {
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
  minOrder?: number;
  maxDiscount?: number;
  valid: boolean;
}

export const products: Product[] = [
  {
    id: '1',
    name: 'Cozy Winter Sweater',
    description: 'Perfect for chilly holiday evenings. Made with premium wool blend for ultimate comfort.',
    price: 89.99,
    originalPrice: 129.99,
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop&crop=center',
    category: 'clothing',
    stock: 25,
    featured: true,
    tags: ['winter', 'sweater', 'cozy', 'sale']
  },
  {
    id: '2',
    name: 'Holiday Ornament Set',
    description: 'Beautiful handcrafted ornaments to make your tree shine. Set of 12 assorted designs.',
    price: 34.99,
    image: 'https://images.unsplash.com/photo-1512389098783-66b81f86e199?w=400&h=400&fit=crop&crop=center',
    category: 'decorations',
    stock: 50,
    featured: true,
    tags: ['ornaments', 'christmas', 'decorations', 'handcrafted']
  },
  {
    id: '3',
    name: 'Festive Candle Collection',
    description: 'Set of 3 scented candles with pine, cinnamon, and vanilla fragrances.',
    price: 24.99,
    image: 'https://images.unsplash.com/photo-1602487429187-8ff8d7d7a250?w=400&h=400&fit=crop&crop=center',
    category: 'home',
    stock: 30,
    tags: ['candles', 'scented', 'ambiance', 'gift']
  },
  {
    id: '4',
    name: 'Warm Winter Gloves',
    description: 'Touchscreen-compatible gloves to keep your hands warm while staying connected.',
    price: 19.99,
    originalPrice: 29.99,
    image: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5d?w=400&h=400&fit=crop&crop=center',
    category: 'accessories',
    stock: 40,
    tags: ['gloves', 'winter', 'touchscreen', 'warm']
  },
  {
    id: '5',
    name: 'Hot Chocolate Gift Set',
    description: 'Premium hot chocolate mix with marshmallows and peppermint stirrers.',
    price: 29.99,
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&crop=center',
    category: 'food',
    stock: 60,
    featured: true,
    tags: ['hot chocolate', 'gift', 'winter', 'warm drink']
  },
  {
    id: '6',
    name: 'Holiday Wreath',
    description: 'Fresh evergreen wreath with red berries and gold ribbon. 24-inch diameter.',
    price: 45.99,
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop&crop=center',
    category: 'decorations',
    stock: 20,
    tags: ['wreath', 'evergreen', 'door', 'traditional']
  },
  {
    id: '7',
    name: 'Cozy Throw Blanket',
    description: 'Ultra-soft fleece throw blanket perfect for snuggling by the fireplace.',
    price: 39.99,
    originalPrice: 59.99,
    image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&h=400&fit=crop&crop=center',
    category: 'home',
    stock: 35,
    tags: ['blanket', 'cozy', 'fleece', 'comfort']
  },
  {
    id: '8',
    name: 'Winter Boot Collection',
    description: 'Waterproof winter boots with premium insulation. Available in multiple sizes.',
    price: 119.99,
    image: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5d?w=400&h=400&fit=crop&crop=center',
    category: 'footwear',
    stock: 15,
    tags: ['boots', 'winter', 'waterproof', 'insulated']
  },
  {
    id: '9',
    name: 'Holiday Cookie Kit',
    description: 'Everything you need to bake perfect holiday cookies. Includes cookie cutters and decorating supplies.',
    price: 22.99,
    image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=400&fit=crop&crop=center',
    category: 'food',
    stock: 45,
    tags: ['baking', 'cookies', 'kit', 'family fun']
  },
  {
    id: '10',
    name: 'Festive String Lights',
    description: 'LED string lights with warm white glow. Perfect for indoor and outdoor decoration.',
    price: 16.99,
    image: 'https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=400&h=400&fit=crop&crop=center',
    category: 'decorations',
    stock: 100,
    tags: ['lights', 'LED', 'decoration', 'warm white']
  },
  {
    id: '11',
    name: 'Premium Coffee Blend',
    description: 'Special holiday blend with notes of cinnamon and nutmeg. Perfect for cold mornings.',
    price: 18.99,
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop&crop=center',
    category: 'food',
    stock: 55,
    tags: ['coffee', 'premium', 'blend', 'morning']
  },
  {
    id: '12',
    name: 'Holiday Puzzle Set',
    description: '1000-piece holiday-themed jigsaw puzzles. Perfect for family game nights.',
    price: 14.99,
    image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=400&fit=crop&crop=center',
    category: 'entertainment',
    stock: 75,
    tags: ['puzzle', 'family', 'game', 'holiday theme']
  }
];

export const coupons: CouponCode[] = [
  {
    code: 'HOLIDAY20',
    discount: 20,
    type: 'percentage',
    minOrder: 50,
    maxDiscount: 25,
    valid: true
  },
  {
    code: 'WINTER10',
    discount: 10,
    type: 'fixed',
    minOrder: 30,
    valid: true
  },
  {
    code: 'FESTIVE25',
    discount: 25,
    type: 'percentage',
    minOrder: 100,
    maxDiscount: 50,
    valid: true
  },
  {
    code: 'EXPIRED',
    discount: 50,
    type: 'percentage',
    valid: false
  }
];

export const getProductById = (id: string): Product | undefined => {
  return products.find(product => product.id === id);
};

export const getFeaturedProducts = (): Product[] => {
  return products.filter(product => product.featured);
};

export const getProductsByCategory = (category: string): Product[] => {
  return products.filter(product => product.category === category);
};

export const validateCouponCode = (code: string, orderTotal: number): CouponCode | null => {
  const coupon = coupons.find(c => c.code.toLowerCase() === code.toLowerCase());
  
  if (!coupon || !coupon.valid) {
    return null;
  }
  
  if (coupon.minOrder && orderTotal < coupon.minOrder) {
    return null;
  }
  
  return coupon;
};

export const calculateDiscount = (coupon: CouponCode, orderTotal: number): number => {
  if (coupon.type === 'fixed') {
    return Math.min(coupon.discount, orderTotal);
  } else {
    const discount = (orderTotal * coupon.discount) / 100;
    return coupon.maxDiscount ? Math.min(discount, coupon.maxDiscount) : discount;
  }
};

export const categories = [
  { id: 'all', name: 'All Products', count: products.length },
  { id: 'clothing', name: 'Clothing', count: products.filter(p => p.category === 'clothing').length },
  { id: 'decorations', name: 'Decorations', count: products.filter(p => p.category === 'decorations').length },
  { id: 'home', name: 'Home & Living', count: products.filter(p => p.category === 'home').length },
  { id: 'food', name: 'Food & Drinks', count: products.filter(p => p.category === 'food').length },
  { id: 'accessories', name: 'Accessories', count: products.filter(p => p.category === 'accessories').length },
  { id: 'footwear', name: 'Footwear', count: products.filter(p => p.category === 'footwear').length },
  { id: 'entertainment', name: 'Entertainment', count: products.filter(p => p.category === 'entertainment').length }
];