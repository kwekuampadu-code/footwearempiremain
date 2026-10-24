// src/lib/notificationService.ts
import { supabase } from "./supabaseClient";
import { Order } from "./types";

interface NotificationPayload {
  order: Order;
}

// ─── 1. IN-APP NOTIFICATION (stored in Supabase) ───────────────────────────
export async function createInAppNotification({ order }: NotificationPayload): Promise<void> {
  try {
    await supabase.from("notifications").insert({
      type: "new_order",
      title: `New Order: ${order.orderNumber}`,
      message: `${order.firstName} ${order.lastName} placed an order worth ₵${order.total.toLocaleString()}`,
      order_id: order.id,
      read: false,
    });
  } catch (err) {
    console.error("Failed to create in-app notification:", err);
  }
}

// ─── 2. EMAIL NOTIFICATION (via Supabase Edge Function) ────────────────────
export async function sendEmailNotification({ order }: NotificationPayload): Promise<void> {
  try {
    await supabase.functions.invoke("send-order-email", {
      body: {
        ownerEmail: import.meta.env.VITE_OWNER_EMAIL,
        customerEmail: order.email,
        order,
      },
    });
  } catch (err) {
    console.error("Email notification failed:", err);
  }
}

// ─── SEND BOTH NOTIFICATIONS ───────────────────────────────────────────────
export async function notifyOwner(order: Order): Promise<void> {
  await Promise.allSettled([
    createInAppNotification({ order }),
    sendEmailNotification({ order }),
  ]);
}