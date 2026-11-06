import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, ArrowLeft, X, Check } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface TourStep {
  title: string;
  description: string;
  targetId: string;
  targetPage?: string;
  position: 'bottom' | 'top' | 'left' | 'right';
}

const TOUR_STEPS: TourStep[] = [
  {
    title: 'Global Search Hub',
    description: 'Use this centralized search bar to instantly query projects, expert mentors, knowledge vault items, and active fellowships across Africa with live typing.',
    targetId: 'header-search-bar',
    targetPage: '/',
    position: 'bottom'
  },
  {
    title: 'Daily AI Recap',
    description: 'Each morning, the Dashboard features an intelligent recap generated on the fly by Gemini, compiling your schedule, pending tasks, and recent ecosystem highlights.',
    targetId: 'daily-recap-section',
    targetPage: '/',
    position: 'bottom'
  },
  {
    title: 'AI Center',
    description: 'Enter your dedicated AI workspace for real-time document synthesizers, translation, and chat models.',
    targetId: 'tour-nav-notes',
    position: 'right'
  },
  {
    title: 'Collective Knowledge Vault',
    description: 'Browse the collective thesis depository, interactive knowledge graphs, and live research frameworks uploaded by fellows.',
    targetId: 'tour-nav-knowledge',
    position: 'right'
  },
  {
    title: 'Mentorship Matching',
    description: 'Match with prominent leaders and schedule one-on-one virtual board sessions directly on the platform.',
    targetId: 'tour-nav-mentorship',
    position: 'right'
  },
  {
    title: 'Atmospheric Controls',
    description: 'Persist your visual workspace in light or deep night themed layers at any time using this convenient atmospheric icon preset.',
    targetId: 'theme-toggle-header',
    position: 'bottom'
  }
];

export default function OnboardingTour() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeStep, setActiveStep] = useState(-1);
  const [dimensions, setDimensions] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  // Read initial tour triggers
  useEffect(() => {
    const freshUser = !localStorage.getItem('gma_onboarding_completed');
    if (freshUser) {
      // Delay so the page can fully paint
      const timer = setTimeout(() => {
        setActiveStep(0);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Sync state for "Take Tour" events
  useEffect(() => {
    const handleStartTour = () => {
      setActiveStep(0);
    };
    window.addEventListener('start-gma-tour', handleStartTour);
    return () => window.removeEventListener('start-gma-tour', handleStartTour);
  }, []);

  const currentStep = activeStep >= 0 && activeStep < TOUR_STEPS.length ? TOUR_STEPS[activeStep] : null;

  // Manage target navigation
  useEffect(() => {
    if (currentStep && currentStep.targetPage && location.pathname !== currentStep.targetPage) {
      navigate(currentStep.targetPage);
    }
  }, [currentStep, location.pathname, navigate]);

  // Recalculate target positions
  useEffect(() => {
    if (!currentStep) {
      setDimensions(null);
      return;
    }

    const updatePosition = () => {
      const el = document.getElementById(currentStep.targetId);
      if (el) {
        // Highlight logic
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const rect = el.getBoundingClientRect();
        setDimensions({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height
        });
        
        // Add visual guide borders to indicate the active focus object
        el.classList.add('ring-4', 'ring-[#cca568]', 'ring-offset-2', 'dark:ring-offset-zinc-900', 'transition-all', 'duration-300', 'z-50');
      }
    };

    const timer = setTimeout(updatePosition, 300);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
      
      if (currentStep) {
        const el = document.getElementById(currentStep.targetId);
        if (el) {
          el.classList.remove('ring-4', 'ring-[#cca568]', 'ring-offset-2', 'dark:ring-offset-zinc-900', 'z-50');
        }
      }
    };
  }, [currentStep, activeStep, location.pathname]);

  if (!currentStep || !dimensions) return null;

  const handleNext = () => {
    if (activeStep < TOUR_STEPS.length - 1) {
      setActiveStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    setActiveStep(-1);
    localStorage.setItem('gma_onboarding_completed', 'true');
  };

  return (
    <div id="onboarding-tour-root" className="fixed inset-0 z-[99999] pointer-events-none">
      {/* Dimmed Background Mask holes highlight */}
      <div 
        className="absolute inset-0 bg-black/45 dark:bg-black/65 transition-opacity duration-300 pointer-events-auto"
        onClick={handleComplete}
      />

      {/* Target Focus Highlighter Block */}
      <div 
        className="absolute border-2 border-amber-400 dark:border-amber-300 rounded-xl pointer-events-none shadow-[0_0_50px_rgba(255,191,0,0.3)] transition-all duration-300 ease-in-out"
        style={{
          top: dimensions.top - 4,
          left: dimensions.left - 4,
          width: dimensions.width + 8,
          height: dimensions.height + 8
        }}
      />

      {/* Floating Tooltip Guide */}
      <div 
        className="absolute pointer-events-auto w-80 max-w-sm bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-5 shadow-[0_10px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex flex-col space-y-4 transition-all duration-300"
        style={{
          top: currentStep.position === 'bottom' ? dimensions.top + dimensions.height + 16 : 
               currentStep.position === 'top' ? dimensions.top - 240 : dimensions.top,
          left: currentStep.position === 'right' ? dimensions.left + dimensions.width + 16 :
                currentStep.position === 'left' ? dimensions.left - 336 : 
                Math.max(16, Math.min(window.innerWidth - 336, dimensions.left + (dimensions.width / 2) - 160))
        }}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 text-amber-500 font-bold text-xs sm:text-sm uppercase tracking-wider">
            <Sparkles className="w-4 h-4 animate-pulse text-[#cca568]" />
            <span>Virtual Walkthrough</span>
          </div>
          <button 
            onClick={handleComplete}
            className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-1">
          <h3 className="font-serif font-bold text-base text-gray-900 dark:text-white leading-tight">
            {currentStep.title}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-normal">
            {currentStep.description}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-zinc-850">
          <span className="text-xs text-gray-400 font-mono">
            Step {activeStep + 1} of {TOUR_STEPS.length}
          </span>
          
          <div className="flex items-center gap-2">
            {activeStep > 0 && (
              <button
                onClick={handleBack}
                className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-gradient-to-r from-amber-600 to-[#cca568] hover:from-amber-700 hover:to-[#b8955c] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <span>{activeStep === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}</span>
              {activeStep === TOUR_STEPS.length - 1 ? <Check className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export function startTour() {
  window.dispatchEvent(new Event('start-gma-tour'));
}
