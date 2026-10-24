// supabase/functions/send-order-email/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  try {
    const { ownerEmail, customerEmail, order } = await req.json();
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY not set" }), { status: 500 });
    }

    // ─── EMAIL 1: OWNER NOTIFICATION ──────────────────────────────────────
    const ownerHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #7A5C14;">🛍️ New Order Received!</h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
          <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Order #</td><td style="padding: 8px; border: 1px solid #ddd;">${order.orderNumber}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Customer</td><td style="padding: 8px; border: 1px solid #ddd;">${order.firstName} ${order.lastName}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Email</td><td style="padding: 8px; border: 1px solid #ddd;">${order.email}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Phone</td><td style="padding: 8px; border: 1px solid #ddd;">${order.phone}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Address</td><td style="padding: 8px; border: 1px solid #ddd;">${order.address}, ${order.city}, ${order.state}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Delivery</td><td style="padding: 8px; border: 1px solid #ddd;">${order.deliveryMethod}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Total</td><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; color: #7A5C14;">₵${order.total.toLocaleString()}</td></tr>
        </table>
        <h3 style="margin-top: 20px;">Items:</h3>
        <ul>
          ${order.items?.map((item: any) =>
            `<li>${item.productName} — ${item.color}, Size ${item.size} × ${item.qty} = ₵${(item.unitPrice * item.qty).toLocaleString()}</li>`
          ).join("")}
        </ul>
      </div>
    `;

    // ─── EMAIL 2: CUSTOMER CONFIRMATION ───────────────────────────────────
    const deliveryEstimate = order.deliveryMethod === "express" ? "1–2 business days" : "3–5 business days";

    const customerHtml = `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background-color: #FFFCF5;">
        
        <!-- Header -->
        <div style="background-color: #1A1208; padding: 30px 20px; text-align: center;">
          <h1 style="color: #F0D090; margin: 0; font-size: 28px; letter-spacing: 3px; text-transform: uppercase;">Footwear Empire</h1>
          <p style="color: #C49A3C; margin: 5px 0 0; font-size: 12px; letter-spacing: 2px;">WHERE YOUR FEET RULE LIKE ROYALTY</p>
        </div>

        <!-- Success Badge -->
        <div style="text-align: center; padding: 30px 20px 10px;">
          <div style="width: 60px; height: 60px; background-color: #4CAF50; border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center;">
            <span style="color: white; font-size: 30px;">✓</span>
          </div>
          <h2 style="color: #1A1208; margin: 0; font-size: 24px;">Order Confirmed!</h2>
          <p style="color: #666; margin: 8px 0 0;">Thank you for your purchase, ${order.firstName}.</p>
        </div>

        <!-- Order Details -->
        <div style="padding: 20px;">
          <div style="background-color: #ffffff; border-radius: 12px; padding: 20px; border: 1px solid #eee;">
            <p style="margin: 0 0 12px; color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Order Number</p>
            <p style="margin: 0 0 20px; color: #1A1208; font-size: 20px; font-weight: bold;">${order.orderNumber}</p>

            <p style="margin: 0 0 12px; color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Your Items</p>
            ${order.items?.map((item: any) => `
              <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f5f5f5;">
                <div>
                  <p style="margin: 0; color: #1A1208; font-weight: bold;">${item.productName}</p>
                  <p style="margin: 4px 0 0; color: #888; font-size: 13px;">${item.color} · Size ${item.size} · Qty: ${item.qty}</p>
                </div>
                <p style="margin: 0; color: #1A1208; font-weight: bold;">₵${(item.unitPrice * item.qty).toLocaleString()}</p>
              </div>
            `).join("")}

            <div style="display: flex; justify-content: space-between; padding-top: 15px; margin-top: 10px;">
              <p style="margin: 0; font-weight: bold; font-size: 16px;">Total Paid</p>
              <p style="margin: 0; font-weight: bold; font-size: 18px; color: #7A5C14;">₵${order.total.toLocaleString()}</p>
            </div>
          </div>

          <!-- Delivery Info -->
          <div style="background-color: #ffffff; border-radius: 12px; padding: 20px; border: 1px solid #eee; margin-top: 16px;">
            <p style="margin: 0 0 8px; color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">📦 Delivery Details</p>
            <p style="margin: 0 0 4px; color: #1A1208;">${order.address}</p>
            <p style="margin: 0 0 4px; color: #1A1208;">${order.city}, ${order.state} ${order.town || ""}</p>
            <p style="margin: 12px 0 0; color: #7A5C14; font-weight: bold;">Estimated delivery: ${deliveryEstimate}</p>
          </div>

          <!-- What's Next -->
          <div style="background-color: #FFF8E7; border-radius: 12px; padding: 20px; margin-top: 16px; border: 1px solid #F0D090;">
            <p style="margin: 0 0 8px; color: #7A5C14; font-weight: bold; font-size: 14px;">What happens next?</p>
            <ul style="margin: 0; padding-left: 20px; color: #555; font-size: 13px; line-height: 1.8;">
              <li>We're preparing your order now</li>
              <li>You'll get an SMS when it ships</li>
              <li>Track your order anytime from your account</li>
            </ul>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #1A1208; padding: 25px 20px; text-align: center; margin-top: 20px;">
          <p style="color: #C49A3C; margin: 0 0 8px; font-size: 13px;">Questions? We're here to help.</p>
          <p style="color: #999; margin: 0; font-size: 12px;">📞 +234 800 EMPIRE · 💬 WhatsApp · 📧 hello@footwearempire.com</p>
          <p style="color: #666; margin: 15px 0 0; font-size: 11px;">© 2026 Footwear Empire. All rights reserved.</p>
        </div>
      </div>
    `;

    // ─── SEND BOTH EMAILS IN ONE REQUEST (Resend Batch) ───────────────────
    const res = await fetch("https://api.resend.com/emails/batch", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify([
        {
          from: "Footwear Empire <orders@yourdomain.com>",
          to: [ownerEmail],
          subject: `🛍️ New Order: ${order.orderNumber} — ₵${order.total.toLocaleString()}`,
          html: ownerHtml,
        },
        {
          from: "Footwear Empire <orders@yourdomain.com>",
          to: [customerEmail],
          subject: `✅ Order Confirmed: ${order.orderNumber} — Thank you, ${order.firstName}!`,
          html: customerHtml,
        },
      ]),
    });

    const data = await res.json();
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});