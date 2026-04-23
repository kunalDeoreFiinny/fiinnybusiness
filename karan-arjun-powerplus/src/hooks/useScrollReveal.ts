"use client";

import { useEffect, useRef } from "react";

export function useScrollReveal() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const children = el.querySelectorAll<HTMLElement>(".anim-item");
    children.forEach((child) => child.classList.add("anim-hidden"));

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove("anim-hidden");
            entry.target.classList.add("anim-show");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );

    children.forEach((child) => obs.observe(child));
    return () => obs.disconnect();
  }, []);

  return ref;
}
