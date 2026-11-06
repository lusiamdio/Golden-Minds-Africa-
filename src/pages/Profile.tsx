import React, { useState, useRef } from 'react';
import { useAuth, ExperienceItem, EducationItem } from '../contexts/AuthContext';
import { 
  User, 
  Mail, 
  Shield, 
  Camera, 
  Save, 
  Loader2, 
  X, 
  MapPin, 
  Building, 
  Briefcase, 
  GraduationCap, 
  Edit3, 
  Plus, 
  Share2, 
  ExternalLink, 
  CheckCircle2, 
  TrendingUp, 
  Award, 
  Eye, 
  Search, 
  Globe, 
  Linkedin, 
  Twitter, 
  Phone, 
  FileText,
  ThumbsUp,
  Download,
  Trash2,
  Calendar,
  Sparkles,
  Link as LinkIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { AFRICAN_COUNTRIES } from '../data/africanCountries';
import { PRESET_AVATARS, PRESET_COVERS, compressImageFile } from '../lib/imageUtils';

export default function Profile() {
  const { user, profile, updateProfile } = useAuth();
  const navigate = useNavigate();

  // Modals visibility state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isAddExpModalOpen, setIsAddExpModalOpen] = useState(false);
  const [isAddEduModalOpen, setIsAddEduModalOpen] = useState(false);
  const [isAddSkillModalOpen, setIsAddSkillModalOpen] = useState(false);
  const [isOpenToModalOpen, setIsOpenToModalOpen] = useState(false);

  // File Input Refs
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Form State for Edit Profile Modal
  const [editForm, setEditForm] = useState({
    name: profile?.name || '',
    headline: profile?.headline || '',
    country: profile?.country || 'Rwanda',
    city: profile?.city || 'Kigali',
    organization: profile?.organization || 'Golden Minds Africa Fellowship',
    cohort: profile?.cohort || 'Cohort 4 - 2026/2027',
    bio: profile?.bio || '',
    phone: profile?.phone || '+250 788 123 456',
    website: profile?.website || 'https://goldenmindsafrica.org',
    linkedinUrl: profile?.linkedinUrl || 'https://linkedin.com/in/goldenminds-fellow',
    twitterUrl: profile?.twitterUrl || 'https://twitter.com/gma_fellow',
    leadershipTrack: profile?.leadershipTrack || 'Strategic Practitioner'
  });

  // Experience Form
  const [expForm, setExpForm] = useState<Partial<ExperienceItem>>({
    title: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    current: true,
    description: ''
  });

  // Education Form
  const [eduForm, setEduForm] = useState<Partial<EducationItem>>({
    school: '',
    degree: '',
    fieldOfStudy: '',
    startYear: '',
    endYear: ''
  });

  // New Skill Input
  const [newSkill, setNewSkill] = useState('');

  // Endorsements state (for peer simulation)
  const [endorsedSkills, setEndorsedSkills] = useState<{ [skill: string]: number }>({
    'Policy Formulation': 24,
    'Multilateral Diplomacy': 19,
    'AfCFTA Strategy': 16,
    'AI Sovereignty': 14,
    'Strategic Foresight': 12
  });

  // Connected fellows state
  const [connectedFellows, setConnectedFellows] = useState<{ [id: string]: boolean }>({});

  const handleOpenEditProfile = () => {
    setEditForm({
      name: profile?.name || '',
      headline: profile?.headline || '',
      country: profile?.country || 'Rwanda',
      city: profile?.city || 'Kigali',
      organization: profile?.organization || 'Golden Minds Africa Fellowship',
      cohort: profile?.cohort || 'Cohort 4 - 2026/2027',
      bio: profile?.bio || '',
      phone: profile?.phone || '+250 788 123 456',
      website: profile?.website || 'https://goldenmindsafrica.org',
      linkedinUrl: profile?.linkedinUrl || 'https://linkedin.com/in/goldenminds-fellow',
      twitterUrl: profile?.twitterUrl || 'https://twitter.com/gma_fellow',
      leadershipTrack: profile?.leadershipTrack || 'Strategic Practitioner'
    });
    setIsEditProfileOpen(true);
  };

  const handleSaveProfile = async () => {
    await updateProfile(editForm);
    setIsEditProfileOpen(false);
    toast.success('Profile updated successfully!', {
      description: 'Changes are now live across Golden Minds Africa.'
    });
  };

  // Upload Avatar
  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      toast.loading('Processing profile picture...', { id: 'avatar-save' });
      const compressed = await compressImageFile(file, 600, 0.88);
      await updateProfile({ avatar: compressed });
      setIsPhotoModalOpen(false);
      toast.success('Profile photo updated in real time!', { id: 'avatar-save' });
    } catch (err) {
      console.error(err);
      toast.error('Failed to process image.', { id: 'avatar-save' });
    }
  };

  // Upload Cover Banner
  const handleCoverFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      toast.loading('Processing cover banner...', { id: 'cover-save' });
      const compressed = await compressImageFile(file, 1600, 0.85);
      await updateProfile({ coverImage: compressed });
      setIsCoverModalOpen(false);
      toast.success('Cover banner updated in real time!', { id: 'cover-save' });
    } catch (err) {
      console.error(err);
      toast.error('Failed to process cover banner.', { id: 'cover-save' });
    }
  };

  // Select Preset Avatar
  const handleSelectPresetAvatar = async (url: string) => {
    await updateProfile({ avatar: url });
    setIsPhotoModalOpen(false);
    toast.success('Profile photo updated!');
  };

  // Select Preset Cover
  const handleSelectPresetCover = async (url: string) => {
    await updateProfile({ coverImage: url });
    setIsCoverModalOpen(false);
    toast.success('Cover banner updated!');
  };

  // Add Experience
  const handleAddExperience = async () => {
    if (!expForm.title || !expForm.company) {
      toast.error('Please enter both title and company/organization.');
      return;
    }
    const newExp: ExperienceItem = {
      id: `exp-${Date.now()}`,
      title: expForm.title,
      company: expForm.company,
      location: expForm.location || 'Pan-African Regional Bureau',
      startDate: expForm.startDate || '2026',
      endDate: expForm.current ? 'Present' : (expForm.endDate || '2026'),
      current: expForm.current,
      description: expForm.description || ''
    };
    const updated = [newExp, ...(profile?.experiences || [])];
    await updateProfile({ experiences: updated });
    setIsAddExpModalOpen(false);
    setExpForm({ title: '', company: '', location: '', startDate: '', endDate: '', current: true, description: '' });
    toast.success('Experience added to your profile!');
  };

  // Delete Experience
  const handleDeleteExperience = async (id: string) => {
    const updated = (profile?.experiences || []).filter(e => e.id !== id);
    await updateProfile({ experiences: updated });
    toast.info('Experience removed.');
  };

  // Add Education
  const handleAddEducation = async () => {
    if (!eduForm.school || !eduForm.degree) {
      toast.error('Please enter both school/institution and degree.');
      return;
    }
    const newEdu: EducationItem = {
      id: `edu-${Date.now()}`,
      school: eduForm.school,
      degree: eduForm.degree,
      fieldOfStudy: eduForm.fieldOfStudy || 'Governance & Public Leadership',
      startYear: eduForm.startYear || '2024',
      endYear: eduForm.endYear || '2026'
    };
    const updated = [newEdu, ...(profile?.educations || [])];
    await updateProfile({ educations: updated });
    setIsAddEduModalOpen(false);
    setEduForm({ school: '', degree: '', fieldOfStudy: '', startYear: '', endYear: '' });
    toast.success('Education credential added!');
  };

  // Delete Education
  const handleDeleteEducation = async (id: string) => {
    const updated = (profile?.educations || []).filter(e => e.id !== id);
    await updateProfile({ educations: updated });
    toast.info('Education credential removed.');
  };

  // Add Skill
  const handleAddSkill = async () => {
    if (!newSkill.trim()) return;
    const currentSkills = profile?.skills 
      ? profile.skills.split(',').map(s => s.trim()).filter(Boolean)
      : [];
    if (!currentSkills.includes(newSkill.trim())) {
      const updated = [...currentSkills, newSkill.trim()].join(', ');
      await updateProfile({ skills: updated });
      setEndorsedSkills(prev => ({ ...prev, [newSkill.trim()]: 1 }));
      toast.success(`Added "${newSkill.trim()}" to your skills!`);
    }
    setNewSkill('');
    setIsAddSkillModalOpen(false);
  };

  // Endorse Skill
  const handleEndorseSkill = (skill: string) => {
    setEndorsedSkills(prev => {
      const current = prev[skill] || 0;
      return { ...prev, [skill]: current + 1 };
    });
    toast.success(`Endorsement added for ${skill}!`);
  };

  // Share Profile
  const handleShareProfile = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success('Profile URL copied to clipboard!', {
      description: 'You can now share your verified Golden Minds Africa profile anywhere.'
    });
  };

  // Toggle Fellow Connection
  const toggleConnect = (id: string, name: string) => {
    setConnectedFellows(prev => {
      const isConnected = !!prev[id];
      if (isConnected) {
        toast.info(`Connection request withdrawn for ${name}`);
        return { ...prev, [id]: false };
      } else {
        toast.success(`Connection request sent to ${name}!`);
        return { ...prev, [id]: true };
      }
    });
  };

  const skillsList = profile?.skills 
    ? profile.skills.split(',').map(s => s.trim()).filter(Boolean)
    : ['Policy Formulation', 'Multilateral Diplomacy', 'AfCFTA Strategy', 'AI Sovereignty', 'Strategic Foresight'];

  return (
    <div className="min-h-screen bg-[#f3f2ef] dark:bg-[#070b09] text-gray-900 dark:text-gray-100 py-6 px-3 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ================= LEFT / MAIN COLUMN (8 cols on lg) ================= */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* 1. TOP HERO CARD (LinkedIn Style) */}
          <div className="bg-white dark:bg-[#0d1612] rounded-2xl border border-gray-200 dark:border-[#1d3326] overflow-hidden shadow-sm hover:shadow-md transition-shadow relative">
            
            {/* Panoramic Cover Banner */}
            <div className="relative h-44 sm:h-56 md:h-64 w-full bg-gray-900 overflow-hidden group">
              <img 
                src={profile?.coverImage || PRESET_COVERS[0].url} 
                alt="Profile Cover Banner" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

              {/* Cover Banner Camera Button */}
              <button
                onClick={() => setIsCoverModalOpen(true)}
                className="absolute top-4 right-4 p-2 sm:px-3 sm:py-1.5 bg-white/90 hover:bg-white dark:bg-black/70 dark:hover:bg-black/90 text-gray-800 dark:text-white rounded-full text-xs font-semibold backdrop-blur-md transition-all shadow-md flex items-center gap-1.5 border border-white/30"
                title="Change Cover Banner"
              >
                <Camera className="w-4 h-4 text-[#d4af37]" />
                <span className="hidden sm:inline">Change Cover Photo</span>
              </button>
            </div>

            {/* Profile Avatar & Quick Stats Bar */}
            <div className="px-6 pb-6 pt-0 relative">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 sm:-mt-20 mb-4 gap-4">
                
                {/* Circular Overlapping Avatar */}
                <div className="relative self-start sm:self-auto group">
                  <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-white dark:border-[#0d1612] bg-[#0c1611] overflow-hidden shadow-2xl relative">
                    <img
                      src={profile?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'Fellow')}&background=0A2F1D&color=D4AF37&bold=true`}
                      alt={profile?.name || 'Profile Picture'}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Camera overlay on avatar */}
                  <button
                    onClick={() => setIsPhotoModalOpen(true)}
                    className="absolute bottom-1 right-1 p-2 bg-[#d4af37] hover:bg-amber-400 text-[#080d0a] rounded-full shadow-lg border-2 border-white dark:border-[#0d1612] transition-transform hover:scale-110"
                    title="Change Profile Photo"
                  >
                    <Camera className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>

                {/* Edit Profile Action Buttons */}
                <div className="flex items-center gap-2.5 self-end sm:self-auto">
                  <button
                    onClick={handleOpenEditProfile}
                    className="p-2 sm:px-4 sm:py-2 rounded-full border border-gray-300 dark:border-gray-700 hover:border-[#d4af37] bg-white dark:bg-[#122119] text-gray-800 dark:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                    title="Edit Profile Information"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#d4af37]" />
                    <span className="hidden sm:inline">Edit Profile</span>
                  </button>

                  <button
                    onClick={handleShareProfile}
                    className="p-2 sm:px-4 sm:py-2 rounded-full border border-gray-300 dark:border-gray-700 hover:border-[#d4af37] bg-white dark:bg-[#122119] text-gray-800 dark:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                    title="Share Profile Link"
                  >
                    <Share2 className="w-3.5 h-3.5 text-[#d4af37]" />
                    <span className="hidden sm:inline">Share</span>
                  </button>
                </div>
              </div>

              {/* Name, Verified Badge & Institutional Headline */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 dark:text-white tracking-tight">
                    {profile?.name || 'Fellow'}
                  </h1>

                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30 text-xs font-semibold">
                    <Shield className="w-3.5 h-3.5 fill-[#d4af37]" />
                    <span>Verified African Fellow</span>
                  </div>

                  <span className="text-xs font-mono text-gray-400">
                    ({profile?.cohort || 'Cohort 4 - 2026/2027'})
                  </span>
                </div>

                {/* Headline */}
                <p className="text-sm sm:text-base text-gray-700 dark:text-gray-200 font-medium leading-snug">
                  {profile?.headline || 'Fellow @ Golden Minds Africa | Pan-African Energy Reform & Trade Diplomacy'}
                </p>

                {/* Location & Organization */}
                <div className="flex items-center gap-2 sm:gap-3 text-xs text-gray-500 dark:text-gray-400 pt-1 flex-wrap">
                  <span className="flex items-center gap-1 text-gray-700 dark:text-gray-300 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-[#d4af37]" />
                    {profile?.city ? `${profile.city}, ` : ''}{profile?.country || 'Rwanda'}
                  </span>
                  <span>•</span>
                  <button 
                    onClick={() => setIsContactModalOpen(true)}
                    className="text-[#d4af37] hover:underline font-semibold"
                  >
                    Contact Info
                  </button>
                  <span>•</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    {profile?.connectionsCount || 342} Fellows in Network
                  </span>
                  <span>•</span>
                  <span className="truncate max-w-[200px]">{profile?.organization || 'Golden Minds Africa Fellowship'}</span>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex flex-wrap items-center gap-2.5 pt-4 mt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={() => setIsOpenToModalOpen(true)}
                  className="px-5 py-2 rounded-full bg-[#d4af37] hover:bg-amber-400 text-[#080d0a] font-bold text-xs transition-colors shadow-sm"
                >
                  Open To
                </button>

                <button
                  onClick={() => setIsAddExpModalOpen(true)}
                  className="px-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 hover:border-gray-400 text-gray-800 dark:text-gray-200 font-semibold text-xs transition-colors"
                >
                  Add Experience
                </button>

                <button
                  onClick={() => setIsAddEduModalOpen(true)}
                  className="px-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 hover:border-gray-400 text-gray-800 dark:text-gray-200 font-semibold text-xs transition-colors"
                >
                  Add Education
                </button>

                <button
                  onClick={() => navigate('/verify')}
                  className="px-4 py-2 rounded-full border border-emerald-600/40 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>View Public Credential</span>
                </button>
              </div>

              {/* "Open to Work / Pan-African Collaboration" Banner */}
              <div className="mt-4 p-3.5 rounded-xl bg-amber-50 dark:bg-[#14231b] border border-amber-200 dark:border-[#223d2d] flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-900 dark:text-[#d4af37]">
                      Open to Pan-African Policy Collaboration & Research
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    Energy Transition, AfCFTA Intra-African Trade, and Digital Sovereignty task forces.
                  </p>
                </div>
                <button
                  onClick={() => setIsOpenToModalOpen(true)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-white p-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* 2. ANALYTICS & PERFORMANCE CARD (LinkedIn Private Analytics Box) */}
          <div className="bg-white dark:bg-[#0d1612] rounded-2xl border border-gray-200 dark:border-[#1d3326] p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span>Analytics & Fellowship Index</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 font-semibold">
                    Private to you
                  </span>
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Real-time engagement across the Golden Minds Africa network</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-[#121f18] border border-gray-100 dark:border-[#1f372a]">
                <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-1">
                  <Eye className="w-4 h-4 text-[#d4af37]" />
                  <span className="text-[10px] text-emerald-500 font-mono font-bold">+24%</span>
                </div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">{profile?.profileViews || 148}</div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400">Profile views (7d)</div>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-[#121f18] border border-gray-100 dark:border-[#1f372a]">
                <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-1">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <span className="text-[10px] text-[#d4af37] font-mono font-bold">Top 5%</span>
                </div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">{profile?.participationScore || 96} / 100</div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400">Participation score</div>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-[#121f18] border border-gray-100 dark:border-[#1f372a]">
                <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-1">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span className="text-[10px] text-emerald-500 font-mono font-bold">Active</span>
                </div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">{profile?.attendanceStreak || 12} days</div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400">Attendance streak</div>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-[#121f18] border border-gray-100 dark:border-[#1f372a]">
                <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-1">
                  <Search className="w-4 h-4 text-blue-500" />
                  <span className="text-[10px] text-blue-500 font-mono font-bold">Directory</span>
                </div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">{profile?.searchAppearances || 42}</div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400">Search appearances</div>
              </div>
            </div>
          </div>

          {/* 3. ABOUT SECTION CARD */}
          <div className="bg-white dark:bg-[#0d1612] rounded-2xl border border-gray-200 dark:border-[#1d3326] p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">About</h2>
              <button
                onClick={handleOpenEditProfile}
                className="p-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Edit About Section"
              >
                <Edit3 className="w-4 h-4 text-[#d4af37]" />
              </button>
            </div>

            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
              {profile?.bio || 'Passionate about shaping Africa\'s future through transformative governance, ethical technology, and regional economic collaboration across the African continent.'}
            </p>

            {/* Strategic Pillars Pills */}
            <div className="pt-2">
              <span className="text-[10px] uppercase font-mono text-gray-400 block mb-2">Core Strategic Pillars</span>
              <div className="flex flex-wrap gap-2">
                {(profile?.focusAreas || ['Geopolitics & Multilateral Diplomacy', 'AfCFTA Intra-African Trade & Finance', 'AI Sovereignty & Digital Infrastructure']).map((pillar, i) => (
                  <span
                    key={i}
                    className="text-xs px-3 py-1 rounded-full bg-[#122119] text-[#d4af37] border border-[#1e392b] font-medium"
                  >
                    ✦ {pillar}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 4. FEATURED & CAPSTONE HIGHLIGHTS CARD */}
          <div className="bg-white dark:bg-[#0d1612] rounded-2xl border border-gray-200 dark:border-[#1d3326] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Featured Capstones & Publications</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Institutional research and verified fellowship policy memos</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-gray-200 dark:border-[#1f372a] bg-gray-50 dark:bg-[#121f18] hover:border-[#d4af37] transition-colors space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-[#d4af37] font-mono font-bold">
                    POLICY MEMO • 2026
                  </span>
                  <FileText className="w-4 h-4 text-[#d4af37]" />
                </div>
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                  AfCFTA Digital Trade Protocols & Cross-Border Sovereign Payments
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                  Comprehensive 30-page blueprint on eliminating foreign exchange frictions for intra-African SME trade corridors.
                </p>
                <div className="pt-1 flex items-center justify-between text-xs text-[#d4af37]">
                  <span className="font-semibold">Validated by Advisory Council</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="p-4 rounded-xl border border-gray-200 dark:border-[#1f372a] bg-gray-50 dark:bg-[#121f18] hover:border-[#d4af37] transition-colors space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                    SIMULATION CAPSTONE
                  </span>
                  <Award className="w-4 h-4 text-emerald-500" />
                </div>
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                  Crisis Simulation: Regional Sahel Water Security & Energy Alliance
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                  Bilateral diplomatic framework negotiated across 6 member states to deploy decentralized solar irrigation.
                </p>
                <div className="pt-1 flex items-center justify-between text-xs text-emerald-500">
                  <span className="font-semibold">Distinction Rating</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>

          {/* 5. EXPERIENCE & GOVERNANCE ROLES CARD */}
          <div className="bg-white dark:bg-[#0d1612] rounded-2xl border border-gray-200 dark:border-[#1d3326] p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Experience & Governance Roles</h2>
              <button
                onClick={() => setIsAddExpModalOpen(true)}
                className="p-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-1 text-xs font-semibold"
              >
                <Plus className="w-4 h-4 text-[#d4af37]" />
                <span>Add position</span>
              </button>
            </div>

            <div className="space-y-6">
              {(profile?.experiences || []).map((exp, idx) => (
                <div key={exp.id || idx} className="flex gap-4 items-start group">
                  <div className="w-12 h-12 rounded-xl bg-[#122119] border border-[#1f372a] flex items-center justify-center shrink-0 text-[#d4af37] font-bold">
                    <Briefcase className="w-5 h-5 text-[#d4af37]" />
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-base text-gray-900 dark:text-white leading-tight">
                        {exp.title}
                      </h3>
                      <button
                        onClick={() => handleDeleteExperience(exp.id)}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-1 transition-opacity"
                        title="Remove position"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {exp.company}
                    </div>

                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {exp.startDate} – {exp.endDate || 'Present'} • {exp.location || 'Continental'}
                    </div>

                    {exp.description && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 pt-1 leading-relaxed">
                        {exp.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 6. EDUCATION & DIPLOMATIC CREDENTIALS CARD */}
          <div className="bg-white dark:bg-[#0d1612] rounded-2xl border border-gray-200 dark:border-[#1d3326] p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Education & Diplomatic Training</h2>
              <button
                onClick={() => setIsAddEduModalOpen(true)}
                className="p-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-1 text-xs font-semibold"
              >
                <Plus className="w-4 h-4 text-[#d4af37]" />
                <span>Add education</span>
              </button>
            </div>

            <div className="space-y-6">
              {(profile?.educations || []).map((edu, idx) => (
                <div key={edu.id || idx} className="flex gap-4 items-start group">
                  <div className="w-12 h-12 rounded-xl bg-[#122119] border border-[#1f372a] flex items-center justify-center shrink-0 text-[#d4af37]">
                    <GraduationCap className="w-5 h-5 text-[#d4af37]" />
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-base text-gray-900 dark:text-white leading-tight">
                        {edu.school}
                      </h3>
                      <button
                        onClick={() => handleDeleteEducation(edu.id)}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-1 transition-opacity"
                        title="Remove education"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {edu.degree}, {edu.fieldOfStudy}
                    </div>

                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {edu.startYear} – {edu.endYear}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 7. SKILLS & PEER ENDORSEMENTS CARD */}
          <div className="bg-white dark:bg-[#0d1612] rounded-2xl border border-gray-200 dark:border-[#1d3326] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Skills & Peer Endorsements</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Validated competencies across the fellowship network</p>
              </div>
              <button
                onClick={() => setIsAddSkillModalOpen(true)}
                className="p-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-1 text-xs font-semibold"
              >
                <Plus className="w-4 h-4 text-[#d4af37]" />
                <span>Add skill</span>
              </button>
            </div>

            <div className="space-y-3 pt-1">
              {skillsList.map((skill, idx) => {
                const count = endorsedSkills[skill] || (15 - idx * 2 > 0 ? 15 - idx * 2 : 5);
                return (
                  <div 
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-[#121f18] border border-gray-200 dark:border-[#1f372a]"
                  >
                    <div>
                      <span className="font-semibold text-sm text-gray-900 dark:text-white">{skill}</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Endorsed by <strong className="text-gray-700 dark:text-gray-300">{count} fellows</strong> in Cohort 4
                      </p>
                    </div>

                    <button
                      onClick={() => handleEndorseSkill(skill)}
                      className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 hover:border-[#d4af37] text-xs font-semibold text-gray-700 dark:text-gray-200 hover:text-[#d4af37] transition-colors flex items-center gap-1"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>Endorse ({count})</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ================= RIGHT SIDEBAR (4 cols on lg) ================= */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Public Profile & URL Card */}
          <div className="bg-white dark:bg-[#0d1612] rounded-2xl border border-gray-200 dark:border-[#1d3326] p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900 dark:text-white">Public Profile & URL</span>
              <Edit3 className="w-3.5 h-3.5 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 font-mono break-all bg-gray-50 dark:bg-[#121f18] p-2.5 rounded-lg border border-gray-200 dark:border-[#1f372a]">
              goldenmindsafrica.org/fellow/{profile?.name?.toLowerCase().replace(/\s+/g, '-') || 'fellow'}
            </p>
            <button
              onClick={handleShareProfile}
              className="w-full py-2 bg-gray-100 hover:bg-gray-200 dark:bg-[#122119] dark:hover:bg-[#1b3124] text-gray-800 dark:text-[#d4af37] border border-gray-200 dark:border-[#223d2d] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Copy Public Link</span>
            </button>
          </div>

          {/* People You May Know in Cohort 4 */}
          <div className="bg-white dark:bg-[#0d1612] rounded-2xl border border-gray-200 dark:border-[#1d3326] p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Fellows in Cohort 4</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Expand your cross-border policy network</p>
            </div>

            <div className="space-y-3.5">
              {[
                { id: 'f-1', name: 'Kofi Boateng', country: 'Ghana', track: 'Tech Sovereignty Lead', avatar: PRESET_AVATARS[1].url },
                { id: 'f-2', name: 'Fatima Zahra', country: 'Morocco', track: 'AfCFTA Trade Fellow', avatar: PRESET_AVATARS[2].url },
                { id: 'f-3', name: 'Thabo Mokoena', country: 'South Africa', track: 'Energy Transition Specialist', avatar: PRESET_AVATARS[3].url },
                { id: 'f-4', name: 'Chiamaka Eze', country: 'Nigeria', track: 'Public Health Architect', avatar: PRESET_AVATARS[4].url },
              ].map((f) => {
                const isConn = !!connectedFellows[f.id];
                return (
                  <div key={f.id} className="flex items-center gap-3">
                    <img src={f.avatar} alt={f.name} className="w-10 h-10 rounded-full object-cover shrink-0 border border-gray-200 dark:border-gray-800" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-xs text-gray-900 dark:text-white truncate">{f.name}</div>
                      <div className="text-[11px] text-gray-500 truncate">{f.track} • {f.country}</div>
                    </div>
                    <button
                      onClick={() => toggleConnect(f.id, f.name)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors shrink-0 ${
                        isConn
                          ? 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                          : 'border border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37] hover:text-[#080d0a]'
                      }`}
                    >
                      {isConn ? 'Pending' : '+ Connect'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Diplomatic Accreditation Passport Card */}
          <div className="bg-gradient-to-br from-[#122119] to-[#0a120e] rounded-2xl border border-[#d4af37]/40 p-5 shadow-xl text-white space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#d4af37]" />
                <span className="font-serif font-bold text-xs uppercase tracking-wider text-[#d4af37]">
                  Diplomatic Pass
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30">
                VERIFIED
              </span>
            </div>

            <div className="space-y-1.5 pt-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Fellow:</span>
                <span className="font-semibold text-white">{profile?.name || 'Amina Mensah'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Accreditation:</span>
                <span className="font-semibold text-emerald-400">{profile?.cohort || 'Cohort 4'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Jurisdiction:</span>
                <span className="font-semibold text-white">{profile?.country || 'Rwanda'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">ID Hash:</span>
                <span className="font-mono text-[10px] text-gray-400">GMA-2026-AFR-0941</span>
              </div>
            </div>

            <button
              onClick={() => {
                toast.success('Official Fellow Dossier PDF generated!');
              }}
              className="w-full py-2.5 bg-[#d4af37] hover:bg-amber-400 text-[#080d0a] font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Official Fellow Dossier</span>
            </button>
          </div>

          {/* Quick Shortcuts to Fellowship Hubs */}
          <div className="bg-white dark:bg-[#0d1612] rounded-2xl border border-gray-200 dark:border-[#1d3326] p-5 shadow-sm space-y-2.5 text-xs">
            <span className="font-bold text-gray-900 dark:text-white block mb-1">Quick Hub Shortcuts</span>
            <button
              onClick={() => navigate('/onboarding')}
              className="w-full text-left py-1.5 text-gray-600 dark:text-gray-400 hover:text-[#d4af37] flex items-center justify-between"
            >
              <span>Review Institutional Onboarding</span>
              <ExternalLink className="w-3 h-3" />
            </button>
            <button
              onClick={() => navigate('/mentorship')}
              className="w-full text-left py-1.5 text-gray-600 dark:text-gray-400 hover:text-[#d4af37] flex items-center justify-between"
            >
              <span>AI Mentor Matching</span>
              <ExternalLink className="w-3 h-3" />
            </button>
            <button
              onClick={() => navigate('/knowledge')}
              className="w-full text-left py-1.5 text-gray-600 dark:text-gray-400 hover:text-[#d4af37] flex items-center justify-between"
            >
              <span>Knowledge Vault</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* ================= MODAL 1: EDIT PROFILE MODAL ================= */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#0d1612] border border-gray-200 dark:border-[#1f372a] rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8">
            <button
              onClick={() => setIsEditProfileOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h2 className="text-xl font-bold font-serif text-gray-900 dark:text-white">Edit Profile Details</h2>
              <p className="text-xs text-gray-500">Updates will be synchronized across your public dossier and cohort cards.</p>
            </div>

            <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-2 scrollbar-thin">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-[#1f372a] bg-gray-50 dark:bg-[#121f18] text-sm text-gray-900 dark:text-white outline-none focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">Professional Headline</label>
                <textarea
                  rows={2}
                  value={editForm.headline}
                  onChange={(e) => setEditForm({ ...editForm, headline: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-[#1f372a] bg-gray-50 dark:bg-[#121f18] text-sm text-gray-900 dark:text-white outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">Country</label>
                  <select
                    value={editForm.country}
                    onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-[#1f372a] bg-gray-50 dark:bg-[#121f18] text-sm text-gray-900 dark:text-white outline-none focus:border-[#d4af37]"
                  >
                    {AFRICAN_COUNTRIES.map((c) => (
                      <option key={c.code} value={c.name} className="dark:bg-[#0d1612]">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">City / Base</label>
                  <input
                    type="text"
                    value={editForm.city}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-[#1f372a] bg-gray-50 dark:bg-[#121f18] text-sm text-gray-900 dark:text-white outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">Current Organization / University</label>
                  <input
                    type="text"
                    value={editForm.organization}
                    onChange={(e) => setEditForm({ ...editForm, organization: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-[#1f372a] bg-gray-50 dark:bg-[#121f18] text-sm text-gray-900 dark:text-white outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">Cohort</label>
                  <input
                    type="text"
                    value={editForm.cohort}
                    onChange={(e) => setEditForm({ ...editForm, cohort: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-[#1f372a] bg-gray-50 dark:bg-[#121f18] text-sm text-gray-900 dark:text-white outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">Institutional Biography (About)</label>
                <textarea
                  rows={4}
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-[#1f372a] bg-gray-50 dark:bg-[#121f18] text-sm text-gray-900 dark:text-white outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">Phone / WhatsApp</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-[#1f372a] bg-gray-50 dark:bg-[#121f18] text-sm text-gray-900 dark:text-white outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">LinkedIn URL</label>
                  <input
                    type="text"
                    value={editForm.linkedinUrl}
                    onChange={(e) => setEditForm({ ...editForm, linkedinUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-[#1f372a] bg-gray-50 dark:bg-[#121f18] text-sm text-gray-900 dark:text-white outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">Website</label>
                  <input
                    type="text"
                    value={editForm.website}
                    onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-[#1f372a] bg-gray-50 dark:bg-[#121f18] text-sm text-gray-900 dark:text-white outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-200 dark:border-gray-800">
              <button
                onClick={() => setIsEditProfileOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="px-6 py-2.5 bg-[#d4af37] hover:bg-amber-400 text-[#080d0a] rounded-xl text-xs font-bold shadow-md transition-colors"
              >
                Save Changes in Real-Time
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: CHANGE PROFILE PHOTO MODAL ================= */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0d1612] border border-gray-200 dark:border-[#1f372a] rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setIsPhotoModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Update Profile Photo</h2>
              <p className="text-xs text-gray-500">Upload a custom headshot or pick a diplomatic portrait preset.</p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => avatarInputRef.current?.click()}
                className="w-full py-3 bg-[#d4af37] hover:bg-amber-400 text-[#080d0a] rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <Camera className="w-4 h-4" />
                <span>Upload Photo from Device</span>
              </button>
              <input
                type="file"
                ref={avatarInputRef}
                onChange={handleAvatarFile}
                accept="image/*"
                className="hidden"
              />

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
                <span className="flex-shrink mx-3 text-[10px] text-gray-400 uppercase font-mono">Or select a preset</span>
                <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {PRESET_AVATARS.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleSelectPresetAvatar(p.url)}
                    className="group cursor-pointer rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-800 hover:border-[#d4af37] transition-all aspect-square relative"
                  >
                    <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="text-[10px] font-bold text-white">Select</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: CHANGE COVER BANNER MODAL ================= */}
      {isCoverModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0d1612] border border-gray-200 dark:border-[#1f372a] rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setIsCoverModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Change Cover Banner</h2>
              <p className="text-xs text-gray-500">Upload a custom panoramic banner or pick from pan-African institutional scenes.</p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => coverInputRef.current?.click()}
                className="w-full py-3 bg-[#d4af37] hover:bg-amber-400 text-[#080d0a] rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <Camera className="w-4 h-4" />
                <span>Upload Banner from Device</span>
              </button>
              <input
                type="file"
                ref={coverInputRef}
                onChange={handleCoverFile}
                accept="image/*"
                className="hidden"
              />

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
                <span className="flex-shrink mx-3 text-[10px] text-gray-400 uppercase font-mono">Institutional presets</span>
                <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
              </div>

              <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                {PRESET_COVERS.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => handleSelectPresetCover(c.url)}
                    className="group cursor-pointer rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-800 hover:border-[#d4af37] transition-all aspect-[2/1] relative"
                  >
                    <img src={c.url} alt={c.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                      <span className="text-[10px] text-white font-medium truncate">{c.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 4: CONTACT INFO MODAL ================= */}
      {isContactModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0d1612] border border-gray-200 dark:border-[#1f372a] rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setIsContactModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{profile?.name}</h2>
              <p className="text-xs text-gray-500">Contact Information</p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 dark:bg-[#121f18]">
                <Mail className="w-4 h-4 text-[#d4af37] shrink-0" />
                <div>
                  <span className="text-gray-400 block text-[10px]">Email</span>
                  <span className="font-medium text-gray-900 dark:text-white break-all">{profile?.email || 'fellow@goldenmindsafrica.org'}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 dark:bg-[#121f18]">
                <Phone className="w-4 h-4 text-[#d4af37] shrink-0" />
                <div>
                  <span className="text-gray-400 block text-[10px]">Phone / WhatsApp</span>
                  <span className="font-medium text-gray-900 dark:text-white">{profile?.phone || '+250 788 123 456'}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 dark:bg-[#121f18]">
                <Linkedin className="w-4 h-4 text-[#d4af37] shrink-0" />
                <div>
                  <span className="text-gray-400 block text-[10px]">LinkedIn Dossier</span>
                  <a href={profile?.linkedinUrl || '#'} target="_blank" rel="noreferrer" className="text-[#d4af37] hover:underline font-medium break-all">
                    {profile?.linkedinUrl || 'linkedin.com/in/goldenminds-fellow'}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 dark:bg-[#121f18]">
                <Globe className="w-4 h-4 text-[#d4af37] shrink-0" />
                <div>
                  <span className="text-gray-400 block text-[10px]">Institutional Website</span>
                  <a href={profile?.website || 'https://goldenmindsafrica.org'} target="_blank" rel="noreferrer" className="text-[#d4af37] hover:underline font-medium break-all">
                    {profile?.website || 'goldenmindsafrica.org'}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 5: ADD EXPERIENCE MODAL ================= */}
      {isAddExpModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0d1612] border border-gray-200 dark:border-[#1f372a] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setIsAddExpModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Add Experience</h2>
              <p className="text-xs text-gray-500">Record a leadership, diplomatic, or professional position.</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Energy Transition Fellow"
                  value={expForm.title}
                  onChange={(e) => setExpForm({ ...expForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-[#1f372a] bg-gray-50 dark:bg-[#121f18] text-sm text-gray-900 dark:text-white outline-none focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">Company / Organization *</label>
                <input
                  type="text"
                  placeholder="e.g. African Development Bank / Golden Minds Africa"
                  value={expForm.company}
                  onChange={(e) => setExpForm({ ...expForm, company: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-[#1f372a] bg-gray-50 dark:bg-[#121f18] text-sm text-gray-900 dark:text-white outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">Start Date</label>
                  <input
                    type="text"
                    placeholder="e.g. Jan 2025"
                    value={expForm.startDate}
                    onChange={(e) => setExpForm({ ...expForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-[#1f372a] bg-gray-50 dark:bg-[#121f18] text-sm text-gray-900 dark:text-white outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">End Date</label>
                  <input
                    type="text"
                    placeholder="e.g. Present"
                    value={expForm.endDate}
                    onChange={(e) => setExpForm({ ...expForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-[#1f372a] bg-gray-50 dark:bg-[#121f18] text-sm text-gray-900 dark:text-white outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Brief bullet points of responsibilities and achievements..."
                  value={expForm.description}
                  onChange={(e) => setExpForm({ ...expForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-[#1f372a] bg-gray-50 dark:bg-[#121f18] text-sm text-gray-900 dark:text-white outline-none focus:border-[#d4af37]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsAddExpModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleAddExperience}
                className="px-5 py-2 bg-[#d4af37] text-[#080d0a] font-bold text-xs rounded-xl shadow-md"
              >
                Save Position
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 6: ADD EDUCATION MODAL ================= */}
      {isAddEduModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0d1612] border border-gray-200 dark:border-[#1f372a] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setIsAddEduModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Add Education</h2>
              <p className="text-xs text-gray-500">Add an academic degree, executive fellowship, or certification.</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">School / Institution *</label>
                <input
                  type="text"
                  placeholder="e.g. University of Cape Town"
                  value={eduForm.school}
                  onChange={(e) => setEduForm({ ...eduForm, school: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-[#1f372a] bg-gray-50 dark:bg-[#121f18] text-sm text-gray-900 dark:text-white outline-none focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">Degree *</label>
                <input
                  type="text"
                  placeholder="e.g. Bachelor of Science / Executive Master"
                  value={eduForm.degree}
                  onChange={(e) => setEduForm({ ...eduForm, degree: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-[#1f372a] bg-gray-50 dark:bg-[#121f18] text-sm text-gray-900 dark:text-white outline-none focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">Field of Study</label>
                <input
                  type="text"
                  placeholder="e.g. Economics & Public Policy"
                  value={eduForm.fieldOfStudy}
                  onChange={(e) => setEduForm({ ...eduForm, fieldOfStudy: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-[#1f372a] bg-gray-50 dark:bg-[#121f18] text-sm text-gray-900 dark:text-white outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">Start Year</label>
                  <input
                    type="text"
                    placeholder="2022"
                    value={eduForm.startYear}
                    onChange={(e) => setEduForm({ ...eduForm, startYear: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-[#1f372a] bg-gray-50 dark:bg-[#121f18] text-sm text-gray-900 dark:text-white outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">End Year</label>
                  <input
                    type="text"
                    placeholder="2026"
                    value={eduForm.endYear}
                    onChange={(e) => setEduForm({ ...eduForm, endYear: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-[#1f372a] bg-gray-50 dark:bg-[#121f18] text-sm text-gray-900 dark:text-white outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsAddEduModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEducation}
                className="px-5 py-2 bg-[#d4af37] text-[#080d0a] font-bold text-xs rounded-xl shadow-md"
              >
                Save Education
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 7: ADD SKILL MODAL ================= */}
      {isAddSkillModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0d1612] border border-gray-200 dark:border-[#1f372a] rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setIsAddSkillModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Add New Skill</h2>
              <p className="text-xs text-gray-500">Showcase your specialized competencies to cohort peers.</p>
            </div>

            <div>
              <input
                type="text"
                placeholder="e.g. AfCFTA Tariff Analysis, AI Sovereignty"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-[#1f372a] bg-gray-50 dark:bg-[#121f18] text-sm text-gray-900 dark:text-white outline-none focus:border-[#d4af37]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsAddSkillModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSkill}
                className="px-5 py-2 bg-[#d4af37] text-[#080d0a] font-bold text-xs rounded-xl shadow-md"
              >
                Add Skill
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 8: OPEN TO COLLABORATION MODAL ================= */}
      {isOpenToModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0d1612] border border-gray-200 dark:border-[#1f372a] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setIsOpenToModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Open to Opportunities</h2>
              <p className="text-xs text-gray-500">Signal your availability to advisors and fellowship teams.</p>
            </div>

            <div className="space-y-2.5 text-xs">
              {[
                { title: 'Pan-African Policy Research', desc: 'Authoring briefs for AfCFTA & AU Agenda 2063' },
                { title: 'Cross-Border Capstone Projects', desc: 'Partnering with fellows across 5 regions' },
                { title: 'Diplomatic Debate & Moot Court', desc: 'Participating in high-stakes simulation panels' },
                { title: 'Advisory Mentorship', desc: 'Mentoring emerging fellows in foundational tracks' }
              ].map((opt, i) => (
                <div key={i} className="p-3 rounded-xl bg-gray-50 dark:bg-[#121f18] border border-gray-200 dark:border-[#1f372a] flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">{opt.title}</h4>
                    <p className="text-[11px] text-gray-500">{opt.desc}</p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded accent-[#d4af37]" />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setIsOpenToModalOpen(false);
                  toast.success('Fellowship collaboration preferences updated!');
                }}
                className="w-full py-2.5 bg-[#d4af37] text-[#080d0a] font-bold text-xs rounded-xl shadow-md"
              >
                Save Availability Preferences
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
