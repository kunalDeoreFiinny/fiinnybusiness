import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ProductSeed {
  name: string;
  brand: string;
  category: string;
  description?: string;
  aliases?: string[];
}

const PRODUCTS: ProductSeed[] = [
  // ─── SEEDS ─────────────────────────────────────────────────────────────────
  {
    name: 'Mahyco MRC 6301 Bt Cotton Seed',
    brand: 'Mahyco',
    category: 'seeds',
    aliases: ['MRC 6301', 'Mahyco Cotton'],
    description: 'BG-II Bt Cotton hybrid for rain-fed and irrigated conditions',
  },
  {
    name: 'Mahyco MRC 7377 BG-II Cotton',
    brand: 'Mahyco',
    category: 'seeds',
    aliases: ['MRC 7377'],
  },
  {
    name: 'Pioneer 30V92 Maize Hybrid',
    brand: 'Pioneer (Corteva)',
    category: 'seeds',
    aliases: ['P30V92', 'PMMH 10'],
    description: 'High-yielding maize hybrid suitable for kharif season',
  },
  {
    name: 'Syngenta NK 6240 Maize Seed',
    brand: 'Syngenta',
    category: 'seeds',
    aliases: ['NK 6240'],
  },
  {
    name: 'Kaveri Super 311 Paddy Seed',
    brand: 'Kaveri Seeds',
    category: 'seeds',
    aliases: ['KS311', 'Super 311'],
  },
  {
    name: 'Bayer Arize 6129 Gold Rice',
    brand: 'Bayer CropScience',
    category: 'seeds',
    aliases: ['Arize 6129 Gold'],
    description: 'Medium-duration rice hybrid with high tillering capacity',
  },
  {
    name: 'Rasi 818 Cotton Seed BG-II',
    brand: 'Rasi Seeds',
    category: 'seeds',
    aliases: ['Rasi 818'],
  },
  {
    name: 'NUZIVEEDU NCS 9002 Cotton',
    brand: 'NUZIVEEDU Seeds',
    category: 'seeds',
    aliases: ['NCS 9002'],
  },
  {
    name: 'Nunhems Tomato Abhinav F1',
    brand: 'Nunhems (Bayer)',
    category: 'seeds',
    aliases: ['Abhinav Tomato'],
    description: 'Indeterminate tomato hybrid with good shelf life',
  },
  {
    name: 'Bejo Sheetal Onion Seed',
    brand: 'Bejo Sheetal',
    category: 'seeds',
    aliases: ['Bejo Onion'],
  },

  // ─── FERTILIZERS ───────────────────────────────────────────────────────────
  {
    name: 'DAP (Di-ammonium Phosphate) 50kg',
    brand: 'IFFCO',
    category: 'fertilizers',
    aliases: ['DAP', 'Di-ammonium Phosphate', 'IFFCO DAP'],
    description: '18-46-0 grade fertilizer. Most widely used P fertilizer in India.',
  },
  {
    name: 'Urea 45kg',
    brand: 'IFFCO',
    category: 'fertilizers',
    aliases: ['Urea', 'Nitrogen fertilizer', 'IFFCO Urea'],
    description: '46% Nitrogen. Available in neem-coated and plain grades.',
  },
  {
    name: 'Neem-Coated Urea 45kg',
    brand: 'NFL',
    category: 'fertilizers',
    aliases: ['NCU', 'Neem Urea'],
    description: 'Urea coated with neem oil to slow nitrogen release',
  },
  {
    name: '10:26:26 NPK Complex 50kg',
    brand: 'IFFCO',
    category: 'fertilizers',
    aliases: ['10-26-26', 'IFFCO NPK'],
  },
  {
    name: '12:32:16 NPK Complex 50kg',
    brand: 'Coromandel',
    category: 'fertilizers',
    aliases: ['12-32-16', 'Gromor NPK'],
    description: 'Balanced fertilizer for high-value crops',
  },
  {
    name: 'MOP (Muriate of Potash) 50kg',
    brand: 'IPL',
    category: 'fertilizers',
    aliases: ['MOP', 'Potassium Chloride', 'KCl 60%'],
  },
  {
    name: 'SSP (Single Super Phosphate) 50kg',
    brand: 'GSFC',
    category: 'fertilizers',
    aliases: ['SSP', 'Single Super Phosphate', '16% P2O5'],
  },
  {
    name: 'Bentonite Sulphur 90% 25kg',
    brand: 'Coromandel',
    category: 'fertilizers',
    aliases: ['Sulphur 90', 'Bentonite S'],
    description: 'Slow-release sulphur fertilizer for oil seed crops',
  },

  // ─── PESTICIDES ────────────────────────────────────────────────────────────
  {
    name: 'Regent 0.3G Fipronil Granules 4kg',
    brand: 'Bayer CropScience',
    category: 'pesticides',
    aliases: ['Regent', 'Fipronil Granules'],
    description: 'Soil insecticide for termites and root grubs',
  },
  {
    name: 'Confidor 17.8 SL Imidacloprid 100ml',
    brand: 'Bayer CropScience',
    category: 'pesticides',
    aliases: ['Confidor', 'Imidacloprid 17.8'],
    description: 'Systemic insecticide for sucking pests — whitefly, aphid, thrips',
  },
  {
    name: 'Actara 25 WG Thiamethoxam 100g',
    brand: 'Syngenta',
    category: 'pesticides',
    aliases: ['Actara', 'Thiamethoxam 25WG'],
    description: 'Neonicotinoid for brown plant hopper and sucking insects',
  },
  {
    name: 'Chlorpyriphos 20% EC 1L',
    brand: 'Coromandel',
    category: 'pesticides',
    aliases: ['Chlorpyriphos', 'CPF 20 EC'],
  },
  {
    name: 'Monocrotophos 36% SL 1L',
    brand: 'Nagarjuna Agrichem',
    category: 'pesticides',
    aliases: ['Monocrotophos', 'Monocil'],
    description: 'Organophosphate for bollworms and stem borers',
  },
  {
    name: 'Emamectin Benzoate 5% SG 100g',
    brand: 'Syngenta',
    category: 'pesticides',
    aliases: ['Proclaim', 'Emamectin'],
    description: 'For diamond back moth, spodoptera, fruit borers',
  },

  // ─── HERBICIDES ────────────────────────────────────────────────────────────
  {
    name: 'Topik 15 WP Clodinafop 100g',
    brand: 'Syngenta',
    category: 'herbicides',
    aliases: ['Topik', 'Clodinafop', 'Clodinafop Propargyl'],
    description: 'Post-emergence herbicide for wheat against Phalaris minor',
  },
  {
    name: 'Isoproturon 75% WP 500g',
    brand: 'UPL',
    category: 'herbicides',
    aliases: ['IPU 75 WP', 'Isoproturon'],
    description: 'Wheat herbicide for annual grasses and broad-leaved weeds',
  },
  {
    name: 'Pendimethalin 30% EC 1L',
    brand: 'Crystal Crop Protection',
    category: 'herbicides',
    aliases: ['Stomp', 'Pendimethalin'],
    description: 'Pre-emergence herbicide for cotton, soybean, groundnut',
  },
  {
    name: 'Atrazine 50% WP 500g',
    brand: 'Syngenta',
    category: 'herbicides',
    aliases: ['Atrazine', 'Gesaprim'],
    description: 'Maize herbicide for narrow-leaf and broad-leaf weeds',
  },
  {
    name: '2,4-D Amine Salt 58% SL 500ml',
    brand: 'Bayer CropScience',
    category: 'herbicides',
    aliases: ['2,4-D', '24D Amine'],
    description: 'Selective post-emergence herbicide for paddy and wheat',
  },

  // ─── FUNGICIDES ────────────────────────────────────────────────────────────
  {
    name: 'Mancozeb 75% WP 500g',
    brand: 'Indofil Chemicals',
    category: 'fungicides',
    aliases: ['Dithane M-45', 'Mancozeb 75 WP', 'M-45'],
    description: 'Broad-spectrum protectant fungicide for blights and mildews',
  },
  {
    name: 'Propiconazole 25% EC 250ml',
    brand: 'Syngenta',
    category: 'fungicides',
    aliases: ['Tilt', 'Propiconazole'],
    description: 'Systemic triazole fungicide for blast, rust, sheath blight in rice',
  },
  {
    name: 'Carbendazim 50% WP 500g',
    brand: 'BASF',
    category: 'fungicides',
    aliases: ['Bavistin', 'Carbendazim'],
    description: 'Benzimidazole fungicide for powdery mildew and smut diseases',
  },
  {
    name: 'Copper Oxychloride 50% WP 500g',
    brand: 'Coromandel',
    category: 'fungicides',
    aliases: ['Blitox', 'Copper Oxy', 'COC'],
    description: 'Preventive copper-based fungicide for bacterial and fungal diseases',
  },
  {
    name: 'Hexaconazole 5% EC 500ml',
    brand: 'Bayer CropScience',
    category: 'fungicides',
    aliases: ['Contaf Plus', 'Hexaconazole'],
    description: 'Curative triazole for sheath blight in rice and anthracnose',
  },

  // ─── MICRONUTRIENTS ────────────────────────────────────────────────────────
  {
    name: 'Zinc Sulphate Monohydrate 33% 1kg',
    brand: 'IFFCO',
    category: 'micronutrients',
    aliases: ['ZnSO4', 'Zinc Sulphate 33%'],
    description: 'Addresses zinc deficiency — Khaira disease in paddy',
  },
  {
    name: 'Ferrous Sulphate 19% 1kg',
    brand: 'Coromandel',
    category: 'micronutrients',
    aliases: ['FeSO4', 'Iron Sulphate', 'Ferrous Sulphate'],
  },
  {
    name: 'Borax 10.5% B 1kg',
    brand: 'Multiplex',
    category: 'micronutrients',
    aliases: ['Borax', 'Boron 10.5'],
    description: 'Corrects boron deficiency in rapeseed, sunflower, cotton',
  },
  {
    name: 'Multi-K Potassium Nitrate 13:0:45 1kg',
    brand: 'Haifa',
    category: 'micronutrients',
    aliases: ['Multi-K', 'Potassium Nitrate', '13-0-45'],
    description: 'Water-soluble K fertilizer for drip and foliar application',
  },

  // ─── ORGANIC INPUTS ────────────────────────────────────────────────────────
  {
    name: 'Neem Cake Powder 25kg',
    brand: 'Multiplex',
    category: 'organic_inputs',
    aliases: ['Neem Cake', 'Neemkhal'],
    description: 'Soil amendment with nematicidal and pest-repellent properties',
  },
  {
    name: 'Trichoderma Viride 1% WP 1kg',
    brand: 'T-Stanes',
    category: 'organic_inputs',
    aliases: ['Trichoderma', 'T. viride'],
    description: 'Bio-fungicide for soil-borne pathogens like Pythium, Rhizoctonia',
  },
  {
    name: 'PSB Biofertilizer 1kg',
    brand: 'IFFCO Nano',
    category: 'organic_inputs',
    aliases: ['PSB', 'Phosphate Solubilizing Bacteria'],
    description: 'Solubilizes fixed P in soil for root uptake',
  },
  {
    name: 'Vermicompost 25kg',
    brand: 'Local/Generic',
    category: 'organic_inputs',
    aliases: ['Vermicompost', 'Worm Compost'],
  },
  {
    name: 'Beauveria Bassiana 1% WP 1kg',
    brand: 'Biostadt India',
    category: 'organic_inputs',
    aliases: ['Beauveria', 'Bb WP'],
    description: 'Entomopathogenic fungus for whitefly, thrips, aphids',
  },

  // ─── PLANT GROWTH REGULATORS ───────────────────────────────────────────────
  {
    name: 'Gibberellic Acid 0.001% L 250ml',
    brand: 'Bayer CropScience',
    category: 'plant_growth_regulators',
    aliases: ['GA3', 'Gibberellic Acid'],
    description: 'For increased fruit set and bunch elongation in grapes',
  },
  {
    name: 'Ethephon 39% SL 250ml',
    brand: 'Dhanuka Agritech',
    category: 'plant_growth_regulators',
    aliases: ['Ethephon', 'Ethrel'],
    description: 'Ripening promoter for mango, banana, tomato',
  },

  // ─── IRRIGATION EQUIPMENT ──────────────────────────────────────────────────
  {
    name: 'Drip Tape 16mm 200m Roll',
    brand: 'Jain Irrigation',
    category: 'irrigation_equipment',
    aliases: ['Drip Tape', 'Jain Drip'],
    description: '16mm diameter inline drip tape, 30cm emitter spacing',
  },
  {
    name: 'Micro Sprinkler Set (4 nozzles)',
    brand: 'Nelson',
    category: 'irrigation_equipment',
    aliases: ['Micro Sprinkler', 'Mini Sprinkler'],
  },
  {
    name: 'Submersible Pump 1HP',
    brand: 'Kirloskar',
    category: 'irrigation_equipment',
    aliases: ['Submersible Pump', '1HP Pump'],
    description: 'Single-phase 1HP submersible pump for borewell',
  },

  // ─── FARM TOOLS ────────────────────────────────────────────────────────────
  {
    name: 'Battery-operated Knapsack Sprayer 16L',
    brand: 'Neptune',
    category: 'farm_tools',
    aliases: ['Battery Sprayer', 'Electric Sprayer 16L'],
    description: '12V DC motor, 2 nozzles, 6-8 hour battery life',
  },
  {
    name: 'Manual Knapsack Sprayer 16L',
    brand: 'Solo',
    category: 'farm_tools',
    aliases: ['Knapsack Sprayer', 'Solo Sprayer'],
  },
  {
    name: 'Wheel Hoe Weeder',
    brand: 'Kisan Kraft',
    category: 'farm_tools',
    aliases: ['Wheel Hoe', 'Row Weeder'],
    description: 'Mechanical inter-row weeder for vegetable crops',
  },
];

async function main() {
  console.log('Seeding product master catalogue...');
  let inserted = 0;
  let updated = 0;

  for (const product of PRODUCTS) {
    const existing = await prisma.productMaster.findFirst({
      where: { name: product.name, brand: product.brand },
    });

    if (existing) {
      await prisma.productMaster.update({
        where: { id: existing.id },
        data: {
          aliases: product.aliases ?? [],
          description: product.description,
        },
      });
      updated++;
    } else {
      await prisma.productMaster.create({
        data: {
          name: product.name,
          brand: product.brand,
          category: product.category as any,
          description: product.description,
          aliases: product.aliases ?? [],
          isActive: true,
        },
      });
      inserted++;
    }
  }

  console.log(`✓ Seed complete: ${inserted} inserted, ${updated} updated`);
  console.log(`Total products: ${await prisma.productMaster.count()}`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
