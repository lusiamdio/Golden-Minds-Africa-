import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, BookOpen, GraduationCap, Calendar, Users, ArrowRight } from 'lucide-react';

interface CommandSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SEARCH_DATABASE = [
  { type: 'Program', title: 'Youth Leadership Fellowship 2026', link: '#programs' },
  { type: 'Program', title: 'Women in Public Office & Diplomacy Fellowship', link: '#programs' },
  { type: 'Program', title: 'Pan-African Governance & Policy Fellowship', link: '#programs' },
  { type: 'Research', title: 'The AfCFTA Youth Trade Manifesto 2026', link: '#newsroom' },
  { type: 'Research', title: 'Pan-African Governance Framework Whitepaper', link: '#newsroom' },
  { type: 'Research', title: 'Congo Basin Critical Minerals Diplomacy', link: '#newsroom' },
  { type: 'Leader', title: 'Lusimanadio Soki Simao - Founder & President', link: '#leadership' },
  { type: 'Leader', title: 'Dr. Amina Diop - Senior Diplomatic Advisor', link: '#leadership' }
];

export default function CommandSearchModal({ isOpen, onClose }: CommandSearchModalProps) {
  const [query, setQuery] = useState('');

  const results = query.trim()
    ? SEARCH_DATABASE.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.type.toLowerCase().includes(query.toLowerCase())
      )
    : SEARCH_DATABASE;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        className="w-full max-w-2xl bg-[#0E0E12] border border-white/20 rounded-3xl p-6 shadow-2xl relative text-white"
      >
        <div className="flex items-center gap-3 pb-4">
          <Search className="w-5 h-5 text-[#D4AF37]" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search programs, research papers, leaders..."
            className="w-full bg-transparent text-base text-white placeholder-gray-500 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-gray-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="mt-4 max-h-80 overflow-y-auto space-y-2 text-sm pr-1">
          {results.length === 0 ? (
            <div className="py-8 text-center text-gray-400">
              No matching diplomatic archives or policy briefs found.
            </div>
          ) : (
            results.map((item, index) => (
              <a
                key={index}
                href={item.link}
                onClick={onClose}
                className="p-3.5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 flex items-center justify-between text-gray-200 hover:text-white transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-0.5 rounded-md bg-[#D4AF37]/20 text-[#D4AF37] text-[10px] font-bold uppercase tracking-wider">
                    {item.type}
                  </span>
                  <span className="font-serif font-medium">{item.title}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
