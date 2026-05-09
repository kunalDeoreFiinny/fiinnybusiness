import { ICONS } from '../constants';
import { motion } from 'motion/react';

export default function HubView() {
  return (
    <div className="px-4 md:px-10 max-w-7xl mx-auto w-full py-8 flex flex-col gap-8">
      {/* Hero */}
      <section className="relative rounded-3xl overflow-hidden shadow-ambient h-[250px] md:h-[350px] flex flex-col justify-end p-8 bg-surface-container-highest group">
        <div className="absolute inset-0">
          <img 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCShWApLmd5orpbfCQ7ygmjWA2q0BgOL3TUTOio-WN0NkMwFg5_h-EH9g3y-w1-6oC0wSXQML-mnfg8yXuc01VGH-dCPmVLcuMxg5_efLEOzm28E4LyalAxJSZ9ovVXj4PGtDA34b_c-3e1eFFqWla8pryOHK4d2XXK0Asc7R2hgGkWwuz68m7DEvfIX02LRu5Yj0ZpYms9UGHBBd5DbaEwinBYuDXuGHpBgAHZUm6G3chxh-S-jrFLwLfPGmA-I1zal0Z0mbzLpPNo" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            alt="Watermelon Patch"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-on-surface via-on-surface/20 to-transparent opacity-80" />
        </div>
        <div className="relative z-10">
          <span className="bg-primary-container text-on-primary-container text-[10px] font-black uppercase px-3 py-1 rounded-full mb-3 inline-block shadow-sm">Featured Crop</span>
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">Watermelon Hub</h1>
          <p className="text-surface-container-low mt-2 max-w-md text-sm md:text-base">Everything required from seed selection to final harvest, curated for maximum yield.</p>
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
            {[
              { name: 'Sugar Baby', price: 250, img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuByv4cPqlB1KYhELYjTmiYEkyUvKp9WVaye2AODgv8iz0zWp-dBoAq4amESYk6lY1LvA9UYb2sVqE6F91lDwmCSWOC86XN8a2C4BjFSsLROvs0SE1MMZLxfMkAfQUDpEBPBHIwHPFGEsrKqWrf2x_MDsMCo3kKhfkoeClw8BmDJOXClpDykV6mx-8Eqktiha67i1uMyfEzJ-maCYo7liILE2i8yqsNNEbYFCZ4sBGfLOasGGPaRcwV1iRU4SNm2L0mzt9_Vzx_1oSfK' },
              { name: 'Crimson Sweet', price: 320, img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDGOZSSmJZMe-qD1ddCjtTcp42wfTX39VBNKc5WtmDLBN_N82GHsodDhXq1rdQvlKHr2V1nhFgVqPUBVUGIp7xsYjIAMsaXEzp5oCyak9OKS5lqJ9zrYp5xgel1A-6521qAFPnRyVA_Ytl2z90ecemCa7Svu89jK9shsRM10x7I7UhUo49VdO3MkI3bU4ZF_kkjVgl9LC2ImV42HWPpue3rpWgOo3z03srbeZWuGZV-LMLrXSmC0d-ccBzSObVA_lwaVoGF-4e9r3Zf' }
            ].map((seed, i) => (
              <div key={i} className="flex flex-col group cursor-pointer">
                <div className="aspect-square rounded-2xl bg-surface-container overflow-hidden mb-2">
                  <img src={seed.img} alt={seed.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                </div>
                <span className="font-bold text-on-surface text-sm">{seed.name}</span>
                <span className="text-secondary font-black text-xs">₹{seed.price}/pkt</span>
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
            {[
              { name: 'Urea (Nitrogen Rich)', desc: 'For early vine growth', icon: ICONS.Water },
              { name: 'NPK 19:19:19', desc: 'Balanced flowering stage', icon: ICONS.Sprout }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-surface-container transition-colors cursor-pointer group">
                <div className="w-12 h-12 rounded-xl bg-secondary-container flex items-center justify-center text-on-secondary-container shadow-sm group-hover:scale-110 transition-transform">
                  <item.icon className="w-6 h-6" />
                </div>
                <div className="flex-grow">
                  <h3 className="font-bold text-on-surface text-sm uppercase tracking-tight">{item.name}</h3>
                  <p className="text-[10px] text-on-surface-variant font-bold opacity-70">{item.desc}</p>
                </div>
                <ICONS.ChevronRight className="w-4 h-4 text-outline" />
              </div>
            ))}
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
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCHM1kISdBgIMrknFsWdRp0svPPesWg7V_hAQUsj40ogBH_6B38JcIvOIjAeG1jXx3nM6VQPvL6foRHmsrU8VS6Z7IKidreaDh7fKyR0qsFlE6qmhpilDz23-TobHDV41BTLCN6Au8hM0JIXxubnfiKNGQqMeR3f8POsHcHQE-qBHwBdmPBeTycSeE30DuYdwfJs_E9kjNZc-zxQs-MPZrPZ1YOKkfETfixtuBk-6zSwDLt_LSl3NuD4NA_rl3fsqNS5qH7cMqCpC_P" className="w-full h-full object-cover" alt="Irrigation" />
            <div className="absolute inset-0 bg-primary/20 mix-blend-overlay" />
          </div>
          <div className="flex flex-col gap-4 flex-grow">
            <div className="flex justify-between items-center border-b border-surface-container pb-2">
              <span className="text-sm font-bold opacity-80">Drip Tape (16mm)</span>
              <span className="text-sm font-black text-secondary">₹12/m</span>
            </div>
            <div className="flex justify-between items-center border-b border-surface-container pb-2">
              <span className="text-sm font-bold opacity-80">Micro Sprinklers</span>
              <span className="text-sm font-black text-secondary">₹45/pc</span>
            </div>
          </div>
        </div>
      </div>

      {/* Advisory */}
      <section className="bg-primary-container/10 border border-primary/20 rounded-3xl p-8 relative overflow-hidden flex flex-col md:flex-row gap-8 items-center">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-md relative z-10">
          <ICONS.Check className="w-10 h-10 text-primary" />
        </div>
        <div className="relative z-10 flex-grow">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Agronomy Alert</span>
            <div className="w-2 h-2 rounded-full bg-harvest animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-on-surface mb-2">Preventing Blossom End Rot</h2>
          <p className="text-on-surface-variant max-w-3xl leading-relaxed">
            Inconsistent watering leads to calcium deficiency, causing black sunken spots on the fruit's bottom. Ensure a steady moisture level using drip irrigation, especially during rapid fruit expansion. Apply a calcium-rich foliar spray if symptoms appear early.
          </p>
          <button className="mt-6 flex items-center gap-2 bg-white text-primary font-bold px-6 py-2.5 rounded-full shadow-sm hover:bg-surface transition-colors">
            <ICONS.Chat className="w-4 h-4" /> Consult Specialist
          </button>
        </div>
      </section>
    </div>
  );
}
