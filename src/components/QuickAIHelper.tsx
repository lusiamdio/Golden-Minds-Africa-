import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { generateGeminiContent } from '../lib/gemini';

export default function QuickAIHelper() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: 'user'|'ai', content: string}[]>([
    { role: 'ai', content: 'Hi! I am your quick assistant. Ask me anything about the fellowship.' }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setIsTyping(true);

    try {
      const text = await generateGeminiContent({
        contents: `You are a helpful, concise assistant for the Golden Minds Africa Fellowship. Keep answers under 3 sentences. 
        You have knowledge of the following course materials:
        
        Module 1: Evolution of Leadership
        - Leadership vs Authority vs Influence: Leadership is earned, inspiring people toward a shared vision. Authority is granted by title. Influence is shaping outcomes without formal power.
        - Ethical Frameworks: Values-Based, Servant Leadership, Transformational, Authentic, and Stakeholder-Centric.
        - Self-Assessment: Key dimensions are EQ, Decision-Making, Communication, Adaptability, Integrity. Core philosophy involves core values and leadership style.
        
        Module 2: What is Governance?
        - Governance refers to systems and processes for decision-making (Authority, Legitimacy, Accountability, Performance).
        - Types: Democracy (legitimacy/participation, but slow), Autocracy (fast decisions, but risk of abuse), Hybrid Regimes.
        - Institutions: Legislature, Executive, Judiciary, Independent Institutions (electoral commissions).
        
        Module 3: Political Ideologies & Public Power
        - Ideologies: Liberalism (individual freedom/markets), Socialism (collective ownership/welfare), Capitalism (private ownership/profit), African Governance (Ubuntu/consensus).
        - Power Structures: Legitimacy requires Traditional, Charismatic, and Legal-Rational sources. Power without legitimacy leads to instability.
        - Actors: The State (regulation), The Market (efficiency), Civil Society (grassroots/accountability).

        Module 4: Public Service & Ethics
        - Public Servants: Responsible for policy implementation, service delivery, advisory role, and oversight. Must be professional, neutral, and accountable.
        - Ethics & Corruption: Ethics relies on integrity, transparency, fairness. Corruption (bribery, fraud, nepotism) is the abuse of public power for private gain. 
        - Success vs Failure: Case studies show that transparency and strong accountability are key to success. State capture highlights the dangers of weak accountability.

        Module 5: Fundamentals of Geopolitics
        - Geopolitics examines how geography shapes power, strategy, and relations. Heartland Theory emphasizes central land masses. 
        - Power forms: Hard (military/coercion), Soft (culture/diplomacy), Economic (trade/resources), Technological (AI/cyber).
        - Regional Blocs: Africa (Resources/Demographics via AU/AfCFTA), EU (Regulation/markets), BRICS (Global rebalancing). Africa is shifting from resource base to strategic power center.
        - Positioning Strategy: Africa must shift from resource exporter to value chain owner, and from fragmented markets to a unified bloc. Key equation: Resources + Demographics + Integration + Governance = Global Influence.

        Module 6: Global Institutions & Diplomacy
        - Architecture of Global Governance: UN (Peace/norms), AU (Regional integration), IMF (Financial stability), World Bank (Development financing).
        - Diplomacy Theory: Bilateral vs Multilateral. Focus on interests, not just stated positions. BATNA (Best Alternative to a Negotiated Agreement). Aim for Win-Win (integrative) over Zero-Sum.
        - UN-Style Diplomatic Simulation (Global Resource & Climate Accord 2035): A multilateral negotiation over climate financing, critical minerals (Africa-centered), and debt. Involves power asymmetries, coalition-building, and managing crises (supply chain, political, financial).

        Module 7: Policy Formulation & Analysis
        - The Policy Cycle: Agenda, Formulation, Implementation, Evaluation. Must be evidence-based.
        - Policy Brief Template (McKinsey/Bloomberg style): Problem, Scale, Root Cause, Policy Landscape, Options (2-3), Recommendation, Implementation Roadmap, Finances, Risks, M&E. Executive summary focuses on Problem, Importance, Recommendation, Impact.
        - Casebook Topics: Energy Transition, Fintech Inclusion, Governance/Anti-Corruption, Youth Unemployment, Urbanization.
        
        Module 8: Economics for Public Leaders
        - Macro Indicators: GDP, Inflation, Unemployment, Fiscal Balance, Exchange Rate.
        - Growth Equation: Y = C + I + G + (X - M). Policy levers: Fiscal, Monetary, Structural.
        - Decision Framework: Evaluate choices via Impact, Efficiency, Political Feasibility, Sustainability. Trade-offs between growth, debt, welfare.

        Module 9: Strategic Political Communication & Narrative Control
        - Speaking as Power: Influence, shaping narratives, directing action.
        - The 4 Pillars: Clarity, Consistency, Credibility, Emotional Resonance.
        - Strategic Message Formula: Problem -> Impact -> Solution -> Call to Action.
        - Political Messaging: Framing, Soundbites, Bridging Technique, Message Discipline.
        - Media Handling: Control the Narrative, Stay calm, Never say 'No Comment', Body language (eye contact, posture, tone).
        - Advanced Influence: The Rule of Three, Contrast Framing, Authority Positioning, Silence as Power.
        - Real African Political Case Studies: Mandela, Ramaphosa, Malema, Bobi Wine, Kagame.
        
        Module 10: Digital Governance & AI in Public Systems
        - The New Power Structure: Code is power. State <-> Technology <-> Citizens.
        - Opportunities: Efficient services, data-driven policy, reduced corruption.
        - Risks: Algorithmic bias, lack of transparency, over-centralization, surveillance vs freedom (Accountability, Transparency, Consent, Limits).
        - Innovations: Digital Identity, Blockchain, E-Gov, Open Data.
        - Designing digital governance solutions (Problem definition, solution design, concept, impact evaluation).

        Module 11: Crisis Leadership & Decision-Making
        - Leading in Uncertainty: Clarity over certainty, speed over perfection, presence over panic, adaptability.
        - Risk Management Framework: Identify, Assess, Mitigate, Monitor, Adapt.
        - Crisis Decision Models: The OODA Loop (Observe, Orient, Decide, Act), The 40/70 Rule (Colin Powell), Red Teaming.
        - Crisis Communication: Be first, be transparent, be human, be consistent. 
        - Messaging Framework: What happened, what it means, what we're doing, what you should do.
        
        Module 12: The African Leadership Communication Lab (ALCL)
        - Press Conference Simulations (e.g., AI Data Breach). Handling hostile journalists.
        - Parliamentary Debate Simulations (e.g., Nationwide AI surveillance). Pro vs. Against.
        - Media Interview Drills (e.g., Corruption allegations). Acknowledge, Clarify, Pivot, Reinforce.
        - Message Crafting & Leadership Presence (Voice, body language, soundbites).
        - National Crisis Day.

        Module 13: Capstone Policy Lab & Leadership Summit
        - From Ideas to Implementation.
        - Deliverable A: Policy Proposal (Problem Definition, Policy Solution, Evidence, Expected Impact).
        - Deliverable B: Governance Strategy (Institutional Design, Accountability, Stakeholder Mgt, Risk Mgt).
        - Deliverable C: Leadership Implementation Plan (Vision, 12-24 Month Roadmap, Comms Strategy, KPIs).
        - Summit Format: 7-10 min presentation, 5-10 min Defense Q&A against Expert Panel (Feasibility, Funding, Political Risk, Scalability, Ethics).
        - Scoring: Problem clarity, Policy innovation, Feasibility, Governance strength, Leadership clarity, Communication & delivery, Q&A performance, Overall impact.

        User asks: ${userMsg}`
      });
      
      setMessages(prev => [...prev, { role: 'ai', content: text || 'Sorry, I could not process that.' }]);
    } catch (error) {
      console.error("Error with quick AI:", error);
      setMessages(prev => [...prev, { role: 'ai', content: 'Error connecting to AI.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#ff4e00] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-105 transition-transform z-40"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-80 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-50 flex flex-col h-96"
          >
            <div className="bg-[#1a1a1a] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="font-bold text-sm">Quick Assistant</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f5f5f0]/50">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                    msg.role === 'user' ? 'bg-[#ff4e00] text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-bl-none shadow-sm">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask a quick question..."
                className="flex-1 bg-[#f5f5f0] border-transparent focus:border-[#ff4e00] focus:ring-0 rounded-xl px-3 py-2 text-sm transition-colors"
                disabled={isTyping}
              />
              <button 
                onClick={handleSend}
                disabled={isTyping || !input.trim()}
                className="bg-[#1a1a1a] text-white p-2 rounded-xl hover:bg-black transition-colors disabled:opacity-50 flex items-center justify-center shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
