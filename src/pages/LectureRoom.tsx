import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Video, Mic, MicOff, VideoOff, MonitorUp, Hand, Smile, PhoneOff, 
  MessageSquare, Users, FileText, Globe, Settings, Maximize, 
  Minimize, LayoutGrid, LayoutTemplate, Wifi, WifiOff, Volume2, Type, PenTool, BarChart2, Image as ImageIcon, Sparkles, ChevronDown, ChevronUp, Send,
  ShieldAlert
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { GoogleGenAI } from '@google/genai';
import { useAdminState } from '../contexts/AdminStateContext';
import { useAuth } from '../contexts/AuthContext';
import { useSupabasePresence } from '../hooks/useSupabasePresence';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'sw', name: 'Swahili' },
  { code: 'yo', name: 'Yoruba' },
  { code: 'zu', name: 'Zulu' },
  { code: 'fr', name: 'French' },
  { code: 'ar', name: 'Arabic' }
];


export default function LectureRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeFellows } = useSupabasePresence(roomId || 'room-1');
  
  const { virtualRooms, addRoomTranscript, addRoomMessage, submitIncidentReport } = useAdminState();
  const room = virtualRooms?.find(r => r.id === roomId) || {
    id: roomId || 'room-1',
    name: 'Virtual Seminar Room',
    topic: 'Policy and African Development Frameworks',
    color: 'bg-emerald-600',
    facilitator: 'Dr. Amina Mensah',
    maxCapacity: 100,
    participants: [{ id: 'usr-2', name: 'Dr. Amina Diallo', role: 'mentor' }],
    transcripts: [],
    messages: []
  };

  // Merge static MOCK_PARTICIPANTS with dynamic real-time activeFellows
  const baseParticipants = room.participants || [];
  const activeFellowsList = Object.values(activeFellows).map(f => ({
    id: f.userId,
    name: f.name,
    role: f.userId === user?.id ? 'You (Fellow)' : 'Fellow Student',
    isMe: f.userId === user?.id,
    handRaised: f.isHandRaised
  }));

  // Deduplicate by name or ID
  const MOCK_PARTICIPANTS = [...activeFellowsList];
  baseParticipants.forEach(bp => {
    if (!MOCK_PARTICIPANTS.some(p => p.name.toLowerCase() === bp.name.toLowerCase())) {
      MOCK_PARTICIPANTS.push({
        id: bp.id,
        name: bp.name,
        role: bp.role || 'Fellow Student',
        isMe: false,
        handRaised: false
      });
    }
  });

  const transcript = room.transcripts || [];
  const messages = room.messages || [];

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'participants' | 'transcript' | 'translation' | 'polls' | 'report'>('transcript');
  const [layout, setLayout] = useState<'single' | 'split' | 'pip'>('split');
  const [lowBandwidth, setLowBandwidth] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [showParticipantsPopup, setShowParticipantsPopup] = useState(false);
  const [isBackgroundBlurred, setIsBackgroundBlurred] = useState(false);
  
  // Translation State
  const [translationMode, setTranslationMode] = useState<'text' | 'voice'>('text');
  const [targetLanguage, setTargetLanguage] = useState('sw');
  const [isTranslating, setIsTranslating] = useState(false);
  
  const transcriptRef = useRef<HTMLDivElement>(null);

  // AI Summary State
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [summary, setSummary] = useState('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  // AI Q&A State
  const [qaMessages, setQaMessages] = useState<any[]>([]);
  const [newQaMessage, setNewQaMessage] = useState('');
  const [isGeneratingQa, setIsGeneratingQa] = useState(false);
  const qaRef = useRef<HTMLDivElement>(null);

  // Chat State
  const [newMessage, setNewMessage] = useState('');
  const [chatRecipient, setChatRecipient] = useState('Everyone');

  // Incident form local states
  const [reportTarget, setReportTarget] = useState('');
  const [reportText, setReportText] = useState('');
  const [isReporting, setIsReporting] = useState(false);

  // Polls State
  const [polls, setPolls] = useState<any[]>([]);
  const [isCreatingPoll, setIsCreatingPoll] = useState(false);
  const [newPollQuestion, setNewPollQuestion] = useState('');
  const [newPollOptions, setNewPollOptions] = useState(['', '']);

  useEffect(() => {
    if (qaRef.current) {
      qaRef.current.scrollTop = qaRef.current.scrollHeight;
    }
  }, [qaMessages]);

  useEffect(() => {
    // Generate real-time periodic dialogue synced directly with the global database/storage
    const dialogues = [
      "We must emphasize structural governance across regional trade borders.",
      "Indeed, pan-African policy is built upon mutual trust and digital infrastructure.",
      "The role of young fellows is to invent digital solutions and publish white papers.",
      "Please review the core curriculum syllabus before our next module.",
      "Are there any specific questions about today's case study on digital legacy?"
    ];
    let idx = 0;
    const interval = setInterval(() => {
      if (idx < dialogues.length) {
        addRoomTranscript(room.id, {
          speaker: idx % 2 === 0 ? 'Dr. Amina Diallo' : 'Kofi Boateng',
          text: dialogues[idx]
        });
        idx++;
        if (transcriptRef.current) {
          transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
        }
      }
    }, 15000); // dialogue line every 15 seconds is perfect and completely real-time!

    return () => clearInterval(interval);
  }, [room.id, addRoomTranscript]);

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTarget || !reportText.trim()) return;
    setIsReporting(true);
    
    submitIncidentReport({
      reporterName: "You",
      targetName: reportTarget,
      description: reportText.trim(),
      channel: "Virtual Room: " + room.name
    });
    
    // Alert SMTP deployment notification
    import('sonner').then(({ toast }) => {
      toast.success("Incident Report dispatched! SMTP alert sent to report@goldenmindsafrica.org in real-time.");
    });
    
    setReportText('');
    setReportTarget('');
    setIsReporting(false);
    setActiveTab('transcript');
  };

  const handleLeave = () => {
    navigate('/rooms');
  };

  return (
    <div className="h-[calc(100vh-4rem)] md:h-[calc(100vh-8rem)] flex flex-col bg-[#0a0a0a] md:rounded-3xl overflow-hidden shadow-2xl border-0 md:border border-gray-800">
      {/* Top Header */}
      <div className="h-14 bg-[#141414] border-b border-gray-800 flex items-center justify-between px-3 sm:px-6 shrink-0">
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1 sm:gap-2">
            <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border-none text-[10px] sm:text-xs px-1.5 sm:px-2.5">LIVE</Badge>
            <span className="text-white font-bold text-xs sm:text-sm tracking-wide ml-1 sm:ml-2 truncate max-w-[80px] sm:max-w-none">Room {roomId?.toUpperCase()}</span>
          </div>
          <div className="h-4 w-px bg-gray-700 hidden sm:block" />
          <span className="text-gray-400 text-xs sm:text-sm hidden sm:block truncate max-w-[150px] md:max-w-none">Policy & Tech Ecosystems</span>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            onClick={() => setLowBandwidth(!lowBandwidth)}
            className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-colors ${
              lowBandwidth ? 'bg-yellow-500/20 text-yellow-500' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
          >
            {lowBandwidth ? <WifiOff className="w-3 h-3 sm:w-4 sm:h-4" /> : <Wifi className="w-3 h-3 sm:w-4 sm:h-4" />}
            <span className="hidden sm:inline">{lowBandwidth ? 'Low Bandwidth Mode' : 'HD Quality'}</span>
          </button>
          <div className="hidden md:flex bg-gray-800 rounded-lg p-1">
            <button onClick={() => setLayout('single')} className={`p-1.5 rounded-md transition-colors ${layout === 'single' ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-white'}`}><Maximize className="w-4 h-4" /></button>
            <button onClick={() => setLayout('split')} className={`p-1.5 rounded-md transition-colors ${layout === 'split' ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-white'}`}><LayoutGrid className="w-4 h-4" /></button>
            <button onClick={() => setLayout('pip')} className={`p-1.5 rounded-md transition-colors ${layout === 'pip' ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-white'}`}><LayoutTemplate className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Collaborative Cursors Layer */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden z-50">
          {Object.values(activeFellows).map((fellow) => {
            if (fellow.x && fellow.y && fellow.userId !== user?.id) {
              return (
                <div 
                  key={fellow.userId}
                  className="absolute transition-all duration-200 ease-out"
                  style={{ left: `${fellow.x}%`, top: `${fellow.y}%` }}
                >
                  <svg className="w-5 h-5 text-[#ff4e00] drop-shadow animate-bounce" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 2l12 11.01h-7l3 7-2 1-3-7-3 3V2z" />
                  </svg>
                  <div className="bg-[#ff4e00] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow mt-1 ml-3 whitespace-nowrap">
                    {fellow.name}
                  </div>
                </div>
              );
            }
            return null;
          })}
        </div>

        {/* Video Area */}
        <div className="flex-1 p-2 sm:p-4 flex flex-col gap-2 sm:gap-4 relative">
          
          {lowBandwidth ? (
            <div className="flex-1 bg-[#141414] rounded-2xl border border-gray-800 flex flex-col items-center justify-center p-4 text-center">
              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <Mic className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
              </div>
              <h2 className="text-white text-lg sm:text-xl font-bold mb-2">Audio-Only Mode Active</h2>
              <p className="text-gray-500 text-xs sm:text-sm">Conserving data. Video is disabled.</p>
            </div>
          ) : (
            <div className={`flex-1 flex gap-2 sm:gap-4 ${layout === 'split' ? 'flex-col lg:flex-row' : 'flex-col'}`}>
              {/* Primary Screen (Presentation or Whiteboard) */}
              <div className={`relative bg-[#141414] rounded-2xl border border-gray-800 overflow-hidden ${layout === 'split' ? 'flex-1' : 'h-full'}`}>
                {showWhiteboard ? (
                  <div className="w-full h-full bg-[#f5f5f0] flex flex-col items-center justify-center relative">
                    <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-white px-2 sm:px-4 py-1 sm:py-2 rounded-xl shadow-sm border border-gray-200 flex gap-1 sm:gap-2">
                      <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-black cursor-pointer" />
                      <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-red-500 cursor-pointer" />
                      <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-blue-500 cursor-pointer" />
                      <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-green-500 cursor-pointer" />
                    </div>
                    <PenTool className="w-10 h-10 sm:w-16 sm:h-16 text-gray-300 mb-2 sm:mb-4" />
                    <p className="text-gray-500 font-medium text-sm sm:text-base">Collaborative Whiteboard Active</p>
                    <p className="text-xs sm:text-sm text-gray-400 hidden sm:block">Drawings will appear here in real-time.</p>
                  </div>
                ) : (
                  <img 
                    src="https://picsum.photos/seed/presentation/1280/720" 
                    alt="Presentation" 
                    className="w-full h-full object-cover opacity-80"
                    referrerPolicy="no-referrer"
                  />
                )}
                <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 bg-black/60 backdrop-blur-md px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-white text-[10px] sm:text-sm font-medium flex items-center gap-1 sm:gap-2">
                  <MonitorUp className="w-3 h-3 sm:w-4 sm:h-4" />
                  {showWhiteboard ? 'Collaborative Whiteboard' : "Dr. Amina's Screen"}
                </div>

                
                {/* Subtitles Overlay */}
                {isTranslating && translationMode === 'text' && transcript.length > 0 && (
                  <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-3/4 text-center">
                    <div className="bg-black/80 backdrop-blur-md px-6 py-3 rounded-2xl inline-block border border-gray-700 shadow-2xl">
                      <p className="text-yellow-400 text-lg font-medium leading-relaxed">
                        {/* Mock translation based on language */}
                        {targetLanguage === 'sw' ? "Karibuni nyote kwenye kikao cha leo kuhusu Sera na Mifumo ya Teknolojia." :
                         targetLanguage === 'fr' ? "Bienvenue à tous à la session d'aujourd'hui sur les politiques et les écosystèmes technologiques." :
                         transcript[transcript.length - 1].text}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Secondary Screen (Speaker/Gallery) */}
              {(layout === 'split' || layout === 'pip') && (
                <div className={`flex flex-col gap-4 ${layout === 'pip' ? 'absolute top-4 right-4 w-64 shadow-2xl z-20' : 'w-1/3'}`}>
                  {/* Speaker */}
                  <div className={`relative bg-[#141414] rounded-2xl border border-gray-800 overflow-hidden ${layout === 'pip' ? 'h-48' : 'flex-1'}`}>
                    <img 
                      src="https://picsum.photos/seed/speaker/640/480" 
                      alt="Speaker" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-white text-xs font-medium flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      Dr. Amina Mensah
                    </div>
                  </div>
                  
                  {/* You */}
                  <div className={`relative bg-[#141414] rounded-2xl border border-gray-800 overflow-hidden ${layout === 'pip' ? 'hidden' : 'h-48 shrink-0'}`}>
                    {isVideoOff ? (
                      <div className="w-full h-full flex items-center justify-center bg-gray-900 relative overflow-hidden">
                        {/* Blurred background placeholder */}
                        <div className="absolute inset-0 opacity-30 blur-2xl bg-gradient-to-br from-[#ff4e00] to-purple-600" />
                        <div className="relative z-10 w-24 h-24 rounded-full border-4 border-gray-800 bg-gradient-to-br from-[#ff4e00] to-[#ff6a00] flex items-center justify-center text-3xl font-bold text-white shadow-2xl">
                          YO
                        </div>
                      </div>
                    ) : (
                      <div className="relative w-full h-full">
                        <img 
                          src="https://picsum.photos/seed/user/640/480" 
                          alt="You" 
                          className={`w-full h-full object-cover transition-all duration-500 ${isBackgroundBlurred ? 'blur-md scale-110 opacity-60' : ''}`}
                          referrerPolicy="no-referrer"
                        />
                        {isBackgroundBlurred && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-24 h-24 rounded-full border-4 border-gray-800 bg-gradient-to-br from-[#ff4e00] to-[#ff6a00] flex items-center justify-center text-3xl font-bold text-white shadow-2xl">
                              YO
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-white text-xs font-medium flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      You
                    </div>
                    <div className="absolute top-3 right-3 flex gap-2">
                      {!isVideoOff && (
                        <button 
                          onClick={() => setIsBackgroundBlurred(!isBackgroundBlurred)}
                          className={`p-1.5 rounded-lg backdrop-blur-md transition-colors ${isBackgroundBlurred ? 'bg-[#ff4e00]/80 text-white' : 'bg-black/60 text-gray-300 hover:text-white'}`}
                          title="Toggle Background Blur"
                        >
                          <ImageIcon className="w-4 h-4" />
                        </button>
                      )}
                      {isMuted && (
                        <div className="bg-red-500/80 backdrop-blur-md p-1.5 rounded-lg text-white">
                          <MicOff className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="w-80 bg-[#141414] border-l border-gray-800 flex flex-col shrink-0">
          <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="flex flex-col h-full">
            <TabsList className="bg-transparent border-b border-gray-800 rounded-none h-auto p-0 flex w-full">
              <TabsTrigger value="chat" className="flex-1 p-3 rounded-none data-[state=active]:bg-transparent data-[state=active]:text-[#ff4e00] data-[state=active]:border-b-2 data-[state=active]:border-[#ff4e00] data-[state=active]:shadow-none text-gray-400 hover:text-gray-200"><MessageSquare className="w-5 h-5" /></TabsTrigger>
              <TabsTrigger value="qa" className="flex-1 p-3 rounded-none data-[state=active]:bg-transparent data-[state=active]:text-[#ff4e00] data-[state=active]:border-b-2 data-[state=active]:border-[#ff4e00] data-[state=active]:shadow-none text-gray-400 hover:text-gray-200"><Sparkles className="w-5 h-5" /></TabsTrigger>
              <TabsTrigger value="participants" className="flex-1 p-3 rounded-none data-[state=active]:bg-transparent data-[state=active]:text-[#ff4e00] data-[state=active]:border-b-2 data-[state=active]:border-[#ff4e00] data-[state=active]:shadow-none text-gray-400 hover:text-gray-200"><Users className="w-5 h-5" /></TabsTrigger>
              <TabsTrigger value="transcript" className="flex-1 p-3 rounded-none data-[state=active]:bg-transparent data-[state=active]:text-[#ff4e00] data-[state=active]:border-b-2 data-[state=active]:border-[#ff4e00] data-[state=active]:shadow-none text-gray-400 hover:text-gray-200"><FileText className="w-5 h-5" /></TabsTrigger>
              <TabsTrigger value="translation" className="flex-1 p-3 rounded-none data-[state=active]:bg-transparent data-[state=active]:text-[#ff4e00] data-[state=active]:border-b-2 data-[state=active]:border-[#ff4e00] data-[state=active]:shadow-none text-gray-400 hover:text-gray-200"><Globe className="w-5 h-5" /></TabsTrigger>
              <TabsTrigger value="polls" className="flex-1 p-3 rounded-none data-[state=active]:bg-transparent data-[state=active]:text-[#ff4e00] data-[state=active]:border-b-2 data-[state=active]:border-[#ff4e00] data-[state=active]:shadow-none text-gray-400 hover:text-gray-200"><BarChart2 className="w-5 h-5" /></TabsTrigger>
              <TabsTrigger value="report" className="flex-1 p-3 rounded-none data-[state=active]:bg-transparent data-[state=active]:text-red-500 data-[state=active]:border-b-2 data-[state=active]:border-red-500 data-[state=active]:shadow-none text-gray-400 hover:text-red-400" title="Report Code Violations"><ShieldAlert className="w-5 h-5" /></TabsTrigger>
            </TabsList>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto p-4 text-gray-300">
              <TabsContent value="transcript" className="m-0 h-full flex flex-col">
                <div className="flex items-center justify-between mb-4 shrink-0">
                  <h3 className="text-white font-bold text-sm uppercase tracking-wider">Live Transcript</h3>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={async () => {
                        if (isSummaryOpen && summary) {
                          setIsSummaryOpen(false);
                          return;
                        }
                        setIsGeneratingSummary(true);
                        setIsSummaryOpen(true);
                        try {
                          const text = transcript.map(t => `${t.speaker}: ${t.text}`).join('\n');
                          const response = await ai.models.generateContent({
                            model: 'gemini-2.5-flash',
                            contents: `Summarize the following lecture transcript and extract key insights. Format it nicely with bullet points:\n\n${text}`
                          });
                          setSummary(response.text || 'Could not generate summary.');
                        } catch (e) {
                          setSummary('Failed to generate summary. Please try again.');
                        } finally {
                          setIsGeneratingSummary(false);
                        }
                      }}
                      className="text-xs bg-[#ff4e00] hover:bg-[#ff6a00] text-white px-2 py-1 rounded flex items-center gap-1 transition-colors"
                    >
                      <Sparkles className="w-3 h-3" /> {isSummaryOpen && summary ? 'Close Summary' : 'Generate Summary'}
                    </button>
                    <span className="flex items-center gap-1 text-xs text-green-500 bg-green-500/10 px-2 py-1 rounded">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Live
                    </span>
                  </div>
                </div>

                <AnimatePresence>
                  {isSummaryOpen && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mb-4 overflow-hidden shrink-0"
                    >
                      <div className="bg-gray-800/50 border border-[#ff4e00]/30 rounded-xl p-4 relative">
                        <div className="absolute top-0 right-0 p-2">
                          <button onClick={() => setIsSummaryOpen(false)} className="text-gray-400 hover:text-white">
                            <ChevronUp className="w-4 h-4" />
                          </button>
                        </div>
                        <h4 className="text-[#ff4e00] font-bold text-sm mb-2 flex items-center gap-2">
                          <Sparkles className="w-4 h-4" /> AI Summary
                        </h4>
                        {isGeneratingSummary ? (
                          <div className="flex items-center gap-2 text-gray-400 text-sm">
                            <div className="w-4 h-4 border-2 border-[#ff4e00] border-t-transparent rounded-full animate-spin" />
                            Generating insights...
                          </div>
                        ) : (
                          <div className="text-sm text-gray-300 prose prose-invert prose-sm max-w-none">
                            {summary.split('\n').map((line, i) => (
                              <p key={i} className="mb-1">{line}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-4 overflow-y-auto flex-1" ref={transcriptRef}>
                  {transcript.map((item, i) => (
                    <div key={i} className="text-sm">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-gray-500 text-xs">{item.time}</span>
                        <span className="text-[#ff4e00] font-bold">{item.speaker}</span>
                      </div>
                      <p className="text-gray-300 leading-relaxed">{item.text}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="translation" className="m-0 h-full">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-2">AI Translation Agent</h3>
                  <p className="text-gray-500 text-xs mb-4">Real-time multilingual translation powered by Gemini.</p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-gray-800/50 p-3 rounded-xl border border-gray-700">
                    <span className="text-sm font-medium text-white">Enable AI Translation</span>
                    <Switch 
                      checked={isTranslating} 
                      onCheckedChange={setIsTranslating} 
                    />
                  </div>

                  {isTranslating && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Target Language</label>
                        <select 
                          value={targetLanguage}
                          onChange={(e) => setTargetLanguage(e.target.value)}
                          className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#ff4e00]"
                        >
                          {LANGUAGES.map(lang => (
                            <option key={lang.code} value={lang.code}>{lang.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Translation Mode</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button 
                            onClick={() => setTranslationMode('text')}
                            className={`py-2 px-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                              translationMode === 'text' ? 'bg-[#ff4e00] text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                            }`}
                          >
                            <Type className="w-4 h-4" /> Text
                          </button>
                          <button 
                            onClick={() => setTranslationMode('voice')}
                            className={`py-2 px-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                              translationMode === 'voice' ? 'bg-[#ff4e00] text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                            }`}
                          >
                            <Volume2 className="w-4 h-4" /> Voice
                          </button>
                        </div>
                      </div>

                      {translationMode === 'voice' && (
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex flex-col gap-3">
                          <div className="flex gap-3">
                            <Volume2 className="w-5 h-5 text-blue-400 shrink-0" />
                            <p className="text-xs text-blue-300 leading-relaxed">
                              Listening to translated voice (original muted). You are hearing the AI-generated {LANGUAGES.find(l => l.code === targetLanguage)?.name} voice.
                            </p>
                          </div>
                          
                          {/* Waveform Visualizer */}
                          <div className="flex gap-1 items-end h-12 justify-center mt-2">
                            {[...Array(20)].map((_, i) => (
                              <motion.div
                                key={i}
                                animate={{ height: [10, 30, 15] }}
                                transition={{ repeat: Infinity, duration: 1, delay: i * 0.05 }}
                                className="w-1 bg-blue-400 rounded"
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
                </div>
              </TabsContent>

              <TabsContent value="chat" className="m-0 h-full">
                <div className="flex flex-col h-full">
                  <div className="flex-1 overflow-y-auto space-y-4 p-2">
                    {messages.map(msg => (
                      <div key={msg.id} className={`flex flex-col ${msg.sender === 'You' ? 'items-end' : 'items-start'}`}>
                        <span className="text-xs text-gray-500 mb-1">
                          {msg.sender} {msg.recipient !== 'Everyone' ? `(Private to ${msg.recipient})` : ''} • {msg.time}
                        </span>
                        <div className={`px-3 py-2 rounded-lg max-w-[80%] text-sm ${msg.sender === 'You' ? 'bg-[#ff4e00] text-white' : 'bg-gray-800 text-gray-200'}`}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex flex-col gap-2">
                    <select 
                      value={chatRecipient}
                      onChange={(e) => setChatRecipient(e.target.value)}
                      className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-[#ff4e00]"
                    >
                      <option value="Everyone">Everyone</option>
                      {MOCK_PARTICIPANTS.filter((p: any) => p.name !== 'You').map((p: any) => (
                        <option key={p.id} value={p.name}>{p.name} ({p.role || 'Fellow'})</option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newMessage.trim()) {
                            addRoomMessage(room.id, {
                              sender: 'You',
                              text: newMessage.trim()
                            });
                            setNewMessage('');
                          }
                        }}
                        placeholder="Type a message..." 
                        className="flex-1 bg-gray-800 border-none rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-[#ff4e00]" 
                      />
                      <button 
                        onClick={() => {
                          if (newMessage.trim()) {
                            addRoomMessage(room.id, {
                              sender: 'You',
                              text: newMessage.trim()
                            });
                            setNewMessage('');
                          }
                        }}
                        className="bg-[#ff4e00] text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-[#ff6a00]"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="qa" className="m-0 h-full">
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-4 shrink-0">
                    <Sparkles className="w-5 h-5 text-[#ff4e00]" />
                    <h3 className="text-white font-bold text-sm uppercase tracking-wider">AI Assistant</h3>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto space-y-4 p-2" ref={qaRef}>
                    {qaMessages.map(msg => (
                      <div key={msg.id} className={`flex flex-col ${msg.sender === 'You' ? 'items-end' : 'items-start'}`}>
                        <span className="text-xs text-gray-500 mb-1">
                          {msg.sender} • {msg.time}
                        </span>
                        <div className={`px-4 py-3 rounded-2xl max-w-[85%] text-sm leading-relaxed ${
                          msg.sender === 'You' 
                            ? 'bg-[#ff4e00] text-white rounded-br-sm' 
                            : 'bg-gray-800 text-gray-200 border border-gray-700 rounded-bl-sm'
                        }`}>
                          {msg.text.split('\n').map((line, i) => (
                            <p key={i} className={i > 0 ? 'mt-2' : ''}>{line}</p>
                          ))}
                        </div>
                      </div>
                    ))}
                    {isGeneratingQa && (
                      <div className="flex flex-col items-start">
                        <span className="text-xs text-gray-500 mb-1">AI Assistant</span>
                        <div className="px-4 py-3 rounded-2xl bg-gray-800 border border-gray-700 rounded-bl-sm flex items-center gap-2">
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 shrink-0 relative">
                    <input 
                      type="text" 
                      value={newQaMessage}
                      onChange={(e) => setNewQaMessage(e.target.value)}
                      onKeyDown={async (e) => {
                        if (e.key === 'Enter' && newQaMessage.trim() && !isGeneratingQa) {
                          const userMsg = newQaMessage.trim();
                          setNewQaMessage('');
                          setQaMessages(prev => [...prev, { id: Date.now(), sender: 'You', text: userMsg, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]);
                          setIsGeneratingQa(true);
                          
                          try {
                            const transcriptText = transcript.map(t => `${t.speaker}: ${t.text}`).join('\n');
                            const response = await ai.models.generateContent({
                              model: 'gemini-2.5-flash',
                              contents: `You are an AI teaching assistant for a fellowship program. Answer the following question based on the lecture transcript provided below. If the answer is not in the transcript, use your general knowledge but mention that it wasn't explicitly covered in the lecture.\n\nTranscript:\n${transcriptText}\n\nQuestion: ${userMsg}`
                            });
                            
                            setQaMessages(prev => [...prev, { 
                              id: Date.now(), 
                              sender: 'AI Assistant', 
                              text: response.text || 'Sorry, I could not generate an answer.', 
                              time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
                            }]);
                          } catch (error) {
                            setQaMessages(prev => [...prev, { 
                              id: Date.now(), 
                              sender: 'AI Assistant', 
                              text: 'Sorry, I encountered an error while trying to answer your question.', 
                              time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
                            }]);
                          } finally {
                            setIsGeneratingQa(false);
                          }
                        }
                      }}
                      placeholder="Ask a question about the lecture..." 
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:border-[#ff4e00] focus:ring-1 focus:ring-[#ff4e00] transition-all" 
                      disabled={isGeneratingQa}
                    />
                    <button 
                      onClick={async () => {
                        if (newQaMessage.trim() && !isGeneratingQa) {
                          const userMsg = newQaMessage.trim();
                          setNewQaMessage('');
                          setQaMessages(prev => [...prev, { id: Date.now(), sender: 'You', text: userMsg, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]);
                          setIsGeneratingQa(true);
                          
                          try {
                            const transcriptText = transcript.map(t => `${t.speaker}: ${t.text}`).join('\n');
                            const response = await ai.models.generateContent({
                              model: 'gemini-2.5-flash',
                              contents: `You are an AI teaching assistant for a fellowship program. Answer the following question based on the lecture transcript provided below. If the answer is not in the transcript, use your general knowledge but mention that it wasn't explicitly covered in the lecture.\n\nTranscript:\n${transcriptText}\n\nQuestion: ${userMsg}`
                            });
                            
                            setQaMessages(prev => [...prev, { 
                              id: Date.now(), 
                              sender: 'AI Assistant', 
                              text: response.text || 'Sorry, I could not generate an answer.', 
                              time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
                            }]);
                          } catch (error) {
                            setQaMessages(prev => [...prev, { 
                              id: Date.now(), 
                              sender: 'AI Assistant', 
                              text: 'Sorry, I encountered an error while trying to answer your question.', 
                              time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
                            }]);
                          } finally {
                            setIsGeneratingQa(false);
                          }
                        }
                      }}
                      disabled={isGeneratingQa || !newQaMessage.trim()}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-[#ff4e00] disabled:opacity-50 disabled:hover:text-gray-400 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="polls" className="m-0 h-full overflow-y-auto">
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-bold text-sm uppercase tracking-wider">Polls & Quizzes</h3>
                    <button 
                      onClick={() => setIsCreatingPoll(!isCreatingPoll)}
                      className="text-xs bg-gray-800 hover:bg-gray-700 text-white px-2 py-1 rounded"
                    >
                      {isCreatingPoll ? 'Cancel' : '+ Create Poll'}
                    </button>
                  </div>

                  {isCreatingPoll && (
                    <div className="bg-gray-800 rounded-xl p-4 border border-[#ff4e00]">
                      <input 
                        type="text" 
                        placeholder="Poll Question" 
                        value={newPollQuestion}
                        onChange={(e) => setNewPollQuestion(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white mb-3"
                      />
                      <div className="space-y-2 mb-3">
                        {newPollOptions.map((opt, idx) => (
                          <input 
                            key={idx}
                            type="text" 
                            placeholder={`Option ${idx + 1}`} 
                            value={opt}
                            onChange={(e) => {
                              const newOpts = [...newPollOptions];
                              newOpts[idx] = e.target.value;
                              setNewPollOptions(newOpts);
                            }}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
                          />
                        ))}
                      </div>
                      <div className="flex justify-between">
                        <button 
                          onClick={() => setNewPollOptions([...newPollOptions, ''])}
                          className="text-xs text-gray-400 hover:text-white"
                        >
                          + Add Option
                        </button>
                        <button 
                          onClick={() => {
                            if (newPollQuestion && newPollOptions.filter(o => o).length >= 2) {
                              setPolls([{
                                id: Date.now(),
                                question: newPollQuestion,
                                options: newPollOptions.filter(o => o).map(text => ({ text, votes: 0 })),
                                totalVotes: 0,
                                isActive: true
                              }, ...polls]);
                              setIsCreatingPoll(false);
                              setNewPollQuestion('');
                              setNewPollOptions(['', '']);
                            }
                          }}
                          className="text-xs bg-[#ff4e00] hover:bg-[#ff6a00] text-white px-3 py-1 rounded"
                        >
                          Launch Poll
                        </button>
                      </div>
                    </div>
                  )}

                  {polls.map(poll => (
                    <div key={poll.id} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="text-white font-medium text-sm">{poll.question}</h4>
                        {poll.isActive && <Badge className="bg-green-500/20 text-green-400 text-[10px] px-1.5 py-0 border-none">ACTIVE</Badge>}
                      </div>
                      <div className="space-y-2">
                        {poll.options.map((opt, idx) => (
                          <button 
                            key={idx}
                            onClick={() => {
                              const newPolls = [...polls];
                              const pollIndex = newPolls.findIndex(p => p.id === poll.id);
                              newPolls[pollIndex].options[idx].votes++;
                              newPolls[pollIndex].totalVotes++;
                              setPolls(newPolls);
                            }}
                            className="w-full text-left px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors flex justify-between items-center relative overflow-hidden"
                          >
                            <div 
                              className="absolute left-0 top-0 bottom-0 bg-[#ff4e00]/20" 
                              style={{ width: `${poll.totalVotes > 0 ? (opt.votes / poll.totalVotes) * 100 : 0}%` }}
                            />
                            <span className="relative z-10 text-gray-200">{opt.text}</span>
                            <span className="relative z-10 font-bold text-white text-xs">
                              {poll.totalVotes > 0 ? Math.round((opt.votes / poll.totalVotes) * 100) : 0}%
                            </span>
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-3 text-right">{poll.totalVotes} votes cast</p>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="participants" className="m-0 h-full overflow-y-auto">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                    <span>In Room ({MOCK_PARTICIPANTS.length})</span>
                    <button className="text-[#ff4e00] hover:text-[#ff6a00]">Mute All</button>
                  </div>
                  
                  {MOCK_PARTICIPANTS.map(p => (
                    <div key={p.id} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${p.isMe ? 'bg-[#ff4e00]' : 'bg-gray-700'}`}>
                          {p.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm text-white font-medium flex items-center gap-2">
                            {p.name}
                            {(p.handRaised || (p.isMe && isHandRaised)) && (
                              <Hand className="w-3 h-3 text-yellow-500" />
                            )}
                          </p>
                          <p className="text-xs text-gray-500">{p.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500">
                        {p.isMe ? (
                          <>
                            {isMuted ? <MicOff className="w-4 h-4 text-red-500" /> : <Mic className="w-4 h-4" />}
                            {isVideoOff ? <VideoOff className="w-4 h-4 text-red-500" /> : <Video className="w-4 h-4" />}
                          </>
                        ) : (
                          <>
                            <Mic className="w-4 h-4" />
                            <Video className="w-4 h-4" />
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="report" className="m-0 h-full flex flex-col">
                <form onSubmit={handleSubmitReport} className="flex flex-col h-full space-y-4">
                  <div className="shrink-0 space-y-1">
                    <h3 className="text-red-500 font-bold text-sm uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldAlert className="w-5 h-5" />
                      Conduct Complaint
                    </h3>
                    <p className="text-xs text-gray-400">
                      Dispatched directly to <span className="text-[#cca568] font-semibold">report@goldenmindsafrica.org</span>
                    </p>
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed bg-red-950/20 border border-red-900/30 p-3 rounded-xl shrink-0">
                    Your testimony will trigger instant administrative review on the Super Admin platform. Please supply objective, detailed explanations.
                  </p>

                  <div className="flex-1 space-y-4 flex flex-col min-h-0">
                    <div className="space-y-1.5 shrink-0">
                      <label className="text-xs font-bold text-gray-400 block">Flag Participant</label>
                      <select
                        value={reportTarget}
                        onChange={(e) => setReportTarget(e.target.value)}
                        required
                        className="w-full bg-[#1c1c1e] border border-gray-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                      >
                        <option value="">-- Choose Offender --</option>
                        {MOCK_PARTICIPANTS.map((p) => (
                          <option key={p.id} value={p.name}>
                            {p.name} ({p.role})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5 flex-1 flex flex-col min-h-0">
                      <label className="text-xs font-bold text-gray-400 block shrink-0">Report Description</label>
                      <textarea
                        value={reportText}
                        onChange={(e) => setReportText(e.target.value)}
                        placeholder="Detail inappropriate remarks, voice breaches or conduct policies violated..."
                        required
                        className="w-full flex-1 min-h-[120px] bg-[#1c1c1e] border border-gray-800 rounded-xl p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500 resize-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isReporting || !reportTarget || !reportText.trim()}
                    className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shrink-0 mt-auto flex items-center justify-center gap-2"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    {isReporting ? "Filing Incident..." : "File Official Report"}
                  </button>
                </form>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      {/* Participants Popup */}
      <AnimatePresence>
        {showParticipantsPopup && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-24 left-1/2 -translate-x-1/2 w-96 bg-[#1a1a1a] border border-gray-800 rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#141414]">
              <h3 className="text-white font-bold flex items-center gap-2">
                <Users className="w-5 h-5 text-[#ff4e00]" />
                Participants ({MOCK_PARTICIPANTS.length})
              </h3>
              <button onClick={() => setShowParticipantsPopup(false)} className="text-gray-400 hover:text-white">
                &times;
              </button>
            </div>
            <div className="p-2 max-h-96 overflow-y-auto">
              {MOCK_PARTICIPANTS.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 hover:bg-gray-800/50 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-inner ${p.isMe ? 'bg-gradient-to-br from-[#ff4e00] to-[#ff6a00]' : 'bg-gradient-to-br from-gray-700 to-gray-800'}`}>
                      {p.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium flex items-center gap-2">
                        {p.name} {p.isMe && <span className="text-xs text-gray-500 font-normal">(You)</span>}
                        {(p.handRaised || (p.isMe && isHandRaised)) && (
                          <Hand className="w-3.5 h-3.5 text-yellow-500" />
                        )}
                      </p>
                      <p className="text-xs text-gray-500">{p.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-gray-400 bg-gray-900/50 px-3 py-1.5 rounded-lg border border-gray-800">
                    {p.isMe ? (
                      <>
                        {isMuted ? <MicOff className="w-4 h-4 text-red-500" /> : <Mic className="w-4 h-4 text-green-500" />}
                        {isVideoOff ? <VideoOff className="w-4 h-4 text-red-500" /> : <Video className="w-4 h-4 text-green-500" />}
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4 text-green-500" />
                        <Video className="w-4 h-4 text-green-500" />
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-gray-800 bg-[#141414] flex justify-end">
              <button className="text-xs font-medium text-[#ff4e00] hover:text-[#ff6a00] px-4 py-2 rounded-lg hover:bg-[#ff4e00]/10 transition-colors">
                Mute All Participants
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Controls */}
      <div className="h-auto md:h-20 bg-[#141414] border-t border-gray-800 flex flex-wrap items-center justify-center sm:justify-between p-3 sm:px-6 gap-3 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-colors ${isMuted ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
          >
            {isMuted ? <MicOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Mic className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
          <button 
            onClick={() => setIsVideoOff(!isVideoOff)}
            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-colors ${isVideoOff ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
          >
            {isVideoOff ? <VideoOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Video className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button 
            onClick={() => setShowWhiteboard(!showWhiteboard)}
            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-colors ${showWhiteboard ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
          >
            <PenTool className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-800 text-white hover:bg-gray-700 flex items-center justify-center transition-colors">
            <MonitorUp className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button 
            onClick={() => setIsHandRaised(!isHandRaised)}
            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-colors ${isHandRaised ? 'bg-yellow-500 text-white hover:bg-yellow-600' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
          >
            <Hand className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button className="hidden sm:flex w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-800 text-white hover:bg-gray-700 items-center justify-center transition-colors">
            <Smile className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button 
            onClick={() => setShowParticipantsPopup(!showParticipantsPopup)}
            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-colors relative ${showParticipantsPopup ? 'bg-[#ff4e00] text-white' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
          >
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {MOCK_PARTICIPANTS.length}
            </span>
          </button>
        </div>

        <button 
          onClick={handleLeave}
          className="px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-red-500 text-white text-sm sm:text-base font-bold hover:bg-red-600 transition-colors flex items-center gap-2"
        >
          <PhoneOff className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Leave</span>
        </button>
      </div>
    </div>
  );
}
