import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, Search, ShieldCheck, Menu, X, ArrowRight, User, Sparkles } from 'lucide-react';
import gmaLogo from '../assets/images/logo.png';

interface DiplomaticNavProps {
  onOpenPortal: () => void;
  activeLanguage: string;
  onChangeLanguage: (lang: string) => void;
  onOpenSearch: () => void;
}

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
  { code: 'pt', name: 'Português' },
  { code: 'ar', name: 'العربية' },
  { code: 'sw', name: 'Kiswahili' }
];

export default function DiplomaticNav({ onOpenPortal, activeLanguage, onChangeLanguage, onOpenSearch }: DiplomaticNavProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'About', href: '#about' },
    { name: 'Strategic Pillars', href: '#pillars' },
    { name: 'Programs', href: '#programs' },
    { name: 'Leadership', href: '#leadership' },
    { name: 'Research', href: '#newsroom' },
    { name: 'Donate', href: '#donate' }
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
      isScrolled
        ? 'bg-[#08080A]/90 backdrop-blur-xl py-3 shadow-2xl'
        : 'bg-gradient-to-b from-black/80 via-black/40 to-transparent py-5'
    }`}>
      <div className="w-full px-6 md:px-12 lg:px-16 flex items-center justify-between">
        
        {/* Brand Logo - Enlarged & Clean without Golden Lines or Text */}
        <a href="#" className="flex items-center gap-3 group">
          <img
            src={gmaLogo}
            alt="Logo"
            className="h-14 md:h-16 lg:h-20 w-auto object-contain filter drop-shadow-md group-hover:scale-105 transition-transform"
          />
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-gray-300 uppercase tracking-wider">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="hover:text-white transition-colors py-1 relative group"
            >
              {link.name}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white/60 transition-all group-hover:w-full" />
            </a>
          ))}
        </nav>

        {/* Right Controls: Language Selector + Search + Portal CTA */}
        <div className="hidden sm:flex items-center gap-3">
          
          {/* Global AI Search Trigger */}
          <button
            onClick={onOpenSearch}
            className="p-2.5 rounded-full bg-white/5 border border-white/10 hover:border-white/40 text-gray-300 hover:text-white transition-all flex items-center gap-2 text-xs"
            title="Search Archive"
          >
            <Search className="w-4 h-4 text-[#D4AF37]" />
            <span className="hidden xl:inline text-gray-400 text-[11px]">Command + K</span>
          </button>

          {/* Language Dropdown */}
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="px-3 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-white hover:border-white/40 flex items-center gap-1.5 transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="uppercase">{activeLanguage}</span>
            </button>

            <AnimatePresence>
              {langDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-40 glass-card-gold rounded-2xl p-2 border border-white/20 shadow-2xl space-y-1 z-50 text-xs"
                >
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        onChangeLanguage(lang.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl flex items-center gap-2 transition-colors ${
                        activeLanguage === lang.code
                          ? 'bg-white/20 text-white font-bold'
                          : 'text-gray-200 hover:bg-white/10'
                      }`}
                    >
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Fellowship Portal CTA */}
          <button
            onClick={onOpenPortal}
            className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider border border-white/20 shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4 text-[#D4AF37]" /> Fellowship Portal
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2.5 rounded-xl bg-white/5 border border-white/10 text-white"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-[#0A0A0E] px-6 py-6 space-y-4"
          >
            <div className="flex flex-col gap-3 text-sm font-semibold text-gray-200 uppercase tracking-wider">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 border-b border-white/5 hover:text-[#D4AF37]"
                >
                  {link.name}
                </a>
              ))}
            </div>

            <div className="pt-4 flex flex-col gap-3">
              <button
                onClick={() => { onOpenPortal(); setMobileMenuOpen(false); }}
                className="w-full py-3 rounded-full bg-white/15 hover:bg-white/25 text-white font-bold text-xs uppercase tracking-wider border border-white/20"
              >
                Access Fellowship Portal
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
