import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Send, X, Sparkles, User, Globe, ChevronRight, ShieldCheck, Award } from 'lucide-react';
import { generateGeminiContent } from '../lib/gemini';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function DiplomaticAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Welcome to Golden Minds Africa. I am your Diplomatic AI Advisor. How may I assist you with our Pan-African governance programs, research briefs, leadership summits, or partnership opportunities today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const replyText = await generateGeminiContent({
        contents: `You are the official Diplomatic AI Advisor for Golden Minds Africa (GMA), a premier Pan-African governance, leadership, research, and policy roundtable organization headquartered in South Africa with operational presence across 54 African nations.
GMA Key Pillars: Leadership Development, Innovation & Tech, Governance Research, Quality Education & Fellowships, Youth Capital Investment, Continental Partnerships.
Founder & President: Lusimanadio Soki Simao.
Core Alignments: AU Agenda 2063, UN SDGs, African Youth Charter, African Governance Architecture (AGA).
Answer the user's inquiry with professional, diplomatic, inspiring, and concise authority. Keep formatting clean with bullet points when appropriate.

User Inquiry: "${userMsg}"`
      });

      setMessages(prev => [...prev, { role: 'assistant', content: replyText || "Thank you for reaching out to Golden Minds Africa. Our diplomatic team is dedicated to supporting youth leadership across all 54 African nations." }]);
    } catch (err) {
      console.error("AI Assistant error:", err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Golden Minds Africa AI Advisor is currently updating credentials. For urgent policy inquiries, please contact our secretariat at info@goldenmindsroundtable.co.za or call +27 67 617 1261."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-[90vw] sm:w-[420px] h-[580px] glass-card-gold rounded-3xl shadow-2xl flex flex-col overflow-hidden mb-4 border border-white/20"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-[#0A0A0A] via-[#13294B] to-[#0A0A0A] border-b border-white/10 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#B8860B] flex items-center justify-center text-black font-bold shadow-lg shadow-[#D4AF37]/20">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base flex items-center gap-2 text-[#D4AF37]">
                    Diplomatic Advisor AI
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </h3>
                  <p className="text-xs text-gray-300 font-sans">Golden Minds Africa Portal</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-gray-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Badges */}
            <div className="px-4 py-2 bg-black/40 border-b border-white/5 flex gap-2 overflow-x-auto text-[11px] text-gray-300 font-medium">
              <span className="px-2.5 py-1 bg-[#D4AF37]/15 text-[#D4AF37] rounded-full shrink-0 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> AU Agenda 2063
              </span>
              <span className="px-2.5 py-1 bg-emerald-500/15 text-emerald-400 rounded-full shrink-0 flex items-center gap-1">
                <Award className="w-3 h-3" /> 2026 Fellowships
              </span>
              <span className="px-2.5 py-1 bg-navy-500/15 text-blue-300 rounded-full shrink-0 flex items-center gap-1">
                <Globe className="w-3 h-3" /> 54 Nations
              </span>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gradient-to-b from-[#08080A] to-[#0A0A0E] text-sm">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-xl bg-[#D4AF37]/20 border border-white/20 flex items-center justify-center shrink-0 text-[#D4AF37] mt-1">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] rounded-2xl p-3.5 leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black font-medium shadow-md'
                        : 'bg-white/5 border border-white/10 text-gray-200'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-7 h-7 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 text-white mt-1">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-3 text-gray-400 text-xs py-2">
                  <div className="w-7 h-7 rounded-xl bg-[#D4AF37]/20 border border-white/20 flex items-center justify-center shrink-0 text-[#D4AF37]">
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  </div>
                  <span className="italic">Analyzing diplomatic archive & policy briefs...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="p-3 bg-black/80 border-t border-white/10 flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about governance, research, or fellowships..."
                className="flex-1 bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/40 transition-colors"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black font-bold disabled:opacity-40 hover:scale-105 active:scale-95 transition-all shadow-md shadow-[#D4AF37]/20"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-5 py-3.5 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#B8860B] text-black font-semibold text-sm shadow-2xl shadow-[#D4AF37]/40 border border-[#FFFFFF]/40 group"
      >
        <div className="w-7 h-7 rounded-full bg-black/20 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-black group-hover:rotate-12 transition-transform" />
        </div>
        <span className="font-serif tracking-wide text-black font-bold">Diplomatic AI</span>
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping" />
      </motion.button>
    </div>
  );
}
