import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Globe, Users, Star, Search, MapPin, Briefcase, MessageSquare, Calendar, Award } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Routes, Route, useNavigate, useLocation, Navigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function NetworkMain() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [fellows, setFellows] = useState<any[]>([]);
  const [loadingFellows, setLoadingFellows] = useState(true);
  
  useEffect(() => {
    const fetchFellows = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'fellow');
          
        if (error) throw error;
        if (data) setFellows(data);
      } catch (error) {
        console.error("Error fetching fellows:", error);
      } finally {
        setLoadingFellows(false);
      }
    };
    fetchFellows();
  }, []);
  
  // Determine active tab from URL
  const activeTab = location.pathname.includes('/mentors') ? 'mentors' : 
                    location.pathname.includes('/opportunities') ? 'opportunities' : 
                    location.pathname.includes('/alumni') ? 'alumni' : 'directory';

  const tabs = [
    { id: 'directory', label: 'Fellow Directory', icon: Globe, path: '/pan-african-network/fellows' },
    { id: 'mentors', label: 'AI Mentor Match', icon: Star, path: '/pan-african-network/mentors' },
    { id: 'opportunities', label: 'Opportunity Market', icon: Briefcase, path: '/pan-african-network/opportunities' },
    { id: 'alumni', label: 'Alumni Legacy', icon: Award, path: '/pan-african-network/alumni' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 
            className="text-3xl md:text-4xl font-bold font-serif text-gray-900 cursor-pointer hover:underline"
            onClick={() => navigate('/pan-african-network')}
          >
            Pan-African Network
          </h1>
          <p className="text-gray-500 mt-2">Connect, collaborate, and grow with leaders across the continent.</p>
        </div>
      </div>

      <div className="flex gap-4 border-b border-gray-200 overflow-x-auto hide-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => navigate(tab.path)}
            className={`flex items-center gap-2 px-4 sm:px-6 py-4 font-medium transition-colors relative whitespace-nowrap ${
              activeTab === tab.id ? 'text-[#ff4e00]' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ff4e00]"
              />
            )}
          </button>
        ))}
      </div>

      {activeTab === 'directory' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search fellows by name, country, or interest..." 
                className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ff4e00]/20 focus:border-[#ff4e00]"
              />
            </div>
            <button className="px-4 sm:px-6 py-2.5 sm:py-3 bg-white border border-gray-200 text-gray-700 text-sm sm:text-base font-medium rounded-xl hover:bg-gray-50 transition-colors w-full sm:w-auto">
              Filters
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {loadingFellows ? (
              <div className="col-span-full text-center py-8 text-gray-500">Loading fellows...</div>
            ) : fellows.length > 0 ? (
              fellows.map((fellow) => (
                <div key={fellow.id} className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-200 hover:shadow-lg transition-all flex flex-col">
                  <div className="flex items-center gap-3 sm:gap-4 mb-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full overflow-hidden shrink-0">
                      <img src={fellow.avatar || `https://ui-avatars.com/api/?name=${fellow.name}`} alt={fellow.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm sm:text-base">{fellow.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> Fellow</p>
                    </div>
                  </div>
                  
                  {fellow.showBioAndSkills !== false && (
                    <>
                      {fellow.bio && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-3">{fellow.bio}</p>
                      )}
                      {fellow.skills && (
                        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4">
                          {fellow.skills.split(',').map((skill: string, idx: number) => (
                            <span key={idx} className="px-2 sm:px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] sm:text-xs font-medium">
                              {skill.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                  
                  <div className="flex gap-2 mt-auto">
                    <button className="flex-1 py-2 bg-gray-50 text-gray-700 rounded-xl text-xs sm:text-sm font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
                      <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" /> Message
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-500">No fellows found.</div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'mentors' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] text-white p-6 sm:p-8 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff4e00] opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-2xl sm:text-3xl font-bold font-serif mb-4">AI Mentor Matching</h2>
              <p className="text-gray-300 mb-6 text-sm sm:text-base">Our AI analyzes your goals, interests, and skill gaps to connect you with the perfect mentor from our global network of leaders.</p>
              <button className="px-6 py-3 bg-[#ff4e00] text-white font-bold rounded-xl hover:bg-[#e64600] transition-colors flex items-center gap-2 w-full sm:w-auto justify-center">
                <Star className="w-5 h-5" /> Find My Match
              </button>
            </div>
          </div>

          <h3 className="text-lg sm:text-xl font-bold font-serif text-gray-900 mt-6 sm:mt-8 mb-4">Recommended Matches</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-200 flex flex-col sm:flex-row gap-4 sm:gap-6">
                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 rounded-2xl overflow-hidden shrink-0 mx-auto sm:mx-0">
                  <img src={`https://picsum.photos/seed/mentor${i}/200/200`} alt="Mentor" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start mb-2 gap-2">
                    <div className="text-center sm:text-left">
                      <h3 className="font-bold text-gray-900 text-base sm:text-lg">Dr. Mentor Name {i}</h3>
                      <p className="text-xs sm:text-sm text-gray-500 flex items-center justify-center sm:justify-start gap-1"><Briefcase className="w-3 h-3" /> Former Minister of Tech</p>
                    </div>
                    <div className="bg-green-50 text-green-600 px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold flex items-center gap-1 shrink-0">
                      <Star className="w-3 h-3 fill-current" /> 98% Match
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-4 line-clamp-2 text-center sm:text-left">Expert in digital infrastructure policy and scaling tech startups across East Africa.</p>
                  <button className="w-full py-2 bg-gray-50 text-gray-900 rounded-xl text-xs sm:text-sm font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 mt-auto">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4" /> Request Meeting
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'opportunities' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-[#ff4e00] to-[#ff8c00] text-white p-6 sm:p-8 rounded-3xl relative overflow-hidden">
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-2xl sm:text-3xl font-bold font-serif mb-4">Opportunity Marketplace</h2>
              <p className="text-white/90 mb-6 text-sm sm:text-base">AI-curated scholarships, grants, and speaking opportunities tailored to your leadership profile.</p>
              <div className="flex gap-4">
                <button className="px-6 py-3 bg-white text-[#ff4e00] font-bold rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-2 w-full sm:w-auto justify-center">
                  <Search className="w-5 h-5" /> Browse All
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              { type: 'Grant', title: 'African Tech Innovation Fund', amount: '$50,000', deadline: 'Oct 30', match: '95%' },
              { type: 'Speaking', title: 'Youth Policy Summit 2026', location: 'Kigali, Rwanda', deadline: 'Nov 15', match: '88%' },
              { type: 'Fellowship', title: 'Global Governance Scholars', location: 'Oxford, UK', deadline: 'Dec 01', match: '82%' },
            ].map((opp, i) => (
              <div key={i} className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-200 hover:shadow-lg transition-all flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3 sm:mb-4">
                    <span className="px-2 sm:px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider">{opp.type}</span>
                    <span className="text-xs sm:text-sm font-bold text-green-600 flex items-center gap-1"><Star className="w-3 h-3 fill-current" /> {opp.match} Match</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{opp.title}</h3>
                  <p className="text-gray-500 text-xs sm:text-sm mb-4">
                    {opp.amount && <span className="block">Funding: {opp.amount}</span>}
                    {opp.location && <span className="block">Location: {opp.location}</span>}
                    <span className="block text-[#ff4e00] font-medium mt-1">Deadline: {opp.deadline}</span>
                  </p>
                </div>
                <button className="w-full py-2 bg-gray-50 text-gray-900 rounded-xl text-xs sm:text-sm font-bold hover:bg-gray-100 transition-colors">
                  Apply Now
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'alumni' && (
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 text-center">
            <Award className="w-12 h-12 sm:w-16 sm:h-16 text-[#ff4e00] mx-auto mb-3 sm:mb-4" />
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold font-serif text-gray-900 mb-2">Alumni Legacy Network</h2>
            <p className="text-gray-500 max-w-xl mx-auto mb-4 sm:mb-6 text-xs sm:text-sm md:text-base">Connect with graduates of the Golden Minds Fellowship. Access exclusive opportunities, investment networks, and speaking engagements.</p>
            <button className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-900 text-white text-sm sm:text-base font-bold rounded-xl hover:bg-gray-800 transition-colors w-full sm:w-auto">
              Explore Alumni Directory
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Network() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="fellows" replace />} />
      <Route path="fellows" element={<NetworkMain />} />
      <Route path="fellows/:fellowId" element={<NetworkMain />} />
      <Route path="mentors" element={<NetworkMain />} />
      <Route path="mentors/match" element={<NetworkMain />} />
      <Route path="mentors/recommendations" element={<NetworkMain />} />
      <Route path="mentors/:mentorId" element={<NetworkMain />} />
      <Route path="mentors/:mentorId/request-meeting" element={<NetworkMain />} />
      <Route path="opportunities" element={<NetworkMain />} />
      <Route path="opportunities/:opportunityId" element={<NetworkMain />} />
      <Route path="opportunities/:opportunityId/apply" element={<NetworkMain />} />
      <Route path="alumni" element={<NetworkMain />} />
      <Route path="alumni/directory" element={<NetworkMain />} />
      <Route path="alumni/:alumniId" element={<NetworkMain />} />
      <Route path="alumni/opportunities" element={<NetworkMain />} />
      <Route path="search" element={<NetworkMain />} />
    </Routes>
  );
}
