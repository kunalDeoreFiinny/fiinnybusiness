// Searchable catalog of Maharashtra villages/cities/pincodes for manual location picking (F1).
// Each entry has lat/lng so the rest of the app keeps using distance math unchanged.

export interface LocationEntry {
  id: string;
  village: string;
  district: string;
  state: string;
  pincode: string;
  lat: number;
  lng: number;
}

export const LOCATION_CATALOG: LocationEntry[] = [
  // Pune district
  { id: 'pune-city',      village: 'Pune',        district: 'Pune',     state: 'Maharashtra', pincode: '411001', lat: 18.5204, lng: 73.8567 },
  { id: 'pune-hadapsar',  village: 'Hadapsar',    district: 'Pune',     state: 'Maharashtra', pincode: '411028', lat: 18.5089, lng: 73.9260 },
  { id: 'pune-baramati',  village: 'Baramati',    district: 'Pune',     state: 'Maharashtra', pincode: '413102', lat: 18.1514, lng: 74.5778 },
  { id: 'pune-indapur',   village: 'Indapur',     district: 'Pune',     state: 'Maharashtra', pincode: '413106', lat: 18.1219, lng: 75.0241 },
  { id: 'pune-daund',     village: 'Daund',       district: 'Pune',     state: 'Maharashtra', pincode: '413801', lat: 18.4661, lng: 74.5815 },

  // Nashik district
  { id: 'nsk-city',       village: 'Nashik',      district: 'Nashik',   state: 'Maharashtra', pincode: '422001', lat: 19.9975, lng: 73.7898 },
  { id: 'nsk-deolali',    village: 'Deolali',     district: 'Nashik',   state: 'Maharashtra', pincode: '422401', lat: 19.9474, lng: 73.8418 },
  { id: 'nsk-sinnar',     village: 'Sinnar',      district: 'Nashik',   state: 'Maharashtra', pincode: '422103', lat: 19.8470, lng: 74.0000 },
  { id: 'nsk-niphad',     village: 'Niphad',      district: 'Nashik',   state: 'Maharashtra', pincode: '422303', lat: 20.0833, lng: 74.1167 },
  { id: 'nsk-pimpalgaon', village: 'Pimpalgaon',  district: 'Nashik',   state: 'Maharashtra', pincode: '422209', lat: 20.1667, lng: 73.9833 },

  // Satara district
  { id: 'sat-city',       village: 'Satara',      district: 'Satara',   state: 'Maharashtra', pincode: '415001', lat: 17.6805, lng: 73.9933 },
  { id: 'sat-karad',      village: 'Karad',       district: 'Satara',   state: 'Maharashtra', pincode: '415110', lat: 17.2877, lng: 74.1827 },
  { id: 'sat-wai',        village: 'Wai',         district: 'Satara',   state: 'Maharashtra', pincode: '412803', lat: 17.9558, lng: 73.8907 },
  { id: 'sat-phaltan',    village: 'Phaltan',     district: 'Satara',   state: 'Maharashtra', pincode: '415523', lat: 17.9890, lng: 74.4310 },

  // Sangli district
  { id: 'sgl-city',       village: 'Sangli',      district: 'Sangli',   state: 'Maharashtra', pincode: '416416', lat: 16.8524, lng: 74.5815 },
  { id: 'sgl-miraj',      village: 'Miraj',       district: 'Sangli',   state: 'Maharashtra', pincode: '416410', lat: 16.8240, lng: 74.6360 },
  { id: 'sgl-tasgaon',    village: 'Tasgaon',     district: 'Sangli',   state: 'Maharashtra', pincode: '416312', lat: 17.0333, lng: 74.6000 },

  // Kolhapur district
  { id: 'klp-city',       village: 'Kolhapur',    district: 'Kolhapur', state: 'Maharashtra', pincode: '416001', lat: 16.7050, lng: 74.2433 },
  { id: 'klp-icl',        village: 'Ichalkaranji',district: 'Kolhapur', state: 'Maharashtra', pincode: '416115', lat: 16.6914, lng: 74.4604 },
  { id: 'klp-kagal',      village: 'Kagal',       district: 'Kolhapur', state: 'Maharashtra', pincode: '416216', lat: 16.5773, lng: 74.3203 },
];

export function searchLocationCatalog(query: string, limit = 12): LocationEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return LOCATION_CATALOG.slice(0, limit);
  return LOCATION_CATALOG.filter((e) => {
    return (
      e.village.toLowerCase().includes(q) ||
      e.district.toLowerCase().includes(q) ||
      e.pincode.startsWith(q) ||
      e.state.toLowerCase().includes(q)
    );
  }).slice(0, limit);
}

export function findByPincode(pincode: string): LocationEntry | undefined {
  return LOCATION_CATALOG.find((e) => e.pincode === pincode);
}
