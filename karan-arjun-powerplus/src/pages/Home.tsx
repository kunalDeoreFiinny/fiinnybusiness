import { motion } from 'motion/react';
import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Icons } from '../components/Icons';
import { initialHomeVideos } from '../data/mockData';
import { db } from '../lib/firebase';

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((item) => String(item ?? '').trim())
    .filter(Boolean);
}

function toYouTubeEmbedUrl(url: string) {
  const trimmed = url.trim();
  const shortsMatch = trimmed.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{6,})/);
  if (shortsMatch) {
    return `https://www.youtube.com/embed/${shortsMatch[1]}`;
  }
  const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{6,})/);
  if (watchMatch) {
    return `https://www.youtube.com/embed/${watchMatch[1]}`;
  }
  const shortLinkMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/);
  if (shortLinkMatch) {
    return `https://www.youtube.com/embed/${shortLinkMatch[1]}`;
  }
  return '';
}

export default function Home() {
  const [homeVideos, setHomeVideos] = useState<string[]>(initialHomeVideos);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'homepage'), (snapshot) => {
      if (!snapshot.exists()) {
        setHomeVideos(initialHomeVideos);
        return;
      }
      const data = snapshot.data();
      setHomeVideos(toStringArray(data.videos));
    });

    return () => unsubscribe();
  }, []);

  const embedVideos = homeVideos
    .map((video) => ({
      sourceUrl: video,
      embedUrl: toYouTubeEmbedUrl(video),
    }))
    .filter((video) => video.embedUrl.length > 0);

  return (
    <div className="flex flex-col relative">
      {/* Global Animated Background Mesh */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent opacity-60"></div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-0 overflow-hidden text-center z-10">
        {/* Floating Accents */}
        <div className="absolute top-32 left-[15%] z-10 transform -rotate-12 animate-bounce">
          <Icons.Sprout className="w-12 h-12 text-emerald-500 opacity-40" />
        </div>
        <div className="absolute top-48 right-[15%] z-10 transform rotate-12 animate-pulse">
          <Icons.Grape className="w-12 h-12 text-violet-500 opacity-40" />
        </div>
        <div className="absolute top-24 right-[28%] z-10 transform -rotate-6 animate-pulse hidden md:block">
          <Icons.Apple className="w-12 h-12 text-rose-500 opacity-40" />
        </div>
        <div className="absolute top-64 left-[28%] z-10 transform rotate-6 animate-bounce hidden lg:block">
          <Icons.Cherry className="w-12 h-12 text-fuchsia-500 opacity-40" />
        </div>
        <div className="absolute top-40 left-[6%] z-10 transform -rotate-12 animate-pulse hidden xl:block">
          <Icons.Carrot className="w-12 h-12 text-orange-500 opacity-40" />
        </div>
        <div className="absolute top-20 left-[40%] z-10 transform rotate-6 animate-bounce hidden md:block">
          <Icons.Citrus className="w-12 h-12 text-yellow-400 opacity-45" />
        </div>
        <div className="absolute top-52 right-[6%] z-10 transform -rotate-12 animate-pulse hidden lg:block">
          <Icons.Salad className="w-12 h-12 text-green-500 opacity-40" />
        </div>
        <div className="absolute top-72 right-[32%] z-10 transform rotate-12 animate-bounce hidden xl:block">
          <Icons.Wheat className="w-12 h-12 text-amber-500 opacity-40" />
        </div>
        <div className="absolute top-[22rem] left-[12%] z-10 transform -rotate-6 animate-pulse hidden lg:block">
          <Icons.Vegan className="w-12 h-12 text-teal-500 opacity-40" />
        </div>

        <div className="max-w-7xl mx-auto px-8 relative z-20">
          <p className="font-sans text-primary-container mb-4 italic font-bold tracking-widest uppercase text-sm">
            "नातं विश्वासचं, एक पाऊल आधुनिकतेचं"
          </p>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-sans text-[28px] md:text-[52px] font-extrabold leading-tight mb-8 md:mb-12 uppercase tracking-tight max-w-4xl mx-auto text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary to-secondary"
          >
            Trust with tradition, <br className="hidden md:block"/> one step toward modernity.
          </motion.h1>
          
          <div className="relative w-full max-w-5xl mx-auto mt-40 md:mt-48 flex justify-center items-end h-[300px] md:h-[500px]">
            {/* Modern Premium Arch Background */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[140%] md:w-[110%] aspect-[2/1] bg-gradient-to-t from-primary to-primary-container rounded-t-full shadow-[0_-20px_50px_rgba(10,25,19,0.2)] border-t border-white/10 -z-10 overflow-hidden">
              {/* Subtle static inner glow to prevent flickering */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[60%] bg-white/10 blur-[80px] rounded-full"></div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60%] h-[80%] bg-secondary-container/20 blur-[100px] rounded-full"></div>
            </div>
            
            {/* Tilted Trees Behind Arch */}
            <motion.img 
              initial={{ opacity: 0, x: -50, rotate: -20 }}
              animate={{ 
                opacity: 1, 
                x: window.innerWidth < 768 ? -140 : -320, 
                rotate: -12,
                scale: window.innerWidth < 768 ? 0.7 : 1.1
              }}
              transition={{ duration: 1, delay: 0.2 }}
              src="/orangeimage.png"
              className="absolute bottom-16 md:bottom-28 left-1/2 -translate-x-1/2 h-[320px] md:h-[480px] -z-20 object-contain drop-shadow-xl origin-bottom"
              alt="Orange Tree"
            />
            <motion.img 
              initial={{ opacity: 0, x: 50, rotate: 20 }}
              animate={{ 
                opacity: 1, 
                x: window.innerWidth < 768 ? 140 : 320, 
                rotate: 12,
                scale: window.innerWidth < 768 ? 0.7 : 1.1
              }}
              transition={{ duration: 1, delay: 0.3 }}
              src="/cherryimage.png"
              className="absolute bottom-16 md:bottom-28 left-1/2 -translate-x-1/2 h-[320px] md:h-[480px] -z-20 object-contain drop-shadow-xl origin-bottom"
              alt="Cherry Tree"
            />
            
            {/* Products Group */}
            <div className="relative flex items-end justify-center w-full h-full pb-8 z-20 -space-x-8 md:-space-x-16 overflow-visible">
              <motion.img 
                whileHover={{ scale: 1.05 }}
                src="/bottle-1l-Photoroom.png" 
                className="h-[50%] md:h-[70%] object-contain rotate-12 drop-shadow-2xl z-10" 
                alt="Power Plus 1L"
              />
              <motion.img 
                whileHover={{ scale: 1.05 }}
                src="/bottle-5l-Photoroom.png" 
                className="h-[70%] md:h-[90%] object-contain z-20 drop-shadow-2xl" 
                alt="Power Plus 5L"
              />
              <motion.img 
                whileHover={{ scale: 1.05 }}
                src="/bottle-3l-Photoroom.png" 
                className="h-[50%] md:h-[70%] object-contain -rotate-12 drop-shadow-2xl z-10" 
                alt="Power Plus 3L"
              />
            </div>
            
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 w-full px-4 flex flex-col items-center">
              <button className="w-full sm:w-auto bg-secondary-container text-on-secondary-container px-12 py-4 rounded-full font-sans font-bold hover:bg-secondary-fixed transition-all shadow-xl uppercase tracking-widest text-sm mb-4">
                Shop Now
              </button>
              <div className="glass-panel px-6 py-2 rounded-full inline-flex items-center gap-3">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 border-2 border-white flex items-center justify-center"><Icons.User className="w-4 h-4 text-primary" /></div>
                  <div className="w-8 h-8 rounded-full bg-secondary-container/50 border-2 border-white flex items-center justify-center"><Icons.User className="w-4 h-4 text-primary" /></div>
                  <div className="w-8 h-8 rounded-full bg-tertiary-container/50 border-2 border-white flex items-center justify-center"><Icons.User className="w-4 h-4 text-primary" /></div>
                </div>
                <span className="font-sans font-bold text-sm text-primary">Trusted by 75,800+ Farmers</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {embedVideos.length > 0 && (
        <section className="py-20 relative z-10">
          <div className="max-w-7xl mx-auto px-8">
            <div className="text-center mb-10">
              <h2 className="font-sans text-3xl md:text-4xl font-extrabold text-primary mb-3 tracking-tight">Power Plus Videos</h2>
              <p className="text-on-surface-variant max-w-2xl mx-auto text-base md:text-lg">
                Watch real short videos and field updates from Power Plus.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {embedVideos.map((video) => (
                <article key={video.sourceUrl} className="glass-panel rounded-[2rem] p-4 border border-slate-100 shadow-sm">
                  <div className="aspect-[9/16] rounded-2xl overflow-hidden bg-black">
                    <iframe
                      src={video.embedUrl}
                      title={`Power Plus video ${video.sourceUrl}`}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Benefits Bento */}
      <section className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-8 relative">
          <div className="text-center mb-20">
            <h2 className="font-sans text-4xl md:text-5xl font-extrabold text-primary mb-6 tracking-tight">Scientific Precision,<br/> Natural Growth</h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto text-lg">Our formulation addresses the most critical challenges in modern farming.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-auto">
            {/* Benefit 1 */}
            <div className="md:col-span-8 glass-panel rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden group flex flex-col justify-end min-h-[350px] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(10,25,19,0.12)] hover:border-white/60">
              <img
                src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1400&q=80"
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover scale-125 opacity-[0.34] pointer-events-none"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-white/42 via-white/28 to-white/52 pointer-events-none" />
              <div className="absolute top-6 right-6 md:top-10 md:right-10 w-16 h-16 md:w-20 md:h-20 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg z-10 text-primary group-hover:scale-110 transition-transform duration-500">
                <Icons.Droplets className="w-8 h-8 md:w-10 md:h-10" />
              </div>
              <div className="z-10 relative max-w-lg">
                <h3 className="font-sans text-2xl md:text-3xl font-extrabold text-primary mb-3">Drought Tolerance</h3>
                <p className="text-on-surface-variant text-base md:text-lg leading-relaxed">Advanced water-retention technology helps crops survive and thrive during extended dry periods and water stress.</p>
              </div>
              <div className="absolute -bottom-20 -right-20 w-[500px] h-[500px] bg-primary-container/10 rounded-full blur-3xl group-hover:bg-primary-container/20 transition-colors duration-700"></div>
            </div>
            
            {/* Benefit 2 */}
            <div className="md:col-span-4 glass-panel rounded-[2.5rem] p-8 md:p-10 flex flex-col relative overflow-hidden min-h-[250px] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(10,25,19,0.12)] hover:border-white/60 group">
              <img
                src="https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=1200&q=80"
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover scale-125 opacity-[0.34] pointer-events-none"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-white/42 via-white/28 to-white/52 pointer-events-none" />
              <div className="w-14 h-14 md:w-16 md:h-16 bg-white/80 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg mb-6 text-primary group-hover:rotate-12 transition-transform duration-500 relative z-10">
                <Icons.Palette className="w-7 h-7 md:w-8 md:h-8" />
              </div>
              <h3 className="font-sans text-xl md:text-2xl font-extrabold text-primary mb-3 relative z-10">Premium Quality</h3>
              <p className="text-on-surface-variant text-base relative z-10">Improves fruit color, shine, and weight for premium market pricing.</p>
            </div>
            
            {/* Benefit 3 */}
            <div className="md:col-span-4 glass-panel rounded-[2.5rem] p-8 md:p-10 flex flex-col relative overflow-hidden min-h-[250px] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(10,25,19,0.12)] hover:border-white/60 group">
              <img
                src="https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=1200&q=80"
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover scale-125 opacity-[0.34] pointer-events-none"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-white/42 via-white/28 to-white/52 pointer-events-none" />
              <div className="w-14 h-14 md:w-16 md:h-16 bg-white/80 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg mb-6 text-primary group-hover:-rotate-12 transition-transform duration-500 relative z-10">
                <Icons.ShieldCheck className="w-7 h-7 md:w-8 md:h-8" />
              </div>
              <h3 className="font-sans text-xl md:text-2xl font-extrabold text-primary mb-3 relative z-10">Disease Resistance</h3>
              <p className="text-on-surface-variant text-base relative z-10">Enhanced immunity against common diseases and fungal infections.</p>
            </div>

            {/* Benefit 4 */}
            <div className="md:col-span-4 glass-panel rounded-[2.5rem] p-8 md:p-10 flex flex-col relative overflow-hidden min-h-[250px] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(10,25,19,0.12)] hover:border-white/60 group">
              <img
                src="https://images.unsplash.com/photo-1461354464878-ad92f492a5a0?auto=format&fit=crop&w=1200&q=80"
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover scale-125 opacity-[0.34] pointer-events-none"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-white/42 via-white/28 to-white/52 pointer-events-none" />
              <div className="w-14 h-14 md:w-16 md:h-16 bg-white/80 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg mb-6 text-primary group-hover:rotate-12 transition-transform duration-500 relative z-10">
                <Icons.Sprout className="w-7 h-7 md:w-8 md:h-8" />
              </div>
              <h3 className="font-sans text-xl md:text-2xl font-extrabold text-primary mb-3 relative z-10">Root Development</h3>
              <p className="text-on-surface-variant text-base relative z-10">Stimulates deep root growth and increases soil organic carbon.</p>
            </div>

            {/* Benefit 5 */}
            <div className="md:col-span-4 glass-panel rounded-[2.5rem] p-8 md:p-10 flex flex-col relative overflow-hidden min-h-[250px] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(10,25,19,0.12)] hover:border-white/60 group">
              <img
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80"
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover scale-125 opacity-[0.34] pointer-events-none"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-white/42 via-white/28 to-white/52 pointer-events-none" />
              <div className="w-14 h-14 md:w-16 md:h-16 bg-white/80 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg mb-6 text-primary group-hover:-rotate-12 transition-transform duration-500 relative z-10">
                <Icons.Calendar className="w-7 h-7 md:w-8 md:h-8" />
              </div>
              <h3 className="font-sans text-xl md:text-2xl font-extrabold text-primary mb-3 relative z-10">Extended Freshness</h3>
              <p className="text-on-surface-variant text-base relative z-10">Increases post-harvest fruit freshness and overall shelf life.</p>
            </div>

            {/* Benefit 6 (CTA Block) */}
            <div className="md:col-span-12 glass-panel-dark rounded-[2.5rem] p-10 md:p-12 text-white flex items-center justify-between overflow-hidden relative group transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(10,25,19,0.3)] hover:border-secondary/30 mt-4">
              <div className="z-10 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-secondary-container border border-white/10 mb-6">
                  <Icons.Star className="w-4 h-4" />
                  <span className="font-sans font-bold text-xs uppercase tracking-widest">Natural Sugar Content</span>
                </div>
                <h3 className="font-sans text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight">Ready to Transform Your Yield?</h3>
                <p className="text-white/80 mb-8 font-serif text-lg">Join 75,800+ successful farmers who have upgraded to Power Plus™ and seen massive improvements in sweetness and quality.</p>
                <button className="bg-secondary-container text-on-secondary-container px-8 py-4 rounded-xl font-sans font-bold hover:bg-white transition-colors inline-flex items-center space-x-2 shadow-xl">
                  <span>Get a Free Consultation</span>
                  <Icons.ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl mix-blend-overlay"></div>
              <Icons.Sprout className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 w-80 h-80 text-white/5 group-hover:rotate-12 transition-transform duration-700" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
