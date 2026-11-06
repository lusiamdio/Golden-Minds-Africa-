import React, { useState } from 'react';
import DiplomaticNav from '../components/DiplomaticNav';
import DiplomaticHero from '../components/DiplomaticHero';
import PresidentialWelcome from '../components/PresidentialWelcome';
import StrategicPillars from '../components/StrategicPillars';
import FeaturedPrograms from '../components/FeaturedPrograms';
import ContinentalMapExplorer from '../components/ContinentalMapExplorer';
import NewsroomAndResearch from '../components/NewsroomAndResearch';
import DiplomaticRoster from '../components/DiplomaticRoster';
import DiplomaticTestimonials from '../components/DiplomaticTestimonials';
import DonateAndPartner from '../components/DonateAndPartner';
import DiplomaticFooter from '../components/DiplomaticFooter';
import DiplomaticAIAssistant from '../components/DiplomaticAIAssistant';
import CommandSearchModal from '../components/CommandSearchModal';

interface LandingPageProps {
  onEnter: () => void;
  onFellowshipClick: () => void;
}

export default function LandingPage({ onEnter, onFellowshipClick }: LandingPageProps) {
  const [activeLanguage, setActiveLanguage] = useState<string>('en');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-[#08080A] text-white font-sans selection:bg-[#D4AF37] selection:text-black overflow-x-hidden">
      
      {/* Sticky Diplomatic Navigation Bar */}
      <DiplomaticNav
        onOpenPortal={onEnter}
        activeLanguage={activeLanguage}
        onChangeLanguage={(lang) => setActiveLanguage(lang)}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Hero Section */}
      <DiplomaticHero onJoinClick={onEnter} />

      {/* Presidential Welcome & Executive Address */}
      <PresidentialWelcome />

      {/* Strategic Pillars of Impact */}
      <StrategicPillars />

      {/* Featured Programs & Fellowships */}
      <FeaturedPrograms />

      {/* Interactive Continental Africa Map Explorer */}
      <section id="map" className="py-24 px-6 bg-[#08080A]">
        <div className="container mx-auto max-w-7xl">
          <ContinentalMapExplorer />
        </div>
      </section>

      {/* Executive Board & Diplomatic Roster */}
      <DiplomaticRoster />

      {/* Policy Research & Publications Newsroom */}
      <NewsroomAndResearch />

      {/* Ministerial & Academic Endorsements */}
      <DiplomaticTestimonials />

      {/* Philanthropy, Sponsorship & Partnerships */}
      <DonateAndPartner />

      {/* Institutional Footer */}
      <DiplomaticFooter />

      {/* Diplomatic AI Chat Assistant */}
      <DiplomaticAIAssistant />

      {/* Command K / Archive Search Modal */}
      <CommandSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </div>
  );
}
