import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, BookOpen, FlaskConical, Target, Globe, ShieldCheck, TrendingUp, Users, ArrowRight, Lightbulb, MapPin, Target as TargetIcon, Award, Mail } from 'lucide-react';
import appLogo from '../assets/images/logo.png';
import africanGovBg from '../assets/images/african_governance_bg_1781130107908.png';
import FloatingFaces from '../components/FloatingFaces';

interface FellowshipLandingProps {
  onBack: () => void;
}

export default function FellowshipLanding({ onBack }: FellowshipLandingProps) {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden font-sans selection:bg-[#cca568] selection:text-black">
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/80 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={appLogo} alt="Golden Minds Africa" className="w-10 h-10 object-contain" />
          <span className="font-serif font-bold text-xl tracking-wider uppercase hidden sm:block">Golden Minds</span>
        </div>
        <button 
          onClick={onBack}
          className="text-white/70 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Main
        </button>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <FloatingFaces sectionIndex={0} />
        <div className="container mx-auto relative z-10 max-w-5xl">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col md:flex-row gap-12 items-center"
          >
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#cca568]/10 border border-[#cca568]/30 mb-6">
                <span className="w-2 h-2 rounded-full bg-[#cca568] animate-pulse" />
                <span className="text-[#cca568] font-medium text-sm tracking-wide uppercase">The New Era of Leaders</span>
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold tracking-tight mb-8 leading-[1.1]">
                Fellowship in <br/>
                <span className="text-[#cca568]">Leadership, Geopolitics & Governance</span>
              </h1>
              
              <div className="flex flex-wrap gap-4 mb-10 text-sm font-medium text-gray-300">
                <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-lg flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#cca568]" /> 3 Months (12 Weeks)
                </div>
                <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-lg flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#cca568]" /> 24 Sessions Total
                </div>
                <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-lg flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-[#cca568]" /> Hybrid Format
                </div>
              </div>

              <p className="text-lg text-gray-400 max-w-xl leading-relaxed mb-10">
                A 3-month intensive leadership fellowship shaping Africa's next generation of future-ready, globally aware public leaders.
              </p>
            </div>
            
            <div className="flex-1 relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#cca568]/20 to-transparent blur-3xl rounded-full" />
              <img src={appLogo} alt="Fellowship Program" className="w-full max-w-md mx-auto relative z-10 drop-shadow-[0_0_50px_rgba(204,165,104,0.2)]" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- THE PROBLEM & OPPORTUNITY --- */}
      <section className="py-24 px-6 bg-[#0a0a0c] border-y border-white/5 relative overflow-hidden">
        <FloatingFaces sectionIndex={1} />
        <div className="container mx-auto max-w-6xl grid md:grid-cols-2 gap-16 relative z-10">
          <motion.div {...fadeIn}>
            <h2 className="text-3xl font-serif font-bold mb-8 text-[#cca568]">The Challenge</h2>
            <div className="space-y-6">
              {[
                { title: "Weak Leadership Pipeline", desc: "Lack of ethical, skilled public leaders prepared for tomorrow." },
                { title: "Limited Youth Participation", desc: "Marginalized voices in critical governance systems." },
                { title: "Poor Policy Capacity", desc: "Ineffective policy formulation and implementation." },
                { title: "Geopolitical Complexity", desc: "Increasing complexity in global geopolitics and decision-making." },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-1.5 bg-[#cca568] shrink-0 rounded-full" />
                  <div>
                    <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                    <p className="text-gray-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div {...fadeIn} transition={{ delay: 0.2 }}>
            <h2 className="text-3xl font-serif font-bold mb-8 text-[#cca568]">The Opportunity</h2>
            <div className="bg-[#cca568]/5 border border-[#cca568]/20 p-8 rounded-[32px] space-y-8">
              <div>
                <h3 className="text-2xl font-bold mb-2 text-white">Largest Youth Population</h3>
                <p className="text-gray-400">Africa has the largest and fastest-growing youth population globally.</p>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2 text-white">Rising Demand</h3>
                <p className="text-gray-400">Increasing need for specialized leadership, governance, and policy skills.</p>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2 text-white">Future-Ready Leaders</h3>
                <p className="text-gray-400">Governments and institutions require globally aware, structured, and scalable pipelines of young leaders prepared for public service.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- PROGRAM PHILOSOPHY --- */}
      <section className="py-24 px-6 bg-[#050505] relative overflow-hidden">
        <FloatingFaces sectionIndex={2} />
        <div className="container mx-auto max-w-6xl relative z-10">
          <motion.div {...fadeIn} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-serif font-bold mb-4 flex items-center justify-center gap-4">
              Our Methodology
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg pt-4">
              A blend of academic rigor and practical application.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <motion.div {...fadeIn} transition={{ delay: 0.1 }} className="bg-[#0f0f12] p-8 rounded-[24px] border border-white/5">
              <BookOpen className="w-10 h-10 text-[#cca568] mb-5" />
              <h3 className="text-xl font-bold mb-3">Theoretical Rigor</h3>
              <p className="text-gray-400">Political science, governance frameworks, and geopolitics.</p>
            </motion.div>
            <motion.div {...fadeIn} transition={{ delay: 0.2 }} className="bg-[#0f0f12] p-8 rounded-[24px] border border-white/5">
              <FlaskConical className="w-10 h-10 text-[#cca568] mb-5" />
              <h3 className="text-xl font-bold mb-3">Practical Application</h3>
              <p className="text-gray-400">Policy labs, simulations, and real-world engagement.</p>
            </motion.div>
            <motion.div {...fadeIn} transition={{ delay: 0.3 }} className="bg-[#0f0f12] p-8 rounded-[24px] border border-white/5">
              <TargetIcon className="w-10 h-10 text-[#cca568] mb-5" />
              <h3 className="text-xl font-bold mb-3">Leadership Development</h3>
              <p className="text-gray-400">Ethics, decision-making, and public influence.</p>
            </motion.div>
          </div>

        </div>
      </section>

      {/* --- CURRICULUM OVERVIEW --- */}
      <section className="py-24 px-6 bg-[#cca568] text-black relative overflow-hidden">
        <FloatingFaces sectionIndex={3} />
        <div className="container mx-auto max-w-6xl relative z-10">
          <motion.div {...fadeIn} className="mb-16 text-center">
            <h2 className="text-3xl md:text-5xl font-serif font-bold mb-4">Program Structure</h2>
            <p className="text-black/80 font-medium text-lg">Intensive 3-Month Fellowship Program</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div {...fadeIn} transition={{ delay: 0.1 }} className="bg-white/10 p-8 rounded-[24px] border border-black/10 backdrop-blur-sm">
              <div className="text-sm font-bold uppercase tracking-widest text-black/60 mb-2">Phase 1 (Weeks 1-4)</div>
              <h3 className="text-2xl font-bold mb-4">Foundations</h3>
              <p className="text-black/80 font-medium">Understanding leadership, governance models, and global systems. Developing a personal leadership philosophy.</p>
            </motion.div>

            <motion.div {...fadeIn} transition={{ delay: 0.2 }} className="bg-white/10 p-8 rounded-[24px] border border-black/10 backdrop-blur-sm">
              <div className="text-sm font-bold uppercase tracking-widest text-black/60 mb-2">Phase 2 (Weeks 5-8)</div>
              <h3 className="text-2xl font-bold mb-4">Systems & Strategy</h3>
              <p className="text-black/80 font-medium">Deep dive into geopolitics, policy formulation, global diplomacy, and macroeconomic fundamentals.</p>
            </motion.div>

            <motion.div {...fadeIn} transition={{ delay: 0.3 }} className="bg-white/10 p-8 rounded-[24px] border border-black/10 backdrop-blur-sm">
              <div className="text-sm font-bold uppercase tracking-widest text-black/60 mb-2">Phase 3 (Weeks 9-12)</div>
              <h3 className="text-2xl font-bold mb-4">Application & Impact</h3>
              <p className="text-black/80 font-medium">Crisis simulations, digital governance design, public speaking labs, and the final Capstone Policy pitch.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- OUTCOMES & CERTIFICATION --- */}
      <section className="py-24 px-6 bg-[#050505] relative overflow-hidden">
        <FloatingFaces sectionIndex={4} />
        <div className="container mx-auto max-w-6xl grid md:grid-cols-2 gap-16 relative z-10">
          <motion.div {...fadeIn}>
            <h2 className="text-3xl font-serif font-bold mb-8">Expected Outcomes</h2>
            <div className="space-y-6">
              <div className="flex gap-4 p-6 bg-[#0f0f12] rounded-2xl border border-white/5">
                <Target className="w-6 h-6 text-[#cca568] shrink-0" />
                <div>
                  <h4 className="font-bold mb-2">Leadership & Governance</h4>
                  <p className="text-sm text-gray-400">Develop clear leadership philosophies, build public confidence, understand institutions, and apply ethical accountability.</p>
                </div>
              </div>
              <div className="flex gap-4 p-6 bg-[#0f0f12] rounded-2xl border border-white/5">
                <Globe className="w-6 h-6 text-[#cca568] shrink-0" />
                <div>
                  <h4 className="font-bold mb-2">Policy & Geopolitics</h4>
                  <p className="text-sm text-gray-400">Design public policies, analyze complexities, interpret global power dynamics, and engage in high-level strategic thinking.</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div {...fadeIn} transition={{ delay: 0.2 }}>
            <h2 className="text-3xl font-serif font-bold mb-8">Certification</h2>
            <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0c] p-8 rounded-[32px] border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
               <Award className="w-12 h-12 text-[#cca568] mb-6" />
               <ul className="space-y-4 mb-8">
                 <li className="flex gap-3 text-gray-300">
                    <ShieldCheck className="w-5 h-5 text-[#cca568]" />
                    Fellowship Certificate (Distinction/Merit/Pass)
                 </li>
                 <li className="flex gap-3 text-gray-300">
                    <Briefcase className="w-5 h-5 text-[#cca568]" />
                    Comprehensive Policy Portfolio for career advancement
                 </li>
                 <li className="flex gap-3 text-gray-300">
                    <FileText className="w-5 h-5 text-[#cca568]" />
                    Recommendation Letters for top performers
                 </li>
               </ul>
               <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                 <p className="text-sm text-gray-400">
                   <strong>World-Class Add-ons:</strong> Guest lectures from diplomats, field exposure to parliaments, and a robust Alumni Network pipeline into public service.
                 </p>
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- CTA / FOOTER --- */}
      <footer className="bg-[#0a0a0c] pt-24 pb-12 px-6 border-t border-white/10 text-center">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-8 text-white">Join us in shaping Africa's future.</h2>
          <p className="text-xl text-gray-400 mb-12">
            The fellowship creates a virtuous cycle — empowered individuals drive institutional strength, which in turn produces better governance outcomes for all of Africa.
          </p>
          <a
            href="mailto:admin@goldenmindsafrica.org"
            className="inline-flex items-center justify-center gap-3 bg-[#cca568] text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-white transition-colors group mb-16"
          >
            <Mail className="w-5 h-5" />
            Contact us: admin@goldenmindsafrica.org
          </a>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-gray-500 text-sm">
            <span>© 2026 Golden Minds Africa Fellowship Program.</span>
            <span>www.goldenmindsroundtable.co.za</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
// Placeholder icons for missing imports
const Clock = ({className}:any) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const Monitor = ({className}:any) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const Briefcase = ({className}:any) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const FileText = ({className}:any) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
