import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import AntiCounterfeit from "@/components/AntiCounterfeit";
import Specs from "@/components/Specs";
import Benefits from "@/components/Benefits";
import Crops from "@/components/Crops";
import HowToUse from "@/components/HowToUse";
import SocialProof from "@/components/SocialProof";
import BuySection from "@/components/BuySection";
import Footer from "@/components/Footer";
import { LangProvider } from "@/lib/LangContext";

export default function Home() {
  return (
    <LangProvider>
      <main>
        <Navbar />
        <Hero />
        <AntiCounterfeit />
        <Specs />
        <Benefits />
        <Crops />
        <HowToUse />
        <SocialProof />
        <BuySection />
        <Footer />
        
        {/* Sticky WhatsApp Floating Button */}
        <a 
          href="https://wa.me/919307199040" 
          className="whatsapp-float"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contact us on WhatsApp"
        >
           <svg viewBox="0 0 32 32" className="whatsapp-icon" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.1 2.9C8.8 2.9 2.9 8.8 2.9 16.1c0 2.3.6 4.5 1.7 6.4L2.8 29.3l7-1.8c1.9 1 4 1.6 6.3 1.6 7.3 0 13.2-5.9 13.2-13.2S23.3 2.9 16.1 2.9zm0 24c-1.9 0-3.8-.5-5.5-1.5l-.4-.2-4.1 1.1 1.1-4-.3-.4c-1-1.7-1.6-3.7-1.6-5.7 0-6.1 5-11 11-11s11 5 11 11-4.9 11-11 11zm6-8.2c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-.1 1.2.2.3.4.4.9.2s-1.4-.5-2.6-1.6c-.9-.8-1.5-1.8-1.7-2.2-.2-.3 0-.5.2-.6.2-.1.3-.3.5-.5.2-.2.3-.3.4-.5.1-.2 0-.4 0-.5-.1-.2-.7-1.8-.9-2.4-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4s-1.1 1.1-1.1 2.6c0 1.6 1.1 3.1 1.3 3.3.2.3 2.3 3.4 5.5 4.8 2.6 1.1 3.6 1.2 4.9 1s1.9-.8 2.2-1.5c.3-.7.3-1.4.2-1.5-.1-.1-.3-.2-.6-.4z"/>
           </svg>
        </a>
      </main>
    </LangProvider>
  );
}
