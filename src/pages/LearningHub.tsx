import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Search, PlayCircle, FileText, Sparkles, Loader2, BrainCircuit, TrendingUp, Clock, Download, PenTool, Youtube, Video, Bookmark, Award, CheckCircle } from 'lucide-react';
import { GoogleGenAI, Type } from '@google/genai';
import { Routes, Route, useNavigate, useLocation, Navigate, useParams } from 'react-router-dom';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast } from 'sonner';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Utility to parse YouTube IDs from general URLs or direct IDs
const getYouTubeId = (url: string): string => {
  if (!url) return '';
  const trimmed = url.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = trimmed.match(regExp);
  return (match && match[2].length === 11) ? match[2] : '';
};

const MOCK_MODULES = [
  {
    id: 'week1',
    title: 'Week 1: Fundamentals of Values-Based & Servant Leadership',
    materials: [
      {
        id: 'm1-v1',
        title: 'Introduction to Values-Based African Leadership',
        type: 'video',
        description: 'Explore the core tenets of ethical leadership, public integrity, and how the values of Ubuntu serve as an active guiding philosophy for modern administrators.',
        youtubeId: 'qp0HIF3SfI4', // Simon Sinek - How Great Leaders Inspire Action
        duration: '12 mins'
      },
      {
        id: 'm1-a1',
        title: 'The Principles of Ubuntu in Modern Public Service',
        type: 'article',
        description: 'An academic overview of post-colonial leadership theories, contrasting transactional Western structures with collaborative African community philosophies.',
        duration: '10 min read'
      }
    ]
  },
  {
    id: 'week2',
    title: 'Week 2: Separating Powers & Designing Strong Democratic Institutions',
    materials: [
      {
        id: 'm2-v1',
        title: 'Building Inclusive Governance Institutions in Africa',
        type: 'video',
        description: 'An insightful analysis of constitutional separate powers, the role of ombudsman entities, and methods to institutionalize judicial independence.',
        youtubeId: 'rObeS_b0RXI', // PLO Lumumba on African Governance
        duration: '18 mins'
      },
      {
        id: 'm2-c1',
        title: 'Case Study: Botswana\'s Separation of Powers and Minerals Policy',
        type: 'case study',
        description: 'Analyzing how Botswana successfully insulated its diamond resources from executive capture through robust transparent legislative frameworks.',
        duration: '25 min read'
      }
    ]
  },
  {
    id: 'week3',
    title: 'Week 3: Geopolitical Strategy & Economic Union Dynamics',
    materials: [
      {
        id: 'm3-v1',
        title: 'AfCFTA and the Future of Intra-African Economic Integration',
        type: 'video',
        description: 'An overview of the African Continental Free Trade Area, structural non-tariff barriers, currency settlements, and economic trade leverage.',
        youtubeId: 'SgnHOnfZZW0', // Ngozi Okonjo-Iweala TED
        duration: '15 mins'
      },
      {
        id: 'm3-p1',
        title: 'Strategic Negotiations: Playbook for Head-of-State Staffers',
        type: 'pdf',
        description: 'A professional executive brief on leverage points, bilateral alternatives, and coalition-building during IMF and multilateral talks.',
        duration: '15 pages'
      }
    ]
  }
];


const getIconForType = (type: string) => {
  switch (type.toLowerCase()) {
    case 'video': return <PlayCircle className="w-5 h-5" />;
    case 'pdf': return <FileText className="w-5 h-5" />;
    case 'article': return <BookOpen className="w-5 h-5" />;
    case 'assignment': return <PenTool className="w-5 h-5" />;
    default: return <FileText className="w-5 h-5" />;
  }
};

const getIconForTypeLarge = (type: string) => {
  switch (type.toLowerCase()) {
    case 'video': return <PlayCircle className="w-6 h-6" />;
    case 'pdf': return <FileText className="w-6 h-6" />;
    case 'article': return <BookOpen className="w-6 h-6" />;
    case 'assignment': return <PenTool className="w-6 h-6" />;
    default: return <FileText className="w-6 h-6" />;
  }
};

// Circular Progress Bar Component
function CircularProgress({ percentage, size = 36 }: { percentage: number, size?: number }) {
  const radius = size * 0.4;
  const strokeWidth = size * 0.1;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="stroke-gray-100"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="stroke-[#ff4e00] transition-all duration-500 ease-out"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
        />
      </svg>
      <span className="absolute text-[9px] font-bold text-gray-700">
        {percentage}%
      </span>
    </div>
  );
}

// SMART_FEED is now dynamically generated

function LearningHubMain() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const [aiSummary, setAiSummary] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [smartFeed, setSmartFeed] = useState<any[]>([]);
  const [isLoadingFeed, setIsLoadingFeed] = useState(false);

  // Material Progress Tracking (calculating completion based on video watch time & quiz score)
  const [materialsProgress, setMaterialsProgress] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('gma_material_progress');
      if (saved) return JSON.parse(saved);

      // Default demo progress: Week 1 is partially done
      const initialProgress = {
        'm1-v1': { watched: 100, quizScore: 100 }, // completed
        'm1-a1': { watched: 40, quizScore: 0 },   // in-progress
        'm2-v1': { watched: 0, quizScore: 0 },
        'm2-c1': { watched: 0, quizScore: 0 },
        'm3-v1': { watched: 0, quizScore: 0 },
        'm3-p1': { watched: 0, quizScore: 0 }
      };
      localStorage.setItem('gma_material_progress', JSON.stringify(initialProgress));
      return initialProgress;
    } catch {
      return {};
    }
  });

  const getModuleProgress = (moduleId: string) => {
    const mod = MOCK_MODULES.find(m => m.id === moduleId);
    if (!mod) return 0;
    
    let totalScore = 0;
    mod.materials.forEach(mat => {
      const matProgress = materialsProgress[mat.id] || { watched: 0, quizScore: 0 };
      const matCompletion = Math.round((matProgress.watched + matProgress.quizScore) / 2);
      totalScore += matCompletion;
    });
    
    return Math.round(totalScore / mod.materials.length);
  };

  const getMaterialStatusIcon = (matId: string) => {
    const prog = materialsProgress[matId] || { watched: 0, quizScore: 0 };
    const avg = (prog.watched + prog.quizScore) / 2;
    if (avg >= 100) {
      return <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />;
    } else if (avg > 0) {
      return <div className="w-4 h-4 rounded-full border-2 border-yellow-500 bg-yellow-50 flex items-center justify-center shrink-0"><div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div></div>;
    }
    return <div className="w-4 h-4 rounded-full border border-gray-300 shrink-0"></div>;
  };

  const updateProgress = (materialId: string, watchedVal: number, quizScoreVal: number) => {
    const prev = materialsProgress[materialId] || { watched: 0, quizScore: 0 };
    const newProgress = {
      ...materialsProgress,
      [materialId]: {
        watched: Math.min(100, Math.max(prev.watched, watchedVal)),
        quizScore: Math.min(100, Math.max(prev.quizScore, quizScoreVal))
      }
    };
    setMaterialsProgress(newProgress);
    localStorage.setItem('gma_material_progress', JSON.stringify(newProgress));

    // Also notify active study on dashboard heatmap
    const dashboardMinutes = watchedVal ? Math.round((watchedVal / 100) * 15) : 5;
    const stored = localStorage.getItem('gma_study_sessions') || '{}';
    let sessionsMap: any = {};
    try { sessionsMap = JSON.parse(stored); } catch {}
    const todayStr = new Date().toISOString().split('T')[0];
    sessionsMap[todayStr] = (sessionsMap[todayStr] || 0) + dashboardMinutes;
    localStorage.setItem('gma_study_sessions', JSON.stringify(sessionsMap));
  };

  // Bookmark / Knowledge Vault states syncing with localStorage
  const [bookmarks, setBookmarks] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('gma_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleToggleBookmark = (mat: any) => {
    const exists = bookmarks.some(b => b.id === mat.id);
    let updated;
    if (exists) {
      updated = bookmarks.filter(b => b.id !== mat.id);
      toast.success(`Removed "${mat.title}" from your Knowledge Vault.`);
    } else {
      updated = [...bookmarks, { 
        ...mat, 
        bookmarkedAt: new Date().toISOString(),
        personalNotes: `Study notes captured on GMA curriculum.`
      }];
      toast.success(`Saved "${mat.title}" to your Knowledge Vault!`);
    }
    setBookmarks(updated);
    localStorage.setItem('gma_bookmarks', JSON.stringify(updated));
  };

  // AI Study Buddy Interactive Chat States
  const [buddyMessages, setBuddyMessages] = useState<any[]>([]);
  const [buddyInput, setBuddyInput] = useState('');
  const [isBuddyLoading, setIsBuddyLoading] = useState(false);
  const [activeBuddyTab, setActiveBuddyTab] = useState<'summary' | 'chat'>('chat');

  useEffect(() => {
    if (selectedMaterial) {
      setBuddyMessages([
        {
          sender: 'buddy',
          text: `Habari! I am your Golden Minds study peer. I've analyzed "${selectedMaterial.title}" (${selectedMaterial.type}). Ask me any conceptual question about this curriculum material, policy tradeoffs, or real-world African leadership applications!`
        }
      ]);
    }
  }, [selectedMaterial?.id]);

  const handleSendBuddyMessage = async (customPrompt?: string) => {
    const userQuery = customPrompt || buddyInput;
    if (!userQuery.trim() || !selectedMaterial) return;

    const updatedMsgs = [...buddyMessages, { sender: 'user', text: userQuery }];
    setBuddyMessages(updatedMsgs);
    setBuddyInput('');
    setIsBuddyLoading(true);

    try {
      const studyContext = `
        You are the Golden Minds Africa AI Study Buddy, an elite curriculum assistant.
        The user is currently studying the material: "${selectedMaterial.title}"
        Type: "${selectedMaterial.type}"
        Overview: "${selectedMaterial.description || ''}"
        
        Question: "${userQuery}"
        
        Provide a smart, intellectually rigorous academic answer, specifically framing its relevance to African sovereign leadership and public policy formulation. Rely on real-world examples, or regional integration tradeoffs where applicable. Keep it professional, structured, and informative.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: studyContext,
      });

      setBuddyMessages(prev => [...prev, { sender: 'buddy', text: response.text || 'I was unable to synthesize an answer. Try rephrasing.' }]);
    } catch (e: any) {
      console.error(e);
      setBuddyMessages(prev => [...prev, { sender: 'buddy', text: `My apologies, my neural circuits are currently undergoing a brief refresh. [Exception: ${e.message || 'connection limit'}]` }]);
    } finally {
      setIsBuddyLoading(false);
    }
  };

  // Interactive Mini Quizzes
  const [quizMaterialId, setQuizMaterialId] = useState<string | null>(null);
  const [currentQuizAnswers, setCurrentQuizAnswers] = useState<any>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const MOCK_QUIZZES: { [key: string]: any[] } = {
    'm1-v1': [
      { q: "What is the core relational teaching of Ubuntu?", options: ["I think, therefore I am", "I am because we are", "The winner takes it all"], correct: 1 },
      { q: "A servant leader primarily views their role as which of the following?", options: ["A sovereign commander", "A public trustee and community server", "An executive manager"], correct: 1 },
      { q: "Which ethical values are critical in values-based African leadership?", options: ["Maximum economic efficiency", "Ethics, public trust, and transparency", "Rapid military defense"], correct: 1 }
    ],
    'm1-a1': [
      { q: "Post-colonial leaders face a major systemic issue regarding what?", options: ["Overuse of direct democratic vote", "Molding colonial state mechanics to public service", "Lack of natural resources"], correct: 1 },
      { q: "African governance structures traditionally rely on which format?", options: ["Highly transactional negotiations", "Collaborative community councils and dialogues", "Rigid centralized command structures"], correct: 1 },
      { q: "Ubuntu leadership opposes what in public administration?", options: ["Equitable economic networks", "Corruption, nepotism, and narrow self-interest", "Bilateral international assistance"], correct: 1 }
    ],
    'm2-v1': [
      { q: "Separation of powers strives to prevent which specific outcome?", options: ["High tax collection", "Unchecked executive consolidation and resource capture", "Multi-party legislative voting"], correct: 1 },
      { q: "Which body acts as an independent auditor and ethics overseer?", options: ["The supreme army council", "The office of the Ombudsman", "A presidential advisory committee"], correct: 1 }
    ],
    'm2-c1': [
      { q: "Botswana has successfully managed diamond revenues in what way?", options: ["Sovereign mineral insulation and legislative transparency", "Privatization of all communal wells", "Direct personal transfer to political elites"], correct: 0 },
      { q: "Mineral wealth in Botswana is protected from executive capture using what?", options: ["A closed military vault", "Transparent constitutional laws and parliamentary oversight", "None of the above"], correct: 1 }
    ]
  };

  const handleStartQuiz = (matId: string) => {
    setQuizMaterialId(matId);
    setCurrentQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
  };

  const handleSubmitQuiz = () => {
    const questions = MOCK_QUIZZES[quizMaterialId!] || [];
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (currentQuizAnswers[idx] === q.correct) {
        correctCount++;
      }
    });
    
    const percentageScore = Math.round((correctCount / questions.length) * 100);
    setQuizScore(percentageScore);
    setQuizSubmitted(true);

    // Update material progress immediately!
    updateProgress(quizMaterialId!, 100, percentageScore);
    toast.success(`Quiz completed! Your score: ${percentageScore}% of complete understanding.`);
  };

  // Determine active tab from URL
  const activeTab = location.pathname.includes('/feed') ? 'feed' : 
                    location.pathname.includes('/search') ? 'search' : 
                    location.pathname.includes('/vault') ? 'vault' : 'modules';

  useEffect(() => {
    if (activeTab === 'feed' && smartFeed.length === 0 && !isLoadingFeed) {
      generateSmartFeed();
    }
  }, [activeTab]);

  const generateSmartFeed = async () => {
    setIsLoadingFeed(true);
    try {
      const prompt = `Act as an AI learning recommendation engine for an African leadership fellowship.
      Based on a user who has completed modules in "Leadership" and "Governance", is interested in "Tech Entrepreneurship", and engages mostly with "Videos" and "Case Studies", suggest 4 highly relevant learning resources.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                type: { type: Type.STRING, description: "Article, Video, or Case Study" },
                time: { type: Type.STRING, description: "e.g., 5 min read or 12 mins" },
                match: { type: Type.STRING, description: "e.g., 98% Match" }
              },
              required: ["id", "title", "type", "time", "match"]
            }
          }
        }
      });

      const data = JSON.parse(response.text || '[]');
      setSmartFeed(data);
    } catch (error) {
      console.error("Error generating smart feed:", error);
      setSmartFeed([
        { id: 'f1', title: "From 'Heroic' to Ubuntu Leadership", type: "Article", time: "5 min read", match: "98% Match" },
        { id: 'f2', title: "Case Study: Botswana's Stable Democracy", type: "Case Study", time: "15 min read", match: "95% Match" },
        { id: 'f3', title: "The Role of the African Union & RECs", type: "Video", time: "12 mins", match: "88% Match" },
        { id: 'f4', title: "Navigating Chinese Investment in Africa", type: "Article", time: "8 min read", match: "85% Match" },
      ]);
    } finally {
      setIsLoadingFeed(false);
    }
  };

  const handleGenerateSummary = async (materialTitle: string) => {
    setIsGenerating(true);
    setAiSummary('');
    try {
      const moduleContext = `
        Context for Golden Minds Africa Fellowship courses:
        - Module 1 (Leadership): Focuses on leadership vs authority vs influence. Ethics (Values-Based, Servant Leadership, Transformational, Authentic, Stakeholder-Centric). Self-assessment evaluates EQ, Decision-Making, Communication, Adaptability, Integrity.
        - Module 2 (Governance): Governance refers to decision-making systems (Authority, Legitimacy, Accountability, Performance). Covers Democracy, Autocracy, Hybrid. Institutions include Legislature, Executive, Judiciary, Independent bodies.
        - Module 3 (Ideologies & Power): Covers Liberalism, Socialism, Capitalism, African Governance (Ubuntu). Legitimacy from Traditional, Charismatic, Legal-Rational sources. Actors: State, Market, Civil Society.
        - Module 4 (Public Service & Ethics): Public Servants handle policy, delivery, advisory, oversight. Ethics vs Corruption (bribery, fraud, nepotism). Accountability mechanisms like audits, oversight.
        - Module 5 (Geopolitics): Geography shapes power. Hard, Soft, Economic, Technological powers. Africa shifting from resource exporter to value chain owner via AU/AfCFTA.
        - Module 6 (Global Institutions): Roles of UN, AU, IMF, World Bank. Diplomacy involves bilateral/multilateral talks, BATNA, and shifting from Zero-Sum to Win-Win.
        - Module 7 (Policy Formulation): Policy Cycle. Evidence-based policy making. McKinsey/Bloomberg style Policy Brief templates. Real-world African policy cases.
        - Module 8 (Economics): Macroeconomic indicators (GDP, Inflation), Growth Framework (Y=C+I+G+(X-M)), and the Leadership Decision Framework for tradeoffs.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `${moduleContext}\n\nProvide a comprehensive summary and key takeaways for a learning material titled: "${materialTitle}". Focus on its relevance to the African context based on the provided module context. Keep it professional and educational.`,
      });
      setAiSummary(response.text || 'Summary could not be generated.');
    } catch (error) {
      console.error("Error generating summary:", error);
      setAiSummary('Failed to generate summary. Please try again later.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!selectedMaterial) return;
    const content = `# ${selectedMaterial.title}\n\n${selectedMaterial.description}\n\n[Simulated Material Document Content]\n`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedMaterial.title.replace(/[\s\W]+/g, '_')}.${selectedMaterial.type === 'pdf' ? 'pdf' : 'md'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleOpenMaterial = () => {
    if (!selectedMaterial) return;
    const type = (selectedMaterial.type || '').toLowerCase();
    
    if (type === 'assignment') {
      navigate('/assignments');
    } else if (type === 'video') {
      navigate(`/learning-hub/watch/${selectedMaterial.id}`);
    } else if (type === 'article' || type === 'case study' || type === 'pdf') {
      navigate(`/learning-hub/read/${selectedMaterial.id}`);
    } else {
      handleDownload();
    }
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
      {/* Left Column - Modules */}
      <div className="flex-1 space-y-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-serif mb-2 cursor-pointer hover:underline" onClick={() => navigate('/learning-hub')}>Learning Hub</h1>
          <p className="text-gray-600">Access your course materials and AI-augmented insights.</p>
        </div>

        <div className="flex gap-4 border-b border-gray-200 mb-6 overflow-x-auto hide-scrollbar">
          <button
            onClick={() => navigate('/learning-hub/modules')}
            className={`flex items-center gap-2 px-4 sm:px-6 py-4 font-medium transition-colors relative whitespace-nowrap ${
              activeTab === 'modules' ? 'text-[#ff4e00]' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <BookOpen className="w-5 h-5" /> Course Modules
            {activeTab === 'modules' && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ff4e00]" />
            )}
          </button>
          <button
            onClick={() => navigate('/learning-hub/feed')}
            className={`flex items-center gap-2 px-4 sm:px-6 py-4 font-medium transition-colors relative whitespace-nowrap ${
              activeTab === 'feed' ? 'text-[#ff4e00]' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Sparkles className="w-5 h-5" /> Smart Learning Feed
            {activeTab === 'feed' && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ff4e00]" />
            )}
          </button>
          <button
            onClick={() => navigate('/learning-hub/vault')}
            className={`flex items-center gap-2 px-4 sm:px-6 py-4 font-medium transition-colors relative whitespace-nowrap ${
              activeTab === 'vault' ? 'text-[#ff4e00]' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Bookmark className="w-5 h-5" /> Knowledge Vault
            {activeTab === 'vault' && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ff4e00]" />
            )}
          </button>
          <button
            onClick={() => navigate('/learning-hub/search')}
            className={`flex items-center gap-2 px-4 sm:px-6 py-4 font-medium transition-colors relative whitespace-nowrap ${
              activeTab === 'search' ? 'text-[#ff4e00]' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Search className="w-5 h-5" /> Search
            {activeTab === 'search' && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ff4e00]" />
            )}
          </button>
        </div>

        {(activeTab === 'modules' || activeTab === 'search') && (
          <>
            {activeTab === 'search' && (
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Search modules, topics, or materials..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#ff4e00] transition-shadow shadow-sm"
                  autoFocus
                />
              </div>
            )}

            <div className="space-y-6">
              {MOCK_MODULES.filter(mod => 
                activeTab === 'modules' || 
                mod.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                mod.materials.some(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()))
              ).map((mod) => (
                <motion.div 
                  key={mod.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
                >
                  <div className="flex items-center justify-between gap-4 mb-4 pb-2 border-b border-gray-50">
                    <h2 
                      className="text-lg sm:text-xl font-bold font-serif cursor-pointer hover:text-[#ff4e00] transition-colors flex-1"
                      onClick={() => navigate(`/learning-hub/weeks/${mod.id}`)}
                    >
                      {mod.title}
                    </h2>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] text-gray-400 font-semibold uppercase">Module Progress:</span>
                      <CircularProgress percentage={getModuleProgress(mod.id)} />
                    </div>
                  </div>
                  <div className="space-y-3">
                    {mod.materials.filter(m => activeTab === 'modules' || m.title.toLowerCase().includes(searchQuery.toLowerCase())).map((mat) => (
                      <button
                        key={mat.id}
                        onClick={() => {
                          setSelectedMaterial(mat);
                          setAiSummary('');
                        }}
                        onDoubleClick={() => {
                           if (mat.type === 'assignment') {
                             navigate('/assignments');
                           } else if (mat.type === 'video') {
                             navigate(`/learning-hub/watch/${mat.id}`);
                           } else if (mat.type === 'article' || mat.type === 'case study') {
                             navigate(`/learning-hub/read/${mat.id}`);
                           }
                        }}
                        className={`group w-full flex items-center justify-between p-4 rounded-xl transition-colors ${
                          selectedMaterial?.id === mat.id 
                            ? 'bg-[#5A5A40] text-white' 
                            : 'bg-[#f5f5f0] hover:bg-[#e5e5e0] text-gray-900'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {getMaterialStatusIcon(mat.id)}
                          {getIconForType(mat.type)}
                          <span className="font-medium text-left text-sm sm:text-base">{mat.title}</span>
                        </div>
                        <div className="flex items-center gap-4">
                           <span className="text-[10px] uppercase font-bold opacity-0 group-hover:opacity-70 transition-opacity">Double click to open</span>
                           <span className="text-xs uppercase tracking-wider font-bold opacity-70 shrink-0 ml-4">{mat.type}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'feed' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] text-white p-8 rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff4e00] opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10 max-w-2xl">
                <h2 className="text-3xl font-bold font-serif mb-4">Smart Learning Feed</h2>
                <p className="text-gray-300 mb-6">A dynamic stream of articles, videos, and case studies personalized by AI based on your interests, engagement patterns, and skill gaps.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {isLoadingFeed ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400 bg-white rounded-3xl border border-gray-200">
                  <Loader2 className="w-8 h-8 animate-spin mb-4 text-[#ff4e00]" />
                  <p className="text-sm font-medium">Curating your personalized learning feed...</p>
                </div>
              ) : (
                smartFeed.map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => {
                      setSelectedMaterial({...item, description: `Recommended for you. ${item.match}.`, type: item.type.toLowerCase()});
                      setAiSummary('');
                    }}
                    onDoubleClick={() => {
                       const itemType = item.type.toLowerCase();
                       if (itemType === 'assignment') {
                         navigate('/assignments');
                       } else if (itemType === 'video') {
                         navigate(`/learning-hub/watch/${item.id}`);
                       } else {
                         navigate(`/learning-hub/read/${item.id}`);
                       }
                    }}
                    className="group bg-white p-4 sm:p-6 rounded-3xl border border-gray-200 hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-orange-50 text-[#ff4e00] rounded-xl flex items-center justify-center shrink-0">
                        {item.type === 'Video' ? <PlayCircle className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                      </div>
                      <div>
                            <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-[#ff4e00] transition-colors">{item.title}</h3>
                            <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                              <span className="uppercase tracking-wider font-bold">{item.type}</span>
                              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {item.time}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col sm:items-end gap-2 shrink-0 sm:ml-4">
                          <div className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs font-bold flex items-center justify-center gap-1 w-fit">
                            <TrendingUp className="w-3 h-3" /> {item.match}
                          </div>
                          <span className="text-[10px] uppercase font-bold text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
                            Double click to open
                          </span>
                        </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'vault' && (
          <div className="space-y-6">
            <div className="bg-[#1a1a1a] text-white p-8 rounded-3xl relative overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff4e00] opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10 max-w-2xl">
                <h2 className="text-3xl font-serif font-bold mb-2">Knowledge Vault</h2>
                <p className="text-gray-300">Your personalized archive of bookmarked videos, high-impact policy readings, and context explanations.</p>
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text"
                placeholder="Search items in your Vault..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#ff4e00] transition-shadow shadow-sm"
              />
            </div>

            {bookmarks.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 border border-gray-100 text-center flex flex-col items-center justify-center shadow-xs">
                <Bookmark className="w-16 h-16 text-gray-200 mb-4" />
                <h3 className="text-xl font-bold text-gray-400 mb-2">Knowledge Vault is Empty</h3>
                <p className="text-gray-400 text-sm max-w-[320px] mx-auto leading-relaxed">
                  Click the bookmark icon on any material overview card or save specific video highlights to build your personal leadership playbook.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {bookmarks
                  .filter(b => b.title.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((mat) => (
                    <div
                      key={mat.id}
                      onClick={() => {
                        setSelectedMaterial(mat);
                        setAiSummary('');
                      }}
                      onDoubleClick={() => {
                        if (mat.type === 'video') {
                          navigate(`/learning-hub/watch/${mat.id}`);
                        } else {
                          navigate(`/learning-hub/read/${mat.id}`);
                        }
                      }}
                      className={`group w-full flex items-center justify-between p-4 rounded-xl transition-colors text-left cursor-pointer ${
                        selectedMaterial?.id === mat.id 
                          ? 'bg-[#5A5A40] text-white animate-pulse-subtle' 
                          : 'bg-white hover:bg-gray-50 border border-gray-100 text-gray-900 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-3 pr-4">
                        <Bookmark className="w-5 h-5 text-[#ff4e00] shrink-0 fill-current" />
                        {getIconForType(mat.type)}
                        <div>
                          <div className="font-bold text-sm sm:text-base">{mat.title}</div>
                          {mat.bookmarkedAt && (
                            <div className={`text-[10px] ${selectedMaterial?.id === mat.id ? 'text-gray-200' : 'text-gray-400'}`}>
                              Saved on {new Date(mat.bookmarkedAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <span className="text-[10px] uppercase font-bold opacity-0 group-hover:opacity-75 transition-opacity">Double click to watch/read</span>
                        <span className="text-xs uppercase tracking-wider font-bold opacity-75 shrink-0">{mat.type}</span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Column - AI Assistant & Details */}
      <div className="w-full lg:w-96 space-y-6 lg:col-span-2">
        {selectedMaterial ? (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 lg:sticky lg:top-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-50 text-[#ff4e00] rounded-xl flex items-center justify-center">
                {getIconForTypeLarge(selectedMaterial.type)}
              </div>
              <button
                onClick={() => handleToggleBookmark(selectedMaterial)}
                className={`p-3 rounded-xl border transition-colors flex items-center justify-center ${
                  bookmarks.some(b => b.id === selectedMaterial.id)
                    ? 'bg-orange-50 text-[#ff4e00] border-orange-200'
                    : 'bg-white text-gray-400 border-gray-200 hover:bg-gray-50'
                }`}
                title="Save to Knowledge Vault"
              >
                <Bookmark className={`w-5 h-5 ${bookmarks.some(b => b.id === selectedMaterial.id) ? 'fill-current text-[#ff4e00]' : ''}`} />
              </button>
            </div>
            
            <h3 className="text-xl font-bold mb-2">{selectedMaterial.title}</h3>
            <p className="text-gray-500 text-sm mb-4 uppercase tracking-wider font-bold">{selectedMaterial.type} Document</p>
            {selectedMaterial.description && (
              <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                {selectedMaterial.description}
              </p>
            )}
            
            <div className="flex gap-3 mb-6">
              <button 
                onClick={handleOpenMaterial}
                className="flex-1 py-3 bg-[#1a1a1a] text-white rounded-xl font-medium hover:bg-black transition-colors shadow-sm active:scale-95 flex items-center justify-center gap-2 text-sm"
                title={selectedMaterial.type === 'assignment' ? 'Go to Assignment' : 'Open Material'}
              >
                {selectedMaterial.type === 'assignment' ? 'View Assignment' : 
                 selectedMaterial.type.toLowerCase() === 'video' ? 'Play Video' : 
                 'Read Document'}
              </button>
              {selectedMaterial.type === 'pdf' && (
                <button 
                  onClick={handleDownload}
                  className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center active:scale-95"
                  title="Download PDF"
                >
                  <Download className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Interactive Mini Quiz section */}
            {MOCK_QUIZZES[selectedMaterial.id] && (
              <div className="border-t border-gray-100 pt-5 mt-5">
                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-orange-500" />
                  <span>Module Quick Quiz</span>
                </h4>
                {quizMaterialId !== selectedMaterial.id ? (
                  <div className="bg-orange-50/50 rounded-2xl p-4 border border-orange-100/70 text-center">
                    <p className="text-xs text-gray-600 mb-3 leading-relaxed">Test your conceptual retention of this lesson material and raise your progress!</p>
                    <button
                      onClick={() => handleStartQuiz(selectedMaterial.id)}
                      className="w-full py-2 bg-white hover:bg-orange-50 text-[#ff4e00] border border-orange-200 rounded-xl text-xs font-bold transition-colors"
                    >
                      Start Retention Quiz
                    </button>
                  </div>
                ) : (
                  <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100">
                    {quizSubmitted ? (
                      <div className="text-center">
                        <div className="w-10 h-10 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                          <CheckCircle className="w-6 h-6" />
                        </div>
                        <h5 className="font-bold text-sm text-gray-900 mb-1">Score: {quizScore}%</h5>
                        <p className="text-xs text-gray-500 mb-4">{quizScore === 100 ? "Flawless core understanding!" : "Nice effort! Feel free to retry."}</p>
                        <button
                          onClick={() => handleStartQuiz(selectedMaterial.id)}
                          className="w-full py-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-xs font-semibold"
                        >
                          Retry Quiz
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4 text-left">
                        {MOCK_QUIZZES[selectedMaterial.id].map((q, qidx) => (
                          <div key={qidx} className="space-y-1.5">
                            <p className="text-xs font-bold text-gray-700 leading-tight">{qidx + 1}. {q.q}</p>
                            <div className="space-y-1">
                              {q.options.map((opt, oidx) => (
                                <label key={oidx} className="flex items-start gap-2 p-2 rounded-lg bg-white border border-gray-100 hover:bg-gray-50 cursor-pointer text-[11px] leading-tight text-gray-600 font-medium">
                                  <input
                                    type="radio"
                                    name={`q_${selectedMaterial.id}_${qidx}`}
                                    checked={currentQuizAnswers[qidx] === oidx}
                                    onChange={() => {
                                      setCurrentQuizAnswers({...currentQuizAnswers, [qidx]: oidx});
                                    }}
                                    className="mt-0.5 text-[#ff4e00] focus:ring-[#ff4e00]"
                                  />
                                  <span>{opt}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                        <button
                          onClick={handleSubmitQuiz}
                          disabled={Object.keys(currentQuizAnswers).length !== MOCK_QUIZZES[selectedMaterial.id].length}
                          className="w-full py-2 bg-[#ff4e00] hover:bg-[#e04500] disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                        >
                          Submit Answers
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Smart Tabbed AI Study Buddy console */}
            <div className="border-t border-gray-100 pt-5 mt-5">
              <div className="flex bg-gray-100 p-1 rounded-xl mb-4">
                <button
                  type="button"
                  onClick={() => setActiveBuddyTab('chat')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    activeBuddyTab === 'chat' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <BrainCircuit className="w-3.5 h-3.5" />
                  <span>AI Study Buddy</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveBuddyTab('summary')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    activeBuddyTab === 'summary' ? 'bg-white text-[#ff4e00]' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Doc Summary</span>
                </button>
              </div>

              {activeBuddyTab === 'summary' ? (
                <div className="text-left">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Concept Digest</span>
                    {!aiSummary && !isGenerating && (
                      <button 
                        onClick={() => handleGenerateSummary(selectedMaterial.title)}
                        className="text-xs text-[#5A5A40] font-semibold hover:underline"
                      >
                        Generate Summary
                      </button>
                    )}
                  </div>

                  {isGenerating ? (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                      <Loader2 className="w-8 h-8 animate-spin mb-3 text-[#ff4e00]" />
                      <p className="text-sm">Analyzing material context...</p>
                    </div>
                  ) : aiSummary ? (
                    <div className="prose prose-sm max-w-none text-gray-700 bg-[#f5f5f0] p-4 rounded-2xl border border-gray-200">
                      <div dangerouslySetInnerHTML={{ __html: aiSummary.replace(/\n/g, '<br/>') }} />
                    </div>
                  ) : (
                    <p className="text-gray-500 text-xs bg-gray-50 p-4 rounded-xl border border-gray-100 text-center leading-relaxed">
                      Select "Generate Summary" to construct deep, AI-driven takeaways enriched with African policy context.
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-4 text-left">
                  <div className="h-64 overflow-y-auto bg-gray-50 rounded-2xl p-3 border border-gray-100 space-y-3 flex flex-col hide-scrollbar">
                    {buddyMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`max-w-[85%] rounded-2xl p-2.5 text-xs ${
                          msg.sender === 'user'
                            ? 'bg-[#5A5A40] text-white self-end rounded-tr-none'
                            : 'bg-white border border-gray-200 text-gray-800 self-start rounded-tl-none'
                        }`}
                      >
                        <strong>{msg.sender === 'user' ? 'You' : 'Buddy'}:</strong>
                        <p className="mt-0.5 leading-relaxed whitespace-pre-line">{msg.text}</p>
                      </div>
                    ))}
                    {isBuddyLoading && (
                      <div className="flex items-center gap-2 text-xs text-gray-400 self-start p-2 leading-relaxed">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#ff4e00]" />
                        <span>Formulating expert explanation...</span>
                      </div>
                    )}
                  </div>

                  {/* Suggestion Chips */}
                  <div className="flex flex-wrap gap-1">
                    <button
                      type="button"
                      onClick={() => handleSendBuddyMessage("Analyze 3 core policy risks referenced in this lesson blueprint.")}
                      className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 rounded-full text-[10px] text-gray-600 font-semibold transition-colors"
                    >
                      🔍 Policy risks
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendBuddyMessage("Explain how Ubuntu leadership philosophy reshapes this material.")}
                      className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 rounded-full text-[10px] text-gray-600 font-semibold transition-colors"
                    >
                      🌱 Ubuntu philosophy
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendBuddyMessage("Give me a 3-point briefing summary suitable for an AU committee.")}
                      className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 rounded-full text-[10px] text-gray-600 font-semibold transition-colors"
                    >
                      📝 Briefing notes
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={buddyInput}
                      onChange={(e) => setBuddyInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSendBuddyMessage();
                      }}
                      placeholder="Ask Study Buddy a question..."
                      className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#ff4e00]"
                    />
                    <button
                      type="button"
                      onClick={() => handleSendBuddyMessage()}
                      className="bg-[#1a1a1a] hover:bg-black text-white px-3 py-2 rounded-xl text-xs font-bold transition-colors"
                    >
                      Send
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center lg:sticky lg:top-6 flex flex-col items-center justify-center min-h-[300px] lg:min-h-[400px]">
            <BookOpen className="w-16 h-16 text-gray-200 mb-4" />
            <h3 className="text-xl font-bold text-gray-400 mb-2">No Material Selected</h3>
            <p className="text-gray-400 text-sm max-w-[200px]">
              Select a module material to view details, test your retention, and start conversing with your Study Buddy.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

const MASTER_CONTENT_PROMPT = `📌 ROLE
You are an elite curriculum designer, political science professor, governance strategist, and instructional designer specializing in:
- Leadership & Political Systems
- African Governance & Development
- Public Policy & Public Administration
- Geopolitics & Global Institutions
- Digital Governance & AI in Government
- Public Speaking, Influence & Crisis Leadership

You are designing content for a world-class African Leadership, Governance, and Public Policy program.
Your output must match the quality of institutions such as Harvard Kennedy School, Oxford Blavatnik School of Government, UN Leadership Training Programs, and African Union leadership initiatives.

🎯 OBJECTIVE
For the topic provided below, you must generate high-impact learning content that is:
- Deep, structured, and intellectually rigorous
- Africa-relevant (real examples, institutions, and challenges)
- Practical and applied (not just theory)
- Suitable for emerging leaders, policymakers, and executives
- Clear, engaging, and professionally formatted in pure Markdown

📚 PROFESSIONAL ARTICLE FORMAT STRUCTURE (CRITICAL FOR ARTICLES & PDFs)
If the content type is ARTICLE or PDF/DOCUMENT, you MUST strictly generate the content using this 12-point structure:

1. # TITLE
   Format: [Core Theme]: [Insight or Tension or Application]
   Make it a strong, precise, and intellectually engaging title.
2. ## EXECUTIVE SUMMARY
   A short overview (100–150 words) covering what it's about, why it matters, and the key insight.
3. ## INTRODUCTION
   Set the stage: real-world problem, global/African relevance, leading tension, and brief framing.
4. ## CORE CONCEPTS & THEORETICAL FRAMEWORKS
   Break down the intellectual foundation. Include key definitions, major theories, models, and foundational thinkers.
5. ## MAIN ANALYSIS
   The heart of the material. Structure into subsections:
   - Key Dynamics / Systems / Structures
   - How It Works in Practice
   - Strengths and Limitations
   - Comparative Perspectives (Global vs African context)
6. ## AFRICAN CONTEXT LENS 🌍
   How the concept applies in African governance systems, structural challenges, success stories, and specific country examples.
7. ## PRACTICAL APPLICATION (FROM THEORY TO ACTION)
   Show how leaders actually use this in Govt, Policy design, Diplomacy, NGOs, and Private sector.
8. ## CASE INSIGHT / REAL-WORLD EXAMPLE
   A short embedded case study: Situation, problem faced, decision made, outcome, key lesson.
9. ## KEY INSIGHTS / TAKEAWAYS
   Bullet-point summary of core lessons (5-8 points) for strategic decision-making.
10. ## DISCUSSION QUESTIONS
    3-5 high-level reflective questions promoting debate and policy reasoning.
11. ## PRACTICAL EXERCISE / APPLICATION TASK
    A real-world assignment (e.g. policy design, simulation) with instructions, context, deliverables, and evaluation criteria.
12. ## CONCLUSION
    End with a strategic reflection, future implications, or leadership call to action.

🎥 SPECIAL CONTENT RULES (OVERRIDES FOR SPECIFIC FORMATS)
Format the content according to this type rule:
- ARTICLE: Deep explanation (800–1500 words equivalent), structured academic tone using the 12-point structure above.
- VIDEO SCRIPT: Convert the core insights into a script format. Include an opening hook, teaching sections, real-world storytelling, and closing reflection.
- PDF / Document: Structured like a professional policy paper using the 12-point structure. Include text-based frameworks and tables.
- CASE STUDY: Must include Background context, Key problem, Stakeholders, Decision points, Lessons learned, and Alternative outcomes.
- ASSIGNMENT: Emphasize practical, simulation-based, and decision-oriented tasks.

🧠 STYLE GUIDELINES
- Write in an executive, academic tone. Be clear, structured, and analytical. Avoid fluff or motivational clichés.
- EXPLICIT CONNECTIONS: You MUST explicitly map the journey from Theory → Systems → Africa → Practice → Leadership Decision-Making in your prose.
- Think like a Policy advisor to a head of state or a UN strategist.

✨ MANDATORY ENHANCEMENTS (MUST INCLUDE IN ALL ARTICLES & PDFs)
You MUST include all of the following in your generated markdown:
1. **Insight Boxes:** Use blockquotes (e.g., > **Insight:** or > **Critical Definition:**) to highlight key concepts, critical definitions, or actionable advice.
2. **Comparative Tables:** Include at least one Markdown table comparing different governance models, leadership frameworks, or policy approaches.
3. **Text-Described Diagrams:** Include at least one visual framework described in text (e.g., using ASCII art, mermaid.js syntax blocks, or clear structured textual hierarchies representing a visual flow).

🚀 FINAL INSTRUCTION
👉 Focus on transforming learners into real-world leaders, not just students
👉 Every lesson must build decision-making power, analytical thinking, and leadership judgment
👉 Formatting MUST be pure Markdown so a React Markdown renderer displays it beautifully.`;

function LearningHubReader() {
  const { materialId } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let matObj = null;
    for (const mod of MOCK_MODULES) {
      const mat = mod.materials.find((m: any) => m.id === materialId);
      if (mat) {
        matObj = mat;
        break;
      }
    }

    if (matObj) {
      generateContent(matObj);
    } else {
      setContent("# Post Not Found\nThe material you are looking for does not exist.");
      setIsLoading(false);
    }
  }, [materialId]);

  const generateContent = async (item: any) => {
    setIsLoading(true);
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `${MASTER_CONTENT_PROMPT}\n\nHere is the topic you must generate your elite content for. Apply your full expertise:\n\nTOPIC TITLE: ${item.title}\nTOPIC DESCRIPTION: ${item.description}\nCONTENT TYPE RULE TO APPLY: ${item.type.toUpperCase()}`
      });
      setContent(response.text || 'Content generation returned empty.');
    } catch (e) {
      console.error(e);
      setContent("# Error generating content\nPlease check your network connection and API limits.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12 p-4 md:p-8 space-y-6">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 font-medium active:scale-95"
      >
        &larr; Back to Learning Hub
      </button>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden min-h-[50vh] relative">
        {isLoading && (
           <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
             <Loader2 className="w-12 h-12 text-[#ff4e00] animate-spin mb-4" />
             <p className="text-gray-500 font-medium">Generating Elite Level Content...</p>
             <p className="text-gray-400 text-sm mt-1">Applying African Governance Context & Academic Rigor</p>
           </div>
        )}

        <div className="p-8 md:p-12">
          <div className="flex items-center gap-3 text-sm text-gray-500 mb-6 border-b border-gray-100 pb-6 uppercase font-bold tracking-widest">
            <BookOpen className="w-4 h-4 text-[#ff4e00]" /> Reading Mode
            <span className="w-1 h-1 bg-gray-300 rounded-full mx-2"></span>
            <Clock className="w-4 h-4" /> 5-10 MIN READ
          </div>

          <div className="prose prose-lg max-w-none text-gray-800 font-serif leading-relaxed mb-12 min-h-[40vh] space-y-6 [&>p]:mb-6">
            <Markdown remarkPlugins={[remarkGfm]}>
              {content}
            </Markdown>
          </div>

          <div className="border-t border-gray-100 pt-8 mt-12 bg-gray-50/50 -mx-8 md:-mx-12 -mb-8 md:-mb-12 p-8 md:p-12">
            <h4 className="font-bold text-sm uppercase tracking-wider text-gray-400 mb-4">Engagement Tools</h4>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => alert('Saved to notes.')}
                className="px-6 py-3 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 active:scale-95 rounded-xl font-medium transition-all shadow-sm"
               >
                Take Notes
              </button>
              <button 
                onClick={() => toast.success('🎉 Milestone Reached! Module completed successfully. Keep up the great work!', { duration: 4000 })}
                className="px-6 py-3 bg-[#ff4e00]/10 text-[#ff4e00] hover:bg-[#ff4e00]/20 active:scale-95 border border-[#ff4e00]/20 rounded-xl font-medium transition-all shadow-sm"
               >
                Log Read Completion
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LearningHubVideoPlayer() {
  const { materialId } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('Video Lesson');
  const [description, setDescription] = useState('');
  const [scriptContent, setScriptContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [youtubeId, setYoutubeId] = useState('qp0HIF3SfI4'); // default fallback (Simon Sinek)
  const [isPlaying, setIsPlaying] = useState(false);
  const [customUrl, setCustomUrl] = useState('');

  useEffect(() => {
    let matObj = null;
    for (const mod of MOCK_MODULES) {
      const mat = mod.materials.find((m: any) => m.id === materialId);
      if (mat) {
        matObj = mat;
        setTitle(mat.title);
        setDescription(mat.description);
        if (mat.youtubeId) {
          setYoutubeId(mat.youtubeId);
        }
        break;
      }
    }

    if (!matObj) {
      const fallbacks: { [key: string]: { title: string, desc: string, yt: string } } = {
        'f3': {
          title: "The Role of the African Union & RECs",
          desc: "Understanding regional integration, trade frameworks, and continental development agencies.",
          yt: "rObeS_b0RXI"
        },
        'm1-v1': {
          title: "Introduction to Values-Based African Leadership",
          desc: "Explore core tenets of servant leadership and Ubuntu within post-colonial contexts.",
          yt: "qp0HIF3SfI4"
        },
        'm2-v1': {
          title: "Building Inclusive Governance Institutions",
          desc: "Separation of powers and building long-term democratic integrity in Africa.",
          yt: "rObeS_b0RXI"
        },
        'm3-v1': {
          title: "AfCFTA and the Future of Intra-African Trade",
          desc: "Analyzing the trade frameworks, tariff barriers, and single market dynamics.",
          yt: "SgnHOnfZZW0"
        }
      };

      const fItem = fallbacks[materialId || ''] || (materialId?.startsWith('f') ? {
        title: "Recommended Course Video Resource",
        desc: "Interactive educational lecture streamed directly to your workspace.",
        yt: "SgnHOnfZZW0"
      } : null);

      if (fItem) {
        setTitle(fItem.title);
        setDescription(fItem.desc);
        setYoutubeId(fItem.yt);
        matObj = { title: fItem.title, description: fItem.desc };
      }
    }

    if (matObj) {
      generateScript(matObj);
    } else {
      setScriptContent("# Lecture Streaming Center\nReady to stream your required course lectures. Enter any YouTube URL below to load custom materials directly in the platform.");
      setIsLoading(false);
    }
  }, [materialId]);

  const generateScript = async (item: any) => {
    setIsLoading(true);
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `${MASTER_CONTENT_PROMPT}\n\nHere is the topic you must generate your elite content for. Apply your full expertise:\n\nTOPIC TITLE: ${item.title}\nTOPIC DESCRIPTION: ${item.description}\nCONTENT TYPE RULE TO APPLY: VIDEO SCRIPT`
      });
      setScriptContent(response.text || 'Video script generation returned empty.');
    } catch (e) {
      console.error(e);
      setScriptContent("# Course Lecture Supplement\nThis video lesson is live-streamed above. Review the syllabus or take collaborative notes in the feed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomVideoLoad = (e: React.FormEvent) => {
    e.preventDefault();
    const extractedId = getYouTubeId(customUrl);
    if (extractedId) {
      setYoutubeId(extractedId);
      setIsPlaying(true);
      setTitle("Custom Video Lesson");
      setDescription("Natively streaming your custom study material directly within the Golden Minds Africa workspace.");
      toast.success("Successfully loaded custom YouTube video!");
    } else {
      toast.error("Invalid YouTube URL. Please make sure it's a valid watch link or video ID.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-12 p-4 md:p-8 space-y-6">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 font-medium active:scale-95"
      >
        &larr; Back to Learning Hub
      </button>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden group relative">
        {isLoading && (
           <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center min-h-[400px]">
             <Loader2 className="w-12 h-12 text-[#ff4e00] animate-spin mb-4" />
             <p className="text-gray-500 font-medium">Generating Video Transcript & Script...</p>
             <p className="text-gray-400 text-sm mt-1">Applying African Governance Context & Academic Rigor</p>
           </div>
        )}

        <div className="aspect-video bg-[#1a1a1a] relative flex items-center justify-center overflow-hidden">
          {isPlaying && youtubeId ? (
            <iframe
              className="w-full h-full absolute inset-0 border-0"
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="no-referrer"
            ></iframe>
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,100,0,0.15),transparent)]"></div>
              
              <div className="flex flex-col items-center justify-center z-10 p-6 text-center max-w-xl">
                <button 
                   onClick={() => {
                     setIsPlaying(true);
                     toast.success(`Natively streaming: ${title}`);
                   }}
                   className="w-20 h-20 text-[#ff4e00] hover:text-[#ff6a26] cursor-pointer hover:scale-110 active:scale-95 transition-all shadow-2xl rounded-full focus:outline-none focus:ring-4 focus:ring-orange-500/50 mb-4"
                   title="Play directly in app"
                >
                   <PlayCircle className="w-full h-full drop-shadow-lg" />
                </button>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 leading-tight drop-shadow">{title}</h3>
                <p className="text-gray-300 text-xs sm:text-sm line-clamp-2 mb-4 drop-shadow">{description || "Interactive video lecture streamed directly on the platform."}</p>
                
                <button
                  onClick={() => setIsPlaying(true)}
                  className="bg-[#ff4e00] hover:bg-[#ff6a26] text-white font-semibold px-6 py-2.5 rounded-xl hover:shadow-lg active:scale-95 transition-all flex items-center gap-2 text-sm"
                >
                  <Video className="w-4 h-4" /> Stream Video Direct
                </button>
              </div>

              <div className="absolute top-6 right-6 flex gap-3 z-10">
                <button 
                  onClick={() => {
                    toast.info(`Opening reference link on YouTube`);
                    window.open(`https://www.youtube.com/watch?v=${youtubeId}`, '_blank');
                  }}
                  className="bg-black/45 hover:bg-black/60 backdrop-blur-sm active:scale-95 text-white border border-white/20 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
                >
                  <Youtube className="w-3.5 h-3.5 text-red-500" /> Watch on YouTube &rarr;
                </button>
              </div>
            </>
          )}
        </div>

        <div className="p-8 md:p-12">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8 border-b border-gray-100 pb-8">
            <div className="space-y-2 max-w-2xl">
              <h2 className="text-2xl font-bold font-serif group-hover:text-[#ff4e00] transition-colors">{title}</h2>
              <p className="text-gray-600 leading-relaxed">
                {description}
              </p>
            </div>
            
            {/* Custom URL stream box */}
            <form onSubmit={handleCustomVideoLoad} className="bg-gray-50 border border-gray-100 rounded-2xl p-4 w-full md:w-80 shrink-0 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
                <Youtube className="w-4 h-4 text-[#ff4e00]" /> Play Any YouTube Video
              </div>
              <p className="text-xs text-gray-400">Stream specific lecture links natively in your hub.</p>
              <div className="flex gap-2">
                <input 
                  type="text"
                  placeholder="Paste URL or ID..."
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="flex-1 min-w-0 bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4e00]"
                />
                <button 
                  type="submit"
                  className="bg-gray-900 text-white hover:bg-gray-800 px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors"
                >
                  Stream
                </button>
              </div>
            </form>
          </div>

          <div className="mt-12 bg-gray-50 rounded-2xl p-8 border border-gray-100">
            <div className="flex items-center gap-3 text-sm text-gray-500 mb-6 border-b border-gray-200 pb-6 uppercase font-bold tracking-widest">
              <FileText className="w-4 h-4 text-[#ff4e00]" /> Full Video Script & Curriculum
            </div>
            <div className="prose prose-lg max-w-none text-gray-800 font-serif leading-relaxed space-y-6 [&>p]:mb-6">
              <Markdown remarkPlugins={[remarkGfm]}>
                {scriptContent}
              </Markdown>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-8 mt-12 bg-gray-50/50 -mx-8 md:-mx-12 -mb-8 md:-mb-12 p-8 md:p-12">
            <h4 className="font-bold text-sm uppercase tracking-wider text-gray-400 mb-4">Engagement Tools</h4>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => alert('Saved to notes.')}
                className="px-6 py-3 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 active:scale-95 rounded-xl font-medium transition-all shadow-sm"
               >
                Take Notes
              </button>
              <button 
                onClick={() => toast.success('🎉 Milestone Reached! Module completed successfully. Keep up the great work!', { duration: 4000 })}
                className="px-6 py-3 bg-[#ff4e00]/10 text-[#ff4e00] hover:bg-[#ff4e00]/20 active:scale-95 border border-[#ff4e00]/20 rounded-xl font-medium transition-all shadow-sm"
               >
                Mark Completed
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LearningHub() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="modules" replace />} />
      <Route path="modules" element={<LearningHubMain />} />
      <Route path="feed" element={<LearningHubMain />} />
      <Route path="search" element={<LearningHubMain />} />
      <Route path="weeks/:weekId" element={<LearningHubMain />} />
      <Route path="weeks/:weekId/:moduleId" element={<LearningHubMain />} />
      <Route path="resource/:weekId/:slug/:type" element={<LearningHubMain />} />
      <Route path="ai-summary/:materialId" element={<LearningHubMain />} />
      <Route path="ai/:contentId/insights" element={<LearningHubMain />} />
      <Route path="read/:materialId" element={<LearningHubReader />} />
      <Route path="watch/:materialId" element={<LearningHubVideoPlayer />} />
    </Routes>
  );
}
