import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import AboutSection from "./components/AboutSection";
import FinnySection from "./components/FinnySection";
import ThinkingSection from "./components/ThinkingSection";
import ExperienceSection from "./components/ExperienceSection";
import StrengthsSection from "./components/StrengthsSection";
import VisionSection from "./components/VisionSection";
import ContactSection from "./components/ContactSection";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <FinnySection />
        <ThinkingSection />
        <ExperienceSection />
        <StrengthsSection />
        <VisionSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
