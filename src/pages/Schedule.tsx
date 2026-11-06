import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Calendar as CalendarIcon, Clock, MapPin, Users, Video, Sparkles, ChevronLeft, ChevronRight, Plus, ArrowLeft } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import LabSession from './LabSession';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MOCK_EVENTS = [];


export default function Schedule() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 30)); // March 30, 2026
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const handleAISchedule = async () => {
    setIsGenerating(true);
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Based on a fellow's typical schedule (lectures, mentorship, project work), suggest an optimal time block for "Deep Work & Project Building" next week. Return a short, encouraging 2-sentence suggestion.`
      });
      setAiSuggestion(response.text);
      navigate('/calendar/ai-assistant/deep-work');
    } catch (error) {
      console.error('AI Error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const renderCalendarView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
      {/* Calendar View */}
      <div className="lg:col-span-2 bg-white dark:bg-[#141414] rounded-2xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6 overflow-x-auto">
        <div className="flex items-center justify-between mb-6 min-w-[500px]">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex gap-2">
            <button onClick={prevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <button onClick={nextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 min-w-[500px]">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs sm:text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-2 min-w-[500px]">
          {[...Array(firstDay)].map((_, i) => (
            <div key={`empty-${i}`} className="h-24 rounded-xl border border-transparent" />
          ))}
          {[...Array(daysInMonth)].map((_, i) => {
            const day = i + 1;
            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayEvents = MOCK_EVENTS.filter(e => e.date === dateStr);
            const isToday = day === 30 && currentDate.getMonth() === 2 && currentDate.getFullYear() === 2026;

            return (
              <div 
                key={day} 
                className={`h-24 rounded-xl border p-2 transition-colors hover:border-[#ff4e00]/50 cursor-pointer ${
                  isToday 
                    ? 'border-[#ff4e00] bg-[#ff4e00]/5' 
                    : 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50'
                }`}
                onClick={() => {
                  if (dayEvents.length > 0) {
                    navigate(`/calendar/events/${dayEvents[0].id}`);
                  }
                }}
              >
                <div className={`text-sm font-medium mb-1 ${isToday ? 'text-[#ff4e00]' : 'text-gray-700 dark:text-gray-300'}`}>
                  {day}
                </div>
                <div className="space-y-1">
                  {dayEvents.map(event => (
                    <div key={event.id} className="text-[10px] truncate px-1.5 py-0.5 rounded bg-[#ff4e00]/10 text-[#ff4e00] font-medium">
                      {event.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* AI Assistant */}
        <div className="bg-gradient-to-br from-[#ff4e00]/10 to-purple-600/10 border border-[#ff4e00]/20 rounded-2xl p-4 sm:p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff4e00]/10 rounded-full blur-3xl" />
          
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff4e00] to-[#ff6a00] flex items-center justify-center text-white shadow-lg shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">AI Schedule Assistant</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Optimize your time</p>
            </div>
          </div>

          <div className="relative z-10 space-y-4">
            {aiSuggestion ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-xl p-4 text-xs sm:text-sm text-gray-700 dark:text-gray-300 border border-white/20 dark:border-white/5"
              >
                {aiSuggestion}
              </motion.div>
            ) : (
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                I can analyze your upcoming deadlines and meetings to suggest optimal blocks for deep work.
              </p>
            )}
            
            <button 
              onClick={handleAISchedule}
              disabled={isGenerating}
              className="w-full py-2.5 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium text-xs sm:text-sm border border-gray-200 dark:border-gray-700 hover:border-[#ff4e00] dark:hover:border-[#ff4e00] transition-colors disabled:opacity-50"
            >
              {isGenerating ? 'Analyzing Schedule...' : 'Suggest Deep Work Time'}
            </button>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-sm sm:text-base">Upcoming Events</h3>
          <div className="space-y-4">
            {MOCK_EVENTS.filter(e => new Date(e.date) >= currentDate).slice(0, 3).map(event => (
              <div 
                key={event.id} 
                className="flex gap-3 sm:gap-4 p-2 sm:p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700 cursor-pointer"
                onClick={() => navigate(`/calendar/events/${event.id}`)}
              >
                <div className="flex flex-col items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-[#ff4e00]/10 text-[#ff4e00] shrink-0">
                  <span className="text-[10px] sm:text-xs font-bold uppercase">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                  <span className="text-base sm:text-lg font-black leading-none">{new Date(event.date).getDate()}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm mb-1 truncate">{event.title}</h4>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {event.time.split(' ')[0]}</span>
                    <span className="flex items-center gap-1"><Video className="w-3 h-3" /> Virtual</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button 
            onClick={() => navigate('/calendar/events/upcoming')}
            className="w-full mt-4 py-2 text-sm font-medium text-[#ff4e00] hover:bg-[#ff4e00]/10 rounded-lg transition-colors"
          >
            View All Events
          </button>
        </div>
      </div>
    </div>
  );

  const renderEventDetails = () => {
    const eventId = location.pathname.split('/').pop();
    const event = MOCK_EVENTS.find(e => e.id.toString() === eventId || e.title.toLowerCase().includes(eventId?.replace(/-/g, ' ') || ''));
    
    if (!event) {
      return (
        <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-200 dark:border-gray-800 p-4 sm:p-8 text-center">
          <h2 className="text-lg sm:text-xl font-bold mb-4">Event Not Found</h2>
          <button onClick={() => navigate('/calendar')} className="text-[#ff4e00] hover:underline text-sm sm:text-base">Return to Calendar</button>
        </div>
      );
    }

    return (
      <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-200 dark:border-gray-800 p-4 sm:p-8">
        <button onClick={() => navigate('/calendar')} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white mb-4 sm:mb-6 text-sm sm:text-base">
          <ArrowLeft className="w-4 h-4" /> Back to Calendar
        </button>
        
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6 sm:mb-8">
          <div>
            <div className="inline-block px-2 sm:px-3 py-1 rounded-full bg-[#ff4e00]/10 text-[#ff4e00] text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2 sm:mb-3">
              {event.type}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">{event.title}</h1>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-6 text-gray-600 dark:text-gray-400 text-sm sm:text-base">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>{event.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>{event.location}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full md:w-auto mt-4 sm:mt-0">
            <button className="bg-[#ff4e00] hover:bg-[#ff6a00] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold shadow-lg shadow-[#ff4e00]/20 transition-all text-sm sm:text-base w-full sm:w-auto">
              Join Session
            </button>
            <button className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium transition-all text-sm sm:text-base w-full sm:w-auto">
              Add to Calendar
            </button>
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-800 pt-6 sm:pt-8 mt-6 sm:mt-8">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">Session Details</h3>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl">
            This session will cover the fundamental concepts of leadership in the modern world. We will explore various leadership styles, the impact of digital transformation on leadership, and how to navigate complex global challenges. Please ensure you have completed the pre-reading materials before attending.
          </p>
        </div>
      </div>
    );
  };

  const renderAIAssistant = () => (
    <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-200 dark:border-gray-800 p-4 sm:p-8">
      <button onClick={() => navigate('/calendar')} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white mb-4 sm:mb-6 text-sm sm:text-base">
        <ArrowLeft className="w-4 h-4" /> Back to Calendar
      </button>
      
      <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#ff4e00] to-[#ff6a00] flex items-center justify-center text-white shadow-lg shrink-0">
          <Sparkles className="w-6 h-6 sm:w-8 sm:h-8" />
        </div>
        <div>
          <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white">AI Schedule Assistant</h1>
          <p className="text-xs sm:text-base text-gray-500 dark:text-gray-400">Your personal time management copilot.</p>
        </div>
      </div>
      
      <div className="space-y-4 sm:space-y-6">
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800">
          <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-sm sm:text-base">Deep Work Suggestion</h3>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4">
            {aiSuggestion || "I've analyzed your schedule. You have a 3-hour block open on Thursday afternoon. I recommend dedicating this time to your Capstone Project research."}
          </p>
          <button className="bg-[#1a1a1a] dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-black dark:hover:bg-gray-200 transition-colors w-full sm:w-auto">
            Block this time on my calendar
          </button>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800">
          <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-sm sm:text-base">Schedule Insights</h3>
          <ul className="space-y-3 text-sm sm:text-base text-gray-600 dark:text-gray-400">
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#ff4e00] mt-2 shrink-0" />
              <span>You have 12 hours of lectures this week. Consider scheduling at least 6 hours of independent study to review the material.</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#ff4e00] mt-2 shrink-0" />
              <span>Your attendance rate is 100%. Keep up the great work!</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#ff4e00] mt-2 shrink-0" />
              <span>You have a group simulation on Friday. I suggest reviewing the simulation brief by Wednesday.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 dark:text-white">Smart Calendar</h1>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1 sm:mt-2">Manage your fellowship schedule and get AI-powered time management insights.</p>
        </div>
        <button 
          onClick={() => navigate('/calendar/events/new')}
          className="bg-[#ff4e00] hover:bg-[#ff6a00] text-white px-4 py-2 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors w-full sm:w-auto text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" /> New Event
        </button>
      </div>

      <Routes>
        <Route path="/" element={renderCalendarView()} />
        <Route path="/events/upcoming" element={renderCalendarView()} />
        <Route path="/events/:eventId" element={renderEventDetails()} />
        <Route path="/ai-assistant/*" element={renderAIAssistant()} />
        <Route path="/lab/:labId" element={<LabSession />} />
      </Routes>
    </div>
  );
}
