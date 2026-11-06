import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, Globe, ExternalLink, Award, Users, Star, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MOCK_SHOWCASE = [];


export default function Showcase() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = ['All', 'Public Policy', 'Digital Economy', 'Urban Development', 'Healthcare'];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#0A1F44] to-[#051024] rounded-3xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#C9A646]/20 rounded-full blur-3xl" />
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-[#C9A646]/20 rounded-lg">
              <Globe className="w-6 h-6 text-[#C9A646]" />
            </div>
            <h1 className="text-3xl md:text-5xl font-serif font-bold">Global Showcase</h1>
          </div>
          <p className="text-lg text-gray-300 mb-8 leading-relaxed">
            Discover the groundbreaking projects, policy briefs, and innovations developed by Golden Minds Africa Fellows. Explore world-class solutions to the continent's most pressing challenges.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects, fellows, or topics..."
                className="w-full bg-white/10 border border-white/20 text-white placeholder-gray-400 rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:border-[#C9A646] transition-colors"
              />
            </div>
            <button className="bg-[#C9A646] hover:bg-[#b8972e] text-[#0A1F44] px-8 py-4 rounded-xl font-bold transition-colors whitespace-nowrap flex items-center justify-center gap-2 w-full sm:w-auto">
              <Sparkles className="w-5 h-5" /> Discover
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
              activeFilter === filter 
                ? 'bg-[#0A1F44] text-white shadow-md' 
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Showcase Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {MOCK_SHOWCASE.map((project) => (
          <motion.div 
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-xl transition-all group cursor-pointer flex flex-col"
            onClick={() => navigate(`/portfolio/preview`)}
          >
            <div className="h-48 overflow-hidden relative">
              <img 
                src={project.image} 
                alt={project.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-[#0A1F44] flex items-center gap-1 shadow-sm">
                <Award className="w-3 h-3" /> Featured
              </div>
            </div>
            
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                  <img src={`https://ui-avatars.com/api/?name=${project.author}&background=random`} alt={project.author} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{project.author}</p>
                  <p className="text-xs text-gray-500">{project.track}</p>
                </div>
              </div>
              
              <h3 className="text-xl font-bold font-serif text-gray-900 mb-2 group-hover:text-[#0A1F44] transition-colors">{project.title}</h3>
              <p className="text-gray-600 text-sm mb-6 line-clamp-3 flex-1">{project.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {project.tags.map(tag => (
                  <span key={tag} className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-medium">
                    {tag}
                  </span>
                ))}
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                <div className="flex items-center gap-4 text-gray-500 text-sm">
                  <span className="flex items-center gap-1"><Star className="w-4 h-4" /> {project.likes}</span>
                  <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {project.views}</span>
                </div>
                <span className="text-[#C9A646] font-bold text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  View <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
