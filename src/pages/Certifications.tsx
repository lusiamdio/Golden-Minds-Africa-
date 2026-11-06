import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { 
  Award, Share2, Download, CheckCircle2, ShieldCheck, 
  ExternalLink, Sparkles, Crown, QrCode as QrCodeIcon, FileText, 
  Briefcase, Linkedin, Mail, BarChart3, FileBadge, 
  GraduationCap, Loader2, RefreshCw, HelpCircle, X, Twitter,
  Lock, Unlock, Check, AlertCircle, Send, ArrowRight
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer 
} from 'recharts';
import QRCode from 'react-qr-code';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import appLogo from '../assets/images/logo.png';
import { fellowshipRealtime } from '../lib/fellowshipRealtime';
import { useTrackRender } from '../hooks/usePerformanceTracker';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Mock Data for the Fellow's Performance & Credentials
const MOCK_DATA = {
  id: "CERT-2026-X1Y2Z3",
  track: "Public Policy & Tech Governance",
  duration: "Jan 2026 - Dec 2026",
  issueDate: "December 15, 2026",
  classification: "Distinction",
  percentile: "Top 5%",
  scores: {
    overall: 92,
    academic: 90,
    portfolio: 95,
    engagement: 91,
    projects: 95,
    simulations: 88,
    participation: 94,
    assessments: 91
  },
  detailedScores: [],
  modules: [
    { title: "Geopolitics", score: 90, name: "Advanced Geopolitics", code: "GEO401", grade: "A" },
    { title: "Policy Labs", score: 95, name: "Public Policy Formulation", code: "POL302", grade: "A+" }
  ],
  radarData: [
    { subject: 'Policy Analysis', A: 95, fullMark: 100 },
    { subject: 'Simulations', A: 88, fullMark: 100 },
    { subject: 'Participation', A: 94, fullMark: 100 },
    { subject: 'Academics', A: 91, fullMark: 100 },
  ],
  portfolio: [],
  recommendationToken: "REC-998877"
};

function CertificationsMain() {
  useTrackRender('Certifications & Honors');
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const fellowName = profile?.name || "Amina Mensah";
  
  const FELLOW_DATA = {
    ...MOCK_DATA,
    name: fellowName
  };

  const [activeTab, setActiveTab] = useState<'certificate' | 'performance' | 'portfolio' | 'recommendation'>('certificate');

  // Prerequisite: Final Assignment Pass State
  const [hasPassedFinalAssignment, setHasPassedFinalAssignment] = useState<boolean>(() => {
    return localStorage.getItem('gma_final_assignment_passed') === 'true';
  });
  const [finalScore, setFinalScore] = useState<number>(() => {
    return parseInt(localStorage.getItem('gma_final_assignment_score') || '92', 10);
  });
  const [isSubmittingCapstone, setIsSubmittingCapstone] = useState(false);
  const [capstoneBrief, setCapstoneBrief] = useState(
    "Policy Blueprint: Sovereign Critical Mineral Processing & Intra-African Clean Tech Energy Corridor 2035.\n\n" +
    "Executive Summary:\n" +
    "This capstone proposes an AfCFTA multilateral framework mandating 40% domestic beneficiation of critical battery minerals (Lithium, Cobalt, Manganese) across SADC and ECOWAS. By pairing regional smelting hubs with localized zero-tariff transport corridors, African nations retain manufacturing value and sovereign bargaining power in global green transitions."
  );
  
  // AI Recommendation State
  const [recommendationLetter, setRecommendationLetter] = useState<string | null>(null);
  const [isGeneratingLetter, setIsGeneratingLetter] = useState(false);

  // AI Explainability State
  const [showExplanation, setShowExplanation] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isGeneratingExplanation, setIsGeneratingExplanation] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  const handlePassFinalAssignment = async () => {
    setIsSubmittingCapstone(true);
    try {
      // Simulate / evaluate diplomatic defense
      await new Promise(r => setTimeout(r, 1500));
      const scoreAwarded = 94;
      localStorage.setItem('gma_final_assignment_passed', 'true');
      localStorage.setItem('gma_final_assignment_score', scoreAwarded.toString());
      setHasPassedFinalAssignment(true);
      setFinalScore(scoreAwarded);

      // Broadcast fellow progress in real-time across the ecosystem
      fellowshipRealtime.broadcastProgress({
        fellowName,
        eventType: 'capstone_passed',
        score: scoreAwarded,
        title: 'Passed Final Capstone Policy Defense with Distinction (94%)',
        timestamp: Date.now()
      });

      toast.success("Final Capstone Passed with Distinction (94%)! Official Certificate Unlocked!", {
        duration: 5000
      });
    } catch (err) {
      toast.error("Submission failed. Please try again.");
    } finally {
      setIsSubmittingCapstone(false);
    }
  };

  const handleResetFinalAssignment = () => {
    localStorage.removeItem('gma_final_assignment_passed');
    localStorage.removeItem('gma_final_assignment_score');
    setHasPassedFinalAssignment(false);
    toast.info("Certificate locked. Final Capstone status reset.");
  };

  const handleDownloadPDF = async () => {
    if (!certificateRef.current) return;
    setIsDownloading(true);
    
    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      // Calculate PDF dimensions (landscape)
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`GMAF_Certificate_${FELLOW_DATA.id}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleExplainScore = async () => {
    setShowExplanation(true);
    if (aiExplanation) return; // Don't regenerate if already generated

    setIsGeneratingExplanation(true);
    try {
      const prompt = `Act as an AI Academic Evaluator for the Golden Minds Africa Fellowship. 
      Explain the final score of ${FELLOW_DATA.scores.overall}% and the classification of "${FELLOW_DATA.classification}" for ${FELLOW_DATA.name}.
      
      Here is the breakdown:
      - Policy Projects & Briefs: ${FELLOW_DATA.scores.projects}%
      - Crisis Simulations: ${FELLOW_DATA.scores.simulations}%
      - Debates & Participation: ${FELLOW_DATA.scores.participation}%
      - Academic Assessments: ${FELLOW_DATA.scores.assessments}%
      
      Provide a brief, encouraging, and analytical explanation (max 3 paragraphs) of why they received this score, highlighting their strengths in Participation and Projects, and areas they excelled in. Format with HTML paragraphs and bold text.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      setAiExplanation(response.text || 'Failed to generate explanation.');
    } catch (error) {
      console.error('AI Error:', error);
      setAiExplanation('An error occurred while generating the explanation. Please try again.');
    } finally {
      setIsGeneratingExplanation(false);
    }
  };

  const handleGenerateLetter = async () => {
    setIsGeneratingLetter(true);
    try {
      const prompt = `Act as the Academic Dean of the prestigious Golden Minds Africa Fellowship (comparable to Harvard Kennedy School or Oxford Blavatnik School). 
      Write a highly professional, authoritative, and personalized letter of recommendation for ${FELLOW_DATA.name}, who graduated with a "${FELLOW_DATA.classification}" (${FELLOW_DATA.percentile}) in the "${FELLOW_DATA.track}" track. 
      Highlight their exceptional scores: Projects (${FELLOW_DATA.scores.projects}%), Simulations (${FELLOW_DATA.scores.simulations}%), and overall average of ${FELLOW_DATA.scores.overall}%. 
      Mention their policy portfolio, specifically their work on "AI Sovereignty in East Africa". 
      The tone must be extremely prestigious, formal, and suitable for top-tier employers in government, policy, consulting, or international organizations. Use HTML formatting (paragraphs, bold text) for structure.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      setRecommendationLetter(response.text || 'Failed to generate letter.');
    } catch (error) {
      console.error('AI Error:', error);
      setRecommendationLetter('An error occurred while generating the recommendation letter. Please try again.');
    } finally {
      setIsGeneratingLetter(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#0A1F44] text-[#C9A646] rounded-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 dark:text-white">
              Credentials & Recognition
            </h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl text-lg">
            Your globally recognized, verifiable credentials from the Golden Minds Africa Fellowship.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-[#0a66c2] text-white rounded-lg font-medium hover:bg-[#004182] transition-colors shadow-sm w-full sm:w-auto">
            <Linkedin className="w-4 h-4" /> Add to Profile
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors shadow-sm w-full sm:w-auto">
            <Share2 className="w-4 h-4" /> Share
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto hide-scrollbar border-b border-gray-200 dark:border-gray-800">
        {[
          { id: 'certificate', label: 'Digital Certificate', icon: Award },
          { id: 'performance', label: 'Performance Breakdown', icon: BarChart3 },
          { id: 'portfolio', label: 'Policy Portfolio', icon: Briefcase },
          { id: 'recommendation', label: 'Recommendation Letter', icon: FileBadge },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-colors relative whitespace-nowrap ${
              activeTab === tab.id 
                ? 'text-[#0A1F44] dark:text-[#C9A646]' 
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {activeTab === tab.id && (
              <motion.div layoutId="certTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0A1F44] dark:bg-[#C9A646]" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-8">
        <AnimatePresence mode="wait">
          
          {/* 1. DIGITAL CERTIFICATE (Locked Until Final Assignment Passed) */}
          {activeTab === 'certificate' && (
            <motion.div
              key="certificate"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {!hasPassedFinalAssignment ? (
                /* LOCKED STATE: Prerequisite Required */
                <div className="max-w-4xl mx-auto space-y-6">
                  <div className="bg-gradient-to-br from-[#121c17] to-[#0a100d] border border-[#234230] rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden text-center text-white">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-600 via-[#d4af37] to-amber-600" />
                    
                    {/* Locked Emblem */}
                    <div className="w-20 h-20 rounded-2xl bg-[#192b21] border border-[#d4af37]/40 flex items-center justify-center mx-auto mb-5 shadow-[0_0_30px_rgba(212,175,55,0.2)]">
                      <Lock className="w-10 h-10 text-[#d4af37]" />
                    </div>

                    <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold uppercase tracking-wider">
                      Prerequisite Requirement Pending
                    </span>

                    <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-3">
                      Fellowship Certificate: Locked
                    </h2>

                    <p className="max-w-xl mx-auto text-sm text-gray-300 mt-2 leading-relaxed">
                      Official Golden Minds Africa credentials are cryptographically generated and minted <strong className="text-white">only after the fellow has defended and passed the Final Capstone Policy Assignment</strong> (Passing Mark: &ge; 80%).
                    </p>

                    {/* Prerequisite Checklist */}
                    <div className="max-w-md mx-auto my-6 p-4 rounded-2xl bg-[#090f0c] border border-[#1b3124] text-left space-y-3">
                      <h4 className="text-xs uppercase tracking-wider text-[#d4af37] font-bold">Graduation Milestones</h4>
                      
                      <div className="flex items-center justify-between text-xs py-1 border-b border-gray-800">
                        <span className="flex items-center gap-2 text-gray-300">
                          <Check className="w-4 h-4 text-emerald-400" /> Strategic Leadership Modules
                        </span>
                        <span className="text-emerald-400 font-mono font-bold">Passed (100%)</span>
                      </div>

                      <div className="flex items-center justify-between text-xs py-1 border-b border-gray-800">
                        <span className="flex items-center gap-2 text-gray-300">
                          <Check className="w-4 h-4 text-emerald-400" /> Geopolitical Crisis Simulations
                        </span>
                        <span className="text-emerald-400 font-mono font-bold">Passed (88%)</span>
                      </div>

                      <div className="flex items-center justify-between text-xs py-1">
                        <span className="flex items-center gap-2 text-amber-300 font-medium">
                          <AlertCircle className="w-4 h-4 text-amber-400 animate-pulse" /> Final Capstone Policy Assignment
                        </span>
                        <span className="text-amber-400 font-mono font-bold bg-amber-400/10 px-2 py-0.5 rounded">
                          Required (&ge; 80%)
                        </span>
                      </div>
                    </div>

                    {/* Interactive Capstone Submission Panel */}
                    <div className="max-w-2xl mx-auto bg-[#0f1b15] border border-[#1e382b] rounded-2xl p-5 text-left space-y-4">
                      <div>
                        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#d4af37]" />
                          Submit Final Capstone Policy Defense
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Draft your multilateral policy blueprint below. The AI Diplomatic Examination Council will evaluate institutional feasibility and award your final grading.
                        </p>
                      </div>

                      <textarea
                        value={capstoneBrief}
                        onChange={(e) => setCapstoneBrief(e.target.value)}
                        rows={6}
                        className="w-full p-3.5 bg-[#090e0c] border border-[#234230] rounded-xl text-white text-xs font-mono outline-none focus:border-[#d4af37] leading-relaxed transition-all resize-none"
                        placeholder="Enter your comprehensive policy proposal..."
                      />

                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                        <span className="text-[11px] text-gray-400">
                          Panel: AU Diplomatic Review Board
                        </span>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <button
                            onClick={handlePassFinalAssignment}
                            disabled={isSubmittingCapstone}
                            className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-[#d4af37] to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                          >
                            {isSubmittingCapstone ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Evaluating Capstone Defense...</span>
                              </>
                            ) : (
                              <>
                                <Send className="w-4 h-4" />
                                <span>Defend & Unlock Certificate</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* UNLOCKED STATE: Official Certificate Generated */
                <>
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                    <div className="flex items-center gap-2 bg-white dark:bg-[#1a1a1a] p-2 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                      <span className="text-sm text-gray-500 font-bold px-2">Share Achievement:</span>
                      <button 
                        onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin + '/verify/' + FELLOW_DATA.id)}`, '_blank')}
                        className="flex items-center gap-2 px-3 py-2 bg-[#0077b5]/10 text-[#0077b5] rounded-lg hover:bg-[#0077b5]/20 transition-colors font-medium text-sm"
                        title="Share on LinkedIn"
                      >
                        <Linkedin className="w-4 h-4" /> LinkedIn
                      </button>
                      <button 
                        onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.origin + '/verify/' + FELLOW_DATA.id)}&text=I just earned my Golden Minds Africa Fellowship certificate!`, '_blank')}
                        className="flex items-center gap-2 px-3 py-2 bg-[#1DA1F2]/10 text-[#1DA1F2] rounded-lg hover:bg-[#1DA1F2]/20 transition-colors font-medium text-sm"
                        title="Share on Twitter"
                      >
                        <Twitter className="w-4 h-4" /> Twitter
                      </button>
                      <button 
                        onClick={() => window.location.href = `mailto:?subject=My Golden Minds Africa Fellowship Certificate&body=Check out my certificate here: ${window.location.origin}/verify/${FELLOW_DATA.id}`}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium text-sm"
                        title="Share via Email"
                      >
                        <Mail className="w-4 h-4" /> Email
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                      <button 
                        onClick={handleDownloadPDF}
                        disabled={isDownloading}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#0A1F44] text-white rounded-xl text-sm font-bold hover:bg-[#071530] transition-colors shadow-md w-full sm:w-auto disabled:opacity-70"
                      >
                        {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} 
                        {isDownloading ? 'Generating PDF...' : 'Download PDF'}
                      </button>
                      <button 
                        onClick={() => navigate('/verify/' + FELLOW_DATA.id)}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#C9A646] text-[#0A1F44] rounded-xl text-sm font-bold hover:bg-[#b5953f] transition-colors shadow-md w-full sm:w-auto"
                      >
                        <ShieldCheck className="w-4 h-4" /> Verify Certificate
                      </button>
                      <button
                        onClick={handleResetFinalAssignment}
                        className="px-3 py-2 text-xs text-gray-400 hover:text-rose-400 border border-gray-200 dark:border-gray-800 rounded-xl transition-colors"
                        title="Reset Final Assignment to test locked flow"
                      >
                        Lock
                      </button>
                    </div>
                  </div>

                  {/* Capstone Pass Banner */}
                  <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300">
                    <span className="flex items-center gap-2 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Final Capstone Policy Defense Passed with Distinction ({finalScore}%)
                    </span>
                    <span className="font-mono text-[10px] text-emerald-400 uppercase">Cryptographic Mint Validated</span>
                  </div>

                  {/* The Certificate Visual */}
                  <div className="bg-white p-2 md:p-4 shadow-2xl rounded-sm border border-gray-200 max-w-5xl mx-auto overflow-x-auto">
                    <div ref={certificateRef} className="border-[12px] border-double border-[#C9A646] p-8 md:p-16 relative bg-[#faf9f6] overflow-hidden min-w-[800px]">
                      {/* Watermark */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                        <ShieldCheck className="w-[32rem] h-[32rem] text-[#C9A646]" />
                      </div>
                      
                      <div className="relative z-10 text-center space-y-8">
                          <div className="flex justify-center mb-8">
                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center border-4 border-[#C9A646] shadow-lg overflow-hidden p-1">
                              <img src={appLogo} alt="Golden Minds Africa" className="w-full h-full object-contain" />
                            </div>
                          </div>
                        
                        <div className="space-y-2">
                          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#0A1F44] tracking-wide uppercase">
                            Golden Minds Africa
                          </h1>
                          <h2 className="text-xl md:text-2xl font-serif text-[#C9A646] tracking-widest uppercase">
                            Fellowship Certificate
                          </h2>
                        </div>
                        
                        <div className="py-12 space-y-6">
                          <p className="text-gray-600 italic font-serif text-xl">This is to certify that</p>
                          <p className="text-5xl md:text-6xl font-serif font-bold text-gray-900 tracking-tight">{FELLOW_DATA.name}</p>
                          <p className="text-gray-600 italic font-serif text-xl max-w-2xl mx-auto leading-relaxed">
                            has successfully completed the rigorous academic and leadership requirements of the fellowship track in
                          </p>
                          <p className="text-3xl font-serif font-bold text-[#0A1F44]">{FELLOW_DATA.track}</p>
                          
                          <div className="pt-8 pb-4">
                            <p className="text-gray-600 italic font-serif text-lg mb-2">Awarded with the classification of</p>
                            <div className="inline-block px-8 py-3 border-2 border-[#C9A646] bg-[#C9A646]/10 mb-8">
                              <p className="text-2xl font-serif font-bold text-[#0A1F44] uppercase tracking-widest">
                                {FELLOW_DATA.classification}
                              </p>
                            </div>

                            <div className="max-w-3xl mx-auto bg-white border border-[#C9A646]/30 p-6 shadow-sm overflow-hidden text-left relative before:absolute before:inset-0 before:border-[4px] before:border-double before:border-[#C9A646]/10 before:pointer-events-none">
                              <h3 className="text-[#0A1F44] font-serif font-bold text-center border-b border-[#C9A646]/20 pb-3 mb-4 tracking-widest uppercase text-sm">Academic Modules & Performance</h3>
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="text-gray-500 font-serif border-b border-gray-100">
                                    <th className="py-2 text-left font-medium">Module Name</th>
                                    <th className="py-2 text-center font-medium">Code</th>
                                    <th className="py-2 text-right font-medium">Score</th>
                                    <th className="py-2 text-right font-medium">Grade</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {FELLOW_DATA.modules.map((mod, i) => (
                                    <tr key={i} className="border-b border-gray-50 last:border-0 font-serif">
                                      <td className="py-2.5 text-gray-800 font-medium">{mod.name}</td>
                                      <td className="py-2.5 text-gray-500 text-center font-mono text-xs">{mod.code}</td>
                                      <td className="py-2.5 text-gray-600 text-right">{mod.score}%</td>
                                      <td className="py-2.5 text-gray-800 text-right font-bold">{mod.grade}</td>
                                    </tr>
                                  ))}
                                  <tr className="border-b border-gray-50 font-serif bg-amber-500/5">
                                    <td className="py-2.5 text-[#0A1F44] font-bold">Final Capstone Policy Defense</td>
                                    <td className="py-2.5 text-gray-500 text-center font-mono text-xs">CAP500</td>
                                    <td className="py-2.5 text-emerald-700 text-right font-bold">{finalScore}%</td>
                                    <td className="py-2.5 text-emerald-800 text-right font-bold">A+</td>
                                  </tr>
                                </tbody>
                              </table>
                              <div className="mt-4 pt-3 border-t border-[#C9A646]/20 flex justify-between font-serif text-[#0A1F44] font-bold text-sm">
                                <span>Total Cumulative Average:</span>
                                <span>{Math.round((FELLOW_DATA.scores.overall + finalScore) / 2)}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Signatures & Verification */}
                        <div className="flex flex-col md:flex-row justify-between items-end pt-16 border-t border-gray-300 mt-12 gap-8 md:gap-0">
                          <div className="text-center w-full md:w-auto">
                            <div className="w-48 border-b border-gray-800 mb-2 mx-auto">
                              <img src="https://upload.wikimedia.org/wikipedia/commons/f/f8/Stylized_signature_sample.svg" alt="Signature" className="h-12 mx-auto opacity-80" />
                            </div>
                            <p className="font-serif font-bold text-gray-800 text-lg">Dr. Amina Mensah</p>
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Program Director</p>
                          </div>
                          
                          <div className="flex flex-col items-center w-full md:w-auto">
                            <div className="p-2 bg-white border border-gray-200 shadow-sm mb-2">
                              <QRCode value={`${window.location.origin}/verify/${FELLOW_DATA.id}`} size={64} />
                            </div>
                            <button 
                              onClick={() => navigate('/verify/' + FELLOW_DATA.id)}
                              className="text-xs text-gray-500 font-mono font-bold hover:text-blue-600 transition-colors"
                            >
                              ID: {FELLOW_DATA.id}
                            </button>
                            <p className="text-[10px] text-gray-400 uppercase mt-1">Verify at gmaf.org/verify</p>
                          </div>
                          
                          <div className="text-center w-full md:w-auto">
                            <div className="w-48 border-b border-gray-800 mb-2 mx-auto">
                              <img src="https://upload.wikimedia.org/wikipedia/commons/f/f8/Stylized_signature_sample.svg" alt="Signature" className="h-12 mx-auto opacity-80" style={{ transform: 'scaleX(-1)' }} />
                            </div>
                            <p className="font-serif font-bold text-gray-800 text-lg">Prof. Kwame Osei</p>
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Academic Dean</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* 2. PERFORMANCE CLASSIFICATION */}
          {activeTab === 'performance' && (
            <motion.div
              key="performance"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8 max-w-5xl mx-auto"
            >
              {/* Top Banner */}
              <div className="bg-gradient-to-br from-[#0A1F44] to-[#051024] rounded-3xl p-8 shadow-xl relative overflow-hidden text-white flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#C9A646]/20 rounded-full blur-3xl" />
                <div className="relative z-10">
                  <h2 className="text-xl text-[#C9A646] font-bold uppercase tracking-widest mb-2">Final Classification</h2>
                  <div className="text-5xl font-serif font-bold mb-4">{FELLOW_DATA.classification}</div>
                  <p className="text-white/80 text-lg">
                    You performed in the <strong className="text-white">{FELLOW_DATA.percentile}</strong> of your cohort, demonstrating exceptional leadership and analytical capabilities.
                  </p>
                </div>
                <div className="relative z-10 shrink-0 flex flex-col items-center gap-4">
                  <div className="w-32 h-32 rounded-full border-8 border-[#C9A646] flex items-center justify-center bg-[#0A1F44] shadow-[0_0_30px_rgba(201,166,70,0.3)]">
                    <span className="text-3xl font-bold font-serif">{FELLOW_DATA.scores.overall}%</span>
                  </div>
                  <button 
                    onClick={handleExplainScore}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm font-medium backdrop-blur-sm transition-colors border border-white/20"
                  >
                    <HelpCircle className="w-4 h-4" /> Why this score?
                  </button>
                </div>
              </div>

              {/* AI Explanation Modal/Panel */}
              <AnimatePresence>
                {showExplanation && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 border border-[#C9A646]/30 shadow-lg relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#C9A646]" />
                    <button 
                      onClick={() => setShowExplanation(false)}
                      className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-[#C9A646]/10 rounded-lg">
                        <Sparkles className="w-5 h-5 text-[#C9A646]" />
                      </div>
                      <h3 className="text-lg font-bold font-serif text-gray-900 dark:text-white">AI Evaluation Insights</h3>
                    </div>
                    
                    {isGeneratingExplanation ? (
                      <div className="flex items-center gap-3 text-gray-500 py-4">
                        <Loader2 className="w-5 h-5 animate-spin text-[#C9A646]" />
                        <p>Analyzing performance metrics...</p>
                      </div>
                    ) : (
                      <div 
                        className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-gray-300"
                        dangerouslySetInnerHTML={{ __html: aiExplanation || '' }}
                      />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Breakdown Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Radar Chart */}
                <div className="bg-white dark:bg-[#141414] rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col">
                  <h3 className="text-lg font-bold font-serif mb-2 flex items-center gap-2 text-gray-900 dark:text-white">
                    <BarChart3 className="w-5 h-5 text-[#C9A646]" /> Performance Radar
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">Visual breakdown of your core competencies.</p>
                  <div className="flex-1 min-h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={FELLOW_DATA.radarData}>
                        <PolarGrid stroke="#e5e7eb" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 10 }} />
                        <Radar
                          name="Fellow"
                          dataKey="A"
                          stroke="#0A1F44"
                          fill="#0A1F44"
                          fillOpacity={0.4}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Grading Breakdown */}
                  <div className="bg-white dark:bg-[#141414] rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
                    <h3 className="text-lg font-bold font-serif mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
                      <BarChart3 className="w-5 h-5 text-[#C9A646]" /> Grading Breakdown
                    </h3>
                    <div className="space-y-6">
                      {[
                        { label: 'Policy Projects & Briefs', score: FELLOW_DATA.scores.projects },
                        { label: 'Crisis Simulations', score: FELLOW_DATA.scores.simulations },
                        { label: 'Debates & Participation', score: FELLOW_DATA.scores.participation },
                        { label: 'Academic Assessments', score: FELLOW_DATA.scores.assessments },
                      ].map((item, idx) => (
                        <div key={idx}>
                          <div className="flex justify-between text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
                            <span>{item.label}</span>
                            <span>{item.score}%</span>
                          </div>
                          <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${item.score}%` }}
                              transition={{ duration: 1, delay: idx * 0.1 }}
                              className="h-full bg-[#0A1F44] dark:bg-[#C9A646] rounded-full" 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Excellence Board */}
                  <div className="bg-white dark:bg-[#141414] rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
                    <h3 className="text-lg font-bold font-serif mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                      <Award className="w-5 h-5 text-[#C9A646]" /> Recognition
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-4 p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/30 rounded-xl">
                        <Crown className="w-8 h-8 text-yellow-600 dark:text-yellow-500 shrink-0" />
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white">Top 10% Badge</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Awarded for outstanding academic and practical excellence.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl">
                        <Sparkles className="w-8 h-8 text-blue-600 dark:text-blue-500 shrink-0" />
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white">Excellence Award</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Recognized for the exceptional "AI Sovereignty in East Africa" policy brief.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* 3. POLICY PORTFOLIO */}
          {activeTab === 'portfolio' && (
            <motion.div
              key="portfolio"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-5xl mx-auto space-y-6"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-[#141414] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                <div>
                  <h2 className="text-xl font-bold font-serif text-gray-900 dark:text-white mb-1">Compiled Policy Portfolio</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">A professionally formatted collection of your fellowship work, ready for employers.</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-[#0A1F44] text-white rounded-xl font-bold hover:bg-[#071530] transition-colors whitespace-nowrap shadow-md">
                  <Download className="w-5 h-5" /> Download Portfolio
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {FELLOW_DATA.portfolio.map((item) => (
                  <div key={item.id} className="bg-white dark:bg-[#141414] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-[#C9A646] transition-colors group cursor-pointer">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl text-gray-600 dark:text-gray-400 group-hover:bg-[#C9A646]/10 group-hover:text-[#C9A646] transition-colors">
                        <FileText className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{item.date}</span>
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{item.type}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* 4. AI RECOMMENDATION LETTER */}
          {activeTab === 'recommendation' && (
            <motion.div
              key="recommendation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto space-y-6"
            >
              {!recommendationLetter && !isGeneratingLetter ? (
                <div className="bg-white dark:bg-[#141414] rounded-3xl p-12 text-center border border-gray-200 dark:border-gray-800 shadow-sm">
                  <div className="w-20 h-20 bg-[#C9A646]/10 text-[#C9A646] rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileBadge className="w-10 h-10" />
                  </div>
                  <h2 className="text-2xl font-bold font-serif text-gray-900 dark:text-white mb-4">Official Recommendation Letter</h2>
                  <p className="text-gray-600 dark:text-gray-400 max-w-lg mx-auto mb-8">
                    Generate a highly personalized, authoritative recommendation letter drafted by our AI system based on your specific performance metrics, portfolio, and classification. This letter will be formatted for immediate use with employers or academic institutions.
                  </p>
                  <button 
                    onClick={handleGenerateLetter}
                    className="flex items-center gap-2 px-8 py-4 bg-[#0A1F44] text-[#C9A646] rounded-xl font-bold hover:bg-[#071530] transition-colors mx-auto shadow-lg"
                  >
                    <Sparkles className="w-5 h-5" /> Draft Recommendation Letter
                  </button>
                </div>
              ) : isGeneratingLetter ? (
                <div className="bg-white dark:bg-[#141414] rounded-3xl p-16 text-center border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center">
                  <Loader2 className="w-12 h-12 text-[#C9A646] animate-spin mb-6" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Drafting Official Letter...</h3>
                  <p className="text-gray-500">Analyzing performance metrics and portfolio data.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex justify-end gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#141414] border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                      <RefreshCw className="w-4 h-4" /> Request Revision
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#0A1F44] text-white rounded-lg text-sm font-medium hover:bg-[#071530] transition-colors">
                      <Download className="w-4 h-4" /> Download PDF
                    </button>
                  </div>
                  
                  {/* The Letter Document */}
                  <div className="bg-white p-8 md:p-16 shadow-xl rounded-sm border border-gray-200">
                    {/* Letterhead */}
                    <div className="border-b-2 border-[#0A1F44] pb-8 mb-8 flex justify-between items-start">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16">
                          <img src={appLogo} alt="Logo" className="w-full h-full object-contain" />
                        </div>
                        <div>
                          <h1 className="text-2xl font-serif font-bold text-[#0A1F44] uppercase tracking-wider">Golden Minds Africa</h1>
                          <p className="text-sm text-gray-500 font-serif italic">Office of the Academic Dean</p>
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-500 font-serif">
                        <p>120 Innovation Drive</p>
                        <p>Kigali, Rwanda</p>
                        <p>dean@gmaf.org</p>
                        <p className="mt-4">{FELLOW_DATA.issueDate}</p>
                      </div>
                    </div>
                    
                    {/* Letter Content */}
                    <div 
                      className="prose prose-lg prose-gray max-w-none font-serif leading-relaxed text-gray-800"
                      dangerouslySetInnerHTML={{ __html: recommendationLetter || '' }}
                    />
                    
                    {/* Signoff */}
                    <div className="mt-16 pt-8">
                      <p className="font-serif text-gray-800 mb-4">Sincerely,</p>
                      <img src="https://upload.wikimedia.org/wikipedia/commons/f/f8/Stylized_signature_sample.svg" alt="Signature" className="h-16 opacity-80 mb-2" style={{ transform: 'scaleX(-1)' }} />
                      <p className="font-serif font-bold text-gray-900">Prof. Kwame Osei</p>
                      <p className="font-serif text-gray-600">Academic Dean, Golden Minds Africa Fellowship</p>
                      <p className="font-serif text-gray-600">Former Minister of Technology & Innovation</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

export default function Certifications() {
  return (
    <Routes>
      <Route path="/" element={<CertificationsMain />} />
      <Route path="certificate/:id" element={<CertificationsMain />} />
    </Routes>
  );
}
