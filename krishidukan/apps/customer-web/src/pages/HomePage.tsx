import { useNavigate } from 'react-router-dom';
import { ArrowRight, Handshake, Zap, MapPin } from 'lucide-react';
import { PRODUCTS, CATEGORIES } from '../demoData';
import { useLocation } from '../LocationContext';
import { motion } from 'motion/react';

const CROP_ITEMS = [
  { id: 'fertilizers', name: 'Fertilizers', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSGbELbnV8HdsslJ8hy2mq0a_hvzZrr4cwUKHrze-GEeDpv0Z0VAvA62LryAUopIvuvGVeMWJJbVbRbtq1vKgcoaC4k3njelp3OPJb4_vjrijsdG-_1eEve_PojVdVNedf02IxptPKFjsUkGRH1oiP1H0007UHuQJ18mVTW7N6Vr0wdS7106fBV-qwwwXtBDWxaYcfvkouSyItxhdz24OL3GaUYJVj1YAyxMbObWYCQ7RpC1_QTpxN-wK8fDzDpx5JjUPaRwkLJq3m' },
  { id: 'seeds', name: 'Seeds', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGRxeg57dLoYXGSyDjQg4KIlhXhDoSLcH2TL8JTunYEXVl92RlHqTVRxoaRdOAkh3zaNzYyWA_A6fqz_nGVpYX89iPffRc3YZiMWnP3sK_95HetWGqVfdRImiWjILpEm4QSjNlbAjMj-OUvIStUKdMz3rJIgBpfZfwS_bvvqnp4MW5nmL3clqHayheyeb4JjIMAQ-gLUSD5MwF4wfv6V6n8zzhE4j4TuAAZTe6ghT4RN968zaDf-5pElvcbSJgD-qRjSWhoK-bxv2E' },
  { id: 'pesticides', name: 'Pesticides', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAqKjRa6JNKk1ATRrRh-34rnzxN5NuF1db88XkLpgwid9VCayDeG7-CfYbyq33aukNBgreqb0c5M1Int2-qanv5_m-SOu2lBMifHXZZH-RkGgsKGAFKGT4r5Nog_CeGGEI5cwu7us5a6k3pdYmXKuO71MT-e41ku3KL7OkdDlJTeQtkq8qzokwhrXf4vzscnmQVRktLp-RhAVdgE10R9kSDmAf-j8yl9-6ONkKTzkj3c4RrUIIUYJjM2l3q8EFdtQT0CPWTr3JIG98a' },
  { id: 'tools', name: 'Tools', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAi13WleIFmuHicYHUY0W-rwufSddyMDo6kb2AcbrntT8BejZDYLjTxaKtV_Y7mnIsnnZJB27-jLhcDJJ-INGrThJKx-ezn-v1eICtCBg9KvmrOIjxCzqye2mi_tIn2fzO64bWu8QByBgH2JQTivKMjxsEsgphoj0fCIMsFB7enUvlyLg-6IkDTTWxfnEszM37GZrGUGaIDzJCwiztMcbaYmVPS8EIuSqQY0ewtQb8oZbCMTLeltwk9U7G9_lPwLTyFLt5WcDAd8f1r' },
];

export function HomePage() {
  const navigate = useNavigate();
  const { location } = useLocation();

  return (
    <div className="flex flex-col gap-10 py-6 md:py-10">
      {/* Hero */}
      <section className="px-4 md:px-10 max-w-7xl mx-auto w-full">
        <div className="relative rounded-3xl overflow-hidden shadow-ambient min-h-[400px] flex flex-col justify-center p-8 md:p-12">
          <div className="absolute inset-0 z-0">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBcJewaf8J1gWZEdY6ipzy3p0M5aZoePmxCri9BSh7nbzy4FW-i7Azi-fBl6G0vr9TDZY9Q0XxD_GHq2_mJECmXU0oGsqJSZEnh1-5IRtoFi-mxGzKT9SHQH5HJW6wrhRD4Z98Wjo19TKEXGiIpyPXcFVZVvSuhCD9bXXV1kQRL_o0HNQ6-7KIySLLVdAddKSxPd14-jD0W8uG58KaJpjHYahRINJqJMRzG_CvOOiM2CGpIBu5yKjDn4P8gspnpRXThlkMm_JgsHX0L"
              className="w-full h-full object-cover" alt="Farm hero"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/40" />
          </div>
          <div className="relative z-10 max-w-2xl">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="text-white text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-4">
              Modern Produce,<br />Rooted Locally.
            </motion.h1>
            <p className="text-white/80 text-lg md:text-xl max-w-lg mb-8">
              Find the freshest harvest and agricultural supplies directly from local stores near {location.label}.
            </p>
            <button onClick={() => navigate('/market')}
              className="bg-white text-primary font-bold px-8 py-3 rounded-xl w-full sm:w-auto hover:bg-surface transition-colors flex items-center justify-center gap-2 shadow-xl max-w-xs">
              <ArrowRight className="w-5 h-5" /> Explore Products
            </button>
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      <section className="px-4 md:px-10 max-w-7xl mx-auto w-full">
        <h2 className="text-3xl font-bold text-on-surface mb-8">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {CROP_ITEMS.map((crop) => (
            <motion.button key={crop.id} whileHover={{ y: -5 }} onClick={() => navigate(`/market`)}
              className="group bg-surface-container-low rounded-3xl p-6 flex flex-col items-center gap-4 shadow-sm hover:shadow-ambient hover:bg-surface-container transition-all border border-transparent hover:border-outline-variant">
              <div className="w-20 h-20 rounded-full bg-white shadow-sm overflow-hidden border border-surface-container group-hover:scale-110 transition-transform">
                <img src={crop.image} alt={crop.name} className="w-full h-full object-cover" />
              </div>
              <span className="font-bold text-on-surface">{crop.name}</span>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Trending Products */}
      <section className="px-4 md:px-10 max-w-7xl mx-auto w-full py-10 bg-white shadow-sm border-y border-surface-container">
        <div className="flex justify-between items-end mb-8">
          <h2 className="text-3xl font-bold text-on-surface">Trending Products</h2>
          <button onClick={() => navigate('/market')} className="text-primary font-bold flex items-center gap-2 hover:translate-x-1 transition-transform">
            View All <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRODUCTS.slice(0, 4).map((product) => (
            <motion.div key={product.id} whileHover={{ y: -4 }}
              className="bg-surface rounded-3xl overflow-hidden shadow-ambient border border-surface-container flex flex-col group cursor-pointer"
              onClick={() => navigate(`/product/${product.id}`)}>
              <div className="h-48 relative overflow-hidden flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${product.imageColor}12, ${product.imageColor}28)` }}>
                <span style={{ fontSize: 64 }}>{product.emoji}</span>
                <div className="absolute top-4 left-4 bg-primary-container/90 text-on-primary-container backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                  {product.categoryLabel}
                </div>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-lg font-bold text-on-surface line-clamp-1 mb-1">{product.shortName}</h3>
                <p className="text-on-surface-variant text-sm mb-4 flex-1 line-clamp-2">{product.description}</p>
                <div className="flex gap-3">
                  <button className="flex-1 bg-surface-container-high text-on-surface font-bold py-2.5 rounded-xl hover:bg-surface-container transition-colors text-sm">Details</button>
                  <button className="flex-1 bg-primary text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 hover:bg-primary-container transition-colors text-sm">
                    + Add
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why Krishidukan */}
      <section className="px-4 md:px-10 max-w-7xl mx-auto w-full mb-10">
        <div className="bg-surface-container-low rounded-3xl p-8 md:p-16 flex flex-col md:flex-row gap-12 items-center">
          <div className="flex-1">
            <h2 className="text-4xl font-bold text-on-surface mb-6">Why Krishidukan?</h2>
            <p className="text-on-surface-variant text-lg mb-10">
              We bridge the gap between traditional agricultural values and contemporary digital efficiency, ensuring you get the best supplies right when you need them.
            </p>
            <div className="flex flex-col gap-8">
              {[
                { icon: Handshake, title: 'Local Trust', desc: 'Connect directly with verified sellers in your farming community.' },
                { icon: Zap, title: 'Digital Efficiency', desc: 'Fast, frictionless ordering and tracking designed for your device.' },
                { icon: MapPin, title: 'Near You', desc: `Showing stores and products available near ${location.label}.` },
              ].map((prop, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="bg-primary-container text-white p-3 rounded-2xl shadow-sm">
                    <prop.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-on-surface">{prop.title}</h4>
                    <p className="text-on-surface-variant">{prop.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 w-full relative">
            <div className="w-full max-w-md mx-auto relative z-10 hover:scale-105 transition-transform duration-500">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBcJewaf8J1gWZEdY6ipzy3p0M5aZoePmxCri9BSh7nbzy4FW-i7Azi-fBl6G0vr9TDZY9Q0XxD_GHq2_mJECmXU0oGsqJSZEnh1-5IRtoFi-mxGzKT9SHQH5HJW6wrhRD4Z98Wjo19TKEXGiIpyPXcFVZVvSuhCD9bXXV1kQRL_o0HNQ6-7KIySLLVdAddKSxPd14-jD0W8uG58KaJpjHYahRINJqJMRzG_CvOOiM2CGpIBu5yKjDn4P8gspnpRXThlkMm_JgsHX0L"
                alt="Farmer" className="w-full h-auto rounded-3xl object-cover shadow-ambient" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
