import React, { useState, useEffect } from 'react';
import { 
  HeartHandshake, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  DollarSign, 
  ArrowUpRight, 
  Download, 
  Sparkles, 
  ShieldCheck, 
  Calendar, 
  Award, 
  Globe, 
  Lock, 
  ChevronRight, 
  Clock, 
  Gift, 
  Landmark, 
  Receipt,
  Share2,
  FileText,
  BadgeCheck,
  Zap,
  Users
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

interface ContributionTransaction {
  id: string;
  reference: string;
  date: string;
  type: 'membership' | 'donation' | 'credit';
  amount: number;
  reason: string;
  status: 'Completed' | 'Pending' | 'Credited';
  paymentMethod: string;
  receiptNumber: string;
}

const DEFAULT_TRANSACTIONS: ContributionTransaction[] = [
  {
    id: 'tx-1',
    reference: 'GMA-MBR-2026-09',
    date: '2026-09-01',
    type: 'membership',
    amount: 100,
    reason: 'Monthly Membership Dues - September 2026',
    status: 'Completed',
    paymentMethod: 'Instant EFT (Capitec)',
    receiptNumber: 'REC-GMA-99214'
  },
  {
    id: 'tx-2',
    reference: 'GMA-DON-2026-09',
    date: '2026-09-15',
    type: 'donation',
    amount: 250,
    reason: 'Youth Leadership Bursary Fund',
    status: 'Completed',
    paymentMethod: 'Debit Card (Visa)',
    receiptNumber: 'REC-GMA-99432'
  },
  {
    id: 'tx-3',
    reference: 'GMA-MBR-2026-10',
    date: '2026-10-01',
    type: 'membership',
    amount: 100,
    reason: 'Monthly Membership Dues - October 2026',
    status: 'Completed',
    paymentMethod: 'Instant EFT (FNB)',
    receiptNumber: 'REC-GMA-99881'
  }
];

const DONATION_REASONS = [
  'Youth Leadership Bursary Fund',
  'AfCFTA Continental Trade Policy Labs',
  'Rural STEM & Digital Sovereignty Labs',
  'Diplomatic Simulation & Crisis Engines',
  'Pan-African Climate & Agritech Projects',
  'Continental General Endowment Fund',
  'Other / Custom Special Initiative'
];

const MEMBERSHIP_BENEFITS = [
  {
    title: 'Pan-African Plenary Voting Rights',
    description: 'Vote directly on continental youth policy resolutions, governance treaties, and leadership charters at the biannual assemblies.',
    icon: Landmark,
    tag: 'Governance'
  },
  {
    title: 'Verified Diplomatic Credential',
    description: 'Cryptographically registered digital passport on the Pan-African Fellowship Registry, recognizable by academic & diplomatic institutions.',
    icon: BadgeCheck,
    tag: 'Credentials'
  },
  {
    title: 'AU Agenda 2063 Policy Working Groups',
    description: 'Access closed-door consultative taskforces drafting policy briefs for African Union delegates, UNECA, and AfCFTA secretariats.',
    icon: Globe,
    tag: 'Policy'
  },
  {
    title: 'High-Level 1-on-1 Mentor Circles',
    description: 'Direct monthly strategic counsel with former ambassadors, ministers, tech founders, and continental public sector leaders.',
    icon: Users,
    tag: 'Mentorship'
  },
  {
    title: 'Annual Kigali/Addis Summit Bursaries',
    description: 'Priority fellowship travel stipends and accommodations for the annual Pan-African Leadership Summit.',
    icon: Award,
    tag: 'Grants'
  },
  {
    title: 'R25,000 Social Venture Seed Grants',
    description: 'Eligible to pitch for non-dilutive seed funding to prototype public good initiatives, policy think tanks, and local community projects.',
    icon: Zap,
    tag: 'Funding'
  },
  {
    title: 'Unrestricted Knowledge & Crisis Access',
    description: 'Unlimited access to the sovereign Knowledge Vault, Diplomatic AI Assistants, and Crisis Simulation Engine.',
    icon: ShieldCheck,
    tag: 'Technology'
  },
  {
    title: 'Executive Endorsements & Advocacy',
    description: 'Official recommendation letters signed by the Executive Council for international fellowships (Rhodes, Chevening, Mandela Washington).',
    icon: FileText,
    tag: 'Advocacy'
  }
];

export default function Contributions() {
  const { profile, user } = useAuth();

  // Ledger state loaded from localStorage for true real-time persistence
  const [transactions, setTransactions] = useState<ContributionTransaction[]>(() => {
    try {
      const saved = localStorage.getItem('gma_contributions_ledger');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not read contribution ledger from storage:', e);
    }
    return DEFAULT_TRANSACTIONS;
  });

  const [activeTab, setActiveTab] = useState<'all' | 'membership' | 'donation'>('all');

  // Membership Payment State
  const [membershipMonths, setMembershipMonths] = useState<number>(1);
  const [membershipPaymentMethod, setMembershipPaymentMethod] = useState<string>('card');
  const [isProcessingMembership, setIsProcessingMembership] = useState(false);

  // Donation State
  const [donationAmount, setDonationAmount] = useState<string>('150');
  const [selectedReason, setSelectedReason] = useState<string>(DONATION_REASONS[0]);
  const [customReason, setCustomReason] = useState<string>('');
  const [donationPaymentMethod, setDonationPaymentMethod] = useState<string>('instant-eft');
  const [donationNote, setDonationNote] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isProcessingDonation, setIsProcessingDonation] = useState(false);

  // Selected receipt to view
  const [selectedReceipt, setSelectedReceipt] = useState<ContributionTransaction | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('gma_contributions_ledger', JSON.stringify(transactions));
    } catch (e) {
      console.warn('Failed to sync contributions ledger:', e);
    }
  }, [transactions]);

  // Real-time calculated metrics
  const totalDonated = transactions
    .filter(t => t.type === 'donation' && t.status === 'Completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalMembershipPaid = transactions
    .filter(t => t.type === 'membership' && t.status === 'Completed')
    .reduce((sum, t) => sum + t.amount, 0);

  // Credits in account (e.g., referral rebates or advances)
  const totalCredits = transactions
    .filter(t => t.type === 'credit' && t.status === 'Credited')
    .reduce((sum, t) => sum + t.amount, 0);

  // Check if current month (November 2026) membership is due
  const hasPaidCurrentMonth = transactions.some(
    t => t.type === 'membership' && t.status === 'Completed' && t.date.startsWith('2026-11')
  );
  const duePayments = hasPaidCurrentMonth ? 0 : 100;

  // Breakdown of donation reasons
  const donationReasonsBreakdown = transactions
    .filter(t => t.type === 'donation' && t.status === 'Completed')
    .reduce((acc: { [key: string]: number }, item) => {
      acc[item.reason] = (acc[item.reason] || 0) + item.amount;
      return acc;
    }, {});

  // Handle Pay Monthly Membership Fee
  const handlePayMembership = (e: React.FormEvent) => {
    e.preventDefault();
    const feePerMonth = 100; // Fixed R100 / month
    const totalToPay = feePerMonth * membershipMonths;

    setIsProcessingMembership(true);
    setTimeout(() => {
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const randomRef = 'GMA-MBR-' + Math.floor(100000 + Math.random() * 900000);
      const receiptNo = 'REC-GMA-' + Math.floor(10000 + Math.random() * 90000);

      const newTx: ContributionTransaction = {
        id: 'tx-' + Date.now(),
        reference: randomRef,
        date: dateStr,
        type: 'membership',
        amount: totalToPay,
        reason: `Monthly Membership Dues (${membershipMonths} ${membershipMonths === 1 ? 'Month' : 'Months'}) - Active Standing`,
        status: 'Completed',
        paymentMethod: membershipPaymentMethod === 'card' ? 'Visa / Mastercard Debit' : membershipPaymentMethod === 'instant-eft' ? 'Instant EFT (South Africa)' : 'Mobile Money (M-Pesa/MoMo)',
        receiptNumber: receiptNo
      };

      setTransactions(prev => [newTx, ...prev]);
      setIsProcessingMembership(false);
      toast.success(`Success! R${totalToPay}.00 membership payment confirmed for ${profile?.name || 'Fellow'}. Your good standing is renewed!`);
    }, 1200);
  };

  // Handle Submit Flexible Donation (min R50)
  const handleDonate = (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(donationAmount);

    if (isNaN(amountVal) || amountVal < 50) {
      toast.error('Donations start from as low as R50. Please enter R50 or higher.');
      return;
    }

    const finalReason = selectedReason === 'Other / Custom Special Initiative' && customReason.trim()
      ? customReason.trim()
      : selectedReason;

    setIsProcessingDonation(true);
    setTimeout(() => {
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const randomRef = 'GMA-DON-' + Math.floor(100000 + Math.random() * 900000);
      const receiptNo = 'REC-GMA-' + Math.floor(10000 + Math.random() * 90000);

      const newTx: ContributionTransaction = {
        id: 'tx-' + Date.now(),
        reference: randomRef,
        date: dateStr,
        type: 'donation',
        amount: Math.round(amountVal),
        reason: finalReason,
        status: 'Completed',
        paymentMethod: donationPaymentMethod === 'instant-eft' ? 'Instant EFT (South Africa)' : donationPaymentMethod === 'card' ? 'Credit/Debit Card' : 'SnapScan / Ozow',
        receiptNumber: receiptNo
      };

      setTransactions(prev => [newTx, ...prev]);
      setIsProcessingDonation(false);
      setCustomReason('');
      setDonationNote('');
      toast.success(`Thank you! Your donation of R${amountVal} for "${finalReason}" has been credited to Golden Minds Africa.`);
    }, 1200);
  };

  const filteredTransactions = transactions.filter(t => {
    if (activeTab === 'membership') return t.type === 'membership';
    if (activeTab === 'donation') return t.type === 'donation';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16 animate-fade-in font-sans">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c2617] via-[#123823] to-[#08180e] border border-emerald-500/30 p-6 md:p-10 shadow-2xl text-white">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
              <HeartHandshake className="w-3.5 h-3.5 text-amber-400" />
              <span>Fellowship Financial Stewardship & Impact</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white font-serif">
              My Contribution & Membership Portal
            </h1>
            <p className="text-gray-300 text-sm md:text-base leading-relaxed">
              Support the pan-African fellowship, pay your monthly membership dues (<span className="text-amber-400 font-bold">R100/mo</span>), fund transformational scholarships (from <span className="text-emerald-400 font-bold">R50</span>), and track your real-time continental impact.
            </p>
          </div>

          {/* Active Standing Badge */}
          <div className="bg-black/40 backdrop-blur-md border border-white/10 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:w-auto">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-black font-bold shadow-lg shadow-amber-500/20 flex-shrink-0">
              <ShieldCheck className="w-6 h-6 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider text-gray-400 font-mono">Membership Standing</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {duePayments === 0 ? 'Fully Paid' : 'Due for Renewal'}
                </span>
              </div>
              <p className="text-base font-bold text-white mt-0.5">
                {profile?.name || 'Active Fellow'}
              </p>
              <p className="text-xs text-amber-400/90 font-mono mt-0.5">
                R100/month • Cohort 4 (2026/2027)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Real-Time Tracking Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Total Donated */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Donated</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <HeartHandshake className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white font-mono">
              R{totalDonated.toLocaleString()}
            </span>
            <span className="text-xs text-gray-400 ml-1.5 font-sans">ZAR</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{Object.keys(donationReasonsBreakdown).length} Impact initiatives funded</span>
          </div>
        </div>

        {/* Total Membership Fees Paid */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Membership Paid</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
              <Landmark className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white font-mono">
              R{totalMembershipPaid.toLocaleString()}
            </span>
            <span className="text-xs text-gray-400 ml-1.5 font-sans">ZAR</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <Calendar className="w-3.5 h-3.5 text-amber-500" />
            <span>R100/mo standard membership rate</span>
          </div>
        </div>

        {/* Due Payments */}
        <div className={`bg-white dark:bg-zinc-900 border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow ${duePayments > 0 ? 'border-amber-400 dark:border-amber-500/50' : 'border-gray-200 dark:border-zinc-800'}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Due Payments</span>
            <div className={`p-2 rounded-xl ${duePayments > 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300' : 'bg-gray-100 dark:bg-zinc-800 text-gray-500'}`}>
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className={`text-2xl md:text-3xl font-extrabold font-mono ${duePayments > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-900 dark:text-white'}`}>
              R{duePayments.toLocaleString()}.00
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            {duePayments === 0 ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Up to date for current cycle
              </span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400 font-semibold">
                Monthly renewal due (R100)
              </span>
            )}
          </div>
        </div>

        {/* Account Credits */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Account Credits</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              <Gift className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white font-mono">
              R{totalCredits.toLocaleString()}.00
            </span>
            <span className="text-xs text-gray-400 ml-1.5 font-sans">ZAR</span>
          </div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Available for dues deductions or grant matching
          </div>
        </div>
      </div>

      {/* Main Interactive Row: Pay Membership Fee & Make a Donation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Column 1: Monthly Membership Payment (R100/mo) */}
        <div className="lg:col-span-6 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Pay Monthly Membership Fee</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Official fellowship dues: strictly <strong className="text-amber-500 font-bold">R100 a month</strong></p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                R100 / mo
              </span>
            </div>

            <form onSubmit={handlePayMembership} className="space-y-5 mt-6">
              {/* Billing Period Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-2">
                  Select Payment Duration
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { months: 1, label: '1 Month', total: 100 },
                    { months: 3, label: '3 Months', total: 300 },
                    { months: 6, label: '6 Months', total: 600 },
                  ].map(option => (
                    <button
                      key={option.months}
                      type="button"
                      onClick={() => setMembershipMonths(option.months)}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        membershipMonths === option.months
                          ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-300 font-bold shadow-sm'
                          : 'border-gray-200 dark:border-zinc-800 hover:border-gray-300 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <div className="text-xs font-semibold">{option.label}</div>
                      <div className="text-sm font-extrabold font-mono mt-0.5">R{option.total}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Rail Options */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-2">
                  Payment Method (South African Rails)
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'card', name: 'Debit / Credit Card', desc: 'Instant Visa, Mastercard, American Express', icon: CreditCard },
                    { id: 'instant-eft', name: 'Instant EFT (Ozow / PayFast)', desc: 'Capitec, FNB, Standard Bank, Nedbank, Absa', icon: Landmark },
                    { id: 'momo', name: 'Mobile Money / SnapScan', desc: 'MTN MoMo, Vodacom M-Pesa, SnapScan QR', icon: Zap },
                  ].map(m => (
                    <div
                      key={m.id}
                      onClick={() => setMembershipPaymentMethod(m.id)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        membershipPaymentMethod === m.id
                          ? 'border-amber-500 bg-amber-500/5 dark:bg-amber-500/10 text-gray-900 dark:text-white'
                          : 'border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/40 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <m.icon className="w-4 h-4 text-amber-500" />
                        <div>
                          <p className="text-xs font-bold">{m.name}</p>
                          <p className="text-[11px] text-gray-400">{m.desc}</p>
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${membershipPaymentMethod === m.id ? 'border-amber-500 bg-amber-500' : 'border-gray-300'}`}>
                        {membershipPaymentMethod === m.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Due summary box */}
              <div className="bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-gray-100 dark:border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 block">Total Membership Payable</span>
                  <span className="text-xl font-extrabold text-gray-900 dark:text-white font-mono">
                    R{(100 * membershipMonths).toFixed(2)} ZAR
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Instant Receipt & Proof
                  </span>
                  <span className="text-[10px] text-gray-400">Guaranteed Active Status</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessingMembership}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-extrabold rounded-xl transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isProcessingMembership ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Processing Secure Payment...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-black" />
                    <span>Pay R{100 * membershipMonths}.00 Membership Fee</span>
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-zinc-800/60 flex items-center justify-between text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              100% Tax Deductible (Section 18A PBO)
            </span>
            <span>Secured by Ozow & 256-bit TLS</span>
          </div>
        </div>

        {/* Column 2: Flexible Fellow Donations (Starts from R50) */}
        <div className="lg:col-span-6 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Make an Impact Donation</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">At fellow's preference — <strong className="text-emerald-500 font-bold">from as low as R50</strong></p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                Min R50
              </span>
            </div>

            <form onSubmit={handleDonate} className="space-y-5 mt-6">
              {/* Preset Donation Amounts */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-2">
                  Select or Enter Donation Amount (ZAR)
                </label>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {['50', '100', '250', '500'].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setDonationAmount(val)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold font-mono transition-all cursor-pointer ${
                        donationAmount === val
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 shadow-sm'
                          : 'border-gray-200 dark:border-zinc-800 hover:border-gray-300 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      R{val}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-mono font-bold text-sm">
                    R
                  </span>
                  <input
                    type="number"
                    min="50"
                    step="10"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    placeholder="Enter custom amount (min R50)"
                    className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl pl-9 pr-4 py-2.5 text-sm font-mono font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-sans text-gray-400">
                    Min R50
                  </span>
                </div>
              </div>

              {/* Donation Reason Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-2">
                  Reason for Donation
                </label>
                <select
                  value={selectedReason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  {DONATION_REASONS.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>

                {selectedReason === 'Other / Custom Special Initiative' && (
                  <input
                    type="text"
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Specify the continental initiative or purpose..."
                    className="mt-2 w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                )}
              </div>

              {/* Dedication or Note */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1">
                  Dedication or Note (Optional)
                </label>
                <input
                  type="text"
                  value={donationNote}
                  onChange={(e) => setDonationNote(e.target.value)}
                  placeholder="e.g. In honor of young Pan-African women in diplomacy"
                  className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Anonymous Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="anonymous-check"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300 dark:border-zinc-700"
                />
                <label htmlFor="anonymous-check" className="text-xs text-gray-600 dark:text-gray-400 cursor-pointer">
                  Make my donation anonymous on public fellowship ledgers
                </label>
              </div>

              <button
                type="submit"
                disabled={isProcessingDonation}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isProcessingDonation ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Confirming Donation...</span>
                  </>
                ) : (
                  <>
                    <HeartHandshake className="w-4 h-4 text-white" />
                    <span>Contribute R{parseFloat(donationAmount) || 50}.00 to Fellowship</span>
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-zinc-800/60 flex items-center justify-between text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Allocated directly to African youth initiatives
            </span>
            <span>Real-time impact tracking</span>
          </div>
        </div>
      </div>

      {/* Donation Reasons Breakdown Summary */}
      {Object.keys(donationReasonsBreakdown).length > 0 && (
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Your Donation Breakdown & Impact Reasons</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Transparent allocation of your donations across fellowship development funds</p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
              Total R{totalDonated.toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {Object.entries(donationReasonsBreakdown).map(([reason, amount]) => {
              const percent = totalDonated > 0 ? Math.round((amount / totalDonated) * 100) : 0;
              return (
                <div key={reason} className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] uppercase font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {percent}% of total
                      </span>
                      <span className="font-mono font-extrabold text-sm text-gray-900 dark:text-white">
                        R{amount.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 leading-snug">
                      {reason}
                    </p>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-zinc-700 h-1.5 rounded-full overflow-hidden mt-3">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Real-Time Contribution & Payment History Ledger */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Receipt className="w-5 h-5 text-amber-500" />
              <span>Real-Time Payment & Contribution History</span>
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Complete verifiable ledger of all membership fee payments, donations, and credits
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-zinc-800 rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-white dark:bg-zinc-900 text-gray-900 dark:text-white shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              All ({transactions.length})
            </button>
            <button
              onClick={() => setActiveTab('membership')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'membership'
                  ? 'bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Membership Dues
            </button>
            <button
              onClick={() => setActiveTab('donation')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'donation'
                  ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Donations
            </button>
          </div>
        </div>

        {/* Transactions Table / List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 dark:border-zinc-800 text-gray-400 font-mono uppercase tracking-wider text-[11px]">
                <th className="pb-3 font-semibold">Date & Reference</th>
                <th className="pb-3 font-semibold">Type</th>
                <th className="pb-3 font-semibold">Reason / Description</th>
                <th className="pb-3 font-semibold">Payment Method</th>
                <th className="pb-3 font-semibold">Amount (ZAR)</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50/60 dark:hover:bg-zinc-800/40 transition-colors">
                  <td className="py-3.5 pr-3">
                    <p className="font-semibold text-gray-900 dark:text-white">{tx.date}</p>
                    <p className="text-[10px] text-gray-400 font-mono">{tx.reference}</p>
                  </td>
                  <td className="py-3.5 pr-3">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      tx.type === 'membership'
                        ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                        : tx.type === 'donation'
                        ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                        : 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800'
                    }`}>
                      {tx.type === 'membership' ? 'Membership Fee' : tx.type === 'donation' ? 'Donation' : 'Credit'}
                    </span>
                  </td>
                  <td className="py-3.5 pr-3 max-w-[260px]">
                    <p className="font-medium text-gray-800 dark:text-zinc-200 truncate">{tx.reason}</p>
                    <p className="text-[10px] text-gray-400">Ref: {tx.receiptNumber}</p>
                  </td>
                  <td className="py-3.5 pr-3 text-gray-500 dark:text-gray-400">
                    {tx.paymentMethod}
                  </td>
                  <td className="py-3.5 pr-3">
                    <span className="font-mono font-bold text-gray-900 dark:text-white text-sm">
                      R{tx.amount.toLocaleString()}.00
                    </span>
                  </td>
                  <td className="py-3.5 pr-3">
                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {tx.status}
                    </span>
                  </td>
                  <td className="py-3.5 text-right">
                    <button
                      onClick={() => setSelectedReceipt(tx)}
                      className="px-2.5 py-1 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-lg text-gray-700 dark:text-gray-300 font-semibold text-[11px] transition-all cursor-pointer inline-flex items-center gap-1"
                    >
                      <Download className="w-3 h-3 text-amber-500" />
                      <span>Receipt</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Active Member Benefits List */}
      <div className="bg-gradient-to-br from-zinc-900 via-zinc-950 to-black text-white border border-zinc-800 rounded-3xl p-6 md:p-10 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Active Fellowship Privileges</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white font-serif">
            Benefits of Being an Active Member of Golden Minds Africa
          </h2>
          <p className="text-gray-400 text-sm mt-2 leading-relaxed">
            By maintaining your active fellowship membership (R100/mo), you unlock exclusive institutional, diplomatic, and continental privileges designed to accelerate your public policy and governance career.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 relative z-10">
          {MEMBERSHIP_BENEFITS.map((b, idx) => {
            const Icon = b.icon;
            return (
              <div 
                key={idx}
                className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800/80 hover:border-amber-500/40 transition-all hover:-translate-y-0.5 group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-black transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-gray-400 uppercase tracking-wider font-semibold">
                    {b.tag}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-zinc-100 group-hover:text-amber-300 transition-colors">
                  {b.title}
                </h4>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                  {b.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-8 pt-6 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Membership benefits are accredited by the Pan-African Governance Council.</span>
          </p>
          <span className="font-mono text-amber-400">Golden Minds Africa Organization • Registration NPC 2026/09144</span>
        </div>
      </div>

      {/* Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl space-y-6 animate-scale-in text-gray-900 dark:text-white">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center font-bold">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base">Golden Minds Africa</h3>
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-mono">Official Contribution Receipt</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedReceipt(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-xs font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-gray-50 dark:bg-zinc-800/60 p-4 rounded-2xl border border-gray-100 dark:border-zinc-800 space-y-3 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Receipt No:</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">{selectedReceipt.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Transaction Ref:</span>
                <span className="font-bold">{selectedReceipt.reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date & Timestamp:</span>
                <span>{selectedReceipt.date} • Verified</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Fellow / Contributor:</span>
                <span className="font-sans font-bold">{profile?.name || 'Fellow'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Contribution Type:</span>
                <span className="capitalize">{selectedReceipt.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Purpose / Reason:</span>
                <span className="font-sans font-semibold text-right max-w-[200px]">{selectedReceipt.reason}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment Rail:</span>
                <span>{selectedReceipt.paymentMethod}</span>
              </div>
              <div className="border-t border-gray-200 dark:border-zinc-700 pt-2 flex justify-between text-sm">
                <span className="font-sans font-bold">Amount Contributed:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">R{selectedReceipt.amount}.00 ZAR</span>
              </div>
            </div>

            <div className="text-[11px] text-gray-400 text-center leading-relaxed">
              This receipt certifies that the above contribution has been directly received by Golden Minds Africa Organization NPC. Deductible under Section 18A PBO regulations.
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Print / Save PDF Receipt</span>
              </button>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="py-2.5 px-4 rounded-xl border border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
