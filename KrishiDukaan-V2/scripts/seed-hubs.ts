import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDh_Y67TDJc2KLLJ8Wcc2JvEeHzmfVL778",
  authDomain: "krishidukan-e8315.firebaseapp.com",
  projectId: "krishidukan-e8315",
  storageBucket: "krishidukan-e8315.firebasestorage.app",
  messagingSenderId: "650303885415",
  appId: "1:650303885415:web:7db7619260aa478b2b84c2",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const hubs = [
  {
    id: 'watermelon',
    name: 'Watermelon Hub',
    heroImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCShWApLmd5orpbfCQ7ygmjWA2q0BgOL3TUTOio-WN0NkMwFg5_h-EH9g3y-w1-6oC0wSXQML-mnfg8yXuc01VGH-dCPmVLcuMxg5_efLEOzm28E4LyalAxJSZ9ovVXj4PGtDA34b_c-3e1eFFqWla8pryOHK4d2XXK0Asc7R2hgGkWwuz68m7DEvfIX02LRu5Yj0ZpYms9UGHBBd5DbaEwinBYuDXuGHpBgAHZUm6G3chxh-S-jrFLwLfPGmA-I1zal0Z0mbzLpPNo',
    tagline: 'Everything required from seed selection to final harvest, curated for maximum yield.',
    seeds: [
      { name: 'Sugar Baby', price: 250, img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuByv4cPqlB1KYhELYjTmiYEkyUvKp9WVaye2AODgv8iz0zWp-dBoAq4amESYk6lY1LvA9UYb2sVqE6F91lDwmCSWOC86XN8a2C4BjFSsLROvs0SE1MMZLxfMkAfQUDpEBPBHIwHPFGEsrKqWrf2x_MDsMCo3kKhfkoeClw8BmDJOXClpDykV6mx-8Eqktiha67i1uMyfEzJ-maCYo7liILE2i8yqsNNEbYFCZ4sBGfLOasGGPaRcwV1iRU4SNm2L0mzt9_Vzx_1oSfK' },
      { name: 'Crimson Sweet', price: 320, img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDGOZSSmJZMe-qD1ddCjtTcp42wfTX39VBNKc5WtmDLBN_N82GHsodDhXq1rdQvlKHr2V1nhFgVqPUBVUGIp7xsYjIAMsaXEzp5oCyak9OKS5lqJ9zrYp5xgel1A-6521qAFPnRyVA_Ytl2z90ecemCa7Svu89jK9shsRM10x7I7UhUo49VdO3MkI3bU4ZF_kkjVgl9LC2ImV42HWPpue3rpWgOo3z03srbeZWuGZV-LMLrXSmC0d-ccBzSObVA_lwaVoGF-4e9r3Zf' }
    ],
    nutrition: [
      { name: 'Urea (Nitrogen Rich)', desc: 'For early vine growth', icon: 'Water' },
      { name: 'NPK 19:19:19', desc: 'Balanced flowering stage', icon: 'Sprout' }
    ],
    irrigation: {
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHM1kISdBgIMrknFsWdRp0svPPesWg7V_hAQUsj40ogBH_6B38JcIvOIjAeG1jXx3nM6VQPvL6foRHmsrU8VS6Z7IKidreaDh7fKyR0qsFlE6qmhpilDz23-TobHDV41BTLCN6Au8hM0JIXxubnfiKNGQqMeR3f8POsHcHQE-qBHwBdmPBeTycSeE30DuYdwfJs_E9kjNZc-zxQs-MPZrPZ1YOKkfETfixtuBk-6zSwDLt_LSl3NuD4NA_rl3fsqNS5qH7cMqCpC_P',
      items: [
        { name: 'Drip Tape (16mm)', price: '₹12/m' },
        { name: 'Micro Sprinklers', price: '₹45/pc' }
      ]
    },
    advisory: {
      title: 'Preventing Blossom End Rot',
      description: 'Inconsistent watering leads to calcium deficiency, causing black sunken spots on the fruit\'s bottom. Ensure a steady moisture level using drip irrigation, especially during rapid fruit expansion. Apply a calcium-rich foliar spray if symptoms appear early.'
    }
  },
  {
    id: 'pomegranate',
    name: 'Pomegranate Hub',
    heroImage: 'https://images.unsplash.com/photo-1528821128474-27f963b062bf?auto=format&fit=crop&q=80',
    tagline: 'Expert guidance and tools for growing premium export-quality pomegranates.',
    seeds: [
      { name: 'Bhagwa Sapling', price: 150, img: 'https://images.unsplash.com/photo-1615486511484-92e172054c04?auto=format&fit=crop&q=80' },
      { name: 'Ganesh Sapling', price: 120, img: 'https://images.unsplash.com/photo-1528821128474-27f963b062bf?auto=format&fit=crop&q=80' }
    ],
    nutrition: [
      { name: 'Calcium Nitrate', desc: 'Prevents fruit cracking', icon: 'Science' },
      { name: 'Boron', desc: 'Improves fruit set', icon: 'Sprout' }
    ],
    irrigation: {
      image: 'https://images.unsplash.com/photo-1598453472093-6e3e536102a3?auto=format&fit=crop&q=80',
      items: [
        { name: 'Inline Drip Tube', price: '₹18/m' },
        { name: 'Fertigation Pump', price: '₹2500/pc' }
      ]
    },
    advisory: {
      title: 'Managing Bacterial Blight',
      description: 'Bacterial blight causes spots on leaves and fruit. Maintain orchard hygiene, prune affected branches, and apply copper-based sprays during the dormant season and early fruit development.'
    }
  },
  {
    id: 'grapes',
    name: 'Grapes Hub',
    heroImage: 'https://images.unsplash.com/photo-1596334139886-c5e3f16960cc?auto=format&fit=crop&q=80',
    tagline: 'Complete viticulture solutions for table and wine grape varieties.',
    seeds: [
      { name: 'Thompson Seedless', price: 80, img: 'https://images.unsplash.com/photo-1537248174116-24f6fc1edff0?auto=format&fit=crop&q=80' },
      { name: 'Sharad Seedless', price: 90, img: 'https://images.unsplash.com/photo-1616142718109-c16fbeae5604?auto=format&fit=crop&q=80' }
    ],
    nutrition: [
      { name: 'Potassium Sulphate', desc: 'Enhances fruit size & sugar', icon: 'Science' },
      { name: 'Magnesium', desc: 'Prevents yellowing', icon: 'Water' }
    ],
    irrigation: {
      image: 'https://images.unsplash.com/photo-1582260656094-1a966774e1d1?auto=format&fit=crop&q=80',
      items: [
        { name: 'Dripper Line 2.4 LPH', price: '₹15/m' },
        { name: 'Moisture Sensor', price: '₹850/pc' }
      ]
    },
    advisory: {
      title: 'Controlling Powdery Mildew',
      description: 'Powdery mildew thrives in humid conditions. Ensure good canopy ventilation and apply sulfur dust or systemic fungicides as soon as early signs appear on young leaves.'
    }
  },
  {
    id: 'mangoes',
    name: 'Mango Hub',
    heroImage: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80',
    tagline: 'Orchard management essentials for king of fruits.',
    seeds: [
      { name: 'Alphonso Sapling', price: 250, img: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?auto=format&fit=crop&q=80' },
      { name: 'Kesar Sapling', price: 200, img: 'https://images.unsplash.com/photo-1605027990121-cbae9e0642df?auto=format&fit=crop&q=80' }
    ],
    nutrition: [
      { name: 'NPK 10:26:26', desc: 'Pre-flowering boost', icon: 'Sprout' },
      { name: 'Zinc Sulphate', desc: 'Healthy leaf growth', icon: 'Science' }
    ],
    irrigation: {
      image: 'https://images.unsplash.com/photo-1533728646964-b5b6329fc5f4?auto=format&fit=crop&q=80',
      items: [
        { name: 'Ring Irrigation Hose', price: '₹22/m' },
        { name: 'Sprinkler Head', price: '₹60/pc' }
      ]
    },
    advisory: {
      title: 'Mango Hopper Management',
      description: 'Hoppers cause significant flower drop. Monitor orchards during panicle emergence. Use neem-based sprays as a preventive measure and consult for chemical interventions if infestation is high.'
    }
  }
];

async function seed() {
  for (const hub of hubs) {
    await setDoc(doc(db, 'hubs', hub.id), hub);
    console.log(`Seeded ${hub.id}`);
  }
  console.log('Done!');
  process.exit(0);
}

seed().catch(console.error);
