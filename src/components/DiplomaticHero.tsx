import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';

// Hero Gallery Images from assets
import heroImg1 from '../assets/images/26409_4c7982bf9569c2f0ae587063ceff537b-2025_12_17, 03_07_14.jpg';
import heroImg2 from '../assets/images/26410_14b23e8e48a3469615f3771d2aae2ad1-2025_12_17, 03_09_39.jpg';
import heroImg3 from '../assets/images/26411_d1b25ea234650622601d13e0b09cc1e8-2025_12_17, 03_07_03.jpg';
import heroImg4 from '../assets/images/26457_6312ebe13b00198bd5ed630b6dce3bed-2025_12_17, 03_04_58.jpg';
import heroImg5 from '../assets/images/26507_ead34f048e57b85373ca34ede7df33f2-2025_12_17, 03_19_48.webp';
import heroImg6 from '../assets/images/26548_a58c57bb5e6c6c23eebff02a09121f0c-2025_12_17, 03_32_47.jpg';

interface DiplomaticHeroProps {
  onJoinClick: () => void;
}

const HERO_GALLERY = [
  {
    id: 1,
    image: heroImg1,
    title: 'Continental Youth Leadership Assembly',
    caption: 'Delegates and fellows gathered for pan-African policy alignment and strategic youth dialogues.'
  },
  {
    id: 2,
    image: heroImg2,
    title: 'Diplomatic Policy Roundtable & Masterclass',
    caption: 'Executive governance sessions shaping regional trade corridors and institutional reform.'
  },
  {
    id: 3,
    image: heroImg3,
    title: 'Pan-African Chapter Envoys Convening',
    caption: 'National and university envoys driving grassroots civic integration across African states.'
  },
  {
    id: 4,
    image: heroImg4,
    title: 'Future Forward Summit & Innovation Forum',
    caption: 'Empowering emerging innovators, policymakers, and civic visionaries.'
  },
  {
    id: 5,
    image: heroImg5,
    title: 'Golden Minds Africa Diplomatic Corps',
    caption: 'United continental leadership driving youth empowerment across 54 African nations.'
  },
  {
    id: 6,
    image: heroImg6,
    title: 'Pan-African Academic & Fellowship Summit',
    caption: 'Fostering academic excellence, policy research, and multilateral cooperation.'
  }
];

export default function DiplomaticHero({ onJoinClick }: DiplomaticHeroProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Auto advance gallery slide
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_GALLERY.length);
    }, 4500);
    return () => clearInterval(slideTimer);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col justify-center pt-28 pb-20 px-6 md:px-12 lg:px-16 overflow-hidden bg-[#08080A]">
      
      {/* Background Dynamic Cinematic Crossfade */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {HERO_GALLERY.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ 
              opacity: activeSlide === idx ? 0.35 : 0,
              scale: activeSlide === idx ? 1 : 1.05
            }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover object-center filter saturate-[0.85] brightness-[0.4]"
            />
          </motion.div>
        ))}
        {/* Dark Vignette & Gold Grid Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#08080A] via-[#08080A]/85 to-black/75" />
        <div className="absolute inset-0 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:32px_32px] opacity-15 pointer-events-none" />
      </div>

      <div className="w-full max-w-7xl mx-auto relative z-10 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Main Text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7 space-y-6 text-center lg:text-left"
          >
            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-white leading-[1.1] tracking-tight">
              Empowering Africa’s <br />
              <span className="text-gold-gradient">Next Generation</span> of Leaders
            </h1>

            {/* Subtitle */}
            <p className="text-gray-300 text-base sm:text-lg md:text-xl font-sans max-w-3xl font-light leading-relaxed">
              Building the future of Africa through Leadership, Innovation, Entrepreneurship, Governance Research, and Global Partnerships across all 54 African Member States.
            </p>

            {/* CTA Buttons */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <button
                onClick={onJoinClick}
                className="px-8 py-4 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#B8860B] text-black font-bold text-sm uppercase tracking-wider shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              >
                Join the Movement <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="#pillars"
                className="px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 text-white font-bold text-sm uppercase tracking-wider border border-white/20 hover:border-white/40 transition-all flex items-center gap-2"
              >
                Explore Our Impact
              </a>
            </div>

            {/* Key African Capitals Ticker */}
            <div className="pt-8 flex flex-wrap items-center justify-center lg:justify-start gap-3 text-xs text-gray-400 font-medium">
              <span className="text-[#D4AF37] font-semibold">Active Chapters:</span>
              <span>South Africa</span> •
              <span>Kenya</span> •
              <span>Zambia</span> •
              <span>Tanzania</span> •
              <span>Zimbabwe</span>
            </div>
          </motion.div>

          {/* Right Hero Column: Interactive Featured Image Frame */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="lg:col-span-5 space-y-6"
          >
            {/* Featured Hero Showcase Frame */}
            <div className="glass-card-gold rounded-3xl p-4 sm:p-5 border border-white/15 shadow-2xl relative overflow-hidden group">
              
              <div className="relative aspect-[16/11] sm:aspect-[16/10] rounded-2xl overflow-hidden bg-black/80 border border-white/15">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeSlide}
                    src={HERO_GALLERY[activeSlide].image}
                    alt={HERO_GALLERY[activeSlide].title}
                    initial={{ opacity: 0, scale: 1.08 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.6 }}
                    className="w-full h-full object-cover"
                  />
                </AnimatePresence>

                {/* Dark Gradient Overlay for Caption */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />

                {/* Top Action Controls */}
                <div className="absolute top-3 right-3 flex items-center justify-end pointer-events-none">
                  <button
                    type="button"
                    onClick={() => setLightboxImage(HERO_GALLERY[activeSlide].image)}
                    className="pointer-events-auto p-2 rounded-full bg-black/75 hover:bg-[#D4AF37] text-white hover:text-black border border-white/20 transition-colors"
                    title="Enlarge Image"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Bottom Caption */}
                <div className="absolute bottom-3 left-3 right-3 pointer-events-none text-left">
                  <h4 className="text-sm sm:text-base font-serif font-bold text-white leading-snug drop-shadow-md">
                    {HERO_GALLERY[activeSlide].title}
                  </h4>
                  <p className="text-[11px] text-gray-300 line-clamp-1 mt-0.5">
                    {HERO_GALLERY[activeSlide].caption}
                  </p>
                </div>

                {/* Navigation Arrows */}
                <button
                  onClick={() => setActiveSlide((prev) => (prev - 1 + HERO_GALLERY.length) % HERO_GALLERY.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-[#D4AF37] text-white hover:text-black transition-colors z-20 border border-white/20"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveSlide((prev) => (prev + 1) % HERO_GALLERY.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-[#D4AF37] text-white hover:text-black transition-colors z-20 border border-white/20"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Thumbnail Strip */}
              <div className="grid grid-cols-6 gap-2 mt-3">
                {HERO_GALLERY.map((item, idx) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSlide(idx)}
                    className={`relative rounded-xl overflow-hidden aspect-[4/3] border transition-all ${
                      activeSlide === idx
                        ? 'border-white ring-2 ring-white/40 scale-105'
                        : 'border-white/15 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>

            </div>
          </motion.div>
        </div>

      </div>

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {lightboxImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-5xl w-full bg-[#0E0E14] border border-white/20 rounded-3xl p-4 sm:p-6 shadow-2xl"
            >
              <button
                onClick={() => setLightboxImage(null)}
                className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-black/70 hover:bg-[#D4AF37] text-white hover:text-black transition-colors border border-white/20"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="rounded-2xl overflow-hidden max-h-[75vh] flex items-center justify-center bg-black">
                <img
                  src={lightboxImage}
                  alt="Enlarged gallery view"
                  className="max-h-[75vh] w-auto max-w-full object-contain rounded-xl"
                />
              </div>

              <div className="pt-4 flex items-center justify-between text-xs text-gray-400">
                <span className="text-[#D4AF37] font-semibold">Golden Minds Africa</span>
                <button
                  onClick={() => setLightboxImage(null)}
                  className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
}

