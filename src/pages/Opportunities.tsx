import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import { Briefcase, GraduationCap, DollarSign, Mic, Sparkles, ExternalLink, Search, Filter } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MOCK_OPPORTUNITIES = [];


function OpportunitiesMain() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [aiRecommendation, setAiRecommendation] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleGetRecommendations = async () => {
    setIsAnalyzing(true);
    try {
      const prompt = `Act as an AI career advisor for an African leadership fellowship. 
      Based on a fellow's interest in "Policy, Governance, and Tech Entrepreneurship", 
      recommend 2 specific types of opportunities they should pursue and why. 
      Keep it brief, encouraging, and actionable.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      setAiRecommendation(response.text || 'Recommendation generation failed.');
    } catch (error) {
      console.error('Error generating recommendations:', error);
      setAiRecommendation('Unable to connect to AI Assistant.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const filteredOpportunities = MOCK_OPPORTUNITIES.filter(opp => {
    const matchesTab = activeTab === 'all' || opp.type === activeTab;
    const matchesSearch = opp.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          opp.org.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getIcon = (type: string) => {
    switch(type) {
      case 'scholarship': return <GraduationCap className="w-5 h-5 text-blue-500" />;
      case 'grant': return <DollarSign className="w-5 h-5 text-green-500" />;
      case 'internship': return <Briefcase className="w-5 h-5 text-purple-500" />;
      case 'speaking': return <Mic className="w-5 h-5 text-orange-500" />;
      case 'startup': return <Sparkles className="w-5 h-5 text-yellow-500" />;
      default: return <Briefcase className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 pb-12 p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold font-serif mb-2 text-[#022c22]">Opportunity Marketplace</h1>
          <p className="text-gray-600 text-sm sm:text-base">Discover scholarships, grants, internships, and speaking engagements.</p>
        </div>
        <button 
          onClick={handleGetRecommendations}
          disabled={isAnalyzing}
          className="flex items-center justify-center gap-2 bg-[#022c22] text-white px-5 py-2.5 rounded-full shadow-md hover:bg-[#064e3b] transition-colors disabled:opacity-70 w-full md:w-auto"
        >
          {isAnalyzing ? <Sparkles className="w-4 h-4 animate-pulse" /> : <Sparkles className="w-4 h-4 text-[#d4af37]" />}
          <span className="text-sm font-bold">AI Matchmaker</span>
        </button>
      </div>

      {aiRecommendation && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 shadow-sm"
        >
          <div className="flex items-center gap-2 text-emerald-800 font-bold mb-3">
            <Sparkles className="w-5 h-5" /> AI Career Insights
          </div>
          <div className="prose prose-sm prose-emerald max-w-none text-emerald-900">
            <div dangerouslySetInnerHTML={{ __html: aiRecommendation.replace(/\n/g, '<br/>') }} />
          </div>
        </motion.div>
      )}

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search opportunities..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#022c22]"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          {['all', 'scholarship', 'grant', 'internship', 'speaking', 'startup'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-bold capitalize whitespace-nowrap transition-colors ${
                activeTab === tab ? 'bg-[#022c22] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOpportunities.map((opp, i) => (
          <motion.div
            key={opp.id}
            onClick={() => navigate('/opportunities/job/un-policy-analyst')}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col h-full cursor-pointer"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100">
                {getIcon(opp.type)}
              </div>
              <div className="bg-green-50 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> {opp.match}% Match
              </div>
            </div>
            <h3 className="font-bold font-serif text-xl mb-1 text-gray-900">{opp.title}</h3>
            <p className="text-sm text-gray-500 mb-4 font-medium">{opp.org}</p>
            
            <div className="flex flex-wrap gap-2 mb-6 mt-auto">
              {opp.tags.map(tag => (
                <span key={tag} className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                  {tag}
                </span>
              ))}
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Due: {new Date(opp.deadline).toLocaleDateString()}
              </div>
              <button className="text-[#022c22] hover:text-[#064e3b] transition-colors">
                <ExternalLink className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
      
      {filteredOpportunities.length === 0 && (
        <div className="text-center p-12 bg-white rounded-3xl border border-gray-100">
          <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">No opportunities found</h3>
          <p className="text-gray-500">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
}

export default function Opportunities() {
  return (
    <Routes>
      <Route path="/" element={<OpportunitiesMain />} />
      <Route path="job/:id" element={<OpportunitiesMain />} />
    </Routes>
  );
}
