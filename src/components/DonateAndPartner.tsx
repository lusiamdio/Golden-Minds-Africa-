import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Coins, ShieldCheck, Building2, UserPlus, CheckCircle2, Sparkles, X, ArrowRight } from 'lucide-react';

export default function DonateAndPartner() {
  const [activeTab, setActiveTab] = useState<'donate' | 'sponsor' | 'partner' | 'volunteer'>('donate');
  const [selectedAmount, setSelectedAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [successModal, setSuccessModal] = useState(false);

  // Form states
  const [formData, setFormData] = useState({ name: '', email: '', org: '', note: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessModal(true);
  };

  return (
    <section id="donate" className="py-24 px-6 relative bg-gradient-to-b from-[#08080A] via-[#0E0D12] to-[#08080A] overflow-hidden">
      <div className="container mx-auto max-w-5xl relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] text-xs font-semibold uppercase tracking-widest mb-3">
            <Heart className="w-3.5 h-3.5" /> Continental Philanthropy & Alliance
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white">
            Support Africa’s <span className="text-gold-gradient">Next Generation</span>
          </h2>
          <p className="text-gray-400 mt-4 text-base md:text-lg">
            Invest directly in Pan-African youth fellowships, policy research labs, and leadership academies. Every contribution accelerates continental sovereignty.
          </p>

          {/* Action Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mt-8">
            {[
              { id: 'donate', label: 'Donate', icon: Coins },
              { id: 'sponsor', label: 'Sponsor a Fellow', icon: Heart },
              { id: 'partner', label: 'Institutional Partner', icon: Building2 },
              { id: 'volunteer', label: 'Volunteer', icon: UserPlus }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 border ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#B8860B] text-black border-transparent shadow-xl shadow-[#D4AF37]/25 scale-105'
                      : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" /> {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Gold Card Container */}
        <div className="glass-card-gold rounded-3xl p-8 md:p-12 border border-white/15 shadow-2xl relative overflow-hidden">
          
          {activeTab === 'donate' && (
            <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-serif font-bold text-white">Select Investment Contribution</h3>
                <p className="text-xs text-gray-300">Tax-deductible contributions go directly towards research grants & academic stipends.</p>
              </div>

              {/* Amount Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[50, 100, 250, 500].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => { setSelectedAmount(amt); setCustomAmount(''); }}
                    className={`py-3.5 rounded-2xl font-bold text-sm transition-all border ${
                      selectedAmount === amt && !customAmount
                        ? 'bg-[#D4AF37] text-black border-transparent shadow-lg shadow-[#D4AF37]/30 scale-105'
                        : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
                    }`}
                  >
                    ${amt} USD
                  </button>
                ))}
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">Custom Contribution Amount ($ USD)</label>
                <input
                  type="number"
                  placeholder="Enter custom amount..."
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full px-4 py-3 bg-black/60 border border-white/15 rounded-xl text-sm text-white focus:outline-none focus:border-white/40"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">Donor Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your Full Name or Foundation"
                    className="w-full px-4 py-2.5 bg-black/60 border border-white/15 rounded-xl text-sm text-white focus:outline-none focus:border-white/40"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="donor@organization.org"
                    className="w-full px-4 py-2.5 bg-black/60 border border-white/15 rounded-xl text-sm text-white focus:outline-none focus:border-white/40"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#B8860B] text-black font-bold text-base uppercase tracking-wider shadow-xl shadow-[#D4AF37]/20 active:scale-95 transition-all"
              >
                Proceed to Secure Donation (${customAmount || selectedAmount} USD)
              </button>
            </form>
          )}

          {activeTab === 'sponsor' && (
            <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-serif font-bold text-white">Sponsor an African Public Policy Fellow</h3>
                <p className="text-xs text-gray-300">$1,200 fully funds a 12-month fellowship stipend, policy research equipment, and summit travel.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">Sponsor / Organization Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your Name / Enterprise"
                    className="w-full px-4 py-2.5 bg-black/60 border border-white/15 rounded-xl text-sm text-white focus:outline-none focus:border-white/40"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="sponsor@enterprise.com"
                    className="w-full px-4 py-2.5 bg-black/60 border border-white/15 rounded-xl text-sm text-white focus:outline-none focus:border-white/40"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">Preferred Region or Focus Area</label>
                <select className="w-full px-4 py-3 bg-black/60 border border-white/15 rounded-xl text-sm text-white focus:outline-none focus:border-white/40">
                  <option>All 54 African Countries (Unrestricted)</option>
                  <option>East Africa Hub (Kigali / Nairobi)</option>
                  <option>West Africa Hub (Lagos / Accra)</option>
                  <option>Southern Africa Hub (Johannesburg / Cape Town)</option>
                  <option>Women in Public Office Initiative</option>
                  <option>AI Ethics & Agritech Policy Labs</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#B8860B] text-black font-bold text-base uppercase tracking-wider shadow-xl shadow-[#D4AF37]/20 transition-all"
              >
                Submit Fellowship Sponsorship Agreement
              </button>
            </form>
          )}

          {activeTab === 'partner' && (
            <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-serif font-bold text-white">Institutional Partnership Proposal</h3>
                <p className="text-xs text-gray-300">For Universities, Governments, UN Agencies, Development Banks, and Multinationals.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">Institution Name</label>
                  <input
                    type="text"
                    required
                    value={formData.org}
                    onChange={(e) => setFormData({ ...formData, org: e.target.value })}
                    placeholder="e.g. Ministry of Foreign Affairs / University"
                    className="w-full px-4 py-2.5 bg-black/60 border border-white/15 rounded-xl text-sm text-white focus:outline-none focus:border-white/40"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">Contact Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="partner@gov.int"
                    className="w-full px-4 py-2.5 bg-black/60 border border-white/15 rounded-xl text-sm text-white focus:outline-none focus:border-white/40"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">Partnership Objectives</label>
                <textarea
                  rows={3}
                  placeholder="Describe your joint policy research, student exchange, or summit sponsorship objectives..."
                  className="w-full px-4 py-2.5 bg-black/60 border border-white/15 rounded-xl text-sm text-white focus:outline-none focus:border-white/40"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#B8860B] text-black font-bold text-base uppercase tracking-wider shadow-xl shadow-[#D4AF37]/20 transition-all"
              >
                Send Institutional MoU Request
              </button>
            </form>
          )}

          {activeTab === 'volunteer' && (
            <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-serif font-bold text-white">Join as a Volunteer / Policy Researcher</h3>
                <p className="text-xs text-gray-300">Contribute your research, translation, event management, or mentorship skills.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your Full Name"
                    className="w-full px-4 py-2.5 bg-black/60 border border-white/15 rounded-xl text-sm text-white focus:outline-none focus:border-white/40"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="volunteer@domain.com"
                    className="w-full px-4 py-2.5 bg-black/60 border border-white/15 rounded-xl text-sm text-white focus:outline-none focus:border-white/40"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#B8860B] text-black font-bold text-base uppercase tracking-wider shadow-xl shadow-[#D4AF37]/20 transition-all"
              >
                Apply for Volunteer Network
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {successModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-md bg-[#0E0E12] border border-white/20 rounded-3xl p-8 text-center space-y-4 text-white shadow-2xl relative"
            >
              <div className="w-16 h-16 bg-[#D4AF37]/20 border border-white/20 rounded-full flex items-center justify-center mx-auto text-[#D4AF37]">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-serif font-bold">Request Received</h3>
              <p className="text-sm text-gray-300">
                Thank you for your commitment to Golden Minds Africa. Our Secretariat will contact you shortly via email.
              </p>
              <button
                onClick={() => setSuccessModal(false)}
                className="px-8 py-3 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black font-bold text-xs uppercase tracking-wider"
              >
                Return to Portal
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
