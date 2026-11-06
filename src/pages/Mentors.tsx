import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Users, Sparkles, Calendar, MessageSquare, Star, ArrowRight, ShieldCheck } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { useAuth } from '../contexts/AuthContext';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MOCK_MENTORS = [];


function MentorsMain() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [isMatching, setIsMatching] = useState(false);
  const [matchResult, setMatchResult] = useState('');

  const handleAIMatch = async () => {
    navigate('/mentorship/match');
    setIsMatching(true);
    try {
      const prompt = `Act as an AI mentor matching engine for an African leadership fellowship. 
      The fellow's name is ${profile?.name || 'a fellow'} and they are interested in Policy and Tech.
      Based on the available mentors (Dr. Amina Yusuf - Public Policy & Tech, Kwame Osei - Entrepreneurship, Sarah Ndlovu - Economics), 
      recommend the best mentor for them and explain why in 2 short sentences.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      setMatchResult(response.text || 'Match generation failed.');
    } catch (error) {
      console.error('Error generating match:', error);
      setMatchResult('Unable to connect to AI Assistant.');
    } finally {
      setIsMatching(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 pb-12 p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold font-serif mb-2 text-[#022c22] cursor-pointer hover:underline" onClick={() => navigate('/mentorship')}>AI Mentor Matching</h1>
          <p className="text-gray-600 text-sm sm:text-base">Connect with industry leaders and alumni based on your career goals.</p>
        </div>
        <button 
          onClick={handleAIMatch}
          disabled={isMatching}
          className="flex items-center justify-center gap-2 bg-[#d4af37] text-white px-6 py-3 rounded-full shadow-lg hover:bg-yellow-500 transition-colors disabled:opacity-70 font-bold w-full md:w-auto text-sm sm:text-base"
        >
          {isMatching ? <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" /> : <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />}
          Find My Perfect Match
        </button>
      </div>

      {matchResult && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-[#022c22] to-[#064e3b] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4af37] opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-[#d4af37] font-bold mb-3 sm:mb-4 uppercase tracking-wider text-xs sm:text-sm">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" /> AI Match Recommendation
            </div>
            <div className="prose prose-invert max-w-none text-base sm:text-lg leading-relaxed font-medium">
              <div dangerouslySetInnerHTML={{ __html: matchResult.replace(/\n/g, '<br/>') }} />
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {MOCK_MENTORS.map((mentor, i) => (
          <motion.div
            key={mentor.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate(`/mentorship/mentor/${mentor.slug}`)}
          >
            <div className="relative mb-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 border-gray-50 shadow-sm">
                <img src={mentor.avatar} alt={mentor.name} className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-green-100 text-green-700 text-[10px] sm:text-xs font-bold px-2 py-1 rounded-full border-2 border-white flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> {mentor.match}%
              </div>
            </div>
            
            <h3 className="font-bold font-serif text-lg sm:text-xl mb-1 text-gray-900">{mentor.name}</h3>
            <p className="text-xs sm:text-sm text-[#d4af37] font-bold mb-2">{mentor.role}</p>
            <p className="text-[10px] sm:text-xs text-gray-500 font-medium bg-gray-50 px-3 py-1 rounded-full mb-4 sm:mb-6">{mentor.industry}</p>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full mt-auto">
              <button 
                className="flex-1 flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors"
                onClick={(e) => { e.stopPropagation(); navigate(`/mentorship/chat/${mentor.id}`); }}
              >
                <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" /> Message
              </button>
              <button 
                className="flex-1 flex items-center justify-center gap-2 bg-[#022c22] hover:bg-[#064e3b] text-white py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors"
                onClick={(e) => { e.stopPropagation(); navigate(`/mentorship/schedule/${mentor.id}`); }}
              >
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4" /> Schedule
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function Mentors() {
  return (
    <Routes>
      <Route path="/" element={<MentorsMain />} />
      <Route path="match" element={<MentorsMain />} />
      <Route path="mentor/:slug" element={<MentorsMain />} />
      <Route path="chat/:mentorId" element={<MentorsMain />} />
      <Route path="schedule/:mentorId" element={<MentorsMain />} />
    </Routes>
  );
}
