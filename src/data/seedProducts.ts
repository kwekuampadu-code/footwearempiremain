// src/data/seedProducts.ts
import { createClient } from '@supabase/supabase-js';

// ⚠️ PASTE YOUR SUPABASE URL AND ANON KEY HERE (from your .env.local file)
// We hardcode them here just for this one-time script.
const supabaseUrl = 'https://pouwesoeljlyextybooe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvdXdlc29lbGpseWV4dHlib29lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU3NTg4NDgsImV4cCI6MjEwMTMzNDg0OH0.kjtVsMVxFNv7FCp0yR4TYuVAj0FNX6-K9LR_bWfrOKA';
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper for Unsplash images (replaces your old `img()` function)
const unsplash = (id: string, w = 600, h = 700) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&auto=format`;

const products = [
  {
    id: "m1",
    name: "Nike Shox TL",
    brand: "Nike",
    price: 600,
    original_price: 699,
    category: "men",
    subcategory: "Sneakers",
    // 👇 PASTE YOUR SUPABASE STORAGE URLs HERE
    images: [
      "https://pouwesoeljlyextybooe.supabase.co/storage/v1/object/public/product-images/Nike%20Shox%20White.jpeg",
      "https://pouwesoeljlyextybooe.supabase.co/storage/v1/object/public/product-images/Nike_Shox_TL.jpg"
    ],
    sizes: ["6","7","8","9","10","11","12"],
    colors: ["Triple Black","White/Silver","Red/Black","Navy/Gold"],
    stock: 20,
    rating: 4.8,
    review_count: 74,
    is_new: true,
    is_best_seller: true,
    description: "The Nike Shox TL brings back the iconic spring-loaded Shox columns...",
    features: ["Shox column cushioning system","Leather and synthetic upper","Rubber outsole"],
    collection: "New Arrivals",
    is_active: true
  },
  {
    id: "m2",
    name: "Puma Suede XL",
    brand: "Puma",
    price: 12500,
    category: "men",
    subcategory: "Sneakers",
    // 👇 PASTE URL FOR SNEAKER 20 HERE
    images: ["https://pouwesoeljlyextybooe.supabase.co/storage/v1/object/public/product-images/sneaker20.jpeg", "https://pouwesoeljlyextybooe.supabase.co/storage/v1/object/public/product-images/sneaker59.jpg"],
    sizes: ["6","7","8","9","10","11"],
    colors: ["Tan","Black","Dark Brown"],
    stock: 28,
    rating: 4.7,
    review_count: 189,
    is_best_seller: true,
    description: "A timeless Oxford crafted from full-grain leather...",
    features: ["Full-grain leather upper","Leather lining"],
    collection: "Office Wear",
    is_active: true
  },
  // ... COPY AND PASTE THE REST OF YOUR PRODUCTS HERE ...
  // (Make sure to convert the Unsplash ones using the unsplash() helper above)
  {
    id: "a1",
    name: "Empire Cotton Sock 3-Pack",
    brand: "Empire Care",
    price: 899,
    category: "accessories",
    subcategory: "Socks",
    images: [unsplash("1532453288-f4d3cf6c1100", 600, 600)], // Unsplash works fine!
    sizes: ["S","M","L","XL"],
    colors: ["White","Black","Mixed"],
    stock: 100,
    rating: 4.3,
    review_count: 156,
    is_best_seller: true,
    description: "Three-pack of premium Egyptian cotton socks...",
    features: ["Egyptian cotton blend","Reinforced heel & toe"],
    collection: "Budget",
    is_active: true
  }
];

async function seedDatabase() {
  console.log('🌱 Starting seed process...');
  
  // Upsert (insert or update) the products into the database
  const { data, error } = await supabase
    .from('products')
    .upsert(products, { onConflict: 'id' }) as { data: any[] | null; error: { message: string } | null };

  if (error) {
    console.error('❌ Error seeding database:', error.message);
  } else {
    console.log(`✅ Successfully seeded ${data?.length ?? products.length} products!`);
  }
}

seedDatabase();