import { 
  Home, 
  Store, 
  BrainCircuit, 
  ReceiptText, 
  MapPin, 
  ShoppingBasket, 
  Search, 
  ArrowRight, 
  Handshake, 
  Zap, 
  ChevronRight, 
  Star, 
  Truck, 
  CheckCircle2, 
  Info,
  Microscope,
  Droplets,
  Sprout,
  Plus,
  Minus,
  ShoppingCart,
  Phone,
  MessageSquare,
  LocateFixed,
  Navigation,
  X
} from 'lucide-react';
import { MarketplaceProduct } from '../types/product';

export const ICONS = {
  Home,
  Market: Store,
  Hub: BrainCircuit,
  Orders: ReceiptText,
  Location: MapPin,
  Cart: ShoppingBasket,
  Search,
  ArrowRight,
  Trust: Handshake,
  Efficiency: Zap,
  ChevronRight,
  Star,
  Delivery: Truck,
  Check: CheckCircle2,
  Info,
  Science: Microscope,
  Water: Droplets,
  Sprout,
  Plus,
  Minus,
  AddToCart: ShoppingCart,
  Phone,
  Chat: MessageSquare,
  MyPosition: LocateFixed,
  Directions: Navigation,
  X
};

export const COLORS = {
  primary: '#154212',
  secondary: '#705a4c',
  harvest: '#f57c00',
  surface: '#fbf9f7',
  onSurface: '#1b1c1b'
};

export const CROPS = [
  { id: 'watermelon', name: 'Watermelon', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSGbELbnV8HdsslJ8hy2mq0a_hvzZrr4cwUKHrze-GEeDpv0Z0VAvA62LryAUopIvuvGVeMWJJbVbRbtq1vKgcoaC4k3njelp3OPJb4_vjrijsdG-_1eEve_PojVdVNedf02IxptPKFjsUkGRH1oiP1H0007UHuQJ18mVTW7N6Vr0wdS7106fBV-qwwwXtBDWxaYcfvkouSyItxhdz24OL3GaUYJVj1YAyxMbObWYCQ7RpC1_QTpxN-wK8fDzDpx5JjUPaRwkLJq3m' },
  { id: 'wheat', name: 'Wheat', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGRxeg57dLoYXGSyDjQg4KIlhXhDoSLcH2TL8JTunYEXVl92RlHqTVRxoaRdOAkh3zaNzYyWA_A6fqz_nGVpYX89iPffRc3YZiMWnP3sK_95HetWGqVfdRImiWjILpEm4QSjNlbAjMj-OUvIStUKdMz3rJIgBpfZfwS_bvvqnp4MW5nmL3clqHayheyeb4JjIMAQ-gLUSD5MwF4wfv6V6n8zzhE4j4TuAAZTe6ghT4RN968zaDf-5pElvcbSJgD-qRjSWhoK-bxv2E' },
  { id: 'tomato', name: 'Tomato', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAqKjRa6JNKk1ATRrRh-34rnzxN5NuF1db88XkLpgwid9VCayDeG7-CfYbyq33aukNBgreqb0c5M1Int2-qanv5_m-SOu2lBMifHXZZH-RkGgsKGAFKGT4r5Nog_CeGGEI5cwu7us5a6k3pdYmXKuO71MT-e41ku3KL7OkdDlJTeQtkq8qzokwhrXf4vzscnmQVRktLp-RhAVdgE10R9kSDmAf-j8yl9-6ONkKTzkj3c4RrUIIUYJjM2l3q8EFdtQT0CPWTr3JIG98a' },
  { id: 'cotton', name: 'Cotton', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAi13WleIFmuHicYHUY0W-rwufSddyMDo6kb2AcbrntT8BejZDYLjTxaKtV_Y7mnIsnnZJB27-jLhcDJJ-INGrThJKx-ezn-v1eICtCBg9KvmrOIjxCzqye2mi_tIn2fzO64bWu8QByBgH2JQTivKMjxsEsgphoj0fCIMsFB7enUvlyLg-6IkDTTWxfnEszM37GZrGUGaIDzJCwiztMcbaYmVPS8EIuSqQY0ewtQb8oZbCMTLeltwk9U7G9_lPwLTyFLt5WcDAd8f1r' },
];

export const STORES = [
  {
    id: 's1',
    name: "Balaji Krishi Seva Kendra",
    ownerName: "Harsh",
    phone: "+919657389043",
    address: "Baner, Pune, Pune, Maharashtra 413102",
    status: "Open until 8:00 PM",
    distance: "1.2 km away",
    isHot: true,
    location: {
      lat: 18.598552,
      lng: 73.813938
    },
    stock: ['Urea', 'NPK', 'Seeds']
  },
  {
    id: 's2',
    name: "Surve Agro",
    ownerName: "Sai Surve",
    phone: "+919921929137",
    address: "Vadgaon, Maval, Pune",
    status: "Open until 7:00 PM",
    distance: "3.5 km away",
    location: {
      lat: 18.7391,
      lng: 73.6415
    },
    stock: ['Fertilizers', 'Tools']
  },
  {
    id: 's3',
    name: "Dongre Patil Agro",
    ownerName: "Patil",
    phone: "+918605760219",
    address: "Patoda, Yeola, Nashik",
    status: "Open until 6:30 PM",
    distance: "12.0 km away",
    location: {
      lat: 20.0421,
      lng: 74.4893
    },
    stock: ['Seeds', 'Pesticides']
  },
  {
    id: 's4',
    name: "Kisan Agro Traders",
    ownerName: "Kisan Agro",
    phone: "+917038143893",
    address: "Kokamgaon, Kopargaon, Ahilyanagar",
    status: "Open until 8:00 PM",
    distance: "15.5 km away",
    location: {
      lat: 19.9011,
      lng: 74.5012
    },
    stock: ['Tools', 'Hardware']
  },
  {
    id: 's5',
    name: "Yogesh Krushi Agencies",
    ownerName: "Yogesh",
    phone: "+919921930466",
    address: "Lasalgaon, Niphad, Nashik 422306",
    status: "Open until 7:00 PM",
    distance: "8.2 km away",
    location: {
      lat: 20.1427,
      lng: 74.2391
    },
    stock: ['Seeds', 'Fertilizers']
  }
];

export const PRODUCTS: MarketplaceProduct[] = [
  {
    id: 'p1',
    name: 'Premium Wheat Seeds',
    fullName: 'Premium Golden Wheat Seeds (Hybrid)',
    price: 1200,
    oldPrice: 1400,
    category: 'seeds',
    description: 'High-yield variety, suitable for local soil conditions. Drought resistant.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA9DzE2OB77Rgv1NwTy7JTBCgFSx2IWia8qNQ3S0rtSkbpNjXc23to77zsOMOdw7GnIxonAWKD_J95prSm1HHoU2-qFcJV746h5UpRa27VzKlzySDbpj113cgYgy5Aloy9q2KRRhZnC9haCd4DVupUB3pj2SV7CGzVOPf0QcDdNxPoS5389PNv5WzYsqcim342Qxeky-arBg88aAW245GoXUyRGTFK55SBklq-Sz3_DLtwhSB4QVBOjJC_p_AdlTjnDYgqO5lRa62P6',
    stock: 'In Stock',
    store: 'Balaji Krishi Seva Kendra',
    distance: '1.2km',
    availability: [
      { storeId: 's1', stockLevel: 'In Stock' }
    ]
  },
  {
    id: 'p2',
    name: 'Bio-Active Fertilizer',
    fullName: 'Samruddhi NPK 19:19:19',
    price: 850,
    category: 'fertilizers',
    description: '100% organic compost mix for healthier crop growth.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2WDW8n84ARpG1rKuqGsgPJ6DH-K_TGgT2BhcMvWXVlj0-wQMhgkIlMit2lSvWxek2a1m6zuh1KvEEW24PWTv4w-z_-j_Vetv8EyJcha1AMMb2Y4y9Uz3ay5lhhylUC6ZRuU981JFFLbDt0lLn99tSC5Jf0ceN_5WcBGlbJ5J0E1_NgwYlUAGZH005ylDSYopd5G0QRLaoksL7vi3xZ7IcWobKDhijMZcwJK2-k-FSlSFAY2Megman0hXlvpr8P-I9cHeuI4H1Ow-U',
    stock: 'Fast Selling',
    store: 'Balaji Krishi Seva Kendra',
    distance: '1.2km',
    availability: [
      { storeId: 's1', stockLevel: 'Fast Selling' }
    ]
  },
  {
    id: 'p3',
    name: 'Pro Pruning Shears',
    price: 450,
    category: 'tools',
    description: 'Ergonomic design with high-carbon steel blades.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC0lKpQNZwsNobPjdMrfQ1RArKB3PDGd2wb97adUURc2Dj-YyC4LmH5BGv4C7p08DMZejvtg1fr2b_zgV8b3R26Ua2KRECh6nsoWlbvzt-GFXcziFU0yRgHUvxGG1DDv1COqqNbkD69EYziOBsrQkkYzmhOqERacnmBDeHca7dtmCoPV7ltojPylMI7wZhuXeiWq6Au3zaSeAwVCH2Vz5KHmEnYAeiR5Fz0pg0acr04msE-dkcGlgsyVHaStKFwHwoDYb5_XrF2umgu',
    stock: 'Low Stock',
    store: 'Surve Agro',
    distance: '3.5km',
    availability: [
      { storeId: 's2', stockLevel: 'Low Stock' }
    ]
  },
  {
    id: 'p4',
    name: 'Power Plus',
    fullName: 'Power Plus Micronutrient Growth Booster',
    price: 500,
    category: 'fertilizers',
    description: 'Advanced plant growth stimulator for enhanced nutrient absorption and maximum yield.',
    image: '/images/regenerated_image_1778304077291.png',
    stock: 'Trending',
    store: 'Dongre Patil Agro',
    distance: '12.0km',
    availability: [
      { storeId: 's3', stockLevel: 'In Stock' }
    ]
  }
];

export const INVENTORY = [
  { retailerId: "s1", productId: "p1", stock: 40, price: 1250 },
  { retailerId: "s1", productId: "p2", stock: 18, price: 890 },
  { retailerId: "s2", productId: "p3", stock: 22, price: 1450 },
  { retailerId: "s3", productId: "p4", stock: 35, price: 420 },
  { retailerId: "s4", productId: "p3", stock: 50, price: 320 },
  { retailerId: "s5", productId: "p1", stock: 60, price: 280 }
];
