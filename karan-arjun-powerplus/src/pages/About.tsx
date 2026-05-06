import { Icons } from '../components/Icons';
import { initialAbout } from '../data/mockData';

export default function About() {
  return (
    <div className="flex flex-col py-24 px-8 max-w-5xl mx-auto gap-12 min-h-screen relative">
      <header className="mb-8 relative z-10 text-center max-w-3xl mx-auto">
        <h1 className="font-sans text-[32px] md:text-5xl font-extrabold text-primary mb-4 leading-tight tracking-tight">About Us</h1>
        <p className="text-lg md:text-xl text-on-surface-variant font-serif">
          {initialAbout.tagline}
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
        {/* Main Details */}
        <div className="glass-panel rounded-[2.5rem] p-10 border border-slate-100 shadow-sm flex flex-col gap-8 hover:shadow-lg transition-shadow">
          <div>
            <div className="flex items-center gap-3 mb-3 text-secondary-container">
              <Icons.ShieldCheck className="w-6 h-6" />
              <h2 className="font-sans text-xl font-bold text-primary">Manufacturing</h2>
            </div>
            <p className="font-serif text-on-surface-variant leading-relaxed">
              Karan Arjun Power Plus™ is proudly manufactured by <strong className="font-sans text-primary">{initialAbout.manufacturer}</strong>. We are dedicated to providing premium liquid bio-stimulants for maximum crop yield.
            </p>
          </div>
          
          <div className="pt-8 border-t border-slate-100">
            <div className="flex items-center gap-3 mb-3 text-secondary-container">
              <Icons.Star className="w-6 h-6" />
              <h2 className="font-sans text-xl font-bold text-primary">Quality Assurance</h2>
            </div>
            <p className="font-serif text-on-surface-variant leading-relaxed">
              We operate under strict quality control standards. Our production facilities hold the <strong className="font-sans text-primary">{initialAbout.certification}</strong> certification, ensuring consistency and safety for our trusted 75,800+ farmers.
            </p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="glass-panel-dark rounded-[2.5rem] p-10 border border-white/10 shadow-xl flex flex-col justify-center gap-8 text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary-container/10 rounded-full blur-3xl pointer-events-none group-hover:bg-secondary-container/20 transition-colors duration-700"></div>
          
          <h2 className="font-sans text-2xl font-bold tracking-tight mb-2">Get in Touch</h2>
          
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
              <Icons.MapPin className="w-6 h-6 text-secondary-container" />
            </div>
            <div>
              <span className="block font-sans font-bold text-sm text-white/50 uppercase tracking-widest mb-1">Headquarters</span>
              <span className="font-serif text-white/90 leading-relaxed block max-w-xs">{initialAbout.location}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
              <Icons.Phone className="w-6 h-6 text-secondary-container" />
            </div>
            <div>
              <span className="block font-sans font-bold text-sm text-white/50 uppercase tracking-widest mb-1">Direct Support</span>
              <span className="font-sans font-bold text-xl text-white">{initialAbout.phone}</span>
            </div>
          </div>
          
          <a 
            href={`https://wa.me/${initialAbout.phone.replace(/[^0-9]/g, '')}`} 
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 bg-secondary-container text-on-secondary-container px-6 py-4 rounded-xl font-sans font-bold text-center hover:bg-secondary transition-colors flex justify-center items-center gap-2"
          >
            <Icons.MessageCircle className="w-5 h-5" />
            Contact via WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
