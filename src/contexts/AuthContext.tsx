import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface CustomUser {
  id: string; // The original Supabase Auth UUID
  email?: string;
  displayName?: string;
  photoURL?: string;
}

export interface ExperienceItem {
  id: string;
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  description?: string;
}

export interface EducationItem {
  id: string;
  school: string;
  degree: string;
  fieldOfStudy: string;
  startYear: string;
  endYear: string;
}

export interface UserProfile {
  id: string; // Supabase uses id instead of uid
  uid: string; // Keep for backward compatibility
  name: string;
  email: string;
  role: 'fellow' | 'admin' | 'moderator' | 'student' | 'mentor';
  avatar?: string;
  coverImage?: string;
  headline?: string;
  country?: string;
  city?: string;
  organization?: string;
  cohort?: string;
  phone?: string;
  website?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  leadershipTrack?: string;
  focusAreas?: string[];
  bio?: string;
  skills?: string;
  showBioAndSkills?: boolean;
  participationScore?: number;
  attendanceStreak?: number;
  connectionsCount?: number;
  profileViews?: number;
  searchAppearances?: number;
  experiences?: ExperienceItem[];
  educations?: EducationItem[];
  onboardingCompleted?: boolean;
}

interface AuthContextType {
  user: CustomUser | null;
  profile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  updateProfile: (updatedData: Partial<UserProfile>) => Promise<boolean>;
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  loginSuperAdmin?: () => void;
  logoutSuperAdmin?: () => void;
  logout: () => Promise<void>;
  isSuperAdmin?: boolean;
}

const DEFAULT_EXPERIENCES: ExperienceItem[] = [
  {
    id: 'exp-1',
    title: 'Pan-African Leadership & Governance Fellow',
    company: 'Golden Minds Africa Fellowship',
    location: 'Continental Headquarters • Remote / Hybrid',
    startDate: 'Sep 2026',
    endDate: 'Present',
    current: true,
    description: 'Active cohort fellow engaging in high-stakes diplomatic simulations, AfCFTA multilateral trade policy formulation, and regional development initiatives.'
  },
  {
    id: 'exp-2',
    title: 'Policy & Innovation Analyst',
    company: 'African Governance & Development Initiative',
    location: 'Regional Bureau',
    startDate: 'Jan 2024',
    endDate: 'Aug 2026',
    current: false,
    description: 'Drafted policy recommendations on digital sovereignty, cross-border payments, and youth civic engagement across regional economic communities.'
  }
];

const DEFAULT_EDUCATIONS: EducationItem[] = [
  {
    id: 'edu-1',
    school: 'Pan-African Institute of Governance & Technology',
    degree: 'Executive Fellowship in Diplomatic Leadership',
    fieldOfStudy: 'Public Policy, Geopolitics & AI Sovereignty',
    startYear: '2026',
    endYear: '2027'
  },
  {
    id: 'edu-2',
    school: 'University of Nairobi',
    degree: 'Bachelor of Science',
    fieldOfStudy: 'Economics & International Relations',
    startYear: '2020',
    endYear: '2024'
  }
];

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  profile: null, 
  loading: true, 
  refreshProfile: async () => {},
  updateProfile: async () => false,
  accessToken: null,
  setAccessToken: () => {},
  loginSuperAdmin: () => {},
  logoutSuperAdmin: () => {},
  logout: async () => {},
  isSuperAdmin: false
});

// UUID validation helper
const isUuid = (id?: string | null): boolean => {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
};

// Safe timeout wrapper for promises to prevent infinite loading
function withTimeout<T>(promise: PromiseLike<T>, ms: number, fallbackValue: any): Promise<T> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((resolve) => setTimeout(() => resolve(fallbackValue), ms))
  ]);
}

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Helper to read local stored profile synchronously
  const getStoredProfileSync = (): Partial<UserProfile> | null => {
    try {
      const stored = localStorage.getItem('gma_user_profile');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Error reading stored profile:', e);
    }
    return null;
  };

  // Immediate synchronous hydration so cached users have ZERO initial loading delay
  const [user, setUser] = useState<CustomUser | null>(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('gma-super-admin-authenticated') === 'true') {
      return {
        id: 'e0000000-0000-0000-0000-000000000000',
        email: 'simao@neurogrowthlabs.co.za',
        displayName: 'Simao Simas',
        photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop'
      };
    }
    try {
      const stored = getStoredProfileSync();
      if (stored && (stored.name || stored.id)) {
        return {
          id: stored.id || 'guest-fellow',
          email: stored.email || 'fellow@goldenmindsafrica.org',
          displayName: stored.name || 'Fellow',
          photoURL: stored.avatar || ''
        };
      }
    } catch {}
    return null;
  });

  const [profile, setProfile] = useState<UserProfile | null>(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('gma-super-admin-authenticated') === 'true') {
      const superAdminUuid = 'e0000000-0000-0000-0000-000000000000';
      return {
        id: superAdminUuid,
        uid: superAdminUuid,
        name: 'Simao Simas',
        email: 'simao@neurogrowthlabs.co.za',
        role: 'admin',
        headline: 'Founding Director & Systems Architect | Golden Minds Africa',
        country: 'South Africa',
        city: 'Johannesburg',
        organization: 'Golden Minds Africa Command',
        cohort: 'Executive Council',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
        coverImage: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1600&q=80',
        participationScore: 100,
        attendanceStreak: 12,
        connectionsCount: 1240,
        profileViews: 382,
        searchAppearances: 94,
        bio: 'Super Admin Command center root administrator of Golden Minds Africa. Leading pan-African youth empowerment and policy transformation.',
        skills: 'Institutional Leadership, Geopolitics, Systems Architecture, Multilateral Diplomacy',
        leadershipTrack: 'Executive Leadership',
        focusAreas: ['Policy & Governance', 'AI Sovereignty', 'Geopolitics'],
        experiences: DEFAULT_EXPERIENCES,
        educations: DEFAULT_EDUCATIONS,
        onboardingCompleted: true
      };
    }
    try {
      const stored = getStoredProfileSync();
      if (stored && stored.name) {
        return stored as UserProfile;
      }
    } catch {}
    return null;
  });

  // If we already have stored profile or authenticated session, start with loading=false immediately!
  const [loading, setLoading] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    if (sessionStorage.getItem('gma-super-admin-authenticated') === 'true') {
      return false;
    }
    try {
      const stored = localStorage.getItem('gma_user_profile');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && (parsed.name || parsed.id)) {
          return false;
        }
      }
    } catch {}
    return true;
  });

  const [accessToken, setAccessToken] = useState<string | null>(null);

  const getStoredProfile = useCallback((): Partial<UserProfile> | null => {
    return getStoredProfileSync();
  }, []);

  const loginSuperAdmin = async () => {
    sessionStorage.setItem('gma-super-admin-authenticated', 'true');
    const superAdminUuid = 'e0000000-0000-0000-0000-000000000000';
    
    try {
      withTimeout(
        supabase.from('profiles').upsert({
          id: superAdminUuid,
          full_name: 'Simao Simas',
          avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
          role: 'admin',
          bio: 'Super Admin Command center root administrator of Golden Minds Africa.',
          participationScore: 100,
          attendanceStreak: 12
        }),
        1200,
        { data: null, error: null }
      ).catch(e => console.warn('Background admin upsert notice:', e));
    } catch (err) {
      console.error("Failed to upsert super-admin profile:", err);
    }

    const mockUser: CustomUser = {
      id: superAdminUuid,
      email: 'simao@neurogrowthlabs.co.za',
      displayName: 'Simao Simas',
      photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop'
    };
    
    const stored = getStoredProfile();

    const mockProfile: UserProfile = {
      id: superAdminUuid,
      uid: superAdminUuid,
      name: stored?.name || 'Simao Simas',
      email: 'simao@neurogrowthlabs.co.za',
      role: 'admin',
      headline: stored?.headline || 'Founding Director & Systems Architect | Golden Minds Africa',
      country: stored?.country || 'South Africa',
      city: stored?.city || 'Johannesburg',
      organization: stored?.organization || 'Golden Minds Africa Command',
      cohort: stored?.cohort || 'Executive Council',
      avatar: stored?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
      coverImage: stored?.coverImage || 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1600&q=80',
      participationScore: 100,
      attendanceStreak: 12,
      connectionsCount: stored?.connectionsCount || 1240,
      profileViews: stored?.profileViews || 382,
      searchAppearances: stored?.searchAppearances || 94,
      bio: stored?.bio || 'Super Admin Command center root administrator of Golden Minds Africa. Leading pan-African youth empowerment and policy transformation.',
      skills: stored?.skills || 'Institutional Leadership, Geopolitics, Systems Architecture, Multilateral Diplomacy',
      leadershipTrack: stored?.leadershipTrack || 'Executive Leadership',
      focusAreas: stored?.focusAreas || ['Policy & Governance', 'AI Sovereignty', 'Geopolitics'],
      experiences: stored?.experiences || DEFAULT_EXPERIENCES,
      educations: stored?.educations || DEFAULT_EDUCATIONS,
      onboardingCompleted: true
    };

    setUser(mockUser);
    setProfile(mockProfile);
    localStorage.setItem('gma_user_profile', JSON.stringify(mockProfile));
    setLoading(false);
  };

  const logoutSuperAdmin = () => {
    sessionStorage.removeItem('gma-super-admin-authenticated');
    sessionStorage.removeItem('gma-super-admin-redirected');
    sessionStorage.removeItem('gma_portal_active');
    setUser(null);
    setProfile(null);
  };

  const logout = async () => {
    try {
      sessionStorage.removeItem('gma-super-admin-authenticated');
      sessionStorage.removeItem('gma-super-admin-redirected');
      sessionStorage.removeItem('gma_portal_active');
      sessionStorage.removeItem('intended_role');
      localStorage.removeItem('gma_user_profile');
      localStorage.removeItem('gma_custom_user');
      localStorage.removeItem('onboardingComplete');
      localStorage.removeItem('gma_fellow_profile');
      await supabase.auth.signOut().catch(() => {});
    } catch (e) {
      console.warn('Signout warning:', e);
    } finally {
      setUser(null);
      setProfile(null);
      setAccessToken(null);
      setLoading(false);
    }
  };

  const fetchProfile = async (currentUser: CustomUser) => {
    try {
      const stored = getStoredProfile();
      let dbData: any = null;

      // Only query Supabase if currentUser.id is a real UUID and enforce 1200ms timeout
      if (currentUser.id && isUuid(currentUser.id)) {
        try {
          const queryPromise = supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();

          const { data, error } = await withTimeout(
            queryPromise, 
            1200, 
            { data: null, error: new Error('Profile fetch timeout') }
          );

          if (!error && data) {
            dbData = data;
          }
        } catch (err) {
          console.warn('Supabase fetch notice, falling back to local state:', err);
        }
      }

      const defaultAvatar = currentUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.displayName || 'Fellow')}&background=0A2F1D&color=D4AF37&bold=true`;
      const defaultCover = 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1600&q=80';

      const mergedProfile: UserProfile = {
        id: currentUser.id,
        uid: currentUser.id,
        name: stored?.name || dbData?.full_name || currentUser.displayName || 'Fellow',
        email: currentUser.email || stored?.email || '',
        role: dbData?.role || stored?.role || 'fellow',
        avatar: stored?.avatar || dbData?.avatar_url || defaultAvatar,
        coverImage: stored?.coverImage || defaultCover,
        headline: stored?.headline || 'Fellow @ Golden Minds Africa | Pan-African Policy & Innovation',
        country: stored?.country || 'Rwanda',
        city: stored?.city || 'Kigali',
        organization: stored?.organization || 'Golden Minds Africa Fellowship',
        cohort: stored?.cohort || 'Cohort 4 - 2026/2027',
        phone: stored?.phone || '+250 788 000 000',
        website: stored?.website || 'https://goldenmindsafrica.org',
        linkedinUrl: stored?.linkedinUrl || 'https://linkedin.com/in/goldenminds-fellow',
        twitterUrl: stored?.twitterUrl || 'https://twitter.com/gma_fellow',
        leadershipTrack: stored?.leadershipTrack || 'Policy & Governance',
        focusAreas: stored?.focusAreas || ['Leadership', 'Policy & Governance', 'AI & Technology'],
        bio: stored?.bio || dbData?.bio || 'Passionate about shaping Africa\'s future through transformative governance, ethical technology, and regional economic collaboration across the African continent.',
        skills: stored?.skills || (Array.isArray(dbData?.skills) ? dbData.skills.join(', ') : dbData?.skills) || 'Policy Formulation, Public Governance, AfCFTA Diplomacy, AI Strategy, Strategic Foresight',
        showBioAndSkills: stored?.showBioAndSkills ?? true,
        participationScore: dbData?.participationScore || dbData?.participation_score || stored?.participationScore || 85,
        attendanceStreak: dbData?.attendanceStreak || dbData?.attendance_streak || stored?.attendanceStreak || 7,
        connectionsCount: stored?.connectionsCount || 342,
        profileViews: stored?.profileViews || 128,
        searchAppearances: stored?.searchAppearances || 45,
        experiences: stored?.experiences || DEFAULT_EXPERIENCES,
        educations: stored?.educations || DEFAULT_EDUCATIONS,
        onboardingCompleted: stored?.onboardingCompleted ?? (localStorage.getItem('onboardingComplete') === 'true')
      };

      setProfile(mergedProfile);
      localStorage.setItem('gma_user_profile', JSON.stringify(mergedProfile));
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    } finally {
      setLoading(false);
    }
  };

  // Real-time Profile Update method
  const updateProfile = async (updatedData: Partial<UserProfile>): Promise<boolean> => {
    try {
      setProfile(prev => {
        const base = prev || {
          id: user?.id || 'guest-fellow',
          uid: user?.id || 'guest-fellow',
          name: 'Fellow',
          email: user?.email || '',
          role: 'fellow' as const,
          onboardingCompleted: false
        };
        const next: UserProfile = { ...base, ...updatedData };
        
        // Real-time synchronization to localStorage
        try {
          localStorage.setItem('gma_user_profile', JSON.stringify(next));
          if (next.onboardingCompleted) {
            localStorage.setItem('onboardingComplete', 'true');
          }
          window.dispatchEvent(new CustomEvent('gma_profile_updated', { detail: next }));
        } catch (e) {
          console.warn('LocalStorage save warning:', e);
        }
        return next;
      });

      // Asynchronously attempt to sync with Supabase profiles table if it is a real UUID
      if (user?.id && isUuid(user.id) && user.id !== 'e0000000-0000-0000-0000-000000000000') {
        const dbPayload: any = {};
        if (updatedData.name !== undefined) dbPayload.full_name = updatedData.name;
        if (updatedData.avatar !== undefined) dbPayload.avatar_url = updatedData.avatar;
        if (updatedData.bio !== undefined) dbPayload.bio = updatedData.bio;
        if (updatedData.skills !== undefined) {
          dbPayload.skills = typeof updatedData.skills === 'string'
            ? updatedData.skills.split(',').map(s => s.trim()).filter(Boolean)
            : updatedData.skills;
        }

        if (Object.keys(dbPayload).length > 0) {
          withTimeout(
            supabase.from('profiles').update(dbPayload).eq('id', user.id),
            2000,
            { data: null, error: null }
          ).then(({ error }: any) => {
            if (error) {
              console.warn('Database background profile update warning:', error?.message);
            }
          }).catch(e => console.warn('Background update warning:', e));
        }
      }

      return true;
    } catch (err) {
      console.error('Error updating profile in AuthContext:', err);
      return false;
    }
  };

  useEffect(() => {
    let mounted = true;

    // Hard safety timer: loading MUST NEVER exceed 1000ms under any circumstances
    const safetyTimer = setTimeout(() => {
      if (mounted) {
        setLoading(false);
      }
    }, 1000);

    // Check if we are already logged in as super-admin
    if (sessionStorage.getItem('gma-super-admin-authenticated') === 'true') {
      loginSuperAdmin();
      clearTimeout(safetyTimer);
      return;
    }

    // Get initial session with strict 1000ms timeout
    withTimeout(
      supabase.auth.getSession(),
      1000,
      { data: { session: null }, error: null }
    ).then(({ data: { session } }: any) => {
      if (!mounted) return;
      if (session?.user) {
        const mappedUser: CustomUser = {
          id: session.user.id,
          email: session.user.email,
          displayName: session.user.user_metadata?.full_name || session.user.user_metadata?.name || '',
          photoURL: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || '',
        };
        setUser(mappedUser);
        fetchProfile(mappedUser);
      } else {
        // Initialize guest fellow profile from localStorage if present
        const stored = getStoredProfile();
        if (stored && stored.name) {
          const guestUser: CustomUser = {
            id: stored.id || 'guest-fellow',
            email: stored.email || 'fellow@goldenmindsafrica.org',
            displayName: stored.name,
            photoURL: stored.avatar || ''
          };
          setUser(guestUser);
          fetchProfile(guestUser);
        } else {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      }
    }).catch(err => {
      console.warn('Initial session check notice:', err);
      if (mounted) setLoading(false);
    }).finally(() => {
      clearTimeout(safetyTimer);
    });

    // Listen to Auth State changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      if (session?.user) {
        const mappedUser: CustomUser = {
          id: session.user.id,
          email: session.user.email,
          displayName: session.user.user_metadata?.full_name || session.user.user_metadata?.name || '',
          photoURL: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || '',
        };
        setUser(mappedUser);
        await fetchProfile(mappedUser);
      } else {
        // Do not wipe out guest profile if user was exploring without Supabase auth
        const stored = getStoredProfile();
        if (!stored || !stored.name) {
          setUser(null);
          setProfile(null);
          setAccessToken(null);
        }
        setLoading(false);
      }
    });

    // Listen to custom cross-component profile updates
    const handleProfileSync = (event: Event) => {
      const customEvent = event as CustomEvent<UserProfile>;
      if (customEvent.detail) {
        setProfile(customEvent.detail);
      }
    };
    window.addEventListener('gma_profile_updated', handleProfileSync);

    return () => {
      mounted = false;
      clearTimeout(safetyTimer);
      subscription.unsubscribe();
      window.removeEventListener('gma_profile_updated', handleProfileSync);
    };
  }, [getStoredProfile]);

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user);
    } else {
      const stored = getStoredProfile();
      if (stored) {
        setProfile(prev => ({ ...(prev as UserProfile), ...stored }));
      }
    }
  };

  const isSuperAdmin = !!(
    (user && user.email === 'simao@neurogrowthlabs.co.za') || 
    sessionStorage.getItem('gma-super-admin-authenticated') === 'true'
  );

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      refreshProfile, 
      updateProfile,
      accessToken, 
      setAccessToken, 
      loginSuperAdmin, 
      logoutSuperAdmin, 
      logout,
      isSuperAdmin 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
