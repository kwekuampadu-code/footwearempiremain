import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Product } from "@/lib/types";
import { getProducts, ProductFilters } from "@/lib/productService";

interface ProductsContextValue {
  products: Product[];
  loading: boolean;
  error: string | null;
  refetch: (filters?: ProductFilters) => Promise<void>;
}

const ProductsContext = createContext<ProductsContextValue | undefined>(undefined);

// Loads the full active catalogue once on mount and keeps it in memory.
// Pages that need server-side filtering/pagination (e.g. a very large admin
// catalogue) should call productService.getProducts() directly instead.
export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async (filters: ProductFilters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const { products } = await getProducts({ pageSize: 1000, page: 1, ...filters });
      setProducts(products);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  return (
    <ProductsContext.Provider value={{ products, loading, error, refetch }}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error("useProducts must be used within a ProductsProvider");
  return ctx;
}
