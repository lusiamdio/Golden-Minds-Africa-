import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { scanContentAI, reportModerationViolation } from '../lib/moderation';
import { supabase } from '../lib/supabase';

// Define TS Interfaces
export interface SiteConfig {
  maintenanceMode: boolean;
  lockOnboarding: boolean;
  copilotStateEnabled: boolean;
  secureHashLockRequired: boolean;
  defaultRoleForRegister: string;
  maxUploadMB: number;
}

export interface Mentor {
  id: string;
  name: string;
  role: string;
  industry: string;
  match: number;
  avatar: string;
  bio: string;
  slug: string;
  email: string;
}

export interface Publication {
  id: string;
  title: string;
  type: 'Article' | 'Report' | 'Research Paper' | 'White Paper';
  content: string;
  author: string;
  track: string;
  status: 'Draft' | 'Published';
  date: string;
  readTime: string;
}

export interface FellowContent {
  id: string;
  fellowName: string;
  fellowEmail: string;
  contentType: 'Forum Post' | 'Shared Document' | 'Assignment Submission' | 'Portfolio Showcase' | 'AI Note';
  title: string;
  excerpt: string;
  timestamp: string;
  status: 'Active' | 'Flagged' | 'Hidden' | 'Approved';
  track?: string;
}

export interface AuditLogItem {
  id: string;
  adminName: string;
  action: string;
  target: string;
  timestamp: string;
  category: 'Security' | 'Mentors' | 'Publications' | 'Moderation' | 'System';
}

// Analytics metric groups
export interface MembershipChartData {
  region: string;
  count: number;
  color: string;
}

export interface GrowthChartData {
  month: string;
  activeFollowers: number;
  submittedAssignments: number;
  studyHours: number;
  sessionsConducted: number;
}

export interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Suspended' | 'Banned' | 'Graduated';
  cohort: string;
  permissions: string[];
}

export interface DebateMessage {
  id: string;
  role: 'user' | 'moderator';
  content: string;
  team?: 'A' | 'B';
  score?: number;
  timestamp: string;
  senderName?: string;
}

export interface RoomMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
  recipient?: string;
}

export interface RoomTranscript {
  id: string;
  speaker: string;
  text: string;
  time: string;
  translatedText?: string;
}

export interface VirtualRoom {
  id: string;
  name: string;
  topic: string;
  color: string;
  participants: { id: string; name: string; avatar?: string; isMuted?: boolean; isVideoOff?: boolean; role?: string; }[];
  maxCapacity: number;
  facilitator: string;
  status: 'live' | 'idle';
  messages: RoomMessage[];
  transcripts: RoomTranscript[];
}

export interface IncidentReport {
  id: string;
  targetName: string;
  reporterName: string;
  description: string;
  channel: string;
  timestamp: string;
  status: 'Pending' | 'Reviewed' | 'Action Taken';
}

interface AdminStateContextType {
  siteConfig: SiteConfig;
  updateSiteConfig: (config: Partial<SiteConfig>) => void;
  mentors: Mentor[];
  addMentor: (mentor: Omit<Mentor, 'id' | 'slug'>) => void;
  updateMentor: (id: string, mentorUpdates: Partial<Mentor>) => void;
  deleteMentor: (id: string) => void;
  publications: Publication[];
  addPublication: (pub: Omit<Publication, 'id' | 'date'>) => void;
  updatePublication: (id: string, pubUpdates: Partial<Publication>) => void;
  deletePublication: (id: string) => void;
  fellowContents: FellowContent[];
  moderateFellowContent: (id: string, newStatus: FellowContent['status']) => void;
  deleteFellowContent: (id: string) => void;
  addFellowContent: (title: string, excerpt: string, contentType: FellowContent['contentType'], fellowName: string, fellowEmail: string) => void;
  auditLogs: AuditLogItem[];
  logAdminAction: (action: string, target: string, category: AuditLogItem['category']) => void;
  clearAuditLogs: () => void;
  
  // New synchronised collections
  users: UserItem[];
  updateUser: (userId: string, updates: Partial<UserItem>) => void;
  banUser: (userId: string) => void;
  deleteUser: (userId: string) => void;

  debates: DebateMessage[];
  addDebateMessage: (msg: Omit<DebateMessage, 'id' | 'timestamp'>) => void;
  clearDebates: () => void;

  virtualRooms: VirtualRoom[];
  addRoomMessage: (roomId: string, msg: Omit<RoomMessage, 'id' | 'time'>) => void;
  addRoomTranscript: (roomId: string, transcript: Omit<RoomTranscript, 'id' | 'time'>) => void;
  updateRoomTopic: (roomId: string, topic: string) => void;
  toggleParticipantMedia: (roomId: string, participantId: string, type: 'mic' | 'video' | 'joined' | 'left', extra?: any) => void;

  incidentReports: IncidentReport[];
  submitIncidentReport: (report: Omit<IncidentReport, 'id' | 'timestamp' | 'status'>) => void;
  updateReportStatus: (reportId: string, status: IncidentReport['status']) => void;

  // Chart state with ability to rectify and adjust stats
  membershipData: MembershipChartData[];
  growthData: GrowthChartData[];
  updateEngagementData: (month: string, field: keyof GrowthChartData, value: number) => void;
  updateMembershipCount: (region: string, count: number) => void;
  reseedMockContent: () => void;
}

const AdminStateContext = createContext<AdminStateContextType | undefined>(undefined);

export function useAdminState() {
  const context = useContext(AdminStateContext);
  if (!context) {
    throw new Error('useAdminState must be used within an AdminStateProvider');
  }
  return context;
}

const DEFAULT_CONFIG: SiteConfig = {
  maintenanceMode: false,
  lockOnboarding: false,
  copilotStateEnabled: true,
  secureHashLockRequired: true,
  defaultRoleForRegister: 'fellow',
  maxUploadMB: 25,
};

const DEFAULT_MENTORS: Mentor[] = [
  {
    id: 'men-1',
    name: 'Dr. Amina Yusuf',
    role: 'Senior Fellow & Policy Specialist',
    industry: 'Public Policy Formulation',
    match: 98,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop',
    bio: 'Dr. Amina Yusuf has over 15 years advising West African governments on trade and tech integrations. Recipient of AU Distinguished Policy Award.',
    slug: 'dr-amina-yusuf',
    email: 'amina.y@minds.africa'
  },
  {
    id: 'men-2',
    name: 'Kwame Osei',
    role: 'Venture Architect & Educator',
    industry: 'Digital Governance',
    match: 94,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    bio: 'Kwame holds extensive knowledge on incubation centers, blockchain voting structures, and regional technology hubs in Sub-Saharan Africa.',
    slug: 'kwame-osei',
    email: 'k.osei@neurogrowthlabs.co.za'
  },
  {
    id: 'men-3',
    name: 'Sarah Ndlovu',
    role: 'Macroeconomist & AfCFTA Advocate',
    industry: 'Pan-African Trade',
    match: 91,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop',
    bio: 'Sarah works deeply with tariff reduction models and financial infrastructure integrations targeting Southern Africa regional development.',
    slug: 'sarah-ndlovu',
    email: 'sarah.ndlovu@trade-africa.org'
  }
];

const DEFAULT_PUBLICATIONS: Publication[] = [
  {
    id: 'pub-1',
    title: 'A New Dawn for Digital Governance: AI Sovereignty in Africa',
    type: 'White Paper',
    content: 'This White Paper presents a comprehensive policy framework for AI Sovereignty in Africa, outlining critical protocols on regional data hosting, local language model training, and localized cloud infrastructures.',
    author: 'Simao Simas (Super Admin)',
    track: 'Digital Governance',
    status: 'Published',
    date: '2026-06-10',
    readTime: '12 min read'
  },
  {
    id: 'pub-2',
    title: 'AfCFTA Tariffs Optimization and Intra-Continental Supply Chains',
    type: 'Research Paper',
    content: 'An analytical research studying non-tariff barriers, customs delays, and transport bottlenecks along trans-African highways. Includes deep mathematical projections for policy harmonization.',
    author: 'Sarah Ndlovu',
    track: 'Pan-African Trade',
    status: 'Published',
    date: '2026-06-05',
    readTime: '15 min read'
  },
  {
    id: 'pub-3',
    title: 'Developing Unified Digital Identity Schemes (e-ID) for ECOWAS Regional Commerce',
    type: 'Report',
    content: 'This technical report outlines the requirements for biometric e-ID protocols, cross-border token authentications, and privacy integrations in West African digital trade nodes.',
    author: 'Kwame Osei',
    track: 'Digital Governance',
    status: 'Draft',
    date: '2026-06-12',
    readTime: '8 min read'
  }
];

const DEFAULT_FELLOW_CONTENT: FellowContent[] = [
  {
    id: 'fel-c1',
    fellowName: 'Kofi Boateng',
    fellowEmail: 'kofi@gmail.com',
    contentType: 'Forum Post',
    title: 'Implications of AfCFTA on SME digitisation in Ghana',
    excerpt: 'How do electronic cargo tracking systems actually benefit individual traders? Here is an breakdown of mobile API integrations for cross-border transit logs.',
    timestamp: '2026-06-13 12:45',
    status: 'Active',
    track: 'Pan-African Trade'
  },
  {
    id: 'fel-c2',
    fellowName: 'Chioma Onyekachi',
    fellowEmail: 'chioma.o@gmail.com',
    contentType: 'Shared Document',
    title: 'AI Ethics and Governance framework for ECOWAS region v2.pdf',
    excerpt: 'A comprehensive draft proposal submitting to the ECOWAS Commission for regional technology alignment on ethical automated decision structures.',
    timestamp: '2026-06-13 11:20',
    status: 'Approved',
    track: 'Digital Governance'
  },
  {
    id: 'fel-c3',
    fellowName: 'Tariq El-Sayed',
    fellowEmail: 'tariq@gmail.com',
    contentType: 'Assignment Submission',
    title: 'Geopolitics: Indian Ocean ports security analysis',
    excerpt: 'Detailed map study covering maritime choke points, terminal lease contracts, and public diplomacy maneuvers between Eastern Africa ports and international cargo operators.',
    timestamp: '2026-06-13 09:12',
    status: 'Active',
    track: 'Geopolitics'
  },
  {
    id: 'fel-c4',
    fellowName: 'Fatima Al-Mansoor',
    fellowEmail: 'fatima.al@gmail.com',
    contentType: 'Portfolio Showcase',
    title: 'Decentralized Solar Smart Grids deployment slide deck',
    excerpt: 'Visual showcase highlighting mini-grid solar installations, community microfinance tracking, and public asset leasing in Northern Malian villages.',
    timestamp: '2026-06-12 18:40',
    status: 'Active',
    track: 'Public Policy Formulation'
  },
  {
    id: 'fel-c5',
    fellowName: 'Sani Bello',
    fellowEmail: 'sani.bello@gmail.com',
    contentType: 'AI Note',
    title: 'Key Policy Directives on AU Agenda 2063 Chapter 4',
    excerpt: 'Summarized focus points on resource mobilization and private partnerships captured via AI Companion during the core research plenary last Tuesday.',
    timestamp: '2026-06-12 14:15',
    status: 'Active'
  }
];

const DEFAULT_GROWTH_DATA: GrowthChartData[] = [
  { month: 'Feb', activeFollowers: 94, submittedAssignments: 78, studyHours: 240, sessionsConducted: 42 },
  { month: 'Mar', activeFollowers: 110, submittedAssignments: 89, studyHours: 320, sessionsConducted: 55 },
  { month: 'Apr', activeFollowers: 125, submittedAssignments: 95, studyHours: 410, sessionsConducted: 68 },
  { month: 'May', activeFollowers: 138, submittedAssignments: 112, studyHours: 550, sessionsConducted: 84 },
  { month: 'Jun', activeFollowers: 154, submittedAssignments: 142, studyHours: 680, sessionsConducted: 102 }
];

const DEFAULT_MEMBERSHIP_DATA: MembershipChartData[] = [
  { region: 'West Africa', count: 48, color: '#cca568' },
  { region: 'East Africa', count: 32, color: '#3b82f6' },
  { region: 'Southern Africa', count: 28, color: '#10b981' },
  { region: 'North Africa', count: 18, color: '#8b5cf6' },
  { region: 'Central & Overseas', count: 12, color: '#f59e0b' }
];

const DEFAULT_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: 'ad-l1',
    adminName: 'Simao Simas',
    action: 'Initialized Super Admin Command Center',
    target: 'Security Guard System Activated',
    timestamp: '2026-06-13 10:00:15',
    category: 'Security'
  },
  {
    id: 'ad-l2',
    adminName: 'Simao Simas',
    action: 'Approved Fellowship Document "AI Ethics framework ECOWAS"',
    target: 'fel-c2',
    timestamp: '2026-06-13 11:32:00',
    category: 'Moderation'
  }
];

const DEFAULT_USERS: UserItem[] = [
  { id: 'usr-1', name: 'Lusimadio Chidozie', email: 'lusimadio12@gmail.com', role: 'super-admin', status: 'Active', cohort: 'Cohort A', permissions: ['Read', 'Write', 'Delete', 'Super'] },
  { id: 'usr-2', name: 'Dr. Amina Diallo', email: 'amina.diallo@minds.africa', role: 'mentor', status: 'Active', cohort: 'Cohort A', permissions: ['Read', 'Write'] },
  { id: 'usr-3', name: 'Kofi Boateng', email: 'kofi@gmail.com', role: 'fellow', status: 'Active', cohort: 'Cohort B', permissions: ['Read'] },
  { id: 'usr-4', name: 'Chioma Onyekachi', email: 'chioma.o@gmail.com', role: 'fellow', status: 'Active', cohort: 'Cohort A', permissions: ['Read'] },
  { id: 'usr-5', name: 'Tariq El-Sayed', email: 'tariq@gmail.com', role: 'fellow', status: 'Suspended', cohort: 'Cohort B', permissions: ['Read'] },
  { id: 'usr-6', name: 'Fatima Al-Mansoor', email: 'fatima.al@gmail.com', role: 'fellow', status: 'Graduated', cohort: 'Cohort A', permissions: ['Read'] },
];

const DEFAULT_DEBATES: DebateMessage[] = [
  { id: 'deb-m1', role: 'moderator', content: 'Welcome to the Debate Engine. The motion is: Strongman vs. Democracy: Does economic growth justify limited political freedoms? (Rwanda vs. Nigeria/Ghana). Evaluation criteria covers Logic, Clarity, and Relevance. Let Team A begin.', score: undefined, timestamp: '14:00' }
];

const DEFAULT_VIRTUAL_ROOMS: VirtualRoom[] = [
  {
    id: 'room-alpha',
    name: 'Lecture Room Alpha',
    topic: 'Digital Sovereignty & Interoperability Architectures',
    color: 'bg-emerald-600',
    maxCapacity: 50,
    facilitator: 'Dr. Amina Yusuf',
    status: 'live',
    participants: [
      { id: 'p-1', name: 'Kofi Boateng', avatar: '', isMuted: false, isVideoOff: false, role: 'Fellow' },
      { id: 'p-2', name: 'Chioma Onyekachi', avatar: '', isMuted: true, isVideoOff: false, role: 'Fellow' },
      { id: 'p-3', name: 'Dr. Amina Yusuf', avatar: '', isMuted: false, isVideoOff: false, role: 'Mentor' }
    ],
    messages: [
      { id: 'rm-1', sender: 'Kofi Boateng', text: 'Should ECOWAS establish a regional cloud network?', time: '14:02' },
      { id: 'rm-2', sender: 'Dr. Amina Yusuf', text: 'Yes Kofi, that helps prevent third-party geo-routing.', time: '14:03' }
    ],
    transcripts: [
      { id: 'rt-1', speaker: 'Dr. Amina Yusuf', text: 'When we discuss cyber resilience, standardizing e-identity is paramount.', time: '14:01' },
      { id: 'rt-2', speaker: 'Kofi Boateng', text: 'Does biometric interoperability trigger privacy leaks?', time: '14:02' },
      { id: 'rt-3', speaker: 'Dr. Amina Yusuf', text: 'Not with local decentralized hash validations.', time: '14:03' }
    ]
  },
  {
    id: 'room-beta',
    name: 'Lecture Room Beta',
    topic: 'AfCFTA Tariffs Optimization & Supply Lines',
    color: 'bg-orange-600',
    maxCapacity: 40,
    facilitator: 'Dr. Amina Diallo',
    status: 'live',
    participants: [
      { id: 'p-4', name: 'Tariq El-Sayed', avatar: '', isMuted: false, isVideoOff: true, role: 'Fellow' },
      { id: 'p-5', name: 'Fatima Al-Mansoor', avatar: '', isMuted: true, isVideoOff: false, role: 'Fellow' }
    ],
    messages: [
      { id: 'rm-3', sender: 'Tariq El-Sayed', text: 'Will port delays affect trade balances?', time: '13:50' }
    ],
    transcripts: [
      { id: 'rt-4', speaker: 'Tariq El-Sayed', text: 'Our current border clearing times are averaging three days in regional hubs.', time: '13:48' },
      { id: 'rt-5', speaker: 'Fatima Al-Mansoor', text: 'Automation will compress border clearance to six hours.', time: '13:49' }
    ]
  },
  {
    id: 'room-gamma',
    name: 'Collaboration Room Gamma',
    topic: 'Infrastructure Mini-grid Optimization Research',
    color: 'bg-purple-600',
    maxCapacity: 30,
    facilitator: 'Kwame Osei',
    status: 'live',
    participants: [
      { id: 'p-6', name: 'Sani Bello', avatar: '', isMuted: false, isVideoOff: false, role: 'Fellow' }
    ],
    messages: [
      { id: 'rm-4', sender: 'Sani Bello', text: 'Has anyone finished compiling solar grid slide decks?', time: '12:10' }
    ],
    transcripts: [
      { id: 'rt-6', speaker: 'Sani Bello', text: 'Mini-grid solar is a vital topic for sub-saharan decentralized smart power systems.', time: '12:08' }
    ]
  }
];

const DEFAULT_INCIDENT_REPORTS: IncidentReport[] = [
  { id: 'rep-1', targetName: 'Tariq El-Sayed', reporterName: 'Kofi Boateng', description: 'Used unprofessional language in the debate room chat regarding policy outcomes.', channel: 'Debate Room', timestamp: '2026-06-13 13:10', status: 'Pending' }
];

export const AdminStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Config state
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(() => {
    const saved = localStorage.getItem('gma_admin_site_config');
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
  });

  // Mentors state
  const [mentors, setMentors] = useState<Mentor[]>(() => {
    const saved = localStorage.getItem('gma_admin_mentors');
    return saved ? JSON.parse(saved) : DEFAULT_MENTORS;
  });

  // Publications state
  const [publications, setPublications] = useState<Publication[]>(() => {
    const saved = localStorage.getItem('gma_admin_publications');
    return saved ? JSON.parse(saved) : DEFAULT_PUBLICATIONS;
  });

  // Registered fellow shared content state
  const [fellowContents, setFellowContents] = useState<FellowContent[]>(() => {
    const saved = localStorage.getItem('gma_admin_fellow_contents');
    return saved ? JSON.parse(saved) : DEFAULT_FELLOW_CONTENT;
  });

  // Audit Logs state
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(() => {
    const saved = localStorage.getItem('gma_admin_audit_logs');
    return saved ? JSON.parse(saved) : DEFAULT_AUDIT_LOGS;
  });

  // Chart regional membership state
  const [membershipData, setMembershipData] = useState<MembershipChartData[]>(() => {
    const saved = localStorage.getItem('gma_admin_membership_data');
    return saved ? JSON.parse(saved) : DEFAULT_MEMBERSHIP_DATA;
  });

  // Chart growth state
  const [growthData, setGrowthData] = useState<GrowthChartData[]>(() => {
    const saved = localStorage.getItem('gma_admin_growth_data');
    return saved ? JSON.parse(saved) : DEFAULT_GROWTH_DATA;
  });

  // Real-time synced collections states
  const [users, setUsers] = useState<UserItem[]>(() => {
    const saved = localStorage.getItem('gma_admin_users');
    return saved ? JSON.parse(saved) : DEFAULT_USERS;
  });

  const [debates, setDebates] = useState<DebateMessage[]>(() => {
    const saved = localStorage.getItem('gma_admin_debates');
    return saved ? JSON.parse(saved) : DEFAULT_DEBATES;
  });

  const [virtualRooms, setVirtualRooms] = useState<VirtualRoom[]>(() => {
    const saved = localStorage.getItem('gma_admin_virtual_rooms');
    return saved ? JSON.parse(saved) : DEFAULT_VIRTUAL_ROOMS;
  });

  const [incidentReports, setIncidentReports] = useState<IncidentReport[]>(() => {
    const saved = localStorage.getItem('gma_admin_incident_reports');
    return saved ? JSON.parse(saved) : DEFAULT_INCIDENT_REPORTS;
  });

  // Helper to persist to Supabase
  const saveToSupabase = async (key: string, value: any) => {
    const isSuperAdmin = sessionStorage.getItem('gma-super-admin-authenticated') === 'true';
    if (!isSuperAdmin) return;

    try {
      const deterministicIds: Record<string, string> = {
        site_config: 'a0000000-0000-0000-0000-000000000001',
        mentors: 'a0000000-0000-0000-0000-000000000002',
        publications: 'a0000000-0000-0000-0000-000000000003',
        fellow_contents: 'a0000000-0000-0000-0000-000000000004',
        audit_logs: 'a0000000-0000-0000-0000-000000000005',
        membership_data: 'a0000000-0000-0000-0000-000000000006',
        growth_data: 'a0000000-0000-0000-0000-000000000007',
        users: 'a0000000-0000-0000-0000-000000000008',
        debates: 'a0000000-0000-0000-0000-000000000009',
        virtual_rooms: 'a0000000-0000-0000-0000-000000000010',
        incident_reports: 'a0000000-0000-0000-0000-000000000011',
      };

      const id = deterministicIds[key];
      if (!id) return;

      await supabase
        .from('posts')
        .upsert({
          id,
          author_id: 'e0000000-0000-0000-0000-000000000000',
          title: key,
          content: JSON.stringify(value),
          type: 'admin_state',
          tags: []
        });
    } catch (err) {
      console.error(`Exception saving ${key} to Supabase:`, err);
    }
  };

  // Persist each state on changes and sync with Supabase
  useEffect(() => {
    localStorage.setItem('gma_admin_site_config', JSON.stringify(siteConfig));
    saveToSupabase('site_config', siteConfig);
  }, [siteConfig]);

  useEffect(() => {
    localStorage.setItem('gma_admin_mentors', JSON.stringify(mentors));
    saveToSupabase('mentors', mentors);
  }, [mentors]);

  useEffect(() => {
    localStorage.setItem('gma_admin_publications', JSON.stringify(publications));
    saveToSupabase('publications', publications);
  }, [publications]);

  useEffect(() => {
    localStorage.setItem('gma_admin_fellow_contents', JSON.stringify(fellowContents));
    saveToSupabase('fellow_contents', fellowContents);
  }, [fellowContents]);

  useEffect(() => {
    localStorage.setItem('gma_admin_audit_logs', JSON.stringify(auditLogs));
    saveToSupabase('audit_logs', auditLogs);
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('gma_admin_membership_data', JSON.stringify(membershipData));
    saveToSupabase('membership_data', membershipData);
  }, [membershipData]);

  useEffect(() => {
    localStorage.setItem('gma_admin_growth_data', JSON.stringify(growthData));
    saveToSupabase('growth_data', growthData);
  }, [growthData]);

  useEffect(() => {
    localStorage.setItem('gma_admin_users', JSON.stringify(users));
    saveToSupabase('users', users);
  }, [users]);

  useEffect(() => {
    localStorage.setItem('gma_admin_debates', JSON.stringify(debates));
    saveToSupabase('debates', debates);
  }, [debates]);

  useEffect(() => {
    localStorage.setItem('gma_admin_virtual_rooms', JSON.stringify(virtualRooms));
    saveToSupabase('virtual_rooms', virtualRooms);
  }, [virtualRooms]);

  useEffect(() => {
    localStorage.setItem('gma_admin_incident_reports', JSON.stringify(incidentReports));
    saveToSupabase('incident_reports', incidentReports);
  }, [incidentReports]);

  // Load state and subscribe to changes
  useEffect(() => {
    let mounted = true;

    const fetchInitialState = async () => {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('title, content')
          .eq('type', 'admin_state');
        
        if (error) {
          console.error("Failed to load global admin state:", error);
          return;
        }

        if (mounted && data && data.length > 0) {
          data.forEach((row) => {
            try {
              const parsed = JSON.parse(row.content);
              if (row.title === 'site_config') setSiteConfig(parsed);
              else if (row.title === 'mentors') setMentors(parsed);
              else if (row.title === 'publications') setPublications(parsed);
              else if (row.title === 'fellow_contents') setFellowContents(parsed);
              else if (row.title === 'audit_logs') setAuditLogs(parsed);
              else if (row.title === 'membership_data') setMembershipData(parsed);
              else if (row.title === 'growth_data') setGrowthData(parsed);
              else if (row.title === 'users') setUsers(parsed);
              else if (row.title === 'debates') setDebates(parsed);
              else if (row.title === 'virtual_rooms') setVirtualRooms(parsed);
              else if (row.title === 'incident_reports') setIncidentReports(parsed);
            } catch (err) {
              console.error("Error parsing admin state row:", row.title, err);
            }
          });
        }
      } catch (err) {
        console.error("Exception fetching admin state:", err);
      }
    };

    fetchInitialState();

    const channel = supabase
      .channel('admin-state-sync')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
          filter: 'type=eq.admin_state'
        },
        (payload) => {
          const newRecord = payload.new as any;
          if (!newRecord || !newRecord.title || !newRecord.content) return;
          
          if (mounted) {
            try {
              const parsed = JSON.parse(newRecord.content);
              const key = newRecord.title;
              
              if (key === 'site_config') setSiteConfig(parsed);
              else if (key === 'mentors') setMentors(parsed);
              else if (key === 'publications') setPublications(parsed);
              else if (key === 'fellow_contents') setFellowContents(parsed);
              else if (key === 'audit_logs') setAuditLogs(parsed);
              else if (key === 'membership_data') setMembershipData(parsed);
              else if (key === 'growth_data') setGrowthData(parsed);
              else if (key === 'users') setUsers(parsed);
              else if (key === 'debates') setDebates(parsed);
              else if (key === 'virtual_rooms') setVirtualRooms(parsed);
              else if (key === 'incident_reports') setIncidentReports(parsed);
            } catch (err) {
              console.error("Error parsing real-time payload:", err);
            }
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      channel.unsubscribe();
    };
  }, []);

  // Logging utility
  const logAdminAction = (action: string, target: string, category: AuditLogItem['category']) => {
    const newLog: AuditLogItem = {
      id: `l-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      adminName: 'Simao Simas (Super Admin)',
      action,
      target,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      category
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const clearAuditLogs = () => {
    setAuditLogs([{
      id: `l-init-${Date.now()}`,
      adminName: 'Simao Simas (Super Admin)',
      action: 'Flushed security logs terminal',
      target: 'Audit Logs Console',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      category: 'Security'
    }]);
    toast.info('Audit log directory cleaned.');
  };

  // Real-time fellow content listener - listens to genuine user publishing events only (no automated simulation notifications)
  useEffect(() => {
    const handleRealtimeContent = (e: CustomEvent<FellowContent>) => {
      if (e.detail) {
        setFellowContents(prev => [e.detail, ...prev]);
      }
    };

    window.addEventListener('gma_realtime_fellow_content' as any, handleRealtimeContent as any);
    return () => {
      window.removeEventListener('gma_realtime_fellow_content' as any, handleRealtimeContent as any);
    };
  }, []);

  // API implementations
  const updateSiteConfig = (configUpdates: Partial<SiteConfig>) => {
    setSiteConfig(prev => {
      const updated = { ...prev, ...configUpdates };
      logAdminAction('Updated global site configuration', JSON.stringify(configUpdates), 'System');
      return updated;
    });
    toast.success('Site-wide settings updated successfully!');
  };

  const reseedMockContent = () => {
    localStorage.removeItem('gma_admin_site_config');
    localStorage.removeItem('gma_admin_mentors');
    localStorage.removeItem('gma_admin_publications');
    localStorage.removeItem('gma_admin_fellow_contents');
    localStorage.removeItem('gma_admin_audit_logs');
    localStorage.removeItem('gma_admin_membership_data');
    localStorage.removeItem('gma_admin_growth_data');
    localStorage.removeItem('gma_admin_users');
    localStorage.removeItem('gma_admin_debates');
    localStorage.removeItem('gma_admin_virtual_rooms');
    localStorage.removeItem('gma_admin_incident_reports');
    setSiteConfig(DEFAULT_CONFIG);
    setMentors(DEFAULT_MENTORS);
    setPublications(DEFAULT_PUBLICATIONS);
    setFellowContents(DEFAULT_FELLOW_CONTENT);
    setAuditLogs(DEFAULT_AUDIT_LOGS);
    setMembershipData(DEFAULT_MEMBERSHIP_DATA);
    setGrowthData(DEFAULT_GROWTH_DATA);
    setUsers(DEFAULT_USERS);
    setDebates(DEFAULT_DEBATES);
    setVirtualRooms(DEFAULT_VIRTUAL_ROOMS);
    setIncidentReports(DEFAULT_INCIDENT_REPORTS);
    toast.success('Admin configurations restored to blueprint standards!');
  };

  // MENTOR ACTIONS
  const addMentor = (mentor: Omit<Mentor, 'id' | 'slug'>) => {
    const slug = mentor.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newMentor: Mentor = {
      ...mentor,
      id: `men-${Date.now()}`,
      slug
    };
    setMentors(prev => [...prev, newMentor]);
    logAdminAction(`Added new Mentor Profile: ${mentor.name}`, newMentor.id, 'Mentors');
    toast.success(`Mentor "${mentor.name}" has been registered into the faculty roster.`);
  };

  const updateMentor = (id: string, mentorUpdates: Partial<Mentor>) => {
    setMentors(prev => prev.map(m => {
      if (m.id === id) {
        const updated = { ...m, ...mentorUpdates };
        if (mentorUpdates.name) {
          updated.slug = mentorUpdates.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        }
        return updated;
      }
      return m;
    }));
    const mName = mentors.find(m => m.id === id)?.name || 'Mentor';
    logAdminAction(`Modified Mentor Profile: ${mName}`, id, 'Mentors');
    toast.success(`Mentor parameters for "${mName}" rectified successfully!`);
  };

  const deleteMentor = (id: string) => {
    const mName = mentors.find(m => m.id === id)?.name || 'Mentor';
    setMentors(prev => prev.filter(m => m.id !== id));
    logAdminAction(`Expelled Mentor Profile: ${mName}`, id, 'Mentors');
    toast.error(`Mentor "${mName}" removed from faculty roster.`);
  };

  // PUBLICATIONS ACTIONS
  const addPublication = (pub: Omit<Publication, 'id' | 'date'>) => {
    const newPub: Publication = {
      ...pub,
      id: `pub-${Date.now()}`,
      date: new Date().toISOString().substring(0, 10)
    };
    setPublications(prev => [newPub, ...prev]);
    logAdminAction(`Drafted Publication: "${pub.title}" [${pub.status}]`, newPub.id, 'Publications');
    toast.success(`Publication cataloged successfully as ${pub.status}.`);
  };

  const updatePublication = (id: string, pubUpdates: Partial<Publication>) => {
    setPublications(prev => prev.map(p => p.id === id ? { ...p, ...pubUpdates } : p));
    const title = publications.find(p => p.id === id)?.title || 'Article';
    logAdminAction(`Modified Publication: "${title}"`, id, 'Publications');
    toast.success(`Core text for "${title.substring(0, 30)}..." has been synchronized and saved.`);
  };

  const deletePublication = (id: string) => {
    const title = publications.find(p => p.id === id)?.title || 'Publication';
    setPublications(prev => prev.filter(p => p.id !== id));
    logAdminAction(`Discarded Publication: "${title}"`, id, 'Publications');
    toast.error(`Publication removed from database.`);
  };

  // FELLOW CONTENT MODERATION
  const moderateFellowContent = (id: string, newStatus: FellowContent['status']) => {
    setFellowContents(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
    const item = fellowContents.find(c => c.id === id);
    const contentTitle = item?.title || 'Shared item';
    const publisher = item?.fellowName || 'Fellow';
    logAdminAction(`Moderated content item: "${contentTitle}" by ${publisher} to [${newStatus}]`, id, 'Moderation');
    
    if (newStatus === 'Flagged') {
      toast.warning(`Content flagged for immediate policy audit: "${contentTitle.substring(0, 20)}..."`);
    } else if (newStatus === 'Hidden') {
      toast.info(`Content hidden from general public feed.`);
    } else if (newStatus === 'Approved') {
      toast.success(`Content verified and whitelisted.`);
    } else {
      toast.success(`Content restored to Active status.`);
    }
  };

  // METRIC RECTIFICATION
  const updateEngagementData = (month: string, field: keyof GrowthChartData, value: number) => {
    setGrowthData(prev => prev.map(row => {
      if (row.month === month) {
        return { ...row, [field]: value };
      }
      return row;
    }));
    logAdminAction(`Rectified Growth Analytics for ${month}: set ${field} to ${value}`, `${month}-${field}`, 'System');
    toast.success('Growth database statistics updated instantly!');
  };

  const updateMembershipCount = (region: string, count: number) => {
    setMembershipData(prev => prev.map(row => {
      if (row.region === region) {
        return { ...row, count };
      }
      return row;
    }));
    logAdminAction(`Rectified membership statistics for ${region}: ${count}`, region, 'System');
    toast.success('Regional enrollment maps synchronized!');
  };

  // DELETE & ADD FELLOW CONTENT (Posts, files, etc)
  const deleteFellowContent = (id: string) => {
    const title = fellowContents.find(c => c.id === id)?.title || 'Post';
    setFellowContents(prev => prev.filter(c => c.id !== id));
    logAdminAction(`Permanently deleted Fellow content: "${title}"`, id, 'Moderation');
    toast.error(`Content item "${title}" deleted permanently.`);
  };

  const addFellowContent = (title: string, excerpt: string, contentType: FellowContent['contentType'], fellowName: string, fellowEmail: string) => {
    const newItem: FellowContent = {
      id: `fel-c-${Date.now()}`,
      fellowName,
      fellowEmail,
      contentType,
      title,
      excerpt,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'Active'
    };

    (async () => {
      try {
        toast.loading('Analyzing content integrity with AI...', { id: 'moderation-scan-active' });
        const scanResult = await scanContentAI(`${title} ${excerpt}`, title, fellowName);
        toast.dismiss('moderation-scan-active');
        
        if (scanResult.flagged) {
          newItem.status = 'Flagged';
          setFellowContents(prev => [newItem, ...prev]);
          await reportModerationViolation(newItem.id, newItem.contentType, newItem.title, newItem.fellowName, newItem.excerpt, scanResult);
          toast.warning(`Content submitted, but flagged for review by AI moderator: "${scanResult.reason}"`, {
            duration: 5000
          });
        } else {
          setFellowContents(prev => [newItem, ...prev]);
          toast.success('Your discussion/content has been posted to the fellowship feed!');
        }
      } catch (err) {
        toast.dismiss('moderation-scan-active');
        setFellowContents(prev => [newItem, ...prev]);
        toast.success('Your discussion/content has been posted to the fellowship feed!');
      }
    })();
  };

  // USERS MANAGEMENT ACTIONS
  const updateUser = (userId: string, updates: Partial<UserItem>) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const merged = { ...u, ...updates };
        if (updates.role) {
          if (updates.role === 'super-admin') merged.permissions = ['Read', 'Write', 'Delete', 'Super'];
          else if (updates.role === 'admin') merged.permissions = ['Read', 'Write', 'Delete'];
          else if (updates.role === 'mentor') merged.permissions = ['Read', 'Write'];
          else merged.permissions = ['Read'];
        }
        return merged;
      }
      return u;
    }));
    const username = users.find(u => u.id === userId)?.name || 'Fellow';
    logAdminAction(`Updated user parameters for "${username}"`, userId, 'System');
    toast.success(`Roles/permissions for "${username}" updated!`);
  };

  const banUser = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const newStatus = u.status === 'Banned' ? 'Active' : 'Banned';
        logAdminAction(`${newStatus === 'Banned' ? 'Banned' : 'Unbanned'} fellow account: ${u.name}`, userId, 'Security');
        toast.info(`Fellow account "${u.name}" has been ${newStatus === 'Banned' ? 'Banned' : 'Re-activated'}.`);
        return { ...u, status: newStatus };
      }
      return u;
    }));
  };

  const deleteUser = (userId: string) => {
    const username = users.find(u => u.id === userId)?.name || 'User';
    setUsers(prev => prev.filter(u => u.id !== userId));
    logAdminAction(`Expelled user account: ${username}`, userId, 'Security');
    toast.error(`Account for "${username}" has been fully purged from rosters.`);
  };

  // DEBATE ACTIONS
  const addDebateMessage = (msg: Omit<DebateMessage, 'id' | 'timestamp'>) => {
    const newMsg: DebateMessage = {
      ...msg,
      id: `deb-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setDebates(prev => [...prev, newMsg]);
  };

  const clearDebates = () => {
    setDebates([{
      id: `deb-init-${Date.now()}`,
      role: 'moderator',
      content: 'Debate terminal cleared by supervisor. Initiating new argument rounds.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
  };

  // VIRTUAL ROOMS ACTIONS
  const addRoomMessage = (roomId: string, msg: Omit<RoomMessage, 'id' | 'time'>) => {
    setVirtualRooms(prev => prev.map(room => {
      if (room.id === roomId) {
        return {
          ...room,
          messages: [
            ...room.messages,
            {
              ...msg,
              id: `msg-${Date.now()}`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]
        };
      }
      return room;
    }));
  };

  const addRoomTranscript = (roomId: string, transcript: Omit<RoomTranscript, 'id' | 'time'>) => {
    setVirtualRooms(prev => prev.map(room => {
      if (room.id === roomId) {
        return {
          ...room,
          transcripts: [
            ...room.transcripts,
            {
              ...transcript,
              id: `trans-${Date.now()}`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]
        };
      }
      return room;
    }));
  };

  const updateRoomTopic = (roomId: string, topic: string) => {
    setVirtualRooms(prev => prev.map(room => {
      if (room.id === roomId) {
        logAdminAction(`Rectified room presentation focus for "${room.name}"`, roomId, 'System');
        return { ...room, topic };
      }
      return room;
    }));
    toast.success('Room presentation topic updated across nodes.');
  };

  const toggleParticipantMedia = (roomId: string, participantId: string, type: 'mic' | 'video' | 'joined' | 'left', extra?: any) => {
    setVirtualRooms(prev => prev.map(room => {
      if (room.id === roomId) {
        if (type === 'joined') {
          const alreadyIn = room.participants.some(p => p.name === extra?.name);
          if (alreadyIn) return room;
          return {
            ...room,
            participants: [...room.participants, { id: participantId, name: extra?.name || 'Fellow', avatar: '', isMuted: false, isVideoOff: false, role: 'Fellow' }]
          };
        }
        if (type === 'left') {
          return {
            ...room,
            participants: room.participants.filter(p => p.id !== participantId && p.name !== extra?.name)
          };
        }
        return {
          ...room,
          participants: room.participants.map(p => {
            if (p.id === participantId) {
              return {
                ...p,
                isMuted: type === 'mic' ? !p.isMuted : p.isMuted,
                isVideoOff: type === 'video' ? !p.isVideoOff : p.isVideoOff
              };
            }
            return p;
          })
        };
      }
      return room;
    }));
  };

  // INCIDENT REPORT ACTIONS
  const submitIncidentReport = (report: Omit<IncidentReport, 'id' | 'timestamp' | 'status'>) => {
    const newReport: IncidentReport = {
      ...report,
      id: `rep-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'Pending'
    };
    setIncidentReports(prev => [newReport, ...prev]);
    logAdminAction(`Incident logged against "${report.targetName}" in ${report.channel}`, newReport.id, 'Security');
  };

  const updateReportStatus = (reportId: string, status: IncidentReport['status']) => {
    setIncidentReports(prev => prev.map(r => r.id === reportId ? { ...r, status } : r));
    const reportItem = incidentReports.find(r => r.id === reportId);
    if (reportItem) {
      logAdminAction(`Updated incident report status for target "${reportItem.targetName}" to [${status}]`, reportId, 'Security');
      toast.success(`Incident report against "${reportItem.targetName}" marked as ${status}.`);
    }
  };

  return (
    <AdminStateContext.Provider value={{
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
      addFellowContent,
      auditLogs,
      logAdminAction,
      clearAuditLogs,
      membershipData,
      growthData,
      updateEngagementData,
      updateMembershipCount,
      reseedMockContent,
      
      // New synchronised collections & methods
      users,
      updateUser,
      banUser,
      deleteUser,
      debates,
      addDebateMessage,
      clearDebates,
      virtualRooms,
      addRoomMessage,
      addRoomTranscript,
      updateRoomTopic,
      toggleParticipantMedia,
      incidentReports,
      submitIncidentReport,
      updateReportStatus
    }}>
      {children}
    </AdminStateContext.Provider>
  );
};
