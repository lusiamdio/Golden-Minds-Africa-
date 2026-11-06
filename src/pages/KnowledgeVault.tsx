import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Search, Book, FileText, Video, Network, Sparkles, Filter, ChevronRight, Hash } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import Markdown from 'react-markdown';
import KnowledgeGraph from './KnowledgeGraph';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MOCK_RESOURCES = [];


function KnowledgeVaultMain() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchMode, setSearchMode] = useState<'internal' | 'web'>('internal');

  const handleAISearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setAiSummary(null);
    try {
      if (searchMode === 'internal') {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `Based on the following resources: ${JSON.stringify(MOCK_RESOURCES)}. Answer the user's query: "${searchQuery}". Provide a concise summary and recommend which resources to look at.`
        });
        setAiSummary(response.text);
      } else {
        // Live Web Search using Perplexity RapidAPI
        const options = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-rapidapi-host': 'perplexity2.p.rapidapi.com',
            'x-rapidapi-key': 'cd707cd18emsha46a78d1c51103cp11a3eajsn047d42571f12'
          },
          body: JSON.stringify({ content: searchQuery })
        };
        const res = await fetch('https://perplexity2.p.rapidapi.com/', options);
        if (!res.ok) throw new Error('Failed to fetch from live web API.');
        const data = await res.json();
        
        // Extract text depending on exact API payload shape (usually Gemini-like choices[0].content.parts[0].text for this specific RapidAPI endpoint)
        let text = "No content returned.";
        if (data.choices && data.choices[0] && data.choices[0].content && data.choices[0].content.parts) {
            text = data.choices[0].content.parts[0].text;
        } else if (data.text) {
            text = data.text; // Fallback
        } else if (typeof data === 'string') {
            text = data;
        } else {
            text = JSON.stringify(data, null, 2);
        }
        
        setAiSummary(text);
      }
    } catch (error: any) {
      console.error('Search Error:', error);
      setAiSummary(`Error generating response: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 dark:text-white">Knowledge Vault</h1>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1 sm:mt-2">Collective intelligence library of all cohorts, powered by AI.</p>
        </div>
      </div>

      {/* Search & AI Section */}
      <div className="bg-gradient-to-br from-[#022c22] to-[#011a14] rounded-3xl p-5 sm:p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-[#d4af37]/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 max-w-3xl mx-auto space-y-5 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[#d4af37] mb-1 sm:mb-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
              <h2 className="text-lg sm:text-xl font-bold">Ask the Vault</h2>
            </div>
            
            <div className="flex bg-black/30 p-1 rounded-xl border border-white/10 w-max">
              <button
                onClick={() => setSearchMode('internal')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${searchMode === 'internal' ? 'bg-[#d4af37] text-[#011a14]' : 'text-gray-400 hover:text-white'}`}
              >
                Internal Vault
              </button>
              <button
                onClick={() => setSearchMode('web')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 ${searchMode === 'web' ? 'bg-[#d4af37] text-[#011a14]' : 'text-gray-400 hover:text-white'}`}
              >
                <Search className="w-3 h-3" /> Live Web
              </button>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAISearch()}
                placeholder={searchMode === 'internal' ? "E.g., What are the key policies for digital infrastructure?" : "Search the web (Perplexity AI) for live news..."}
                className="w-full bg-white/10 border border-white/20 text-white placeholder-gray-400 rounded-xl pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 text-sm sm:text-base focus:outline-none focus:border-[#d4af37] transition-colors"
              />
            </div>
            <button 
              onClick={handleAISearch}
              disabled={isSearching}
              className="bg-[#d4af37] hover:bg-white text-[#022c22] px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-sm sm:text-base font-bold transition-colors disabled:opacity-50 whitespace-nowrap w-full sm:w-auto"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>

          {aiSummary && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-white/10 text-gray-200"
            >
              <div className="flex items-center gap-2 mb-2 sm:mb-3 text-[#d4af37]">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="font-bold text-[10px] sm:text-sm uppercase tracking-wider">{searchMode === 'web' ? 'Live Web Summary (Perplexity)' : 'AI Synthesis (Local Vault)'}</span>
              </div>
              <div className="prose prose-invert max-w-none text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                <Markdown>{aiSummary}</Markdown>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
        {/* Filters */}
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-3 sm:mb-4 font-bold text-gray-900 dark:text-white">
              <Filter className="w-4 h-4 sm:w-5 sm:h-5" /> Filters
            </div>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <h4 className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 sm:mb-2">Resource Type</h4>
                <div className="space-y-1 sm:space-y-2">
                  {['All', 'Document', 'Video', 'Guide', 'Transcript'].map(type => (
                    <label key={type} className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                      <input type="checkbox" className="rounded border-gray-300 text-[#ff4e00] focus:ring-[#ff4e00]" defaultChecked={type === 'All'} />
                      {type}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 sm:mb-2">Topics</h4>
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  {['Policy', 'Tech', 'AI', 'Healthcare', 'Funding'].map(topic => (
                    <span key={topic} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md text-[10px] sm:text-xs cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-2xl border border-purple-500/20 p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-1 sm:mb-2 text-purple-600 dark:text-purple-400 font-bold text-sm sm:text-base">
              <Network className="w-4 h-4 sm:w-5 sm:h-5" /> Knowledge Graph
            </div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">Explore connections between topics and resources visually.</p>
            <button 
              onClick={() => navigate('/knowledge/graph')}
              className="w-full py-2 bg-purple-500 text-white rounded-xl text-xs sm:text-sm font-medium hover:bg-purple-600 transition-colors"
            >
              Open Graph Explorer
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-3 space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
            <span>Showing {MOCK_RESOURCES.length} resources</span>
            <select className="bg-transparent border-none focus:ring-0 cursor-pointer font-medium text-gray-700 dark:text-gray-300 text-xs sm:text-sm">
              <option>Most Relevant</option>
              <option>Newest First</option>
              <option>Most Viewed</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {MOCK_RESOURCES.map(resource => (
              <div 
                key={resource.id} 
                onClick={() => navigate('/knowledge/doc/policy-framework-2026')}
                className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6 hover:border-[#ff4e00]/50 transition-colors group cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400 group-hover:bg-[#ff4e00]/10 group-hover:text-[#ff4e00] transition-colors">
                    {resource.type === 'Document' && <FileText className="w-4 h-4 sm:w-5 sm:h-5" />}
                    {resource.type === 'Video' && <Video className="w-4 h-4 sm:w-5 sm:h-5" />}
                    {resource.type === 'Guide' && <Book className="w-4 h-4 sm:w-5 sm:h-5" />}
                    {resource.type === 'Transcript' && <FileText className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </div>
                  <span className="text-[10px] sm:text-xs text-gray-500">{new Date(resource.date).toLocaleDateString()}</span>
                </div>
                <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white mb-1 group-hover:text-[#ff4e00] transition-colors">{resource.title}</h3>
                <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">By {resource.author}</p>
                <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
                  {resource.tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1 text-[8px] sm:text-[10px] font-medium px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
                      <Hash className="w-2 h-2 sm:w-3 sm:h-3" /> {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center text-xs sm:text-sm font-medium text-[#ff4e00] opacity-0 group-hover:opacity-100 transition-opacity">
                  View Resource <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function KnowledgeVault() {
  return (
    <Routes>
      <Route path="/" element={<KnowledgeVaultMain />} />
      <Route path="doc/:id" element={<KnowledgeVaultMain />} />
      <Route path="graph" element={<KnowledgeGraph />} />
    </Routes>
  );
}
