import { motion } from 'motion/react';
import { Icons } from '../components/Icons';

export default function Benefits() {
  const benefits = [
    {
      id: 'drought',
      title: 'Drought & Water Stress Tolerance',
      desc: 'Our advanced formulation helps crops survive and thrive during extended dry periods. By improving the plant\'s natural water retention capabilities, Power Plus™ ensures that your yield doesn\'t suffer even when water is scarce.',
      icon: Icons.Droplets,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    {
      id: 'quality',
      title: 'Premium Quality & Shine',
      desc: 'Power Plus™ directly influences the synthesis of natural pigments in the fruit. This results in significantly improved fruit color, a brilliant natural shine, and increased weight, helping you command premium prices in the market.',
      icon: Icons.Palette,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10'
    },
    {
      id: 'disease',
      title: 'Enhanced Disease Resistance',
      desc: 'By fortifying the cellular structure of the plant, our bio-stimulant naturally enhances the plant\'s immune system. This creates a robust defense mechanism against common agricultural diseases and fungal infections.',
      icon: Icons.ShieldCheck,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10'
    },
    {
      id: 'roots',
      title: 'Deep Root Development',
      desc: 'A healthy plant starts underground. Power Plus™ stimulates explosive root growth and significantly increases soil organic carbon. Deeper roots mean better nutrient absorption and stronger physical anchoring for the plant.',
      icon: Icons.Sprout,
      color: 'text-primary',
      bg: 'bg-primary/10'
    },
    {
      id: 'freshness',
      title: 'Extended Post-Harvest Freshness',
      desc: 'The benefits continue even after the harvest. Crops treated with Power Plus™ exhibit a much longer shelf life and maintain their post-harvest freshness, reducing spoilage and waste during transport and storage.',
      icon: Icons.Calendar,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10'
    },
    {
      id: 'sugar',
      title: 'Natural Sweetness & Sugar Content',
      desc: 'Crucial for high-value fruits like grapes and pomegranates, our formula naturally optimizes the sugar content (Brix levels) within the fruit. This guarantees a sweeter, more desirable product for the end consumer.',
      icon: Icons.Star,
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10'
    }
  ];

  return (
    <div className="flex flex-col relative py-24 px-8 max-w-7xl mx-auto min-h-screen">
      {/* Background Mesh */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-secondary-container/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px]"></div>
      </div>

      <header className="text-center mb-20 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/40 backdrop-blur-md rounded-full text-primary border border-white/60 mb-6 shadow-sm">
          <Icons.Leaf className="w-4 h-4" />
          <span className="font-sans font-bold text-xs uppercase tracking-widest">Scientific Advantages</span>
        </div>
        <h1 className="font-sans text-[40px] md:text-6xl font-extrabold mb-6 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary to-secondary">
          Why Farmers Choose<br />Power Plus™
        </h1>
        <p className="text-base md:text-xl text-on-surface-variant max-w-3xl mx-auto font-serif leading-relaxed">
          Our proprietary biostimulant formulation goes beyond basic nutrition. It fundamentally transforms how crops grow, resist stress, and yield profits.
        </p>
      </header>

      <div className="flex flex-col gap-12 md:gap-24 relative z-10 mb-24">
        {benefits.map((benefit, index) => {
          const isEven = index % 2 === 0;
          return (
            <motion.div 
              key={benefit.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-10 md:gap-16 group`}
            >
              {/* Graphic Side */}
              <div className="w-full md:w-1/2">
                <div className="glass-panel p-10 md:p-16 rounded-[3rem] relative overflow-hidden flex items-center justify-center min-h-[300px] transition-all duration-500 hover:shadow-[0_20px_50px_rgba(10,25,19,0.15)] hover:border-white/80 group-hover:-translate-y-2">
                  <div className={`absolute inset-0 ${benefit.bg} blur-3xl rounded-full opacity-50 group-hover:opacity-80 transition-opacity duration-700 transform scale-150`}></div>
                  <benefit.icon className={`w-32 h-32 md:w-48 md:h-48 ${benefit.color} relative z-10 drop-shadow-xl group-hover:scale-110 transition-transform duration-700`} />
                </div>
              </div>

              {/* Text Side */}
              <div className="w-full md:w-1/2 flex flex-col justify-center">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-md ${benefit.bg}`}>
                  <benefit.icon className={`w-8 h-8 ${benefit.color}`} />
                </div>
                <h2 className="font-sans text-3xl md:text-4xl font-extrabold text-primary mb-6 leading-tight">
                  {benefit.title}
                </h2>
                <p className="text-lg md:text-xl text-on-surface-variant font-serif leading-relaxed">
                  {benefit.desc}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* CTA Section */}
      <section className="glass-panel-dark rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden z-10 shadow-2xl">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-secondary-container/20 rounded-full blur-[100px] mix-blend-overlay pointer-events-none"></div>
        <h2 className="font-sans text-4xl md:text-5xl font-extrabold text-white mb-6 relative z-10">Experience the Power Plus™ Difference</h2>
        <p className="text-xl text-white/80 font-serif max-w-2xl mx-auto mb-10 relative z-10">
          Join the 75,800+ farmers who have already transformed their yield and market profitability.
        </p>
        <button className="bg-secondary-container text-on-secondary-container px-10 py-5 rounded-2xl font-sans font-bold text-lg hover:bg-white transition-colors inline-flex items-center gap-3 shadow-xl hover:-translate-y-1 transform relative z-10">
          <Icons.MessageCircle className="w-6 h-6" />
          <span>Order Now on WhatsApp</span>
        </button>
      </section>
    </div>
  );
}
