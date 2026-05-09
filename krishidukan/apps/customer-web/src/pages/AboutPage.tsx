import { MapPin, Phone, MessageSquare, ArrowRight, Handshake, Zap, Sprout, Microscope } from 'lucide-react';
import { motion } from 'motion/react';

const stats = [
  { value: '500+', label: 'Local Stores' },
  { value: '10K+', label: 'Farmers Served' },
  { value: '25+', label: 'Districts Covered' },
  { value: '98%', label: 'Satisfaction Rate' },
];

const values = [
  { icon: Handshake, title: 'Local Trust', desc: 'We partner exclusively with verified, government-registered agricultural stores. Every seller is vetted to ensure quality and authenticity.' },
  { icon: Zap, title: 'Digital Efficiency', desc: 'From browsing to checkout to delivery tracking — every step is designed for the farmer on the go.' },
  { icon: Sprout, title: 'Farmer First', desc: 'Krishidukan was built by farmers, for farmers. Our pricing is transparent, our information is honest.' },
  { icon: Microscope, title: 'Quality Assured', desc: 'Every product listed passes our quality checks. We work with certified suppliers and display lab-verified data.' },
];

export function AboutPage() {
  return (
    <div className="flex flex-col gap-0">
      {/* Hero */}
      <section className="relative bg-primary overflow-hidden min-h-[360px] flex items-center">
        <div className="absolute inset-0 opacity-10">
          <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBcJewaf8J1gWZEdY6ipzy3p0M5aZoePmxCri9BSh7nbzy4FW-i7Azi-fBl6G0vr9TDZY9Q0XxD_GHq2_mJECmXU0oGsqJSZEnh1-5IRtoFi-mxGzKT9SHQH5HJW6wrhRD4Z98Wjo19TKEXGiIpyPXcFVZVvSuhCD9bXXV1kQRL_o0HNQ6-7KIySLLVdAddKSxPd14-jD0W8uG58KaJpjHYahRINJqJMRzG_CvOOiM2CGpIBu5yKjDn4P8gspnpRXThlkMm_JgsHX0L"
            className="w-full h-full object-cover" alt="" />
        </div>
        <div className="relative z-10 px-4 md:px-10 max-w-7xl mx-auto w-full py-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-white/60 text-xs font-black uppercase tracking-widest mb-4 block">Our Story</span>
            <h1 className="text-white text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-6 max-w-2xl">
              Bridging Farmers<br />with Modern Agri Retail
            </h1>
            <p className="text-white/80 text-lg md:text-xl max-w-xl leading-relaxed">
              Krishidukan was born from a simple idea — every farmer deserves transparent access to quality agricultural supplies at fair prices, right in their local area.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-surface-container">
        <div className="px-4 md:px-10 max-w-7xl mx-auto w-full py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="text-center">
                <div className="text-4xl md:text-5xl font-extrabold text-primary mb-1">{stat.value}</div>
                <div className="text-on-surface-variant font-semibold text-sm uppercase tracking-widest">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-surface-container-low border-y border-surface-container py-16">
        <div className="px-4 md:px-10 max-w-7xl mx-auto w-full">
          <div className="text-center mb-12">
            <span className="text-primary text-xs font-black uppercase tracking-widest mb-3 block">What We Stand For</span>
            <h2 className="text-4xl font-bold text-on-surface">Our Core Values</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((val, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                className="bg-white rounded-3xl p-8 shadow-sm border border-surface-container flex gap-6">
                <div className="bg-primary-container text-white p-4 rounded-2xl shadow-sm h-fit shrink-0">
                  <val.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-on-surface mb-3">{val.title}</h3>
                  <p className="text-on-surface-variant leading-relaxed">{val.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="bg-primary py-16">
        <div className="px-4 md:px-10 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">We'd Love to Hear from You</h2>
              <div className="flex flex-col gap-4">
                {[
                  { icon: Phone, label: 'Phone', value: '+91 98765 43210' },
                  { icon: MessageSquare, label: 'Email', value: 'support@krishidukan.in' },
                  { icon: MapPin, label: 'Office', value: 'Baner Road, Pune, Maharashtra — 411045' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3 text-white">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-black uppercase tracking-widest text-white/60 mb-0.5">{label}</div>
                      <div className="font-bold">{value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-3xl p-8 shadow-2xl">
              <h3 className="text-xl font-bold text-on-surface mb-6">Send us a Message</h3>
              <div className="flex flex-col gap-4">
                <input type="text" placeholder="Your name" className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-outline-variant text-sm focus:outline-none focus:border-primary" />
                <input type="email" placeholder="Email address" className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-outline-variant text-sm focus:outline-none focus:border-primary" />
                <textarea placeholder="Your message..." rows={4} className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-outline-variant text-sm focus:outline-none focus:border-primary resize-none" />
                <button className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary-container transition-colors flex items-center justify-center gap-2">
                  <ArrowRight className="w-4 h-4" /> Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
