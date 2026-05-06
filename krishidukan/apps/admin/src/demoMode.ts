// Demo mode kicks in when VITE_FIREBASE_API_KEY is missing.
// Lets every screen render with mock data — no backend, no Firebase needed.

export const IS_DEMO = !import.meta.env['VITE_FIREBASE_API_KEY'];

export const DEMO_ADMIN_USER = {
  uid: 'demo-admin-uid',
  email: 'admin@krishidukan.demo',
  displayName: 'Demo Admin',
};

export const DEMO_PENDING_SHOPS = [
  {
    id: 'shop-1',
    businessName: 'Krishi Mitra Agro Centre',
    ownerName: 'Ramesh Patil',
    phone: '+919876543210',
    addressLine: 'Plot 14, Market Road',
    city: 'Nashik',
    state: 'Maharashtra',
    pincode: '422001',
    status: 'pending_review',
    createdAt: '2026-05-01T10:30:00Z',
    licenseCount: 3,
  },
  {
    id: 'shop-2',
    businessName: 'Bhumi Krishi Seva Kendra',
    ownerName: 'Sunita Deshmukh',
    phone: '+919823456789',
    addressLine: 'Gat No. 142, Pune-Solapur Highway',
    city: 'Baramati',
    state: 'Maharashtra',
    pincode: '413102',
    status: 'pending_review',
    createdAt: '2026-05-03T08:15:00Z',
    licenseCount: 2,
  },
  {
    id: 'shop-3',
    businessName: 'Annapurna Agri Inputs',
    ownerName: 'Vijay Sawant',
    phone: '+919812345678',
    addressLine: 'Main Bazar, Tal. Karad',
    city: 'Karad',
    state: 'Maharashtra',
    pincode: '415110',
    status: 'pending_review',
    createdAt: '2026-05-05T14:20:00Z',
    licenseCount: 4,
  },
];

export const DEMO_ACTIVE_SHOPS = [
  {
    id: 'shop-a1',
    businessName: 'Shivaji Agro Mart',
    ownerName: 'Ganesh Kulkarni',
    phone: '+919887766554',
    addressLine: 'Near Bus Stand',
    city: 'Sangli',
    state: 'Maharashtra',
    pincode: '416416',
    status: 'active',
    createdAt: '2026-04-10T09:00:00Z',
    licenseCount: 3,
  },
  {
    id: 'shop-a2',
    businessName: 'Maharashtra Krishi Bhandar',
    ownerName: 'Mahesh Jadhav',
    phone: '+919776655443',
    addressLine: 'Old Market Yard',
    city: 'Kolhapur',
    state: 'Maharashtra',
    pincode: '416001',
    status: 'active',
    createdAt: '2026-04-12T11:30:00Z',
    licenseCount: 4,
  },
];

export const DEMO_SHOP_LICENSES = [
  {
    id: 'lic-1',
    licenseType: 'pesticide_license',
    licenseNumber: 'MH-PES-2024-12345',
    issueDate: '2024-04-01',
    expiryDate: '2027-03-31',
    documentUrl: 'demo://license-pesticide.pdf',
  },
  {
    id: 'lic-2',
    licenseType: 'fertilizer_license',
    licenseNumber: 'MH-FERT-2024-67890',
    issueDate: '2024-04-01',
    expiryDate: '2027-03-31',
    documentUrl: 'demo://license-fertilizer.pdf',
  },
  {
    id: 'lic-3',
    licenseType: 'gst_registration',
    licenseNumber: '27AAACK1234L1Z5',
    issueDate: '2023-01-15',
    expiryDate: null,
    documentUrl: 'demo://gst-cert.pdf',
  },
];

export const DEMO_ANALYTICS = {
  totalShops: 87,
  activeShops: 64,
  pendingShops: 18,
  suspendedShops: 5,
  totalSearches: 12_847,
  searchesLast7Days: 2_148,
  totalFarmers: 2_341,
  topProducts: [
    { name: 'Mahyco MRC 6918 Cotton Seeds', searches: 1248 },
    { name: 'IFFCO Sagarika Liquid Fertilizer', searches: 987 },
    { name: 'Bayer Confidor Insecticide', searches: 854 },
    { name: 'Syngenta Amistar Top Fungicide', searches: 712 },
    { name: 'UPL Sweep Power Glyphosate', searches: 645 },
  ],
};
