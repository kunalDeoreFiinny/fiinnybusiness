"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Lang, translations } from "@/lib/translations";

type LangContextType = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  tx: typeof translations["en"];
};

const LangContext = createContext<LangContextType | null>(null);

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("mr");
  
  // Update html lang attribute dynamically
  useEffect(() => {
    document.documentElement.lang = lang === "en" ? "en-IN" : lang === "hi" ? "hi-IN" : "mr-IN";
  }, [lang]);

  const setLang = (newLang: Lang) => {
    setLangState(newLang);
  };

  const tx = translations[lang];

  return (
    <LangContext.Provider value={{ lang, setLang, tx }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const context = useContext(LangContext);
  if (!context) {
    throw new Error("useLang must be used within a LangProvider");
  }
  return context;
}
