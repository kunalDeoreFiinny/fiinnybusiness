import { Icons } from '../components/Icons';
import { motion } from 'motion/react';

export default function Technical() {
  return (
    <div className="flex flex-col relative py-24 px-8 max-w-7xl mx-auto gap-16 min-h-screen">
      {/* Background Mesh */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-secondary-container/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px]"></div>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center relative z-10">
        <div className="lg:col-span-7">
          <nav className="flex items-center gap-2 mb-6 text-[10px] sm:text-xs font-sans font-bold text-slate-400 uppercase tracking-widest">
            <span>Products</span>
            <Icons.ChevronRight className="w-3 h-3" />
            <span>Liquid Bio-Stimulants</span>
            <Icons.ChevronRight className="w-3 h-3" />
            <span className="text-primary truncate">Technical Data</span>
          </nav>
          <h1 className="font-sans text-[32px] md:text-5xl font-extrabold text-primary mb-6 leading-tight">
            Technical Specifications & Usage Protocol
          </h1>
          <p className="text-base md:text-lg text-on-surface-variant max-w-2xl font-serif">
            Discover the scientific foundation of Karan Arjun Power Plus™. This premium bio-stimulant is engineered for maximum bioavailability.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl font-sans font-bold text-sm shadow-sm border border-emerald-100">
              <Icons.ShieldCheck className="w-5 h-5" />
              ISO 9001:2015 Certified
            </div>
            <div className="flex items-center gap-2 bg-secondary-container/20 text-secondary px-4 py-2 rounded-xl font-sans font-bold text-sm shadow-sm border border-secondary-container/30">
              <Icons.Sprout className="w-5 h-5" />
              High Yield Formula
            </div>
            <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl font-sans font-bold text-sm w-full md:w-auto shadow-sm border border-primary/20">
              Manufactured by: Unimax Agri Bio-Technologies
            </div>
          </div>
        </div>
        <div className="lg:col-span-5 flex justify-center">
          <div className="relative group">
            <div className="absolute -inset-4 bg-secondary-container/20 blur-3xl rounded-full opacity-50 group-hover:opacity-70 transition-opacity"></div>
            <img 
              src="https://lh3.googleusercontent.com/aida/ADBb0uh-MZg5D1-5V9D0loV6lK5LfgRTFdYisWze5icfK-qxFKG7uMaxCSJBretim2Cf4okR41IG7-euGaf6dnDtZUKSXEmIRdhHPQgg736_ygq3eQtZ-gaIzMEQZH_z_ylGpQRIkkJxrlOR4a3dzHdcXMT6Kp8Y4E8mzZlffDu1U90JtrAu7MUigsmNSaMx0hYnjtXIHswffUKj8b6ILQuinyh1A-kiJvdJbSM7LEVGfB49IANGPaTWL800JCKFQTUDiB5gU-CrVK4l9IU" 
              className="relative z-10 w-full max-w-sm rounded-3xl shadow-2xl transition-transform duration-500 hover:scale-105" 
              alt="Power Plus"
            />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        <div className="glass-panel p-8 md:p-10 rounded-[2.5rem] flex flex-col gap-6 relative overflow-hidden group transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(10,25,19,0.12)]">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-700"></div>
          <div className="h-14 w-14 bg-white/60 backdrop-blur-md rounded-2xl flex items-center justify-center text-primary shadow-sm border border-white/40 group-hover:scale-110 transition-transform duration-500">
            <Icons.Sprout className="w-7 h-7" />
          </div>
          <div className="relative z-10">
            <h3 className="font-sans text-2xl font-extrabold text-primary mb-2">Active Composition</h3>
            <p className="text-sm text-on-surface-variant mb-8 font-serif">Proprietary blend using advanced extraction techniques.</p>
            <div className="space-y-6 font-sans text-sm">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-primary font-bold uppercase tracking-tight text-xs">Humates & Fulvates</span>
                  <span className="font-extrabold text-primary">22.0%</span>
                </div>
                <div className="h-2 w-full bg-surface-container-low rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} whileInView={{ width: '22%' }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.2 }} className="h-full bg-secondary-container rounded-full"></motion.div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-primary font-bold uppercase tracking-tight text-xs">pH Level (Alkaline)</span>
                  <span className="font-extrabold text-primary">9.0</span>
                </div>
                <div className="h-2 w-full bg-surface-container-low rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} whileInView={{ width: '64%' }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.4 }} className="h-full bg-primary/40 rounded-full"></motion.div>
                </div>
              </div>
              <div className="pt-4 border-t border-primary/10 flex justify-between items-center">
                <span className="text-primary/60 uppercase tracking-widest text-xs font-bold">Shelf Life</span>
                <span className="font-extrabold text-primary text-base bg-white/50 px-3 py-1 rounded-lg">3 Years</span>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 glass-panel p-8 md:p-10 rounded-[2.5rem] relative overflow-hidden group transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(10,25,19,0.12)]">
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary-container/10 rounded-full blur-3xl group-hover:bg-secondary-container/20 transition-colors duration-700"></div>
          <div className="flex items-center gap-5 mb-10 relative z-10">
            <div className="h-14 w-14 bg-white/60 backdrop-blur-md rounded-2xl flex items-center justify-center text-secondary-container shadow-sm border border-white/40 group-hover:rotate-12 transition-transform duration-500">
              <Icons.Truck className="w-7 h-7" />
            </div>
            <h3 className="font-sans text-2xl md:text-3xl font-extrabold text-primary">Usage Guidelines</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8 relative z-10">
            <div className="p-8 rounded-[2rem] bg-white/40 backdrop-blur-sm border border-white/60 shadow-sm hover:bg-white/60 transition-colors duration-300">
              <h4 className="font-sans font-extrabold text-primary mb-3 flex items-center gap-3 text-lg">
                <Icons.Droplets className="w-5 h-5 text-secondary-container" /> Soil Application
              </h4>
              <div className="text-4xl font-black text-primary my-4 tracking-tighter">3L <span className="text-sm text-primary/50 font-bold tracking-normal">/ hectare</span></div>
              <p className="text-sm text-on-surface-variant font-serif leading-relaxed">Applied seamlessly through drip irrigation or direct soil drenching.</p>
            </div>
            <div className="p-8 rounded-[2rem] bg-white/40 backdrop-blur-sm border border-white/60 shadow-sm hover:bg-white/60 transition-colors duration-300">
              <h4 className="font-sans font-extrabold text-primary mb-3 flex items-center gap-3 text-lg">
                <Icons.Sprout className="w-5 h-5 text-secondary-container" /> Foliar Spray
              </h4>
              <div className="text-4xl font-black text-primary my-4 tracking-tighter">1.5–2 <span className="text-sm text-primary/50 font-bold tracking-normal">ml / L</span></div>
              <p className="text-sm text-on-surface-variant font-serif leading-relaxed">Recommended for rapid nutrient uptake. Ensure complete leaf coverage.</p>
            </div>
          </div>
          <div className="p-6 md:p-8 bg-primary/5 rounded-[2rem] flex items-start gap-5 border border-primary/10 relative z-10 backdrop-blur-sm">
            <div className="bg-white p-2 rounded-xl shadow-sm">
              <Icons.Calendar className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-sans font-extrabold text-primary mb-2 text-lg">Strategic Timing</p>
              <p className="text-sm text-primary/80 font-serif leading-relaxed">
                Application is highly recommended during early morning <span className="font-sans font-bold text-primary">(6:00 AM – 9:00 AM)</span> or late evening <span className="font-sans font-bold text-primary">(5:00 PM – 7:00 PM)</span> to maximize absorption and avoid high-temperature stress.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Compatible Crops Section */}
      <section className="mt-8 glass-panel-dark p-10 md:p-14 rounded-[3rem] relative overflow-hidden group border border-white/10 shadow-2xl">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
        
        <h2 className="font-sans text-3xl font-extrabold text-white mb-10 text-center relative z-10 tracking-tight">Optimized for High-Value Crops</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
          {['Grapes', 'Onions', 'Bananas', 'Watermelons', 'Pulses', 'Vegetables', 'Pomegranates', 'Cotton'].map((crop) => (
            <div key={crop} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-colors hover:-translate-y-1 transform duration-300">
              <span className="font-sans font-bold text-white text-lg">{crop}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
