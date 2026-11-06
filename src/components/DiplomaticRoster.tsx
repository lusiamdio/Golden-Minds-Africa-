import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Globe2, 
  Flag, 
  MapPin, 
  GraduationCap, 
  Layers, 
  ChevronRight, 
  Building2, 
  Users, 
  Sparkles,
  CheckCircle2,
  Compass
} from 'lucide-react';

interface StructureTier {
  id: string;
  tierNumber: string;
  title: string;
  level: string;
  icon: React.ElementType;
  scope: string;
  mandate: string;
  keyResponsibilities: string[];
  composition: string[];
}

const ORGANIZATIONAL_TIERS: StructureTier[] = [
  {
    id: 'office-of-president',
    tierNumber: 'Tier I',
    title: 'Office of the President',
    level: 'Supreme Continental Executive & Sovereign Directorate',
    icon: ShieldCheck,
    scope: 'Continental & Global Multilateral Scope (54 African Nations)',
    mandate: 'Provides supreme strategic vision, diplomatic charter promulgation, high-level continental representation, and executive stewardship for Golden Minds Africa.',
    keyResponsibilities: [
      'Continental Vision & Strategic Directives across all African Member States',
      'High-Level Sovereign Engagement with African Union (AU), Governments, and Global Organs',
      'Presidential Charters, Treaties & Strategic Institutional Partnerships',
      'Executive Oversight of Continental Resource Allocation and Governance Frameworks'
    ],
    composition: [
      'Founder & President',
      'Deputy President',
      'Presidential Special Advisers & Legal Counsel',
      'Executive Chief of Staff & Diplomatic Secretariat'
    ]
  },
  {
    id: 'regional-committee',
    tierNumber: 'Tier II',
    title: 'Regional Commitee',
    level: 'Regional Coordination & Inter-State Governance Bureaus',
    icon: Globe2,
    scope: 'Regional Blocs: Southern, East, West, North, & Central Africa',
    mandate: 'Coordinates multi-country policy labs, regional youth summits, AfCFTA trade initiatives, and alignment with regional economic communities (SADC, EAC, ECOWAS, ECCAS, UMA).',
    keyResponsibilities: [
      'Inter-National Chapter Harmonization & Regional Policy Formulation',
      'Coordination of Regional Command Bureaus & Bilateral Youth Compacts',
      'Monitoring Continental Strategic Pillar Execution across Sub-Regions',
      'Regional Crisis Management & Cross-Border Academic Consortia'
    ],
    composition: [
      'Regional High Commissioners & Regional Directors',
      'Regional Policy & Economic Advisors',
      'Cross-Border Youth Trade & Innovation Coordinators'
    ]
  },
  {
    id: 'national-committee',
    tierNumber: 'Tier III',
    title: 'National Commitee',
    level: 'National Chapter Directorate & State-Level Executive',
    icon: Flag,
    scope: 'Individual African Sovereign States & National Jurisdictions',
    mandate: 'Oversees country-wide operations, parliamentary dialogues, stakeholder partnerships with national ministries, and national youth fellowship cohorts.',
    keyResponsibilities: [
      'National Chapter Governance, Registration & Regulatory Compliance',
      'Liaison with National Ministries of Youth, Foreign Affairs & Higher Education',
      'Execution of National Diplomatic Roundtables & Policy Research Publications',
      'Supervision and Resource Allocation for Provincial & State Chapters'
    ],
    composition: [
      'Country Director / National Director',
      'National Deputy Directors & Operations Officers',
      'National Policy, Communications & Sponsorship Secretaries'
    ]
  },
  {
    id: 'provincial-committee',
    tierNumber: 'Tier IV',
    title: 'Provincial Commitee',
    level: 'Sub-National, Provincial & Municipal Leadership Councils',
    icon: MapPin,
    scope: 'Provinces, States, Counties, Regions & Municipalities',
    mandate: 'Drives grassroots civic engagement, regional outreach campaigns, local community development forums, and sub-national youth leadership assemblies.',
    keyResponsibilities: [
      'Provincial Chapter Administration & Local Community Activations',
      'Grassroots Civic Education & Youth Policy Townhalls',
      'Liaison with Local Government Municipalities and Traditional Authorities',
      'Provincial Leadership Incubators & Community Development Projects'
    ],
    composition: [
      'Provincial / State Directors',
      'Municipal Civic Coordinators',
      'Regional Youth Engagement & Outreach Officers'
    ]
  },
  {
    id: 'university-envoys',
    tierNumber: 'Tier V',
    title: 'University Special Envoys and Chapter Ambassadors',
    level: 'Higher Education Academic Chapters & Campus Diplomatic Corps',
    icon: GraduationCap,
    scope: 'Public & Private Universities, Colleges & Academic Institutions across Africa',
    mandate: 'Cultivates university student leadership, organizes campus policy debates and diplomatic simulations, conducts collegiate research, and recruits rising scholars.',
    keyResponsibilities: [
      'University Campus Chapter Administration & Student Union Liaison',
      'Pan-African Model UN & Parliamentary Simulation Programs',
      'Academic Policy Research Labs & Merit Scholarship Peer Advocacy',
      'Inter-University Student Delegations & Youth Leadership Seminars'
    ],
    composition: [
      'University Chapter Presidents & Campus Ambassadors',
      'University Special Envoys to Student Governing Bodies',
      'Academic Research Secretaries & Collegiate Chapter Executives'
    ]
  }
];

export default function DiplomaticRoster() {
  const [selectedTier, setSelectedTier] = useState<StructureTier | null>(null);

  return (
    <section id="leadership" className="py-24 px-4 sm:px-6 relative bg-gradient-to-b from-[#08080A] via-[#0D0E14] to-[#08080A] overflow-hidden">
      {/* Background Decorative Gold Ambient Blurs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[#D4AF37]/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="container mx-auto max-w-7xl relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white tracking-tight">
            Continental <span className="text-gold-gradient">Organizational Structure</span>
          </h2>
        </div>

        {/* 5-Tier Organizational Hierarchy Structure */}
        <div className="max-w-5xl mx-auto space-y-5 relative">

          {ORGANIZATIONAL_TIERS.map((tier, index) => {
            const Icon = tier.icon;
            const isTopTier = index === 0;

            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative rounded-3xl transition-all duration-300 border backdrop-blur-md overflow-hidden ${
                  isTopTier
                    ? 'bg-gradient-to-br from-[#121722] via-[#0E1018] to-[#0A0B10] border-white/20 shadow-2xl'
                    : 'bg-[#0D0E14]/90 hover:bg-[#12131C] border-white/10 hover:border-white/30 shadow-xl'
                }`}
              >
                {/* Accent Top Bar for Top Tier */}
                {isTopTier && (
                  <div className="h-1 w-full bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#B8860B]" />
                )}

                <div className="p-6 sm:p-8">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    
                    {/* Left: Tier Number, Icon & Titles */}
                    <div className="flex items-start sm:items-center gap-4 sm:gap-6">
                      {/* Icon Circle */}
                      <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shrink-0 border relative z-10 transition-transform ${
                        isTopTier
                          ? 'bg-gradient-to-br from-[#1C2333] to-[#0A0D15] border-white/20 text-[#D4AF37] shadow-lg'
                          : 'bg-[#141520] border-white/15 text-[#D4AF37] group-hover:border-white/30'
                      }`}>
                        <Icon className="w-7 h-7" />
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase border ${
                            isTopTier
                              ? 'bg-[#D4AF37]/20 text-[#D4AF37] border-white/20'
                              : 'bg-white/10 text-gray-300 border-white/15'
                          }`}>
                            {tier.tierNumber}
                          </span>
                          <span className="text-xs text-gray-400 font-medium">
                            {tier.scope}
                          </span>
                        </div>

                        <h3 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-white">
                          {tier.title}
                        </h3>

                        <p className="text-xs sm:text-sm font-medium text-[#D4AF37] mt-0.5">
                          {tier.level}
                        </p>
                      </div>
                    </div>

                    {/* Right: Quick Action to View Detailed Mandate */}
                    <div className="w-full md:w-auto flex items-center justify-end">
                      <button
                        onClick={() => setSelectedTier(tier)}
                        className={`w-full md:w-auto px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                          isTopTier
                            ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black hover:shadow-lg'
                            : 'bg-white/10 hover:bg-[#D4AF37] text-white hover:text-black border border-white/15'
                        }`}
                      >
                        <span>Charter & Mandate</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                  </div>

                  {/* Concise Mandate Text */}
                  <p className="text-xs sm:text-sm text-gray-300 mt-5 pt-5 leading-relaxed font-sans">
                    {tier.mandate}
                  </p>

                  {/* Highlights Bullets */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4 pt-2">
                    {tier.keyResponsibilities.slice(0, 2).map((resp, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-gray-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37] shrink-0 mt-0.5" />
                        <span className="leading-snug">{resp}</span>
                      </div>
                    ))}
                  </div>

                </div>
              </motion.div>
            );
          })}

        </div>

      </div>

      {/* Detailed Tier Modal */}
      <AnimatePresence>
        {selectedTier && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              className="w-full max-w-3xl bg-[#0E0E14] border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-white max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4 pb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1A1A24] to-black border border-white/20 flex items-center justify-center text-[#D4AF37] shrink-0">
                    {React.createElement(selectedTier.icon, { className: "w-6 h-6" })}
                  </div>
                  <div>
                    <div className="text-xs font-mono font-bold text-[#D4AF37] uppercase tracking-wider">
                      {selectedTier.tierNumber} • {selectedTier.scope}
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-0.5">
                      {selectedTier.title}
                    </h3>
                    <p className="text-xs text-gray-400">{selectedTier.level}</p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedTier(null)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors shrink-0"
                >
                  ✕
                </button>
              </div>

              {/* Mandate Description */}
              <div className="my-6">
                <h4 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Institutional Mandate & Scope
                </h4>
                <p className="text-sm text-gray-200 leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/10">
                  {selectedTier.mandate}
                </p>
              </div>

              {/* Two Column Breakdown: Core Responsibilities & Organ Composition */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
                
                {/* Key Responsibilities */}
                <div className="space-y-3 bg-[#13141E] p-5 rounded-2xl border border-white/10">
                  <h4 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> Core Institutional Mandates
                  </h4>
                  <ul className="space-y-2.5 text-xs text-gray-300">
                    {selectedTier.keyResponsibilities.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] mt-1.5 shrink-0" />
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Structure Composition & Key Organs */}
                <div className="space-y-3 bg-[#13141E] p-5 rounded-2xl border border-white/10">
                  <h4 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-2">
                    <Users className="w-4 h-4" /> Executive Composition & Organs
                  </h4>
                  <ul className="space-y-2.5 text-xs text-gray-300">
                    {selectedTier.composition.map((comp, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37] mt-0.5 shrink-0" />
                        <span className="leading-relaxed font-medium text-gray-200">{comp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="pt-5 flex items-center justify-end">
                <button
                  onClick={() => setSelectedTier(null)}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity"
                >
                  Close Charter View
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
