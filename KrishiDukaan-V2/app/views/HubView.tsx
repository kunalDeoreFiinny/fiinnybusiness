'use client';

import { useState, useEffect, useMemo } from 'react';
import { ICONS } from '../constants';
import { motion } from 'framer-motion';
import { fetchHubs, Hub } from '../firebase';

const FALLBACK_HUBS: Hub[] = [
  {
    id: 'watermelon',
    name: 'Watermelon',
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
    name: 'Pomegranate',
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
    name: 'Grapes',
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
    name: 'Mango',
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

interface HubViewProps {
  searchQuery?: string;
}

export default function HubView({ searchQuery = '' }: HubViewProps) {
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [selectedHub, setSelectedHub] = useState<Hub | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHubs = async () => {
      try {
        const fetchedHubs = await fetchHubs();
        if (fetchedHubs && fetchedHubs.length > 0) {
          setHubs(fetchedHubs);
          setSelectedHub(fetchedHubs[0]);
        } else {
          setHubs(FALLBACK_HUBS);
          setSelectedHub(FALLBACK_HUBS[0]);
        }
      } catch (err) {
        console.warn('Could not load hubs from Firestore, using fallback:', err);
        setHubs(FALLBACK_HUBS);
        setSelectedHub(FALLBACK_HUBS[0]);
      } finally {
        setLoading(false);
      }
    };

    loadHubs();
  }, []);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredHubs = useMemo(() => {
    if (!normalizedQuery) return hubs;

    return hubs.filter((hub) => {
      const searchable = [
        hub.name,
        hub.tagline,
        ...hub.seeds.map((seed) => seed.name),
        ...hub.nutrition.map((item) => item.name),
        hub.advisory.title
      ]
        .join(' ')
        .toLowerCase();
      return searchable.includes(normalizedQuery);
    });
  }, [hubs, normalizedQuery]);

  useEffect(() => {
    if (!filteredHubs.length) {
      setSelectedHub(null);
      return;
    }

    if (!selectedHub || !filteredHubs.some((hub) => hub.id === selectedHub.id)) {
      setSelectedHub(filteredHubs[0]);
    }
  }, [filteredHubs, selectedHub]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!selectedHub) {
    return (
      <div className="px-4 md:px-10 max-w-7xl mx-auto w-full py-10">
        <div className="rounded-3xl border border-dashed border-surface-container bg-surface-container-low p-10 text-center">
          <h2 className="text-xl font-bold text-on-surface mb-2">No hub results found</h2>
          <p className="text-on-surface-variant">Try a different product, crop, or keyword.</p>
        </div>
      </div>
    );
  }

  const getIcon = (iconName: string) => {
    return ICONS[iconName as keyof typeof ICONS] || ICONS.Sprout;
  };

  return (
    <div className="px-4 md:px-10 max-w-7xl mx-auto w-full py-8 flex flex-col gap-8">
      
      {/* Hub Selector */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {filteredHubs.map((hub) => (
          <button
            key={hub.id}
            onClick={() => setSelectedHub(hub)}
            className={`flex-shrink-0 px-6 py-3 rounded-full font-bold transition-all ${
              selectedHub.id === hub.id 
                ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                : 'bg-white text-on-surface border border-surface-container hover:border-primary'
            }`}
          >
            {hub.name} Hub
          </button>
        ))}
      </div>

      {/* Hero */}
      <section className="relative rounded-3xl overflow-hidden shadow-ambient h-[250px] md:h-[350px] flex flex-col justify-end p-8 bg-surface-container-highest group">
        <div className="absolute inset-0">
          <img 
            src={selectedHub.heroImage} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            alt={selectedHub.name}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-on-surface via-on-surface/40 to-transparent opacity-80" />
        </div>
        <div className="relative z-10">
          <span className="bg-primary-container text-on-primary-container text-[10px] font-black uppercase px-3 py-1 rounded-full mb-3 inline-block shadow-sm">Featured Crop</span>
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">{selectedHub.name} Hub</h1>
          <p className="text-surface-container-low mt-2 max-w-md text-sm md:text-base">{selectedHub.tagline}</p>
        </div>
      </section>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Seeds */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-surface-container flex flex-col hover:shadow-ambient transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-on-surface">Premium Seeds</h2>
            <ICONS.Sprout className="text-secondary w-7 h-7" />
          </div>
          <div className="grid grid-cols-2 gap-4 flex-grow">
            {selectedHub.seeds.map((seed, i) => (
              <div key={i} className="flex flex-col group cursor-pointer">
                <div className="aspect-square rounded-2xl bg-surface-container overflow-hidden mb-2">
                  <img src={seed.img} alt={seed.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                </div>
                <span className="font-bold text-on-surface text-sm line-clamp-1">{seed.name}</span>
                <span className="text-secondary font-black text-xs">₹{seed.price}/unit</span>
              </div>
            ))}
          </div>
          <button className="mt-8 py-3 border-2 border-surface-container hover:border-primary text-on-surface font-bold rounded-2xl transition-all">View All Seeds</button>
        </div>

        {/* Nutrition */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-surface-container flex flex-col hover:shadow-ambient transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-on-surface">Targeted Nutrition</h2>
            <ICONS.Science className="text-secondary w-7 h-7" />
          </div>
          <div className="flex flex-col gap-3 flex-grow">
            {selectedHub.nutrition.map((item, i) => {
              const IconComp = getIcon(item.icon);
              return (
                <div key={i} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-surface-container transition-colors cursor-pointer group">
                  <div className="w-12 h-12 rounded-xl bg-secondary-container flex items-center justify-center text-on-secondary-container shadow-sm group-hover:scale-110 transition-transform">
                    <IconComp className="w-6 h-6" />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-bold text-on-surface text-sm uppercase tracking-tight line-clamp-1">{item.name}</h3>
                    <p className="text-[10px] text-on-surface-variant font-bold opacity-70 line-clamp-1">{item.desc}</p>
                  </div>
                  <ICONS.ChevronRight className="w-4 h-4 text-outline" />
                </div>
              );
            })}
          </div>
          <button className="mt-8 py-3 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary-container transition-all">Explore Fertilizers</button>
        </div>

        {/* Irrigation */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-surface-container flex flex-col hover:shadow-ambient transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-on-surface">Irrigation Tools</h2>
            <ICONS.Water className="text-secondary w-7 h-7" />
          </div>
          <div className="rounded-2xl bg-surface-container-high h-32 overflow-hidden mb-6 relative">
            <img src={selectedHub.irrigation.image} className="w-full h-full object-cover" alt="Irrigation" />
            <div className="absolute inset-0 bg-primary/20 mix-blend-overlay" />
          </div>
          <div className="flex flex-col gap-4 flex-grow">
            {selectedHub.irrigation.items.map((item, i) => (
              <div key={i} className="flex justify-between items-center border-b border-surface-container pb-2">
                <span className="text-sm font-bold opacity-80">{item.name}</span>
                <span className="text-sm font-black text-secondary">{item.price}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Advisory */}
      <section className="bg-primary-container/10 border border-primary/20 rounded-3xl p-8 relative overflow-hidden flex flex-col md:flex-row gap-8 items-center">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-md relative z-10 flex-shrink-0">
          <ICONS.Check className="w-10 h-10 text-primary" />
        </div>
        <div className="relative z-10 flex-grow">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Agronomy Alert</span>
            <div className="w-2 h-2 rounded-full bg-harvest animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-on-surface mb-2">{selectedHub.advisory.title}</h2>
          <p className="text-on-surface-variant max-w-3xl leading-relaxed">
            {selectedHub.advisory.description}
          </p>
          <button className="mt-6 flex items-center gap-2 bg-white text-primary font-bold px-6 py-2.5 rounded-full shadow-sm hover:bg-surface transition-colors">
            <ICONS.Chat className="w-4 h-4" /> Consult Specialist
          </button>
        </div>
      </section>
    </div>
  );
}
