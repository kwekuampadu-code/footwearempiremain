# Footwear Empire — Database + Admin Setup

This adds a real Supabase/Postgres backend for products & orders, plus a full
admin page (products CRUD + filters, orders view + filters). It's built to
drop into your existing Vite React project alongside your current `App.tsx`.

## Files added

```
supabase/schema.sql          → run in Supabase SQL editor (tables, RLS, RPC)
src/lib/supabaseClient.ts    → Supabase client init
src/lib/types.ts             → Product/Order types + DB row mappers
src/lib/productService.ts    → getProducts (with every filter), CRUD, adjustStock
src/lib/orderService.ts      → getOrders (with filters), createOrder, updateOrderStatus
src/context/ProductsContext.tsx → app-wide product list + loading state
src/pages/AdminPage.tsx      → the admin UI (Products tab + Orders tab)
src/data/seedProducts.ts     → one-time migration of your old hardcoded catalogue
```

## 1. Install & configure Supabase

```bash
npm install @supabase/supabase-js
```

Create a project at supabase.com, then add to `.env.local`:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxx
```

Run `supabase/schema.sql` in the Supabase SQL editor. It creates `products`,
`orders`, `order_items`, an `admins` allow-list table, and RLS policies
(public can read active products + create orders; only rows listed in
`admins` can write products or read/manage orders).

To make yourself an admin: sign up through Supabase Auth, then in the SQL
editor run:
```sql
insert into admins (user_id) values ('YOUR-AUTH-USER-UUID');
```
Gate the `/admin` route in your app behind Supabase Auth (`supabase.auth`)
so only signed-in admins can reach `AdminPage` — the RLS policies already
stop unauthorized writes at the database level either way.

## 2. Migrate your existing catalogue

Your current images are local file imports (`@/imports/sneaker1.jpeg`), which
can't live in a database column. Upload them to a public Supabase Storage
bucket (or any host), then fill in the real URLs in
`src/data/seedProducts.ts` and run it once:

```bash
npx tsx src/data/seedProducts.ts
```

## 3. Add real URL routing (react-router)

Your original `App.tsx` used `useState<Page>` + a custom `navigate()` that only
updated React state — there was never a real `/admin` URL. This adds actual
routes so `/admin`, `/shop`, `/product/m1`, etc. are real, bookmarkable URLs,
while keeping ~all of your existing JSX untouched.

```bash
npm install react-router-dom
```

New files for this:
```
src/router/useAppNav.ts      → drop-in replacement for the old page state + navigate()
src/lib/authService.ts       → Supabase Auth helpers + admin check
src/components/AdminGuard.tsx → login gate, only renders AdminPage for admins
```

**Patch `App.tsx`:**

1. Add the import:
```tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAppNav } from "@/router/useAppNav";
import AdminGuard from "@/components/AdminGuard";
```

2. Split the default export. Rename your current `export default function App()` to
   `function AppShell()`, delete its old page-state lines, and replace them with the hook:

```tsx
// BEFORE (delete these three lines):
// const [page, setPage] = useState<Page>("home");
// const [pageParams, setPageParams] = useState<Record<string, string>>({});
// function navigate(p: Page, params: Record<string, string> = {}) { ... }

// AFTER:
function AppShell() {
  const { page, pageParams, navigate } = useAppNav();
  const [cart, setCart] = useState<CartItem[]>([]);
  // ...everything else in the old App() body stays exactly the same,
  // including all the `{page === "..." && <Component .../>}` branches.
```

3. Wrap the `admin` branch in the guard:
```tsx
{page === "admin" && <AdminGuard><AdminPage /></AdminGuard>}
```

4. Add a new default export that provides the router and mounts routes.
   Because `AppShell` reads the current page from the URL via `useAppNav`,
   every route below can render the exact same `AppShell` — the internal
   `{page === "..."}` branches do the rest:

```tsx
export default function App() {
  return (
    <BrowserRouter>
      <ProductsProvider>
        <Routes>
          <Route path="/" element={<AppShell />} />
          <Route path="/shop" element={<AppShell />} />
          <Route path="/product/:id" element={<AppShell />} />
          <Route path="/about" element={<AppShell />} />
          <Route path="/collections" element={<AppShell />} />
          <Route path="/size-guide" element={<AppShell />} />
          <Route path="/delivery" element={<AppShell />} />
          <Route path="/faq" element={<AppShell />} />
          <Route path="/contact" element={<AppShell />} />
          <Route path="/account" element={<AppShell />} />
          <Route path="/cart" element={<AppShell />} />
          <Route path="/checkout" element={<AppShell />} />
          <Route path="/admin" element={<AppShell />} />
          <Route path="*" element={<AppShell />} />
        </Routes>
      </ProductsProvider>
    </BrowserRouter>
  );
}
```

If your project's entry file (`main.tsx`/`index.tsx`) already wraps `<App />`
in its own `<BrowserRouter>`, skip that here and just keep the `<Routes>` block.

**Enable email/password auth for the admin login**, and add yourself:
```sql
-- after signing up once through the login form (or Supabase Auth dashboard):
insert into admins (user_id) values ('YOUR-AUTH-USER-UUID');
```
Find your UUID under Supabase → Authentication → Users.

## 4. Wire the rest into `App.tsx`

**a) Remove the hardcoded catalogue.** Delete the entire `const PRODUCTS: Product[] = [...]` block
(it's now in the database). Keep the `Product` and `CartItem` interfaces — replace them with
`import { Product } from "@/lib/types";` instead of the local `interface Product {...}`.

**b) Wrap the app in the products provider.** In the default-exported `App` component:

```tsx
import { ProductsProvider, useProducts } from "@/context/ProductsContext";
import AdminPage from "@/pages/AdminPage";

// add "admin" to the Page union type:
type Page =
  | "home" | "shop" | "product" | "about" | "collections"
  | "size-guide" | "delivery" | "faq" | "contact" | "account"
  | "cart" | "checkout" | "admin";
```

Wrap the returned JSX:
```tsx
return (
  <ProductsProvider>
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* ...existing content... */}
      {page === "admin" && <AdminPage />}
    </div>
  </ProductsProvider>
);
```

**c) Replace `PRODUCTS` usages with the context hook.** In each component that
currently reads the module-level `PRODUCTS` constant, add:
```tsx
const { products, loading } = useProducts();
```
and swap `PRODUCTS` → `products` in these spots:
- `HomePage`: `newArrivals`/`bestSellers` derivation
- `ShopPage`: the `filtered = PRODUCTS.filter(...)` line
- `ProductDetailPage`: `PRODUCTS.find(...)` and the `related` derivation

Optionally render a loading skeleton while `loading` is true.

**d) Add an admin entry point.** With routing in place, `/admin` is already a
real, typeable URL protected by `AdminGuard` (step 3) — visiting it directly
shows the login form to anyone not in the `admins` table. You can optionally
still add a nav link for convenience:
```tsx
<button onClick={() => navigate("admin")}>Admin</button>
```

**e) Point checkout at the real backend.** In `CheckoutPage`'s submit handler,
replace the `toast.success(...); clearCart(); navigate("account");` stub with:
```tsx
import { createOrder } from "@/lib/orderService";

await createOrder(
  {
    firstName: form.firstName, lastName: form.lastName, email: form.email, phone: form.phone,
    address: form.address, city: form.city, state: form.state, zip: form.zip,
    deliveryMethod: form.delivery as "standard" | "express",
    paymentMethod: form.payment as "card" | "transfer" | "cod",
    subtotal, deliveryFee, total,
  },
  cart.map(i => ({
    productId: i.product.id, productName: i.product.name,
    size: i.size, color: i.color, qty: i.qty, unitPrice: i.product.price,
  }))
);
```

## What you get in the admin page

**Products tab:** search (name/brand/SKU), filter by category, subcategory,
collection, stock status (in stock / low stock ≤5 / out of stock), active vs
deactivated, sort (newest, price, stock, rating, name) — plus add/edit modal
covering every product field, and soft-delete (deactivate/restore) so order
history stays intact.

**Orders tab:** search (order #, email, name), filter by status and date
range, sort by date/total, inline status updates, expandable rows showing
line items and shipping details.

Everything goes through `productService`/`orderService`, so if you later want
server-driven pagination on the storefront instead of loading the whole
catalogue into `ProductsContext`, call `getProducts({...})` directly with the
filters you need.
