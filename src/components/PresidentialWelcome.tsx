import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, X, Award, ShieldCheck, Quote, Sparkles, CheckCircle2 } from 'lucide-react';
import executiveImage from '../assets/images/ChatGPT Image Aug 14, 2026, 04_06_19 PM.png';
import gmaLogo from '../assets/images/logo.png';

export default function PresidentialWelcome() {
  const [showVideoModal, setShowVideoModal] = useState(false);

  return (
    <section className="py-24 px-6 md:px-12 lg:px-16 relative bg-gradient-to-b from-[#08080A] via-[#0E0D12] to-[#08080A] overflow-hidden">
      
      <div className="w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Portrait & Badge */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative mx-auto max-w-md rounded-3xl p-3 bg-gradient-to-b from-white/20 via-white/5 to-transparent shadow-2xl">
              <div className="relative rounded-2xl overflow-hidden aspect-[4/5] border border-white/10 group">
                <img
                  src={executiveImage}
                  alt="Lusimanadio Soki Simao - Founder & President"
                  className="w-full h-full object-cover object-top filter saturate-[0.95] group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                {/* Floating Credentials Overlay */}
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-black/80 backdrop-blur-md border border-white/15 text-white">
                  <div className="flex items-center gap-2 text-[#D4AF37] font-serif text-sm font-bold">
                    <ShieldCheck className="w-4 h-4" /> Founder & President
                  </div>
                  <h4 className="text-xl font-serif font-bold mt-1 text-white">Lusimanadio Soki Simao</h4>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Welcome Message & Signature */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7 space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs font-semibold uppercase tracking-widest">
              <Quote className="w-3.5 h-3.5 text-[#D4AF37]" /> Executive Address
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white leading-tight">
              A Personal Welcome from Our <span className="text-gold-gradient">Founder & President</span>
            </h2>

            <div className="space-y-4 text-gray-300 text-base md:text-lg leading-relaxed font-sans">
              <p className="italic text-white/90 py-1">
                "Africa's destiny will not be determined by external observers, but by the intellectual courage, ethical integrity, and technological brilliance of its young leaders."
              </p>
              <p>
                Distinguished Leaders, Esteemed Partners, and Fellow Africans: Welcome to our roundtable. We created this platform to serve as a high-level incubator for the continent’s brightest policy minds, entrepreneurs, scholars, and public servants.
              </p>
              <p>
                From Kigali to Cape Town, Lagos to Cairo, our mandate is clear: bridge the gap between youth potential and institutional governance. Through our 150+ programs and policy labs, we empower over 100,000 young leaders annually to shape AU Agenda 2063, drive digital sovereignty, and advance sustainable development.
              </p>
            </div>

            {/* Presidential Signature Block */}
            <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <div className="font-serif italic text-2xl text-[#D4AF37] tracking-wider">
                  Lusimanadio Soki Simao
                </div>
                <div className="text-xs text-white mt-1 uppercase tracking-widest font-semibold">
                  Founder & President
                </div>
              </div>

              <button
                onClick={() => setShowVideoModal(true)}
                className="px-6 py-3.5 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#B8860B] text-black font-semibold text-sm flex items-center gap-3 hover:shadow-lg transition-all group active:scale-95"
              >
                <div className="w-7 h-7 rounded-full bg-black flex items-center justify-center text-[#D4AF37]">
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5 group-hover:scale-110 transition-transform" />
                </div>
                <span>Watch Presidential Message</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Video Address Modal */}
      <AnimatePresence>
        {showVideoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-4xl bg-[#0F0F12] rounded-3xl border border-white/20 overflow-hidden shadow-2xl relative"
            >
              <div className="p-4 bg-black flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#D4AF37] font-serif font-bold text-sm">
                  <Sparkles className="w-4 h-4" /> Executive Address 2026
                </div>
                <button
                  onClick={() => setShowVideoModal(false)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Video Player Container */}
              <div className="aspect-video bg-black flex items-center justify-center relative p-6">
                <div className="text-center space-y-4 max-w-md">
                  <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mx-auto text-[#D4AF37]">
                    <Play className="w-8 h-8 fill-current ml-1" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-white">
                    "Building the Future of African Governance"
                  </h3>
                  <p className="text-sm text-gray-400">
                    Keynote Address delivered at the Pan-African Youth Governance Conference by Lusimanadio Soki Simao, Founder & President.
                  </p>
                  <div className="pt-2">
                    <span className="px-4 py-2 bg-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-full border border-emerald-500/30 inline-flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> High-Definition Stream Ready
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
