import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';
import { Calendar, Clock, MapPin, Sparkles, TrendingUp, Award, Loader2, Trophy, Medal, Star, MessageCircle, BookOpen, Upload, CheckCircle, Smile, Send, RefreshCw, BrainCircuit } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from '../lib/supabase';
import { GoogleGenAI } from '@google/genai';
import { generateGeminiContent } from '../lib/gemini';
import { toast } from 'sonner';
import Markdown from 'react-markdown';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Cell } from 'recharts';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function Dashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [nextSession, setNextSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [nearbyHubs, setNearbyHubs] = useState('');
  const [findingHubs, setFindingHubs] = useState(false);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  // Trailing 30 days engagement heatmap data
  const [engagementData, setEngagementData] = useState<any[]>([]);
  const [selectedHeatmapDay, setSelectedHeatmapDay] = useState<any>(null);

  const generateTrailing30DaysData = () => {
    const data = [];
    const stored = localStorage.getItem('gma_study_sessions');
    let sessionsMap: { [key: string]: number } = {};
    if (stored) {
      try {
        sessionsMap = JSON.parse(stored);
      } catch (e) {
        console.error(e);
      }
    } else {
      // Generate some initial random/mock engagement
      const today = new Date();
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const dateString = d.toISOString().split('T')[0];
        // mock random active days
        if (i % 3 === 0) {
          sessionsMap[dateString] = Math.floor(Math.random() * 45) + 15;
        } else if (i % 7 === 1) {
          sessionsMap[dateString] = Math.floor(Math.random() * 20) + 5;
        } else {
          sessionsMap[dateString] = 0;
        }
      }
      localStorage.setItem('gma_study_sessions', JSON.stringify(sessionsMap));
    }

    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateString = d.toISOString().split('T')[0];
      const minutes = sessionsMap[dateString] || 0;
      data.push({
        dateString,
        dayLabel: d.toLocaleDateString([], { day: 'numeric', month: 'short' }),
        minutes,
      });
    }
    return data;
  };

  useEffect(() => {
    const data = generateTrailing30DaysData();
    setEngagementData(data);
    if (data.length > 0) {
      setSelectedHeatmapDay(data[data.length - 1]); // default to today
    }
  }, []);

  const handleLogStudyTime = (minutes: number) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const stored = localStorage.getItem('gma_study_sessions');
    let sessionsMap: { [key: string]: number } = {};
    if (stored) {
      try {
        sessionsMap = JSON.parse(stored);
      } catch {}
    }
    sessionsMap[todayStr] = (sessionsMap[todayStr] || 0) + minutes;
    localStorage.setItem('gma_study_sessions', JSON.stringify(sessionsMap));
    
    // Re-generate chart data
    setEngagementData(generateTrailing30DaysData());
    toast.success(`Logged ${minutes} minutes of active learning! Dashboard heatmap updated.`);
  };

  // Daily recap state
  const [dailyRecap, setDailyRecap] = useState<string | null>(null);
  const [recapLoading, setRecapLoading] = useState(false);

  // Daily Check-in state
  const [checkInText, setCheckInText] = useState('');
  const [checkInEmoji, setCheckInEmoji] = useState('🌟');
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [checkInGreeting, setCheckInGreeting] = useState('');
  const EMOJI_OPTIONS = ['🌟', '🔥', '💡', '🚀', '🧠', '❤️'];

  const fetchDailyRecap = async () => {
    setRecapLoading(true);
    try {
      const greetingName = profile?.name?.split(' ')[0] || 'Fellow';
      const prompt = `
You are the Golden Minds Africa AI system. Synthesize a warm, encouraging, short morning recap for the user "${greetingName}".
The recap MUST summarize:
- Upcoming Tasks & Schedule: Attend Peer Mentorship circle with Advisor Marie Uwase at 4:00 PM today.
- Pending Assignments: "Module 3: Leadership Philosophy Blueprint Submission" (Due tomorrow at 11:59 PM). "Cohort Debate Feedback Form" (due in 3 days).
- New Ecosystem Highlights: Fellow Samuel Chike uploaded an Agritech East Africa Soil Science publication, and administrators verified 4 cyberdefense certifications.

Style guidelines: Give a cheerful personalized morning saludo. List the actionable task and pending assignments with bullet-points, and outline ecosystem updates in a brief sentence. Keep the layout clean, beautifully structured in Markdown format. Keep the entire response under 150 words.
      `.trim();

      let recapText = '';
      if (process.env.GEMINI_API_KEY) {
        try {
          recapText = await generateGeminiContent({
            contents: prompt
          });
        } catch (callErr) {
          console.warn("AI daily recap generation notice:", callErr);
        }
      }

      setDailyRecap(recapText || `Good morning, ${greetingName}! 🌟 Today's Focus:\n\n* **Peer Mentorship Circle**: Join Advisor Marie Uwase at 4:00 PM.\n* **Pending Assignment**: Module 3 Leadership Philosophy Blueprint (Due tomorrow at 11:59 PM).\n* **Ecosystem Highlight**: Fellow Samuel Chike published a new East Africa Agritech policy brief.`);
    } catch (err: any) {
      console.warn("Notice in fetchDailyRecap:", err);
      const greetingName = profile?.name?.split(' ')[0] || 'Fellow';
      setDailyRecap(`Good morning, ${greetingName}! 🌟\n\n* **Upcoming Schedule**: Peer Mentorship session with Advisor Marie Uwase at 4:00 PM today.\n* **Pending Task**: Submit Module 3: Leadership Philosophy Blueprint (due tomorrow at 11:59 PM).\n* **Cohort Progress**: 4 cyberdefense policy papers verified today.`);
    } finally {
      setRecapLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    const fetchDashboardData = async () => {
      try {
        const timeoutPromise = new Promise<{ data: any[], error: any }>(res => 
          setTimeout(() => res({ data: [], error: new Error('timeout') }), 1500)
        );

        // Fetch Next Session with timeout safety
        const sessionPromise = supabase
          .from('debates')
          .select('*')
          .gte('scheduled_for', new Date().toISOString())
          .order('scheduled_for', { ascending: true })
          .limit(1);

        const { data: sessionData } = await Promise.race([sessionPromise, timeoutPromise]);
          
        if (active && sessionData && sessionData.length > 0) {
          setNextSession({ 
            id: sessionData[0].id, 
            title: sessionData[0].topic,
            date: sessionData[0].scheduled_for,
            startTime: new Date(sessionData[0].scheduled_for).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            endTime: "TBD",
            type: "debate"
          });
        }
        
        // Fetch Leaderboard with timeout safety
        const leaderboardPromise = supabase
          .from('profiles')
          .select('*')
          .order('participationScore', { ascending: false, nullsFirst: false })
          .limit(5);
          
        const { data: leaderboardData } = await Promise.race([leaderboardPromise, timeoutPromise]);
          
        if (active && leaderboardData && leaderboardData.length > 0) {
          setLeaderboard(leaderboardData);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchDashboardData();
    fetchDailyRecap();

    return () => {
      active = false;
    };
  }, [profile?.id]);

  const earnedBadges = [
    { id: 'pioneer', name: 'Pioneer', description: 'Joined the platform', icon: Sparkles, color: 'text-purple-600', bg: 'bg-purple-50', earned: true },
    { id: 'attendance', name: 'Consistent', description: '3+ day streak', icon: Calendar, color: 'text-green-600', bg: 'bg-green-50', earned: (profile?.attendanceStreak || 0) >= 3 },
    { id: 'debater', name: 'Top Debater', description: 'Score > 50', icon: MessageCircle, color: 'text-[#ff4e00]', bg: 'bg-orange-50', earned: (profile?.participationScore || 0) >= 50 },
    { id: 'contributor', name: 'Contributor', description: 'Score > 20', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50', earned: (profile?.participationScore || 0) >= 20 },
  ].filter(b => b.earned);

  const findNearbyHubs = async () => {
    setFindingHubs(true);
    try {
      if (!navigator.geolocation) throw new Error("Geolocation not supported");
      
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: "Find good cafes, libraries, or co-working spaces nearby where I can study for my fellowship.",
          config: {
            tools: [{ googleMaps: {} }],
            toolConfig: {
              retrievalConfig: {
                latLng: { latitude, longitude }
              }
            }
          }
        });
        
        setNearbyHubs(response.text || "No hubs found nearby.");
        setFindingHubs(false);
      }, () => {
        setNearbyHubs("Please enable location services to find nearby study hubs.");
        setFindingHubs(false);
      });
    } catch (error) {
      console.error("Error finding hubs:", error);
      setNearbyHubs("Failed to find nearby hubs.");
      setFindingHubs(false);
    }
  };

  const handleCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkInText.trim()) return;
    setHasCheckedIn(true);
    setCheckInGreeting(`Thanks for checking in, ${profile?.name?.split(' ')[0] || 'Fellow'}! Stay focused on your goal: "${checkInText}" ${checkInEmoji}`);
    toast.success("Daily check-in completed!");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 
            className="text-3xl md:text-4xl font-bold font-serif mb-2 cursor-pointer hover:underline"
            onClick={() => navigate('/')}
          >
            Welcome back, {profile?.name?.split(' ')[0]}
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">Here's your fellowship overview for today.</p>
        </div>
        <div 
          className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors w-max"
          onClick={() => navigate('/achievements')}
        >
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs sm:text-sm font-medium">Fellowship Active</span>
        </div>
      </div>

      {/* Daily Check-in */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-6 justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[#ff4e00] font-medium uppercase tracking-wider text-sm">
            <Smile className="w-5 h-5" />
            <span>Daily Check-in</span>
          </div>
          {hasCheckedIn ? (
            <p className="text-gray-800 font-serif text-lg">{checkInGreeting}</p>
          ) : (
            <p className="text-gray-600 font-serif text-lg">How are you feeling today? Set your daily intention.</p>
          )}
        </div>
        {!hasCheckedIn && (
          <form onSubmit={handleCheckIn} className="flex-1 w-full max-w-md flex flex-col sm:flex-row gap-3">
            <div className="flex bg-gray-50 rounded-xl p-1 gap-1 border border-gray-100">
              {EMOJI_OPTIONS.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setCheckInEmoji(emoji)}
                  className={`w-10 h-10 flex items-center justify-center text-lg rounded-lg transition-transform ${checkInEmoji === emoji ? 'bg-white shadow-sm scale-110' : 'hover:bg-gray-100'}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <div className="flex flex-1 relative">
              <input
                type="text"
                placeholder="What's your main goal today?"
                value={checkInText}
                onChange={(e) => setCheckInText(e.target.value)}
                className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-[#ff4e00] focus:ring-1 focus:ring-[#ff4e00] text-sm"
              />
              <button 
                type="submit"
                disabled={!checkInText.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#ff4e00] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#ff4e00]/10 rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Gemini Powered Daily Recap Card */}
      <div 
        id="daily-recap-section" 
        className="bg-gradient-to-br from-emerald-50 to-[#cca568]/15 dark:from-[#011a14] dark:to-zinc-900 border border-emerald-100 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden transition-all duration-300"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#cca568]/15 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2.5 text-amber-700 dark:text-amber-400 font-bold text-xs uppercase tracking-wider">
              <BrainCircuit className="w-5 h-5 text-amber-700 dark:text-amber-400 animate-pulse" />
              <span>Personalized Daily AI Recap</span>
            </div>
            
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-gray-905 dark:text-white leading-tight">
              A quick look at your day
            </h2>

            {recapLoading ? (
              <div className="py-6 flex items-center gap-3 text-gray-500 dark:text-gray-400 text-sm">
                <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                <span className="font-medium">Gemini is synthesizing upcoming tasks, assignments, and fellowship network data...</span>
              </div>
            ) : dailyRecap ? (
              <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 text-sm leading-relaxed space-y-2 mt-2 font-normal">
                <Markdown>{dailyRecap}</Markdown>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm italic">
                Set a main goal above and tap "Refresh Recap" to compose your day.
              </p>
            )}
          </div>

          <button 
            type="button"
            disabled={recapLoading}
            onClick={fetchDailyRecap}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-750 rounded-xl text-xs font-semibold shadow-sm border border-gray-150 dark:border-zinc-700 transition-all disabled:opacity-50 cursor-pointer w-max self-start md:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${recapLoading ? 'animate-spin text-amber-500' : ''}`} />
            <span>Generate Recap</span>
          </button>
        </div>
      </div>

      {/* Quick Actions (shadcn/ui) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="rounded-2xl shadow-md border-gray-100 cursor-pointer hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300" onClick={() => navigate('/calendar')}>
          <CardContent className="p-4 sm:p-6 flex flex-col items-center gap-3">
            <Calendar size={28} className="text-[#ff4e00] sm:w-8 sm:h-8" />
            <h2 className="text-lg sm:text-xl font-semibold text-center">View Schedule</h2>
            <Button onClick={(e) => { e.stopPropagation(); navigate('/calendar'); }} className="bg-[#1a1a1a] hover:bg-black w-full rounded-xl text-sm sm:text-base">Open</Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-md border-gray-100 cursor-pointer hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300" onClick={() => navigate('/assignments')}>
          <CardContent className="p-4 sm:p-6 flex flex-col items-center gap-3">
            <Upload size={28} className="text-[#5A5A40] sm:w-8 sm:h-8" />
            <h2 className="text-lg sm:text-xl font-semibold text-center">Submit Assignment</h2>
            <Button onClick={(e) => { e.stopPropagation(); navigate('/assignments'); }} className="bg-[#1a1a1a] hover:bg-black w-full rounded-xl text-sm sm:text-base">Upload</Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-md border-gray-100 cursor-pointer hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 sm:col-span-2 lg:col-span-1" onClick={() => navigate('/attendance')}>
          <CardContent className="p-4 sm:p-6 flex flex-col items-center gap-3">
            <CheckCircle size={28} className="text-green-600 sm:w-8 sm:h-8" />
            <h2 className="text-lg sm:text-xl font-semibold text-center">Mark Attendance</h2>
            <Button onClick={(e) => { e.stopPropagation(); navigate('/attendance'); }} className="bg-[#1a1a1a] hover:bg-black w-full rounded-xl text-sm sm:text-base">Check In</Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Next Session Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#1a1a1a] text-white rounded-3xl p-5 sm:p-6 md:p-8 shadow-xl relative overflow-hidden cursor-pointer hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 group"
            onClick={() => navigate('/calendar/events/w1a-leadership-modern-world-theory')}
          >
            <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-gradient-to-br from-[#ff4e00]/20 to-transparent rounded-full blur-3xl -mr-16 -mt-16 sm:-mr-20 sm:-mt-20 group-hover:from-[#ff4e00]/30 transition-colors" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-[#ff8c00] font-medium mb-3 sm:mb-4 text-xs sm:text-sm uppercase tracking-wider">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Up Next</span>
              </div>
              
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-serif mb-3 sm:mb-4">
                {nextSession?.title || "No Upcoming Sessions"}
              </h2>
              
              <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-6 text-gray-300 text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                  <span>{nextSession ? `${nextSession?.startTime || 'TBD'} - ${nextSession?.endTime || 'TBD'}` : 'TBD'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                  <span className="capitalize">{nextSession?.type ? `${nextSession.type} Room` : 'TBD'}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* AI Insights & Maps Grounding */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl p-5 sm:p-6 md:p-8 shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer"
              onClick={() => navigate('/knowledge')}
            >
              <div 
                className="flex items-center gap-2 mb-4 sm:mb-6 transition-opacity"
              >
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#ff4e00]" />
                <h3 className="text-lg sm:text-xl font-bold font-serif">AI Leadership Copilot</h3>
              </div>
              <div className="bg-[#f5f5f0] rounded-2xl p-4 sm:p-5 md:p-6 border border-gray-200">
                <p className="text-gray-700 leading-relaxed text-xs sm:text-sm mb-4">
                  Based on your recent participation in the "Policy & Tech" debate, you showed strong analytical skills. Consider reviewing the upcoming material on <span className="text-[#ff4e00] font-bold cursor-pointer hover:underline" onClick={() => navigate('/learning-hub')}>"Digital Infrastructure"</span> to prepare for tomorrow's session.
                </p>
                <div className="pt-4 border-t border-gray-200">
                  <p 
                    className="text-[10px] sm:text-xs text-gray-500 uppercase font-bold tracking-wider mb-2 cursor-pointer hover:text-[#ff4e00] transition-colors"
                    onClick={() => navigate('/achievements')}
                  >
                    AI Future Pathway Predictor
                  </p>
                  <p className="text-xs sm:text-sm font-medium text-[#5A5A40]">
                    "Based on your engagement in policy debates and research contributions, you are well suited for governance and public leadership roles."
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-3xl p-5 sm:p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col"
            >
              <div 
                className="flex items-center gap-2 mb-4 sm:mb-6 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => navigate('/rooms')}
              >
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[#5A5A40]" />
                <h3 className="text-lg sm:text-xl font-bold font-serif">Study Hubs</h3>
              </div>
              
              <div className="flex-1 bg-[#f5f5f0] rounded-2xl p-4 sm:p-5 md:p-6 border border-gray-200 overflow-y-auto min-h-[150px]">
                {findingHubs ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin mb-2" />
                    <span className="text-xs sm:text-sm">Locating hubs...</span>
                  </div>
                ) : nearbyHubs ? (
                  <div className="prose prose-sm max-w-none text-gray-700 text-xs sm:text-sm">
                    <div dangerouslySetInnerHTML={{ __html: nearbyHubs.replace(/\n/g, '<br/>') }} />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <p className="text-xs sm:text-sm text-gray-500 mb-4">Find nearby cafes or co-working spaces to study.</p>
                    <button 
                      onClick={(e) => { e.stopPropagation(); findNearbyHubs(); }}
                      className="px-4 py-2 bg-[#1a1a1a] text-white rounded-xl text-xs sm:text-sm font-medium hover:bg-black transition-colors"
                    >
                      Find Nearby
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Personal Impact Dashboard */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-5 sm:p-6 md:p-8 shadow-sm border border-gray-100"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 sm:mb-6">
              <div 
                className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => navigate('/achievements')}
              >
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-[#ff4e00]" />
                <h3 className="text-lg sm:text-xl font-bold font-serif">Intelligent Dashboard System</h3>
              </div>
              <button 
                className="text-xs sm:text-sm text-[#ff4e00] font-bold hover:underline self-start sm:self-auto"
                onClick={() => navigate('/achievements')}
              >
                View Full Report
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div 
                className="bg-gray-50 p-3 sm:p-4 rounded-2xl border border-gray-100 text-center cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => navigate('/achievements')}
              >
                <p className="text-[10px] sm:text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Leadership Index</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 font-serif">92</p>
              </div>
              <div 
                className="bg-gray-50 p-3 sm:p-4 rounded-2xl border border-gray-100 text-center cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => navigate('/achievements')}
              >
                <p className="text-[10px] sm:text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Policy Score</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 font-serif">88</p>
              </div>
              <div 
                className="bg-gray-50 p-3 sm:p-4 rounded-2xl border border-gray-100 text-center cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => navigate('/achievements')}
              >
                <p className="text-[10px] sm:text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Geopolitical IQ</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 font-serif">95</p>
              </div>
              <div 
                className="bg-gray-50 p-3 sm:p-4 rounded-2xl border border-gray-100 text-center cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => navigate('/achievements')}
              >
                <p className="text-[10px] sm:text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Governance Stability</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 font-serif">85%</p>
              </div>
            </div>

            <div 
              className="bg-blue-50 rounded-2xl p-3 sm:p-4 border border-blue-100 flex items-start gap-2 sm:gap-3 cursor-pointer hover:bg-blue-100 transition-colors"
              onClick={() => navigate('/knowledge')}
            >
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs sm:text-sm font-bold text-blue-900 mb-1">AI Sovereign Advisor Insight</p>
                <p className="text-xs sm:text-sm text-blue-800">"<span className="cursor-pointer hover:underline font-bold" onClick={(e) => { e.stopPropagation(); navigate('/achievements'); }}>Your crisis response speed is in the top 10%.</span> To improve your Policy Score, focus on integrating more quantitative evidence in your next brief."</p>
              </div>
            </div>
          </motion.div>

          {/* Active Learning & Study Heatmap */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            className="bg-white rounded-3xl p-5 sm:p-6 md:p-8 shadow-sm border border-gray-100"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 sm:mb-6">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-[#ff4e00]" />
                <h3 className="text-lg sm:text-xl font-bold font-serif">Fellow Engagement Heatmap</h3>
              </div>
              <div className="flex bg-gray-100 dark:bg-zinc-850 p-1 rounded-xl text-xs font-bold gap-1">
                <span className="text-[#ff4e00] bg-white dark:bg-zinc-900 px-3 py-1 rounded-lg shadow-sm">Past 30 Days</span>
              </div>
            </div>

            <p className="text-gray-500 text-xs sm:text-sm mb-6">
              Visualizing active engagement, module progress, video watch minutes, and quiz accuracy. Shaded blocks signify intensive academic output.
            </p>

            {/* Heatmap Grid */}
            <div className="mb-6 bg-gray-50 dark:bg-zinc-900/50 p-4 sm:p-6 rounded-2xl border border-gray-100 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-3 text-xs text-gray-500 font-bold uppercase tracking-wider">
                <span>Monthly Engagement Board</span>
                <span>Active Days: {engagementData.filter(d => d.minutes > 0).length} / 30</span>
              </div>

              {/* Grid Board */}
              <div className="flex flex-wrap gap-[6px] justify-center sm:justify-start">
                {engagementData.map((day, idx) => {
                  // Determine heat shade based on minutes
                  let bgClass = "bg-gray-200 dark:bg-zinc-850";
                  if (day.minutes > 0 && day.minutes <= 15) bgClass = "bg-[#ffebe5]";
                  else if (day.minutes > 15 && day.minutes <= 30) bgClass = "bg-[#ffbb99]";
                  else if (day.minutes > 30 && day.minutes <= 45) bgClass = "bg-[#ff884d]";
                  else if (day.minutes > 45) bgClass = "bg-[#ff4e00]";

                  const isSelected = selectedHeatmapDay?.dateString === day.dateString;

                  return (
                    <div
                      key={day.dateString}
                      onClick={() => setSelectedHeatmapDay(day)}
                      className={`w-8 h-8 rounded-lg cursor-pointer transition-all hover:scale-110 relative shrink-0 ${bgClass} ${isSelected ? 'ring-2 ring-black dark:ring-white scale-105' : ''}`}
                      title={`${day.dayLabel}: ${day.minutes} mins studied`}
                    >
                      <div className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-black/40">
                        {idx + 1}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Legend & Hover detail */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-4 border-t border-gray-200/55 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <span>Less</span>
                  <div className="w-3 h-3 rounded bg-gray-200 dark:bg-zinc-850" />
                  <div className="w-3 h-3 rounded bg-[#ffebe5]" />
                  <div className="w-3 h-3 rounded bg-[#ffbb99]" />
                  <div className="w-3 h-3 rounded bg-[#ff884d]" />
                  <div className="w-3 h-3 rounded bg-[#ff4e00]" />
                  <span>More</span>
                </div>

                <div className="bg-[#5a5a40]/10 text-[#5a5a40] font-semibold px-3 py-1.5 rounded-xl border border-[#5a5a40]/15 text-center min-w-[200px]">
                  {selectedHeatmapDay ? (
                    <span>{selectedHeatmapDay.dayLabel}: <strong>{selectedHeatmapDay.minutes} minutes</strong> active</span>
                  ) : (
                    <span>Tap on any square to read details</span>
                  )}
                </div>
              </div>
            </div>

            {/* Recharts BarChart Visualization */}
            <div className="mb-6 bg-white border border-gray-100 rounded-2xl p-4 h-64">
              <div className="text-xs uppercase font-bold tracking-widest text-[#5a5a40] mb-4">Minutes Studied Over Time</div>
              
              <div className="w-full h-48 select-none">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={engagementData}>
                    <XAxis dataKey="dayLabel" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <YAxis label={{ value: 'Mins', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: '#888' } }} tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                    <RechartsTooltip 
                      contentStyle={{ background: '#1a1a1a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }} 
                      labelStyle={{ fontWeight: 'bold' }}
                    />
                    <Bar dataKey="minutes" radius={[4, 4, 0, 0]}>
                      {engagementData.map((entry, index) => {
                        let barColor = "#e5e7eb";
                        if (entry.minutes > 0 && entry.minutes <= 15) barColor = "#ffebe5";
                        else if (entry.minutes > 15 && entry.minutes <= 30) barColor = "#ffbb99";
                        else if (entry.minutes > 30 && entry.minutes <= 45) barColor = "#ff884d";
                        else if (entry.minutes > 45) barColor = "#ff4e00";
                        return <Cell key={`cell-${index}`} fill={barColor} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Log study time simulations */}
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <span className="text-xs font-bold uppercase text-gray-500 tracking-wider block mb-3">Sync Study & Academic Sessions</span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleLogStudyTime(15)}
                  className="px-4 py-2 bg-white text-gray-800 hover:bg-gray-100 border border-gray-200 text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-1"
                >
                  ⏱️ +15m Lecture Stream
                </button>
                <button
                  onClick={() => handleLogStudyTime(30)}
                  className="px-4 py-2 bg-white text-gray-800 hover:bg-gray-100 border border-gray-200 text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-1"
                >
                  📚 +30m Syllabus Reading
                </button>
                <button
                  onClick={() => handleLogStudyTime(60)}
                  className="px-4 py-2 bg-[#ff4e00]/10 text-[#ff4e00] hover:bg-[#ff4e00] hover:text-white border border-[#ff4e00]/25 text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-1"
                >
                  🔥 +1h Active Quiz & Debate
                </button>
              </div>
            </div>
          </motion.div>

          {/* Leaderboard Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-5 sm:p-6 md:p-8 shadow-sm border border-gray-100"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 sm:mb-6">
              <div 
                className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => navigate('/mentorship')}
              >
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
                <h3 className="text-lg sm:text-xl font-bold font-serif">Top Fellows</h3>
              </div>
              <span 
                className="text-xs sm:text-sm text-gray-500 font-medium cursor-pointer hover:text-gray-900 hover:underline transition-colors self-start sm:self-auto"
                onClick={() => navigate('/mentorship')}
              >
                Global Leaderboard
              </span>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              {leaderboard.map((user, index) => (
                <motion.div 
                  layout 
                  initial={{ opacity: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  transition={{ duration: 0.3 }} 
                  key={user.id} 
                  className="flex items-center justify-between p-3 sm:p-4 bg-[#f5f5f0] rounded-2xl border border-gray-200 transition-colors hover:bg-white cursor-pointer hover:shadow-sm"
                  onClick={() => navigate(`/mentorship`)}
                >
                  <div className="flex items-center gap-2 sm:gap-4">
                    <div className={`w-6 h-6 sm:w-8 sm:h-8 shrink-0 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm ${
                      index === 0 ? 'bg-yellow-100 text-yellow-700' :
                      index === 1 ? 'bg-gray-200 text-gray-700' :
                      index === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-white text-gray-500 border border-gray-200'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 shrink-0 rounded-full bg-gray-200 overflow-hidden">
                        {user.photoURL ? (
                          <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[#1a1a1a] text-white font-medium text-xs sm:text-base">
                            {user.name?.charAt(0) || 'F'}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 truncate text-sm sm:text-base">{user.name}</p>
                        <p className="text-[10px] sm:text-xs text-gray-500 capitalize">{user.role || 'Fellow'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 shrink-0 ml-2">
                    <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-bold text-sm sm:text-lg">{user.participationScore || 0}</span>
                  </div>
                </motion.div>
              ))}
              {leaderboard.length === 0 && !loading && (
                <p className="text-center text-gray-500 py-4 text-sm">No data available yet.</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Sidebar - Right Column */}
        <div className="space-y-4 sm:space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-50 text-[#ff4e00] rounded-full flex items-center justify-center mb-2 sm:mb-3">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span className="text-2xl sm:text-3xl font-bold mb-1">{profile?.participationScore || 0}</span>
              <span className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider font-medium">Score</span>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-2 sm:mb-3">
                <Award className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span className="text-2xl sm:text-3xl font-bold mb-1">{profile?.attendanceStreak || 0}</span>
              <span className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider font-medium">Streak</span>
            </motion.div>
          </div>

          {/* My Badges */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 
                className="font-bold cursor-pointer hover:underline text-sm sm:text-base"
                onClick={() => navigate('/achievements')}
              >
                My Badges
              </h3>
              <span className="text-[10px] sm:text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                {earnedBadges.length} Earned
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {earnedBadges.map(badge => (
                <div 
                  key={badge.id} 
                  className={`${badge.bg} rounded-2xl p-3 sm:p-4 flex flex-col items-center text-center border border-white/50 shadow-sm cursor-pointer hover:shadow-md transition-shadow`}
                  onClick={() => navigate(`/achievements`)}
                >
                  <badge.icon className={`w-6 h-6 sm:w-8 sm:h-8 ${badge.color} mb-1 sm:mb-2`} />
                  <span className="text-xs sm:text-sm font-bold text-gray-900 leading-tight mb-1">{badge.name}</span>
                  <span className="text-[8px] sm:text-[10px] text-gray-500 uppercase tracking-wider">{badge.description}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Previews based on user request */}
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            <Card className="rounded-2xl shadow-sm border-gray-100">
              <CardContent className="p-5 sm:p-6">
                <h2 
                  className="text-base sm:text-lg font-bold mb-3 sm:mb-4 cursor-pointer hover:underline"
                  onClick={() => navigate('/calendar')}
                >
                  Your Schedule
                </h2>
                <div className="space-y-2 sm:space-y-3">
                  <div 
                    className="p-2 sm:p-3 border border-gray-100 bg-gray-50 rounded-xl text-xs sm:text-sm font-medium cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => navigate('/calendar/events/w1a-leadership-modern-world-theory')}
                  >
                    W1A: Leadership in the Modern World - 14:00 GMT
                  </div>
                  <div 
                    className="p-2 sm:p-3 border border-gray-100 bg-gray-50 rounded-xl text-xs sm:text-sm font-medium cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => navigate('/calendar/events/w1b-leadership-modern-world-practice')}
                  >
                    W1B: Leadership Practice - 14:00 GMT
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4 sm:space-y-6">
              <Card className="rounded-2xl shadow-sm border-gray-100 h-full">
                <CardContent className="p-5 sm:p-6">
                  <h2 
                    className="text-base sm:text-lg font-bold mb-3 sm:mb-4 cursor-pointer hover:underline"
                    onClick={() => navigate('/assignments')}
                  >
                    Assignment List
                  </h2>
                  <div className="flex flex-col gap-2 sm:gap-3">
                    <input type="file" className="border border-gray-200 bg-gray-50 p-2 text-xs sm:text-sm rounded-lg w-full" />
                    <Button 
                      className="bg-[#1a1a1a] hover:bg-black w-full rounded-xl text-sm sm:text-base"
                      onClick={() => navigate('/assignments')}
                    >
                      Submit Assignment
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-sm border-gray-100 sm:hidden lg:block">
                <CardContent className="p-5 sm:p-6">
                  <h2 
                    className="text-base sm:text-lg font-bold mb-3 sm:mb-4 cursor-pointer hover:underline"
                    onClick={() => navigate('/attendance')}
                  >
                    Attendance Overview
                  </h2>
                  <div className="flex flex-col gap-2 sm:gap-3">
                    <Button 
                      className="bg-[#1a1a1a] hover:bg-black w-full rounded-xl text-sm sm:text-base"
                      onClick={() => navigate('/attendance')}
                    >
                      Check In Now
                    </Button>
                    <p 
                      className="text-xs sm:text-sm text-gray-500 font-medium text-center cursor-pointer hover:text-gray-900 hover:underline transition-colors"
                      onClick={() => navigate('/attendance')}
                    >
                      Attendance Rate: 85%
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <Card className="rounded-2xl shadow-sm border-gray-100 hidden sm:block lg:hidden">
            <CardContent className="p-5 sm:p-6">
              <h2 
                className="text-base sm:text-lg font-bold mb-3 sm:mb-4 cursor-pointer hover:underline"
                onClick={() => navigate('/attendance')}
              >
                Attendance Overview
              </h2>
              <div className="flex flex-col gap-2 sm:gap-3">
                <Button 
                  className="bg-[#1a1a1a] hover:bg-black w-full rounded-xl text-sm sm:text-base"
                  onClick={() => navigate('/attendance')}
                >
                  Check In Now
                </Button>
                <p 
                  className="text-xs sm:text-sm text-gray-500 font-medium text-center cursor-pointer hover:text-gray-900 hover:underline transition-colors"
                  onClick={() => navigate('/attendance')}
                >
                  Attendance Rate: 85%
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
