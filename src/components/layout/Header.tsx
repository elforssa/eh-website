"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

const PUBLIC_FORM_URL = "https://admin.english-hills.com/inscription";
const ADMIN_LOGIN_URL = "https://admin.english-hills.com";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showPromo, setShowPromo] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const programLinks = [
    { name: "Enfants & Juniors", href: "/programs/kids" },
    { name: "Anglais général", href: "/programs/general-english" },
    { name: "Business English", href: "/programs/business-english" },
    { name: "Prépa examens", href: "/programs/exam-prep" },
    { name: "Formations courtes", href: "/programs/short-courses" },
  ];

  const mainNavLinks = [
    { name: "À propos", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <>
      {showPromo && (
        <div className="bg-navy-primary text-white text-sm font-medium py-3 px-6 flex justify-between items-center z-[60] relative">
          <div className="flex-1 text-center">
            🚀 <strong>Offre de lancement :</strong> Bénéficiez de 10% de réduction sur tous nos cours en vous inscrivant avant le 30 mai.
          </div>
          <button onClick={() => setShowPromo(false)} className="text-white/80 hover:text-white p-1 ml-4" aria-label="Fermer">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      <header
        className={`sticky top-0 w-full z-50 transition-all duration-300 ${
          isScrolled ? "bg-white/95 backdrop-blur-md shadow-sm py-4" : "bg-white py-6"
        }`}
      >
      <div className="container mx-auto px-6 max-w-7xl flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 -ml-2">
          <Image
            src="/eh-logo-new.png"
            alt="English Hills"
            width={400}
            height={160}
            className="h-12 md:h-16 w-auto object-contain transform origin-left hover:scale-105 transition-transform"
            priority
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Navigation principale">
          <div className="flex items-center gap-6">

            <div className="relative group/nav">
              <button className="text-foreground hover:text-primary font-medium transition-colors flex items-center gap-1 py-4" aria-haspopup="true">
                Programmes
                <svg className="w-4 h-4 transition-transform group-hover/nav:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute top-[80%] left-0 hidden group-hover/nav:flex flex-col bg-white shadow-xl border border-surface-active rounded-2xl py-2 min-w-[220px] animate-in fade-in zoom-in-95 duration-200">
                {programLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="px-5 py-3 hover:bg-surface text-foreground font-medium transition-colors text-sm"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            {mainNavLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-foreground hover:text-primary font-medium transition-colors py-4"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <a
              href={PUBLIC_FORM_URL}
              className="inline-flex items-center justify-center font-medium rounded-full px-6 py-3 transition-colors duration-200 border-2 border-navy-primary text-navy-primary bg-transparent hover:bg-navy-primary hover:text-white"
            >
              S&apos;inscrire
            </a>
            <a
              href={ADMIN_LOGIN_URL}
              className="inline-flex items-center justify-center font-medium rounded-full px-6 py-3 transition-colors duration-200 bg-navy-primary text-white hover:bg-navy-primary/90 shadow-sm"
            >
              Se connecter
            </a>
          </div>
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 text-foreground"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Ouvrir le menu"
          aria-expanded={mobileMenuOpen}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
            aria-hidden="true"
          >
            {mobileMenuOpen ? (
               <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
               <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Nav Overlay */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white shadow-lg border-t border-surface md:hidden flex flex-col px-6 py-6 gap-6 animate-in slide-in-from-top-2 duration-300 overflow-y-auto max-h-[85vh]">

          <div className="flex flex-col gap-2">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2 mb-2">Programmes</div>
            {programLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-lg font-semibold py-3 px-4 text-foreground hover:bg-surface rounded-xl transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="h-px bg-gray-100 w-full"></div>

          <div className="flex flex-col gap-2 mb-4">
            {mainNavLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-lg font-semibold py-3 px-2 text-foreground hover:bg-surface rounded-xl transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <a
              href={PUBLIC_FORM_URL}
              className="inline-flex items-center justify-center font-medium rounded-full w-full px-6 py-4 text-lg transition-colors duration-200 border-2 border-navy-primary text-navy-primary bg-transparent hover:bg-navy-primary hover:text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              S&apos;inscrire
            </a>
            <a
              href={ADMIN_LOGIN_URL}
              className="inline-flex items-center justify-center font-medium rounded-full w-full px-6 py-4 text-lg transition-colors duration-200 bg-navy-primary text-white hover:bg-navy-primary/90 shadow-sm"
              onClick={() => setMobileMenuOpen(false)}
            >
              Se connecter
            </a>
          </div>
        </div>
      )}
    </header>
    </>
  );
}
