"use client";

import { useLang } from "@/lib/LangContext";
import { useState } from "react";

export default function Navbar() {
  const { lang, setLang, tx } = useLang();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleLang = () => {
    setLang(lang === "en" ? "hi" : lang === "hi" ? "mr" : "en");
  };

  return (
    <nav className="navbar glass" aria-label="Main navigation">
      <div className="container nav-inner">
        <a href="#" className="nav-logo" aria-label="Karan Arjun Power Plus home">
          <span className="logo-karan">करण अर्जुन</span>
          <span className="logo-power"> POWER</span>
          <span className="logo-plus"> Plus</span>
          <sup className="logo-tm">™</sup>
        </a>

        {/* Mobile menu toggle */}
        <button 
          className="mobile-menu-btn" 
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          ☰
        </button>

        <div className={`nav-links ${menuOpen ? "open" : ""}`}>
          <a href="#benefits" onClick={() => setMenuOpen(false)}>
            {lang === "hi" ? "फायदे" : lang === "mr" ? "फायदे" : "Benefits"}
          </a>
          <a href="#how-to-use" onClick={() => setMenuOpen(false)}>
            {lang === "hi" ? "उपयोग" : lang === "mr" ? "उपयोग" : "Usage"}
          </a>
          {/* Language toggle */}
          <button
            className="lang-toggle"
            onClick={toggleLang}
            aria-label="Toggle language"
            title="Change Language"
          >
            {tx.langAbbr}
          </button>
          <a href="#buy" className="btn btn-primary nav-cta" onClick={() => setMenuOpen(false)}>
            {tx.orderNow.replace("🛒 ", "")}
          </a>
        </div>
      </div>
    </nav>
  );
}
