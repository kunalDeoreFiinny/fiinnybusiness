// ─── Seed Data ─────────────────────────────────────────────────────────────
// Dummy MVP data for KrishiDukan Firestore seeding.
// inventory[] uses placeholder IDs; seedFirestore.ts replaces them at runtime.

// ─── Products ───────────────────────────────────────────────────────────────

export const products = [
  {
    name: "Karan Arjun Power Plus",
    brand: "Karan Arjun",
    category: "Fertilizer",
    unit: "50kg bag",
    imageUrl: "",
  },
  {
    name: "Karan Arjun Power Plus Shield",
    brand: "Karan Arjun",
    category: "Pesticide",
    unit: "1L bottle",
    imageUrl: "",
  },
  {
    name: "Karan Arjun Power Plus Gold",
    brand: "Karan Arjun",
    category: "Fertilizer",
    unit: "25kg bag",
    imageUrl: "",
  },
  {
    name: "Karan Arjun Power Plus Boost",
    brand: "Karan Arjun",
    category: "Growth Booster",
    unit: "500ml bottle",
    imageUrl: "",
  },
  {
    name: "Copper Fungicide",
    brand: "UPL",
    category: "Fungicide",
    unit: "1kg",
    imageUrl: "",
  },
  {
    name: "Pomegranate Seeds",
    brand: "AgroSeed",
    category: "Seeds",
    unit: "1kg pack",
    imageUrl: "",
  },
  {
    name: "Watermelon Seeds",
    brand: "Syngenta",
    category: "Seeds",
    unit: "500g pack",
    imageUrl: "",
  },
];

// ─── Retailers ──────────────────────────────────────────────────────────────
// email is generated from ownerName/shopName; a dummy UID is assigned at seed time.

export const retailers = [
  {
    shopName: "Balaji Krishi Seva Kendra",
    ownerName: "Harsh",
    phone: "+919657389043",
    email: "harsh@balajikrishi.com",
    address: "Baner, Pune, Pune, Maharashtra 413102",
    approved: true,
    location: { lat: 18.598552, lng: 73.813938 },
  },
  {
    shopName: "Surve Agro",
    ownerName: "Sai Surve",
    phone: "+919921929137",
    email: "sai@surveagro.com",
    address: "Vadgaon, Maval, Pune",
    approved: true,
    location: { lat: 18.7391, lng: 73.6415 },
  },
  {
    shopName: "Dongre Patil Agro",
    ownerName: "Patil",
    phone: "+918605760219",
    email: "patil@dongrepatilagro.com",
    address: "Patoda, Yeola, Nashik",
    approved: true,
    location: { lat: 20.0421, lng: 74.4893 },
  },
  {
    shopName: "Kisan Agro Traders",
    ownerName: "Kisan Agro",
    phone: "+917038143893",
    email: "info@kisanagrotraders.com",
    address: "Kokamgaon, Kopargaon, Ahilyanagar",
    approved: true,
    location: { lat: 19.9011, lng: 74.5012 },
  },
  {
    shopName: "Yogesh Krushi Agencies",
    ownerName: "Yogesh",
    phone: "+919921930466",
    email: "yogesh@yogeshkrushi.com",
    address: "Lasalgaon, Niphad, Nashik 422306",
    approved: true,
    location: { lat: 20.1427, lng: 74.2391 },
  },
];

// ─── Inventory ──────────────────────────────────────────────────────────────
// Uses 1-based index references; seedFirestore.ts resolves these to real Firestore IDs.
// retailerIndex / productIndex are 0-based into the arrays above.

export const inventoryTemplate = [
  { retailerIndex: 0, productIndex: 0, stock: 40, price: 1250 },
  { retailerIndex: 0, productIndex: 1, stock: 18, price: 890 },
  { retailerIndex: 1, productIndex: 2, stock: 22, price: 1450 },
  { retailerIndex: 1, productIndex: 4, stock: 12, price: 650 },
  { retailerIndex: 2, productIndex: 3, stock: 35, price: 420 },
  { retailerIndex: 3, productIndex: 5, stock: 50, price: 320 },
  { retailerIndex: 4, productIndex: 6, stock: 60, price: 280 },
];
