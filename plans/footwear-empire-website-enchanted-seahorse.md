# Footwear Empire — Full Website Plan

## Context

Build a complete 12-page e-commerce website for "Footwear Empire," a modern shoe retailer. The site needs full navigation, realistic product data, a working cart with state, and polished UI across every page. Because this is a React-only sandbox (no backend), all data is in-memory and cart state lives in React context.

---

## Aesthetic Stance

**Direction:** Premium dark editorial — confident, architectural, slightly austere like a high-end shoe brand (think COS meets ZARA Black Label). Not SaaS, not Memphis, not warm off-white editorial.

- **Ground:** Deep warm near-black `#0D0C0A`
- **Foreground:** Warm cream `#F5F0E8`
- **Primary:** Cognac/leather amber `#C97B3F` (CTA buttons, active states)
- **Accent:** Pale gold `#E8C08A` (highlights, hover glows)
- **Card surfaces:** `#171613` (slightly lifted from background)
- **Border:** `rgba(245,240,232,0.10)` (hairline cream)
- **Fonts:** `Fraunces` (variable optical-size serif for display headings) + `Figtree` (clean geometric humanist sans for body/UI)
- **Radius:** `0.25rem` — intentionally tight/architectural

---

## File Modifications

### 1. `src/styles/fonts.css`
Add Google Fonts import for Fraunces (display) and Figtree (body).

### 2. `src/styles/theme.css`
Update `:root` color tokens to match the dark editorial palette above. Preserve all token names and the `@theme inline` block.

### 3. `src/app/App.tsx`
Full replacement. Single file containing all pages, components, data, and routing via React state (`useState` for current page/route).

**No react-router dependency** — use a lightweight in-app router (`type Page = "home" | "shop" | ...`) driven by `useState` to avoid install complications.

---

## Application Architecture

### Data layer (top of App.tsx)
- `PRODUCTS[]` — ~24 products across categories (men's sneakers, women's heels, boots, sandals, kids, accessories), each with id, name, price, category, images (Unsplash URLs), sizes, colors, stock, rating, reviewCount
- `COLLECTIONS[]` — 8 curated collections (New Arrivals, Trending, Best Sellers, Premium, Budget, Office Wear, Casual, Sports)
- `REVIEWS[]` — customer review fixtures

### State
- `currentPage` + `pageParams` — router state (replaces react-router)
- `cart: CartItem[]` — global cart state (prop-drilled or via context pattern using useState at App root)
- `wishlist: string[]` — product IDs
- `user: User | null` — mock logged-in state

### Shared Components (defined within App.tsx)
- `<Navbar />` — sticky top nav with logo, mega-menu (Shop dropdown with columns: Men/Women/Kids/Accessories), cart icon with badge, account icon
- `<Footer />` — four-column footer with quick links, social icons, newsletter mini-form
- `<ProductCard />` — reusable card with image, name, price, rating stars, quick-add
- `<SectionHeading />` — consistent heading style
- `<Badge />` — small label chip

---

## Pages

### 1. Home
Sections in order:
- **Hero** — full-viewport split composition: left side large heading "Step Into Style & Comfort" + CTA buttons; right side tall editorial shoe image. Subtle ambient glow on primary.
- **Featured Categories** — horizontal scrolling strip of 6 category tiles with icon or image thumbnails
- **New Arrivals** — 4-column product grid (2-col on mobile) using `<ProductCard />`
- **Best Sellers** — same grid, different products, amber "BESTSELLER" badge
- **Men's Collection** — editorial two-up: large lifestyle image left + 3 product stack right
- **Women's Collection** — reversed layout
- **Why Choose Us** — 4-card icon grid (Free Delivery, Easy Returns, Genuine Products, Secure Payment)
- **Customer Reviews** — 3-column testimonial cards with star ratings and avatar initials
- **Instagram Gallery** — 6-image mosaic (Unsplash, themed)
- **Newsletter** — centered dark-on-darker panel with email input

### 2. Shop
- Category sidebar: Men / Women / Kids / Accessories with subcategory accordion
- Active filter chips display
- Product grid (responsive 3→2→1 col) with sort dropdown (Price, Rating, Newest)
- Filter by price range and size (checkbox lists)
- URL-like param: `pageParams.category` filters the grid

### 3. Product Detail
- Left: image gallery (main + 4 thumbnails, click to swap)
- Right: name, price, rating, color swatches, size selector grid, quantity stepper, Add to Cart + Buy Now
- Tabbed section below: Description | Features | Delivery Info
- Related Products horizontal scroll strip
- Reviews section with star breakdown

### 4. About Us
- Hero image with brand name overlay
- "Our Story" long-form copy with pull quote
- Mission / Vision two-column cards
- Team stat bar (Year Founded, Countries Served, Pairs Sold, Happy Customers)
- Why Choose Footwear Empire feature grid

### 5. Collections
- Masonry-inspired grid of 8 collection tiles, each with background image and collection name
- Click navigates to Shop with that collection pre-filtered

### 6. Size Guide
- Toggle: Men / Women / Kids
- UK/US/EU conversion table with highlighted current row on hover
- Illustrated foot measurement guide with callout annotations

### 7. Delivery & Returns
- Two-column layout: Delivery (areas, fees, timelines) | Returns (policy, window, process)
- Icon-led list items
- FAQ accordion at bottom for edge cases

### 8. FAQ
- Tabbed by topic: Ordering | Payments | Delivery | Returns | Nationwide Shipping
- `<Accordion>` (Radix UI) for Q&A pairs within each tab

### 9. Contact
- Split layout: form left, info right
- Form: Name, Email, Phone, Subject (select), Message, Send button
- Right panel: Phone, WhatsApp link, Email, embedded static map placeholder (styled div with pin icon)
- Social links row

### 10. Customer Account
- Tabs: Profile | Orders | Wishlist | Addresses
- Login/Register toggle if `user === null`
- Orders: mock order history table
- Wishlist: grid of saved `<ProductCard />`

### 11. Cart
- Line items with image, name, size, color, quantity stepper, remove
- Coupon code input with mock "EMPIRE10" discount
- Order summary: subtotal, discount, delivery fee, total
- Checkout button navigates to Checkout page

### 12. Checkout
- Two-column: form left (shipping address, delivery method radio, payment method radio) | order summary right
- Shipping address: Name, Address, City, State, Zip, Phone
- Payment: Mock card fields
- Place Order button — shows success toast (sonner)

---

## Unsplash Image Strategy

Use `https://images.unsplash.com/photo-{id}?w={w}&h={h}&fit=crop&auto=format` for:
- Hero: editorial boots/sneakers on dark background
- Category tiles: contextual (men's dress shoes, women's heels, kids sneakers, accessories)
- Product cards: clean product-on-white or lifestyle shots
- Instagram grid: lifestyle/fashion

Use 6–8 distinct photo IDs, reused across products with slight param variation.

---

## Token Updates (theme.css)

```css
:root {
  --background: #0D0C0A;
  --foreground: #F5F0E8;
  --card: #171613;
  --card-foreground: #F5F0E8;
  --primary: #C97B3F;
  --primary-foreground: #0D0C0A;
  --secondary: #1E1C18;
  --secondary-foreground: #F5F0E8;
  --muted: #2A2720;
  --muted-foreground: #9C9484;
  --accent: #E8C08A;
  --accent-foreground: #0D0C0A;
  --border: rgba(245,240,232,0.10);
  --radius: 0.25rem;
}
```

---

## Verification

1. All 12 pages render without errors (navigate via nav links)
2. Add product to cart — badge increments, cart page shows item
3. Coupon code "EMPIRE10" applies 10% discount on cart
4. FAQ accordion opens/closes
5. Size Guide table toggles between Men/Women/Kids
6. Product page image gallery thumbnail click swaps main image
7. Shop page category filter narrows product grid
8. Checkout Place Order shows sonner toast
9. Responsive layout holds at ~768px (nav collapses, grid goes to 1-2 cols)
