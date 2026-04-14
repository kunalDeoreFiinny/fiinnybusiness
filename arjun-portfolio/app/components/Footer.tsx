"use client";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="py-20 relative bg-[hsl(var(--bg-base))] border-t border-[hsl(var(--border-subtle))]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-start justify-between gap-12">
          
          {/* Brand Column */}
          <div className="max-w-xs">
            <div className="text-2xl font-bold tracking-tighter mb-4 italic">
              Arjun<span className="text-[hsl(var(--primary))] not-italic">.</span>
            </div>
            <p className="text-sm text-[hsl(var(--text-muted))] leading-relaxed">
              Synthesizing engineering rigor with product intuition to build the next generation of financial systems.
            </p>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 lg:gap-24">
            <div className="space-y-4">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--primary))]">Navigation</div>
              <ul className="space-y-2">
                <li><a href="#about" className="text-sm text-[hsl(var(--text-secondary))] hover:text-white transition-colors">Identity</a></li>
                <li><a href="#fiinny" className="text-sm text-[hsl(var(--text-secondary))] hover:text-white transition-colors">Venture</a></li>
                <li><a href="#work" className="text-sm text-[hsl(var(--text-secondary))] hover:text-white transition-colors">Archive</a></li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--primary))]">Connect</div>
              <ul className="space-y-2">
                <li><a href="https://linkedin.com/in/arjuntanpure" target="_blank" className="text-sm text-[hsl(var(--text-secondary))] hover:text-white transition-colors">LinkedIn</a></li>
                <li><a href="https://twitter.com/arjuntanpure" target="_blank" className="text-sm text-[hsl(var(--text-secondary))] hover:text-white transition-colors">X / Twitter</a></li>
                <li><a href="mailto:arjun@fiinny.com" className="text-sm text-[hsl(var(--text-secondary))] hover:text-white transition-colors">Email</a></li>
              </ul>
            </div>

            <div className="space-y-4 hidden sm:block">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--primary))]">Status</div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--primary))] animate-pulse" />
                <span className="text-sm text-[hsl(var(--text-secondary))]">Available for strategy</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-20 pt-8 border-t border-[hsl(var(--border-subtle))] flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-[10px] text-[hsl(var(--text-muted))] uppercase tracking-widest font-bold">
            © {currentYear} ARJUN TANPURE / SYSTEMS & PRODUCT
          </div>
          <div className="text-[10px] text-[hsl(var(--text-muted))] uppercase tracking-widest font-bold italic">
            Built from first principles.
          </div>
        </div>
      </div>
    </footer>
  );
}
