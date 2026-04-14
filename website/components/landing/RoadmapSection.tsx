"use client";

import React from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";

export default function RoadmapSection({ onSelectVideo }: { onSelectVideo: (src: string | null) => void }) {
  const videos = [
    {
      src: "/assets/videos/Boy_s_Happy_Ball_Adventure.mp4",
      title: "Smarter Insights",
      desc: "Predictive analysis for your spending."
    },
    {
      src: "/assets/videos/Video_Generation_From_Image.mp4",
      title: "Predictive Nudges",
      desc: "Avoid overspending before it happens."
    },
    {
      src: "/assets/videos/Video_Generation_Request_and_Completion.mp4",
      title: "Context-aware Guidance",
      desc: "Financial advice that understands you."
    }
  ];

  return (
    <section id="fiinny-ai" className="py-24 bg-slate-900 text-white overflow-hidden scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl lg:text-6xl font-bold mb-6 tracking-tight">
            What&apos;s <span className="text-teal-400">coming next.</span>
          </h2>
          <p className="text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto">
            We are just getting started. Here is what we are building now.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {videos.map((video, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => onSelectVideo(video.src)}
              className="group relative rounded-2xl overflow-hidden bg-slate-800 border border-slate-700 hover:border-teal-500/50 transition-colors cursor-pointer"
              onMouseEnter={(e) => {
                const vid = e.currentTarget.querySelector('video');
                if (vid) vid.play();
              }}
              onMouseLeave={(e) => {
                const vid = e.currentTarget.querySelector('video');
                if (vid) {
                  vid.pause();
                  vid.currentTime = 0;
                }
              }}
            >
              <div className="aspect-[9/16] relative bg-black">
                <video
                  src={video.src}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                  muted
                  loop
                  playsInline
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:opacity-0 transition-opacity">
                  <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
                    <Play className="w-8 h-8 text-white fill-current ml-1" />
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 group-hover:text-teal-400 transition-colors">{video.title}</h3>
                <p className="text-slate-400 text-sm">{video.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
