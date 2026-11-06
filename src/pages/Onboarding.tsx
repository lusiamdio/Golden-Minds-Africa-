import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronRight, 
  Camera, 
  Target, 
  Brain, 
  BookOpen, 
  CheckCircle2, 
  Sparkles, 
  Globe, 
  Award,
  ArrowRight,
  Shield,
  Upload,
  User,
  Building,
  MapPin,
  Check,
  RefreshCw,
  ExternalLink,
  Linkedin,
  FileText
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { useAuth } from '../contexts/AuthContext';
import { AFRICAN_COUNTRIES } from '../data/africanCountries';
import { PRESET_AVATARS, PRESET_COVERS, compressImageFile } from '../lib/imageUtils';
import { toast } from 'sonner';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const STRATEGIC_PILLARS = [
  { id: 'geopolitics', label: 'Geopolitics & Multilateral Diplomacy', icon: '🏛️', desc: 'Sovereignty, border security, regional pacts & AU Agenda 2063' },
  { id: 'technology', label: 'AI Sovereignty & Digital Infrastructure', icon: '💻', desc: 'Compute clusters, cross-border fiber, data privacy & African LLMs' },
  { id: 'climate', label: 'Energy Transition & Climate Governance', icon: '⚡', desc: 'Renewable microgrids, mineral value-chains & carbon trading' },
  { id: 'trade', label: 'AfCFTA Intra-African Trade & Finance', icon: '🌍', desc: 'Tariff reduction, pan-African payment systems & logistics hubs' },
  { id: 'ethics', label: 'Ethical Governance & Anti-Corruption', icon: '⚖️', desc: 'Public financial oversight, rule of law & civic transparency' },
  { id: 'health', label: 'Public Health & Bio-Security Innovation', icon: '🧬', desc: 'Continental vaccine production, telemedicine & epidemic defense' }
];

const LEADERSHIP_TIERS = [
  {
    id: 'emerging',
    title: 'Emerging Fellow',
    cohortTag: 'Foundational Track',
    desc: 'Developing initial frameworks in public policy, civic engagement, and grassroots diplomacy.',
    icon: '🌱'
  },
  {
    id: 'practitioner',
    title: 'Strategic Practitioner',
    cohortTag: 'Applied Governance Track',
    desc: 'Actively running community initiatives, civil society projects, or tech-enabled public programs.',
    icon: '🚀'
  },
  {
    id: 'architect',
    title: 'Policy Architect & Diplomatic Fellow',
    cohortTag: 'Executive Leadership Track',
    desc: 'Drafting high-level legislation, directing continental youth forums, and structuring policy memos.',
    icon: '👑'
  }
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { profile, updateProfile } = useAuth();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  // Form State initialized from current profile or sensible defaults
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    headline: profile?.headline || 'Public Policy Fellow | Pan-African Energy Reform & Trade Diplomacy',
    country: profile?.country || 'Rwanda',
    city: profile?.city || 'Kigali',
    organization: profile?.organization || 'Golden Minds Africa Fellowship',
    cohort: profile?.cohort || 'Cohort 4 - 2026/2027',
    phone: profile?.phone || '+250 788 123 456',
    avatar: profile?.avatar || PRESET_AVATARS[0].url,
    coverImage: profile?.coverImage || PRESET_COVERS[0].url,
    focusAreas: profile?.focusAreas || ['Geopolitics & Multilateral Diplomacy', 'AfCFTA Intra-African Trade & Finance'],
    leadershipTrack: profile?.leadershipTrack || 'Strategic Practitioner',
    bio: profile?.bio || 'Dedicated to advancing continental integration, ethical public governance, and economic empowerment across Africa through the Golden Minds Africa Fellowship.',
    skills: profile?.skills || 'Policy Formulation, Multilateral Diplomacy, AfCFTA Strategy, Public Speaking, Strategic Foresight'
  });

  const [customSkillInput, setCustomSkillInput] = useState('');
  const [commitments, setCommitments] = useState({
    charter: false,
    attendance: false,
    integrity: false
  });

  // AI Assistant preview state
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Keep local formData in sync if profile loads later
  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || profile.name || '',
        headline: prev.headline || profile.headline || '',
        country: prev.country || profile.country || 'Rwanda',
        city: prev.city || profile.city || 'Kigali',
        organization: prev.organization || profile.organization || 'Golden Minds Africa Fellowship',
        avatar: prev.avatar || profile.avatar || PRESET_AVATARS[0].url,
        coverImage: prev.coverImage || profile.coverImage || PRESET_COVERS[0].url,
        bio: prev.bio || profile.bio || '',
        skills: prev.skills || profile.skills || ''
      }));
    }
  }, [profile]);

  // Real-time auto-saving helper
  const handleDataChange = (updates: Partial<typeof formData>) => {
    const nextData = { ...formData, ...updates };
    setFormData(nextData);

    // Save in real time across the platform
    updateProfile({
      name: nextData.name,
      headline: nextData.headline,
      country: nextData.country,
      city: nextData.city,
      organization: nextData.organization,
      cohort: nextData.cohort,
      phone: nextData.phone,
      avatar: nextData.avatar,
      coverImage: nextData.coverImage,
      focusAreas: nextData.focusAreas,
      leadershipTrack: nextData.leadershipTrack,
      bio: nextData.bio,
      skills: nextData.skills
    });
  };

  const nextStep = () => {
    setDirection(1);
    setStep(prev => Math.min(prev + 1, 6));
  };

  const prevStep = () => {
    setDirection(-1);
    setStep(prev => Math.max(prev - 1, 0));
  };

  // Profile Image Upload handler
  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      toast.loading('Processing profile photo...', { id: 'avatar-upload' });
      const compressedDataUrl = await compressImageFile(file, 600, 0.88);
      handleDataChange({ avatar: compressedDataUrl });
      toast.success('Profile photo updated in real time!', { id: 'avatar-upload' });
    } catch (err) {
      console.error(err);
      toast.error('Failed to process image. Please try another.', { id: 'avatar-upload' });
    }
  };

  // Cover Image Upload handler
  const handleCoverFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      toast.loading('Processing cover banner...', { id: 'cover-upload' });
      const compressedDataUrl = await compressImageFile(file, 1400, 0.85);
      handleDataChange({ coverImage: compressedDataUrl });
      toast.success('Cover banner updated in real time!', { id: 'cover-upload' });
    } catch (err) {
      console.error(err);
      toast.error('Failed to process cover image.', { id: 'cover-upload' });
    }
  };

  // AI Co-Pilot Interaction
  const handleAiInteraction = async () => {
    if (!aiQuery.trim()) return;
    setIsAiLoading(true);
    try {
      if (process.env.GEMINI_API_KEY) {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `You are the Golden Minds Africa Diplomatic Assistant. A fellow named ${formData.name || 'Fellow'} asked: "${aiQuery}". Respond in 2 crisp, inspiring sentences detailing how Golden Minds Africa supports their leadership track in ${formData.country || 'Africa'}.`
        });
        setAiResponse(response.text || 'Welcome to Golden Minds Africa. We are honored to accompany your leadership journey.');
      } else {
        setAiResponse(`Welcome, Fellow ${formData.name || 'Leader'}. The Golden Minds Africa ecosystem equips you with rigorous geopolitical frameworks, bilateral debate labs, and direct access to African institutional architects.`);
      }
    } catch (err) {
      setAiResponse(`Welcome, Fellow ${formData.name || 'Leader'}. You are equipped with direct access to our 54-nation peer network, policy repositories, and executive mentorship circles.`);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Complete Onboarding & Save
  const completeOnboarding = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem('onboardingComplete', 'true');
      await updateProfile({
        name: formData.name || 'Fellow',
        headline: formData.headline,
        country: formData.country,
        city: formData.city,
        organization: formData.organization,
        cohort: formData.cohort,
        phone: formData.phone,
        avatar: formData.avatar,
        coverImage: formData.coverImage,
        focusAreas: formData.focusAreas,
        leadershipTrack: formData.leadershipTrack,
        bio: formData.bio,
        skills: formData.skills,
        onboardingCompleted: true,
        participationScore: 100,
        attendanceStreak: 1
      });

      toast.success('Onboarding completed! Welcome to Golden Minds Africa Fellowship.', {
        description: 'Your verified LinkedIn-style profile is now live.'
      });
      navigate('/profile');
    } catch (err) {
      console.error(err);
      navigate('/profile');
    } finally {
      setIsSaving(false);
    }
  };

  // Slide animation variants
  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (dir: number) => ({
      zIndex: 0,
      x: dir < 0 ? 300 : -300,
      opacity: 0
    })
  };

  // Steps configuration
  const STEPS_NAV = [
    { title: 'Charter & Vision', num: '01' },
    { title: 'Diplomatic Identity', num: '02' },
    { title: 'Visuals & Cover', num: '03' },
    { title: 'Strategic Pillars', num: '04' },
    { title: 'Leadership Track', num: '05' },
    { title: 'Oath & Launch', num: '06' }
  ];

  return (
    <div className="min-h-screen bg-[#080d0a] text-white flex flex-col font-sans selection:bg-[#d4af37]/30 selection:text-[#d4af37]">
      {/* Background Subtle Watermark */}
      <div 
        className="fixed inset-0 opacity-[0.035] pointer-events-none bg-repeat"
        style={{ 
          backgroundImage: 'radial-gradient(#d4af37 1px, transparent 1px)',
          backgroundSize: '24px 24px' 
        }} 
      />

      {/* Top Institutional Header */}
      <header className="relative z-20 border-b border-[#1b2f24] bg-[#080d0a]/90 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#d4af37] to-amber-700 flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.3)]">
            <Globe className="w-5 h-5 text-[#080d0a]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-base tracking-wide text-white">GOLDEN MINDS AFRICA</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30">
                FELLOWSHIP ACCREDITATION
              </span>
            </div>
            <p className="text-[11px] text-gray-400 hidden sm:block">Pan-African Diplomatic Leadership & Technology Sovereignty</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="hidden md:flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Real-time Data Sync Active</span>
          </div>

          <button
            onClick={() => {
              sessionStorage.removeItem('gma_portal_active');
              navigate('/');
            }}
            className="text-xs text-gray-400 hover:text-[#d4af37] transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-800 hover:border-[#d4af37]/40 cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>Website</span>
          </button>

          <button
            onClick={() => navigate('/profile')}
            className="text-xs text-gray-400 hover:text-[#d4af37] transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-800 hover:border-[#d4af37]/40"
          >
            <span>Skip to Profile</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Institutional Stepper Indicator */}
      <div className="relative z-10 border-b border-[#16271e] bg-[#0c1611]/80 px-4 sm:px-8 py-2.5 overflow-x-auto scrollbar-none">
        <div className="max-w-6xl mx-auto flex items-center justify-between min-w-[620px]">
          {STEPS_NAV.map((s, idx) => (
            <div 
              key={idx}
              onClick={() => {
                setDirection(idx > step ? 1 : -1);
                setStep(idx);
              }}
              className={`flex items-center gap-2.5 cursor-pointer group transition-all ${
                step === idx 
                  ? 'text-[#d4af37] font-semibold' 
                  : step > idx 
                  ? 'text-emerald-400' 
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono border transition-all ${
                step === idx
                  ? 'border-[#d4af37] bg-[#d4af37]/20 text-[#d4af37] shadow-[0_0_10px_rgba(212,175,55,0.4)]'
                  : step > idx
                  ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                  : 'border-gray-700 bg-gray-900/60 text-gray-500 group-hover:border-gray-500'
              }`}>
                {step > idx ? <Check className="w-3.5 h-3.5" /> : idx + 1}
              </div>
              <span className="text-xs whitespace-nowrap">{s.title}</span>
              {idx < STEPS_NAV.length - 1 && (
                <div className="w-8 h-[1px] bg-gray-800 mx-1 hidden lg:block" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Split Layout: Left Form & Right Live LinkedIn Profile Preview */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 items-start">
        {/* Left Column: Interactive Flow Steps (7 cols on lg) */}
        <div className="lg:col-span-7 bg-[#0d1612]/90 border border-[#1b3124] rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-sm">
          {/* Subtle gold accent line on card top */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#d4af37]/70 to-transparent" />

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: "easeInOut" }}
              className="space-y-6"
            >
              {/* STEP 0: Welcome & Continental Charter */}
              {step === 0 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded bg-[#d4af37]/20 text-[#d4af37] text-xs font-mono font-bold">
                      PHASE I • INSTITUTIONAL CHARTER
                    </span>
                    <span className="text-xs text-gray-400">Cohort 4 Selection</span>
                  </div>

                  <div>
                    <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight leading-tight">
                      Welcome to the <span className="text-[#d4af37]">Golden Minds Africa</span> Fellowship
                    </h1>
                    <p className="mt-3 text-gray-300 text-sm sm:text-base leading-relaxed">
                      You are entering a sovereign continental leadership ecosystem designed to architect Africa's next fifty years. Here, high-caliber fellows convene to master multilateral diplomacy, AI governance, AfCFTA trade, and civic leadership.
                    </p>
                  </div>

                  {/* Institutional Pillars Highlight */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
                    <div className="p-3.5 rounded-xl bg-[#122119] border border-[#1e392b] text-left">
                      <div className="text-xl mb-1">🌍</div>
                      <div className="font-semibold text-white text-xs">54 African States</div>
                      <div className="text-[11px] text-gray-400 mt-0.5">Cross-border fellowship alliance</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#122119] border border-[#1e392b] text-left">
                      <div className="text-xl mb-1">🏛️</div>
                      <div className="font-semibold text-white text-xs">Agenda 2063</div>
                      <div className="text-[11px] text-gray-400 mt-0.5">Policy blueprints & capstones</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#122119] border border-[#1e392b] text-left">
                      <div className="text-xl mb-1">⚡</div>
                      <div className="font-semibold text-white text-xs">LinkedIn-Ready Profile</div>
                      <div className="text-[11px] text-gray-400 mt-0.5">Verified diplomatic credential</div>
                    </div>
                  </div>

                  <div className="bg-[#121c17] p-4 rounded-xl border border-dashed border-[#d4af37]/30 flex items-start gap-3">
                    <Shield className="w-5 h-5 text-[#d4af37] shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-300 leading-relaxed">
                      Every detail you input during this onboarding is <strong className="text-white">captured in real-time</strong> and synchronously establishes your verified professional profile, member badge, and fellowship directory dossier.
                    </p>
                  </div>

                  <button
                    onClick={nextStep}
                    className="w-full py-3.5 px-6 bg-gradient-to-r from-[#d4af37] to-amber-600 hover:from-amber-400 hover:to-amber-500 text-[#080d0a] font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(212,175,55,0.25)] hover:scale-[1.01]"
                  >
                    <span>Proceed to Diplomatic Identity</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* STEP 1: Diplomatic Identity & Credentials */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <span className="px-2.5 py-1 rounded bg-[#d4af37]/20 text-[#d4af37] text-xs font-mono font-bold">
                      PHASE II • DIPLOMATIC CREDENTIALS
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-2">
                      Establish Your Fellowship Identity
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-400 mt-1">
                      This information appears on your LinkedIn-style profile header, verification certificate, and cohort roster.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-gray-300 mb-1.5 block">
                        Full Legal / Diplomatic Name <span className="text-[#d4af37]">*</span>
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleDataChange({ name: e.target.value })}
                          placeholder="e.g. Amina Mensah"
                          className="w-full pl-10 pr-4 py-2.5 bg-[#121f18] border border-[#1f372a] focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] rounded-xl text-white text-sm outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-300 mb-1.5 block">
                        Professional Headline (Similar to LinkedIn) <span className="text-[#d4af37]">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.headline}
                        onChange={(e) => handleDataChange({ headline: e.target.value })}
                        placeholder="e.g. Fellow @ Golden Minds Africa | Pan-African Energy Reform & Trade Policy"
                        className="w-full px-4 py-2.5 bg-[#121f18] border border-[#1f372a] focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] rounded-xl text-white text-sm outline-none transition-all"
                      />
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <span className="text-[10px] text-gray-500 self-center">Suggestions:</span>
                        {[
                          'Energy Transition Fellow @ GMA | AfCFTA Diplomat',
                          'AI Governance & Digital Sovereignty Fellow',
                          'Public Policy Architect | Youth Representative'
                        ].map((sug, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleDataChange({ headline: sug })}
                            className="text-[10px] px-2 py-0.5 rounded bg-[#16271e] text-gray-300 hover:text-[#d4af37] border border-gray-800 hover:border-[#d4af37]/40 transition-colors"
                          >
                            + {sug}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-gray-300 mb-1.5 block">
                          Country of Representation <span className="text-[#d4af37]">*</span>
                        </label>
                        <select
                          value={formData.country}
                          onChange={(e) => handleDataChange({ country: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-[#121f18] border border-[#1f372a] focus:border-[#d4af37] rounded-xl text-white text-sm outline-none transition-all"
                        >
                          {AFRICAN_COUNTRIES.map((c) => (
                            <option key={c.code} value={c.name} className="bg-[#0f1a14] text-white">
                              {c.name} ({c.region})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-gray-300 mb-1.5 block">
                          City / Base Location
                        </label>
                        <div className="relative">
                          <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                          <input
                            type="text"
                            value={formData.city}
                            onChange={(e) => handleDataChange({ city: e.target.value })}
                            placeholder="e.g. Kigali, Accra, Nairobi"
                            className="w-full pl-10 pr-4 py-2.5 bg-[#121f18] border border-[#1f372a] focus:border-[#d4af37] rounded-xl text-white text-sm outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-gray-300 mb-1.5 block">
                          Current Organization / University
                        </label>
                        <div className="relative">
                          <Building className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                          <input
                            type="text"
                            value={formData.organization}
                            onChange={(e) => handleDataChange({ organization: e.target.value })}
                            placeholder="e.g. Ministry of Innovation / University"
                            className="w-full pl-10 pr-4 py-2.5 bg-[#121f18] border border-[#1f372a] focus:border-[#d4af37] rounded-xl text-white text-sm outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-gray-300 mb-1.5 block">
                          Fellowship Cohort
                        </label>
                        <input
                          type="text"
                          value={formData.cohort}
                          disabled
                          className="w-full px-4 py-2.5 bg-[#0a120e] border border-gray-800 rounded-xl text-[#d4af37] text-sm font-mono cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-[#1b3124]">
                    <button
                      onClick={prevStep}
                      className="px-5 py-3 rounded-xl border border-gray-800 hover:border-gray-700 text-gray-400 hover:text-white text-sm transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={nextStep}
                      disabled={!formData.name.trim()}
                      className="flex-1 py-3 px-6 bg-[#d4af37] hover:bg-amber-400 disabled:opacity-50 text-[#080d0a] font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                    >
                      <span>Proceed to Media & Visuals</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Visual Identity (Profile Image & Cover Image Upload) */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <span className="px-2.5 py-1 rounded bg-[#d4af37]/20 text-[#d4af37] text-xs font-mono font-bold">
                      PHASE III • VISUAL IDENTITY & BRANDING
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-2">
                      Upload Profile & Cover Images
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-400 mt-1">
                      Upload your high-resolution profile portrait and panoramic cover banner for a professional, LinkedIn-style presentation.
                    </p>
                  </div>

                  {/* Profile Picture Upload Section */}
                  <div className="p-4 rounded-xl bg-[#121f18] border border-[#1f372a] space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                          <User className="w-4 h-4 text-[#d4af37]" />
                          Profile Photo
                        </h3>
                        <p className="text-xs text-gray-400">Crisp square headshot (auto-compressed in real time)</p>
                      </div>

                      <button
                        onClick={() => avatarInputRef.current?.click()}
                        className="px-3.5 py-1.5 bg-[#d4af37] hover:bg-amber-400 text-[#080d0a] font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Custom Photo</span>
                      </button>
                      <input
                        type="file"
                        ref={avatarInputRef}
                        onChange={handleAvatarFile}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>

                    {/* Presets Gallery for Avatar */}
                    <div>
                      <p className="text-[11px] text-gray-400 mb-2">Or select a curated diplomatic fellow portrait:</p>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {PRESET_AVATARS.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => handleDataChange({ avatar: item.url })}
                            className={`group relative rounded-xl overflow-hidden cursor-pointer border-2 transition-all aspect-square ${
                              formData.avatar === item.url
                                ? 'border-[#d4af37] shadow-[0_0_12px_rgba(212,175,55,0.4)] scale-105'
                                : 'border-gray-800 hover:border-gray-600 opacity-70 hover:opacity-100'
                            }`}
                          >
                            <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                            {formData.avatar === item.url && (
                              <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#d4af37] text-[#080d0a] flex items-center justify-center">
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Cover Banner Upload Section */}
                  <div className="p-4 rounded-xl bg-[#121f18] border border-[#1f372a] space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                          <Camera className="w-4 h-4 text-[#d4af37]" />
                          Profile Cover Banner (LinkedIn Panoramic)
                        </h3>
                        <p className="text-xs text-gray-400">Appears behind your header across the directory</p>
                      </div>

                      <button
                        onClick={() => coverInputRef.current?.click()}
                        className="px-3.5 py-1.5 bg-[#1b3124] hover:bg-[#254332] text-white border border-[#2b4c37] font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5 text-[#d4af37]" />
                        <span>Upload Cover</span>
                      </button>
                      <input
                        type="file"
                        ref={coverInputRef}
                        onChange={handleCoverFile}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>

                    {/* Presets Gallery for Cover */}
                    <div>
                      <p className="text-[11px] text-gray-400 mb-2">Or select an institutional pan-African cover banner:</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {PRESET_COVERS.map((cov) => (
                          <div
                            key={cov.id}
                            onClick={() => handleDataChange({ coverImage: cov.url })}
                            className={`group relative rounded-xl overflow-hidden cursor-pointer border-2 transition-all aspect-[3/1] ${
                              formData.coverImage === cov.url
                                ? 'border-[#d4af37] shadow-[0_0_12px_rgba(212,175,55,0.4)] scale-105'
                                : 'border-gray-800 hover:border-gray-600 opacity-70 hover:opacity-100'
                            }`}
                          >
                            <img src={cov.url} alt={cov.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1.5">
                              <span className="text-[10px] text-white font-medium truncate">{cov.name}</span>
                            </div>
                            {formData.coverImage === cov.url && (
                              <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#d4af37] text-[#080d0a] flex items-center justify-center">
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-[#1b3124]">
                    <button
                      onClick={prevStep}
                      className="px-5 py-3 rounded-xl border border-gray-800 hover:border-gray-700 text-gray-400 hover:text-white text-sm transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={nextStep}
                      className="flex-1 py-3 px-6 bg-[#d4af37] hover:bg-amber-400 text-[#080d0a] font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                    >
                      <span>Proceed to Strategic Pillars</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Strategic Focus Areas & Policy Pillars */}
              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <span className="px-2.5 py-1 rounded bg-[#d4af37]/20 text-[#d4af37] text-xs font-mono font-bold">
                      PHASE IV • POLICY PILLARS & SKILLS
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-2">
                      Select Strategic Focus Areas
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-400 mt-1">
                      Choose up to 3 continental policy pillars that represent your core expertise and capstone research.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {STRATEGIC_PILLARS.map((pillar) => {
                      const isSelected = formData.focusAreas.includes(pillar.label);
                      return (
                        <div
                          key={pillar.id}
                          onClick={() => {
                            if (isSelected) {
                              handleDataChange({
                                focusAreas: formData.focusAreas.filter(f => f !== pillar.label)
                              });
                            } else if (formData.focusAreas.length < 3) {
                              handleDataChange({
                                focusAreas: [...formData.focusAreas, pillar.label]
                              });
                            } else {
                              toast.info('Maximum 3 primary pillars can be selected.');
                            }
                          }}
                          className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                            isSelected
                              ? 'border-[#d4af37] bg-[#1a2d22] shadow-[0_0_15px_rgba(212,175,55,0.15)]'
                              : 'border-gray-800 bg-[#0f1a14] hover:border-gray-700'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xl">{pillar.icon}</span>
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                              isSelected ? 'border-[#d4af37] bg-[#d4af37] text-[#080d0a]' : 'border-gray-700'
                            }`}>
                              {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </div>
                          </div>
                          <div className="font-semibold text-white text-xs">{pillar.label}</div>
                          <div className="text-[11px] text-gray-400 mt-1 line-clamp-2">{pillar.desc}</div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Skills input */}
                  <div>
                    <label className="text-xs font-medium text-gray-300 mb-1.5 block">
                      Core Diplomatic & Technical Skills (Comma separated or add below)
                    </label>
                    <input
                      type="text"
                      value={formData.skills}
                      onChange={(e) => handleDataChange({ skills: e.target.value })}
                      placeholder="e.g. Policy Formulation, AfCFTA Strategy, AI Sovereignty, Multilateral Diplomacy"
                      className="w-full px-4 py-2.5 bg-[#121f18] border border-[#1f372a] focus:border-[#d4af37] rounded-xl text-white text-sm outline-none transition-all"
                    />
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-[#1b3124]">
                    <button
                      onClick={prevStep}
                      className="px-5 py-3 rounded-xl border border-gray-800 hover:border-gray-700 text-gray-400 hover:text-white text-sm transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={nextStep}
                      disabled={formData.focusAreas.length === 0}
                      className="flex-1 py-3 px-6 bg-[#d4af37] hover:bg-amber-400 disabled:opacity-50 text-[#080d0a] font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                    >
                      <span>Proceed to Leadership Track</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: Leadership Tier & Bio */}
              {step === 4 && (
                <div className="space-y-6">
                  <div>
                    <span className="px-2.5 py-1 rounded bg-[#d4af37]/20 text-[#d4af37] text-xs font-mono font-bold">
                      PHASE V • LEADERSHIP TRACK & BIOGRAPHY
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-2">
                      Define Your Track & Purpose
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-400 mt-1">
                      Select your operational tier within Golden Minds Africa and articulate your continental mission.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {LEADERSHIP_TIERS.map((tier) => {
                      const isSelected = formData.leadershipTrack === tier.title;
                      return (
                        <div
                          key={tier.id}
                          onClick={() => handleDataChange({ leadershipTrack: tier.title })}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start justify-between gap-4 ${
                            isSelected
                              ? 'border-[#d4af37] bg-[#1a2d22] shadow-[0_0_15px_rgba(212,175,55,0.15)]'
                              : 'border-gray-800 bg-[#0f1a14] hover:border-gray-700'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">{tier.icon}</span>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-white text-sm">{tier.title}</h3>
                                <span className="text-[10px] px-2 py-0.5 rounded bg-[#d4af37]/15 text-[#d4af37] font-mono">
                                  {tier.cohortTag}
                                </span>
                              </div>
                              <p className="text-xs text-gray-400 mt-1">{tier.desc}</p>
                            </div>
                          </div>
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center border mt-0.5 ${
                            isSelected ? 'border-[#d4af37] bg-[#d4af37] text-[#080d0a]' : 'border-gray-700'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Bio / Statement of Purpose */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-medium text-gray-300">
                        Institutional Biography / Statement of Purpose
                      </label>
                      <span className="text-[10px] text-gray-500 font-mono">
                        {formData.bio.length} characters
                      </span>
                    </div>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => handleDataChange({ bio: e.target.value })}
                      rows={4}
                      placeholder="Describe your vision for Africa, your background, and the impact you aim to deliver through this fellowship..."
                      className="w-full px-4 py-3 bg-[#121f18] border border-[#1f372a] focus:border-[#d4af37] rounded-xl text-white text-sm outline-none transition-all leading-relaxed"
                    />
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-[#1b3124]">
                    <button
                      onClick={prevStep}
                      className="px-5 py-3 rounded-xl border border-gray-800 hover:border-gray-700 text-gray-400 hover:text-white text-sm transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={nextStep}
                      className="flex-1 py-3 px-6 bg-[#d4af37] hover:bg-amber-400 text-[#080d0a] font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                    >
                      <span>Proceed to Oath & Launch</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 5: Institutional Commitment & Launch */}
              {step === 5 && (
                <div className="space-y-6">
                  <div>
                    <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold">
                      PHASE VI • OATH & DIPLOMATIC ACCREDITATION
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-2">
                      Institutional Oath of Leadership
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-400 mt-1">
                      Affirm the foundational standards of the Golden Minds Africa Fellowship before stepping into the continental network.
                    </p>
                  </div>

                  {/* 3 Interactive Commitments */}
                  <div className="space-y-3">
                    <div 
                      onClick={() => setCommitments(c => ({ ...c, charter: !c.charter }))}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        commitments.charter ? 'border-emerald-500 bg-emerald-950/20' : 'border-gray-800 bg-[#0f1a14]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                          commitments.charter ? 'bg-emerald-500 text-black' : 'bg-gray-800 text-gray-400'
                        }`}>
                          <Shield className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white">Adherence to Continental Charter</h4>
                          <p className="text-[11px] text-gray-400">Pledge to uphold ethical governance, Pan-African unity, and anti-corruption standards.</p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                        commitments.charter ? 'bg-emerald-500 border-emerald-500 text-black' : 'border-gray-700'
                      }`}>
                        {commitments.charter && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>

                    <div 
                      onClick={() => setCommitments(c => ({ ...c, attendance: !c.attendance }))}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        commitments.attendance ? 'border-emerald-500 bg-emerald-950/20' : 'border-gray-800 bg-[#0f1a14]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                          commitments.attendance ? 'bg-emerald-500 text-black' : 'bg-gray-800 text-gray-400'
                        }`}>
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white">90%+ Active Live Participation</h4>
                          <p className="text-[11px] text-gray-400">Commit to attending plenary sessions, policy debates, and peer simulation councils.</p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                        commitments.attendance ? 'bg-emerald-500 border-emerald-500 text-black' : 'border-gray-700'
                      }`}>
                        {commitments.attendance && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>

                    <div 
                      onClick={() => setCommitments(c => ({ ...c, integrity: !c.integrity }))}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        commitments.integrity ? 'border-emerald-500 bg-emerald-950/20' : 'border-gray-800 bg-[#0f1a14]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                          commitments.integrity ? 'bg-emerald-500 text-black' : 'bg-gray-800 text-gray-400'
                        }`}>
                          <Award className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white">Cross-Border Peer Collaboration</h4>
                          <p className="text-[11px] text-gray-400">Collaborate transparently with peers across all 5 regions of Africa without bias.</p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                        commitments.integrity ? 'bg-emerald-500 border-emerald-500 text-black' : 'border-gray-700'
                      }`}>
                        {commitments.integrity && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  </div>

                  {/* AI Copilot Quick Check */}
                  <div className="bg-[#121f18] border border-[#1f372a] rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                      <Sparkles className="w-4 h-4" />
                      <span>Meet Your Diplomatic AI Co-Pilot</span>
                    </div>

                    {aiResponse ? (
                      <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-xs text-emerald-200 leading-relaxed">
                        {aiResponse}
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={aiQuery}
                          onChange={(e) => setAiQuery(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAiInteraction()}
                          placeholder="Ask AI: How does this fellowship help me influence policy?"
                          className="flex-1 px-3 py-2 bg-[#0a120e] border border-gray-800 rounded-lg text-xs text-white outline-none focus:border-emerald-500"
                        />
                        <button
                          onClick={handleAiInteraction}
                          disabled={isAiLoading || !aiQuery.trim()}
                          className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors"
                        >
                          {isAiLoading ? 'Synthesizing...' : 'Test AI'}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-[#1b3124]">
                    <button
                      onClick={prevStep}
                      className="px-5 py-3 rounded-xl border border-gray-800 hover:border-gray-700 text-gray-400 hover:text-white text-sm transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={completeOnboarding}
                      disabled={isSaving || !commitments.charter || !commitments.attendance || !commitments.integrity}
                      className="flex-1 py-3.5 px-6 bg-gradient-to-r from-[#d4af37] via-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 disabled:opacity-40 text-[#080d0a] font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_30px_rgba(212,175,55,0.35)] hover:scale-[1.01]"
                    >
                      {isSaving ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Finalizing Accreditation...</span>
                        </>
                      ) : (
                        <>
                          <Award className="w-4 h-4" />
                          <span>Finalize & Launch My LinkedIn Fellowship Profile</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Column: Live Real-Time LinkedIn Profile & Credential Preview (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-5 sticky top-24">
          <div className="flex items-center justify-between text-xs text-gray-400 px-1">
            <span className="font-mono flex items-center gap-1.5 uppercase font-semibold text-gray-300">
              <span className="w-2 h-2 rounded-full bg-[#d4af37] animate-ping" />
              Live Profile Preview (LinkedIn Format)
            </span>
            <span className="text-[11px] text-[#d4af37]">Real-time rendering</span>
          </div>

          {/* LinkedIn-Style Profile Card Preview */}
          <div className="bg-white dark:bg-[#121c17] text-gray-900 dark:text-white rounded-2xl overflow-hidden border border-gray-200 dark:border-[#203a2c] shadow-2xl transition-all">
            {/* Cover Banner */}
            <div className="relative h-28 sm:h-32 w-full bg-gray-800 overflow-hidden group">
              <img
                src={formData.coverImage}
                alt="Profile Cover"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <button
                onClick={() => { setDirection(step < 2 ? 1 : -1); setStep(2); }}
                className="absolute top-2.5 right-2.5 p-1.5 bg-black/50 hover:bg-black/75 text-white rounded-full backdrop-blur-sm transition-colors text-[10px] flex items-center gap-1 px-2.5 border border-white/20"
                title="Change cover photo"
              >
                <Camera className="w-3 h-3 text-[#d4af37]" />
                <span className="hidden sm:inline">Edit Cover</span>
              </button>
            </div>

            {/* Profile Avatar & Header Information */}
            <div className="px-5 pb-5 pt-0 relative">
              {/* Overlapping Avatar */}
              <div className="flex items-end justify-between -mt-12 sm:-mt-14 mb-3">
                <div className="relative group">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white dark:border-[#121c17] bg-[#0c1611] overflow-hidden shadow-xl">
                    <img
                      src={formData.avatar}
                      alt={formData.name || 'Fellow Avatar'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-[#121c17]" title="Active Fellow Status" />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30 font-bold">
                    {formData.cohort}
                  </span>
                </div>
              </div>

              {/* Name & Headline */}
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                    {formData.name || 'Amina Mensah'}
                  </h3>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-[#d4af37] bg-[#d4af37]/10 px-2 py-0.5 rounded-full">
                    <Shield className="w-3 h-3 fill-[#d4af37]" />
                    <span>Verified Fellow</span>
                  </div>
                </div>

                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 font-medium leading-snug">
                  {formData.headline || 'Policy & Energy Governance Fellow at Golden Minds Africa'}
                </p>

                <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400 mt-2 flex-wrap">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#d4af37]" />
                    {formData.city ? `${formData.city}, ` : ''}{formData.country}
                  </span>
                  <span>•</span>
                  <span className="text-[#d4af37] font-semibold">500+ Fellow Network</span>
                  <span>•</span>
                  <span>{formData.organization}</span>
                </div>
              </div>

              {/* "Open to" Institutional Badge */}
              <div className="mt-3.5 p-2.5 rounded-xl bg-gray-50 dark:bg-[#0c1611] border border-gray-200 dark:border-[#1d3527]">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    Open to Pan-African Collaboration
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-mono">ACTIVE</span>
                </div>
                <p className="text-[11px] text-gray-600 dark:text-gray-300 mt-1">
                  Policy research, AfCFTA trade delegations, and youth multilateral forums.
                </p>
              </div>

              {/* Focus Pillars Chips */}
              {formData.focusAreas.length > 0 && (
                <div className="mt-3">
                  <div className="text-[10px] text-gray-400 uppercase font-mono mb-1.5">Strategic Focus</div>
                  <div className="flex flex-wrap gap-1.5">
                    {formData.focusAreas.map((f, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-[#16271e] text-[#d4af37] border border-[#d4af37]/30"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* About Snippet */}
              {formData.bio && (
                <div className="mt-3.5 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <span className="text-[10px] text-gray-400 uppercase font-mono block mb-1">About</span>
                  <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed">
                    {formData.bio}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Diplomatic Accreditation Passport Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#121f18] to-[#0a120e] border border-[#d4af37]/30 text-white shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[#d4af37]" />
                <span className="text-xs font-serif font-bold text-[#d4af37] tracking-wider uppercase">
                  Continental Fellow Credential
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30">
                GMA-ACCREDITED
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-gray-400 block text-[9px] uppercase font-mono">Fellow</span>
                <span className="font-semibold text-white truncate block">{formData.name || 'Amina Mensah'}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[9px] uppercase font-mono">Operational Tier</span>
                <span className="font-semibold text-emerald-400 truncate block">{formData.leadershipTrack}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[9px] uppercase font-mono">Jurisdiction</span>
                <span className="font-semibold text-white block">{formData.country}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[9px] uppercase font-mono">Status</span>
                <span className="font-semibold text-[#d4af37] block">Active Fellow</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
