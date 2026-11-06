import React, { useEffect, useState, useRef } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { LayoutDashboard, CalendarCheck, BookOpen, MessageSquare, Users, Mic, ShieldAlert, LogOut, X, Loader2, BrainCircuit, Image as ImageIcon, ArrowLeft, Calendar, FileText, Video, Globe, Briefcase, Cpu, Award, ShieldCheck, Database, Compass, FolderOpen, UserPlus, Mail, Lock, User, Menu, Eye, EyeOff, Diamond, Star, GraduationCap, Map, Crown, Sparkles, Sun, Moon, Search, PlayCircle, HeartHandshake } from 'lucide-react';
import QuickAIHelper from './QuickAIHelper';
import googleBigBg from '../assets/images/african_governance_bg_1781130107908.png';
import freedomFightersBg from '../assets/images/freedom_fighters_bg_1781179439940.png';
import appLogo from '../assets/images/logo.png';
import LandingPage from '../pages/LandingPage';
import FellowshipLanding from '../pages/FellowshipLanding';
import { useAdminState } from '../contexts/AdminStateContext';
import { useTheme } from '../contexts/ThemeContext';
import OnboardingTour, { startTour } from './OnboardingTour';

const AFRICAN_QUOTES = [
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Forward ever, backward never.", author: "Kwame Nkrumah" },
  { text: "Without dignity there is no liberty, without justice there is no dignity.", author: "Patrice Lumumba" },
  { text: "We must dare to invent the future.", author: "Thomas Sankara" },
  { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
  { text: "The enemies of Africa are those who exploit its resources while the people starve.", author: "Wangari Maathai" }
];

const africanGovBg = googleBigBg;

const MASTER_SEARCH_INDEX = [
  { title: "Pan-African Tele-Education System", category: "Projects", path: "/projects", query: "teleport network classes school learning digital" },
  { title: "Agritech Irrigation Drone Swarms", category: "Projects", path: "/projects", query: "farm irrigation agriculture water crops engineering" },
  { title: "Decentralized Energy Microgrid Prototype", category: "Projects", path: "/projects", query: "solar battery hardware power lights electrical sustainable" },
  { title: "Dr. Amina Diop - Public Health Advisor", category: "Mentors", path: "/mentorship", query: "health research medical government clinic" },
  { title: "Prof. Kwame Mensah - Cybersecurity Officer", category: "Mentors", path: "/mentorship", query: "tech software internet privacy hacking networking development" },
  { title: "Marie Uwase - Sustainable Agritech Lead", category: "Mentors", path: "/mentorship", query: "advisor mentor farm advisory plants land" },
  { title: "Digital Policy & Sovereignty Blueprint v2.1", category: "Knowledge Vault", path: "/knowledge", query: "sovereign policy storage cloud security" },
  { title: "Decentralized Grid Network Protocols", category: "Knowledge Vault", path: "/knowledge", query: "ethereum blockchain solar nodes microgrids" },
  { title: "AI-Augmented Agronomy Soil Report", category: "Knowledge Vault", path: "/knowledge", query: "biology farming earth organic nitrogen report" },
  { title: "Golden Minds Africa Elite Fellowship 2026", category: "Fellowships", path: "/", query: "main cohort criteria leadership program" },
  { title: "Global Showcase and Digital Portfolio", category: "Fellowships", path: "/showcase", query: "show public resume digital profile" },
  { title: "My Contribution & Membership Dues", category: "Fellowships", path: "/contributions", query: "donate donation monthly membership fee dues credits benefits r100 r50 support" },
  { title: "Pan-African Network & Collaboration Forum", category: "Fellowships", path: "/ecosystem", query: "debates publications chats forums groups" }
];

export default function Layout() {
  const { user, profile, loading, setAccessToken, loginSuperAdmin, logoutSuperAdmin, logout, isSuperAdmin } = useAuth();
  const { users } = useAdminState();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [quoteFade, setQuoteFade] = useState(true);
  const [landingView, setLandingView] = useState<'main' | 'fellowship' | 'none'>(() => {
    if (sessionStorage.getItem('gma_portal_active') === 'true') {
      return 'none';
    }
    return 'main';
  });
  
  // Theme & search states
  const { theme, toggleTheme } = useTheme();
  const [globalSearch, setGlobalSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [bypassLoading, setBypassLoading] = useState(false);
  const [showSkipLoading, setShowSkipLoading] = useState(false);

  useEffect(() => {
    let t: NodeJS.Timeout;
    if (loading && !bypassLoading) {
      t = setTimeout(() => setShowSkipLoading(true), 1200);
    }
    return () => clearTimeout(t);
  }, [loading, bypassLoading]);

  const navigate = useNavigate();
  const location = useLocation();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoggingIn) return;
    
    // Basic client-side email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setAuthError('Please enter a valid email address.');
      return;
    }

    setIsLoggingIn(true);
    setAuthError('');
    setAuthSuccess('');

    // Safety timeout: never hang the login screen more than 7s
    const loginSafetyTimer = setTimeout(() => {
      setIsLoggingIn(false);
      setAuthError('Authentication took longer than expected. Please retry or continue as guest.');
    }, 7000);

    // Check for super admin credentials
    if (authMode === 'login' && email === 'simao@neurogrowthlabs.co.za' && password === 'GoldenMindsAfrica') {
      try {
        clearTimeout(loginSafetyTimer);
        if (loginSuperAdmin) {
          loginSuperAdmin();
        }
        setAuthSuccess('Welcome back, Super Admin!');
        navigate('/admin', { replace: true });
        setIsLoggingIn(false);
        return;
      } catch (err: any) {
        clearTimeout(loginSafetyTimer);
        setAuthError(err?.message || 'Failed log in as super admin');
        setIsLoggingIn(false);
        return;
      }
    }
    
    try {
      if (authMode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name
            }
          }
        });
        if (error) throw error;
        setAuthSuccess('Registration successful! Check your inbox for a verification email or you are logged in.');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
      }
    } catch (error: any) {
      let errorMessage = error?.message || 'Unknown error';
      console.error("Auth failed:", errorMessage, error);
      setAuthError(errorMessage);
    } finally {
      clearTimeout(loginSafetyTimer);
      setIsLoggingIn(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    setAuthError('');
    
    const googleSafetyTimer = setTimeout(() => {
      setIsLoggingIn(false);
    }, 7000);

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (error: any) {
      console.error("Google login failed", error);
      setAuthError(error.message || 'Failed to sign in with Google');
    } finally {
      clearTimeout(googleSafetyTimer);
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      sessionStorage.removeItem('gma-super-admin-redirected');
      sessionStorage.removeItem('gma_portal_active');
      sessionStorage.removeItem('intended_role');
      if (logout) {
        await logout();
      } else if (logoutSuperAdmin) {
        logoutSuperAdmin();
      }
    } catch (e) {
      console.warn('Logout error:', e);
    } finally {
      setLandingView('main');
      setMobileMenuOpen(false);
      navigate('/', { replace: true });
    }
  };

  useEffect(() => {
    if (user && profile) {
      // Direct session-based redirect for Super Admin
      if ((user.email === 'simao@neurogrowthlabs.co.za' || profile.role === 'admin') && !sessionStorage.getItem('gma-super-admin-redirected')) {
        sessionStorage.setItem('gma-super-admin-redirected', 'true');
        navigate('/admin', { replace: true });
        return;
      }

      const intendedRole = sessionStorage.getItem('intended_role');
      if (intendedRole === 'admin') {
        sessionStorage.removeItem('intended_role');
        if (profile.role === 'admin') {
          if (location.pathname !== '/admin') {
            navigate('/admin', { replace: true });
          }
        }
      } else if (profile.role !== 'admin' && !localStorage.getItem('onboardingComplete') && location.pathname !== '/onboarding') {
        navigate('/onboarding', { replace: true });
      }
    }
  }, [user, profile, navigate, location]);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Quote rotation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!user) {
      interval = setInterval(() => {
        setQuoteFade(false);
        setTimeout(() => {
          setQuoteIndex((prev) => (prev + 1) % AFRICAN_QUOTES.length);
          setQuoteFade(true);
        }, 500);
      }, 6000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [user]);

  if (loading && !bypassLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#070908] text-white relative px-4">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#cca568]/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center max-w-sm text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#121e17] to-[#070b09] border border-[#d4af37]/40 flex items-center justify-center p-2.5 mb-5 shadow-[0_0_30px_rgba(212,175,55,0.2)] relative">
            <div className="absolute inset-0 rounded-2xl bg-[#d4af37]/15 animate-ping opacity-40" style={{ animationDuration: '2.5s' }} />
            <img src={appLogo} alt="Golden Minds Africa" className="w-full h-full object-contain relative z-10" />
          </div>
          <h2 className="text-xl font-serif font-bold tracking-wide text-white mb-1.5">Golden Minds Africa</h2>
          <p className="text-[11px] font-mono text-[#d4af37] tracking-wider uppercase mb-5">Continental Fellowship Network</p>
          <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden mb-4 relative">
            <div className="h-full bg-gradient-to-r from-[#d4af37] via-[#ff7f24] to-[#d4af37] animate-pulse w-3/4 rounded-full" />
          </div>
          {showSkipLoading && (
            <button
              onClick={() => setBypassLoading(true)}
              className="mt-3 text-xs text-[#cca568] hover:text-white underline transition-colors cursor-pointer"
            >
              Continue to platform &rarr;
            </button>
          )}
        </div>
      </div>
    );
  }

  // The landing page website must appear first!
  if (landingView === 'main') {
    return (
      <LandingPage 
        onEnter={() => {
          sessionStorage.setItem('gma_portal_active', 'true');
          setLandingView('none');
        }} 
        onFellowshipClick={() => setLandingView('fellowship')} 
      />
    );
  }

  if (landingView === 'fellowship') {
    return <FellowshipLanding onBack={() => setLandingView('main')} />;
  }

  if (!user) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center bg-[#050505] p-2 sm:p-4 text-white font-sans sm:py-8 overflow-y-auto relative"
        style={{
          backgroundImage: `url(${freedomFightersBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-black/60 z-0"></div>

        <button 
          onClick={() => setLandingView('main')}
          className="absolute top-6 left-6 text-white/50 hover:text-[#cca568] transition-colors flex items-center gap-2 text-sm font-medium z-20"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Profile
        </button>

        {/* Left Side Values */}
        <div className="hidden lg:flex absolute left-8 xl:left-12 top-1/2 -translate-y-1/2 flex-col gap-6 z-10 pointer-events-none drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
          <div className="flex flex-col items-start text-left">
            <ShieldCheck className="w-[20px] h-[20px] text-[#cca568] mb-1" strokeWidth={1.5} />
            <h3 className="font-bold text-[#cca568] text-[10px] uppercase tracking-widest mb-1">Integrity</h3>
            <p className="text-[10px] text-[#e5e5e5] leading-[1.3] font-medium">We lead with<br/>honesty and<br/>transparency.</p>
          </div>
          <div className="flex flex-col items-start text-left">
            <Users className="w-[20px] h-[20px] text-[#cca568] mb-1" strokeWidth={1.5} />
            <h3 className="font-bold text-[#cca568] text-[10px] uppercase tracking-widest mb-1">Service</h3>
            <p className="text-[10px] text-[#e5e5e5] leading-[1.3] font-medium">We serve our<br/>communities and<br/>our continent.</p>
          </div>
          <div className="flex flex-col items-start text-left">
            <BookOpen className="w-[20px] h-[20px] text-[#cca568] mb-1" strokeWidth={1.5} />
            <h3 className="font-bold text-[#cca568] text-[10px] uppercase tracking-widest mb-1">Knowledge</h3>
            <p className="text-[10px] text-[#e5e5e5] leading-[1.3] font-medium">We learn<br/>continuously and<br/>think critically.</p>
          </div>
          <div className="flex flex-col items-start text-left">
            <Globe className="w-[20px] h-[20px] text-[#cca568] mb-1" strokeWidth={1.5} />
            <h3 className="font-bold text-[#cca568] text-[10px] uppercase tracking-widest mb-1">Africa First</h3>
            <p className="text-[10px] text-[#e5e5e5] leading-[1.3] font-medium">We believe in<br/>Africa's potential<br/>and prosperity.</p>
          </div>
          <div className="flex flex-col items-start text-left">
            <Star className="w-[20px] h-[20px] text-[#cca568] mb-1" strokeWidth={1.5} />
            <h3 className="font-bold text-[#cca568] text-[10px] uppercase tracking-widest mb-1">Excellence</h3>
            <p className="text-[10px] text-[#e5e5e5] leading-[1.3] font-medium">We pursue the<br/>highest impact in<br/>all we do.</p>
          </div>
        </div>

        {/* Right Side Motto */}
        <div className="hidden lg:flex absolute right-8 xl:right-12 top-1/2 -translate-y-1/2 flex-col justify-center z-10 pointer-events-none max-w-[160px] drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
          <p className="text-[#cca568] text-[20px] font-serif font-bold text-right leading-[1.4]">
            Strong Minds.<br/><br/>Great Leaders.<br/><br/>Greater Africa.
          </p>
        </div>

        <div 
          className="w-full max-w-[440px] rounded-[36px] border border-[#2a2a2e] relative overflow-hidden flex flex-col pt-12 pb-12 px-6 sm:px-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] z-10 backdrop-blur-md"
        >
          {/* Background Image of the Card */}
          <div 
            className="absolute inset-0 z-0 transition-opacity"
            style={{
              backgroundImage: `url(${africanGovBg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.9
            }}
          ></div>
          
          {/* Gradient Overlays: Dark middle for form visibility, lighter top/bottom for visuals */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/95 via-45% to-black/60 z-0 pointer-events-none"></div>

          <div className="relative z-10 flex flex-col items-center h-full">
            {/* Logo */}
            <div className="w-[120px] h-[120px] mb-4 flex items-center justify-center filter drop-shadow-[0_4px_25px_rgba(255,107,0,0.4)]">
              <img src={appLogo} alt="Golden Minds Africa Logo" className="w-full h-full object-contain" />
            </div>

            {/* Heading */}
            <h1 className="text-[34px] font-bold mb-2 tracking-tight sr-only">
              <span className="text-white">Golden </span>
              <span className="text-[#ff7f24]">Minds</span>
            </h1>

            {/* Rotating Quotes */}
            <div className="h-[48px] flex items-center justify-center mb-8 px-2 text-center overflow-hidden w-full">
              <div 
                className={`transition-all duration-700 ease-in-out flex flex-col items-center justify-center ${quoteFade ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
              >
                <p className="text-[#cca568] italic text-[14px] leading-tight">"{AFRICAN_QUOTES[quoteIndex].text}"</p>
                <p className="text-[#8e8e93] text-[11px] font-bold mt-1.5 uppercase tracking-wider">— {AFRICAN_QUOTES[quoteIndex].author}</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="w-full flex bg-[#1c1c1e] rounded-[18px] mb-8 border border-white/5 relative shadow-inner overflow-hidden">
              <div 
                 className="absolute bottom-0 h-[2px] bg-[#ff7f24] transition-all duration-300 ease-out"
                 style={{ width: '50%', left: authMode === 'login' ? '0' : '50%', borderRadius: '2px' }}
              />
              <button
                onClick={() => { setAuthMode('login'); setAuthError(''); }}
                className={`flex-1 py-[14px] text-[15px] font-semibold flex items-center justify-center gap-2 relative transition-all ${authMode === 'login' ? 'text-[#ff7f24]' : 'text-[#8e8e93] hover:text-gray-300'}`}
              >
                <User className="w-[18px] h-[18px]" strokeWidth={2.5} />
                Sign In
              </button>
              <button
                onClick={() => { setAuthMode('signup'); setAuthError(''); }}
                className={`flex-1 py-[14px] text-[15px] font-semibold flex items-center justify-center gap-2 relative transition-all ${authMode === 'signup' ? 'text-[#ff7f24]' : 'text-[#8e8e93] hover:text-gray-300'}`}
              >
                <UserPlus className="w-[18px] h-[18px]" strokeWidth={2} />
                Sign Up
              </button>
            </div>

            {/* Error/Success messages */}
            {authError && (
              <div className="w-full mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-[14px] font-medium text-center backdrop-blur-md">
                {authError}
              </div>
            )}
            {authSuccess && (
              <div className="w-full mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-2xl text-green-400 text-[14px] font-medium text-center backdrop-blur-md">
                {authSuccess}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleEmailAuth} className="w-full space-y-4 mb-8">
              {authMode === 'signup' && (
                <div className="relative group">
                  <User className="w-[20px] h-[20px] absolute left-4 top-1/2 -translate-y-1/2 text-[#8e8e93] group-focus-within:text-[#ff7f24] transition-colors" strokeWidth={1.5} />
                  <input 
                    type="text" 
                    placeholder="Full Name" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-[16px] bg-[#1a1a1c] border border-white/5 rounded-[18px] text-white placeholder-[#8e8e93] focus:outline-none focus:border-[#ff7f24]/50 focus:bg-[#1f1f21] text-[15px] transition-all"
                  />
                </div>
              )}
              
              <div className="relative group">
                <Mail className="w-[20px] h-[20px] absolute left-4 top-1/2 -translate-y-1/2 text-[#8e8e93] group-focus-within:text-[#ff7f24] transition-colors" strokeWidth={1.5} />
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-[16px] bg-[#1a1a1c] border border-white/5 rounded-[18px] text-white placeholder-[#8e8e93] focus:outline-none focus:border-[#ff7f24]/50 focus:bg-[#1f1f21] text-[15px] transition-all"
                />
              </div>

              <div className="relative group">
                <Lock className="w-[20px] h-[20px] absolute left-4 top-1/2 -translate-y-1/2 text-[#8e8e93] group-focus-within:text-[#ff7f24] transition-colors" strokeWidth={1.5} />
                <input 
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-12 pr-12 py-[16px] bg-[#1a1a1c] border border-white/5 rounded-[18px] text-white placeholder-[#8e8e93] focus:outline-none focus:border-[#ff7f24]/50 focus:bg-[#1f1f21] text-[15px] transition-all"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8e8e93] hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                </button>
              </div>
              
              <button 
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-[16px] px-4 bg-gradient-to-r from-[#ff7300] to-[#ff4000] text-white text-[16px] font-bold rounded-[18px] hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-[0_4px_25px_rgba(255,107,0,0.3)] mt-4 border border-[#ff7300]/50"
              >
                {isLoggingIn ? <Loader2 className="w-5 h-5 animate-spin" /> : (authMode === 'login' ? 'Sign In' : 'Sign Up')}
              </button>
            </form>

            <div className="relative flex items-center w-full mb-6">
              <div className="flex-grow border-t border-[#2a2a2e]"></div>
              <span className="flex-shrink-0 mx-4 text-[#8e8e93] text-[13px] font-medium tracking-wide">or continue with</span>
              <div className="flex-grow border-t border-[#2a2a2e]"></div>
            </div>

            <button 
              onClick={handleGoogleLogin}
              disabled={isLoggingIn}
              type="button"
              className="w-full py-[16px] px-4 bg-white text-black text-[15px] font-bold rounded-[18px] hover:bg-gray-100 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed mb-24"
            >
              {isLoggingIn ? (
                <Loader2 className="w-5 h-5 animate-spin text-black" />
              ) : (
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-[20px] h-[20px]" />
              )}
              Continue with Google
            </button>
          </div>

          {/* Authenticaton Loading Overlay */}
          {isLoggingIn && (
            <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-2xl flex flex-col items-center justify-center border border-[#ff7f24]/20 rounded-[36px]">
              {/* Internal styling for cinematic sliding bar */}
              <style>
                {`
                  @keyframes loading-slide {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(300%); }
                  }
                  .animate-loading-slide {
                    animation: loading-slide 2s ease-in-out infinite;
                  }
                `}
              </style>

              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[50%] bg-[#ff7f24]/10 blur-[80px] rounded-full flex-shrink-0 animate-pulse pointer-events-none"></div>
              
              <div className="w-[110px] h-[110px] bg-white rounded-full p-2 mb-8 flex items-center justify-center shadow-[0_0_50px_rgba(255,107,0,0.6)] animate-pulse border border-[#ff7f24]/50 relative">
                <div className="absolute inset-0 bg-[#ff7f24]/20 rounded-full animate-ping opacity-20" style={{ animationDuration: '2s' }}></div>
                <img src={appLogo} alt="Loading Golden Minds" className="w-full h-full object-contain relative z-10 rounded-full" />
              </div>
              
              <h2 className="text-[22px] font-bold text-white mb-3 tracking-wide">Authenticating</h2>
              <p className="text-[#cca568] text-[14px] text-center max-w-[250px] leading-relaxed opacity-80">
                Establishing secure connection to the fellowship...
              </p>

              <div className="w-[160px] h-[3px] bg-white/10 mt-12 rounded-full overflow-hidden relative">
                <div className="absolute top-0 left-0 h-full w-[40%] bg-gradient-to-r from-transparent via-[#ff7f24] to-transparent animate-loading-slide"></div>
              </div>

              <button
                type="button"
                onClick={() => setIsLoggingIn(false)}
                className="mt-6 text-xs text-white/50 hover:text-white underline cursor-pointer transition-colors"
              >
                Cancel / Return
              </button>
            </div>
          )}

        </div>
      </div>
    );
  }

  const isAdminRoute = location.pathname.startsWith('/admin');

  const fellowNavItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/contributions', icon: HeartHandshake, label: 'My Contribution' },
    { to: '/notes', icon: Sparkles, label: 'AI Center' },
    { to: '/learning-hub', icon: BookOpen, label: 'Learning Hub' },
    { to: '/calendar', icon: Calendar, label: 'Smart Calendar' },
    { to: '/mentorship', icon: UserPlus, label: 'Mentors' },
    { to: '/projects', icon: Briefcase, label: 'Projects' },
    { to: '/portfolio', icon: FolderOpen, label: 'Digital Legacy' },
    { to: '/achievements', icon: Award, label: 'Achievements' },
    { to: '/rooms', icon: Video, label: 'Virtual Rooms' },
    { to: '/certifications', icon: ShieldCheck, label: 'Certifications' },
    { to: '/knowledge', icon: Database, label: 'Knowledge Vault' },
    { to: '/opportunities', icon: Compass, label: 'Opportunities' },
    { to: '/ecosystem', icon: Users, label: 'Content Ecosystem' },
    { to: '/showcase', icon: Globe, label: 'Global Showcase' },
  ];

  const currentNavItems = isSuperAdmin 
    ? [...fellowNavItems, { to: '/admin', icon: Cpu, label: 'Admin Command Center' }] 
    : fellowNavItems;

  const currentUserProfileInSync = users?.find(u => u.email?.toLowerCase() === user?.email?.toLowerCase());
  const isUserBanned = currentUserProfileInSync?.status === 'Banned';

  if (user && isUserBanned) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center bg-black p-6 text-white font-sans overflow-hidden relative"
        style={{
          backgroundImage: `url(${freedomFightersBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-black/90 backdrop-blur-md z-0" />
        
        <div className="w-full max-w-lg bg-zinc-900/80 border border-red-500/30 rounded-[32px] p-8 sm:p-10 shadow-2xl relative z-10 text-center space-y-6">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto shadow-lg animate-pulse">
            <ShieldAlert className="w-8 h-8" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-serif font-black text-white tracking-tight">Account Restricted</h1>
            <p className="text-[#cca568] font-mono text-[11px] uppercase tracking-widest font-bold">Code of Conduct Suspension</p>
          </div>
          
          <p className="text-gray-300 text-sm leading-relaxed">
            Your candidate access privileges on the <strong>Golden Minds Africa Fellowship</strong> network have been suspended due to identified violations of our community policy, terms of service, or private protocols.
          </p>
          
          <div className="bg-black/50 p-4 rounded-2xl border border-white/5 text-xs text-gray-400 leading-snug space-y-1">
            <p className="font-semibold text-gray-200">REASON: Policy Breach / Administrative Review</p>
            <p><strong>APPEALS OFFICE:</strong> report@goldenmindsafrica.org</p>
          </div>

          <button 
            onClick={handleLogout}
            className="w-full py-4 px-4 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"
          >
            <LogOut className="w-4 h-4" />
            Proceed to Log Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f0] dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 flex transition-colors duration-300">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden animate-fade-in"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 flex flex-col transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 flex items-center justify-between md:justify-start gap-3 border-b border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center rounded-full overflow-hidden bg-white shadow-sm border border-gray-100 dark:border-zinc-800">
              <img src={appLogo} alt="Golden Minds" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-lg tracking-tight text-gray-900 dark:text-white">Golden Minds</span>
          </div>
          <button 
            className="md:hidden p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg cursor-pointer"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto hide-scrollbar pb-20 md:pb-0">
          {currentNavItems.map((item) => {
            const isActive = location.pathname === item.to || (item.to === '/admin' && location.pathname.startsWith('/admin'));
            // Create specific tour tracking IDs for search, ai center, knowledge vault, and mentors
            const tourId = item.to === '/' ? 'tour-nav-dashboard' : 
                           item.to === '/notes' ? 'tour-nav-notes' :
                           item.to === '/knowledge' ? 'tour-nav-knowledge' :
                           item.to === '/mentorship' ? 'tour-nav-mentorship' : undefined;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                id={tourId}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-[#5A5A40] text-white shadow-md' 
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800/60'
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium text-sm">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          {isAdminRoute && (
            <button 
              onClick={() => { navigate('/'); setMobileMenuOpen(false); }}
              className="w-full flex items-center gap-2 px-4 py-2.5 mb-4 text-gray-700 dark:text-gray-305 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-colors border border-gray-200 dark:border-zinc-800"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-bold">Fellow Dashboard</span>
            </button>
          )}
          <div 
            onClick={() => { navigate('/profile'); setMobileMenuOpen(false); }}
            className="flex items-center gap-3 mb-4 px-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800/40 p-2 rounded-xl transition-colors"
          >
            <img src={profile?.avatar || `https://ui-avatars.com/api/?name=${profile?.name}`} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-gray-100 dark:border-zinc-800" referrerPolicy="no-referrer" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-gray-905 dark:text-white">{profile?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{profile?.role}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => { navigate('/settings'); setMobileMenuOpen(false); }}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-xs font-semibold cursor-pointer border border-gray-100 dark:border-zinc-800"
            >
              <span>Settings</span>
            </button>
            <button 
              onClick={handleLogout}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors text-xs font-semibold cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Unified Responsive Top Navigation Header Bar */}
        <header className="bg-white dark:bg-zinc-900 border-b border-gray-250 dark:border-zinc-800 px-4 md:px-8 py-3.5 flex items-center justify-between sticky top-0 z-30 transition-colors">
          {/* Mobile menu toggle button */}
          <div className="flex items-center gap-3">
            <button 
              className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="md:hidden flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden bg-white shadow-sm border border-gray-100">
                <img src={appLogo} alt="Golden Minds" className="w-full h-full object-contain" />
              </div>
              <span className="font-bold text-gray-800 dark:text-white text-sm">GMA Fellowship</span>
            </div>
          </div>

          {/* Interactive Global Search bar with live suggestions query */}
          <div ref={searchContainerRef} className="relative flex-1 max-w-lg mx-4 md:mx-0">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                id="header-search-bar"
                type="text"
                placeholder="Search projects, mentors, knowledge papers..."
                value={globalSearch}
                onChange={(e) => {
                  setGlobalSearch(e.target.value);
                  setSearchFocused(true);
                }}
                onFocus={() => setSearchFocused(true)}
                className="w-full bg-gray-50 dark:bg-zinc-805 border border-gray-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-sm text-gray-900 dark:text-zinc-100 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all font-normal"
              />
            </div>
            
            {/* Auto-suggest results block */}
            {searchFocused && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in duration-200 max-h-[360px] overflow-y-auto">
                {globalSearch.trim() === '' ? (
                  <div className="p-4 text-xs text-gray-400 dark:text-gray-500 space-y-2">
                    <p className="font-semibold uppercase tracking-wider font-mono">Recent suggestion categories</p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {['Projects', 'Mentors', 'Knowledge Vault', 'Fellowships'].map(cat => (
                        <span 
                          key={cat} 
                          onClick={() => { setGlobalSearch(cat); }}
                          className="px-2.5 py-1.5 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-950/30 cursor-pointer transition-all"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-zinc-805">
                    {(() => {
                      const query = globalSearch.toLowerCase();
                      const filtered = MASTER_SEARCH_INDEX.filter(item => 
                        item.title.toLowerCase().includes(query) || 
                        item.category.toLowerCase().includes(query) || 
                        item.query.toLowerCase().includes(query)
                      );
                      
                      if (filtered.length === 0) {
                        return (
                          <div className="p-6 text-center text-sm text-gray-405 dark:text-gray-500 font-normal">
                            No elements matched your lookup query "{globalSearch}". Try another topic.
                          </div>
                        );
                      }
                      
                      return filtered.map((item, index) => (
                        <div 
                          key={index}
                          onClick={() => {
                            setGlobalSearch('');
                            setSearchFocused(false);
                            navigate(item.path);
                          }}
                          className="p-3.5 hover:bg-amber-50/50 dark:hover:bg-zinc-800/40 cursor-pointer transition-all flex items-start justify-between gap-4"
                        >
                          <div>
                            <p className="font-serif font-bold text-sm text-gray-905 dark:text-white leading-tight">{item.title}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 leading-snug">{item.query}</p>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 text-gray-500 uppercase tracking-widest font-semibold flex-shrink-0">
                            {item.category}
                          </span>
                        </div>
                      ));
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Tools & Presets */}
          <div className="flex items-center gap-2.5">
            {/* Public Institutional Website Link */}
            <button 
              onClick={() => {
                sessionStorage.removeItem('gma_portal_active');
                setLandingView('main');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#cca568]/10 hover:bg-[#cca568]/20 text-[#cca568] rounded-xl text-xs font-semibold border border-[#cca568]/30 transition-all cursor-pointer"
              title="Return to Public Institutional Website"
            >
              <Globe className="w-3.5 h-3.5 text-[#cca568]" />
              <span className="hidden sm:inline">Website</span>
            </button>

            {/* Header Theme Switcher Toggle */}
            <button 
              id="theme-toggle-header"
              onClick={() => toggleTheme()}
              className="p-2 bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700/80 text-gray-600 dark:text-amber-400 rounded-xl transition-all cursor-pointer border border-gray-200 dark:border-zinc-700/60"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-[#5A5A40]" />}
            </button>
            
            <div 
              onClick={() => navigate('/profile')}
              className="hidden md:flex items-center gap-2.5 pl-2 border-l border-gray-200 dark:border-zinc-800 cursor-pointer hover:opacity-85 transition-opacity"
              title="View LinkedIn-Style Fellow Profile"
            >
              <img src={profile?.avatar || `https://ui-avatars.com/api/?name=${profile?.name}`} alt="Avatar" className="w-8 h-8 rounded-full border border-gray-100 dark:border-zinc-800 object-cover" referrerPolicy="no-referrer" />
              <div className="text-left leading-none">
                <p className="text-xs font-semibold text-gray-700 dark:text-zinc-200 truncate max-w-[100px]">{profile?.name || 'Fellow'}</p>
                <span className="text-[9px] font-mono text-gray-400 capitalize">{profile?.role || 'fellow'}</span>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8 w-full">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12, scale: 0.995 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.995 }}
              transition={{
                duration: 0.3,
                ease: [0.16, 1, 0.3, 1]
              }}
              className="w-full h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      <QuickAIHelper />
    </div>
  );
}
