import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Briefcase, Plus, Folder, LayoutTemplate, FileText, Rocket, Target, Users, BarChart3, ArrowRight, Globe, MessageSquare, Award } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';

function ProjectsMain() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const activeTab = location.pathname.includes('/portfolio') ? 'portfolio' : 'builder';

  const tabs = [
    { id: 'builder', label: 'Startup & Project Builder', icon: Rocket, path: '/projects/builder/startup' },
    { id: 'portfolio', label: 'Digital Portfolio', icon: LayoutTemplate, path: '/portfolio' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 md:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 
            className="text-3xl md:text-4xl font-bold font-serif text-gray-900 cursor-pointer hover:underline"
            onClick={() => navigate('/projects')}
          >
            Projects & Portfolio
          </h1>
          <p className="text-gray-500 mt-2 text-sm sm:text-base">Build real-world impact and showcase your leadership journey.</p>
        </div>
        <button 
          onClick={() => navigate('/projects/new')}
          className="px-6 py-3 bg-[#ff4e00] text-white font-bold rounded-xl hover:bg-[#e64600] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#ff4e00]/20 w-full sm:w-auto"
        >
          <Plus className="w-5 h-5" /> New Project
        </button>
      </div>

      <div className="flex gap-4 border-b border-gray-200 overflow-x-auto hide-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => navigate(tab.path)}
            className={`flex items-center gap-2 px-4 sm:px-6 py-4 font-medium transition-colors relative whitespace-nowrap ${
              activeTab === tab.id ? 'text-[#ff4e00]' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ff4e00]"
              />
            )}
          </button>
        ))}
      </div>

      {activeTab === 'builder' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-200 hover:shadow-lg transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Idea Validation</h3>
                <p className="text-gray-500 text-sm mb-4">Use AI to analyze market gaps, test assumptions, and refine your core value proposition.</p>
              </div>
              <button 
                onClick={() => navigate('/projects/validation/start')}
                className="w-full py-2 bg-gray-50 text-gray-900 rounded-xl text-sm font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
              >
                Start Validation <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-gray-200 hover:shadow-lg transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4">
                  <LayoutTemplate className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Business Model Canvas</h3>
                <p className="text-gray-500 text-sm mb-4">Map out your revenue streams, cost structure, and key partnerships interactively.</p>
              </div>
              <button 
                onClick={() => navigate('/projects/canvas/business-model')}
                className="w-full py-2 bg-gray-50 text-gray-900 rounded-xl text-sm font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
              >
                Open Canvas <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-gray-200 hover:shadow-lg transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Impact Measurement</h3>
                <p className="text-gray-500 text-sm mb-4">Define KPIs and track the social or economic impact of your initiative over time.</p>
              </div>
              <button 
                onClick={() => navigate('/projects/impact/metrics')}
                className="w-full py-2 bg-gray-50 text-gray-900 rounded-xl text-sm font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
              >
                Set Metrics <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold font-serif text-gray-900 mt-8 sm:mt-12 mb-6">Active Projects</h2>
          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/projects/agritech-supply-chain')}>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-xl flex items-center justify-center text-[#ff4e00] shrink-0">
                  <Rocket className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base sm:text-lg">AgriTech Supply Chain</h3>
                  <p className="text-xs sm:text-sm text-gray-500">Connecting rural farmers to urban markets.</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold self-start sm:self-auto">In Progress</span>
            </div>
            <div className="p-4 sm:p-6 bg-gray-50 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-2 sm:mb-1">Team</p>
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <img key={i} src={`https://picsum.photos/seed/team${i}/100/100`} alt="Team" className="w-8 h-8 rounded-full border-2 border-white" referrerPolicy="no-referrer" />
                  ))}
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">+2</div>
                </div>
              </div>
              <div className="cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/projects/agritech-supply-chain/milestones')}>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Next Milestone</p>
                <p className="text-sm font-medium text-gray-900 hover:underline">MVP Launch (Oct 15)</p>
              </div>
              <div className="flex sm:justify-end items-center mt-2 sm:mt-0">
                <button 
                  onClick={() => navigate('/projects/agritech-supply-chain/workspace')}
                  className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors text-sm w-full sm:w-auto"
                >
                  Open Workspace
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'portfolio' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-[#5A5A40] to-[#8A8A60] text-white p-6 sm:p-8 rounded-3xl relative overflow-hidden flex items-center justify-between">
            <div className="relative z-10 max-w-2xl w-full">
              <h2 className="text-2xl sm:text-3xl font-bold font-serif mb-4">Your Digital Legacy</h2>
              <p className="text-gray-200 mb-6 text-sm sm:text-base">Automatically compile your projects, debates, research, and achievements into a professional, shareable portfolio website.</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => navigate('/portfolio/preview')}
                  className="px-6 py-3 bg-white text-[#5A5A40] font-bold rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  <LayoutTemplate className="w-5 h-5" /> Preview Portfolio
                </button>
                <button 
                  onClick={() => navigate('/portfolio/publish')}
                  className="px-6 py-3 bg-transparent border border-white/30 text-white font-bold rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  <Globe className="w-5 h-5" /> Publish to Web
                </button>
              </div>
            </div>
            <div className="hidden lg:block relative z-10 w-64 h-64 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-4 transform rotate-6 shadow-2xl shrink-0">
              <div className="w-full h-32 bg-gray-200 rounded-xl mb-4 overflow-hidden">
                <img src="https://picsum.photos/seed/portfolio/400/300" alt="Portfolio Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="w-3/4 h-4 bg-white/30 rounded-full mb-2"></div>
              <div className="w-1/2 h-4 bg-white/30 rounded-full"></div>
            </div>
          </div>

          <h3 className="text-xl font-bold font-serif text-gray-900 mt-8 mb-4">Portfolio Sections</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {[
              { title: 'Featured Projects', desc: 'Highlight your top 3 initiatives.', icon: Briefcase, path: '/portfolio/sections/featured' },
              { title: 'Debate Highlights', desc: 'Showcase your best arguments and wins.', icon: MessageSquare, path: '/portfolio/sections/debates' },
              { title: 'Research & Papers', desc: 'Link to your published policy briefs.', icon: FileText, path: '/portfolio/sections/research' },
              { title: 'Leadership Badges', desc: 'Display your verified credentials.', icon: Award, path: '/portfolio/sections/badges' },
            ].map((section, i) => (
              <div 
                key={i} 
                onClick={() => navigate(section.path)}
                className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-200 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-600 shrink-0">
                    <section.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm sm:text-base">{section.title}</h4>
                    <p className="text-xs sm:text-sm text-gray-500">{section.desc}</p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 shrink-0">
                  <Plus className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Projects() {
  return (
    <Routes>
      <Route path="/" element={<ProjectsMain />} />
      <Route path="new" element={<ProjectsMain />} />
      <Route path="builder/startup" element={<ProjectsMain />} />
      <Route path="validation" element={<ProjectsMain />} />
      <Route path="validation/start" element={<ProjectsMain />} />
      <Route path="canvas" element={<ProjectsMain />} />
      <Route path="canvas/business-model" element={<ProjectsMain />} />
      <Route path="impact" element={<ProjectsMain />} />
      <Route path="impact/metrics" element={<ProjectsMain />} />
      <Route path=":projectId" element={<ProjectsMain />} />
      <Route path=":projectId/workspace" element={<ProjectsMain />} />
      <Route path=":projectId/milestones" element={<ProjectsMain />} />
    </Routes>
  );
}
