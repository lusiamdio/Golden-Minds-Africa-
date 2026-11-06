import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Download, FileText, Share2, Sparkles, ExternalLink, ArrowRight, CheckCircle2, X } from 'lucide-react';
import afcftaCoverImage from '../assets/images/122a2330.jpg';

interface Article {
  id: string;
  title: string;
  category: 'policy' | 'research' | 'news' | 'podcast';
  author: string;
  date: string;
  readTime: string;
  downloadablePdf?: string;
  excerpt: string;
  content: string;
  image: string;
}

const ARTICLES: Article[] = [
  {
    id: 'afcfta-2026',
    title: 'The AfCFTA Youth Trade Manifesto: Unlocking $3.4 Trillion in Intra-African Commerce',
    category: 'policy',
    author: 'Lusimanadio Soki Simao & Research Bureau',
    date: 'January 18, 2026',
    readTime: '12 min read',
    downloadablePdf: 'AfCFTA_Youth_Trade_Manifesto_2026.pdf',
    image: afcftaCoverImage,
    excerpt: 'Comprehensive policy blueprint analyzing tariff exemptions, cross-border digital payment interoperability, and youth supply-chain incubators under the AfCFTA.',
    content: `The African Continental Free Trade Area represents the world's largest free trade zone by number of participating countries. This policy report examines how youth-owned enterprises can leverage simplified trade regimes, pan-African digital payment systems (PAPSS), and localized value chains to accelerate economic sovereignty.`
  },
  {
    id: 'ai-ethics-africa',
    title: 'Pan-African AI Governance Framework: Protecting Data Sovereignty in the Age of LLMs',
    category: 'research',
    author: 'Prof. Kwame Mensah',
    date: 'February 2, 2026',
    readTime: '15 min read',
    downloadablePdf: 'AI_Governance_Africa_Framework.pdf',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=600&fit=crop&q=80',
    excerpt: 'Examining the ethical deployment of artificial intelligence, open-source language models for African indigenous languages, and critical data infrastructure security.',
    content: `As artificial intelligence rewrites global industry, African nations must build indigenous computing capacity and privacy legislation. This paper presents actionable regulatory guidelines for member states of the African Union.`
  },
  {
    id: 'congo-basin-minerals',
    title: 'Congo Basin Critical Minerals & Green Transition Diplomacy Whitepaper',
    category: 'policy',
    author: 'Dr. Amina Diop & ECCAS Bureau',
    date: 'February 20, 2026',
    readTime: '10 min read',
    downloadablePdf: 'Congo_Basin_Critical_Minerals_Diplomacy.pdf',
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=600&fit=crop&q=80',
    excerpt: 'Structuring sovereign mineral refining cartels, community benefit agreements, and rainforest preservation treaties across Central Africa.',
    content: `Central Africa holds over 70% of the world's cobalt and critical battery minerals. This study proposes a unified regional pricing mechanism and in-continent value addition mandates.`
  }
];

export default function NewsroomAndResearch() {
  const [activeCategory, setActiveCategory] = useState<'all' | 'policy' | 'research' | 'news'>('all');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const filteredArticles = activeCategory === 'all'
    ? ARTICLES
    : ARTICLES.filter(a => a.category === activeCategory);

  const handleDownload = (pdfName: string) => {
    setDownloadSuccess(true);
    setTimeout(() => {
      setDownloadSuccess(false);
    }, 3000);
  };

  return (
    <section id="newsroom" className="py-24 px-6 relative bg-[#08080A] overflow-hidden">
      <div className="container mx-auto max-w-7xl relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] text-xs font-semibold uppercase tracking-widest mb-3">
            <BookOpen className="w-3.5 h-3.5" /> Policy Research & Knowledge Hub
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white">
            Publications & <span className="text-gold-gradient">Research Papers</span>
          </h2>
          <p className="text-gray-400 mt-4 text-base md:text-lg">
            Peer-reviewed constitutional whitepapers, parliamentary policy briefs, economic reports, and diplomatic essays informing decision-makers across Africa.
          </p>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
            {[
              { id: 'all', label: 'All Publications' },
              { id: 'policy', label: 'Policy Briefs' },
              { id: 'research', label: 'Research Whitepapers' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id as any)}
                className={`px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all border ${
                  activeCategory === tab.id
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black border-transparent font-bold shadow-md'
                    : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Big Article Magazine Banner */}
        <div className="glass-card-gold rounded-3xl p-8 md:p-12 mb-12 border border-white/15 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <span className="px-3.5 py-1 bg-[#D4AF37] text-black text-xs font-bold uppercase tracking-wider rounded-full">
                Featured Lead Policy Report
              </span>
              <h3 className="text-2xl sm:text-4xl font-serif font-bold text-white leading-tight">
                {ARTICLES[0].title}
              </h3>
              <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                {ARTICLES[0].excerpt}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 font-medium pt-2">
                <span>Author: <strong className="text-white">{ARTICLES[0].author}</strong></span>
                <span>•</span>
                <span>Published: {ARTICLES[0].date}</span>
                <span>•</span>
                <span>{ARTICLES[0].readTime}</span>
              </div>
              <div className="pt-4 flex flex-wrap gap-3">
                <button
                  onClick={() => setSelectedArticle(ARTICLES[0])}
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#B8860B] text-black font-bold text-xs uppercase tracking-wider shadow-lg flex items-center gap-2"
                >
                  Read Policy Paper <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDownload(ARTICLES[0].downloadablePdf!)}
                  className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider border border-white/15 flex items-center gap-2"
                >
                  <Download className="w-4 h-4 text-[#D4AF37]" /> Download Official PDF
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 relative rounded-2xl overflow-hidden aspect-[4/3] border border-white/10">
              <img
                src={ARTICLES[0].image}
                alt={ARTICLES[0].title}
                className="w-full h-full object-cover filter saturate-[0.9]"
              />
            </div>
          </div>
        </div>

        {/* Articles List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredArticles.slice(1).map((art) => (
            <motion.div
              key={art.id}
              whileHover={{ y: -6 }}
              className="glass-card rounded-3xl p-8 border border-white/10 hover:border-white/30 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-[#D4AF37] uppercase mb-3">
                  <span>{art.category}</span>
                  <span className="text-gray-400">{art.date}</span>
                </div>

                <h3 className="text-2xl font-serif font-bold text-white mb-3">{art.title}</h3>
                <p className="text-sm text-gray-300 leading-relaxed mb-6">{art.excerpt}</p>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  onClick={() => setSelectedArticle(art)}
                  className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5"
                >
                  Read Publication <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDownload(art.downloadablePdf!)}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-[#D4AF37] hover:text-black text-gray-300 transition-colors"
                  title="Download PDF"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Article Viewer Modal */}
      <AnimatePresence>
        {selectedArticle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-3xl bg-[#0E0E12] border border-white/20 rounded-3xl p-8 shadow-2xl relative text-white max-h-[85vh] overflow-y-auto"
            >
              <button
                onClick={() => setSelectedArticle(null)}
                className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-4">
                <span className="px-3 py-1 bg-[#D4AF37]/20 text-[#D4AF37] text-xs font-bold uppercase rounded-full">
                  {selectedArticle.category} Briefing
                </span>
                <h2 className="text-3xl font-serif font-bold text-white leading-tight">
                  {selectedArticle.title}
                </h2>
                <div className="text-xs text-gray-400 flex items-center gap-3">
                  <span>Author: {selectedArticle.author}</span>
                  <span>•</span>
                  <span>Date: {selectedArticle.date}</span>
                </div>

                <div className="pt-4 space-y-4 text-gray-300 text-sm md:text-base leading-relaxed">
                  <p>{selectedArticle.content}</p>
                  <p>
                    For full technical data, econometric projections, and legislative amendment clauses, download the complete peer-reviewed policy manuscript below.
                  </p>
                </div>

                <div className="pt-6 flex items-center justify-between">
                  <button
                    onClick={() => handleDownload(selectedArticle.downloadablePdf!)}
                    className="px-6 py-3 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black font-bold text-xs uppercase tracking-wider flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" /> Download Full PDF Report
                  </button>
                  <button
                    onClick={() => setSelectedArticle(null)}
                    className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase"
                  >
                    Close Document
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Download Toast Notification */}
      <AnimatePresence>
        {downloadSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3.5 rounded-full bg-[#13294B] border border-white/20 text-white shadow-2xl flex items-center gap-3 text-sm font-medium"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Policy PDF Download Initiated. Check your downloads.</span>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
