"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export const slides = [
  {
    id: 1,
    title: "Auto-organized spending",
    src: "/assets/hero/hero-1.jpg",
    desc: "Expenses grouped automatically."
  },
  {
    id: 2,
    title: "Split & settle instantly",
    src: "/assets/hero/hero-2.jpg",
    desc: "Shared expense → Settled."
  },
  {
    id: 3,
    title: "Know where your money goes",
    src: "/assets/hero/hero-4.jpg",
    desc: "Chart + Insight bubble."
  },
  {
    id: 4,
    title: "Your data stays with you",
    src: "/assets/hero/hero-5.jpg",
    desc: "Local-first privacy."
  }
];

export default function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-Rotate Logic (Every 3 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center z-10">
      {/* 1. The Rotating Image Stage */}
      <div className="relative w-[300px] h-[600px] md:w-[350px] md:h-[650px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {/* Image Container with Shadow */}
            <div className="relative rounded-[3rem] overflow-hidden shadow-2xl shadow-teal-900/20 border-4 border-white h-full w-full">
              <a href="#features">
                <Image
                  src={slides[currentIndex].src}
                  alt={slides[currentIndex].title}
                  fill
                  className="object-cover"
                  priority
                />
              </a>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 2. Dots Indicators */}
      <div className="mt-8 flex gap-3 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              currentIndex === index
                ? "w-8 bg-teal-600 shadow-md shadow-teal-500/30"
                : "w-2 bg-slate-300 hover:bg-teal-200"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
