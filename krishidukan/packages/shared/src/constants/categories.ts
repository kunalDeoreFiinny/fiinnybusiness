import { ProductCategory } from '../enums/product-category.enum';

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Lakshadweep', 'Andaman and Nicobar Islands',
] as const;

export type IndianState = (typeof INDIAN_STATES)[number];

export const AGRI_BRANDS: Record<ProductCategory, string[]> = {
  [ProductCategory.SEEDS]: [
    'Mahyco', 'Pioneer (Corteva)', 'Bayer CropScience', 'Syngenta',
    'Kaveri Seeds', 'Rasi Seeds', 'NUZIVEEDU Seeds', 'JK Seeds',
    'Vikki Seeds', 'Advanta Seeds',
  ],
  [ProductCategory.FERTILIZERS]: [
    'IFFCO', 'Coromandel', 'NFL', 'GSFC', 'RCFL', 'FACT', 'IPL',
    'Zuari Agro Chemicals', 'Paradeep Phosphates', 'Chambal Fertilisers',
  ],
  [ProductCategory.PESTICIDES]: [
    'Bayer CropScience', 'Syngenta', 'BASF', 'UPL', 'Coromandel',
    'PI Industries', 'Dhanuka Agritech', 'Rallis India', 'Excel Crop Care',
    'Nagarjuna Agrichem',
  ],
  [ProductCategory.HERBICIDES]: [
    'Bayer CropScience', 'Syngenta', 'UPL', 'Crystal Crop Protection',
    'Dow AgroSciences', 'DuPont', 'BASF', 'Monsanto (Bayer)',
  ],
  [ProductCategory.FUNGICIDES]: [
    'Bayer CropScience', 'Syngenta', 'BASF', 'Indofil Chemicals',
    'UPL', 'Dhanuka Agritech', 'PI Industries',
  ],
  [ProductCategory.MICRONUTRIENTS]: [
    'IFFCO', 'Coromandel', 'Multiplex', 'Haifa', 'Aries Agro',
    'Agri Gold', 'Krishidhan Seeds',
  ],
  [ProductCategory.IRRIGATION_EQUIPMENT]: [
    'Jain Irrigation', 'Netafim', 'Nelson', 'Kirloskar', 'Grundfos',
    'Premier Irrigation', 'BIS Irrigation',
  ],
  [ProductCategory.FARM_TOOLS]: [
    'Neptune', 'Solo', 'Aspee', 'Kisan Kraft', 'Shakti Pumps',
  ],
  [ProductCategory.ANIMAL_FEED]: [
    'Godrej Agrovet', 'Suguna Poultry', 'Cargill', 'Kemin',
  ],
  [ProductCategory.VETERINARY_SUPPLIES]: [
    'Virbac', 'Zoetis', 'Elanco', 'MSD Animal Health',
  ],
  [ProductCategory.ORGANIC_INPUTS]: [
    'Multiplex', 'T-Stanes', 'IFFCO Nano', 'Biostadt India',
    'Camson Bio Technologies',
  ],
  [ProductCategory.PLANT_GROWTH_REGULATORS]: [
    'Bayer CropScience', 'Syngenta', 'Multiplex', 'Dhanuka Agritech',
  ],
  [ProductCategory.OTHER]: [],
};
