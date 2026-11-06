import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Globe, 
  Landmark, 
  Sparkles, 
  Building2, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Users, 
  MapPin, 
  X, 
  Send, 
  Award, 
  Layers, 
  ExternalLink, 
  Handshake,
  BookOpen,
  Briefcase,
  Radio,
  Filter
} from 'lucide-react';

export interface Partner {
  id: string;
  name: string;
  category: 'strategic' | 'education' | 'corporate' | 'community' | 'media';
  categoryLabel: string;
  code: string;
  headquarters: string;
  focus: string;
  keyMoU: string;
  website?: string;
}

const PARTNERS: Partner[] = [
  // 1. Strategic & Governmental
  {
    id: 'au',
    name: 'African Union Commission',
    category: 'strategic',
    categoryLabel: 'Strategic & Governmental',
    code: 'AU',
    headquarters: 'Addis Ababa, Ethiopia',
    focus: 'Agenda 2063 & Pan-African Youth Governance Frameworks',
    keyMoU: 'Pan-African Youth Governance & Civic Engagement Accord',
    website: 'https://au.int'
  },
  {
    id: 'undp',
    name: 'United Nations Development Programme',
    category: 'strategic',
    categoryLabel: 'Strategic & Governmental',
    code: 'UNDP',
    headquarters: 'New York / African Regional Hubs',
    focus: 'Sustainable Development Goals & Public Policy Capacity',
    keyMoU: 'SDGs & Youth Public Leadership Capacity Compact',
    website: 'https://undp.org'
  },
  {
    id: 'afdb',
    name: 'African Development Bank Group',
    category: 'strategic',
    categoryLabel: 'Strategic & Governmental',
    code: 'AfDB',
    headquarters: "Abidjan, Côte d'Ivoire",
    focus: 'Youth Human Capital & Regional Infrastructure Financing',
    keyMoU: 'Jobs for Youth in Africa (JfYA) Capital Trust',
    website: 'https://afdb.org'
  },
  {
    id: 'sadc',
    name: 'SADC Secretariat',
    category: 'strategic',
    categoryLabel: 'Strategic & Governmental',
    code: 'SADC',
    headquarters: 'Gaborone, Botswana',
    focus: 'Southern Africa Trade, Peace & Youth Policy Integration',
    keyMoU: 'Southern African Industrialization & Youth Policy Protocol',
    website: 'https://sadc.int'
  },
  {
    id: 'eac',
    name: 'East African Community Secretariat',
    category: 'strategic',
    categoryLabel: 'Strategic & Governmental',
    code: 'EAC',
    headquarters: 'Arusha, Tanzania',
    focus: 'East Africa Common Market & Digital Youth Exchange',
    keyMoU: 'East Africa Digital Youth Innovation Compact',
    website: 'https://eac.int'
  },
  {
    id: 'ecowas',
    name: 'ECOWAS Commission',
    category: 'strategic',
    categoryLabel: 'Strategic & Governmental',
    code: 'ECOWAS',
    headquarters: 'Abuja, Nigeria',
    focus: 'West Africa Peace, Security & Democratic Governance',
    keyMoU: 'West African Youth Peace and Security Framework',
    website: 'https://ecowas.int'
  },

  // 2. Education & Academic
  {
    id: 'wits',
    name: 'University of the Witwatersrand',
    category: 'education',
    categoryLabel: 'Education & Academic',
    code: 'WITS',
    headquarters: 'Johannesburg, South Africa',
    focus: 'Governance Policy Research & Economic Leadership Labs',
    keyMoU: 'African Public Governance Research Consortium',
    website: 'https://wits.ac.za'
  },
  {
    id: 'uon',
    name: 'University of Nairobi',
    category: 'education',
    categoryLabel: 'Education & Academic',
    code: 'UoN',
    headquarters: 'Nairobi, Kenya',
    focus: 'Climate Policy Diplomacy & Geopolitical Research',
    keyMoU: 'East African Climate Diplomacy Policy Lab',
    website: 'https://uonbi.ac.ke'
  },
  {
    id: 'cairo',
    name: 'Cairo University',
    category: 'education',
    categoryLabel: 'Education & Academic',
    code: 'CAIRO',
    headquarters: 'Giza, Egypt',
    focus: 'Afro-Arab Legal Studies & Multilateral Diplomacy',
    keyMoU: 'Afro-Arab Public Law & Diplomatic Exchange',
    website: 'https://cu.edu.eg'
  },
  {
    id: 'unza',
    name: 'University of Zambia',
    category: 'education',
    categoryLabel: 'Education & Academic',
    code: 'UNZA',
    headquarters: 'Lusaka, Zambia',
    focus: 'Public Administration & Natural Resource Governance',
    keyMoU: 'Zambezian Resource Governance Policy Chair',
    website: 'https://unza.zm'
  },
  {
    id: 'uz',
    name: 'University of Zimbabwe',
    category: 'education',
    categoryLabel: 'Education & Academic',
    code: 'UZ',
    headquarters: 'Harare, Zimbabwe',
    focus: 'Agrarian Policy, Economic Reform & Youth Leadership',
    keyMoU: 'Southern Africa Agrarian Policy Research Fellowship',
    website: 'https://uz.ac.zw'
  },

  // 3. Corporate & Technology
  {
    id: 'std',
    name: 'Standard Bank Group',
    category: 'corporate',
    categoryLabel: 'Corporate & Technology',
    code: 'SBG',
    headquarters: 'Johannesburg, South Africa',
    focus: 'Youth Entrepreneurship Capital & Digital Trade Financing',
    keyMoU: 'Pan-African Youth Enterprise Growth Facility',
    website: 'https://standardbank.com'
  },
  {
    id: 'smart',
    name: 'Smart Africa Alliance',
    category: 'corporate',
    categoryLabel: 'Corporate & Technology',
    code: 'SMART',
    headquarters: 'Kigali, Rwanda',
    focus: 'Continental Single Digital Market & AI Governance',
    keyMoU: 'Pan-African Digital Skills & AI Policy Charter',
    website: 'https://smartafrica.org'
  },
  {
    id: 'tef',
    name: 'Tony Elumelu Foundation',
    category: 'corporate',
    categoryLabel: 'Corporate & Technology',
    code: 'TEF',
    headquarters: 'Lagos, Nigeria',
    focus: 'African Entrepreneurship Ecosystems & Seed Capital',
    keyMoU: 'Youth Economic Empowerment Accelerator Partnership',
    website: 'https://tonyelumelufoundation.org'
  },
  {
    id: 'dbsa',
    name: 'Development Bank of Southern Africa',
    category: 'corporate',
    categoryLabel: 'Corporate & Technology',
    code: 'DBSA',
    headquarters: 'Midrand, South Africa',
    focus: 'Sustainable Infrastructure & Green Finance Fellowships',
    keyMoU: 'Southern Africa Climate Infrastructure Capacity Alliance',
    website: 'https://dbsa.org'
  },

  // 4. Community & Youth
  {
    id: 'payu',
    name: 'Pan-African Youth Union',
    category: 'community',
    categoryLabel: 'Community & Youth',
    code: 'PYU',
    headquarters: 'Algiers / Continental Office',
    focus: 'Continental Youth Movement Mobilization & Policy Advocacy',
    keyMoU: 'African Youth Charter Civic Monitoring Compact',
    website: 'https://pyu.africa'
  },
  {
    id: 'sayf',
    name: 'Southern Africa Youth Forum',
    category: 'community',
    categoryLabel: 'Community & Youth',
    code: 'SAYF',
    headquarters: 'Gaborone, Botswana',
    focus: 'Regional Youth SADC Integration & Grassroots Leadership',
    keyMoU: 'SADC Youth Regional Civic Platform',
    website: 'https://sayf.org'
  },
  {
    id: 'eayp',
    name: 'East Africa Youth Parliament',
    category: 'community',
    categoryLabel: 'Community & Youth',
    code: 'EAYP',
    headquarters: 'Arusha, Tanzania',
    focus: 'Legislative Training, Model Assemblies & Civic Engagement',
    keyMoU: 'East African Parliamentary Youth Leadership Lab',
    website: 'https://eayp.org'
  },

  // 5. Media & Knowledge
  {
    id: 'iss',
    name: 'Institute for Security Studies',
    category: 'media',
    categoryLabel: 'Media & Knowledge',
    code: 'ISS',
    headquarters: 'Pretoria, South Africa',
    focus: 'Peace, Security, Crime & Justice Governance Policy Labs',
    keyMoU: 'African Geopolitical Analysis & Peace Research Network',
    website: 'https://issafrica.org'
  },
  {
    id: 'ecdpm',
    name: 'Center for Africa Policy & Trade Studies',
    category: 'media',
    categoryLabel: 'Media & Knowledge',
    code: 'CAPTS',
    headquarters: 'Accra, Ghana',
    focus: 'AfCFTA Trade Policy Research & Geopolitical Intelligence',
    keyMoU: 'AfCFTA Continental Youth Trade Knowledge Exchange',
    website: 'https://capts.africa'
  }
];

const CATEGORY_TABS = [
  { id: 'all', label: 'All Partners', icon: Landmark, count: PARTNERS.length },
  { id: 'strategic', label: 'Strategic & Governmental', icon: Landmark, count: PARTNERS.filter(p => p.category === 'strategic').length },
  { id: 'education', label: 'Education & Academic', icon: BookOpen, count: PARTNERS.filter(p => p.category === 'education').length },
  { id: 'corporate', label: 'Corporate & Technology', icon: Briefcase, count: PARTNERS.filter(p => p.category === 'corporate').length },
  { id: 'community', label: 'Community & Youth', icon: Users, count: PARTNERS.filter(p => p.category === 'community').length },
  { id: 'media', label: 'Media & Knowledge', icon: Radio, count: PARTNERS.filter(p => p.category === 'media').length },
];

export default function PartnerLogoWall() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);

  // Partner Application Modal State
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [partnerForm, setPartnerForm] = useState({
    name: '',
    orgName: '',
    orgType: 'University / Academic Institution',
    email: '',
    message: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const filteredPartners = selectedCategory === 'all'
    ? PARTNERS
    : PARTNERS.filter(p => p.category === selectedCategory);

  // Duplicate items to make the ticker scroll infinitely and seamlessly without gaps
  const displayPartners = filteredPartners.length < 8
    ? [...filteredPartners, ...filteredPartners, ...filteredPartners, ...filteredPartners]
    : [...filteredPartners, ...filteredPartners];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setIsPartnerModalOpen(false);
      setPartnerForm({
        name: '',
        orgName: '',
        orgType: 'University / Academic Institution',
        email: '',
        message: ''
      });
    }, 2500);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-24 px-4 sm:px-6 bg-[#08080C] border-t border-b border-white/10 relative overflow-hidden text-white">
      {/* Background Lighting Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#D4AF37]/5 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-[#0E7A57]/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="container mx-auto max-w-7xl relative z-10 space-y-16">

        {/* 1. Strong Clean Centered Section Header */}
        <div className="text-center max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-semibold uppercase tracking-widest shadow-inner">
            <Handshake className="w-3.5 h-3.5 text-[#D4AF37]" /> Our Partners & Global Network
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white tracking-tight leading-tight">
            Building Africa's Future Through <br className="hidden sm:inline" />
            <span className="text-gold-gradient">Strategic Partnerships, Knowledge Exchange</span> & Collective Action
          </h2>

          <p className="text-gray-300 text-sm sm:text-base md:text-lg max-w-3xl mx-auto leading-relaxed">
            Golden Minds Africa collaborates with institutions, organizations, businesses, universities and development partners committed to advancing African leadership, education and sustainable development.
          </p>
        </div>

        {/* 2. Impact Numbers Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-3xl bg-[#0F0F18] border border-white/10 backdrop-blur-md shadow-2xl text-center">
          <div className="p-3">
            <div className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[#D4AF37]">20+</div>
            <div className="text-xs sm:text-sm text-gray-300 font-medium mt-1">Institutional Partners</div>
          </div>
          <div className="p-3">
            <div className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-white">8+</div>
            <div className="text-xs sm:text-sm text-gray-300 font-medium mt-1">African Sovereign Countries</div>
          </div>
          <div className="p-3">
            <div className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[#D4AF37]">50,000+</div>
            <div className="text-xs sm:text-sm text-gray-300 font-medium mt-1">Young Leaders Reached</div>
          </div>
          <div className="p-3">
            <div className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-white">$50M+</div>
            <div className="text-xs sm:text-sm text-gray-300 font-medium mt-1">Joint Policy Commitments</div>
          </div>
        </div>

        {/* 3. Partner Categories Filter Dropbox & One-Line Scrolling Showcase */}
        <div className="space-y-8">
          <div className="flex items-center justify-center">
            <div className="relative w-full max-w-md">
              <div className="flex items-center gap-2.5 bg-[#0F0F18] border border-[#D4AF37]/40 rounded-2xl px-4 py-3 focus-within:border-[#D4AF37] transition-colors shadow-xl">
                <Filter className="w-4 h-4 text-[#D4AF37] shrink-0 pointer-events-none" />
                <span className="text-xs text-gray-400 font-medium shrink-0">Category:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-transparent text-xs sm:text-sm font-bold text-white focus:outline-none cursor-pointer [&>option]:bg-[#0E0E14] [&>option]:text-white"
                >
                  <option value="all">All Partners (20)</option>
                  <option value="strategic">Strategic & Governmental (6)</option>
                  <option value="education">Education & Academic (5)</option>
                  <option value="corporate">Corporate & Technology (4)</option>
                  <option value="community">Community & Youth (3)</option>
                  <option value="media">Media & Knowledge (2)</option>
                </select>
              </div>
            </div>
          </div>

          {/* One-Line Animated Partners Showcase (Scrolling Automatically Right to Left) */}
          <div className="relative overflow-hidden py-4 group">
            {/* Fade Edges Gradient Overlays */}
            <div className="absolute left-0 top-0 bottom-0 w-20 sm:w-28 z-10 bg-gradient-to-r from-[#08080C] to-transparent pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-20 sm:w-28 z-10 bg-gradient-to-l from-[#08080C] to-transparent pointer-events-none" />

            <div className="flex gap-6 animate-marquee whitespace-nowrap">
              {displayPartners.map((partner, index) => (
                <div
                  key={`${partner.id}-${index}`}
                  onClick={() => setSelectedPartner(partner)}
                  className="w-[280px] sm:w-[340px] p-5 rounded-2xl bg-[#0E0E16]/90 border border-white/10 hover:border-[#D4AF37] transition-all duration-300 cursor-pointer shrink-0 shadow-lg hover:shadow-[#D4AF37]/20 hover:-translate-y-1 relative group/card flex flex-col justify-between backdrop-blur-md whitespace-normal"
                >
                  <div>
                    {/* Header: Code Logo & Category Pill */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1C1C28] to-black border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] font-serif font-bold text-xs tracking-wider shadow group-hover/card:border-[#D4AF37] group-hover/card:scale-105 transition-all">
                        {partner.code}
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-semibold text-gray-300 uppercase tracking-wider">
                        {partner.category}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-serif font-bold text-white group-hover/card:text-[#D4AF37] transition-colors leading-snug line-clamp-1">
                      {partner.name}
                    </h3>

                    <p className="text-xs text-gray-300 mt-1.5 leading-relaxed font-sans line-clamp-2">
                      <strong className="text-white font-medium">Focus:</strong> {partner.focus}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-400">
                    <span className="flex items-center gap-1 text-gray-400 truncate max-w-[170px]">
                      <MapPin className="w-3 h-3 text-[#D4AF37] shrink-0" />
                      {partner.headquarters}
                    </span>
                    <span className="text-[#D4AF37] font-bold flex items-center gap-1 group-hover/card:underline">
                      Details <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" /> Hover over any partner card to pause scrolling or click to view full charter
            </p>
          </div>
        </div>

        {/* 4. Finish With Partnership Call to Action (CTA) */}
        <div className="rounded-3xl bg-gradient-to-r from-[#12121D] via-[#1A1A28] to-[#12121D] border border-white/15 p-8 sm:p-12 text-center space-y-6 relative overflow-hidden shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] mx-auto shadow-inner">
            <Handshake className="w-8 h-8" />
          </div>

          <div className="max-w-2xl mx-auto space-y-3">
            <h3 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
              Let's Build Africa's Future Together.
            </h3>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
              We welcome institutions, universities, businesses, governments and organizations that share our commitment to African leadership, education and sustainable development.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => setIsPartnerModalOpen(true)}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black font-serif font-bold text-sm uppercase tracking-wider hover:brightness-110 transition-all shadow-xl shadow-[#D4AF37]/20 flex items-center justify-center gap-2 group"
            >
              <span>Become a Partner</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => scrollToSection('map')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/20 text-white font-serif font-semibold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2"
            >
              <Globe className="w-4 h-4 text-[#D4AF37]" />
              <span>Explore Our Impact</span>
            </button>
          </div>
        </div>

      </div>

      {/* Alliance Charter Detail Modal */}
      <AnimatePresence>
        {selectedPartner && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-[#0E0E16] border border-[#D4AF37]/60 shadow-2xl relative text-left text-white"
            >
              <button
                onClick={() => setSelectedPartner(null)}
                className="absolute top-5 right-5 p-2 rounded-full bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1F1F2C] to-black border-2 border-[#D4AF37] flex items-center justify-center text-[#D4AF37] font-bold font-serif text-lg tracking-wider shadow-lg">
                  {selectedPartner.code}
                </div>
                <div>
                  <span className="px-3 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">
                    {selectedPartner.categoryLabel}
                  </span>
                  <h3 className="text-xl font-serif font-bold text-white mt-1">
                    {selectedPartner.name}
                  </h3>
                </div>
              </div>

              <div className="space-y-4 text-xs text-gray-300 p-4 rounded-2xl bg-black/60 border border-white/10">
                <div>
                  <span className="text-gray-400 font-medium block">Headquarters:</span>
                  <span className="text-white font-semibold text-sm">{selectedPartner.headquarters}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-medium block">Strategic Mandate:</span>
                  <span className="text-white text-sm">{selectedPartner.focus}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-medium block">Accredited Accord / MoU:</span>
                  <span className="text-[#D4AF37] font-semibold text-sm flex items-center gap-1.5 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0" /> {selectedPartner.keyMoU}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                {selectedPartner.website ? (
                  <a
                    href={selectedPartner.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-[#D4AF37] hover:underline font-semibold"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Visit Partner Portal
                  </a>
                ) : <span />}

                <button
                  onClick={() => setSelectedPartner(null)}
                  className="px-6 py-2.5 rounded-full bg-[#D4AF37] text-black font-serif font-bold text-xs uppercase tracking-wider hover:bg-[#F3E5AB] transition-colors shadow-lg"
                >
                  Close Charter View
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Become a Partner Inquiry Modal */}
      <AnimatePresence>
        {isPartnerModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-xl p-6 sm:p-8 rounded-3xl bg-[#0E0E18] border border-[#D4AF37]/60 shadow-2xl relative text-left text-white"
            >
              <button
                onClick={() => setIsPartnerModalOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-full bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
                  <Handshake className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-white">Partner With Golden Minds Africa</h3>
                  <p className="text-xs text-gray-400">Join our Pan-African institutional network and co-create impact.</p>
                </div>
              </div>

              {formSubmitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto shadow-lg">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-serif font-bold text-white">Partnership Inquiry Submitted!</h4>
                  <p className="text-sm text-gray-300 max-w-sm mx-auto">
                    Thank you. Our Secretariat and Multilateral Directorate will review your proposal and respond shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1.5">Your Full Name *</label>
                      <input
                        type="text"
                        required
                        value={partnerForm.name}
                        onChange={e => setPartnerForm({ ...partnerForm, name: e.target.value })}
                        placeholder="e.g. Dr. Amina Diop"
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1.5">Official Email *</label>
                      <input
                        type="email"
                        required
                        value={partnerForm.email}
                        onChange={e => setPartnerForm({ ...partnerForm, email: e.target.value })}
                        placeholder="partner@institution.org"
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1.5">Organization / Institution *</label>
                      <input
                        type="text"
                        required
                        value={partnerForm.orgName}
                        onChange={e => setPartnerForm({ ...partnerForm, orgName: e.target.value })}
                        placeholder="e.g. University of Nairobi"
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1.5">Organization Category</label>
                      <select
                        value={partnerForm.orgType}
                        onChange={e => setPartnerForm({ ...partnerForm, orgType: e.target.value })}
                        className="w-full bg-black/80 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                      >
                        <option value="Government / Multilateral Agency">Government / Multilateral Agency</option>
                        <option value="University / Academic Institution">University / Academic Institution</option>
                        <option value="Corporate / Tech Company">Corporate / Tech Company</option>
                        <option value="Youth Organization / NGO">Youth Organization / NGO</option>
                        <option value="Media / Research Think Tank">Media / Research Think Tank</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">Partnership Proposal / Focus Note</label>
                    <textarea
                      rows={3}
                      value={partnerForm.message}
                      onChange={e => setPartnerForm({ ...partnerForm, message: e.target.value })}
                      placeholder="Briefly outline your proposed area of collaboration or joint fellowship research..."
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsPartnerModalOpen(false)}
                      className="px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold uppercase tracking-wider"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black font-serif font-bold text-xs uppercase tracking-wider hover:brightness-110 transition-all flex items-center gap-1.5 shadow-lg shadow-[#D4AF37]/20"
                    >
                      <Send className="w-3.5 h-3.5" /> Submit Partnership Proposal
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
}
