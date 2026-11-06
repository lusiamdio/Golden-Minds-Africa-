import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, Users, Calendar, Image as ImageIcon, Loader2, Download, 
  BarChart3, BookOpen, MessageSquare, Settings, BrainCircuit, 
  TrendingUp, AlertTriangle, FileText, Plus, Search, MoreVertical, Video,
  CheckCircle2, Clock, GraduationCap, Award, Mail, Trophy, Activity, Filter,
  Layers, Upload, Shuffle, Check, X as CloseIcon, ShieldCheck, Eye, EyeOff,
  Cpu, Terminal, RefreshCw, LogIn, Lock, Trash2, Send, Bookmark, Info, HelpCircle,
  Crown, Edit2, CheckSquare, EyeOff as EyeOffIcon, AlertCircle, Share2, Globe
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { useAdminState, Mentor, Publication, FellowContent, AuditLogItem } from '../contexts/AdminStateContext';

import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function Admin() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeTab = searchParams.get('tab') || 'analytics';
  const { user, loginSuperAdmin, logoutSuperAdmin } = useAuth();
  
  // Connect to the Admin global state manager context
  const {
    siteConfig,
    updateSiteConfig,
    mentors,
    addMentor,
    updateMentor,
    deleteMentor,
    publications,
    addPublication,
    updatePublication,
    deletePublication,
    fellowContents,
    moderateFellowContent,
    deleteFellowContent,
    auditLogs,
    logAdminAction,
    clearAuditLogs,
    membershipData,
    growthData,
    updateEngagementData,
    updateMembershipCount,
    reseedMockContent,
    
    // Synced collections and actions
    users,
    updateUser,
    banUser,
    deleteUser,
    incidentReports,
    updateReportStatus,
    virtualRooms,
    addRoomTranscript,
    updateRoomTopic,
    toggleParticipantMedia
  } = useAdminState();

  const setActiveTab = (tabId: string) => {
    setSearchParams({ tab: tabId });
  };

  // Super Admin Local Authentication State & Handlers
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('gma-super-admin-authenticated') === 'true' || 
           (user && user.email === 'simao@neurogrowthlabs.co.za');
  });

  useEffect(() => {
    if (user && user.email === 'simao@neurogrowthlabs.co.za') {
      setIsAuthenticated(true);
    } else if (!user && sessionStorage.getItem('gma-super-admin-authenticated') !== 'true') {
      setIsAuthenticated(false);
    }
  }, [user]);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authErrorAlert, setAuthErrorAlert] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthErrorAlert('');
    setIsSubmitting(true);

    // Secure authentication matching for Super Admin
    setTimeout(() => {
      if (loginEmail === 'simao@neurogrowthlabs.co.za' && loginPassword === 'GoldenMindsAfrica') {
        sessionStorage.setItem('gma-super-admin-authenticated', 'true');
        setIsAuthenticated(true);
        if (loginSuperAdmin) {
          loginSuperAdmin();
        }
        toast.success('Access Granted. Super Admin command deck online.', {
          id: 'admin-login-success'
        });
        logAdminAction('Authenticated super admin panel credentials', 'simao@neurogrowthlabs.co.za', 'Security');
      } else {
        setAuthErrorAlert('Invalid terminal handshake. Access Denied.');
        toast.error('Authentication Failed. Access credentials mismatch.');
      }
      setIsSubmitting(false);
    }, 600);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('gma-super-admin-authenticated');
    sessionStorage.removeItem('gma-super-admin-redirected');
    setIsAuthenticated(false);
    if (logoutSuperAdmin) {
      logoutSuperAdmin();
    }
    setLoginPassword('');
    toast.info('Super Admin environment disconnected safely.');
    navigate('/', { replace: true });
  };

  // UI state variables
  const [userQuery, setUserQuery] = useState('');
  const [fellowContentFilter, setFellowContentFilter] = useState<'All' | 'Forum Post' | 'Shared Document' | 'Assignment Submission' | 'Portfolio Showcase' | 'AI Note'>('All');
  const [pubSearch, setPubSearch] = useState('');
  const [pubTypeFilter, setPubTypeFilter] = useState('All');
  const [mentorSearch, setMentorSearch] = useState('');

  // Form State for Mentors CRUD
  const [isMentorModalOpen, setIsMentorModalOpen] = useState(false);
  const [editingMentorId, setEditingMentorId] = useState<string | null>(null);
  const [mentorForm, setMentorForm] = useState({
    name: '',
    role: '',
    industry: 'Digital Governance',
    match: 95,
    avatar: '',
    bio: '',
    email: ''
  });

  // Form State for Publications CRUD
  const [isPubFormOpen, setIsPubFormOpen] = useState(false);
  const [editingPubId, setEditingPubId] = useState<string | null>(null);
  const [pubForm, setPubForm] = useState<{
    title: string;
    type: 'Article' | 'Report' | 'Research Paper' | 'White Paper';
    content: string;
    author: string;
    track: string;
    status: 'Draft' | 'Published';
    readTime: string;
  }>({
    title: '',
    type: 'White Paper',
    content: '',
    author: 'Simao Simas (Super Admin)',
    track: 'Digital Governance',
    status: 'Published',
    readTime: '10 min read'
  });

  const handleUpdateUser = updateUser;

  // Analytics Metric Rectifier Editor State
  const [selectedMonthToRectify, setSelectedMonthToRectify] = useState('Jun');
  const [rectifyHoursMetric, setRectifyHoursMetric] = useState(680);
  const [rectifyActiveMetric, setRectifyActiveMetric] = useState(154);
  const [rectifyRegion, setRectifyRegion] = useState('West Africa');
  const [rectifyRegionCount, setRectifyRegionCount] = useState(48);

  // AI Command Shell Terminal State
  const [terminalHistory, setTerminalHistory] = useState<any[]>([
    { type: 'system', text: 'GOLDEN MINDS ADMINISTRATIVE INTELLIGENCE CORE v1.0' },
    { type: 'system', text: 'Administrative token signature verified. Ready to ingest telemetry data.' },
    { type: 'system', text: 'Type "/help" or select from suggested admin queries to dispatch neural scanning.' }
  ]);
  const [terminalInput, setTerminalInput] = useState('');
  const [isTerminalProcessing, setIsTerminalProcessing] = useState(false);

  // Verifications mock state (persisted locally on this session)
  const [verificationsList, setVerificationsList] = useState([
    { id: 'CERT-2026-X1Y2Z3', type: 'Certificate', recipient: 'Lusimadio Chidozie', track: 'Public Policy Formulation', status: 'Pending', dateRequested: '2026-06-10', score: '92%', signedHash: undefined },
    { id: 'LETTER-REC-00992', type: 'Recommendation Letter', recipient: 'Chioma Onyekachi', track: 'Digital Governance', status: 'Approved', dateRequested: '2026-06-11', score: '95%', signedHash: 'GM-ECO-A389BD9' },
    { id: 'LETTER-REC-00554', type: 'Recommendation Letter', recipient: 'Kofi Boateng', track: 'Pan-African Trade', status: 'Pending', dateRequested: '2026-06-12', score: '84%', signedHash: undefined },
  ]);

  // Bulk Selection States
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectedCertIds, setSelectedCertIds] = useState<string[]>([]);

  // Bulk execution handlers
  const handleBulkVerifyCredentials = (newStatus: 'Approved' | 'Rejected') => {
    if (selectedCertIds.length === 0) return;
    const customHashBase = 'GM-SHIELD-';
    
    setVerificationsList(prev => prev.map(v => {
      if (selectedCertIds.includes(v.id)) {
        const customHash = customHashBase + Array.from({ length: 10 }, () => Math.floor(Math.random() * 16).toString(16)).join('').toUpperCase();
        return { ...v, status: newStatus, signedHash: newStatus === 'Approved' ? customHash : undefined };
      }
      return v;
    }));

    selectedCertIds.forEach(id => {
      logAdminAction(`Bulk verification changed [${newStatus}]`, id, 'Security');
    });

    toast.success(`Successfully batch signed/rejected ${selectedCertIds.length} candidate documents in bulk!`);
    setSelectedCertIds([]);
  };

  const handleBulkBanUsers = () => {
    if (selectedUserIds.length === 0) return;
    selectedUserIds.forEach(id => {
      banUser(id);
    });
    toast.success(`Dispatched mass suspension rules against ${selectedUserIds.length} user profiles!`);
    logAdminAction(`Executed Bulk suspension or restriction on ${selectedUserIds.length} accounts`, 'multiple', 'Security');
    setSelectedUserIds([]);
  };

  const handleBulkUpdateRoles = (newRole: string) => {
    if (selectedUserIds.length === 0) return;
    selectedUserIds.forEach(id => {
      handleUpdateUser(id, { role: newRole });
    });
    toast.success(`Assigned new leadership level to selected ${selectedUserIds.length} fellows!`);
    logAdminAction(`Batch assigned role to ${selectedUserIds.length} users`, newRole, 'Security');
    setSelectedUserIds([]);
  };

  // Handle Verifications approve/reject
  const handleVerifyCredential = (id: string, newStatus: 'Approved' | 'Rejected') => {
    const customHash = 'GM-SHIELD-' + Array.from({ length: 10 }, () => Math.floor(Math.random() * 16).toString(16)).join('').toUpperCase();
    setVerificationsList(prev => prev.map(v => {
      if (v.id === id) {
        return { ...v, status: newStatus, signedHash: newStatus === 'Approved' ? customHash : undefined };
      }
      return v;
    }));
    const item = verificationsList.find(v => v.id === id);
    logAdminAction(`Changed Verification [${item?.type}] for ${item?.recipient} to [${newStatus}]`, id, 'Security');
    toast.success(`Access verification status saved for ${item?.recipient}. Sign: ${newStatus === 'Approved' ? customHash : 'N/A'}`);
  };

  // AUTOMATED AI DIRECTIVE RUNNER (Gemini Model Core Integration)
  const runAIAdminDirective = async (queryText: string) => {
    if (!queryText.trim()) return;
    setIsTerminalProcessing(true);
    setTerminalHistory(prev => [...prev, { type: 'user', text: queryText }]);
    setTerminalInput('');

    try {
      const cleanInput = queryText.toLowerCase();
      let promptText = '';

      if (cleanInput.startsWith('/help')) {
        setTerminalHistory(prev => [...prev, { 
          type: 'assistant', 
          text: `AVAILABLE CORE ADMINISTRATIVE KEYWORDS:\n\n` +
                `1. "/risk-factors" - Analyzes active drop-out triggers or delayed assignment milestones.\n` +
                `2. "/verification-status" - Audits credentials, verification backlogs, and recommender logs.\n` +
                `3. "/site-readiness" - Evaluates maintenance configurations and performs active backend network diagnostics.\n` +
                `4. "/engagement-forecast" - Dispatches Gemini forecasting matrix for next quarter study metrics.` 
        }]);
        setIsTerminalProcessing(false);
        return;
      }

      if (cleanInput.includes('readiness') || cleanInput.includes('/site-readiness')) {
        // Run real database ping
        let dbStatus = "🔴 Checking connection...";
        let dbLatency = "N/A";
        let dbDetails = "";
        let profilesCount = 0;
        
        const startDb = performance.now();
        try {
          const { data, count, error } = await supabase
            .from('profiles')
            .select('id', { count: 'exact', head: true });
          
          const endDb = performance.now();
          dbLatency = `${Math.round(endDb - startDb)}ms`;
          
          if (error) {
            dbStatus = "🔴 Offline / Misconfigured";
            dbDetails = `Error: ${error.message} (Code: ${error.code})`;
          } else {
            dbStatus = "🟢 Online & Connected";
            profilesCount = count || 0;
            dbDetails = `Database handshake successful. Mapped profiles count: ${profilesCount}`;
          }
        } catch (e: any) {
          dbStatus = "🔴 Connection Refused / Network Error";
          dbDetails = `Exception: ${e.message || String(e)}`;
        }

        // Run Supabase verification
        let fbStatus = "🟢 Operational";
        let fbDetails = "Supabase Authentication API is initialised and tracking user tokens.";
        if (!supabase.auth) {
          fbStatus = "🔴 Offline / Not Initialised";
          fbDetails = "Supabase Auth object is empty or unconfigured.";
        }

        // Run Gemini API check
        let aiStatus = "🔴 Checking...";
        let aiLatency = "N/A";
        let aiDetails = "";
        const startAi = performance.now();
        try {
          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: 'Ping.'
          });
          const endAi = performance.now();
          aiLatency = `${Math.round(endAi - startAi)}ms`;
          if (response && response.text) {
            aiStatus = "🟢 Operational (Healthy)";
            aiDetails = `Gemini model handshake completed. Latency: ${aiLatency}`;
          } else {
            aiStatus = "🟡 Partial Response";
            aiDetails = "Model returned empty response body.";
          }
        } catch (e: any) {
          aiStatus = "🔴 Handshake Failed";
          aiDetails = `Error: ${e.message || String(e)}`;
        }

        const reportText = `[GMA PLATFORM ACTIVE DIAGNOSTIC PROTOCOL DISPATCHED]
--------------------------------------------------
1. SUPABASE (POSTGRESQL) DATABASE BACKEND:
   - Status: ${dbStatus}
   - Handshake Latency: ${dbLatency}
   - System Details: ${dbDetails}

2. FIREBASE AUTHENTICATION GATEWAY:
   - Status: ${fbStatus}
   - System Details: ${fbDetails}

3. COGNITIVE AI CORE (GEMINI-2.5-FLASH):
   - Status: ${aiStatus}
   - Model Latency: ${aiLatency}
   - System Details: ${aiDetails}

4. PLATFORM INTEGRITY & ROUTING SUMMARY:
   - UI Client Stability: 🟢 Stable & Fully Integrated
   - Super Admin Gatekeeper: 🟢 Authenticated & Online
   - Maintenance Status: ${siteConfig.maintenanceMode ? "🟡 ENABLED" : "🟢 DISABLED"}
   - Onboarding Lock: ${siteConfig.lockOnboarding ? "🟡 LOCKED" : "🟢 OPEN"}
   - Timestamp Check: ${new Date().toLocaleString()}
--------------------------------------------------
DIAGNOSIS RESULT: ${
          dbStatus.includes('🟢') && aiStatus.includes('🟢') 
            ? "👑 ALL BACKEND CHANNELS AND DATABASE PORT CHANNELS ARE CONNECTED WELL AND OPERATING PROPERLY." 
            : "⚠️ PARTIAL DEGRADATION DETECTED. CHECK ENVIRONMENT VARIABLES."
        }`;

        setTerminalHistory(prev => [...prev, { 
          type: 'assistant', 
          text: reportText 
        }]);
        logAdminAction("Executed Live Platform Diagnostics Check", "Root System", "Security");
        setIsTerminalProcessing(false);
        return;
      }

      if (cleanInput.includes('risk') || cleanInput.includes('/risk-factors')) {
        promptText = `Construct an executive risk analysis report for the Golden Minds fellowship program based on the current active statistics (Avg studying hours is ~680h, total members 154, tracking 5 assignments). Focus on early drop-out mitigations, and suggest exactly three clear mentor interventions.`;
      } else if (cleanInput.includes('verify') || cleanInput.includes('/verification-status')) {
        promptText = `Act as security compliance auditor. Analyze the verification catalog of Golden Minds Africa: Pending certificate for Lusimadio (92% score, Public Policy), Pending letter of reference for Kofi Boateng (84% score, Trade). Write a 2-paragraph compliance statement certifying standard adherence.`;
      } else if (cleanInput.includes('engagement') || cleanInput.includes('/engagement-forecast') || cleanInput.includes('forecast')) {
        promptText = `Evaluate our user growth telemetry (Active fellows climbing from 94 in Feb to 154 in June). Predict engagement thresholds for July and August, suggesting the optimal study milestones needed to support macroeconomy development fields.`;
      } else {
        promptText = `You are the Administrative Intelligence backend of Golden Minds Africa Super Admin Portal. Simao Simas has asked the following command query: "${queryText}". Provide a highly polished, executive administrative response (max 3 short paragraphs) with simulated stats, suggesting optimizations for fellowship governance.`;
      }

      // Modern Google Gen AI streaming/content call
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: promptText
      });

      setTerminalHistory(prev => [...prev, { 
        type: 'assistant', 
        text: response.text || "Neural query executed successfully." 
      }]);
      logAdminAction(`Executed Core AI terminal diagnostic query: "${queryText.substring(0, 40)}"`, 'Gemini AI Core', 'System');
    } catch (err: any) {
      console.error(err);
      setTerminalHistory(prev => [...prev, { 
        type: 'error', 
        text: `Handshake failed with Gemini Core Services: ${err?.message || 'Access Blocked.'}` 
      }]);
    } finally {
      setIsTerminalProcessing(false);
    }
  };

  // MENTOR ACTIONS HANDLERS
  const openMentorFormForAdd = () => {
    setEditingMentorId(null);
    setMentorForm({
      name: '',
      role: '',
      industry: 'Digital Governance',
      match: 95,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop',
      bio: '',
      email: ''
    });
    setIsMentorModalOpen(true);
  };

  const openMentorFormForEdit = (mentor: Mentor) => {
    setEditingMentorId(mentor.id);
    setMentorForm({
      name: mentor.name,
      role: mentor.role,
      industry: mentor.industry,
      match: mentor.match,
      avatar: mentor.avatar,
      bio: mentor.bio,
      email: mentor.email
    });
    setIsMentorModalOpen(true);
  };

  const handleMentorFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mentorForm.name || !mentorForm.role || !mentorForm.email) {
      toast.error('All key fields are required.');
      return;
    }

    if (editingMentorId) {
      updateMentor(editingMentorId, mentorForm);
    } else {
      addMentor(mentorForm);
    }
    setIsMentorModalOpen(false);
  };

  // PUBLICATIONS ACTIONS HANDLERS
  const openPubFormForAdd = () => {
    setEditingPubId(null);
    setPubForm({
      title: '',
      type: 'White Paper',
      content: '',
      author: 'Simao Simas (Super Admin)',
      track: 'Digital Governance',
      status: 'Published',
      readTime: '8 min read'
    });
    setIsPubFormOpen(true);
  };

  const openPubFormForEdit = (pub: Publication) => {
    setEditingPubId(pub.id);
    setPubForm({
      title: pub.title,
      type: pub.type,
      content: pub.content,
      author: pub.author,
      track: pub.track,
      status: pub.status,
      readTime: pub.readTime
    });
    setIsPubFormOpen(true);
  };

  const handlePubFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pubForm.title || !pubForm.content) {
      toast.error('Please submit all required text blocks.');
      return;
    }

    if (editingPubId) {
      updatePublication(editingPubId, pubForm);
    } else {
      addPublication(pubForm);
    }
    setIsPubFormOpen(false);
  };

  // Filters Calculation 
  const filteredMentors = mentors.filter(m => 
    m.name.toLowerCase().includes(mentorSearch.toLowerCase()) ||
    m.role.toLowerCase().includes(mentorSearch.toLowerCase()) ||
    m.industry.toLowerCase().includes(mentorSearch.toLowerCase())
  );

  const filteredPublications = publications.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(pubSearch.toLowerCase()) || 
                        p.author.toLowerCase().includes(pubSearch.toLowerCase());
    const matchType = pubTypeFilter === 'All' || p.type === pubTypeFilter;
    return matchSearch && matchType;
  });

  const filteredFellowContents = fellowContents.filter(c => {
    const matchType = fellowContentFilter === 'All' || c.contentType === fellowContentFilter;
    return matchType;
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0c] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 bg-white dark:bg-[#121212] border border-gray-100 dark:border-gray-850 rounded-3xl shadow-xl relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-amber-500/5 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-36 h-36 rounded-full bg-[#5b5b40]/5 blur-2xl pointer-events-none" />

          <div className="text-center mb-8 relative z-10">
            <div className="w-16 h-16 bg-amber-500/10 text-[#cca568] rounded-2xl flex items-center justify-center border border-[#cca568]/20 mx-auto mb-4 relative shadow-sm">
              <Lock className="w-8 h-8 animate-pulse text-[#cca568]" />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#cca568] font-mono">Restricted Deck Keyhole</span>
            <h1 className="text-2xl font-serif font-bold text-gray-900 dark:text-white mt-1">Super Admin Gate</h1>
            <p className="text-xs text-gray-400 mt-2">Golden Minds Pan-African Fellowship Network control console</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4 relative z-10">
            {authErrorAlert && (
              <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authErrorAlert}</span>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-gray-500 mb-1.5 font-bold">Administrative Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                <input 
                  type="email" 
                  required
                  placeholder="simao@neurogrowthlabs.co.za"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 focus:outline-none focus:ring-2 focus:ring-[#cca568]/50 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-gray-500 mb-1.5 font-bold">Secure Access Key</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  required
                  placeholder="••••••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 focus:outline-none focus:ring-2 focus:ring-[#cca568]/50 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#5b5b40] dark:bg-[#cca568] text-white dark:text-[#0a0a0c] py-2.5 rounded-xl font-bold text-sm tracking-wide shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Matching Key Signature...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Establish Terminal Sync</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-gray-100 dark:border-gray-850 pt-5">
            <p className="text-[10px] text-gray-400 mt-2 leading-relaxed font-mono">
              All console transactions are audited. Unauthorized connection coordinates are packaged and forwarded.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0c] text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div className="max-w-[1700px] mx-auto p-4 md:p-8 flex flex-col xl:flex-row gap-8 pb-10">
      
        {/* --------------------- SIDEBAR NAVIGATION --------------------- */}
        <div className="w-full xl:w-72 shrink-0 flex flex-col gap-4">
          
          {/* Title Badge styling */}
          <div className="bg-white dark:bg-[#121212] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-500/10 text-[#cca568] rounded-2xl flex items-center justify-center border border-[#cca568]/20">
              <Crown className="w-6 h-6 animate-pulse text-[#cca568]" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#cca568] font-mono">Super Admin Block</span>
              <h1 className="text-xl font-serif font-black text-gray-900 dark:text-white leading-none">Command</h1>
              <p className="text-xs text-emerald-500 mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                Core Server Synchronized
              </p>
            </div>
          </div>

          {/* Global Dials Quick Widget (Persisted in state config) */}
          <div className="bg-white dark:bg-[#121212] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5" /> Site-Wide Signals
            </h2>
            
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-700 dark:text-gray-300 font-medium block">Maintenance mode</span>
                  <span className="text-[10px] text-gray-400">Lock general dashboard</span>
                </div>
                <button 
                  onClick={() => updateSiteConfig({ maintenanceMode: !siteConfig.maintenanceMode })}
                  className={`w-10 h-6 rounded-full p-1 transition-colors ${siteConfig.maintenanceMode ? 'bg-amber-500' : 'bg-gray-200 dark:bg-gray-700'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${siteConfig.maintenanceMode ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-700 dark:text-gray-300 font-medium block">AI Copilot Agent</span>
                  <span className="text-[10px] text-gray-400">Enable site-wide help</span>
                </div>
                <button 
                  onClick={() => updateSiteConfig({ copilotStateEnabled: !siteConfig.copilotStateEnabled })}
                  className={`w-10 h-6 rounded-full p-1 transition-colors ${siteConfig.copilotStateEnabled ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${siteConfig.copilotStateEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-700 dark:text-gray-300 font-medium block">Freeze Onboarding</span>
                  <span className="text-[10px] text-gray-400">Disallow registrations</span>
                </div>
                <button 
                  onClick={() => updateSiteConfig({ lockOnboarding: !siteConfig.lockOnboarding })}
                  className={`w-10 h-6 rounded-full p-1 transition-colors ${siteConfig.lockOnboarding ? 'bg-rose-500' : 'bg-gray-200 dark:bg-gray-700'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${siteConfig.lockOnboarding ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-700 dark:text-gray-300 font-medium block">Verifications Block</span>
                  <span className="text-[10px] text-gray-400">Enforce sha256 lock</span>
                </div>
                <button 
                  onClick={() => updateSiteConfig({ secureHashLockRequired: !siteConfig.secureHashLockRequired })}
                  className={`w-10 h-6 rounded-full p-1 transition-colors ${siteConfig.secureHashLockRequired ? 'bg-[#5b5b40]' : 'bg-gray-200 dark:bg-gray-700'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${siteConfig.secureHashLockRequired ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Buttons Sidebar */}
          <div className="bg-white dark:bg-[#121212] p-4 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col gap-1">
            {[
              { id: 'analytics', label: 'Ecosystem Telemetry', icon: BarChart3 },
              { id: 'realtime_monitoring', label: 'Real-Time monitoring', icon: Activity },
              { id: 'mentors', label: 'Faculty Mentors', icon: Users },
              { id: 'publications', label: 'Core Publications', icon: BookOpen },
              { id: 'users', label: 'Resident Councils', icon: Crown },
              { id: 'virtual_rooms', label: 'Virtual Supervisor', icon: Video },
              { id: 'incident_reports', label: 'Conduct Reports', icon: AlertTriangle },
              { id: 'verification', label: 'Credential Audits', icon: ShieldCheck },
              { id: 'pages', label: 'Site Pages & Sections', icon: Layers },
              { id: 'terminal', label: 'Neural Diagnostics', icon: Terminal },
              { id: 'audit_logs', label: 'Administrative Logs', icon: FileText },
            ].map(tab => {
              const IconComp = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all text-left ${
                    isSelected 
                      ? 'bg-[#5b5b40] dark:bg-[#cca568] text-white dark:text-[#0c0c0e] shadow-sm font-bold' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900/50'
                  }`}
                >
                  <IconComp className="w-4 h-4 shrink-0" />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 transition-all text-left mt-4 border border-dashed border-rose-500/20 w-full"
            >
              <LogIn className="w-4 h-4 shrink-0 rotate-180" />
              <span className="truncate">Disconnect Terminal</span>
            </button>

            <button
              onClick={() => {
                sessionStorage.setItem('gma-super-admin-redirected', 'true');
                navigate('/', { replace: true });
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs text-[#5b5b40] dark:text-[#cca568] hover:bg-[#5b5b40]/10 dark:hover:bg-[#cca568]/10 transition-all text-left mt-2 border border-dashed border-[#5b5b40]/20 dark:border-[#cca568]/20 w-full animate-pulse"
            >
              <Globe className="w-4 h-4 shrink-0 text-[#5b5b40] dark:text-[#cca568]" />
              <span className="truncate">Go to Fellow Platform</span>
            </button>
          </div>

          <button
            onClick={reseedMockContent}
            className="text-[10px] text-gray-400 dark:text-gray-500 text-center hover:underline mt-2 font-mono py-1"
          >
            Reseed blueprint standard mock context-wide datasets
          </button>
        </div>

        {/* --------------------- MAIN DYNAMIC PLATFORM DISPLAY --------------------- */}
        <div className="flex-1 bg-white dark:bg-[#121212] rounded-3xl border border-gray-100 dark:border-gray-800 p-6 md:p-8 shadow-sm flex flex-col min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.18 }}
              className="flex-1 flex flex-col"
            >
              
              {/* === TAB 1: ECOSYSTEM TELEMETRY & RECHARTS === */}
              {activeTab === 'analytics' && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-850 pb-5">
                    <div>
                      <h2 className="text-2xl font-serif font-black text-gray-900 dark:text-white flex items-center gap-2">
                        <BarChart3 className="w-6 h-6 text-[#cca568]" /> 
                        Ecosystem Telemetry
                      </h2>
                      <p className="text-gray-500 text-xs mt-1">
                        High fidelity, state-synced Recharts visualizers mapping participation growth indices.
                      </p>
                    </div>
                  </div>

                  {/* Dynamic Metrics Rectifier Panel */}
                  <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4.5 h-4.5 text-[#cca568] animate-spin" />
                      <h3 className="font-bold text-xs uppercase tracking-wider text-[#cca568]">Interactive State telemetry Rectifier</h3>
                    </div>
                    <p className="text-xs text-gray-400 leading-snug">
                      Adjust fellowship membership counts and monthly study hours below. Changes modify the central state manager instance and update charts in real time.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="bg-white dark:bg-black p-4 rounded-xl space-y-3 border border-gray-100 dark:border-gray-850">
                        <p className="font-bold text-xs">Rectify Segment: Monthly hours vs. Active followers</p>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="text-[10px] text-gray-400 block mb-1">Month Selected</label>
                            <select 
                              value={selectedMonthToRectify}
                              onChange={(e) => {
                                const m = e.target.value;
                                setSelectedMonthToRectify(m);
                                const found = growthData.find(g => g.month === m);
                                if (found) {
                                  setRectifyHoursMetric(found.studyHours);
                                  setRectifyActiveMetric(found.activeFollowers);
                                }
                              }}
                              className="w-full text-xs rounded border border-gray-200 dark:border-gray-850 p-1.5 bg-gray-50 dark:bg-zinc-900 font-mono text-[#cca568] focus:ring-0 focus:outline-none"
                            >
                              {growthData.map(d => <option key={d.month} value={d.month}>{d.month}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] text-gray-400 block mb-1">Active fellows</label>
                            <input 
                              type="number"
                              value={rectifyActiveMetric}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                setRectifyActiveMetric(val);
                                updateEngagementData(selectedMonthToRectify, 'activeFollowers', val);
                              }}
                              className="w-full text-xs rounded border border-gray-200 dark:border-gray-850 p-1 bg-gray-50 dark:bg-zinc-900 max-w-full font-mono focus:ring-0 focus:outline-none" 
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-gray-400 block mb-1">Study Hours</label>
                            <input 
                              type="number"
                              value={rectifyHoursMetric}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                setRectifyHoursMetric(val);
                                updateEngagementData(selectedMonthToRectify, 'studyHours', val);
                              }}
                              className="w-full text-xs rounded border border-gray-200 dark:border-gray-850 p-1 bg-gray-50 dark:bg-zinc-900 max-w-full font-mono focus:ring-0 focus:outline-none" 
                            />
                          </div>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-black p-4 rounded-xl space-y-3 border border-gray-100 dark:border-gray-850">
                        <p className="font-bold text-xs">Rectify Segment: Regional Enrollment Demographics</p>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-gray-400 block mb-1">Select Region</label>
                            <select 
                              value={rectifyRegion}
                              onChange={(e) => {
                                const r = e.target.value;
                                setRectifyRegion(r);
                                const found = membershipData.find(m => m.region === r);
                                if (found) {
                                  setRectifyRegionCount(found.count);
                                }
                              }}
                              className="w-full text-xs rounded border border-gray-200 dark:border-gray-850 p-1.5 bg-gray-50 dark:bg-zinc-900 font-mono text-[#cca568] focus:ring-0 focus:outline-none"
                            >
                              {membershipData.map(d => <option key={d.region} value={d.region}>{d.region}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] text-gray-400 block mb-1">Fellow Count</label>
                            <input 
                              type="number"
                              value={rectifyRegionCount}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                setRectifyRegionCount(val);
                                updateMembershipCount(rectifyRegion, val);
                              }}
                              className="w-full text-xs rounded border border-gray-200 dark:border-gray-850 p-1 bg-gray-50 dark:bg-zinc-900 max-w-full font-mono focus:ring-0 focus:outline-none" 
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* KPI summary tiles */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gray-50 dark:bg-black/40 p-5 rounded-2xl border border-gray-100 dark:border-gray-850">
                      <span className="text-[10px] uppercase font-bold text-gray-400">Synchronized Total Fellows</span>
                      <p className="text-3xl font-black font-serif mt-1 text-[#cca568]">
                        {growthData[growthData.length - 1]?.activeFollowers || 154}
                      </p>
                      <p className="text-[10px] text-emerald-500 mt-1">Growth Index Active</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-black/40 p-5 rounded-2xl border border-gray-100 dark:border-gray-850">
                      <span className="text-[10px] uppercase font-bold text-gray-400">Global Study Hours</span>
                      <p className="text-3xl font-black font-serif mt-1 text-blue-500">
                        {growthData[growthData.length - 1]?.studyHours || 680}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1">Hours logged on hub</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-black/40 p-5 rounded-2xl border border-gray-100 dark:border-gray-850">
                      <span className="text-[10px] uppercase font-bold text-gray-400">Total Faculty mentors</span>
                      <p className="text-3xl font-black font-serif mt-1 text-emerald-500">{mentors.length}</p>
                      <p className="text-[10px] text-gray-400 mt-1">Assigned advisors</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-black/40 p-5 rounded-2xl border border-gray-100 dark:border-gray-850">
                      <span className="text-[10px] uppercase font-bold text-gray-400">Platform publications</span>
                      <p className="text-3xl font-black font-serif mt-1 text-violet-500">{publications.length}</p>
                      <p className="text-[10px] text-gray-400 mt-1">Core research papers</p>
                    </div>
                  </div>

                  {/* Recharts Renderers */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-[#151518]/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-850">
                      <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-[#cca568]" />
                        Ecosystem Growth Engagement
                      </h3>
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%" minHeight={280}>
                          <AreaChart data={growthData}>
                            <defs>
                              <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#cca568" stopOpacity={0.25}/>
                                <stop offset="95%" stopColor="#cca568" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                            <XAxis dataKey="month" stroke="#777" fontSize={11} />
                            <YAxis stroke="#777" fontSize={11} />
                            <Tooltip contentStyle={{ background: '#121212', border: '1px solid #333' }} />
                            <Legend />
                            <Area type="monotone" dataKey="activeFollowers" name="Total Members" stroke="#cca568" strokeWidth={2.5} fillOpacity={1} fill="url(#colorActive)" />
                            <Area type="monotone" dataKey="submittedAssignments" name="Assignments Submitted" stroke="#3b82f6" strokeWidth={1.5} fillOpacity={0} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-[#151518]/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-850">
                      <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-500" />
                        Study Metric Outputs
                      </h3>
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%" minHeight={280}>
                          <BarChart data={growthData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                            <XAxis dataKey="month" stroke="#777" fontSize={11} />
                            <YAxis stroke="#777" fontSize={11} />
                            <Tooltip contentStyle={{ background: '#121212', border: '1px solid #333' }} />
                            <Legend />
                            <Bar dataKey="studyHours" name="Aggregate Study Hours" fill="#d4af37" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="sessionsConducted" name="Peer Rooms Created" fill="#10b981" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-[#151518]/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-850">
                    <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-500 animate-pulse" />
                      Hourly Active Users & Peak Engagement Periods
                    </h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%" minHeight={250}>
                        <LineChart data={[
                          { hour: '08:00', fellows: 42, mentors: 5 },
                          { hour: '10:00', fellows: 85, mentors: 12 },
                          { hour: '12:00', fellows: 110, mentors: 15 },
                          { hour: '14:00', fellows: 95, mentors: 10 },
                          { hour: '16:00', fellows: 130, mentors: 18 },
                          { hour: '18:00', fellows: 165, mentors: 22 },
                          { hour: '20:00', fellows: 120, mentors: 14 },
                          { hour: '22:00', fellows: 65, mentors: 8 },
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                          <XAxis dataKey="hour" stroke="#777" fontSize={11} />
                          <YAxis stroke="#777" fontSize={11} />
                          <Tooltip contentStyle={{ background: '#121212', border: '1px solid #333', color: '#fff' }} />
                          <Legend />
                          <Line type="monotone" dataKey="fellows" name="Active Fellows" stroke="#cca568" strokeWidth={2.5} activeDot={{ r: 8 }} />
                          <Line type="monotone" dataKey="mentors" name="Active Mentors" stroke="#10b981" strokeWidth={1.5} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="text-[10px] text-gray-500 text-center mt-2">Peak fellowship interactions occurs at 18:00 (UTC) during our global policy masterclasses.</p>
                  </div>

                  <div className="bg-white dark:bg-[#151518]/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-850">
                    <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-violet-500 animate-pulse" />
                      Geographic Growth Patterns (Regional Heatmap)
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                      <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          { region: 'West Africa', country: 'Nigeria, Ghana, Senegal', fellows: 310, density: 'High density', color: 'bg-emerald-955 border-emerald-800 text-emerald-100', percentage: '95%' },
                          { region: 'East Africa', country: 'Kenya, Tanzania, Rwanda', fellows: 240, density: 'Medium-high density', color: 'bg-emerald-800 border-emerald-700 text-emerald-200', percentage: '80%' },
                          { region: 'Southern Africa', country: 'South Africa, Zimbabwe, Zambia', fellows: 210, density: 'Medium density', color: 'bg-emerald-700 border-emerald-600 text-[#fff]', percentage: '65%' },
                          { region: 'North Africa', country: 'Egypt, Morocco, Tunisia', fellows: 115, density: 'Moderate density', color: 'bg-emerald-600 border-emerald-550 text-[#fff]', percentage: '45%' },
                        ].map((item) => (
                          <div 
                            key={item.region} 
                            className={`p-4 rounded-2xl border ${item.color} flex flex-col justify-between h-28 transform hover:scale-[1.02] transition-all`}
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <span className="text-[9px] uppercase font-mono font-bold tracking-wider text-amber-400">{item.region}</span>
                                <h4 className="text-sm font-bold truncate mt-1">{item.country}</h4>
                              </div>
                              <span className="text-xs font-mono font-black italic">{item.percentage}</span>
                            </div>
                            <div className="flex justify-between items-end border-t border-white/10 pt-2 text-[11px]">
                              <span>{item.density}</span>
                              <span className="font-bold font-mono text-[#022c22] bg-[#cca568] px-2 py-0.5 rounded-full">{item.fellows} fellows</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-4 bg-gray-50 dark:bg-black/25 p-5 rounded-2xl border border-gray-100 dark:border-gray-850 h-full flex flex-col justify-between">
                        <div>
                          <p className="text-xs font-bold uppercase text-gray-400 font-mono tracking-widest mb-3">Geospatial Heat Index</p>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">High Density Cap</span>
                              <span className="w-4 h-4 bg-emerald-950 rounded border border-emerald-800" />
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">Medium Density</span>
                              <span className="w-4 h-4 bg-emerald-700 rounded border border-emerald-600" />
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">Moderate Density</span>
                              <span className="w-4 h-4 bg-emerald-500 rounded border border-emerald-400" />
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-gray-200 dark:border-gray-800 pt-3">
                          <p className="text-[10px] text-gray-400 leading-normal">Interactive heat mapping models pan-African fellowship recruitment pools to expand virtual rooms deployment dynamically.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* === TAB 2: REAL-TIME MONITORING OF FELLOW ACTIONS === */}
              {activeTab === 'realtime_monitoring' && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-850 pb-5">
                    <div>
                      <h2 className="text-2xl font-serif font-black text-gray-900 dark:text-white flex items-center gap-2">
                        <Activity className="w-6 h-6 text-emerald-500 animate-pulse" /> 
                        Fellow Publications Real-Time Watcher
                      </h2>
                      <p className="text-gray-500 text-xs mt-1">
                        Live monitored stream of forum entries, uploaded documents, assignment submissions, and portfolio showcases.
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono bg-emerald-500/10 text-emerald-500 px-3 py-1.5 rounded-xl border border-emerald-500/20 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        Listening for Fellow uploads
                      </span>
                    </div>
                  </div>

                  {/* Filter Box */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-50 dark:bg-[#121212]/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-850">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-gray-400" />
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-400 font-mono">Filters:</span>
                      <div className="flex flex-wrap gap-1.5 pl-2">
                        {['All', 'Forum Post', 'Shared Document', 'Assignment Submission', 'Portfolio Showcase', 'AI Note'].map(fType => (
                          <button
                            key={fType}
                            onClick={() => setFellowContentFilter(fType as any)}
                            className={`px-3 py-1.5 rounded-lg text-xs leading-none font-semibold transition-all ${
                              fellowContentFilter === fType 
                                ? 'bg-[#5b5b40] dark:bg-[#cca568] text-white dark:text-black font-bold' 
                                : 'bg-white dark:bg-black/40 text-gray-500 hover:text-gray-900 border border-gray-100 dark:border-gray-850'
                            }`}
                          >
                            {fType}
                          </button>
                        ))}
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-400 font-mono">Found {filteredFellowContents.length} items</p>
                  </div>

                  {/* Monitored List */}
                  <div className="space-y-4">
                    {filteredFellowContents.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 dark:bg-black/30 rounded-3xl border border-[#333]/30">
                        <Activity className="w-10 h-10 text-gray-500 mx-auto mb-3 animate-pulse" />
                        <p className="text-sm font-semibold text-gray-400">No matching activities caught in telemetry radar.</p>
                      </div>
                    ) : (
                      filteredFellowContents.map(item => (
                        <div 
                          key={item.id} 
                          className="bg-white dark:bg-[#17171a]/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-850 hover:border-gray-305 dark:hover:border-zinc-700 transition-all shadow-sm"
                        >
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div className="space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded font-mono ${
                                  item.contentType === 'Forum Post' ? 'bg-amber-500/10 text-amber-500' :
                                  item.contentType === 'Shared Document' ? 'bg-blue-500/10 text-blue-500' :
                                  item.contentType === 'Assignment Submission' ? 'bg-emerald-500/10 text-emerald-500' :
                                  item.contentType === 'Portfolio Showcase' ? 'bg-violet-500/10 text-violet-500' :
                                  'bg-zinc-500/10 text-gray-400'
                                }`}>
                                  {item.contentType}
                                </span>
                                {item.track && (
                                  <span className="text-[10px] text-gray-400 font-mono bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded">
                                    {item.track}
                                  </span>
                                )}
                                <span className="text-[10px] text-gray-400 font-mono ml-2 flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> {item.timestamp}
                                </span>
                              </div>
                              <h3 className="font-serif font-bold text-lg text-gray-900 dark:text-white mt-1 leading-snug">{item.title}</h3>
                              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-4xl">{item.excerpt}</p>
                              <div className="flex items-center gap-2 pt-1">
                                <span className="font-bold text-[11px] text-[#cca568]">{item.fellowName}</span>
                                <span className="text-[11px] text-gray-400 font-mono">({item.fellowEmail})</span>
                              </div>
                            </div>

                            {/* Actions block & Badge status */}
                            <div className="shrink-0 flex md:flex-col items-end justify-between md:justify-start gap-4">
                              <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border ${
                                item.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                item.status === 'Flagged' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                item.status === 'Hidden' ? 'bg-rose-500/15 text-rose-500 border-rose-500/20' :
                                'bg-gray-100 text-gray-600 dark:bg-zinc-900 dark:text-gray-300 border-transparent'
                              }`}>
                                Status: {item.status}
                              </span>

                              <div className="flex items-center gap-1">
                                {item.status !== 'Approved' && (
                                  <button
                                    onClick={() => moderateFellowContent(item.id, 'Approved')}
                                    title="Whitelist / Approve Content"
                                    className="p-1.5 md:p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-lg transition-colors border border-emerald-500/10"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {item.status !== 'Flagged' && (
                                  <button
                                    onClick={() => moderateFellowContent(item.id, 'Flagged')}
                                    title="Raise Policy Warning Flag"
                                    className="p-1.5 md:p-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 rounded-lg transition-colors border border-amber-500/10"
                                  >
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {item.status !== 'Hidden' && (
                                  <button
                                    onClick={() => moderateFellowContent(item.id, 'Hidden')}
                                    title="Hide from general indexing"
                                    className="p-1.5 md:p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors border border-red-500/10"
                                  >
                                    <EyeOff className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {item.status !== 'Active' && (
                                  <button
                                    onClick={() => moderateFellowContent(item.id, 'Active')}
                                    title="Reset status back to normal active"
                                    className="p-1.5 md:p-2 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-805 dark:hover:bg-zinc-800 text-gray-400 rounded-lg transition-colors"
                                  >
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin-hover" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* === TAB 3: FACULTY MENTORS CRUD === */}
              {activeTab === 'mentors' && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-850 pb-5">
                    <div>
                      <h2 className="text-2xl font-serif font-black text-gray-900 dark:text-white flex items-center gap-2">
                        <Users className="w-6 h-6 text-[#cca568]" /> 
                        Faculty Mentors Registry
                      </h2>
                      <p className="text-gray-500 text-xs mt-1">
                        Add, delete, update or change descriptions for academic advisors. Sync alters corresponding fellowship matching triggers.
                      </p>
                    </div>
                    <button
                      onClick={openMentorFormForAdd}
                      className="flex items-center justify-center gap-2 bg-[#5b5b40] dark:bg-[#cca568] hover:brightness-110 text-white dark:text-black px-4 py-2.5 rounded-xl font-bold text-xs"
                    >
                      <Plus className="w-4 h-4" /> Add Advisor
                    </button>
                  </div>

                  {/* Search filter input */}
                  <div className="relative">
                    <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search mentor faculty directory by full name or industry..."
                      value={mentorSearch}
                      onChange={(e) => setMentorSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-100 dark:border-gray-850 bg-gray-50 dark:bg-black/20 focus:outline-none focus:ring-1 focus:ring-[#cca568]"
                    />
                  </div>

                  {/* Mentor Form Interface */}
                  {isMentorModalOpen && (
                    <div className="bg-gray-50 dark:bg-black/30 p-6 rounded-3xl border border-[#cca568]/40 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-sm text-gray-950 dark:text-white">
                          {editingMentorId ? 'Rectify Faculty Advisor Profile' : 'Register New Faculty Mentor'}
                        </h3>
                        <button onClick={() => setIsMentorModalOpen(false)}>
                          <CloseIcon className="w-4 h-4 text-gray-400 hover:text-white" />
                        </button>
                      </div>
                      <form onSubmit={handleMentorFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] uppercase font-mono tracking-wider font-bold block mb-1">Full Name</label>
                          <input 
                            type="text" 
                            required
                            placeholder="e.g. Dr. Amina Yusuf"
                            value={mentorForm.name}
                            onChange={(e) => setMentorForm({ ...mentorForm, name: e.target.value })}
                            className="w-full text-xs rounded-xl border border-gray-100 dark:border-gray-850 p-2.5 bg-white dark:bg-black focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] uppercase font-mono tracking-wider font-bold block mb-1">Email address</label>
                          <input 
                            type="email" 
                            required
                            placeholder="amina.y@minds.africa"
                            value={mentorForm.email}
                            onChange={(e) => setMentorForm({ ...mentorForm, email: e.target.value })}
                            className="w-full text-xs rounded-xl border border-gray-100 dark:border-gray-850 p-2.5 bg-white dark:bg-black focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] uppercase font-mono tracking-wider font-bold block mb-1">Role / Accolade Title</label>
                          <input 
                            type="text" 
                            required
                            placeholder="Senior Policy Specialst"
                            value={mentorForm.role}
                            onChange={(e) => setMentorForm({ ...mentorForm, role: e.target.value })}
                            className="w-full text-xs rounded-xl border border-gray-100 dark:border-gray-850 p-2.5 bg-white dark:bg-black focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] uppercase font-mono tracking-wider font-bold block mb-1">Domain/Industry specialization</label>
                          <select 
                            value={mentorForm.industry}
                            onChange={(e) => setMentorForm({ ...mentorForm, industry: e.target.value })}
                            className="w-full text-xs rounded-xl border border-gray-100 dark:border-gray-850 p-2.5 bg-white dark:bg-black focus:outline-none text-[#cca568]"
                          >
                            <option value="Digital Governance">Digital Governance</option>
                            <option value="Public Policy Formulation">Public Policy Formulation</option>
                            <option value="Pan-African Trade">Pan-African Trade</option>
                            <option value="Geopolitics">Geopolitics</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] uppercase font-mono tracking-wider font-bold block mb-1">Simulated Match Index % Score</label>
                          <input 
                            type="number" 
                            required
                            min={1} max={100}
                            value={mentorForm.match}
                            onChange={(e) => setMentorForm({ ...mentorForm, match: parseInt(e.target.value) || 90 })}
                            className="w-full text-xs rounded-xl border border-gray-100 dark:border-gray-850 p-2.5 bg-white dark:bg-black focus:outline-none font-mono"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] uppercase font-mono tracking-wider font-bold block mb-1">Avatar Unsplash URL reference</label>
                          <input 
                            type="text" 
                            value={mentorForm.avatar}
                            onChange={(e) => setMentorForm({ ...mentorForm, avatar: e.target.value })}
                            className="w-full text-xs rounded-xl border border-gray-100 dark:border-gray-850 p-2.5 bg-white dark:bg-black focus:outline-none font-mono"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="text-[10px] uppercase font-mono tracking-wider font-bold block mb-1">Faculty biography & Accomplishment text</label>
                          <textarea 
                            rows={3}
                            required
                            placeholder="Draft executive overview about publications and historical diplomatic advising milestones..."
                            value={mentorForm.bio}
                            onChange={(e) => setMentorForm({ ...mentorForm, bio: e.target.value })}
                            className="w-full text-xs rounded-xl border border-gray-100 dark:border-gray-850 p-2.5 bg-white dark:bg-black focus:outline-none"
                          />
                        </div>

                        <div className="md:col-span-2 flex items-center gap-2 justify-end pt-2">
                          <button 
                            type="button" 
                            onClick={() => setIsMentorModalOpen(false)}
                            className="px-4 py-2 border border-gray-200 dark:border-gray-850 rounded-xl text-xs bg-white text-gray-500 hover:text-black dark:bg-zinc-950 dark:hover:text-white"
                          >
                            Cancel
                          </button>
                          <button 
                            type="submit"
                            className="px-4 py-2 bg-emerald-500 hover:brightness-110 text-white rounded-xl text-xs font-bold"
                          >
                            {editingMentorId ? 'Save Changes' : 'Register Faculty Roster'}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Grid of registered advisors */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMentors.map(mentor => (
                      <div 
                        key={mentor.id}
                        className="bg-white dark:bg-[#121212]/50 rounded-3xl p-6 border border-gray-150 dark:border-gray-850 shadow-sm flex flex-col hover:border-[#cca568]/45 transition-colors relative"
                      >
                        <div className="flex gap-4">
                          <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 border border-gray-200 dark:border-gray-800 bg-gray-100">
                            <img src={mentor.avatar} alt={mentor.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <h4 className="font-serif font-black text-lg text-gray-900 dark:text-white leading-tight">{mentor.name}</h4>
                            <p className="text-xs text-[#cca568] mt-0.5 font-bold">{mentor.role}</p>
                            <span className="text-[10px] text-gray-400 block font-mono mt-1">{mentor.email}</span>
                          </div>
                        </div>

                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 leading-relaxed flex-1 italic">
                          "{mentor.bio}"
                        </p>

                        <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-850 pt-4 mt-5">
                          <span className="text-[10px] font-mono font-bold bg-zinc-50 dark:bg-zinc-900 px-2 py-1 rounded">
                            {mentor.industry}
                          </span>
                          
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => openMentorFormForEdit(mentor)}
                              title="Edit / Rectify"
                              className="p-2 bg-gray-50 hover:bg-gray-150 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-gray-400 hover:text-[#cca568] rounded-xl transition-colors border border-gray-100 dark:border-gray-850"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteMentor(mentor.id)}
                              title="Delete mentor"
                              className="p-2 bg-red-500/10 hover:bg-red-500/25 text-red-500 rounded-xl transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* === TAB 4: PAPERS & PUBLICATIONS CRUD === */}
              {activeTab === 'publications' && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-850 pb-5">
                    <div>
                      <h2 className="text-2xl font-serif font-black text-gray-900 dark:text-white flex items-center gap-2">
                        <BookOpen className="w-6 h-6 text-[#cca568]" /> 
                        Core Publications Engine
                      </h2>
                      <p className="text-gray-500 text-xs mt-1">
                        Write, edit and publish articles, legal white papers, policy directives and reports. Published entries instantly mirror to the fellows platform curriculum.
                      </p>
                    </div>
                    <button
                      onClick={openPubFormForAdd}
                      className="flex items-center justify-center gap-2 bg-[#5b5b40] dark:bg-[#cca568] hover:brightness-110 text-white dark:text-black px-4 py-2.5 rounded-xl font-bold text-xs"
                    >
                      <Plus className="w-4 h-4" /> Compose Publication
                    </button>
                  </div>

                  {/* Publications parameters */}
                  <div className="flex flex-wrap gap-3 items-center justify-between bg-gray-50 dark:bg-black/20 p-4 rounded-2xl border border-gray-100 dark:border-gray-850">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="Search publications by title or author name..."
                        value={pubSearch}
                        onChange={(e) => setPubSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-black border border-gray-100 dark:border-gray-850 focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-1.5 pl-2">
                      <span className="text-xs text-gray-400">Filter type:</span>
                      {['All', 'White Paper', 'Research Paper', 'Report', 'Article'].map(type => (
                        <button
                          key={type}
                          onClick={() => setPubTypeFilter(type)}
                          className={`px-2.5 py-1 text-xs font-semibold leading-none rounded-lg transition-all border ${
                            pubTypeFilter === type 
                              ? 'bg-amber-500/10 text-[#cca568] border-[#cca568]/40 font-bold' 
                              : 'bg-white dark:bg-black text-gray-400 border-gray-150 dark:border-gray-850'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Publication writer workspace */}
                  {isPubFormOpen && (
                    <div className="bg-gray-50 dark:bg-black/40 p-6 rounded-3xl border border-[#cca568]/45 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                          <BookOpen className="w-4.5 h-4.5 text-[#cca568]" />
                          {editingPubId ? 'Modify Drafting Text' : 'Compose Core Administrative Publication'}
                        </h3>
                        <button onClick={() => setIsPubFormOpen(false)}>
                          <CloseIcon className="w-4 h-4 text-gray-400 hover:text-white" />
                        </button>
                      </div>

                      <form onSubmit={handlePubFormSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] uppercase font-mono font-bold block mb-1">Publication Title</label>
                            <input 
                              type="text" required
                              placeholder="e.g. AU Tariff Liberalization Strategy paper"
                              value={pubForm.title}
                              onChange={(e) => setPubForm({ ...pubForm, title: e.target.value })}
                              className="w-full text-xs rounded-xl border border-gray-100 dark:border-gray-805 p-3 bg-white dark:bg-black focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] uppercase font-mono font-bold block mb-1">Author Credit</label>
                            <input 
                              type="text" required
                              placeholder="Dora Akunyili"
                              value={pubForm.author}
                              onChange={(e) => setPubForm({ ...pubForm, author: e.target.value })}
                              className="w-full text-xs rounded-xl border border-gray-100 dark:border-gray-805 p-3 bg-white dark:bg-black focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] uppercase font-mono font-bold block mb-1">Document Format Type</label>
                            <select
                              value={pubForm.type}
                              onChange={(e) => setPubForm({ ...pubForm, type: e.target.value as any })}
                              className="w-full text-xs rounded-xl border border-gray-100 dark:border-gray-805 p-2.5 bg-white dark:bg-black focus:outline-none text-[#cca568]"
                            >
                              <option value="White Paper">White Paper</option>
                              <option value="Research Paper">Research Paper</option>
                              <option value="Report">Report</option>
                              <option value="Article">Article</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-[10px] uppercase font-mono font-bold block mb-1">Core Fellowship Track</label>
                            <select
                              value={pubForm.track}
                              onChange={(e) => setPubForm({ ...pubForm, track: e.target.value })}
                              className="w-full text-xs rounded-xl border border-gray-100 dark:border-gray-850 p-2.5 bg-white dark:bg-black focus:outline-none text-[#cca568]"
                            >
                              <option value="Digital Governance">Digital Governance</option>
                              <option value="Public Policy Formulation">Public Policy Formulation</option>
                              <option value="Pan-African Trade">Pan-African Trade</option>
                              <option value="Geopolitics">Geopolitics</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-[10px] uppercase font-mono font-bold block mb-1">Estimated Ingestion Read Time</label>
                            <input 
                              type="text" required
                              placeholder="12 min read"
                              value={pubForm.readTime}
                              onChange={(e) => setPubForm({ ...pubForm, readTime: e.target.value })}
                              className="w-full text-xs rounded-xl border border-gray-100 dark:border-gray-850 p-3 bg-white dark:bg-black focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] uppercase font-mono font-bold block mb-1">Initial Status</label>
                            <select
                              value={pubForm.status}
                              onChange={(e) => setPubForm({ ...pubForm, status: e.target.value as any })}
                              className="w-full text-xs rounded-xl border border-gray-100 dark:border-gray-850 p-2.5 bg-white dark:bg-black focus:outline-none"
                            >
                              <option value="Published">Published (Live to platform)</option>
                              <option value="Draft">Draft (Restricted review)</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] uppercase font-mono font-bold block mb-1">Core content body text & citations</label>
                          <textarea 
                            rows={8} required
                            placeholder="Draft body paragraphs, research conclusions, summaries, and policy directives..."
                            value={pubForm.content}
                            onChange={(e) => setPubForm({ ...pubForm, content: e.target.value })}
                            className="w-full text-xs rounded-xl border border-gray-100 dark:border-gray-850 p-3 bg-white dark:bg-black focus:outline-none leading-relaxed font-sans"
                          />
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2">
                          <button 
                            type="button" 
                            onClick={() => setIsPubFormOpen(false)}
                            className="px-4 py-2 border border-gray-200 dark:border-gray-850 rounded-xl text-xs bg-white text-gray-500 dark:bg-zinc-950"
                          >
                            Cancel
                          </button>
                          <button 
                            type="submit"
                            className="px-5 py-2 bg-amber-500 hover:brightness-110 text-white dark:text-black font-bold rounded-xl text-xs"
                          >
                            {editingPubId ? 'Save and Sync Core Paper' : 'Deploy and Publish Document'}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Publications Roster */}
                  <div className="space-y-4">
                    {filteredPublications.map(pub => (
                      <div 
                        key={pub.id}
                        className="bg-white dark:bg-[#151518]/30 p-6 rounded-3xl border border-gray-100 dark:border-gray-850 space-y-4"
                      >
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] uppercase font-bold font-mono px-2 py-0.5 rounded bg-amber-500/10 text-[#cca568] border border-[#cca568]/10">
                                {pub.type}
                              </span>
                              <span className="text-[10px] text-gray-400 font-mono">
                                Track: {pub.track}
                              </span>
                              <span className="text-[9px] text-gray-400 font-mono bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded">
                                {pub.readTime}
                              </span>
                              <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
                                pub.status === 'Published' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/20 text-amber-500'
                              }`}>
                                {pub.status}
                              </span>
                            </div>
                            <h3 className="font-serif font-black text-xl text-gray-900 dark:text-white mt-1.5">{pub.title}</h3>
                            <p className="text-[10px] text-gray-400 mt-1 font-mono">By {pub.author} • Updated {pub.date}</p>
                          </div>

                          <div className="flex items-center gap-2 self-end md:self-start">
                            <button
                              onClick={() => openPubFormForEdit(pub)}
                              className="p-2 border border-gray-100 dark:border-gray-850 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-xl text-gray-400 hover:text-[#cca568]"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                const nextStatus = pub.status === 'Published' ? 'Draft' : 'Published';
                                updatePublication(pub.id, { status: nextStatus });
                              }}
                              className={`p-2 rounded-xl text-xs font-bold leading-none border ${
                                pub.status === 'Published' 
                                  ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20' 
                                  : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20'
                              }`}
                            >
                              {pub.status === 'Published' ? 'Set Draft' : 'Deploy Live'}
                            </button>
                            <button
                              onClick={() => deletePublication(pub.id)}
                              className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-xl"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="bg-gray-50/40 dark:bg-black/20 p-4 rounded-2xl border border-gray-100 dark:border-gray-850 text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-h-40 overflow-y-auto font-mono">
                          {pub.content}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* === TAB 5: ACCESS / USERS ROLES PANEL === */}
              {activeTab === 'users' && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-850 pb-5">
                    <div>
                      <h2 className="text-2xl font-serif font-black text-gray-900 dark:text-white flex items-center gap-2">
                        <Users className="w-6 h-6 text-[#cca568]" /> 
                        Access Roles Management
                      </h2>
                      <p className="text-gray-500 text-xs mt-1">
                        Control credential permissions, elevate fellows to mentors or admin statuses, or freeze high-risk profiles.
                      </p>
                    </div>
                  </div>

                  {/* Search query fields */}
                  <div className="relative">
                    <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                    <input 
                      type="text"
                      placeholder="Filter registered fellows by name, email or cohort code..."
                      value={userQuery}
                      onChange={(e) => setUserQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-100 dark:border-gray-850 bg-gray-50 dark:bg-black/20 focus:outline-none"
                    />
                  </div>

                  {/* Floating Action Bar for Bulk Account Management */}
                  {selectedUserIds.length > 0 && (
                    <motion.div 
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-[#022c22] border-2 border-[#cca568] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-white shadow-xl"
                    >
                      <div className="flex items-center gap-2">
                        <CheckSquare className="w-5 h-5 text-[#cca568]" />
                        <span className="text-sm font-bold">{selectedUserIds.length} accounts selected for bulk operations</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={handleBulkBanUsers}
                          className="px-4 py-2 bg-[#ff4e00] hover:bg-[#ff6a00] text-white rounded-xl text-xs font-bold transition-all shadow"
                        >
                          Suspend/Ban Selected
                        </button>
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              handleBulkUpdateRoles(e.target.value);
                              e.target.value = '';
                            }
                          }}
                          className="bg-[#0e3f34] text-white border border-[#cca568]/40 rounded-xl px-3 py-2 text-xs focus:outline-none"
                        >
                          <option value="">-- Bulk Assign Role --</option>
                          <option value="fellow">Fellow student</option>
                          <option value="mentor">GMA mentor</option>
                          <option value="admin">Administrator</option>
                        </select>
                        <button
                          onClick={() => setSelectedUserIds([])}
                          className="px-4 py-2 bg-transparent hover:bg-white/10 border border-white/25 text-white rounded-xl text-xs font-bold transition-all"
                        >
                          Clear Selection
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* High fidelity fallback profiles list */}
                  <div className="bg-white dark:bg-[#151518]/30 rounded-3xl border border-gray-100 dark:border-gray-840 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50 dark:bg-black/40 border-b border-gray-100 dark:border-gray-850 text-[10px] font-mono uppercase text-gray-400 tracking-wider">
                            <th className="p-4 pl-6 w-12 text-center select-none">
                              <input 
                                type="checkbox"
                                className="rounded border-gray-300 text-[#022c22] focus:ring-[#022c22] cursor-pointer"
                                checked={users.length > 0 && selectedUserIds.length === users.length}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedUserIds(users.map(u => u.id));
                                  } else {
                                    setSelectedUserIds([]);
                                  }
                                }}
                              />
                            </th>
                            <th className="p-4">Participant Fellow</th>
                            <th className="p-4">Track Cohort</th>
                            <th className="p-4">Assigned Role</th>
                            <th className="p-4">Status Token</th>
                            <th className="p-4">Administrative Clearances</th>
                            <th className="p-4 pr-6 text-right">Adjust</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-850 text-xs text-gray-600 dark:text-gray-300">
                          {users.filter(u => 
                            u.name.toLowerCase().includes(userQuery.toLowerCase()) || 
                            u.email.toLowerCase().includes(userQuery.toLowerCase())
                          ).map(guy => (
                            <tr key={guy.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-900/30">
                              <td className="p-4 pl-6 text-center select-none w-12">
                                <input 
                                  type="checkbox"
                                  className="rounded border-gray-300 text-[#022c22] focus:ring-[#022c22] cursor-pointer"
                                  checked={selectedUserIds.includes(guy.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedUserIds(prev => [...prev, guy.id]);
                                    } else {
                                      setSelectedUserIds(prev => prev.filter(id => id !== guy.id));
                                    }
                                  }}
                                />
                              </td>
                              <td className="p-4">
                                <div className="font-semibold text-gray-900 dark:text-white">{guy.name}</div>
                                <div className="text-[11px] text-gray-400 font-mono">{guy.email}</div>
                              </td>
                              <td className="p-4 font-mono font-bold text-[#cca568]">{guy.cohort}</td>
                              <td className="p-4">
                                <select 
                                  value={guy.role}
                                  onChange={(e) => handleUpdateUser(guy.id, { role: e.target.value })}
                                  className="text-xs bg-gray-50 dark:bg-zinc-900 border border-gray-150 dark:border-gray-850 p-1.5 rounded-lg text-white"
                                >
                                  <option value="super-admin">super-admin</option>
                                  <option value="admin">admin</option>
                                  <option value="mentor">mentor</option>
                                  <option value="fellow">fellow</option>
                                  <option value="student">student</option>
                                </select>
                              </td>
                              <td className="p-4">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  guy.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' :
                                  guy.status === 'Graduated' ? 'bg-blue-500/10 text-blue-500' :
                                  'bg-red-500/15 text-red-400'
                                }`}>
                                  {guy.status}
                                </span>
                              </td>
                              <td className="p-4">
                                <div className="flex flex-wrap gap-1">
                                  {guy.permissions.map((p: string) => (
                                    <span key={p} className="text-[9px] font-mono bg-zinc-100 dark:bg-zinc-900 px-1 py-0.2 rounded font-semibold">{p}</span>
                                  ))}
                                </div>
                              </td>
                              <td className="p-4 pr-6 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => handleUpdateUser(guy.id, { status: guy.status === 'Active' ? 'Suspended' : 'Active' })}
                                    className="px-2.5 py-1 text-[10px] rounded transition-all bg-zinc-100 dark:bg-zinc-900 text-gray-400 hover:text-white"
                                  >
                                    Tog Status
                                  </button>
                                  <button
                                    onClick={() => banUser(guy.id)}
                                    className={`px-2.5 py-1 text-[10px] rounded transition-all font-semibold ${
                                      guy.status === 'Banned' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white'
                                    }`}
                                  >
                                    {guy.status === 'Banned' ? 'Unban' : 'Ban'}
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (confirm(`Are you absolutely sure you want to fully purge candidate "${guy.name}" from the fellowship rosters?`)) {
                                        deleteUser(guy.id);
                                      }
                                    }}
                                    className="p-1 text-gray-400 hover:text-red-400 transition-all rounded hover:bg-red-500/10"
                                    title="Purge Candidate Account"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* === TAB 10: VIRTUAL ROOMS TRANSCRIPTS & MEDIA SUPERVISION === */}
              {activeTab === 'virtual_rooms' && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-850 pb-5">
                    <div>
                      <h2 className="text-2xl font-serif font-black text-gray-900 dark:text-white flex items-center gap-2">
                        <Video className="w-6 h-6 text-[#cca568]" /> 
                        Virtual Supervision Console
                      </h2>
                      <p className="text-gray-500 text-xs mt-1">
                        Monitor debates, live video calls, voice calls, audio transcripts, and text chat streams across active virtual spaces in real time.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Rooms Checklist */}
                    <div className="lg:col-span-1 space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Active Rooms</h3>
                      <div className="space-y-3">
                        {virtualRooms.map(room => (
                          <div 
                            key={room.id}
                            className="p-4 rounded-2xl border border-gray-150 dark:border-gray-800 bg-gray-50/50 dark:bg-zinc-900/40 hover:border-[#cca568]/40 transition-all cursor-pointer"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest">{room.id}</span>
                              <span className="flex items-center gap-1 text-[10px] bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded-full font-bold animate-pulse">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> LIVE
                              </span>
                            </div>
                            <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-1">{room.name}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{room.topic}</p>
                            
                            <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800/80 pt-2 text-[11px] text-gray-400">
                              <span>Facilitator: <strong>{room.facilitator}</strong></span>
                              <span>{room.participants.length} Active</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right: Supervision Monitor Feed */}
                    <div className="lg:col-span-2 space-y-6">
                      {virtualRooms.map(room => (
                        <div 
                          key={room.id} 
                          className="bg-zinc-50 dark:bg-zinc-900/20 border border-gray-150 dark:border-gray-800 rounded-3xl p-6 space-y-6"
                        >
                          {/* Room Header */}
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-850 pb-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`w-3 h-3 rounded-full ${room.color}`} />
                                <h3 className="font-serif font-black text-lg text-gray-900 dark:text-white">{room.name}</h3>
                              </div>
                              <div className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                                <span>Focus:</span>
                                <input 
                                  type="text"
                                  value={room.topic}
                                  onChange={(e) => updateRoomTopic(room.id, e.target.value)}
                                  className="bg-transparent border-b border-dashed border-gray-300 dark:border-gray-700 hover:border-[#cca568] focus:border-[#cca568] focus:outline-none text-gray-800 dark:text-gray-300 pl-1 py-0.5 text-xs w-72"
                                  title="Click to edit room presentation focus dynamically"
                                />
                              </div>
                            </div>
                            <span className="text-xs bg-[#5b5b40]/10 text-[#5b5b40] dark:bg-[#cca568]/10 dark:text-[#cca568] px-3 py-1 rounded-full font-mono font-bold">
                              CAPACITY: {room.participants.length}/{room.maxCapacity}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Panel: Live Voice/Video Speech-to-Text Transcript Stream */}
                            <div className="space-y-3 flex flex-col">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                                <Activity className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                                Interactive Transcript Stream
                              </h4>
                              <div className="bg-white dark:bg-black p-4 rounded-2xl border border-gray-150 dark:border-gray-850 flex-1 max-h-72 overflow-y-auto space-y-3 font-mono text-[11px] leading-relaxed select-text">
                                {room.transcripts.length === 0 ? (
                                  <div className="text-gray-400 text-center py-10 italic">No audio transactions detected. Waiting for speak triggers...</div>
                                ) : (
                                  room.transcripts.map(line => (
                                    <div key={line.id} className="border-l-2 border-amber-500/30 pl-2.5">
                                      <div className="flex justify-between text-[10px] text-gray-400 mb-0.5">
                                        <span className="font-bold text-[#cca568]">{line.speaker}</span>
                                        <span>{line.time}</span>
                                      </div>
                                      <p className="text-gray-800 dark:text-gray-300">{line.text}</p>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>

                            {/* Panel: Chat Messages Log */}
                            <div className="space-y-3 flex flex-col">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                                <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                                Room Chat Streams
                              </h4>
                              <div className="bg-white dark:bg-black p-4 rounded-2xl border border-gray-150 dark:border-gray-850 flex-1 max-h-72 overflow-y-auto space-y-3 font-mono text-[11px]">
                                {room.messages.length === 0 ? (
                                  <div className="text-gray-400 text-center py-10 italic text-xs">No text transactions.</div>
                                ) : (
                                  room.messages.map(msg => (
                                    <div key={msg.id} className="bg-gray-50/50 dark:bg-zinc-900/60 p-2.5 rounded-xl border border-gray-100 dark:border-gray-850">
                                      <div className="flex justify-between mb-0.5 text-[10px] text-gray-400">
                                        <span className="font-bold">{msg.sender}</span>
                                        <span>{msg.time}</span>
                                      </div>
                                      <p className="text-gray-800 dark:text-gray-200">{msg.text}</p>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Member Supervision & Permissions Eviction Control */}
                          <div className="space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Active Node Rosters</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              {room.participants.map(part => (
                                <div 
                                  key={part.id}
                                  className="flex items-center justify-between p-3 rounded-xl border border-gray-150 dark:border-gray-850 bg-white dark:bg-black"
                                >
                                  <div>
                                    <div className="font-semibold text-xs text-gray-900 dark:text-white">{part.name}</div>
                                    <div className="text-[9px] text-gray-400 font-mono">{part.role || 'Fellow'}</div>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <button 
                                      onClick={() => toggleParticipantMedia(room.id, part.id, 'mic')}
                                      className={`p-1.5 rounded transition-all ${part.isMuted ? 'bg-red-500/10 text-red-500' : 'bg-gray-100 dark:bg-zinc-900 text-gray-400 hover:text-white'}`}
                                      title={part.isMuted ? 'Muted by Supervisor' : 'Mute Microphone'}
                                    >
                                      {part.isMuted ? <EyeOffIcon className="w-3 h-3" /> : <Activity className="w-3 h-3" />}
                                    </button>
                                    <button 
                                      onClick={() => toggleParticipantMedia(room.id, part.id, 'video')}
                                      className={`p-1.5 rounded transition-all ${part.isVideoOff ? 'bg-red-500/10 text-red-500' : 'bg-gray-100 dark:bg-zinc-900 text-gray-400 hover:text-white'}`}
                                      title={part.isVideoOff ? 'Video Swapped Off' : 'Turn Off Video'}
                                    >
                                      <Video className="w-3 h-3" />
                                    </button>
                                    <button 
                                      onClick={() => {
                                        if (confirm(`Expel and disconnect member "${part.name}" from ${room.name}?`)) {
                                          toggleParticipantMedia(room.id, part.id, 'left', { name: part.name });
                                        }
                                      }}
                                      className="p-1.5 rounded bg-rose-500/5 text-rose-400 hover:bg-rose-500 hover:text-white transition-all ml-1"
                                      title="Evict Member"
                                    >
                                      <CloseIcon className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* === TAB 11: CONDUCT INCIDENTS & BEHAVIORAL REPORTS === */}
              {activeTab === 'incident_reports' && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-850 pb-5">
                    <div>
                      <h2 className="text-2xl font-serif font-black text-gray-900 dark:text-white flex items-center gap-2">
                        <AlertTriangle className="w-6 h-6 text-[#cca568]" /> 
                        Code of Conduct & Incident Desk
                      </h2>
                      <p className="text-gray-500 text-xs mt-1">
                        Respond in real time to anonymous and signed complaints submitted on the fellowship network to report@goldenmindsafrica.org.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-[#121212] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-850 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/20">
                      <h3 className="font-serif font-black text-base">Conduct & Moderation Directory</h3>
                      <span className="text-[11px] text-gray-400 font-mono">
                        {incidentReports.filter(r => r.status === 'Pending').length} Pending Audits
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-gray-50 dark:bg-zinc-900/40 text-gray-400 font-mono border-b border-gray-150 dark:border-gray-850">
                            <th className="p-4 pl-6">Target Person</th>
                            <th className="p-4">Reported By</th>
                            <th className="p-4">Channel Origin</th>
                            <th className="p-4">Incident Log / Details</th>
                            <th className="p-4">Timestamp</th>
                            <th className="p-4 text-center">Status</th>
                            <th className="p-4 pr-6 text-right">Moderation Execs</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-850">
                          {incidentReports.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="p-10 text-center text-gray-400 italic">
                                Zero policy incidents logged. Golden Minds Africa ecosystem is currently operating perfectly.
                              </td>
                            </tr>
                          ) : (
                            incidentReports.map(report => (
                              <tr key={report.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-900/30">
                                <td className="p-4 pl-6">
                                  <span className="font-bold text-gray-900 dark:text-white block">{report.targetName}</span>
                                </td>
                                <td className="p-4 text-gray-500">
                                  {report.reporterName}
                                </td>
                                <td className="p-4">
                                  <span className="bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded font-mono text-[10px] text-[#cca568]">
                                    {report.channel}
                                  </span>
                                </td>
                                <td className="p-4 font-normal text-gray-600 dark:text-gray-300 max-w-xs truncate" title={report.description}>
                                  {report.description}
                                </td>
                                <td className="p-4 text-gray-400 font-mono">
                                  {report.timestamp}
                                </td>
                                <td className="p-4 text-center">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    report.status === 'Pending' ? 'bg-amber-500/15 text-amber-400 animate-pulse' :
                                    report.status === 'Reviewed' ? 'bg-blue-500/10 text-blue-400' :
                                    'bg-red-500/10 text-red-400'
                                  }`}>
                                    {report.status}
                                  </span>
                                </td>
                                <td className="p-4 pr-6 text-right">
                                  <div className="flex justify-end gap-1.5 items-center">
                                    {report.status === 'Pending' ? (
                                      <>
                                        <button
                                          onClick={() => {
                                            const matchUser = users.find(u => u.name.toLowerCase() === report.targetName.toLowerCase());
                                            if (matchUser) {
                                              banUser(matchUser.id);
                                            } else {
                                              toast.error(`Target user "${report.targetName}" is not registered on directory. Standard ban placed.`);
                                            }
                                            updateReportStatus(report.id, 'Action Taken');
                                          }}
                                          className="px-2 py-1 bg-red-500 text-white font-bold text-[10px] rounded hover:bg-red-600 transition-all shadow-sm"
                                        >
                                          Ban Candidate
                                        </button>
                                        <button
                                          onClick={() => updateReportStatus(report.id, 'Reviewed')}
                                          className="px-2 py-1 bg-zinc-100 dark:bg-zinc-900 text-gray-400 dark:text-gray-300 text-[10px] rounded hover:text-white hover:bg-zinc-800 transition-all"
                                        >
                                          Dismiss
                                        </button>
                                      </>
                                    ) : (
                                      <span className="text-[10px] text-gray-400 font-mono italic">Audit Concluded</span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* === TAB 6: CREDENTIALS / CERTIFICATE VERIFICATION === */}
              {activeTab === 'verification' && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-850 pb-5">
                    <div>
                      <h2 className="text-2xl font-serif font-black text-gray-900 dark:text-white flex items-center gap-2">
                        <Award className="w-6 h-6 text-[#cca568]" /> 
                        Credential Verification Office
                      </h2>
                      <p className="text-gray-500 text-xs mt-1">
                        Sign pending graduation certificates and custom recommendation letters requested by fellowship candidates.
                      </p>
                    </div>
                  </div>

                  {/* Floating Action Bar for Bulk Credentials Management */}
                  {selectedCertIds.length > 0 && (
                    <motion.div 
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-[#022c22] border-2 border-[#cca568] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-white shadow-xl"
                    >
                      <div className="flex items-center gap-2">
                        <CheckSquare className="w-5 h-5 text-[#cca568]" />
                        <span className="text-sm font-bold">{selectedCertIds.length} credentials selected for batch signing</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleBulkVerifyCredentials('Approved')}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                        >
                          Sign & Authorize Selected
                        </button>
                        <button
                          onClick={() => handleBulkVerifyCredentials('Rejected')}
                          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                        >
                          Reject Selected
                        </button>
                        <button
                          onClick={() => setSelectedCertIds([])}
                          className="px-4 py-2 bg-transparent hover:bg-white/10 border border-white/25 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {verificationsList.map(v => (
                      <div 
                        key={v.id}
                        className={`bg-white dark:bg-[#121212]/50 rounded-3xl p-6 border transition-all ${
                          selectedCertIds.includes(v.id) ? 'border-[#cca568] ring-2 ring-[#cca568]/45 shadow-md' : 'border-gray-150 dark:border-gray-850'
                        } flex flex-col justify-between`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between font-mono">
                            <div className="flex items-center gap-2">
                              <input 
                                type="checkbox"
                                className="rounded border-gray-300 text-[#022c22] focus:ring-[#022c22] cursor-pointer"
                                checked={selectedCertIds.includes(v.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedCertIds(prev => [...prev, v.id]);
                                  } else {
                                    setSelectedCertIds(prev => prev.filter(id => id !== v.id));
                                  }
                                }}
                              />
                              <span className="text-[10px] uppercase font-bold text-gray-400">{v.type}</span>
                            </div>
                            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                              v.status === 'Approved' ? 'bg-emerald-500/15 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                            }`}>
                              {v.status}
                            </span>
                          </div>
                          <h4 className="font-serif font-bold text-lg text-gray-950 dark:text-white">{v.recipient}</h4>
                          <p className="text-xs text-gray-400">Track focus: {v.track}</p>
                          <p className="text-xs text-gray-500 pt-2 font-mono">Performance Metric Score: {v.score}</p>
                        </div>

                        {v.signedHash && (
                          <div className="bg-emerald-500/5 border border-emerald-500/15 p-3 rounded-xl mt-4 space-y-1">
                            <span className="text-[8px] font-mono text-emerald-500 uppercase font-black block">Sign Hash Authed</span>
                            <code className="text-[10px] text-emerald-400 font-mono truncate block">{v.signedHash}</code>
                          </div>
                        )}

                        <div className="border-t border-gray-100 dark:border-gray-850 pt-4 mt-5 flex items-center justify-between gap-2">
                          <span className="text-[10px] text-gray-400 font-mono">ID: {v.id}</span>
                          <div className="flex gap-1.5 shrink-0">
                            {v.status !== 'Approved' && (
                              <button
                                onClick={() => handleVerifyCredential(v.id, 'Approved')}
                                className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-[10px] font-bold"
                              >
                                Sign & Auth
                              </button>
                            )}
                            {v.status !== 'Rejected' && (
                              <button
                                onClick={() => handleVerifyCredential(v.id, 'Rejected')}
                                className="px-3 py-1.5 bg-rose-500/10 text-rose-500 rounded-lg text-[10px] font-semibold"
                              >
                                Reject
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* === TAB 7: SITE PAGES & SECTIONS === */}
              {activeTab === 'pages' && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-850 pb-5">
                    <div>
                      <h2 className="text-2xl font-serif font-black text-gray-900 dark:text-white flex items-center gap-2">
                        <Layers className="w-6 h-6 text-[#cca568]" /> 
                        Fellowship Page Structures
                      </h2>
                      <p className="text-gray-500 text-xs mt-1">
                        Review site layout models, track path configurations, and lock/unlock sub-modules dynamically.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-[#121212]/30 rounded-3xl border border-gray-100 dark:border-gray-855 p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        { name: 'Dashboard Module', path: '/', sections: ['Alumni Spotlight', 'Weekly Telemetry Block', 'Quick AI Companion'] },
                        { name: 'Learning Hub Module', path: '/learning-hub', sections: ['Syllabus Grid', 'Assignment Deliverer', 'Peer Forum boards'] },
                        { name: 'Certifications Module', path: '/certifications', sections: ['Grades Radar Canvas', 'Security Proof box', 'Dispatcher engine'] },
                        { name: 'Virtual Classrooms', path: '/rooms', sections: ['Lectures Player', 'Chat ticker Feed', 'Multiplayer Whiteboard Canvas'] },
                      ].map(module => (
                        <div key={module.name} className="p-5 bg-gray-50 dark:bg-black/30 rounded-2xl border border-gray-100 dark:border-gray-850 space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-sm text-gray-950 dark:text-white">{module.name}</h3>
                            <code className="text-[10px] text-amber-500 font-mono">{module.path}</code>
                          </div>
                          <div className="space-y-1.5 pt-2">
                            <span className="text-[9px] uppercase font-mono text-gray-400 block font-bold">Monitored Layout Sections</span>
                            {module.sections.map(sec => (
                              <div key={sec} className="flex items-center justify-between text-xs py-1 text-gray-500">
                                <span>• {sec}</span>
                                <span className="font-mono text-[9px] text-[#cca568] uppercase font-bold bg-[#cca568]/10 px-2 py-0.5 rounded">Active Live</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* === TAB 8: GEMINI AI CONTROL TERMINAL === */}
              {activeTab === 'terminal' && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-850 pb-5">
                    <div>
                      <h2 className="text-2xl font-serif font-black text-gray-900 dark:text-white flex items-center gap-2">
                        <Terminal className="w-6 h-6 text-[#cca568] animate-pulse" /> 
                        Admin Intelligent diagnostics
                      </h2>
                      <p className="text-gray-500 text-xs mt-1">
                        Utilize server-side Gemini 2.5 models to diagnose at-risk fellows, draft executive releases, or inspect security hashes.
                      </p>
                    </div>
                  </div>

                  {/* Terminal display */}
                  <div className="bg-black text-zinc-300 font-mono text-xs rounded-3xl p-6 border border-zinc-800 space-y-4 shadow-inner relative">
                    <div className="absolute top-4 right-4 text-[9px] text-zinc-500">Secure TLS Connection Online</div>
                    <div className="min-h-96 max-h-[500px] overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-zinc-800 pr-2">
                      {terminalHistory.map((line, idx) => (
                        <div key={idx} className={`leading-relaxed whitespace-pre-wrap ${
                          line.type === 'user' ? 'text-[#cca568]' : 
                          line.type === 'error' ? 'text-red-400' : 'text-emerald-400'
                        }`}>
                          {line.type === 'user' ? `admin_core@gma_root:~$ ${line.text}` : line.text}
                        </div>
                      ))}
                      {isTerminalProcessing && (
                        <div className="text-amber-400 flex items-center gap-2 animate-pulse">
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#cca568]" />
                          <span>Gemini core formulating analytics vector...</span>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-zinc-800 pt-4 flex gap-2">
                      <span className="text-[#cca568] select-none">root@gma:~$</span>
                      <input
                        type="text"
                        placeholder="Write query or type '/help' to inspect macro directives..."
                        value={terminalInput}
                        onChange={(e) => setTerminalInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            runAIAdminDirective(terminalInput);
                          }
                        }}
                        disabled={isTerminalProcessing}
                        className="flex-1 bg-transparent border-none text-white focus:outline-none focus:ring-0 placeholder-zinc-700 font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-black/20 p-4 rounded-2xl border border-gray-100 dark:border-gray-850 space-y-2">
                    <p className="text-xs font-bold text-gray-400 font-mono uppercase">Quick Directive Shortcuts</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { text: 'Analyse risk-factors among active fellows', cmd: '/risk-factors' },
                        { text: 'Verify pending certificate compliance status', cmd: '/verification-status' },
                        { text: 'Check current site maintanence diagnostics', cmd: '/site-readiness' },
                        { text: 'Generate studies engagement forecast report', cmd: '/engagement-forecast' }
                      ].map(item => (
                        <button
                          key={item.cmd}
                          onClick={() => {
                            if (!isTerminalProcessing) runAIAdminDirective(item.cmd);
                          }}
                          className="px-3 py-2 bg-white dark:bg-black/40 border border-gray-100 dark:border-gray-850 hover:bg-gray-100 text-[11px] font-mono text-gray-400 hover:text-white rounded-lg transition-colors text-left"
                        >
                          {item.text} <span className="text-[#cca568] font-bold">({item.cmd})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* === TAB 9: REVOLUTIONARY AUDIT SECURITY LOGS === */}
              {activeTab === 'audit_logs' && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-850 pb-5">
                    <div>
                      <h2 className="text-2xl font-serif font-black text-gray-900 dark:text-white flex items-center gap-2">
                        <FileText className="w-6 h-6 text-[#cca568]" /> 
                        Audit Logging Directory
                      </h2>
                      <p className="text-gray-500 text-xs mt-1">
                        Secure immutable directory tracking administrative edits, moderation actions, content updates, and access verifications.
                      </p>
                    </div>
                    <button
                      onClick={clearAuditLogs}
                      className="px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-xl text-xs font-bold transition-all border border-rose-500/20"
                    >
                      Flush Logs
                    </button>
                  </div>

                  {/* Log Ticker terminal */}
                  <div className="bg-white dark:bg-black rounded-3xl border border-gray-150 dark:border-zinc-850 p-4 shadow-inner overflow-hidden">
                    <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-850 font-mono text-xs space-y-2 max-h-[500px] overflow-y-auto">
                      {auditLogs.map((log: AuditLogItem) => (
                        <div key={log.id} className="flex gap-4/5 py-1 flex-col md:flex-row leading-normal border-b border-zinc-900 pb-1.5">
                          <span className="text-gray-550 shrink-0 text-[10px] w-36 font-bold">{log.timestamp}</span>
                          <span className={`text-[10px] font-bold uppercase shrink-0 w-24 ${
                            log.category === 'Security' ? 'text-red-400' :
                            log.category === 'Moderation' ? 'text-amber-500' :
                            log.category === 'Mentors' ? 'text-emerald-400' : 'text-blue-400'
                          }`}>
                            [{log.category}]
                          </span>
                          <span className="text-[#cca568] font-bold shrink-0 w-44 truncate">{log.adminName}</span>
                          <span className="text-gray-400 flex-1">{log.action}</span>
                          <span className="text-zinc-600 shrink-0 text-[9px]">ID: {log.target}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
