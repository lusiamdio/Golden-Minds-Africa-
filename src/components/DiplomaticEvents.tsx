import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, MapPin, Users, Clock, ArrowRight, ShieldCheck, CheckCircle2, Sparkles, X, UserCheck } from 'lucide-react';

interface SummitEvent {
  id: string;
  title: string;
  category: string;
  date: string;
  targetTimestamp: number;
  location: string;
  city: string;
  type: 'upcoming' | 'past';
  attendeesCount: string;
  description: string;
  agendaHighlights: string[];
}

const SUMMIT_EVENTS: SummitEvent[] = [
  {
    id: 'joburg-2026',
    title: 'Africa Youth Future Forward Summit 2026',
    category: 'International Summit',
    date: 'October 8–9, 2026',
    targetTimestamp: new Date('2026-10-08T09:00:00').getTime(),
    location: 'Sandton Convention Centre',
    city: 'Johannesburg, South Africa',
    type: 'upcoming',
    attendeesCount: '1,500 Delegates & Ministers',
    description: 'The flagship annual gathering bringing together African heads of state, youth parliamentarians, tech innovators, and policy researchers to shape digital governance and trade integration.',
    agendaHighlights: [
      'Presidential Opening Keynote & Youth Charter Review',
      'Digital Governance & Infrastructure Panel',
      'AfCFTA Youth Entrepreneurship Trade Expo'
    ]
  },
  {
    id: 'lusaka-2027',
    title: 'Golden Minds Africa Roundtable and Summit 2027',
    category: 'Regional Policy Dialogue',
    date: 'April 28, 2026',
    targetTimestamp: new Date('2026-04-28T09:00:00').getTime(),
    location: 'Mulungushi International Conference Centre',
    city: 'Lusaka, Zambia',
    type: 'upcoming',
    attendeesCount: '800 Public Policy Fellows',
    description: 'High-level presidential roundtable addressing multilateral youth integration, regional trade corridors, and sustainable development governance.',
    agendaHighlights: [
      'Climate Finance & Green Seed Capital Workshop',
      'Pan-African University Integration Compact',
      'Youth Energy Sovereignty Masterclass'
    ]
  },
  {
    id: 'joburg-2025',
    title: 'Golden Minds Roundtable Presidential Inauguration',
    category: 'Diplomatic Summit',
    date: 'March 20, 2025',
    targetTimestamp: new Date('2025-03-20T09:00:00').getTime(),
    location: 'Sandton Convention Centre',
    city: 'Johannesburg, South Africa',
    type: 'past',
    attendeesCount: '2,000 Delegates',
    description: 'Inaugural assembly introducing the 2025-2030 Golden Minds Africa Strategic Plan and signing agreements with 30 African universities.',
    agendaHighlights: [
      'Signing of the Pan-African Youth Governance Declaration',
      'Unveiling of the Golden Minds Policy Research Lab'
    ]
  }
];

export default function DiplomaticEvents() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [selectedRegisterEvent, setSelectedRegisterEvent] = useState<SummitEvent | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', organization: '', country: 'South Africa' });

  // Countdown timer for the top upcoming summit
  const topSummit = SUMMIT_EVENTS[0];
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = topSummit.targetTimestamp - new Date().getTime();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    };
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [topSummit]);

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegistrationSuccess(true);
    setTimeout(() => {
      setRegistrationSuccess(false);
      setSelectedRegisterEvent(null);
    }, 3000);
  };

  const filteredEvents = SUMMIT_EVENTS.filter(e => e.type === activeTab);

  return (
    <section id="events" className="py-24 px-6 relative bg-[#08080A] overflow-hidden">
      <div className="container mx-auto max-w-7xl relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] text-xs font-semibold uppercase tracking-widest mb-3">
            <Calendar className="w-3.5 h-3.5" /> High-Level Convenings
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white">
            International <span className="text-gold-gradient">Summits & Events</span>
          </h2>
          <p className="text-gray-400 mt-4 text-base md:text-lg">
            Gathering diplomats, youth leaders, government ministers, and global partners to advance governance solutions across Africa.
          </p>

          {/* Toggle Tabs */}
          <div className="inline-flex p-1 rounded-full bg-white/5 border border-white/10 mt-8">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-6 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === 'upcoming'
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black font-bold shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Upcoming Summits
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`px-6 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === 'past'
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black font-bold shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Past Proceedings
            </button>
          </div>
        </div>

        {/* Live Countdown Featured Banner for Top Summit */}
        {activeTab === 'upcoming' && (
          <div className="glass-card-gold rounded-3xl p-8 mb-12 border border-white/15 shadow-2xl relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <span className="px-3 py-1 bg-[#D4AF37] text-black text-xs font-bold uppercase tracking-wider rounded-full">
                  Featured Pan-African Summit
                </span>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                  {topSummit.title}
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {topSummit.description}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-gray-300 pt-2">
                  <span className="flex items-center gap-1.5 text-[#D4AF37]">
                    <MapPin className="w-4 h-4" /> {topSummit.location}, {topSummit.city}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-emerald-400" /> {topSummit.attendeesCount}
                  </span>
                </div>
              </div>

              {/* Countdown Clock Column */}
              <div className="lg:col-span-5 bg-black/60 rounded-2xl p-6 border border-white/15 text-center space-y-4">
                <div className="text-xs font-serif font-bold uppercase text-[#D4AF37] tracking-widest flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4" /> Live Registration Countdown
                </div>
                <div className="grid grid-cols-4 gap-2 text-white">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="text-2xl font-serif font-bold text-[#D4AF37]">{timeLeft.days}</div>
                    <div className="text-[10px] text-gray-400 uppercase">Days</div>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="text-2xl font-serif font-bold text-[#D4AF37]">{timeLeft.hours}</div>
                    <div className="text-[10px] text-gray-400 uppercase">Hours</div>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="text-2xl font-serif font-bold text-[#D4AF37]">{timeLeft.minutes}</div>
                    <div className="text-[10px] text-gray-400 uppercase">Mins</div>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="text-2xl font-serif font-bold text-[#D4AF37]">{timeLeft.seconds}</div>
                    <div className="text-[10px] text-gray-400 uppercase">Secs</div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedRegisterEvent(topSummit)}
                  className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#B8860B] text-black font-bold text-sm hover:shadow-lg hover:shadow-[#D4AF37]/30 transition-all uppercase tracking-wider"
                >
                  Register Delegate Accreditation
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Events Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredEvents.map((evt) => (
            <motion.div
              key={evt.id}
              whileHover={{ y: -6 }}
              className="glass-card rounded-3xl p-8 border border-white/10 hover:border-white/30 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-[#D4AF37] uppercase mb-3">
                  <span>{evt.category}</span>
                  <span className="px-2.5 py-1 bg-white/5 rounded-full text-gray-300 border border-white/10">{evt.date}</span>
                </div>

                <h3 className="text-2xl font-serif font-bold text-white mb-2">{evt.title}</h3>
                <p className="text-xs text-emerald-400 font-medium flex items-center gap-1.5 mb-4">
                  <MapPin className="w-3.5 h-3.5" /> {evt.location} • {evt.city}
                </p>

                <p className="text-sm text-gray-300 leading-relaxed mb-6">
                  {evt.description}
                </p>

                <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-2 mb-6">
                  <div className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">Summit Agenda Highlights:</div>
                  <ul className="space-y-1.5 text-xs text-gray-300">
                    {evt.agendaHighlights.map((agenda, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                        {agenda}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {evt.type === 'upcoming' && (
                <button
                  onClick={() => setSelectedRegisterEvent(evt)}
                  className="w-full py-3 rounded-full bg-white/10 hover:bg-[#D4AF37] hover:text-black text-white font-bold text-xs uppercase tracking-wider border border-white/15 transition-all flex items-center justify-center gap-2"
                >
                  Register for Summit <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Registration Modal */}
      <AnimatePresence>
        {selectedRegisterEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-lg bg-[#0E0E12] border border-white/20 rounded-3xl p-8 shadow-2xl relative text-white"
            >
              <button
                onClick={() => { setSelectedRegisterEvent(null); setRegistrationSuccess(false); }}
                className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>

              {registrationSuccess ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto">
                    <UserCheck className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-white">Delegate Accreditation Granted</h3>
                  <p className="text-sm text-gray-300">
                    Thank you, {formData.name}. Your registration for <strong className="text-[#D4AF37]">{selectedRegisterEvent.title}</strong> has been received by the Golden Minds Secretariat.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div className="flex items-center gap-2 text-[#D4AF37] text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" /> Diplomatic Delegate Registration
                  </div>
                  <h3 className="text-xl font-serif font-bold text-white">
                    {selectedRegisterEvent.title}
                  </h3>

                  <div>
                    <label className="text-xs font-semibold text-gray-300 block mb-1">Full Delegate Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Hon. Amara Okafor"
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/15 rounded-xl text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-300 block mb-1">Institutional Email</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. delegate@au.int"
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/15 rounded-xl text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-300 block mb-1">Organization / Ministry</label>
                    <input
                      type="text"
                      required
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      placeholder="e.g. Ministry of Public Policy / University of Nairobi"
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/15 rounded-xl text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black font-bold text-sm uppercase tracking-wider mt-4"
                  >
                    Submit Accreditation Request
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
