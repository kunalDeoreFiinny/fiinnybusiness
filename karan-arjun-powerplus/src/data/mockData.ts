export interface Product {
  id: string;
  name: string;
  desc: string;
  price: string;
  numericPrice: number;
  image: string;
  badge?: string;
  featured?: boolean;
}

export interface Blog {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  content?: string;
  imageUrls?: string[];
  videoUrls?: string[];
  links?: Array<{
    label: string;
    url: string;
  }>;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  totalOrders: number;
  joinDate: string;
}

export interface Grievance {
  id: string;
  ticketId?: string;
  userId: string;
  userName: string;
  subject: string;
  description: string;
  status: 'Pending' | 'In Progress' | 'Resolved';
  date: string;
  messages?: Array<{
    id: string;
    sender: 'admin' | 'customer';
    text: string;
    createdAt: number;
  }>;
}

export interface AboutInfo {
  tagline: string;
  manufacturer: string;
  location: string;
  phone: string;
  certification: string;
}

export const initialProducts: Product[] = [
  {
    id: '1l',
    name: '1L Formulation',
    desc: 'Perfect for small-scale testing or specialized crop sections.',
    price: '₹500',
    numericPrice: 500,
    image: '/bottle-1l-Photoroom.png',
    badge: 'In Stock'
  },
  {
    id: '5l',
    name: '5L Bulk Formulation',
    desc: 'Designed for large-scale agricultural operations.',
    price: '₹2,150',
    numericPrice: 2150,
    image: '/bottle-5l-Photoroom.png',
    badge: 'Best Value',
    featured: true
  },
  {
    id: '3l',
    name: '3L Formulation',
    desc: 'The ideal balance for medium-sized farms.',
    price: '₹1,350',
    numericPrice: 1350,
    image: '/bottle-3l-Photoroom.png',
    badge: 'Popular'
  }
];

export const initialBlogs: Blog[] = [
  {
    id: '1',
    title: 'Maximizing Yield with Liquid Bio-Stimulants',
    excerpt: 'Learn the science behind foliar application and how it can boost your crop production by up to 30%.',
    date: 'Oct 12, 2023',
    category: 'Agronomy'
  },
  {
    id: '2',
    title: 'Understanding Soil pH and Nutrient Lockout',
    excerpt: 'A deep dive into why alkaline soils prevent nutrient absorption and how our formulation bypasses it.',
    date: 'Nov 05, 2023',
    category: 'Soil Science'
  },
  {
    id: '3',
    title: 'Drip Irrigation vs. Foliar Spray: Which is Better?',
    excerpt: 'Comparing the two primary application methods for Power Plus™ and when to use each.',
    date: 'Dec 18, 2023',
    category: 'Best Practices'
  }
];

export const initialUsers: User[] = [
  { id: 'u1', name: 'Rajesh Patil', phone: '+91 98765 43210', totalOrders: 5, joinDate: '2023-08-14' },
  { id: 'u2', name: 'Amit Kumar', phone: '+91 87654 32109', totalOrders: 2, joinDate: '2023-09-02' },
  { id: 'u3', name: 'Suresh Desai', phone: '+91 76543 21098', totalOrders: 12, joinDate: '2023-01-20' },
  { id: 'u4', name: 'Vijay Singh', phone: '+91 65432 10987', totalOrders: 0, joinDate: '2023-10-11' },
];

export const initialGrievances: Grievance[] = [
  {
    id: 'g1',
    userId: 'u1',
    userName: 'Rajesh Patil',
    subject: 'Late Delivery of Order #ORD-9021A',
    description: 'My recent order of the 5L formulation is delayed by 3 days. Can I get a tracking update?',
    status: 'Pending',
    date: '2024-10-08',
  },
  {
    id: 'g2',
    userId: 'u2',
    userName: 'Amit Kumar',
    subject: 'Damaged Bottle Cap',
    description: 'One of the 3L bottles I received had a slightly cracked cap. Some liquid leaked out.',
    status: 'In Progress',
    date: '2024-09-25',
  },
  {
    id: 'g3',
    userId: 'u1',
    userName: 'Rajesh Patil',
    subject: 'Dosage Query',
    description: 'I need clarification on the dosage for foliar spray on cotton crops.',
    status: 'Resolved',
    date: '2024-05-15',
  }
];

export const initialAbout: AboutInfo = {
  tagline: "Trust with tradition, one step toward modernity",
  manufacturer: "Unimax Agri Bio-Technologies (I) Pvt. Ltd.",
  location: "Karjat, Maharashtra 414402, India",
  phone: "+91 9307199040",
  certification: "ISO 9001:2015"
};

export const initialHomeVideos: string[] = [
  'https://www.youtube.com/shorts/dmCafHKBuIY',
  'https://www.youtube.com/shorts/AKFS1bF5AG4',
  'https://www.youtube.com/shorts/qH0ah_cm2fA',
];
