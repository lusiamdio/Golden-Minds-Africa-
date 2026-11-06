import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Cpu, BookOpen, GraduationCap, Coins, Globe, ArrowRight, CheckCircle2, Sparkles, X, ChevronRight } from 'lucide-react';

interface Pillar {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  bgImage: string;
  description: string;
  keyInitiatives: string[];
}

const PILLARS: Pillar[] = [
  {
    id: 'leadership',
    title: 'Leadership Development',
    subtitle: 'Cultivating Ethical & Visionary Public Servants',
    icon: ShieldCheck,
    bgImage: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&h=600&fit=crop&q=80',
    description: 'Providing world-class diplomatic, parliamentary, and executive leadership fellowships designed specifically for emerging African ministers, civil servants, and civic leaders.',
    keyInitiatives: [
      'Pan-African Youth Parliamentary Fellowship',
      'Diplomatic Protocol & Policy Governance Certification',
      'Ethical Governance & Anti-Corruption Training'
    ]
  },
  {
    id: 'innovation',
    title: 'Innovation & Technology',
    subtitle: 'Harnessing Technology, Climate Tech & Digital Sovereignty',
    icon: Cpu,
    bgImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=600&fit=crop&q=80',
    description: 'Empowering young engineers, data analysts, and technology founders to build scalable hardware and software solutions for clean energy, food security, and digital trade.',
    keyInitiatives: [
      'Clean Tech Irrigation & Drone Swarm Incubator',
      'Decentralized Renewable Microgrid Prototypes',
      'African Tech Ethics & Data Governance Policy Group'
    ]
  },
  {
    id: 'research',
    title: 'Governance & Policy Research',
    subtitle: 'Evidence-Based Frameworks for AU Agenda 2063',
    icon: BookOpen,
    bgImage: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=600&fit=crop&q=80',
    description: 'Producing peer-reviewed policy briefs, constitutional white papers, and economic reports that directly inform parliamentary debates and regional treaty negotiations.',
    keyInitiatives: [
      'AfCFTA Trade Policy & Tariff Analysis Consortium',
      'Congo Basin Critical Minerals Governance Report',
      'Pan-African Tele-Education System Whitepaper'
    ]
  },
  {
    id: 'education',
    title: 'Education & Fellowships',
    subtitle: 'Transformative Academic & Professional Merit Grants',
    icon: GraduationCap,
    bgImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=600&fit=crop&q=80',
    description: 'Granting merit-based scholarships and placement programs at top African and international universities for research in governance, law, engineering, and global health.',
    keyInitiatives: [
      'Golden Minds Diplomatic Fellowship Cohort 2026',
      'Women in Governance Higher Education Grants',
      'STEM Public Policy Masterclasses'
    ]
  },
  {
    id: 'investment',
    title: 'Youth Capital & Investment',
    subtitle: 'Catalyzing Growth for High-Impact African Enterprises',
    icon: Coins,
    bgImage: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&h=600&fit=crop&q=80',
    description: 'Connecting youth-led ventures, social enterprises, and technological innovations with institutional investors, sovereign wealth funds, and philanthropic capital.',
    keyInitiatives: [
      'African Youth Impact Venture Fund',
      'Green Energy Seed Grants',
      'Sovereign Wealth & Private Equity Roundtables'
    ]
  },
  {
    id: 'partnerships',
    title: 'Continental Partnerships',
    subtitle: 'Uniting Governments, UN, AU & Global Institutions',
    icon: Globe,
    bgImage: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=600&fit=crop&q=80',
    description: 'Structuring strategic multilateral agreements, university exchange programs, and corporate commitments that amplify Pan-African development.',
    keyInitiatives: [
      'UN SDG Youth Implementation Charter',
      'AU Agenda 2063 Youth Advisory Committee',
      'International University Research Alliances'
    ]
  }
];

export default function StrategicPillars() {
  const [selectedPillar, setSelectedPillar] = useState<Pillar | null>(null);

  return (
    <section id="pillars" className="py-24 px-6 md:px-12 lg:px-16 relative bg-[#08080A] overflow-hidden">
      <div className="w-full relative z-10">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white">
            Six Strategic <span className="text-gold-gradient">Pillars of Impact</span>
          </h2>
          <p className="text-gray-400 mt-4 text-base md:text-lg">
            Our comprehensive model combines policy research, leadership training, technological innovation, and investment capital to transform Africa's institutional landscape.
          </p>
        </div>

        {/* 6 Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.id}
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3 }}
                className="glass-card rounded-3xl p-8 border border-white/10 hover:border-white/30 transition-all group flex flex-col justify-between relative overflow-hidden shadow-xl"
              >
                {/* Background Image Glow Overlay */}
                <div 
                  className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-500 bg-cover bg-center pointer-events-none"
                  style={{ backgroundImage: `url(${pillar.bgImage})` }}
                />

                <div>
                  <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-[#D4AF37] mb-6 group-hover:scale-110 transition-transform shadow-lg">
                    <Icon className="w-7 h-7" />
                  </div>

                  <h3 className="text-2xl font-serif font-bold text-white mt-4 group-hover:text-[#D4AF37] transition-colors">
                    {pillar.title}
                  </h3>

                  <p className="text-sm font-medium text-gray-400 mt-1">
                    {pillar.subtitle}
                  </p>

                  <p className="text-sm text-gray-300 mt-4 leading-relaxed line-clamp-3">
                    {pillar.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedPillar(pillar)}
                    className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5 hover:gap-3 transition-all"
                  >
                    Explore Pillar Details <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Pillar Detail Modal */}
      <AnimatePresence>
        {selectedPillar && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-2xl bg-[#0E0E12] border border-white/20 rounded-3xl p-8 shadow-2xl relative text-white"
            >
              <button
                onClick={() => setSelectedPillar(null)}
                className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-[#D4AF37]">
                  <selectedPillar.icon className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest">
                    Strategic Pillar Overview
                  </span>
                  <h3 className="text-2xl font-serif font-bold text-white">{selectedPillar.title}</h3>
                </div>
              </div>

              <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-6">
                {selectedPillar.description}
              </p>

              <div className="space-y-4 bg-white/5 rounded-2xl p-5 border border-white/10 mb-6">
                <h4 className="text-sm font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Key Pillar Programs & Policy Initiatives
                </h4>
                <ul className="space-y-2.5">
                  {selectedPillar.keyInitiatives.map((init, i) => (
                    <li key={i} className="text-sm text-gray-200 flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                      {init}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-end pt-4">
                <button
                  onClick={() => setSelectedPillar(null)}
                  className="px-6 py-2.5 rounded-full bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-gray-200"
                >
                  Close Blueprint
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
