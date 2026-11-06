import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, MapPin, Building2, Calendar, ShieldCheck, ArrowRight, Award, Layers } from 'lucide-react';

interface RegionData {
  id: string;
  name: string;
  countriesCount: number;
  hubCity: string;
  leader: string;
  activeFellows: number;
  projectsCount: number;
  keyProjects: string[];
  keyPartners: string[];
  upcomingEvents: string[];
  description: string;
  color: string;
}

const REGIONS_DATA: RegionData[] = [
  {
    id: 'southern',
    name: 'Southern Africa Hub',
    countriesCount: 10,
    hubCity: 'Cape Town, Western Cape, South Africa',
    leader: 'Lusimanadio Soki Simao & Regional Secretariat',
    activeFellows: 28400,
    projectsCount: 38,
    keyProjects: ['Decentralized Clean Microgrids Initiative', 'SADC Youth Public Policy Fellowship', 'Southern Africa Water Sovereignty Lab'],
    keyPartners: ['University of the Witwatersrand', 'SADC Secretariat', 'Development Bank of Southern Africa', 'Standard Bank Group'],
    upcomingEvents: ['Southern Africa Youth Leadership Summit 2026', 'Cape Town Governance Policy Forum'],
    description: 'Serving as the central diplomatic & research seat of Golden Minds Africa, driving institutional policy labs and youth capital accelerators.',
    color: '#D4AF37'
  },
  {
    id: 'east',
    name: 'East Africa Hub',
    countriesCount: 12,
    hubCity: 'Kigali (Rwanda) & Nairobi (Kenya)',
    leader: 'Dr. Marie Uwase & East Africa Directorate',
    activeFellows: 26100,
    projectsCount: 42,
    keyProjects: ['East African Digital Sovereignty & Governance', 'Kigali Youth Policy Lab', 'Sustainable Agriculture & Climate Resilience Network'],
    keyPartners: ['East African Community (EAC)', 'African Development Bank (AfDB)', 'University of Nairobi', 'Smart Africa Alliance'],
    upcomingEvents: ['Pan-African Future Summit 2026 - Kigali', 'Nairobi Digital Policy Conference'],
    description: 'Pioneering AI governance, cross-border digital trade policies, and youth tech entrepreneurship across the EAC region.',
    color: '#0E7A57'
  },
  {
    id: 'west',
    name: 'West Africa Hub',
    countriesCount: 15,
    hubCity: 'Lagos & Abuja (Nigeria) / Accra (Ghana)',
    leader: 'Prof. Kwame Mensah & ECOWAS Policy Bureau',
    activeFellows: 31200,
    projectsCount: 45,
    keyProjects: ['ECOWAS Trade Integration & AfCFTA Youth Accelerator', 'West Africa Electoral Integrity Lab', 'Coastal Environmental Resilience'],
    keyPartners: ['ECOWAS Commission', 'University of Ghana', 'Tony Elumelu Foundation', 'Lagos Business School'],
    upcomingEvents: ['West Africa Women in Governance Summit - Accra', 'Lagos Public Policy Hackathon'],
    description: 'Mobilizing West Africa’s vibrant youth demographic into civic leadership, parliamentary policy research, and trade integration.',
    color: '#3B82F6'
  },
  {
    id: 'north',
    name: 'North Africa Hub',
    countriesCount: 7,
    hubCity: 'Cairo (Egypt) & Rabat (Morocco)',
    leader: 'Dr. Amina El-Sayed & Mediterranean Diplomacy Bureau',
    activeFellows: 14800,
    projectsCount: 22,
    keyProjects: ['North Africa Renewable Energy Diplomacy', 'Afro-Arab Youth Leadership Exchange', 'Mediterranean Water Policy Consortium'],
    keyPartners: ['Cairo University', 'Arab League Secretariat', 'African Export-Import Bank (Afreximbank)', 'UfM Secretariat'],
    upcomingEvents: ['Afro-Arab Diplomatic Youth Forum - Cairo', 'Rabat Policy Dialogue Series'],
    description: 'Connecting North Africa with Sub-Saharan policy networks, fostering Afro-Arab diplomatic exchange, renewable energy research, and trade.',
    color: '#EC4899'
  },
  {
    id: 'central',
    name: 'Central Africa Hub',
    countriesCount: 10,
    hubCity: 'Kinshasa (DRC) & Yaoundé (Cameroon)',
    leader: 'Jean-Luc Mbeki & ECCAS Youth Directorate',
    activeFellows: 18500,
    projectsCount: 28,
    keyProjects: ['Congo Basin Rainforest & Critical Minerals Governance', 'ECCAS Youth Peace & Security Framework', 'Central Africa Tele-Education'],
    keyPartners: ['ECCAS Secretariat', 'Congo Basin Forest Partnership', 'University of Kinshasa', 'African Union Peace & Security Council'],
    upcomingEvents: ['Kinshasa Climate & Peace Governance Summit', 'Yaoundé Youth Leadership Academy'],
    description: 'Championing environmental diplomacy, critical mineral value chain governance, and peacebuilding initiatives across the Congo Basin.',
    color: '#8B5CF6'
  }
];

export default function ContinentalMapExplorer() {
  const [selectedRegion, setSelectedRegion] = useState<RegionData>(REGIONS_DATA[0]);
  const [activeTab, setActiveTab] = useState<'projects' | 'partners' | 'events'>('projects');

  return (
    <div className="w-full bg-[#08080A] rounded-3xl border border-white/15 p-6 md:p-10 shadow-2xl overflow-hidden relative">
      {/* Background Lighting Effects */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#0E7A57]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8 pb-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-white">
            Regional Command <span className="text-[#D4AF37]">Bureau</span>
          </h2>
          <p className="text-gray-400 mt-2 text-sm md:text-base max-w-2xl">
            Select a regional hub bureau below to inspect active governance policy projects, institutional partners, regional hub offices, and live youth impact figures.
          </p>
        </div>

        {/* Region Selector Dropbox */}
        <div className="relative w-full sm:w-80">
          <div className="flex items-center gap-2.5 bg-black/80 border border-white/20 rounded-xl px-4 py-2.5 focus-within:border-white/50 transition-colors shadow-lg">
            <Globe className="w-4 h-4 text-[#D4AF37] shrink-0 pointer-events-none" />
            <span className="text-xs text-gray-400 font-medium shrink-0">Hub Bureau:</span>
            <select
              value={selectedRegion.id}
              onChange={(e) => {
                const reg = REGIONS_DATA.find(r => r.id === e.target.value);
                if (reg) setSelectedRegion(reg);
              }}
              className="w-full bg-transparent text-xs sm:text-sm font-bold text-white focus:outline-none cursor-pointer [&>option]:bg-[#0E0E14] [&>option]:text-white"
            >
              <option value="southern">Southern Africa Hub</option>
              <option value="east">East Africa Hub</option>
              <option value="west">West Africa Hub</option>
              <option value="north">North Africa Hub</option>
              <option value="central">Central Africa Hub</option>
            </select>
          </div>
        </div>
      </div>

      {/* Detailed Region Hub Panel - Full Width Showcase */}
      <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-white/10">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedRegion.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Hub Title & Stats Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#D4AF37] uppercase tracking-widest mb-1">
                  <MapPin className="w-3.5 h-3.5" /> Regional Command Seat
                </div>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white flex flex-wrap items-center gap-3">
                  {selectedRegion.name}
                  <span className="text-xs font-sans font-normal px-3 py-1 bg-[#D4AF37]/15 text-[#D4AF37] rounded-full">
                    {selectedRegion.countriesCount} Member States
                  </span>
                </h3>
                <p className="text-gray-300 text-sm sm:text-base mt-2 leading-relaxed max-w-3xl">
                  {selectedRegion.description}
                </p>
              </div>

              {/* Counter Pill */}
              <div className="shrink-0 p-4 rounded-2xl bg-black/60 border border-white/15 text-right">
                <div className="text-xs text-gray-400 font-medium">Empowered Youth Fellows</div>
                <div className="text-2xl font-serif font-bold text-[#D4AF37] mt-0.5">
                  {selectedRegion.activeFellows.toLocaleString()}+
                </div>
              </div>
            </div>

            {/* Stat Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-black/40 border border-white/10">
                <div className="text-xs text-gray-400 font-medium">Headquarter Hubs</div>
                <div className="text-sm font-bold text-white mt-1.5 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span>{selectedRegion.hubCity}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/10">
                <div className="text-xs text-gray-400 font-medium">Regional Leadership</div>
                <div className="text-sm font-bold text-white mt-1.5 flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span>{selectedRegion.leader}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/10">
                <div className="text-xs text-gray-400 font-medium">Active Initiatives</div>
                <div className="text-sm font-bold text-[#D4AF37] mt-1.5 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span>{selectedRegion.projectsCount} Public Policy Programs</span>
                </div>
              </div>
            </div>

            {/* Sub-Tabs: Projects / Partners / Events */}
            <div className="pt-2">
              <div className="flex mb-4 overflow-x-auto gap-2">
                <button
                  onClick={() => setActiveTab('projects')}
                  className={`py-2 px-4 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                    activeTab === 'projects'
                      ? 'bg-white text-black'
                      : 'bg-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  Active Projects ({selectedRegion.keyProjects.length})
                </button>
                <button
                  onClick={() => setActiveTab('partners')}
                  className={`py-2 px-4 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                    activeTab === 'partners'
                      ? 'bg-white text-black'
                      : 'bg-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  Partners ({selectedRegion.keyPartners.length})
                </button>
                <button
                  onClick={() => setActiveTab('events')}
                  className={`py-2 px-4 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                    activeTab === 'events'
                      ? 'bg-white text-black'
                      : 'bg-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  Regional Summits
                </button>
              </div>

              {/* Tab Content List Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                {activeTab === 'projects' &&
                  selectedRegion.keyProjects.map((proj, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-gray-200 hover:border-white/30 transition-colors">
                      <span className="font-medium text-xs sm:text-sm flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                        {proj}
                      </span>
                      <span className="text-[10px] text-[#D4AF37] font-semibold uppercase px-2 py-0.5 rounded bg-[#D4AF37]/10">Active</span>
                    </div>
                  ))}

                {activeTab === 'partners' &&
                  selectedRegion.keyPartners.map((part, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-gray-200">
                      <span className="font-medium text-xs sm:text-sm flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-blue-400 shrink-0" />
                        {part}
                      </span>
                      <span className="text-[10px] text-gray-400 uppercase px-2 py-0.5 rounded bg-white/5">MoU Signed</span>
                    </div>
                  ))}

                {activeTab === 'events' &&
                  selectedRegion.upcomingEvents.map((evt, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-white/5 border border-white/15 flex items-center justify-between text-white">
                      <span className="font-medium text-xs sm:text-sm flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#D4AF37] shrink-0" />
                        {evt}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-white text-black rounded uppercase">2026</span>
                    </div>
                  ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
