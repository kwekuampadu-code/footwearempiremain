import { useNavigate, useLocation, useParams } from "react-router-dom";

// Keep this in sync with the `Page` union in App.tsx.
export type Page =
  | "home" | "shop" | "product" | "about" | "collections"
  | "size-guide" | "delivery" | "faq" | "contact" | "account"
  | "cart" | "checkout" | "admin" | "news";

const KNOWN_PAGES: Page[] = [
  "shop", "product", "about", "collections", "size-guide", "delivery",
  "faq", "contact", "account", "cart", "checkout", "admin", "news",
];

const BASE_PATH: Record<Page, string> = {
  home: "/", shop: "/shop", product: "/product", about: "/about",
  collections: "/collections", "size-guide": "/size-guide", delivery: "/delivery",
  faq: "/faq", contact: "/contact", account: "/account", cart: "/cart",
  checkout: "/checkout", admin: "/admin", news: "/news",
};

function pageFromPathname(pathname: string): Page {
  if (pathname === "/") return "home";
  const seg = pathname.replace(/^\//, "").split("/")[0];
  return (KNOWN_PAGES as string[]).includes(seg) ? (seg as Page) : "home";
}

/**
 * Drop-in replacement for the old `useState<Page>` + custom `navigate()`.
 * Reads the current page/params from the real URL, and pushes real URLs
 * when `navigate(page, params)` is called — so the rest of App.tsx (all the
 * `{page === "..." && <Component/>}` branches and `navigate("shop", {...})`
 * call sites) needs no changes.
 */
export function useAppNav() {
  const rrNavigate = useNavigate();
  const location = useLocation();
  const routeParams = useParams(); // e.g. { id: "m1" } on /product/:id

  const page = pageFromPathname(location.pathname);

  const searchParams = new URLSearchParams(location.search);
  const pageParams: Record<string, string> = { ...(routeParams as Record<string, string>) };
  searchParams.forEach((value, key) => { pageParams[key] = value; });

  function navigate(p: Page, params: Record<string, string> = {}) {
    let path = BASE_PATH[p];

    if (p === "product" && params.id) {
      path = `/product/${encodeURIComponent(params.id)}`;
    }

    if (p === "news" && params.id) {
      path = `/news/${encodeURIComponent(params.id)}`;
    }

    const query = new URLSearchParams();
    if (p === "shop") {
      if (params.category) query.set("category", params.category);
      if (params.sub) query.set("sub", params.sub);
      if (params.collection) query.set("collection", params.collection);
    }

    const qs = query.toString();
    rrNavigate(qs ? `${path}?${qs}` : path);
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 0);
  }

  return { page, pageParams, navigate };
}