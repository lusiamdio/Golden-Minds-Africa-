import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Activity, TrendingDown, Globe, Clock, Radio, Users, AlertTriangle, Play, ChevronRight, Terminal, Zap, FileText, Send, BrainCircuit } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import Markdown from 'react-markdown';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface Metrics {
  gdp: number;
  trust: number;
  security: number;
  diplomacy: number;
}

interface FeedItem {
  time: string;
  source: string;
  headline: string;
  type: 'news' | 'social' | 'intelligence' | 'critical' | 'command';
}

export default function CrisisXEngine() {
  const [phase, setPhase] = useState<'briefing' | 'live' | 'debrief'>('briefing');
  const [metrics, setMetrics] = useState<Metrics>({ gdp: 65, trust: 50, security: 70, diplomacy: 60 });
  const [timePassed, setTimePassed] = useState(0); // minutes
  const [feed, setFeed] = useState<FeedItem[]>([
    { time: 'DAY 1 - 00:00 HRS', source: 'CRISIS-X SYSTEM', headline: 'ENGINE ONLINE. CONNECTING TO GLOBAL FEED...', type: 'critical' },
    { time: 'DAY 1 - 00:05 HRS', source: 'MINISTRY OF HEALTH', headline: 'Unknown pathogen cluster detected in 3 major border transit hubs.', type: 'intelligence' },
    { time: 'DAY 1 - 00:15 HRS', source: 'SOCIAL MEDIA', headline: '"Hospitals are turning people away! What is going on??" #Outbreak', type: 'social' }
  ]);
  const [sitRep, setSitRep] = useState("A highly contagious respiratory variant is spreading rapidly. Markets are panicking, and border security is overwhelmed by fleeing citizens. You have the command.");
  const [isProcessing, setIsProcessing] = useState(false);
  const [customAction, setCustomAction] = useState("");
  const [actionCount, setActionCount] = useState(0);
  const [debriefNotes, setDebriefNotes] = useState<string | null>(null);

  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timer: any;
    if (phase === 'live' && !isProcessing) {
      timer = setInterval(() => {
        setTimePassed(p => p + 15);
      }, 2000); // 15 mins every 2 real seconds
    }
    return () => clearInterval(timer);
  }, [phase, isProcessing]);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [feed]);

  const formatTime = (mins: number) => {
    const days = Math.floor(mins / 1440) + 1;
    const hours = Math.floor((mins % 1440) / 60);
    const minutes = mins % 60;
    return `DAY ${days} - ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} HRS`;
  };

  const handleDecision = async (actionStr: string) => {
    if (!actionStr.trim()) return;
    
    setIsProcessing(true);
    setCustomAction("");
    
    const timestamp = formatTime(timePassed);
    setFeed(prev => [...prev, { time: timestamp, source: 'EXECUTIVE COMMAND', headline: `AUTHORISED: ${actionStr}`, type: 'command' }]);

    try {
      const prompt = `You are CRISIS-X, a hyper-realistic AI simulation engine. 
      Scenario: African Pandemic Outbreak + Economic Shock.
      Current metrics: GDP (${metrics.gdp}%), Public Trust (${metrics.trust}%), Security (${metrics.security}%), Diplomacy (${metrics.diplomacy}%).
      The leader just executed this action: "${actionStr}".
      
      Calculate the realistic immediate consequences.
      Return ONLY a valid JSON object matching this schema exactly (no markdown, no backticks, no comments):
      {
        "metricsChanges": { "gdp": number, "trust": number, "security": number, "diplomacy": number },
        "newHeadlines": [
          { "source": "News/Social/Intel", "headline": "Short punchy update", "type": "news" | "social" | "intelligence" | "critical" }
        ],
        "situationReport": "A terse 1-2 sentence military-style intelligence brief on current state."
      }
      Limit metric changes between -20 and +20.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      let jsonStr = response.text || "{}";
      jsonStr = jsonStr.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
      
      const data = JSON.parse(jsonStr);

      setMetrics(prev => ({
        gdp: Math.min(100, Math.max(0, prev.gdp + (data.metricsChanges?.gdp || 0))),
        trust: Math.min(100, Math.max(0, prev.trust + (data.metricsChanges?.trust || 0))),
        security: Math.min(100, Math.max(0, prev.security + (data.metricsChanges?.security || 0))),
        diplomacy: Math.min(100, Math.max(0, prev.diplomacy + (data.metricsChanges?.diplomacy || 0))),
      }));

      if (data.situationReport) setSitRep(data.situationReport);

      if (data.newHeadlines && Array.isArray(data.newHeadlines)) {
        const newItems = data.newHeadlines.map((h: any, idx: number) => ({
          time: formatTime(timePassed + (idx * 5)),
          source: h.source || 'SYSTEM',
          headline: h.headline || 'Update received.',
          type: h.type || 'news'
        }));
        setFeed(prev => [...prev, ...newItems]);
      }

      setActionCount(prev => prev + 1);
    } catch (error) {
      console.error(error);
      setFeed(prev => [...prev, { time: formatTime(timePassed), source: 'SYSTEM ERROR', headline: 'Comlink disruption. Data corrupted.', type: 'critical' }]);
    }
    
    setIsProcessing(false);
  };

  const endSimulation = async () => {
    setIsProcessing(true);
    setPhase('debrief');
    
    try {
      const prompt = `As a top-tier geopolitical and policy coach, provide a strict executive debriefing for a leader who just finished the CRISIS-X simulation.
      Final Metrics: GDP (${metrics.gdp}%), Trust (${metrics.trust}%), Security (${metrics.security}%), Diplomacy (${metrics.diplomacy}%).
      They took ${actionCount} major actions. Evaluated them on Decision Speed, Risk Management, and Communication Clarity. Output in clean Markdown.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      setDebriefNotes(response.text || "Debrief generated.");
    } catch (error) {
      setDebriefNotes("Failed to generate comprehensive debrief.");
    }
    setIsProcessing(false);
  };

  if (phase === 'briefing') {
    return (
      <div className="bg-[#050505] min-h-[700px] text-green-400 font-mono p-8 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-900/20 via-black to-black"></div>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="z-10 text-center max-w-2xl">
          <Terminal className="w-20 h-20 text-cyan-500 mx-auto mb-6 animate-pulse" />
          <h1 className="text-5xl font-bold text-white mb-4 tracking-widest">CRISIS-<span className="text-cyan-500">X</span></h1>
          <p className="text-xl text-green-500/80 mb-8 uppercase tracking-widest">Real-Time Leadership Simulation Engine</p>
          
          <div className="bg-white/5 border border-white/10 p-6 rounded-xl text-left mb-8 backdrop-blur-sm">
            <h3 className="text-white font-bold mb-2 uppercase">Scenario Alpha: The Perfect Storm</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              You are assuming command. A fast-progressing respiratory virus has breached continental borders. Panic is crashing the markets. Supply chains are freezing. Information is incomplete, conflicting, and constantly evolving. 
            </p>
            <p className="text-cyan-400 text-sm font-bold uppercase animate-pulse">Your decisions have immediate consequences.</p>
          </div>

          <button 
            onClick={() => setPhase('live')}
            className="px-10 py-4 bg-cyan-900/50 hover:bg-cyan-700/50 border border-cyan-500/50 text-cyan-300 rounded-lg font-bold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)]"
          >
            Initiate Command Sequence
          </button>
        </motion.div>
      </div>
    );
  }

  if (phase === 'debrief') {
    return (
      <div className="bg-[#050505] min-h-[800px] text-gray-300 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-8">
           <div className="flex items-center gap-4 border-b border-white/10 pb-6">
             <BrainCircuit className="w-10 h-10 text-cyan-500" />
             <div>
               <h1 className="text-3xl font-bold text-white uppercase tracking-widest">Leadership Analytics</h1>
               <p className="text-cyan-500/80 font-mono">Session Terminated. Performance Data Compiled.</p>
             </div>
           </div>

           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
             {Object.entries(metrics).map(([key, val]) => (
                <div key={key} className="bg-white/5 border border-white/10 p-4 rounded-xl text-center">
                  <div className="text-xs text-gray-400 uppercase tracking-widest mb-1">{key}</div>
                  <div className={`text-3xl font-mono ${val > 50 ? 'text-green-400' : 'text-red-400'}`}>{Math.round(val)}%</div>
                </div>
             ))}
           </div>

           <div className="bg-white/5 border border-white/10 rounded-xl p-6 font-mono text-sm leading-relaxed prose prose-invert prose-cyan max-w-none">
             {debriefNotes ? <Markdown>{debriefNotes}</Markdown> : <span className="animate-pulse">Synthesizing debrief data...</span>}
           </div>

           <div className="text-center pt-8">
             <button onClick={() => window.location.reload()} className="text-cyan-500 hover:text-cyan-300 uppercase tracking-widest text-sm font-bold flex items-center justify-center gap-2 mx-auto">
               <Radio className="w-4 h-4" /> End Transmission
             </button>
           </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[85vh] min-h-[700px] bg-[#050505] text-gray-300 font-sans overflow-hidden">
      {/* Top HUD */}
      <div className="h-16 border-b border-white/10 bg-black/50 flex items-center justify-between px-6 shrink-0 z-10 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Activity className="w-5 h-5 text-cyan-500 animate-pulse" />
          <h1 className="text-white font-bold tracking-[0.2em] text-sm hidden sm:block">CRISIS-X COMMAND</h1>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-cyan-400 font-mono bg-cyan-950/30 px-4 py-1.5 rounded border border-cyan-900/50">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-bold">{formatTime(timePassed)}</span>
          </div>
          {isProcessing && <span className="text-xs text-rose-500 font-mono animate-pulse uppercase tracking-widest border border-rose-500/30 bg-rose-950/30 px-2 py-1 rounded">Processing Impact</span>}
          <button onClick={endSimulation} className="text-[10px] uppercase font-bold tracking-widest text-gray-500 hover:text-white px-3 py-1 border border-white/10 rounded transition-colors">
            End Session
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="bg-white/5 border-b border-white/10 p-3 flex gap-2 overflow-x-auto hide-scrollbar z-10 shrink-0">
        {[
          { label: 'GDP Trajectory', val: metrics.gdp, icon: TrendingDown, color: metrics.gdp > 50 ? 'text-emerald-400' : 'text-rose-400' },
          { label: 'Public Trust', val: metrics.trust, icon: Users, color: metrics.trust > 50 ? 'text-emerald-400' : 'text-rose-400' },
          { label: 'Security Index', val: metrics.security, icon: ShieldAlert, color: metrics.security > 50 ? 'text-emerald-400' : 'text-rose-400' },
          { label: 'Diplomacy', val: metrics.diplomacy, icon: Globe, color: metrics.diplomacy > 50 ? 'text-emerald-400' : 'text-rose-400' },
        ].map((m, i) => (
          <div key={i} className="flex-1 min-w-[150px] bg-black/40 border border-white/5 rounded-lg p-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <m.icon className={`w-4 h-4 ${m.color}`} />
              <span className="text-[10px] text-gray-400 uppercase tracking-widest">{m.label}</span>
            </div>
            <span className={`font-mono text-sm font-bold ${m.color}`}>{Math.round(m.val)}%</span>
          </div>
        ))}
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Background Blur */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-900/20 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Intelligence Feed (Left) */}
        <div className="w-full lg:w-1/3 border-r border-white/10 bg-black/40 flex flex-col z-10 shrink-0">
          <div className="p-3 border-b border-white/10 bg-white/5 font-mono text-[10px] uppercase text-gray-400 tracking-widest flex items-center justify-between">
            <span>Live Intelligence Feed</span>
            <Radio className="w-3 h-3 text-rose-500 animate-pulse" />
          </div>
          <div ref={feedRef} className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs hide-scrollbar">
            <AnimatePresence initial={false}>
              {feed.map((item, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-3 rounded border ${
                    item.type === 'critical' ? 'bg-rose-950/20 border-rose-900/50 text-rose-200' :
                    item.type === 'command' ? 'bg-cyan-950/20 border-cyan-900/50 text-cyan-200' :
                    item.type === 'social' ? 'bg-purple-950/20 border-purple-900/50 text-purple-200' :
                    'bg-white/5 border-white/10 text-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1 opacity-70 text-[9px]">
                    <span className="tracking-wider">{item.source}</span>
                    <span>{item.time}</span>
                  </div>
                  <p className="leading-relaxed">{item.headline}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Center Map / Situation */}
        <div className="flex-1 flex flex-col z-10 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] relative">
          <div className="flex-1 flex items-center justify-center p-8 relative">
             <div className="w-full max-w-md aspect-square rounded-full border border-cyan-500/20 flex flex-col items-center justify-center relative bg-black/60 shadow-[0_0_50px_rgba(6,182,212,0.05)] backdrop-blur-sm">
                <Globe className="w-32 h-32 text-white/5 absolute" strokeWidth={0.5} />
                <MapPulse top="30%" left="40%" color="bg-rose-500" delay="0s" text="Outbreak Epicenter" />
                <MapPulse top="60%" left="60%" color="bg-orange-500" delay="1s" text="Border Clash" />
                <MapPulse top="50%" left="30%" color="bg-yellow-500" delay="2s" text="Market Panic" />
             </div>
          </div>
          
          <div className="p-6 bg-black/80 border-t border-cyan-900/50 backdrop-blur-xl">
             <div className="flex items-center gap-2 mb-2">
               <AlertTriangle className="w-4 h-4 text-cyan-400" />
               <span className="text-xs uppercase text-cyan-400 font-bold tracking-widest">Executive SitRep</span>
             </div>
             <p className="font-mono text-sm leading-relaxed text-gray-300">{sitRep}</p>
          </div>
        </div>

        {/* Decision Console (Right) */}
        <div className="w-full lg:w-1/3 border-l border-white/10 bg-black/50 flex flex-col z-10 shrink-0">
          <div className="p-3 border-b border-white/10 bg-white/5 font-mono text-[10px] uppercase text-cyan-400 tracking-widest font-bold">
            Live Decision Console
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 shrink-0">
            <div className="space-y-3 mb-8">
              {[
                { title: 'Declare National Emergency & Lockdown Targets', action: 'Initiate targeted lockdown of border regions and declare national health emergency.' },
                { title: 'Deploy Military for Quarantine Logistics', action: 'Deploy military forces to manage supply chains and enforce quarantines.' },
                { title: 'Inject Emergency Liquidity ($5B)', action: 'Central bank injects $5 billion to stabilize markets and prevent bank runs.' },
                { title: 'Address the Nation (Reassurance)', action: 'Televised national address to calm panic, emphasizing stability and transparency.' }
              ].map((btn, i) => (
                <button 
                  key={i}
                  onClick={() => handleDecision(btn.action)}
                  disabled={isProcessing}
                  className="w-full text-left p-3 rounded bg-white/5 border border-white/10 hover:bg-cyan-950/40 hover:border-cyan-800/50 transition-colors font-mono text-xs text-gray-300 hover:text-cyan-300 flex items-center justify-between group disabled:opacity-50"
                >
                  <span className="tracking-wider">{btn.title}</span>
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-900/30">
              <label className="block text-[10px] uppercase tracking-widest text-cyan-500 font-bold mb-2">Issue Custom Directive</label>
              <textarea 
                value={customAction}
                onChange={e => setCustomAction(e.target.value)}
                placeholder="Type complex executive order here..."
                className="w-full h-24 bg-black/50 border border-white/10 rounded p-3 text-xs font-mono text-white focus:outline-none focus:border-cyan-500/50 resize-none mb-3"
              />
              <button 
                onClick={() => handleDecision(customAction)}
                disabled={!customAction.trim() || isProcessing}
                className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-black font-bold uppercase tracking-widest text-[10px] rounded flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
              >
                <Send className="w-3 h-3" /> Transmit Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MapPulse({ top, left, color, delay, text }: { top: string, left: string, color: string, delay: string, text: string }) {
  return (
    <div className="absolute" style={{ top, left }}>
      <div className={`w-2 h-2 rounded-full ${color} relative z-10`}></div>
      <div className={`absolute inset-0 w-8 h-8 -translate-x-[12px] -translate-y-[12px] rounded-full ${color} opacity-20 animate-ping`} style={{ animationDelay: delay }}></div>
      <div className="absolute left-4 top-0 text-[8px] font-mono whitespace-nowrap text-white/50 tracking-widest uppercase">{text}</div>
    </div>
  );
}
