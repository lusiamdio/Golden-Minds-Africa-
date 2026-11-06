import React, { useState } from 'react';
import { ShieldCheck, Globe, Mail, Phone, MapPin, Award, ArrowUp, Send, CheckCircle2 } from 'lucide-react';
import gmaLogo from '../assets/images/logo.png';
import { subscribeToNewsletter } from '../lib/supabase';
import LegalPolicyModal from './LegalPolicyModal';
import AfricanFlagsGrid from './AfricanFlagsGrid';

export default function DiplomaticFooter() {
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [subSuccess, setSubSuccess] = useState(false);
  const [subMessage, setSubMessage] = useState('');
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [legalTab, setLegalTab] = useState<'privacy' | 'terms'>('privacy');

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openLegalModal = (tab: 'privacy' | 'terms') => {
    setLegalTab(tab);
    setShowLegalModal(true);
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setSubscribing(true);
    setSubMessage('');

    const res = await subscribeToNewsletter(email.trim());
    setSubscribing(false);

    if (res.success) {
      setSubSuccess(true);
      setSubMessage(res.message);
      setEmail('');
    } else {
      setSubMessage('An error occurred. Please try again.');
    }
  };

  return (
    <footer className="bg-[#050507] text-gray-400 pt-20 pb-12 relative overflow-hidden">
      
      <div className="w-full px-6 md:px-12 lg:px-16 relative z-10">
        
        {/* Newsletter Subscription Banner */}
        <div className="mb-16 p-8 md:p-12 rounded-3xl bg-white/5 border border-white/10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center lg:text-left max-w-xl">
            <h3 className="text-xl md:text-2xl font-serif font-bold text-white tracking-tight">
              Subscribe to Pan-African Policy & Governance Dispatch
            </h3>
            <p className="text-xs md:text-sm text-gray-400 leading-relaxed">
              Get official briefs, research whitepapers, scholarship alerts, and summit invitations directly to your inbox.
            </p>
          </div>

          <div className="w-full lg:w-auto min-w-[320px] sm:min-w-[420px]">
            {subSuccess ? (
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium animate-fadeIn">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>{subMessage || 'Thank you for subscribing!'}</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your diplomatic or personal email..."
                    className="w-full pl-11 pr-4 py-3.5 bg-black/60 border border-white/15 rounded-full text-xs text-white placeholder-gray-500 focus:outline-none focus:border-white/40 transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={subscribing}
                  className="px-6 py-3.5 rounded-full bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-gray-200 transition-all flex items-center gap-2 shrink-0 disabled:opacity-50"
                >
                  {subscribing ? 'Joining...' : (
                    <>
                      <span>Subscribe</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Top Institutional Badges Banner */}
        <div className="pb-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white">
              <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wider">AU Agenda 2063</div>
              <div className="text-[11px] text-gray-400">Aligned with Goal 17: Youth Empowerment</div>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wider">UN Sustainable Goals</div>
              <div className="text-[11px] text-gray-400">Direct Contributor to SDGs 4, 8, 16 & 17</div>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wider">African Youth Charter</div>
              <div className="text-[11px] text-gray-400">Certified Governance Implementation Body</div>
            </div>
          </div>
        </div>

        {/* 54 Sovereign African Countries Flags Showcase */}
        <AfricanFlagsGrid />

        {/* Main Footer Links Columns */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Col 1: Brand & Headquarters - Larger Logo, No Text, No Gold Line */}
          <div className="lg:col-span-2 space-y-4">
            <a href="#" className="inline-block group">
              <img
                src={gmaLogo}
                alt="Logo"
                className="h-20 md:h-24 lg:h-28 w-auto object-contain filter drop-shadow-md group-hover:scale-105 transition-transform"
              />
            </a>

            <p className="text-xs leading-relaxed text-gray-400 max-w-sm">
              A premier Pan-African public policy, leadership development, research, and youth capital roundtable driving governance excellence across all 54 African nations.
            </p>

            <div className="space-y-2 text-xs pt-2 text-gray-300">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>Headquarters: Cape Town, Western Cape, South Africa</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>Secretariat Line: +27 67 617 1261</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>info@goldenmindsorganization.org</span>
              </div>
            </div>
          </div>

          {/* Col 2: Institutional Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Organization</h4>
            <ul className="space-y-2.5 text-xs">
              <li><a href="#about" className="hover:text-white transition-colors">About Governance Board</a></li>
              <li><a href="#leadership" className="hover:text-white transition-colors">Executive Board</a></li>
              <li><a href="#leadership" className="hover:text-white transition-colors">Diplomatic Advisors</a></li>
              <li><a href="#map" className="hover:text-white transition-colors">54 Member States Map</a></li>
              <li><a href="#donate" className="hover:text-white transition-colors">Institutional Partners</a></li>
            </ul>
          </div>

          {/* Col 3: Programs & Fellowships */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Fellowship</h4>
            <ul className="space-y-2.5 text-xs">
              <li><a href="#programs" className="hover:text-white transition-colors">Youth Leadership Fellowship</a></li>
              <li><a href="#programs" className="hover:text-white transition-colors">Women in Diplomacy Fellowship</a></li>
              <li><a href="#programs" className="hover:text-white transition-colors">Public Governance Fellowship</a></li>
              <li><a href="#programs" className="hover:text-white transition-colors">Postgraduate Scholarships</a></li>
              <li><a href="#programs" className="hover:text-white transition-colors">Pan-African Innovation Challenge</a></li>
            </ul>
          </div>

          {/* Col 4: Publications & Research */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Publications & Research</h4>
            <ul className="space-y-2.5 text-xs">
              <li><a href="#newsroom" className="hover:text-white transition-colors">AfCFTA Youth Trade Manifesto</a></li>
              <li><a href="#newsroom" className="hover:text-white transition-colors">Governance Framework Whitepaper</a></li>
              <li><a href="#newsroom" className="hover:text-white transition-colors">Policy Briefs Archive</a></li>
              <li><a href="#newsroom" className="hover:text-white transition-colors">Research Manuscripts</a></li>
              <li><a href="#donate" className="hover:text-white transition-colors">Donate / Sponsor</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-4">
          <div>
            © 2026 Pan-African Governance Organization. All rights reserved. Non-Profit Entity.
          </div>

          <div className="flex items-center gap-6">
            <button onClick={() => openLegalModal('privacy')} className="hover:text-white transition-colors cursor-pointer">
              Privacy Policy
            </button>
            <button onClick={() => openLegalModal('terms')} className="hover:text-white transition-colors cursor-pointer">
              Diplomatic Terms
            </button>
            <button
              onClick={scrollToTop}
              className="p-2.5 rounded-full bg-white/5 hover:bg-white/20 text-white transition-colors"
              title="Back to top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Legal & Diplomatic Policy Modal */}
      <LegalPolicyModal
        isOpen={showLegalModal}
        initialTab={legalTab}
        onClose={() => setShowLegalModal(false)}
      />
    </footer>
  );
}
