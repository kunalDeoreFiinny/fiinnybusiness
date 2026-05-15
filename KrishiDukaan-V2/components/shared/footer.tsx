"use client";

import { ICONS } from '../../app/constants';

type FooterProps = {
  onNavigate?: (view: 'home' | 'market' | 'hub' | 'map' | 'about') => void;
  onCategoryClick?: (categoryId: string) => void;
};

export default function Footer({ onNavigate, onCategoryClick }: FooterProps) {
  return (
    <footer className="bg-surface-container-low border-t border-surface-container mt-16">
      <div className="max-w-7xl mx-auto w-full px-4 md:px-10 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-2xl font-black text-primary mb-3">Krishidukan</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed mb-4">
              Connecting Indian farmers with verified retailers and trusted manufacturers.
            </p>
            <div className="flex items-center gap-2 text-xs text-on-surface-variant">
              <ICONS.Trust className="w-4 h-4 text-primary" />
              <span className="font-semibold">Genuine products. Direct from manufacturer.</span>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-black text-on-surface uppercase tracking-wider mb-4">
              Shop
            </h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'Pesticides', cat: 'pesticides' },
                { label: 'Fertilizers', cat: 'fertilizers' },
                { label: 'Bio-Stimulants', cat: 'fertilizers' },
                { label: 'Sprayers & Tools', cat: 'tools' },
                { label: 'Seeds', cat: 'seeds' },
                { label: 'View all products', cat: 'all' },
              ].map((c) => (
                <li key={c.label}>
                  <button
                    onClick={() => onCategoryClick?.(c.cat)}
                    className="text-on-surface-variant hover:text-primary transition-colors font-medium"
                  >
                    {c.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Useful links */}
          <div>
            <h4 className="text-sm font-black text-on-surface uppercase tracking-wider mb-4">
              Company
            </h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'About us', view: 'about' as const },
                { label: 'Stores', view: 'map' as const },
                { label: 'Crop hubs', view: 'hub' as const },
                { label: 'Become a retailer', view: 'hub' as const },
                { label: 'Contact', view: 'about' as const },
                { label: 'FAQs', view: 'about' as const },
              ].map((l) => (
                <li key={l.label}>
                  <button
                    onClick={() => onNavigate?.(l.view)}
                    className="text-on-surface-variant hover:text-primary transition-colors font-medium"
                  >
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact + app */}
          <div>
            <h4 className="text-sm font-black text-on-surface uppercase tracking-wider mb-4">
              Get in touch
            </h4>
            <div className="space-y-2 text-sm text-on-surface-variant">
              <p className="font-semibold text-on-surface">Karan Arjun Krushi Seva Kendra</p>
              <p>Chatrapati Shivaji Nagar, 132 KV</p>
              <p>Karjat, Ahilyanagar — 414402</p>
              <a href="tel:9307199040" className="block font-bold text-primary hover:underline">
                +91 93071 99040
              </a>
            </div>
            <div className="mt-5">
              <p className="text-[11px] font-black uppercase tracking-wider text-outline mb-2">
                Mobile App
              </p>
              <div className="flex gap-2">
                <span className="text-[10px] font-bold bg-on-surface text-white px-2.5 py-1.5 rounded-lg opacity-70">
                  Android — coming soon
                </span>
                <span className="text-[10px] font-bold bg-on-surface text-white px-2.5 py-1.5 rounded-lg opacity-70">
                  iOS — coming soon
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-surface-container flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] text-outline">
          <p>© {new Date().getFullYear()} Krishidukan. All rights reserved.</p>
          <div className="flex gap-4">
            <button className="hover:text-on-surface transition-colors font-semibold">Privacy</button>
            <button className="hover:text-on-surface transition-colors font-semibold">Terms</button>
            <button className="hover:text-on-surface transition-colors font-semibold">Cookies</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
