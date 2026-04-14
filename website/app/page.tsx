"use client";

import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle2,
  Shield,
  Users,
  Zap,
  PieChart,
  Trophy,
  Play,
  FileText,
  Globe,
  Instagram,
  Linkedin,
  ChevronDown,
  X,
  EyeOff,
  Smartphone
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { User as FirebaseUser } from "firebase/auth";
import LanguageSelector from "@/components/LanguageSelector";
import { LanguageProvider, useLanguage } from "./i18n/LanguageContext";
import { translations } from "./i18n/translations";
import FloatingFeatureStack, { features } from "@/components/FloatingFeatureStack";
import TypewriterText from "@/components/animations/TypewriterText";
import AiOverlay from "@/components/ai/AiOverlay";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import ProblemSection from "@/components/landing/ProblemSection";
import BentoFeatures from "@/components/landing/BentoFeatures";
import RoadmapSection from "@/components/landing/RoadmapSection";
import TrustSection from "@/components/landing/TrustSection";
import SecuritySection from "@/components/landing/SecuritySection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import LandingFooter from "@/components/landing/LandingFooter";

export default function Home() {
  return (
    <LanguageProvider>
      <MainContent />
    </LanguageProvider>
  );
}


function MainContent() {
  const { user } = useAuth();
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-teal-100 selection:text-teal-900 overflow-x-hidden">
      <Navbar />

      <HeroSection />

      <div id="features">
        <FloatingFeatureStack onSelectFeature={setSelectedId} />
      </div>

      <ProblemSection />

      <BentoFeatures onSelectFeature={setSelectedId} />

      <RoadmapSection onSelectVideo={setSelectedVideo} />

      <TrustSection />

      <SecuritySection />

      <TestimonialsSection />

      <LandingFooter />

      {/* Video Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 lg:p-10"
            onClick={() => setSelectedVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-6xl max-h-[90vh] bg-black rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center"
            >
              <button
                onClick={() => setSelectedVideo(null)}
                className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors z-20 backdrop-blur-sm"
              >
                <X className="w-6 h-6" />
              </button>
              <video
                src={selectedVideo}
                controls
                autoPlay
                className="w-full h-full max-h-[85vh] object-contain bg-black"
              />
            </motion.div>
          </motion.div>
        )}

        {/* Feature Detail Modal */}
        {selectedId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4"
            onClick={() => setSelectedId(null)}
          >
            <motion.div
              layoutId={selectedId}
              className="bg-white w-full max-w-5xl max-h-[90vh] rounded-[2rem] overflow-hidden shadow-2xl relative flex flex-col md:flex-row"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedId(null)}
                className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full hover:bg-rose-100 hover:text-rose-600 transition-colors z-20"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-6 md:p-12 flex-1 flex flex-col justify-center overflow-y-auto custom-scrollbar">
                {(() => {
                  const feature = features.find(f => f.id === selectedId);
                  if (!feature) return null;
                  const Icon = feature.icon || PieChart;

                  return (
                    <>
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 w-fit mb-4 md:mb-6`}>
                        <Icon className="w-3.5 h-3.5" />
                        {feature.id.charAt(0).toUpperCase() + feature.id.slice(1)}
                      </div>
                      <h3 className="text-2xl md:text-4xl font-bold text-slate-900 mb-4 leading-tight">
                        {feature.subtitle}
                      </h3>
                      <div className="text-base md:text-lg text-slate-500 font-medium mb-8 leading-relaxed">
                        {feature.description}
                      </div>
                      <div>
                        <Link
                          href={user ? "/dashboard" : "/login"}
                          onClick={() => setSelectedId(null)}
                          className="inline-flex items-center justify-center px-8 py-3.5 text-base font-bold text-white transition-all duration-200 bg-slate-900 rounded-full hover:bg-slate-800 hover:shadow-lg hover:-translate-y-0.5"
                        >
                          Try it now
                        </Link>
                      </div>
                    </>
                  );
                })()}
              </div>

              <div className="bg-slate-50 flex-1 flex items-center justify-center p-8 relative overflow-hidden md:min-h-[500px]">
                <div className="absolute inset-0 bg-gradient-to-br from-white via-transparent to-slate-100 opacity-50" />
                {features.find(f => f.id === selectedId)?.image && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="relative z-10"
                  >
                    <Image
                      src={features.find(f => f.id === selectedId)!.image!}
                      alt="Feature"
                      width={400}
                      height={400}
                      className="w-full max-w-[350px] object-contain drop-shadow-2xl"
                    />
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AiOverlay />
    </div>
  );
}
