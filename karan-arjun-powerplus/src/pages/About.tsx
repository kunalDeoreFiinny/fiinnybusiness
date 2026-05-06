import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Icons } from '../components/Icons';
import { initialAbout, type AboutInfo } from '../data/mockData';
import { db } from '../lib/firebase';

export default function About() {
  const [about, setAbout] = useState<AboutInfo>(initialAbout);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'company'), (snapshot) => {
      if (!snapshot.exists()) {
        setAbout(initialAbout);
        return;
      }
      const data = snapshot.data();
      setAbout({
        tagline: String(data.tagline ?? initialAbout.tagline),
        manufacturer: String(data.manufacturer ?? initialAbout.manufacturer),
        location: String(data.location ?? initialAbout.location),
        phone: String(data.phone ?? initialAbout.phone),
        certification: String(data.certification ?? initialAbout.certification),
      });
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="flex flex-col py-24 px-8 max-w-4xl mx-auto gap-8 min-h-screen">
      <header className="text-center max-w-3xl mx-auto">
        <h1 className="font-sans text-[32px] md:text-5xl font-extrabold text-primary mb-4 leading-tight">About Us</h1>
        <p className="text-base md:text-lg text-on-surface-variant font-serif">{about.tagline}</p>
      </header>

      <section className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm space-y-6">
        <div className="space-y-2">
          <h2 className="font-sans text-xl font-bold text-primary">Manufacturer</h2>
          <p className="font-serif text-on-surface-variant leading-relaxed">{about.manufacturer}</p>
        </div>

        <div className="space-y-2">
          <h3 className="font-sans text-lg font-bold text-primary">Certification</h3>
          <p className="font-serif text-on-surface-variant leading-relaxed">{about.certification}</p>
        </div>

        <div className="space-y-2">
          <h3 className="font-sans text-lg font-bold text-primary">Location</h3>
          <p className="font-serif text-on-surface-variant leading-relaxed">{about.location}</p>
        </div>

        <div className="space-y-2">
          <h3 className="font-sans text-lg font-bold text-primary">Support Phone</h3>
          <p className="font-sans font-bold text-primary">{about.phone}</p>
        </div>

        <a
          href={`https://wa.me/${about.phone.replace(/[^0-9]/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-primary text-secondary-container px-5 py-3 rounded-xl font-sans font-bold hover:bg-primary-container transition-colors"
        >
          <Icons.MessageCircle className="w-5 h-5" />
          Contact via WhatsApp
        </a>
      </section>
    </div>
  );
}
