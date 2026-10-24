import { supabase } from "./supabaseClient";
import { Order, OrderRow, OrderItem, OrderItemRow, orderFromRow } from "./types";

export interface OrderFilters {
  userId?: string;
  status?: Order["status"];
  search?: string;        // matches order_number, email, or last_name
  dateFrom?: string;       // ISO date
  dateTo?: string;         // ISO date
  sortBy?: "newest" | "oldest" | "total-desc" | "total-asc";
  page?: number;
  pageSize?: number;
}

export async function getOrders(filters: OrderFilters = {}): Promise<{ orders: Order[]; total: number }> {
  const { userId, status, search, dateFrom, dateTo, sortBy = "newest", page, pageSize } = filters;

  let query = supabase.from("orders").select("*", { count: "exact" });

  if (userId) query = query.eq("user_id", userId);
  if (status) query = query.eq("status", status);
  if (search) query = query.or(`order_number.ilike.%${search}%,email.ilike.%${search}%,last_name.ilike.%${search}%`);
  if (dateFrom) query = query.gte("created_at", dateFrom);
  if (dateTo) query = query.lte("created_at", dateTo);

  switch (sortBy) {
    case "oldest": query = query.order("created_at", { ascending: true }); break;
    case "total-desc": query = query.order("total", { ascending: false }); break;
    case "total-asc": query = query.order("total", { ascending: true }); break;
    default: query = query.order("created_at", { ascending: false });
  }

  if (page !== undefined && pageSize !== undefined) {
    const from = (page - 1) * pageSize;
    query = query.range(from, from + pageSize - 1);
  }

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    orders: (data as OrderRow[]).map(row => orderFromRow(row)),
    total: count ?? data.length,
  };
}

export async function getOrderWithItems(id: string): Promise<Order | null> {
  const { data: order, error } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!order) return null;

  const { data: items, error: itemsError } = await supabase
    .from("order_items").select("*").eq("order_id", id);
  if (itemsError) throw itemsError;

  return orderFromRow(order as OrderRow, (items ?? []) as OrderItemRow[]);
}

export async function updateOrderStatus(id: string, status: Order["status"]): Promise<void> {
  const { error } = await supabase.from("orders").update({ status }).eq("id", id);
  if (error) throw error;
}

// Creates an order + its line items, and decrements stock for each product.
// Wraps the writes in sequence; for stronger guarantees move this into a
// Postgres RPC (`create_order_with_items`) that runs in a single transaction.
export async function createOrder(
  orderData: Omit<Order, "id" | "orderNumber" | "status" | "createdAt" | "items">,
  items: Omit<OrderItem, "id">[],
  userId?: string
): Promise<Order> {
  const { data: orderRow, error } = await supabase
    .from("orders")
    .insert({
      first_name: orderData.firstName,
      last_name: orderData.lastName,
      email: orderData.email,
      phone: orderData.phone,
      address: orderData.address,
      city: orderData.city,
      state: orderData.state,
      town: orderData.town ?? null,
      delivery_method: orderData.deliveryMethod,
      payment_method: orderData.paymentMethod,
      subtotal: orderData.subtotal,
      delivery_fee: orderData.deliveryFee,
      total: orderData.total,
      user_id: userId,
      paystack_reference: orderData.paystackReference ?? null, // 👈 ADD THIS
    })
    .select()
    .single();
  if (error) throw error;

  const itemRows = items.map(i => ({
    order_id: orderRow.id,
    product_id: i.productId,
    product_name: i.productName,
    size: i.size,
    color: i.color,
    qty: i.qty,
    unit_price: i.unitPrice,
  }));

  const { error: itemsError } = await supabase.from("order_items").insert(itemRows);
  if (itemsError) throw itemsError;

  // best-effort stock decrement; failures here shouldn't block order confirmation
  for (const i of items) {
    if (!i.productId) continue;
    await supabase.rpc("decrement_stock", { p_product_id: i.productId, p_qty: i.qty }).then(
      () => {},
      () => {} // ignore — see supabase/schema.sql note below to add this RPC if desired
    );
  }

  return orderFromRow(orderRow as OrderRow, itemRows as unknown as OrderItemRow[]);
}
