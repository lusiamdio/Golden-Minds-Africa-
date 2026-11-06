import React from 'react';
import { ArrowLeft, CalendarPlus, Sparkles } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

export default function LabSession() {
  const navigate = useNavigate();
  const { labId } = useParams();

  const googleCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=W1B:+Leadership+in+the+Modern+World+(Practice)&dates=20260402T140000Z/20260402T170000Z&details=Golden+Minds+Africa+Fellowship+Lab+Session&location=Hybrid`;

  return (
    <div className="bg-gray-50 dark:bg-[#0a0a0a] -m-4 sm:-m-8 p-4 sm:p-8 min-h-screen">
      {/* Back Navigation */}
      <div className="mb-4 sm:mb-6">
        <button 
          onClick={() => navigate('/calendar')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors font-medium text-sm sm:text-base"
        >
          <ArrowLeft size={16} />
          Back to Calendar
        </button>
      </div>

      {/* Main Card */}
      <div className="max-w-4xl mx-auto bg-white dark:bg-[#141414] shadow-xl rounded-2xl p-4 sm:p-8 border border-gray-200 dark:border-gray-800">

        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <span className="text-xs sm:text-sm font-bold tracking-wider text-[#ff4e00] uppercase">Lab Session</span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold mt-1 sm:mt-2 text-gray-900 dark:text-white">
            W1B: Leadership in the Modern World (Practice)
          </h1>
        </div>

        {/* Session Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8 p-4 sm:p-6 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800">
          <div>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">Date</p>
            <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">Thursday, April 2, 2026</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">Time</p>
            <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">14:00 – 17:00 GMT</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">Format</p>
            <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">Hybrid (Online + Physical)</p>
          </div>
        </div>

        {/* Description */}
        <div className="mb-6 sm:mb-10">
          <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-gray-900 dark:text-white">Session Overview</h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
            This lab session focuses on applying modern leadership frameworks in real-world scenarios.
            Participants will engage in interactive simulations, collaborative problem-solving,
            and strategic decision-making exercises designed to build adaptive leadership skills.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-10">
          <button className="w-full sm:w-auto bg-[#ff4e00] hover:bg-[#ff6a00] text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl font-bold shadow-lg shadow-[#ff4e00]/20 transition-all text-sm sm:text-base">
            Join Session
          </button>

          <a href={googleCalendarUrl} target="_blank" rel="noreferrer" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 hover:border-[#ff4e00] dark:hover:border-[#ff4e00] text-gray-900 dark:text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all text-sm sm:text-base">
              <CalendarPlus size={18} className="w-4 h-4 sm:w-5 sm:h-5" />
              Add to Google Calendar
            </button>
          </a>
        </div>

        {/* AI Insights Panel */}
        <div className="p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm sm:text-base font-bold text-blue-900 dark:text-blue-300">AI Time Insight</h3>
          </div>
          <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200/80 leading-relaxed">
            You have 2 high-focus sessions today. Consider scheduling a 30-minute break before this lab 
            to optimize performance and engagement.
          </p>
        </div>

      </div>
    </div>
  );
}
