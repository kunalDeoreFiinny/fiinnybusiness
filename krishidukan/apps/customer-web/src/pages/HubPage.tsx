import { useNavigate } from 'react-router-dom';
import { Sprout, Microscope, Droplets, CheckCircle2, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';

export function HubPage() {
  const navigate = useNavigate();
  return (
    <div className="px-4 md:px-10 max-w-7xl mx-auto w-full py-8 flex flex-col gap-8">
      {/* Hero */}
      <section className="relative rounded-3xl overflow-hidden shadow-ambient h-[250px] md:h-[350px] flex flex-col justify-end p-8 bg-surface-container-highest group">
        <div className="absolute inset-0">
          <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCShWApLmd5orpbfCQ7ygmjWA2q0BgOL3TUTOio-WN0NkMwFg5_h-EH9g3y-w1-6oC0wSXQML-mnfg8yXuc01VGH-dCPmVLcuMxg5_efLEOzm28E4LyalAxJSZ9ovVXj4PGtDA34b_c-3e1eFFqWla8pryOHK4d2XXK0Asc7R2hgGkWwuz68m7DEvfIX02LRu5Yj0ZpYms9UGHBBd5DbaEwinBYuDXuGHpBgAHZUm6G3chxh-S-jrFLwLfPGmA-I1zal0Z0mbzLpPNo"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Hub" />
          <div className="absolute inset-0 bg-gradient-to-t from-on-surface via-on-surface/20 to-transparent opacity-80" />
        </div>
        <div className="relative z-10">
          <span className="bg-primary-container text-on-primary-container text-[10px] font-black uppercase px-3 py-1 rounded-full mb-3 inline-block shadow-sm">Crop Intelligence</span>
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">Agri Hub</h1>
          <p className="text-white/80 mt-2 max-w-md text-sm md:text-base">Everything required from seed selection to final harvest, curated for maximum yield.</p>
        </div>
      </section>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Seeds */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-surface-container flex flex-col hover:shadow-ambient transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-on-surface">Premium Seeds</h2>
            <Sprout className="text-secondary w-7 h-7" />
          </div>
          <div className="flex flex-col gap-3 flex-grow">
            {[
              { name: 'Hybrid Wheat F1', price: 250 },
              { name: 'BT Cotton Hybrid', price: 320 },
              { name: 'Tomato Hybrid', price: 180 },
            ].map((seed) => (
              <div key={seed.name} className="flex justify-between items-center border-b border-surface-container pb-2 last:border-0">
                <span className="text-sm font-bold text-on-surface opacity-80">{seed.name}</span>
                <span className="text-sm font-black text-secondary">₹{seed.price}/pkt</span>
              </div>
            ))}
          </div>
          <button onClick={() => navigate('/market')} className="mt-8 py-3 border-2 border-surface-container hover:border-primary text-on-surface font-bold rounded-2xl transition-all text-sm">View All Seeds</button>
        </div>

        {/* Nutrition */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-surface-container flex flex-col hover:shadow-ambient transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-on-surface">Targeted Nutrition</h2>
            <Microscope className="text-secondary w-7 h-7" />
          </div>
          <div className="flex flex-col gap-3 flex-grow">
            {[
              { name: 'PowerPlus Gold NPK', desc: 'Balanced for all crops', icon: Sprout },
              { name: 'Urea (Nitrogen Rich)', desc: 'For early growth stage', icon: Droplets },
              { name: 'PowerPlus Micro Boost', desc: 'Micronutrient complex', icon: Microscope },
            ].map((item) => (
              <div key={item.name} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-surface-container transition-colors cursor-pointer group" onClick={() => navigate('/market')}>
                <div className="w-10 h-10 rounded-xl bg-secondary-container flex items-center justify-center text-on-secondary-container shadow-sm group-hover:scale-110 transition-transform">
                  <item.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-on-surface text-sm">{item.name}</h3>
                  <p className="text-[10px] text-on-surface-variant font-bold opacity-70">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => navigate('/market')} className="mt-8 py-3 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary-container transition-all text-sm">Explore Fertilizers</button>
        </div>

        {/* Tools */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-surface-container flex flex-col hover:shadow-ambient transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-on-surface">Farm Tools</h2>
            <Droplets className="text-secondary w-7 h-7" />
          </div>
          <div className="flex flex-col gap-4 flex-grow">
            {[
              { name: 'Drip Tape (16mm)', price: '₹12/m' },
              { name: 'Micro Sprinklers', price: '₹45/pc' },
              { name: 'Pruning Shears', price: '₹450/set' },
              { name: 'Knapsack Sprayer', price: '₹1200' },
            ].map((tool) => (
              <div key={tool.name} className="flex justify-between items-center border-b border-surface-container pb-2 last:border-0">
                <span className="text-sm font-bold opacity-80">{tool.name}</span>
                <span className="text-sm font-black text-secondary">{tool.price}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Advisory */}
      <section className="bg-primary-container/10 border border-primary/20 rounded-3xl p-8 relative overflow-hidden flex flex-col md:flex-row gap-8 items-center">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-md relative z-10 shrink-0">
          <CheckCircle2 className="w-10 h-10 text-primary" />
        </div>
        <div className="relative z-10 flex-grow">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Agronomy Alert</span>
            <div className="w-2 h-2 rounded-full bg-harvest animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-on-surface mb-2">Preventing Blossom End Rot</h2>
          <p className="text-on-surface-variant max-w-3xl leading-relaxed text-sm">
            Inconsistent watering leads to calcium deficiency. Ensure steady moisture using drip irrigation, especially during rapid fruit expansion. Apply calcium-rich foliar spray if symptoms appear early.
          </p>
          <button className="mt-6 flex items-center gap-2 bg-white text-primary font-bold px-6 py-2.5 rounded-full shadow-sm hover:bg-surface transition-colors text-sm">
            <MessageSquare className="w-4 h-4" /> Consult Specialist
          </button>
        </div>
      </section>
    </div>
  );
}
