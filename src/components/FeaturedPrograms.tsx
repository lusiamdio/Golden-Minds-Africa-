import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GraduationCap, Award, Cpu, ShieldCheck, Sparkles, ArrowRight, CheckCircle2, Users, X, Send } from 'lucide-react';

interface Program {
  id: string;
  title: string;
  category: string;
  stats: string;
  image: string;
  description: string;
  duration: string;
  eligibility: string;
  curriculum: string[];
}

const PROGRAMS: Program[] = [
  {
    id: 'youth-leadership',
    title: 'Youth Leadership Fellowship 2026',
    category: 'Public Governance & Diplomacy',
    stats: '45,000 Fellows Across 35 Countries',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=600&fit=crop&q=80',
    description: 'Intensive 6-month residential and virtual fellowship equipping emerging public servants with constitutional law, diplomatic negotiation, and anti-corruption frameworks.',
    duration: '6 Months (Hybrid)',
    eligibility: 'Ages 21–35, African Citizens with Public Service / Civic Track Record',
    curriculum: [
      'Constitutional Law & Pan-African Legal Treaties',
      'Multilateral Negotiations & Diplomatic Protocol',
      'Public Budgeting, Integrity & Fiscal Ethics'
    ]
  },
  {
    id: 'women-leadership',
    title: 'Women in Public Office & Diplomacy Fellowship',
    category: 'Gender Equality & Political Representation',
    stats: '12,000 Female Leaders Prepared',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=600&fit=crop&q=80',
    description: 'Empowering young African women to contest electoral positions, assume parliamentary appointments, and lead ministerial portfolios with authority.',
    duration: '9 Months (Mentorship Track)',
    eligibility: 'Women Aspirants & Civil Society Directors',
    curriculum: [
      'Electoral Campaign Strategy & Media Training',
      'Parliamentary Policy Drafting & Committee Leadership',
      'Executive Coaching by Former Female Ministers'
    ]
  },
  {
    id: 'innovation-challenge',
    title: 'Pan-African Innovation Challenge',
    category: 'Hardware, Energy & Infrastructure',
    stats: '$5M Awarded in Seed Capital',
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&h=600&fit=crop&q=80',
    description: 'Annual competitive accelerator funding young engineers building solar microgrids, clean technology, and water purification solutions across Africa.',
    duration: '4 Months Accelerator',
    eligibility: 'Youth Tech Ventures with Functional Prototypes',
    curriculum: [
      'Prototyping & Supply Chain Localization',
      'Intellectual Property Rights under AfCFTA',
      'Investor Readiness & Pitching to Venture Capitalists'
    ]
  },
  {
    id: 'future-summit',
    title: 'Africa Future Policy Summit & Fellowship',
    category: 'Pan-African Institutional Dialogue',
    stats: '1,500 High-Level Delegates',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=600&fit=crop&q=80',
    description: 'Premier assembly gathering ministers, youth delegates, university vice-chancellors, and policy researchers in Kigali to chart continental policy priorities.',
    duration: '4-Day Annual Assembly',
    eligibility: 'Accredited Delegates, Scholars, and Youth Fellows',
    curriculum: [
      'Presidential Keynote Sessions & Working Paper Reviews',
      'AU Agenda 2063 Youth Target Audits',
      'High-Level Diplomatic Networking Dinners'
    ]
  },
  {
    id: 'scholarships',
    title: 'Golden Minds Diplomatic Fellowships & Scholarships',
    category: 'Postgraduate Higher Education',
    stats: '2,500 Full Masters Scholarships Granted',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=600&fit=crop&q=80',
    description: 'Fully funded Masters and Doctoral fellowships in Public Administration, International Law, International Relations, and Economics at leading African universities.',
    duration: '1–2 Years Academic Degree',
    eligibility: 'Honors Degree Graduates with Outstanding Civic Service',
    curriculum: [
      'Full Tuition, Housing & Research Expense Coverage',
      'Direct Internship Placement at AU / UNECA Offices',
      'Publication Support in Pan-African Journals'
    ]
  },
  {
    id: 'public-governance-fellowship',
    title: 'Pan-African Governance & Policy Fellowship',
    category: 'Public Policy & Macroeconomics',
    stats: '20,000 Policy Analysts Trained',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=600&fit=crop&q=80',
    description: 'Training public sector analysts, legal researchers, and economists in evidence-based policy formulation, institutional audits, and regional trade regulation.',
    duration: '3 Months Certification',
    eligibility: 'Policy Researchers, Analysts & Public Servants',
    curriculum: [
      'Macroeconomic Policy Modeling & Fiscal Analysis',
      'AfCFTA Regional Integration & Tariff Protocols',
      'Public Sector Integrity & Good Governance Audits'
    ]
  }
];

export default function FeaturedPrograms() {
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [applySuccess, setApplySuccess] = useState(false);
  const [applicantForm, setApplicantForm] = useState({ name: '', email: '', country: 'Rwanda', motive: '' });

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setApplySuccess(true);
    setTimeout(() => {
      setApplySuccess(false);
      setSelectedProgram(null);
    }, 3000);
  };

  return (
    <section id="programs" className="py-24 px-6 md:px-12 lg:px-16 relative bg-gradient-to-b from-[#08080A] via-[#0E0E14] to-[#08080A] overflow-hidden">
      <div className="w-full relative z-10">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white">
            Featured Programs & <span className="text-gold-gradient">Fellowships</span>
          </h2>
          <p className="text-gray-400 mt-4 text-base md:text-lg">
            Empowering the next generation of African visionaries through fully funded fellowships, research grants, innovation challenges, and diplomatic placements.
          </p>
        </div>

        {/* 6 Programs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {PROGRAMS.map((prog) => (
            <motion.div
              key={prog.id}
              whileHover={{ y: -8 }}
              className="glass-card rounded-3xl overflow-hidden border border-white/10 hover:border-white/30 transition-all group flex flex-col justify-between shadow-xl"
            >
              <div>
                {/* Program Card Header Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={prog.image}
                    alt={prog.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F12] via-transparent to-black/30" />
                  
                  <span className="absolute top-4 left-4 px-3 py-1 bg-black/80 backdrop-blur-md rounded-full text-[11px] font-semibold text-white border border-white/20">
                    {prog.category}
                  </span>
                </div>

                <div className="p-6">
                  <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> {prog.stats}
                  </div>

                  <h3 className="text-2xl font-serif font-bold text-white group-hover:text-[#D4AF37] transition-colors mt-2">
                    {prog.title}
                  </h3>

                  <p className="text-sm text-gray-300 mt-3 leading-relaxed line-clamp-3">
                    {prog.description}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 mt-4">
                <button
                  onClick={() => setSelectedProgram(prog)}
                  className="w-full py-3 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#B8860B] text-black font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  Apply / View Curriculum <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Program Curriculum & Application Modal */}
      <AnimatePresence>
        {selectedProgram && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-2xl bg-[#0E0E12] border border-white/20 rounded-3xl p-8 shadow-2xl relative text-white max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => { setSelectedProgram(null); setApplySuccess(false); }}
                className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              {applySuccess ? (
                <div className="text-center py-10 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold">Application Submitted</h3>
                  <p className="text-sm text-gray-300">
                    Your application for <strong className="text-white">{selectedProgram.title}</strong> has been registered with the Admissions Board.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest">{selectedProgram.category}</span>
                    <h3 className="text-3xl font-serif font-bold text-white mt-1">{selectedProgram.title}</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs bg-white/5 p-4 rounded-2xl border border-white/10">
                    <div>
                      <span className="text-gray-400 block">Duration:</span>
                      <strong className="text-white font-semibold">{selectedProgram.duration}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Eligibility:</span>
                      <strong className="text-white font-semibold">{selectedProgram.eligibility}</strong>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-[#D4AF37] uppercase tracking-wider mb-2">Curriculum Highlights</h4>
                    <ul className="space-y-2 text-sm text-gray-200">
                      {selectedProgram.curriculum.map((curr, i) => (
                        <li key={i} className="flex items-center gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          {curr}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Application Form */}
                  <form onSubmit={handleApplySubmit} className="pt-4 space-y-3">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Submit Fellowship Application</h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        required
                        value={applicantForm.name}
                        onChange={(e) => setApplicantForm({ ...applicantForm, name: e.target.value })}
                        placeholder="Full Name"
                        className="px-4 py-2.5 bg-black/60 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-white/40"
                      />
                      <input
                        type="email"
                        required
                        value={applicantForm.email}
                        onChange={(e) => setApplicantForm({ ...applicantForm, email: e.target.value })}
                        placeholder="Email Address"
                        className="px-4 py-2.5 bg-black/60 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-white/40"
                      />
                    </div>

                    <textarea
                      rows={2}
                      required
                      value={applicantForm.motive}
                      onChange={(e) => setApplicantForm({ ...applicantForm, motive: e.target.value })}
                      placeholder="Briefly state your civic achievements and leadership ambition..."
                      className="w-full px-4 py-2 bg-black/60 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-white/40"
                    />

                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-full bg-white text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg hover:bg-gray-200"
                    >
                      <Send className="w-4 h-4" /> Submit Official Application
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
