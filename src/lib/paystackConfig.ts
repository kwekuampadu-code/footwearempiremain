// src/lib/paystackConfig.ts

// Get your Public Key from: https://dashboard.paystack.com/#/settings/developer
// Use the TEST key while developing, switch to LIVE key when ready
const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

if (!PAYSTACK_PUBLIC_KEY) {
  console.warn("⚠️ Missing VITE_PAYSTACK_PUBLIC_KEY in .env.local");
}

export { PAYSTACK_PUBLIC_KEY };