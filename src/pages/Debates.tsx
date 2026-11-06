import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Send, Bot, User, ShieldAlert, Trophy, Loader2 } from 'lucide-react';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface Message {
  id: string;
  role: 'user' | 'moderator';
  content: string;
  team?: 'A' | 'B';
  score?: number;
}

import { Routes, Route } from 'react-router-dom';

function DebatesMain() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [team, setTeam] = useState<'A' | 'B'>('A');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      team
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const history = messages.map(m => `${m.role === 'moderator' ? 'Moderator' : `Team ${m.team}`}: ${m.content}`).join('\n');
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are the AI Moderator of a debate. The topic is: 'Strongman vs. Democracy: Does economic growth justify limited political freedoms? (Rwanda vs. Nigeria/Ghana)'
        
        Here is the debate history:
        ${history}
        
        Team ${team} just argued: "${userMessage.content}"
        
        Evaluate this argument based on three criteria:
        1. Argument Strength (logic, evidence, reasoning)
        2. Clarity of Presentation (structure, articulation)
        3. Adherence to Topic (relevance to the core debate)

        Provide 2-3 specific points of critique covering these areas. Then, assign a nuanced score out of 10 for this specific argument, considering all three criteria. Format your response exactly like this:
        Critique:
        • [Point 1]
        • [Point 2]
        Score: [Number]/10`,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
        }
      });

      const text = response.text || '';
      const scoreMatch = text.match(/Score:\s*(\d+)\/10/);
      const score = scoreMatch ? parseInt(scoreMatch[1], 10) : undefined;

      const modMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'moderator',
        content: text,
        score
      };

      setMessages(prev => [...prev, modMessage]);
    } catch (error) {
      console.error("Error generating moderator response:", error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'moderator',
        content: "I'm sorry, I encountered an error evaluating that argument. Please try again."
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const teamAScore = messages.filter(m => m.role === 'moderator' && m.score && messages[messages.indexOf(m)-1]?.team === 'A').reduce((acc, m) => acc + (m.score || 0), 0);
  const teamBScore = messages.filter(m => m.role === 'moderator' && m.score && messages[messages.indexOf(m)-1]?.team === 'B').reduce((acc, m) => acc + (m.score || 0), 0);

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-6rem)] sm:h-[calc(100vh-8rem)] flex flex-col p-4 md:p-8">
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-serif mb-1 sm:mb-2">Debate Engine</h1>
          <p className="text-gray-600 text-xs sm:text-sm md:text-base">Live AI-moderated debate room.</p>
        </div>
        <div className="flex gap-2 sm:gap-4 w-full sm:w-auto">
          <div className="bg-white px-3 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center flex-1 sm:flex-none">
            <span className="text-[10px] sm:text-xs uppercase tracking-wider font-bold text-gray-400 mb-0.5 sm:mb-1">Team A</span>
            <span className="text-lg sm:text-xl md:text-2xl font-bold text-[#ff4e00]">{teamAScore}</span>
          </div>
          <div className="bg-white px-3 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center flex-1 sm:flex-none">
            <span className="text-[10px] sm:text-xs uppercase tracking-wider font-bold text-gray-400 mb-0.5 sm:mb-1">Team B</span>
            <span className="text-lg sm:text-xl md:text-2xl font-bold text-[#5A5A40]">{teamBScore}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 flex flex-col overflow-hidden min-h-[400px]">
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 bg-[#f5f5f0]/50">
          {messages.map((msg) => (
            <motion.div 
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2 sm:gap-3 md:gap-4 ${msg.role === 'user' ? (msg.team === 'A' ? 'flex-row-reverse' : 'flex-row-reverse') : ''}`}
            >
              <div className={`w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === 'moderator' ? 'bg-[#1a1a1a] text-white' : 
                msg.team === 'A' ? 'bg-[#ff4e00] text-white' : 'bg-[#5A5A40] text-white'
              }`}>
                {msg.role === 'moderator' ? <ShieldAlert className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" /> : <User className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />}
              </div>
              
              <div className={`max-w-[85%] sm:max-w-[80%] ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`flex items-center gap-1 sm:gap-2 mb-1 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'moderator' ? (
                    <span className="text-[8px] sm:text-[10px] md:text-xs font-bold uppercase tracking-wider text-gray-500">AI Moderator</span>
                  ) : (
                    <span className="text-[8px] sm:text-[10px] md:text-xs font-bold uppercase tracking-wider text-gray-500">Team {msg.team}</span>
                  )}
                </div>
                <div className={`p-2 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm md:text-base ${
                  msg.role === 'moderator' ? 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm' : 
                  msg.team === 'A' ? 'bg-[#ff4e00] text-white rounded-tr-none shadow-md' : 'bg-[#5A5A40] text-white rounded-tr-none shadow-md'
                }`}>
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {msg.role === 'moderator' ? msg.content.replace(/Score:\s*\d+\/10/, '').trim() : msg.content}
                  </p>
                  {msg.score !== undefined && (
                    <div className="mt-2 sm:mt-3 inline-flex items-center gap-1 sm:gap-2 bg-gray-50 text-gray-900 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs md:text-sm font-bold border border-gray-200">
                      <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />
                      Score Awarded: {msg.score}/10
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <div className="flex gap-2 sm:gap-3 md:gap-4">
              <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center shrink-0">
                <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 animate-spin" />
              </div>
              <div className="bg-white border border-gray-200 p-2 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1 sm:gap-2 text-gray-500">
                <span className="text-[10px] sm:text-xs md:text-sm font-medium">Moderator is evaluating...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 sm:p-4 bg-white border-t border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
            <span className="text-xs sm:text-sm font-bold text-gray-500 uppercase tracking-wider">Arguing as:</span>
            <div className="flex bg-gray-100 rounded-lg p-1 w-full sm:w-auto">
              <button 
                onClick={() => setTeam('A')}
                className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md text-xs sm:text-sm font-bold transition-colors ${team === 'A' ? 'bg-white shadow-sm text-[#ff4e00]' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Team A
              </button>
              <button 
                onClick={() => setTeam('B')}
                className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md text-xs sm:text-sm font-bold transition-colors ${team === 'B' ? 'bg-white shadow-sm text-[#5A5A40]' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Team B
              </button>
            </div>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={`Enter your argument for Team ${team}...`}
              className="flex-1 bg-[#f5f5f0] border-transparent focus:border-[#ff4e00] focus:ring-0 rounded-xl px-3 sm:px-4 py-2 sm:py-3 transition-colors text-sm sm:text-base"
              disabled={isTyping}
            />
            <button 
              onClick={handleSend}
              disabled={isTyping || !input.trim()}
              className="bg-[#1a1a1a] text-white p-2 sm:p-3 rounded-xl hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shrink-0"
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Debates() {
  return (
    <Routes>
      <Route path="/" element={<DebatesMain />} />
      <Route path="article/:id" element={<DebatesMain />} />
      <Route path="debate/:id" element={<DebatesMain />} />
    </Routes>
  );
}
