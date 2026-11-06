import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Cpu, AlertTriangle, ShieldAlert, Building2, Users, Play, CheckCircle2, Clock, BarChart3, ChevronRight, Globe, Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import GeopoliticalMap from '../components/simulations/GeopoliticalMap';
import CrisisSimulator from '../components/simulations/CrisisSimulator';
import CrisisXEngine from '../components/simulations/CrisisXEngine';

export default function Simulations() {
  const { profile } = useAuth();
  const [activeSimulation, setActiveSimulation] = useState<string | null>(null);

  const simulations: any[] = [];

  const completedSims = simulations.filter(s => s.completed);
  const avgScore = completedSims.length > 0 
    ? Math.round(completedSims.reduce((acc, curr) => acc + (curr.score || 0), 0) / completedSims.length)
    : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 md:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold font-serif text-gray-900">Leadership Simulation Lab</h1>
          <p className="text-gray-500 mt-2 text-sm sm:text-base">Test your decision-making skills in high-stakes, AI-driven scenarios.</p>
        </div>
        <div className="flex items-center gap-4 bg-white px-4 sm:px-6 py-3 rounded-2xl border border-gray-200 shadow-sm w-full sm:w-auto overflow-x-auto hide-scrollbar">
          <div className="text-center shrink-0">
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Simulations Completed</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 font-serif">{completedSims.length} <span className="text-sm text-gray-400 font-sans">/ {simulations.length}</span></p>
          </div>
          <div className="w-px h-10 bg-gray-200 shrink-0"></div>
          <div className="text-center shrink-0">
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Avg. Score</p>
            <p className="text-xl sm:text-2xl font-bold text-green-600 font-serif">{avgScore}%</p>
          </div>
        </div>
      </div>

      {!activeSimulation ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {simulations.map((sim) => (
            <div key={sim.id} className="bg-white rounded-3xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all group cursor-pointer flex flex-col" onClick={() => setActiveSimulation(sim.id)}>
              <div className="p-6 sm:p-8 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center ${sim.bg} ${sim.color} shrink-0`}>
                    <sim.icon className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  {sim.completed ? (
                    <div className="flex items-center gap-1 sm:gap-2 bg-green-50 text-green-600 px-2 sm:px-4 py-1 sm:py-2 rounded-full font-bold text-[10px] sm:text-sm">
                      <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" /> Score: {sim.score}%
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 sm:gap-2 bg-gray-100 text-gray-600 px-2 sm:px-4 py-1 sm:py-2 rounded-full font-bold text-[10px] sm:text-sm">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4" /> {sim.duration}
                    </div>
                  )}
                </div>
                
                <h3 className="text-xl sm:text-2xl font-bold font-serif text-gray-900 mb-2">{sim.title}</h3>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
                  <span className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">{sim.category}</span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full hidden sm:block"></span>
                  <span className={`text-xs sm:text-sm font-bold ${
                    sim.difficulty === 'Hard' ? 'text-red-500' : 
                    sim.difficulty === 'Extreme' ? 'text-purple-600' : 'text-yellow-500'
                  }`}>{sim.difficulty}</span>
                </div>
                <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 flex-1">{sim.description}</p>
                
                <button className={`w-full py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg flex items-center justify-center gap-2 transition-colors mt-auto ${
                  sim.completed 
                    ? 'bg-gray-50 text-gray-900 border border-gray-200 hover:bg-gray-100' 
                    : 'bg-[#ff4e00] text-white hover:bg-[#e64600] shadow-lg shadow-[#ff4e00]/20'
                }`}>
                  {sim.completed ? 'Review Feedback' : 'Start Simulation'} <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : activeSimulation === 'sim-5' ? (
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-2xl relative">
          <div className="absolute top-4 right-4 z-50">
            <button onClick={() => setActiveSimulation(null)} className="p-2 bg-black/50 text-white hover:bg-black rounded-lg transition-colors shadow-lg backdrop-blur flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
               Exit Room
            </button>
          </div>
          <GeopoliticalMap />
        </div>
      ) : activeSimulation === 'sim-13' ? (
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-2xl relative">
          <div className="absolute top-4 right-4 z-50">
            <button onClick={() => setActiveSimulation(null)} className="p-2 bg-white/50 hover:bg-white text-gray-900 rounded-lg transition-colors shadow-sm backdrop-blur flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
               Exit Scenario
            </button>
          </div>
          <CrisisSimulator />
        </div>
      ) : activeSimulation === 'sim-14' ? (
        <div className="bg-black rounded-3xl border border-gray-800 overflow-hidden shadow-2xl relative">
          <div className="absolute top-4 right-4 z-50">
            <button onClick={() => setActiveSimulation(null)} className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors shadow-sm backdrop-blur flex items-center gap-2 text-xs font-bold uppercase tracking-wider border border-white/10">
               Abort Mission
            </button>
          </div>
          <CrisisXEngine />
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-2xl">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-4 sm:p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <button onClick={() => setActiveSimulation(null)} className="p-2 hover:bg-white/10 rounded-lg transition-colors shrink-0">
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 rotate-180" />
              </button>
              <div>
                <h2 className="text-lg sm:text-xl font-bold font-serif line-clamp-1">{simulations.find(s => s.id === activeSimulation)?.title}</h2>
                <p className="text-xs sm:text-sm text-gray-400">Simulation in progress...</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-red-500/20 text-red-400 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-bold text-xs sm:text-sm border border-red-500/30 self-start sm:self-auto">
              <Clock className="w-4 h-4" /> 44:59 remaining
            </div>
          </div>
          
          <div className="p-4 sm:p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base">Situation Update: Day 1, 08:00 AM</h3>
                </div>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-4">
                  Minister, we have a critical situation. The Rand has devalued 18% overnight following a massive investor withdrawal. Inflation is spiking, and early reports indicate public unrest is rising in major urban centers. The President needs your immediate recommendation to stabilize the economy.
                </p>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                  <p className="text-sm font-bold text-gray-900 mb-2">Key Data Points:</p>
                  <ul className="list-disc list-inside text-xs sm:text-sm text-gray-600 space-y-1">
                    <li>Currency Devaluation: 18% (24hr)</li>
                    <li>Inflation Spike: Projected +4.5% this month</li>
                    <li>Foreign Capital Flight: $2.4B withdrawn</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <h4 className="font-bold text-gray-900 text-sm sm:text-base">Your Action:</h4>
                <button className="w-full text-left p-3 sm:p-4 rounded-xl border-2 border-gray-200 hover:border-[#ff4e00] hover:bg-orange-50 transition-all group">
                  <p className="font-bold text-gray-900 group-hover:text-[#ff4e00] text-sm sm:text-base">A. Raise Interest Rates Aggressively</p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">Defend the currency and curb inflation, but risk triggering a severe recession and higher unemployment.</p>
                </button>
                <button className="w-full text-left p-3 sm:p-4 rounded-xl border-2 border-gray-200 hover:border-[#ff4e00] hover:bg-orange-50 transition-all group">
                  <p className="font-bold text-gray-900 group-hover:text-[#ff4e00] text-sm sm:text-base">B. Request IMF Intervention</p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">Secure emergency stabilization funds, but accept strict austerity measures and political backlash.</p>
                </button>
                <button className="w-full text-left p-3 sm:p-4 rounded-xl border-2 border-gray-200 hover:border-[#ff4e00] hover:bg-orange-50 transition-all group">
                  <p className="font-bold text-gray-900 group-hover:text-[#ff4e00] text-sm sm:text-base">C. Implement Capital Control Policies</p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">Halt the immediate outflow of foreign capital, but severely damage long-term investor confidence.</p>
                </button>
                <button className="w-full text-left p-3 sm:p-4 rounded-xl border-2 border-gray-200 hover:border-[#ff4e00] hover:bg-orange-50 transition-all group">
                  <p className="font-bold text-gray-900 group-hover:text-[#ff4e00] text-sm sm:text-base">D. Announce Emergency Stimulus Package</p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">Calm public unrest and support local businesses, but risk hyperinflation and further currency collapse.</p>
                </button>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm sm:text-base"><BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" /> Current Metrics</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs sm:text-sm mb-1">
                      <span className="text-gray-600">Market Confidence</span>
                      <span className="font-bold text-red-600">22%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 w-[22%]"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs sm:text-sm mb-1">
                      <span className="text-gray-600">Political Stability</span>
                      <span className="font-bold text-yellow-600">55%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-500 w-[55%]"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs sm:text-sm mb-1">
                      <span className="text-gray-600">Public Sentiment</span>
                      <span className="font-bold text-orange-600">40%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 w-[40%]"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 sm:p-6 rounded-2xl border border-blue-100">
                <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2 text-sm sm:text-base"><Cpu className="w-4 h-4 sm:w-5 sm:h-5" /> AI Sovereign Advisor</h3>
                <p className="text-xs sm:text-sm text-blue-800 italic">
                  "Minister, historical data from similar emerging market shocks suggests that capital controls (Option C) provide immediate relief but take years to recover from. An aggressive rate hike (Option A) is the standard orthodox response, though it will hurt the working class immediately."
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
