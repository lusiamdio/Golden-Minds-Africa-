import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, Users, TrendingUp, AlertTriangle, Battery, Shield, ArrowRightLeft, Radio, Anchor, Activity, FileText } from 'lucide-react';

export default function GeopoliticalMap() {
  const [activeTab, setActiveTab] = useState<'map' | 'alliances' | 'resources'>('map');
  const [activeAlert, setActiveAlert] = useState<string | null>('CRISIS: Supply Chain Disruption in Cobalt Export Route');

  const alliances = [
    { name: 'African Union Bloc', power: 85, focus: 'Resource Sovereignty', members: 54 },
    { name: 'EU-US Climate Coalition', power: 92, focus: 'Emissions Targets', members: 28 },
    { name: 'BRICS+ Strategic Alliance', power: 88, focus: 'Alternative Finance', members: 10 },
  ];

  const minerals = [
    { name: 'Cobalt', region: 'Central Africa', control: 'AU-China contested', demand: 'Critical' },
    { name: 'Lithium', region: 'Southern Africa', control: 'AU Sovereign', demand: 'High' },
    { name: 'Rare Earths', region: 'Global', control: 'China Dominant', demand: 'Critical' },
  ];

  // Map visualization (abstracted dashboard style)
  return (
    <div className="bg-[#020b14] min-h-[700px] border border-[#d4af37]/20 rounded-xl overflow-hidden flex flex-col font-mono text-white shadow-2xl relative">
      {/* Top Navigation Bar: UN Assembly x Bloomberg */}
      <div className="border-b border-[#d4af37]/20 bg-[#04111f] p-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#d4af37]" />
            <h2 className="text-[#d4af37] font-bold text-sm tracking-widest uppercase">Global Resource & Climate Accord 2035</h2>
          </div>
          <div className="h-4 w-px bg-white/20"></div>
          <div className="flex items-center gap-2 text-xs text-blue-300">
            <Radio className="w-4 h-4 animate-pulse text-red-500" /> LIVE NEGOTIATION FEED
          </div>
        </div>
        <div className="flex text-xs space-x-1 uppercase">
          {['map', 'alliances', 'resources'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-1.5 rounded transition-colors ${activeTab === tab ? 'bg-[#d4af37] text-black font-bold' : 'text-blue-300 hover:bg-white/5'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar: News ticker and stats */}
        <div className="w-64 border-r border-[#d4af37]/20 bg-[#04111f]/50 p-4 flex flex-col hide-scrollbar overflow-y-auto">
          <h3 className="text-white/50 text-[10px] uppercase font-bold tracking-widest mb-4 border-b border-white/10 pb-2">Power Levers</h3>
          
          <div className="space-y-4 mb-8">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-blue-200">Global Tech Transfer</span>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-[45%]"></div>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-[#d4af37]">AU Agenda 2063 Alignment</span>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-[#d4af37] w-[68%]"></div>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-green-400">Debt Sustainability Index</span>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 w-[32%]"></div>
              </div>
            </div>
          </div>

          <h3 className="text-white/50 text-[10px] uppercase font-bold tracking-widest mb-4 border-b border-white/10 pb-2">Live Diplomatic Wire</h3>
          <div className="space-y-3 relative overflow-hidden">
             {/* Gradual fade at bottom */}
             <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#04111f] to-transparent z-10 pointer-events-none"></div>
             
             {[
               "USA delegation proposes bilateral tech-for-minerals swap...",
               "EU warns of carbon border taxes on unsustainably mined lithium.",
               "China insists on uninterrupted cobalt supply pathways.",
               "Civil Society coalition stages walk-out over transparency."
             ].map((wire, idx) => (
               <div key={idx} className="flex gap-2 items-start text-xs text-white/70 bg-white/5 p-2 rounded">
                 <ArrowRightLeft className="w-3 h-3 text-blue-400 shrink-0 mt-0.5" />
                 <p className="leading-tight">{wire}</p>
               </div>
             ))}
          </div>
        </div>

        {/* Center Canvas */}
        <div className="flex-1 relative p-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-[#020b14]/90 flex flex-col">
          {activeAlert && (
             <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="absolute top-6 left-1/2 -translate-x-1/2 z-50 bg-red-900/80 border border-red-500 text-red-100 flex items-center gap-3 px-6 py-2 rounded-full shadow-lg shadow-red-500/20 backdrop-blur-md"
             >
               <AlertTriangle className="w-4 h-4 animate-ping" />
               <span className="text-xs font-bold tracking-wider">{activeAlert}</span>
               <button onClick={() => setActiveAlert(null)} className="ml-4 text-red-200 hover:text-white">&times;</button>
             </motion.div>
          )}

          <AnimatePresence mode="wait">
            {activeTab === 'map' && (
              <motion.div key="map" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center relative">
                {/* Abstract Africa Map Component */}
                <div className="w-[400px] h-[400px] relative border border-[#d4af37]/20 rounded-full flex items-center justify-center p-8 bg-[#04111f] shadow-2xl">
                  {/* Pseudo Map shape using SVG path for Africa */}
                  <svg viewBox="0 0 100 100" className="w-full h-full text-[#0a2342] drop-shadow-2xl">
                    <path fill="currentColor" stroke="#d4af37" strokeWidth="0.5" d="M30,30 Q40,15 60,30 T80,50 Q75,75 55,90 Q40,95 30,70 T20,50 Q10,40 30,30 Z" />
                    {/* Nodes / Regions */}
                    <circle cx="50" cy="50" r="3" fill="#3b82f6" className="animate-pulse" />
                    <circle cx="40" cy="60" r="2" fill="#ef4444" />
                    <circle cx="65" cy="45" r="2.5" fill="#22c55e" />
                    <circle cx="35" cy="40" r="1.5" fill="#f59e0b" />
                    
                    {/* Connections */}
                    <path stroke="#3b82f6" strokeWidth="0.5" strokeDasharray="2,2" fill="none" d="M50,50 L40,60 M50,50 L65,45 M40,60 L35,40" />
                  </svg>
                  
                  {/* Floating Data Labels */}
                  <div className="absolute top-[30%] left-[20%] text-[10px] text-blue-300 bg-blue-900/50 px-2 py-1 rounded border border-blue-500/30 backdrop-blur-sm">West Hub<br/><span className="text-white">Trade Route Active</span></div>
                  <div className="absolute top-[60%] left-[25%] text-[10px] text-red-300 bg-red-900/50 px-2 py-1 rounded border border-red-500/30 backdrop-blur-sm">Central Basin<br/><span className="text-red-400">Cobalt Supply Shock</span></div>
                  <div className="absolute top-[45%] right-[20%] text-[10px] text-green-300 bg-green-900/50 px-2 py-1 rounded border border-green-500/30 backdrop-blur-sm">East Tech<br/><span className="text-green-400">Investment +14%</span></div>
                  <div className="absolute bottom-[20%] left-[45%] text-[10px] text-[#d4af37] bg-yellow-900/50 px-2 py-1 rounded border border-[#d4af37]/30 backdrop-blur-sm">Southern Grid<br/><span className="text-white">Transition Stable</span></div>
                </div>
                
                <p className="mt-8 text-white/50 text-xs tracking-widest uppercase">Geopolitical Positioning Matrix</p>
              </motion.div>
            )}

            {activeTab === 'alliances' && (
              <motion.div key="alliances" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 w-full flex flex-col p-4">
                 <h3 className="text-white/80 text-sm uppercase font-bold tracking-widest mb-6 flex items-center gap-2"><Users className="w-4 h-4 text-[#d4af37]" /> Alliance Tracker</h3>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mx-auto">
                    {alliances.map((alliance, idx) => (
                      <div key={idx} className="bg-[#04111f] border border-white/10 rounded-lg p-5 flex flex-col">
                        <h4 className="text-[#d4af37] font-bold text-sm mb-1">{alliance.name}</h4>
                        <p className="text-xs text-white/50 mb-4 uppercase tracking-wider">{alliance.members} Member States</p>
                        
                        <div className="mt-auto space-y-4">
                          <div>
                            <div className="flex justify-between text-[10px] mb-1">
                              <span className="text-blue-300">Coalition Power</span>
                              <span>{alliance.power} / 100</span>
                            </div>
                            <div className="h-1 bg-white/10 rounded-full w-full">
                              <div className="h-full bg-blue-500" style={{ width: `${alliance.power}%` }}></div>
                            </div>
                          </div>
                          <div className="bg-white/5 p-2 rounded border border-white/10 text-xs">
                            <span className="text-white/40 block mb-1">Strategic Focus</span>
                            <span className="text-white/90">{alliance.focus}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                 </div>
              </motion.div>
            )}

            {activeTab === 'resources' && (
              <motion.div key="resources" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 w-full flex flex-col p-4">
                 <h3 className="text-white/80 text-sm uppercase font-bold tracking-widest mb-6 flex items-center gap-2"><Battery className="w-4 h-4 text-[#d4af37]" /> Critical Minerals Allocation</h3>
                 <div className="overflow-x-auto w-full max-w-4xl mx-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[#d4af37]/30 text-[10px] uppercase tracking-widest text-[#d4af37]">
                          <th className="p-3 font-normal">Mineral</th>
                          <th className="p-3 font-normal">Primary Region</th>
                          <th className="p-3 font-normal">Sovereign Control</th>
                          <th className="p-3 font-normal">Global Demand</th>
                        </tr>
                      </thead>
                      <tbody>
                        {minerals.map((min, idx) => (
                          <tr key={idx} className="border-b border-white/5 text-xs text-white/80 hover:bg-white/5 transition-colors">
                            <td className="p-3 font-bold">{min.name}</td>
                            <td className="p-3 text-blue-300">{min.region}</td>
                            <td className="p-3">
                              <span className={`px-2 py-1 rounded-full text-[10px] ${min.control.includes('AU') ? 'bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
                                {min.control}
                              </span>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <Activity className={`w-3 h-3 ${min.demand === 'Critical' ? 'text-red-500' : 'text-yellow-500'}`} />
                                {min.demand}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Sidebar: Actions */}
        <div className="w-64 border-l border-[#d4af37]/20 bg-[#04111f]/50 p-4 flex flex-col">
          <h3 className="text-[#d4af37] text-[10px] uppercase font-bold tracking-widest mb-4 border-b border-[#d4af37]/20 pb-2">Diplomatic Actions</h3>
          
          <div className="space-y-2 flex-1">
            <ActionBtn icon={FileText} text="Draft UN Resolution" />
            <ActionBtn icon={Anchor} text="Propose Trade-Off" />
            <ActionBtn icon={Shield} text="Form Bilateral Pact" />
            <ActionBtn icon={AlertTriangle} text="Trigger Crisis Response" variant="danger" />
          </div>

          <div className="mt-4 bg-white/5 border border-white/10 rounded-lg p-3 text-xs">
            <p className="text-white/50 mb-2 uppercase tracking-widest text-[9px] font-bold">Your Objective</p>
            <p className="text-white/90 leading-relaxed">Push for technology transfer agreements from major powers while maintaining sovereignty over mineral resources.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionBtn({ icon: Icon, text, variant = 'default' }: { icon: any, text: string, variant?: 'default' | 'danger' }) {
  return (
    <button className={`w-full flex items-center gap-3 p-3 text-left text-xs uppercase tracking-wider rounded border transition-colors ${
      variant === 'danger' 
        ? 'border-red-900/50 bg-red-950/20 text-red-400 hover:bg-red-900/40 hover:border-red-500' 
        : 'border-blue-900/50 bg-blue-950/20 text-blue-300 hover:bg-blue-900/40 hover:border-blue-500'
    }`}>
      <Icon className="w-4 h-4 shrink-0" />
      {text}
    </button>
  );
}
