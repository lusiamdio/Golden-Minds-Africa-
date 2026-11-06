import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, FileText, X, CheckCircle2, Globe, Lock, Scale } from 'lucide-react';

interface LegalPolicyModalProps {
  isOpen: boolean;
  initialTab?: 'privacy' | 'terms';
  onClose: () => void;
}

export default function LegalPolicyModal({ isOpen, initialTab = 'privacy', onClose }: LegalPolicyModalProps) {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>(initialTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-4xl bg-[#0E0E12] border border-white/20 rounded-3xl p-6 sm:p-10 shadow-2xl relative text-white max-h-[90vh] flex flex-col justify-between"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-6 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-[#D4AF37]">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest">
                Official Institutional Governance
              </div>
              <h2 className="text-2xl font-serif font-bold text-white">
                {activeTab === 'privacy' ? 'Privacy Policy & Data Sovereignty' : 'Diplomatic Terms & Conditions'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-3 my-6 pb-4 shrink-0">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 border ${
              activeTab === 'privacy'
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black border-transparent shadow-lg'
                : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" /> Privacy Policy
          </button>

          <button
            onClick={() => setActiveTab('terms')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 border ${
              activeTab === 'terms'
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black border-transparent shadow-lg'
                : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Diplomatic Terms
          </button>
        </div>

        {/* Main Content Area */}
        <div className="overflow-y-auto pr-2 space-y-6 text-sm text-gray-300 leading-relaxed font-sans flex-1 my-2">
          {activeTab === 'privacy' ? (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-xs text-gray-300 italic">
                  <strong>Preamble:</strong> Golden Minds Africa (GMA) Roundtable is committed to protecting the privacy, security, and diplomatic confidentiality of our fellows, delegates, institutional partners, and visitors in accordance with the African Union Convention on Cyber Security and Personal Data Protection (Malabo Convention) and international data governance principles.
                </p>
              </div>

              <div>
                <h3 className="text-base font-serif font-bold text-white mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#D4AF37]" /> 1. Scope & Categories of Data Collected
                </h3>
                <p>
                  GMA collects necessary personal and professional credentials provided voluntarily during accreditation, summit registrations, fellowship admissions, and research downloads. This includes full names, institutional email addresses, passport/national identification details for summit visa processing, organizational affiliations, and civic track records.
                </p>
              </div>

              <div>
                <h3 className="text-base font-serif font-bold text-white mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#D4AF37]" /> 2. Purpose of Data Processing
                </h3>
                <p>
                  Information is processed exclusively for official diplomatic communications, fellowship evaluation, summit security clearances, policy publication dispatch, grant reporting to institutional donors, and issuing accredited certificates of achievement.
                </p>
              </div>

              <div>
                <h3 className="text-base font-serif font-bold text-white mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#D4AF37]" /> 3. Data Sovereignty & Confidentiality
                </h3>
                <p>
                  Under no circumstances does Golden Minds Africa commercialize, rent, sell, or disclose delegate personal data to commercial third-party advertisers. Information is safeguarded within encrypted regional data hubs across South Africa, Rwanda, Kenya, Ghana, and Egypt.
                </p>
              </div>

              <div>
                <h3 className="text-base font-serif font-bold text-white mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#D4AF37]" /> 4. Security Protocols & Encryption
                </h3>
                <p>
                  All database storage and digital communications employ enterprise-grade AES-256 encryption at rest and TLS 1.3 protocol in transit. Multi-factor authentication is strictly enforced across all secretariat administration systems.
                </p>
              </div>

              <div>
                <h3 className="text-base font-serif font-bold text-white mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#D4AF37]" /> 5. Delegate & Fellow Rights
                </h3>
                <p>
                  Delegates hold full rights to inspect, update, or request the archival deletion of their personal records, subject to statutory diplomatic archive retention mandates. Requests can be submitted directly to the Secretariat Data Protection Officer.
                </p>
              </div>

              <div className="pt-4 text-xs text-gray-400">
                Contact Legal & Data Protection Bureau: <strong className="text-white">info@goldenmindsorganization.org</strong>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-xs text-gray-300 italic">
                  <strong>Preamble:</strong> These Diplomatic Terms and Conditions govern participation in Golden Minds Africa programs, high-level summits, research whitepapers, and digital portal ecosystems. By engaging with GMA, delegates agree to adhere to these foundational principles.
                </p>
              </div>

              <div>
                <h3 className="text-base font-serif font-bold text-white mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#D4AF37]" /> 1. Institutional Mandate & Non-Partisan Status
                </h3>
                <p>
                  Golden Minds Africa operates as an independent, non-partisan, non-profit Pan-African public policy and youth leadership roundtable. The organization does not endorse political parties or interfere in sovereign domestic elections.
                </p>
              </div>

              <div>
                <h3 className="text-base font-serif font-bold text-white mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#D4AF37]" /> 2. Intellectual Property & Policy Publications
                </h3>
                <p>
                  All research whitepapers, policy briefs, fellowship curricula, and summit proceedings published by Golden Minds Africa are protected under international copyright treaties. Re-use is permitted for non-commercial educational and policy formulation purposes under mandatory attribution to: <strong>GMA Roundtable</strong>.
                </p>
              </div>

              <div>
                <h3 className="text-base font-serif font-bold text-white mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#D4AF37]" /> 3. Code of Conduct & Diplomatic Protocol
                </h3>
                <p>
                  All fellows, delegates, speakers, and observers must maintain the highest standards of integrity, mutual respect, and diplomatic etiquette. Hate speech, discrimination, unparliamentary conduct, or ethical violations result in immediate revocation of accreditation.
                </p>
              </div>

              <div>
                <h3 className="text-base font-serif font-bold text-white mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#D4AF37]" /> 4. Summit Accreditation & Protocol
                </h3>
                <p>
                  Summit badges and delegate credentials remain the sole property of the Golden Minds Secretariat. Delegates must comply with local host country security procedures, venue regulations, and health safety guidelines.
                </p>
              </div>

              <div>
                <h3 className="text-base font-serif font-bold text-white mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#D4AF37]" /> 5. Multilateral Dispute Resolution
                </h3>
                <p>
                  Any dispute or claim arising under these terms shall be settled through peaceful diplomatic consultation or binding arbitration governed by the Secretariat Board in Cape Town, Western Cape, South Africa.
                </p>
              </div>

              <div className="pt-4 text-xs text-gray-400">
                Official Secretariat Address: <strong className="text-white">Cape Town, Western Cape, South Africa</strong>
              </div>
            </div>
          )}
        </div>

        {/* Footer Bar */}
        <div className="pt-6 flex items-center justify-between shrink-0">
          <div className="text-xs text-gray-400 hidden sm:block">
            Golden Minds Africa Secretariat Governance Framework 2026
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black font-bold text-xs uppercase tracking-wider shadow-md hover:bg-gray-200 transition-all"
          >
            Acknowledge & Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
