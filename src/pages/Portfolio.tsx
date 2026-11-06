import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Briefcase, FileText, Award, Download, Share2, Globe, ExternalLink, Edit3, CheckCircle2, Sparkles, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { GoogleGenAI } from '@google/genai';
import { Routes, Route, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';
import Markdown from 'react-markdown';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

function PortfolioOverview() {
  const navigate = useNavigate();
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 text-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Award className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-600" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold font-serif mb-4 text-[#022c22]">Your Leadership Portfolio</h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-8 text-sm sm:text-base">
          The Showcase Your Brilliance system allows you to curate and present your most impactful work. 
          Submit projects, policy briefs, and achievements to build a comprehensive record of your leadership journey.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8 text-left">
          <div className="p-4 sm:p-6 bg-gray-50 rounded-2xl">
            <h3 className="font-bold text-gray-900 mb-2">1. Curate</h3>
            <p className="text-sm text-gray-600">Select your best work from simulations, debates, and independent research.</p>
          </div>
          <div className="p-4 sm:p-6 bg-gray-50 rounded-2xl">
            <h3 className="font-bold text-gray-900 mb-2">2. Submit</h3>
            <p className="text-sm text-gray-600">Send your curated items for peer and faculty review to earn verified credentials.</p>
          </div>
          <div className="p-4 sm:p-6 bg-gray-50 rounded-2xl">
            <h3 className="font-bold text-gray-900 mb-2">3. Showcase</h3>
            <p className="text-sm text-gray-600">Share your verified portfolio with mentors, peers, and external stakeholders.</p>
          </div>
        </div>
        
        <div className="bg-emerald-50 rounded-2xl p-4 sm:p-6 mb-8 text-left">
          <h3 className="font-bold text-[#022c22] mb-4 flex items-center gap-2 text-sm sm:text-base">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            Current Status Snapshot
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm">
              <div className="text-xl sm:text-2xl font-bold text-gray-900">3</div>
              <div className="text-xs sm:text-sm text-gray-600">Active Drafts</div>
            </div>
            <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm">
              <div className="text-xl sm:text-2xl font-bold text-amber-600">1</div>
              <div className="text-xs sm:text-sm text-gray-600">Pending Review</div>
            </div>
            <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm">
              <div className="text-xl sm:text-2xl font-bold text-blue-600">5</div>
              <div className="text-xs sm:text-sm text-gray-600">Submitted</div>
            </div>
            <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm">
              <div className="text-xl sm:text-2xl font-bold text-emerald-600">12</div>
              <div className="text-xs sm:text-sm text-gray-600">Reviewed & Verified</div>
            </div>
          </div>
        </div>

        <button 
          onClick={() => navigate('/portfolio')}
          className="bg-[#022c22] hover:bg-[#064e3b] text-white px-6 sm:px-8 py-3 rounded-xl font-bold transition-colors w-full sm:w-auto"
        >
          Go to Portfolio Builder
        </button>
      </div>
    </div>
  );
}

function PortfolioMain() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isExporting, setIsExporting] = useState(false);
  const [portfolioSummary, setPortfolioSummary] = useState('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [activeTab, setActiveTab] = useState(searchParams.get('status') || 'active');
  const [selectedArticle, setSelectedArticle] = useState<{title: string, pub: string, content: string} | null>(null);

  const publications = [
    {
      title: "The Future of Digital Currencies in Africa",
      pub: "Published in Fellowship Journal • March 2026",
      content: `## Executive Summary
This paper examines the integration of central bank digital currencies (CBDCs) and decentralized financial protocols within the East African monetary union. As mobile money platforms like M-Pesa have established unmatched financial inclusion, sovereign digital currencies represent the logical next phase of infrastructure.

## Key Recommendations
1. **Interoperable Settlement Rails:** National CBDC systems must natively support cross-border instant settlement to maximize trade under the AfCFTA framework.
2. **Hybrid Governance Architectures:** Centralized sovereignty combined with decentralized validation nodes increases transaction auditability and systemic resilience.
3. **Proportional Regulatory Sandboxes:** Allow financial technology startups to pilot secondary credit and savings products using the digital currency APIs without full retail licensing hurdles.`
    },
    {
      title: "Decentralized Energy Grids and Rural Electrification",
      pub: "Published in Green Summit Quarterly • January 2026",
      content: `## Executive Summary
Energy poverty remains one of the primary roadblocks to industrialization in Sub-Saharan Africa. This research argues that massive, centralized grid extensions are capital-inefficient and sluggish compared to modular, solar-and-wind decentralized microgrids managed via automated smart contracts.

## Key Findings
- **Modular Expansion:** Microgrids can scale incrementally with community demand, reducing upfront capital requirement by over 60%.
- **Tokenized Billing:** Micro-payments via localized stablecoins or mobile airtime tokens enable automated utility billing and instant revenue sharing among microgrid developers and local operators.`
    },
    {
      title: "AI Ethics in Public Policy: An African Perspective",
      pub: "Published in Tech & Governance Review • November 2025",
      content: `## Abstract
This policy review advocates for localized algorithmic frameworks. Current mainstream AI ethics guidelines originate predominantly from North American and European institutions, prioritizing individualistic data rights over community-oriented social structures.

## Core Pillars
1. **Ubuntu Algorithmic Frameworks:** Promoting collective benefits and human dignity in algorithmic automated decision-making.
2. **Sovereign Training Corpora:** Building open-source, high-quality training sets that reflect regional African languages, cultural nuances, and historical realities to eliminate western algorithmic bias.`
    }
  ];

  useEffect(() => {
    const status = searchParams.get('status');
    if (status) {
      setActiveTab(status);
    }
  }, [searchParams]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchParams({ status: tab });
  };

  const handleGenerateSummary = async () => {
    setIsGeneratingSummary(true);
    try {
      const prompt = `Act as an expert career coach. Write a compelling, 3-sentence professional summary for an African leadership fellow named ${profile?.name || 'a fellow'}. 
      Highlight their focus on policy, entrepreneurship, and their active participation in debates and projects. 
      Make it sound confident and ready for a LinkedIn profile or personal website.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      setPortfolioSummary(response.text || 'Summary generation failed.');
    } catch (error) {
      console.error('Error generating summary:', error);
      setPortfolioSummary('Unable to connect to AI Assistant.');
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => setIsExporting(false), 2000); // Mock export
  };

  const { user } = useAuth();
  const generatePortfolioPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });

      // GMA Premium Brand Color Palette
      const brandDarkGreen = [2, 44, 34]; // rgb(2,44,34)
      const brandAmberGold = [212, 175, 55]; // rgb(212,175,55)

      // Branded Header block
      doc.setFillColor(brandDarkGreen[0], brandDarkGreen[1], brandDarkGreen[2]);
      doc.rect(0, 0, 210, 48, 'F');

      // Header Text Elements
      doc.setTextColor(255, 255, 255);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(20);
      doc.text('GOLDEN MINDS AFRICA FELLOWSHIP', 15, 18);
      
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10.5);
      doc.setTextColor(brandAmberGold[0], brandAmberGold[1], brandAmberGold[2]);
      doc.text('PROFESSIONAL GMA LEADERSHIP PORTFOLIO TRANSCRIPT', 15, 26);
      doc.setTextColor(210, 210, 210);
      doc.text(`Record Generated: ${new Date().toLocaleDateString()} • Verified Academic Transcript`, 15, 33);

      // Gold Accent Band
      doc.setFillColor(brandAmberGold[0], brandAmberGold[1], brandAmberGold[2]);
      doc.rect(0, 41, 210, 2, 'F');

      // User Information Details
      doc.setTextColor(40, 40, 40);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(16);
      doc.text(`${profile?.name || 'Fellow Leadership Student'}`, 15, 60);
      
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10.5);
      doc.setTextColor(110, 110, 110);
      doc.text(`Fellowship Register ID: ${user?.id ? user.id.toUpperCase().slice(0, 12) : 'GMA-STUDENT'}`, 15, 66);
      doc.text(`Email Contact Key: ${user?.email || 'fellow@goldenmindsafrica.org'}`, 15, 72);
      doc.text(`Academic Level Status: Level ${Math.floor((profile?.participationScore || 0) / 50) + 1} Fellow Athlete`, 15, 78);

      // Horizontal separator line
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.5);
      doc.line(15, 84, 195, 84);

      // Executive Summary
      doc.setTextColor(brandDarkGreen[0], brandDarkGreen[1], brandDarkGreen[2]);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(12.5);
      doc.text('Executive & Professional Summary', 15, 93);

      doc.setTextColor(70, 70, 70);
      doc.setFont('Helvetica', 'oblique');
      doc.setFontSize(10);
      const summTxt = portfolioSummary || "Passionate leader focused on sustainable development and tech innovation in Africa. Experienced in policy analysis, collaborative debate formats, and tech entrepreneurship capstones.";
      const wrappedSummary = doc.splitTextToSize(summTxt, 180);
      doc.text(wrappedSummary, 15, 100);

      // Academic Milestones Section
      doc.setTextColor(brandDarkGreen[0], brandDarkGreen[1], brandDarkGreen[2]);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(12.5);
      doc.text('Verified Fellowship Milestones & Credentials', 15, 123);
      doc.line(15, 126, 195, 126);

      doc.setTextColor(60, 60, 60);
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10);
      doc.text('• Top 10% Seminar Debate Finalist (Verified)', 18, 133);
      doc.text('• 3 Published Peer-Reviewed Policy Briefs (Verified)', 18, 139);
      doc.text('• Capstone Project Regional Innovation Grant Finalist (Verified)', 18, 145);

      // Capstone Project Spotlight
      doc.setTextColor(brandDarkGreen[0], brandDarkGreen[1], brandDarkGreen[2]);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(12.5);
      doc.text('Capstone Project Spotlight', 15, 161);
      doc.line(15, 164, 195, 164);

      doc.setTextColor(50, 50, 50);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('AgriTech Supply Chain Ledger Capstone', 15, 171);
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(95, 95, 95);
      const projD = doc.splitTextToSize('A secure, regional blockchain-based supply chain ledger platform developed for East African agricultural commodities, tracing farm-gate yields, increasing fair incomes, and avoiding waste.', 180);
      doc.text(projD, 15, 177);

      // Verified Publication
      doc.setTextColor(brandDarkGreen[0], brandDarkGreen[1], brandDarkGreen[2]);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(12.5);
      doc.text('Academic Journal Publications', 15, 199);
      doc.line(15, 202, 195, 202);

      doc.setTextColor(50, 50, 50);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('The Future of Digital Currencies in Africa', 15, 209);
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(110, 110, 110);
      doc.text('Published under Digital Economy Track in Fellowship Journal • March 2026', 15, 214);

      // Branded page background & footer
      doc.setFillColor(248, 248, 245);
      doc.rect(0, 274, 210, 23, 'F');
      doc.setTextColor(110, 110, 110);
      doc.setFontSize(8);
      doc.text('Official Digital Academic Transcript - Golden Minds Africa Executive Board', 15, 282);
      doc.text('Security verification signature: VERIFIED-AUTHENTIC-GMAF-2026', 15, 287);
      doc.text('Page 1 of 1', 185, 284);

      doc.save(`${profile?.name || 'Fellow'}_GMA_Leadership_Portfolio.pdf`);
      toast.success('Branded portfolio PDF transcript generated and downloaded!');
    } catch (pdfErr) {
      console.error('jsPDF execution error:', pdfErr);
      toast.error('Could not compile PDF document.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Action */}
      <div className="bg-gradient-to-br from-[#022c22] to-[#064e3b] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4af37]/10 rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-serif mb-2">Showcase Your Brilliance</h1>
            <p className="text-emerald-100 max-w-xl text-sm sm:text-base">
              Build your leadership portfolio, track your submissions, and present your achievements to the world.
            </p>
          </div>
          <button 
            onClick={() => navigate('/portfolio/overview')}
            className="bg-[#d4af37] hover:bg-[#b8972e] text-[#022c22] px-6 py-3 rounded-xl font-bold shadow-lg transition-colors flex items-center justify-center gap-2 shrink-0 w-full md:w-auto"
          >
            <Sparkles className="w-5 h-5" />
            Showcase Your Brilliance
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 border-b border-gray-200 pb-2">
        {['active', 'pending', 'submitted', 'reviewed'].map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`px-4 py-2 rounded-full text-sm font-bold capitalize whitespace-nowrap transition-colors ${
              activeTab === tab 
                ? 'bg-[#022c22] text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif mb-2 text-[#022c22]">Digital Portfolio Builder</h1>
          <p className="text-gray-600 text-sm sm:text-base">Your professional showcase of projects, debates, and achievements.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={generatePortfolioPDF}
            className="flex items-center justify-center gap-2 bg-[#d4af37] text-[#022c22] px-5 py-2.5 rounded-full shadow-md hover:bg-[#b8972e] transition-colors w-full sm:w-auto font-bold text-sm cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Download PDF Report</span>
          </button>
          <button className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-full shadow-sm hover:bg-gray-50 transition-colors w-full sm:w-auto">
            <Share2 className="w-4 h-4" />
            <span className="text-sm font-bold">Share Link</span>
          </button>
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center justify-center gap-2 bg-[#022c22] text-white px-5 py-2.5 rounded-full shadow-md hover:bg-[#064e3b] transition-colors disabled:opacity-70 w-full sm:w-auto"
          >
            {isExporting ? <CheckCircle2 className="w-4 h-4 animate-pulse" /> : <Download className="w-4 h-4 text-[#d4af37]" />}
            <span className="text-sm font-bold">{isExporting ? 'Exporting...' : 'Export as Website'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-1 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 text-center"
          >
            <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto rounded-full bg-gray-100 mb-4 overflow-hidden border-4 border-white shadow-lg">
              <img src={profile?.avatar || `https://ui-avatars.com/api/?name=${profile?.name}`} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-gray-900 mb-1">{profile?.name || 'Fellow Name'}</h2>
            <p className="text-xs sm:text-sm text-[#d4af37] font-bold uppercase tracking-wider mb-4">Golden Minds Fellow</p>
            
            <div className="flex justify-center gap-3 mb-6">
              <button className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-blue-600 transition-colors"><Globe className="w-5 h-5" /></button>
              <button className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-blue-400 transition-colors"><ExternalLink className="w-5 h-5" /></button>
            </div>

            <div className="text-left border-t border-gray-100 pt-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
                <h3 className="font-bold text-gray-900">Professional Summary</h3>
                <button 
                  onClick={handleGenerateSummary}
                  disabled={isGeneratingSummary}
                  className="text-xs font-bold text-[#022c22] hover:underline flex items-center gap-1"
                >
                  <Edit3 className="w-3 h-3" /> {isGeneratingSummary ? 'Generating...' : 'AI Generate'}
                </button>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed italic">
                {portfolioSummary || "Passionate leader focused on sustainable development and tech innovation in Africa. Experienced in policy analysis and community building."}
              </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
          >
            <h3 className="font-bold font-serif text-lg mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-[#d4af37]" />
              Key Achievements
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-gray-700">
                <div className="w-2 h-2 rounded-full bg-green-500 shrink-0"></div> Top 10% Debate Score
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-700">
                <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></div> 3 Published Policy Briefs
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-700">
                <div className="w-2 h-2 rounded-full bg-purple-500 shrink-0"></div> Innovation Grant Finalist
              </li>
            </ul>
          </motion.div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100"
          >
            <h3 className="text-lg sm:text-xl font-bold font-serif mb-6 flex items-center gap-2">
              <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-[#022c22]" />
              Featured Projects
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="border border-gray-100 rounded-2xl p-4 sm:p-5 hover:border-[#022c22] transition-colors group cursor-pointer">
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#022c22] transition-colors">
                    <Briefcase className="w-5 h-5 text-emerald-600 group-hover:text-white" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">AgriTech Supply Chain</h4>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">A blockchain-based solution for tracking agricultural produce from farm to market in East Africa.</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-md">React</span>
                    <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-md">Logistics</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100"
          >
            <h3 className="text-lg sm:text-xl font-bold font-serif mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-[#022c22]" />
              Publications & Debates
            </h3>
            <div className="space-y-4">
              {publications.map((pub, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row items-start gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-1">{pub.title}</h4>
                    <p className="text-sm text-gray-500 mb-2">{pub.pub}</p>
                    <button 
                      onClick={() => setSelectedArticle(pub)} 
                      className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                    >
                      Read Article →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Article Preview Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl"
          >
            <div className="p-6 border-b border-gray-100 flex items-start justify-between bg-gray-50">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">{selectedArticle.pub}</span>
                <h3 className="text-xl sm:text-2xl font-bold font-serif text-gray-900 mt-1">{selectedArticle.title}</h3>
              </div>
              <button 
                onClick={() => setSelectedArticle(null)}
                className="p-1.5 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 sm:p-8 overflow-y-auto flex-1 text-gray-700 leading-relaxed">
              <div className="markdown-body prose prose-sm max-w-none">
                <Markdown>{selectedArticle.content}</Markdown>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button 
                onClick={() => setSelectedArticle(null)}
                className="px-5 py-2.5 bg-gray-900 hover:bg-black text-white text-sm font-bold rounded-xl transition-colors"
              >
                Close Reader
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default function Portfolio() {
  return (
    <div className="max-w-6xl mx-auto pb-12">
      <Routes>
        <Route index element={<PortfolioMain />} />
        <Route path="overview" element={<PortfolioOverview />} />
        <Route path="preview" element={<PortfolioMain />} />
        <Route path="publish" element={<PortfolioMain />} />
        <Route path="sections" element={<PortfolioMain />} />
        <Route path="sections/featured" element={<PortfolioMain />} />
        <Route path="sections/debates" element={<PortfolioMain />} />
        <Route path="sections/research" element={<PortfolioMain />} />
        <Route path="sections/badges" element={<PortfolioMain />} />
      </Routes>
    </div>
  );
}
