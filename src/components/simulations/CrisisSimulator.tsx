import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, Activity, TrendingDown, CheckCircle2, BrainCircuit, ArrowRight, Target } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import Markdown from 'react-markdown';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const scenarios = [
  {
    id: 'pandemic',
    title: 'Unusual cluster of severe respiratory cases',
    icon: Activity,
    color: 'blue',
    metrics: [
      { label: 'Trust', value: 70 },
      { label: 'Containment', value: 50 },
      { label: 'Capacity', value: 80 },
    ],
    description: "Your health ministry reports 47 hospitalizations in two cities over 72 hours — an unusual cluster of a severe, fast-progressing respiratory illness. Laboratory results are 72 hours away. Social media speculation is spreading. You have limited information and must act.",
    question: "Your immediate priority as crisis leader:",
    options: [
      "Convene a small expert group. Get facts before any public statement.",
      "Issue a calm public statement: 'We are monitoring the situation.'",
      "Declare a national health emergency immediately to show decisiveness.",
      "Wait 24 hours for lab results — no action without data."
    ],
    idealContext: "The pandemic simulation runs you through the core tension in public health leadership: acting on incomplete information versus waiting for certainty, and balancing epidemiological logic with political sustainability. The models here draw from South Korea, Taiwan, and New Zealand's 2020 responses."
  },
  {
    id: 'economic',
    title: 'National currency loses 22% in 48 hours',
    icon: TrendingDown,
    color: 'red',
    metrics: [
      { label: 'Confidence', value: 35 },
      { label: 'Stability', value: 40 },
      { label: 'Reserves', value: 55 },
    ],
    description: "Your nation's currency has collapsed 22% against major currencies in 48 hours. Bond yields have spiked to 11%. Three major banks are reportedly facing runs. The IMF is 'monitoring the situation.' Your finance minister is asking for a cabinet decision before markets open tomorrow.",
    question: "Your immediate response:",
    options: [
      "Emergency rate hike + capital controls + direct public address by midnight.",
      "Call the IMF immediately and begin emergency negotiations.",
      "Print currency to shore up the banks and prevent runs.",
      "Publicly reassure markets: 'The fundamentals are strong.'"
    ],
    idealContext: "The economic collapse scenario tests whether you understand that financial crises are fundamentally psychological — market confidence can self-fulfil in either direction. The key question is sequencing: what do you signal first, and to whom? Iceland's post-2008 response (protect citizens over creditors) is the reference point for the best choices."
  },
  {
    id: 'security',
    title: 'Border incursion: 3 military posts attacked, 12 casualties',
    icon: ShieldAlert,
    color: 'orange',
    metrics: [
      { label: 'Security', value: 55 },
      { label: 'Diplomacy', value: 60 },
      { label: 'Cohesion', value: 70 },
    ],
    description: "At 0340hrs, three of your border posts were attacked by forces that your intelligence suggests are affiliated with a neighbouring state. 12 soldiers are dead, 8 wounded. The attack appears to be probing your response capacity. Cabinet is assembling. International allies have been notified but haven't responded. Your military commander is asking for authorisation to respond.",
    question: "Your immediate decision in the first hour:",
    options: [
      "Authorise defensive posture only. Convene NSC. Demand explanation via diplomatic channel.",
      "Authorise immediate proportionate military response. Show you will not be tested.",
      "Call the neighbouring state's head of government directly before any military action.",
      "Declare war and begin full mobilisation."
    ],
    idealContext: "The conflict scenario is built around the Clausewitzian principle that war is the extension of politics — meaning military options should always be subordinate to political objectives. The best choices consistently slow down decision-making rather than accelerating it, because irreversibility is the defining feature of military escalation."
  }
];

const CORE_PRINCIPLES = "The best crisis leaders share four traits regardless of context: they observe before acting (resist the pressure to perform decisiveness); they communicate proportionately (neither minimising nor catastrophising); they build the exit into the entry (every escalation measure has a pre-designed off-ramp); and they protect legitimacy as aggressively as they protect any other resource — because without public trust, the tools of governance stop working.";

export default function CrisisSimulator() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [debrief, setDebrief] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSelect = (idx: number) => {
    setAnswers({ ...answers, [scenarios[currentStep].id]: idx });
    if (currentStep < scenarios.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const getDebrief = async () => {
    setIsAnalyzing(true);
    try {
      let prompt = `You are a world-class crisis leadership coach evaluating an executive. 
      The participant just completed 3 crisis simulations. 
      
      Here are the principles of crisis leadership you must assess them against:
      ${CORE_PRINCIPLES}

      Here are the scenarios, the context, and what the participant chose:
`;

      scenarios.forEach(scen => {
        prompt += `\n--- SCENARIO: ${scen.title} ---\n`;
        prompt += `Context: ${scen.description}\n`;
        prompt += `Ideal Benchmark: ${scen.idealContext}\n`;
        prompt += `Participant's Choice: ${scen.options[answers[scen.id]]}\n`;
      });

      prompt += `\nWrite a personalised, direct, and rigorous leadership debrief interpreting their decision pattern across all 3 scenarios. 
      Do not be overly flattering. Critically evaluate whether they perform decisiveness vs observing, how they sequence actions, and if their choices are proportional. 
      Output should be clean markdown with headings and bullet points where helpful.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      setDebrief(response.text || 'Unable to generate debrief.');
    } catch(e) {
      console.error(e);
      setDebrief('Error generating debrief. Please check your connection or API key.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (currentStep >= scenarios.length) {
    return (
      <div className="p-8 md:p-12 h-full flex flex-col items-center bg-gray-50 min-h-[600px] overflow-y-auto w-full rounded-b-3xl">
        <div className="max-w-3xl w-full">
            {!debrief ? (
              <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="text-center"
              >
                  <div className="flex justify-center mb-8">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-10 h-10 text-green-600" />
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold font-serif text-center mb-4 text-gray-900">Simulations Complete</h2>
                  <p className="text-gray-600 text-center mb-10 text-lg">You have made irreversible decisions across three high-stakes crisis scenarios.</p>

                  <div className="flex justify-center">
                      <button 
                        onClick={getDebrief}
                        disabled={isAnalyzing}
                        className="flex items-center gap-3 px-8 py-4 bg-[#022c22] text-[#d4af37] rounded-xl font-bold text-lg hover:bg-[#044033] transition-all shadow-xl hover:shadow-2xl disabled:opacity-50"
                      >
                        {isAnalyzing ? <span className="animate-pulse">Analyzing Decision Matrix...</span> : 'Get leadership debrief ↗'}
                      </button>
                  </div>
              </motion.div>
            ) : (
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100"
               >
                 <div className="flex items-center gap-3 font-bold text-[#022c22] mb-6 pb-4 border-b border-gray-100">
                    <BrainCircuit className="w-6 h-6 text-[#d4af37]" /> Executive Leadership Debrief
                 </div>
                 <div className="markdown-body prose prose-slate max-w-none text-gray-700 leading-relaxed">
                   <Markdown>{debrief}</Markdown>
                 </div>
               </motion.div>
            )}
        </div>
      </div>
    );
  }

  const scenario = scenarios[currentStep];
  const Icon = scenario.icon;

  return (
    <div className="flex flex-col h-full bg-white relative min-h-[600px] border-t border-gray-100 rounded-b-3xl">
      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-gray-100 absolute top-0 left-0">
        <div className="h-full bg-[#022c22] transition-all duration-500 ease-in-out" style={{ width: `${((currentStep) / scenarios.length) * 100}%` }}></div>
      </div>

      <div className="p-6 md:p-12 max-w-3xl mx-auto w-full pt-12 md:pt-16">
        
        <motion.div 
          key={scenario.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="text-gray-400 font-bold tracking-widest uppercase text-xs md:text-sm">Crisis Resolution Engine</span>
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
            <span className="text-gray-400 font-bold tracking-widest uppercase text-xs md:text-sm">Scenario {currentStep + 1} of 3</span>
          </div>

          <h2 className="text-2xl md:text-4xl font-bold font-serif text-gray-900 mb-8 leading-tight">{scenario.title}</h2>

          <div className="flex flex-wrap gap-4 mb-8">
            {scenario.metrics.map((m, i) => (
              <div key={i} className="flex-1 min-w-[100px] bg-gray-50 border border-gray-100 rounded-xl p-3 md:p-4 shadow-sm">
                <p className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{m.label}</p>
                <div className="flex items-end gap-2">
                  <span className="text-xl md:text-2xl font-bold text-gray-900">{m.value}%</span>
                  <div className="h-1.5 flex-1 bg-gray-200 rounded-full mb-1 sm:mb-1.5 overflow-hidden">
                    <div className={`h-full ${m.value > 60 ? 'bg-green-500' : m.value > 45 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${m.value}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[#022c22] text-[#e0e7e6] p-6 md:p-8 rounded-2xl mb-8 md:mb-10 shadow-xl border border-[#044033] relative overflow-hidden">
             <Target className="absolute -bottom-6 -right-6 w-32 h-32 md:w-48 md:h-48 text-white/5" />
             <p className="text-base md:text-xl font-medium leading-relaxed relative z-10">{scenario.description}</p>
          </div>

          <div>
             <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm md:text-base">
               <ArrowRight className="w-5 h-5 text-[#d4af37]" /> {scenario.question}
             </h3>
             <div className="space-y-3">
               {scenario.options.map((opt, i) => (
                 <button 
                  key={i}
                  onClick={() => handleSelect(i)}
                  className="w-full text-left p-4 md:p-5 bg-white border-2 border-gray-100 rounded-xl hover:border-[#022c22] hover:bg-gray-50 hover:shadow-md transition-all font-medium text-gray-800 text-sm md:text-base group"
                 >
                   <span className="text-[#d4af37] font-bold mr-3">{String.fromCharCode(65 + i)}.</span>
                   {opt}
                 </button>
               ))}
             </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
