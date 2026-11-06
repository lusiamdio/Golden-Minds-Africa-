import React from 'react';
import { motion } from 'motion/react';
import { Award, Star, Trophy, Target, Zap, Shield, Crown, Medal, TrendingUp, Sparkles, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';

const BADGES = [
  { 
    id: 'attendance', 
    name: 'Dedicated Scholar', 
    description: 'Maintain a 5+ days attendance streak', 
    icon: Star, 
    condition: (p: any) => (p?.attendanceStreak || 0) >= 5, 
    bg: 'bg-amber-50', 
    border: 'border-amber-200', 
    color: 'text-amber-600' 
  },
  { 
    id: 'participation', 
    name: 'Vibrant Voice', 
    description: 'Reach 100+ Fellowship XP', 
    icon: Trophy, 
    condition: (p: any) => (p?.participationScore || 0) >= 100, 
    bg: 'bg-emerald-50', 
    border: 'border-emerald-200', 
    color: 'text-emerald-600' 
  },
  { 
    id: 'elite', 
    name: 'GMA Visionary', 
    description: 'Reach Level 5+ on GMA Platform', 
    icon: Crown, 
    condition: (p: any) => (Math.floor((p?.participationScore || 0) / 50) + 1) >= 5, 
    bg: 'bg-purple-50', 
    border: 'border-purple-200', 
    color: 'text-purple-600' 
  },
];

export default function Achievements() {
  const { profile } = useAuth();

  const score = profile?.participationScore || 0;
  const level = Math.floor(score / 50) + 1;
  const nextLevelScore = level * 50;
  const progress = (score % 50) / 50 * 100;

  const generatePDFReport = () => {
    try {
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });

      // GMA Premium Brand Color Palette
      const brandDarkGreen = [2, 44, 34]; // rgb(2,44,34)
      const brandAmberGold = [212, 175, 55]; // rgb(212,175,55)

      // Header Block
      doc.setFillColor(brandDarkGreen[0], brandDarkGreen[1], brandDarkGreen[2]);
      doc.rect(0, 0, 210, 48, 'F');

      // Title & Subtitle text elements
      doc.setTextColor(255, 255, 255);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(20);
      doc.text('GOLDEN MINDS AFRICA FELLOWSHIP', 15, 18);
      
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10.5);
      doc.setTextColor(brandAmberGold[0], brandAmberGold[1], brandAmberGold[2]);
      doc.text('OFFICIAL FELLOWSHIP ACHIEVEMENTS & MILESTONES TRANSCRIPT', 15, 26);
      doc.setTextColor(215, 215, 215);
      doc.text(`Issued On: ${new Date().toLocaleDateString()} • Verified Record of Leadership`, 15, 33);

      // Gold line separator band
      doc.setFillColor(brandAmberGold[0], brandAmberGold[1], brandAmberGold[2]);
      doc.rect(0, 41, 210, 2, 'F');

      // Personal Profile Information section
      doc.setTextColor(45, 45, 45);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(16);
      doc.text(`${profile?.name || 'Fellow Member'}`, 15, 60);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10.5);
      doc.setTextColor(110, 110, 110);
      doc.text(`Current Leadership Rank: Level ${level} Fellow`, 15, 66);
      doc.text(`Total Lifetime Participation XP Score: ${score} points`, 15, 72);
      doc.text(`Consecutive Lecture Attendance Streak: ${profile?.attendanceStreak || 0} days`, 15, 78);

      // Separator line
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.5);
      doc.line(15, 84, 195, 84);

      // Achievements summary text block
      doc.setTextColor(brandDarkGreen[0], brandDarkGreen[1], brandDarkGreen[2]);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(12.5);
      doc.text('Performance Summary & Standing', 15, 93);

      doc.setTextColor(70, 70, 70);
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`This document certifies that ${profile?.name || 'the fellow'} is in good academic standing.`, 15, 100);
      doc.text(`They have climbed to Level ${level} following an active participation rating in GMA Seminars and Dev-labs.`, 15, 105);

      // Badges Section
      doc.setTextColor(brandDarkGreen[0], brandDarkGreen[1], brandDarkGreen[2]);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(12.5);
      doc.text('Earned Badges & Unlocked Honors', 15, 120);
      doc.line(15, 123, 195, 123);

      let verticalOffset = 131;
      const earnedBadges = BADGES.filter(b => b.condition(profile));

      if (earnedBadges.length === 0) {
        doc.setFont('Helvetica', 'oblique');
        doc.setTextColor(120, 120, 120);
        doc.text('No certified badges unlocked yet. Keep up the active participation to unlock honors!', 15, verticalOffset);
      } else {
        earnedBadges.forEach((badge, index) => {
          doc.setFont('Helvetica', 'bold');
          doc.setTextColor(50, 50, 50);
          doc.setFontSize(11);
          doc.text(`${index + 1}. ${badge.name}`, 15, verticalOffset);

          doc.setFont('Helvetica', 'normal');
          doc.setTextColor(100, 100, 100);
          doc.setFontSize(9.5);
          doc.text(badge.description, 18, verticalOffset + 5.5);
          verticalOffset += 15;
        });
      }

      // GMA Trust seal logo simulation
      doc.setFillColor(248, 248, 245);
      doc.rect(0, 274, 210, 23, 'F');
      doc.setTextColor(110, 110, 110);
      doc.setFontSize(8);
      doc.text('Academic Achievements Board - Golden Minds Africa', 15, 282);
      doc.text('Validation Code: GMA-RANK-VERIFIED-2026', 15, 287);
      doc.text('Page 1 of 1', 185, 284);

      doc.save(`${profile?.name || 'Fellow'}_GMA_Achievements_Milestones.pdf`);
      toast.success('Branded Achievements & Milestones PDF generated and downloaded!');
    } catch (pdfErr) {
      console.error('jsPDF generation failed:', pdfErr);
      toast.error('Could not compile achievements PDF report.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif mb-2">Fellowship Achievements</h1>
          <p className="text-sm sm:text-base text-gray-600">Track your progress, earn badges, and climb the leaderboard.</p>
        </div>
        <button
          onClick={generatePDFReport}
          className="flex items-center justify-center gap-2 bg-[#d4af37] text-[#022c22] px-6 py-3 rounded-full shadow-md hover:bg-[#b8972e] font-bold text-sm transition-colors cursor-pointer self-start sm:self-auto"
        >
          <FileText className="w-5 h-5" />
          Download Achievements PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Left Column: Level & Stats */}
        <div className="lg:col-span-1 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 bg-[#ff4e00] opacity-20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-[#ff4e00] to-[#ff8c00] rounded-full flex items-center justify-center mb-4 shadow-lg shadow-[#ff4e00]/30 border-4 border-white/10">
                <span className="text-3xl sm:text-4xl font-bold font-serif">{level}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mb-1">Level {level} Fellow</h2>
              <p className="text-gray-400 text-xs sm:text-sm mb-6">Keep participating to level up!</p>

              <div className="w-full bg-white/10 rounded-full h-2 sm:h-3 mb-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-[#ff4e00] to-[#ff8c00] h-full rounded-full transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="w-full flex justify-between text-[10px] sm:text-xs text-gray-400 font-medium mb-6">
                <span>{score} XP</span>
                <span>{nextLevelScore} XP</span>
              </div>

              <button 
                onClick={() => window.location.href = '/certifications/certificate/leadership-foundations'}
                className="w-full py-2 sm:py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm sm:text-base font-bold transition-colors flex items-center justify-center gap-2"
              >
                <Award className="w-4 h-4 sm:w-5 sm:h-5" /> View Certificate
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100"
          >
            <h3 className="font-bold font-serif text-base sm:text-lg mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-[#5A5A40]" />
              Impact Stats
            </h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="text-sm sm:text-base text-gray-600 font-medium">Total Score</span>
                <span className="font-bold text-base sm:text-lg">{score}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="text-sm sm:text-base text-gray-600 font-medium">Attendance Streak</span>
                <span className="font-bold text-base sm:text-lg">{profile?.attendanceStreak || 0} days</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="text-sm sm:text-base text-gray-600 font-medium">Global Rank</span>
                <span className="font-bold text-base sm:text-lg text-[#ff4e00]">Top 15%</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Badges */}
        <div className="lg:col-span-2">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 h-full"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold font-serif flex items-center gap-2 sm:gap-3">
                <Medal className="w-5 h-5 sm:w-6 sm:h-6 text-[#ff4e00]" />
                Badges & Honors
              </h2>
              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs sm:text-sm font-bold self-start sm:self-auto">
                {BADGES.filter(b => b.condition(profile)).length} / {BADGES.length} Unlocked
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {BADGES.map((badge, index) => {
                const isEarned = badge.condition(profile);
                return (
                  <motion.div 
                    key={badge.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 * index }}
                    className={`relative overflow-hidden rounded-2xl p-4 sm:p-6 flex flex-col items-center text-center border-2 transition-all ${
                      isEarned 
                        ? `${badge.bg} ${badge.border} shadow-sm` 
                        : 'bg-gray-50 border-gray-100 opacity-60 grayscale'
                    }`}
                  >
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-3 sm:mb-4 ${isEarned ? 'bg-white shadow-sm' : 'bg-gray-200'}`}>
                      <badge.icon className={`w-6 h-6 sm:w-8 sm:h-8 ${isEarned ? badge.color : 'text-gray-400'}`} />
                    </div>
                    <h3 className={`font-bold text-sm sm:text-base mb-1 ${isEarned ? 'text-gray-900' : 'text-gray-500'}`}>{badge.name}</h3>
                    <p className="text-[10px] sm:text-xs text-gray-500 font-medium">{badge.description}</p>
                    
                    {!isEarned && (
                      <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex items-center justify-center">
                        <div className="bg-gray-900 text-white text-[8px] sm:text-[10px] uppercase tracking-wider font-bold px-2 sm:px-3 py-1 rounded-full">
                          Locked
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
