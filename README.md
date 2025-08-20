# Holiday Rush Demo - Next.js 14+ Ecommerce POC

A modern, responsive ecommerce application built with Next.js 14, TypeScript, and Tailwind CSS, featuring a festive holiday theme and comprehensive shopping functionality. Instrumented with Sentry for error monitoring and performance tracking.

## 🎯 Features

### Core Functionality
- ✅ **Product Catalog** - Browse holiday products with advanced filtering and search
- ✅ **Shopping Cart** - Add/remove items with real-time quantity management
- ✅ **Multi-step Checkout** - Shipping, payment, and order confirmation
- ✅ **Coupon System** - Apply discount codes with validation
- ✅ **Responsive Design** - Mobile-first design that works on all devices
- ✅ **Fast Performance** - Optimized images and fast loading times

### Holiday Theme
- 🎄 **Festive Colors** - Holiday red, green, gold color scheme
- 🎁 **Seasonal Products** - Winter wear, decorations, gifts, and treats
- ❄️ **Winter Imagery** - Holiday-themed product images and icons
- 🎅 **Seasonal UI Elements** - Holiday emojis and festive styling

### Technical Features
- ⚡ **Next.js 14** with App Router
- 📝 **TypeScript** for type safety
- 🎨 **Tailwind CSS** for styling
- 🐞 **Sentry Integration** for monitoring
- 📱 **Mobile Responsive** design
- 🔄 **Client-side State Management** with localStorage
- 🛒 **Real-time Cart Updates** with custom events

## 🏗️ Project Structure

```
holiday-rush-demo/
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── layout.tsx         # Root layout with header/footer
│   │   ├── page.tsx           # Homepage with featured products
│   │   ├── products/          # Product listing page
│   │   ├── cart/              # Shopping cart page
│   │   ├── checkout/          # Multi-step checkout
│   │   └── api/               # API routes
│   │       ├── products/      # Product API endpoints
│   │       ├── cart/          # Cart management API
│   │       └── checkout/      # Order processing API
│   ├── components/
│   │   ├── Header.tsx         # Navigation with cart counter
│   │   ├── ProductGrid.tsx    # Product listing with filters
│   │   ├── ShoppingCart.tsx   # Cart component with management
│   │   ├── CheckoutForm.tsx   # Multi-step checkout form
│   │   └── CouponCode.tsx     # Coupon validation component
│   └── lib/
│       └── data.ts            # Product data and utilities
├── public/
│   └── images/                # Product images
├── instrumentation.ts         # Sentry instrumentation
├── sentry.*.config.ts         # Sentry configuration files
├── next.config.js             # Next.js configuration
└── tailwind.config.js         # Tailwind CSS configuration
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   cd holiday-rush-demo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env.local with your Sentry configuration (optional)
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## 🛍️ User Journey

1. **Browse Products** - View featured products on homepage
2. **Product Discovery** - Use search, filters, and categories on products page
3. **Add to Cart** - Click "Add to Cart" on any product
4. **Manage Cart** - View cart, adjust quantities, remove items
5. **Apply Coupons** - Use codes like `HOLIDAY20`, `WINTER10`, `FESTIVE25`
6. **Checkout Process**:
   - Enter shipping information
   - Add payment details
   - Review order and submit
7. **Order Confirmation** - Receive order confirmation with tracking

## 🎁 Sample Coupon Codes

- **HOLIDAY20** - 20% off orders $50+ (max $25 discount)
- **WINTER10** - $10 off orders $30+
- **FESTIVE25** - 25% off orders $100+ (max $50 discount)

## 📦 Product Categories

- **Clothing** - Sweaters, gloves, winter wear
- **Decorations** - Ornaments, wreaths, lights
- **Home & Living** - Candles, blankets, cozy items  
- **Food & Drinks** - Hot chocolate, coffee, cookies
- **Accessories** - Winter accessories
- **Footwear** - Winter boots and shoes
- **Entertainment** - Puzzles, games, activities

## 🔧 Technical Implementation

### State Management
- **Cart State** - Managed via localStorage with custom CartManager class
- **Real-time Updates** - Custom events for cart synchronization across components
- **Persistent Storage** - Cart persists across browser sessions

### API Design
- **REST Endpoints** - Follows RESTful conventions
- **Error Handling** - Comprehensive error responses
- **Validation** - Input validation on all endpoints
- **Type Safety** - TypeScript interfaces for all API contracts

### Performance Optimizations
- **Image Optimization** - Next.js Image component with WebP/AVIF
- **Code Splitting** - Automatic code splitting with Next.js
- **CSS Optimization** - Tailwind CSS purging for minimal bundle
- **Static Generation** - Pages pre-rendered at build time where possible

## 🐞 Sentry Configuration

The application is pre-configured with Sentry for:
- **Error Monitoring** - Automatic error capture and reporting
- **Performance Monitoring** - Transaction and performance metrics
- **User Session Replay** - Debug user interactions (configurable)

To enable Sentry:
1. Set `NEXT_PUBLIC_SENTRY_DSN` in `.env`
2. Configure organization and project in `next.config.js`

## 🎨 Theming & Design

### Color Palette
- **Primary** - Holiday red (#DC2626)
- **Secondary** - Holiday green (#059669) 
- **Accent** - Holiday gold (#F59E0B)
- **Neutral** - Holiday snow (#F8FAFC)

### Typography
- **Font** - Inter (Google Fonts)
- **Scales** - Responsive typography with Tailwind

### Components
- **Buttons** - Consistent styling with hover states
- **Cards** - Product cards with hover effects
- **Forms** - Styled form inputs with validation states
- **Badges** - Status badges for sales, features, stock levels

## 🧪 Testing the Application

1. **Homepage** - View featured products and add to cart
2. **Products Page** - Test search, filtering, and sorting
3. **Cart Page** - Add/remove items, test quantity updates
4. **Checkout Flow** - Complete full checkout process
5. **Coupon System** - Apply various coupon codes
6. **Responsive Design** - Test on mobile, tablet, desktop

## 📈 Future Enhancements

This POC provides a solid foundation for adding:
- User authentication and accounts
- Product reviews and ratings
- Wishlist functionality  
- Inventory management
- Payment processing integration
- Order tracking
- Admin dashboard
- Email notifications
- Advanced analytics

## 🔒 Security Features

- **Input Validation** - All user inputs validated
- **XSS Protection** - Content Security Policy headers
- **Form Security** - CSRF protection considerations
- **Environment Variables** - Sensitive data in environment variables
- **HTTPS Ready** - Production deployment ready

## 📱 Browser Compatibility

- **Modern Browsers** - Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile Browsers** - iOS Safari, Chrome Mobile, Samsung Internet
- **Progressive Enhancement** - Graceful degradation for older browsers

---

## 🎄 Happy Holiday Shopping! 

This application demonstrates a complete ecommerce solution with modern web technologies and best practices. Perfect for showcasing Next.js 14 capabilities, TypeScript development, and Sentry monitoring integration.

For questions or contributions, please refer to the project documentation or create an issue.