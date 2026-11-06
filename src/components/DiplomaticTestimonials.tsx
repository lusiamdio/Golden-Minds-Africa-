import React from 'react';
import { motion } from 'motion/react';
import { Quote, Sparkles, Star } from 'lucide-react';

interface Testimonial {
  quote: string;
  author: string;
  title: string;
  organization: string;
  country: string;
  flag: string;
  avatar: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote: "Golden Minds Africa has established a benchmark for Pan-African youth governance. Their policy briefs directly informed our regional youth trade treaties.",
    author: "Hon. Jean-Paul Kagabo",
    title: "Minister of Youth & Public Innovation",
    organization: "Republic of Rwanda",
    country: "Rwanda",
    flag: "",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&q=80"
  },
  {
    quote: "The Diplomatic Fellowship gave me the constitutional law rigor and parliamentary negotiation skills required to lead national public policy committees.",
    author: "Amara Okafor",
    title: "Public Policy Fellow Cohort '25",
    organization: "African Union Youth Advisory Council",
    country: "Nigeria",
    flag: "",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop&q=80"
  },
  {
    quote: "Partnering with Golden Minds Africa allowed our university to co-author ground-breaking whitepapers on technology ethics and digital sovereignty in emerging markets.",
    author: "Prof. David Mbeki",
    title: "Dean of Public Governance",
    organization: "University of Witwatersrand",
    country: "South Africa",
    flag: "",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&q=80"
  }
];

export default function DiplomaticTestimonials() {
  return (
    <section className="py-24 px-6 relative bg-gradient-to-b from-[#08080A] via-[#0D0E14] to-[#08080A] overflow-hidden">
      <div className="container mx-auto max-w-7xl relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] text-xs font-semibold uppercase tracking-widest mb-3">
            <Quote className="w-3.5 h-3.5" /> Endorsements & Testimonials
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white">
            Endorsed by <span className="text-gold-gradient">Ministers & Scholars</span>
          </h2>
          <p className="text-gray-400 mt-4 text-base md:text-lg">
            Hear from government officials, academic deans, and diplomatic fellows on the transformative impact of Golden Minds Africa.
          </p>
        </div>

        {/* Testimonials Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -6 }}
              className="glass-card rounded-3xl p-8 border border-white/10 hover:border-white/30 transition-all flex flex-col justify-between relative shadow-xl"
            >
              <div>
                <div className="flex items-center gap-1 text-[#D4AF37] mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>

                <p className="text-gray-200 text-sm md:text-base leading-relaxed italic mb-6">
                  "{item.quote}"
                </p>
              </div>

              <div className="pt-6 flex items-center gap-4">
                <img
                  src={item.avatar}
                  alt={item.author}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white/20"
                />
                <div>
                  <div className="font-serif font-bold text-white text-base flex items-center gap-2">
                    {item.author}
                  </div>
                  <div className="text-xs text-[#D4AF37] font-medium">{item.title}</div>
                  <div className="text-[11px] text-gray-400">{item.organization}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
