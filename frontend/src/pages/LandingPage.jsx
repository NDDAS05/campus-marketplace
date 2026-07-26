import React, { useState, useEffect } from 'react';
import LandingNavbar from '../components/common/LandingNavbar';

// --- REAL TECH STACK SVGS ---
const LogoReact = () => (
  <svg viewBox="-11.5 -10.23174 23 20.46348" className="w-12 h-12 text-[#61dafb] group-hover:rotate-180 transition-transform duration-1000">
    <circle cx="0" cy="0" r="2.05" fill="currentColor"/>
    <g stroke="currentColor" strokeWidth="1" fill="none">
      <ellipse rx="11" ry="4.2"/>
      <ellipse rx="11" ry="4.2" transform="rotate(60)"/>
      <ellipse rx="11" ry="4.2" transform="rotate(120)"/>
    </g>
  </svg>
);

const LogoNode = () => (
  <svg viewBox="0 0 128 128" className="w-12 h-12 text-[#339933] overflow-visible">
    <path fill="currentColor" d="M118.232 40.548L66.726 10.741c-1.688-.973-3.766-.973-5.454 0L9.766 40.548a5.454 5.454 0 0 0-2.727 4.721v59.61c0 1.895 1.01 3.633 2.727 4.606l51.506 29.807c1.688.974 3.766.974 5.454 0l51.506-29.807c1.717-.973 2.727-2.711 2.727-4.606v-59.61a5.454 5.454 0 0 0-2.727-4.721z"/>
    <path fill="#FFF" d="M102.774 91.077l-35.885 20.73-35.892-20.73V49.61l35.892-20.716 35.885 20.716v41.467z"/>
    <path fill="#339933" d="M63.674 97.433v-19.16l-18.064 10.512V69.76l18.064-10.455V40.233L36.315 56.12v31.78l27.359 15.86v-6.327zm6.438-2.613V75.66l18.071-10.513v19.025l18.064-10.455V41.936l-36.135 20.89v19.16l18.071-10.426v6.326L66.897 90.354v4.466z"/>
  </svg>
);

const LogoMongo = () => (
  <svg viewBox="0 0 128 128" className="w-12 h-12 text-[#47A248]">
    <path fill="currentColor" d="M60.103 118.028c-7.391-9.988-16.14-23.704-16.14-43.235 0-14.887 5.176-32.964 15.313-52.548 1.488-2.84 2.87-3.901 3.535-3.955.701-.053 2.316.921 4.238 4.246 11.233 19.344 17.514 36.985 17.514 51.536 0 18.072-7.512 31.815-14.975 42.482-1.353 2.073-3.238 4.792-3.411 7.151-.122 1.947-.643 3.99-1.503 4.295-.884.288-2.223-2.176-4.571-9.972z"/>
  </svg>
);

const LogoExpress = () => (
  <svg viewBox="0 0 128 128" className="w-12 h-12 text-slate-800 dark:text-slate-100">
    <text x="10" y="80" fontFamily="Arial, sans-serif" fontSize="48" fontWeight="bold" fill="currentColor">ex</text>
  </svg>
);

const LogoSocket = () => (
  <svg viewBox="0 0 128 128" className="w-12 h-12 text-slate-900 dark:text-white">
    <path fill="currentColor" d="M64 5.333L10.667 32v64L64 122.667 117.333 96V32L64 5.333zM64 112L21.333 90.667V37.333L64 16l42.667 21.333v53.334L64 112zm5.333-53.333l16-21.334h-21.333v-16L48 42.667h21.333v16l-16 21.333h21.333v16L96 74.667H74.667v-16h-5.334z"/>
  </svg>
);

const LogoGroq = () => (
  <svg viewBox="0 0 24 24" className="w-12 h-12 text-[#f97316]">
    <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
  </svg>
);

// --- GLOWING SECTION DIVIDER ---
const SectionDivider = () => (
  <div className="relative w-full h-32 flex items-center justify-center overflow-hidden pointer-events-none z-10">
    <div className="absolute w-3/4 max-w-5xl h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent"></div>
    <div className="absolute w-1/2 max-w-3xl h-px bg-gradient-to-r from-transparent via-cyan-400/30 dark:via-cyan-500/30 to-transparent blur-sm"></div>
  </div>
);

// --- CONFIGURATION DATA ---
const CONFIG = {
  hero: {
    ctaPrimary: "Explore Marketplace",
    ctaSecondary: "Explore GitHub",
    githubRepoUrl: "https://github.com/NDDAS05/campus-marketplace",
    pitchExtra: [
      "Escape chaotic WhatsApp groups and anonymous forums. Discover exactly what you need without the noise.",
      "Trade second-hand textbooks, sell used drafters, and split hostel essentials instantly with verified peers."
    ]
  },
  features: [
    {
      id: "verified",
      title: "Verified Students Only",
      description: "Registration requires an official .ac.in email. Deal safely with genuine peers, eliminating scammers and outsiders completely.",
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      tintClass: "bg-cyan-50/60 dark:bg-cyan-900/20 border-cyan-200/50 dark:border-cyan-700/30",
      glowClass: "group-hover:shadow-[0_0_40px_rgba(6,182,212,0.3)] group-hover:border-cyan-400/60",
      iconColor: "text-cyan-600 dark:text-cyan-400"
    },
    {
      id: "academics",
      title: "Built for Academics",
      description: "Filter items by semesters and departments to locate exact study materials, drafters, and lab coats passed down by seniors.",
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477-4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      tintClass: "bg-purple-50/60 dark:bg-purple-900/20 border-purple-200/50 dark:border-purple-700/30",
      glowClass: "group-hover:shadow-[0_0_40px_rgba(168,85,247,0.3)] group-hover:border-purple-400/60",
      iconColor: "text-purple-600 dark:text-purple-400"
    },
    {
      id: "sustainable",
      title: "Sustainable & Cheap",
      description: "Pass on your old hostel furniture, electronics, and books directly to juniors who need them. Reduce waste, save money.",
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      tintClass: "bg-emerald-50/60 dark:bg-emerald-900/20 border-emerald-200/50 dark:border-emerald-700/30",
      glowClass: "group-hover:shadow-[0_0_40px_rgba(16,185,129,0.3)] group-hover:border-emerald-400/60",
      iconColor: "text-emerald-600 dark:text-emerald-400"
    }
  ],
  techStack: [
    { name: "React", role: "Frontend UI", icon: <LogoReact />, tint: "bg-cyan-50/50 dark:bg-cyan-900/10 border-cyan-200/50 dark:border-cyan-800/40" },
    { name: "Node.js", role: "Runtime", icon: <LogoNode />, tint: "bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200/50 dark:border-emerald-800/40" },
    { name: "MongoDB", role: "Database", icon: <LogoMongo />, tint: "bg-green-50/50 dark:bg-green-900/10 border-green-200/50 dark:border-green-800/40" },
    { name: "Express.js", role: "Backend API", icon: <LogoExpress />, tint: "bg-slate-100/50 dark:bg-slate-800/30 border-slate-200/50 dark:border-slate-700/40" },
    { name: "Socket.io", role: "Real-time Chat", icon: <LogoSocket />, tint: "bg-slate-200/30 dark:bg-slate-700/30 border-slate-300/50 dark:border-slate-600/40" },
    { name: "Groq API", role: "AI Moderation", icon: <LogoGroq />, tint: "bg-orange-50/50 dark:bg-orange-900/10 border-orange-200/50 dark:border-orange-800/40" }
  ],
  builders: [
    {
      name: "Nirupam Das",
      role: "Full Stack Developer",
      description: "A 5th-semester CST student passionate about full-stack development and scalable system design. I enjoy tackling complex DSA challenges and building software solutions that create real, meaningful impact for users.",
      college: "IIEST Shibpur",
      branch: "Computer Science and Technology",
      initial: "N",
      github: "https://github.com/NDDAS05",
      linkedin: "https://www.linkedin.com/in/nirupam-das-859902375/",
      gradient: "from-cyan-400 to-blue-600"
    },
    {
      name: "Antarikshya Mitra",
      role: "Full Stack Developer",
      description: "Currently in my 5th semester of CST, I'm an avid learner exploring the depths of full-stack engineering and system architecture. I love solving algorithmic puzzles and developing applications that address genuine community needs.",
      college: "IIEST Shibpur",
      branch: "Computer Science and Technology",
      initial: "A",
      github: "https://github.com/codeAntariksh",
      linkedin: "https://www.linkedin.com/in/antarikshya-mitra-50678b311/",
      gradient: "from-purple-400 to-pink-600"
    }
  ]
};

// --- MISC ICONS ---
const IconGithub = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const IconLinkedin = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
);

const LandingPage = ({ navigate, isLoggedIn, theme, toggleTheme }) => {
  const [activeSection, setActiveSection] = useState('hero');

  const handleNavigate = (path) => {
    if (typeof navigate === 'function') {
      navigate(path);
    }
  };

  // Intersection Observer to track scroll position and update active section
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      // Increased threshold so background only shifts when you are truly inside the section
      { threshold: 0.5 } 
    );

    const sections = document.querySelectorAll('section[id]');
    sections.forEach((sec) => observer.observe(sec));

    return () => observer.disconnect();
  }, []);

  // Determine dynamic background class based on the active section
  // Colors have been significantly enriched for maximum visibility during the transition
  const getDynamicBackground = () => {
    switch (activeSection) {
      case 'features':
        return 'bg-cyan-100 dark:bg-[#0c2b38]';
      case 'tech':
        return 'bg-purple-100 dark:bg-[#1d1233]';
      case 'builders':
        return 'bg-emerald-100 dark:bg-[#0a2b1c]';
      default:
        // Hero / Base state
        return 'bg-slate-100 dark:bg-[#0a0f1c]';
    }
  };

  return (
    <div 
      className={`relative min-h-screen w-full text-slate-900 dark:text-slate-100 transition-colors duration-1000 ease-in-out overflow-x-hidden font-sans ${getDynamicBackground()}`}
      style={{ fontFamily: "'Lora', serif" }}
    >
      {/* 
        Using dangerouslySetInnerHTML for the style tag ensures that Vite/React 
        doesn't strip the CSS @keyframes out during compilation!
      */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Poppins:wght@400;500;600;700;800;900&display=swap');
        
        @keyframes textGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-bg-gradient {
          background-size: 200% auto;
          animation: textGradient 4s linear infinite;
        }
      `}} />

      {/* --- SEAMLESS AMBIENT BACKGROUND ORBS --- */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 transition-opacity duration-1000">
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-cyan-400/30 dark:bg-cyan-600/30 blur-[120px] mix-blend-multiply dark:mix-blend-screen" />
        <div className="absolute top-[40%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple-400/30 dark:bg-purple-600/30 blur-[120px] mix-blend-multiply dark:mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-[20%] w-[70vw] h-[70vw] rounded-full bg-emerald-400/20 dark:bg-emerald-600/20 blur-[150px] mix-blend-multiply dark:mix-blend-screen" />
      </div>

      <LandingNavbar
        isLoggedIn={isLoggedIn}
        navigate={handleNavigate}
        theme={theme}
        toggleTheme={toggleTheme}
      />
      
      {/* =========================================
          SECTION 1: HERO
          ========================================= */}
      <section id="hero" className="relative w-full pt-32 pb-16 lg:pt-40 lg:pb-24 z-10 transition-colors duration-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center mt-8">
          
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-purple-500 to-emerald-500 dark:from-cyan-400 dark:via-purple-400 dark:to-emerald-400 drop-shadow-sm animate-bg-gradient">
            CampusHive
          </h1>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-8">
            Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-purple-500 dark:from-cyan-400 dark:to-purple-400 animate-bg-gradient drop-shadow-[0_0_15px_rgba(6,182,212,0.4)]">Campus.</span><br className="sm:hidden" />
            {' '}Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-cyan-600 dark:from-emerald-400 dark:to-cyan-400 animate-bg-gradient drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]">Marketplace.</span>
          </h2>

          <div className="max-w-3xl mx-auto mb-14 text-left sm:text-center">
            <p className="text-lg md:text-2xl text-slate-700 dark:text-slate-200 leading-relaxed font-medium mb-4">
              A secure, zero-waste ecosystem built exclusively for our college. Buy, sell, and connect in 
              <span className="relative group inline-block mx-2 cursor-help">
                <span className="text-cyan-700 dark:text-cyan-400 font-bold border-b-2 border-cyan-500/50 border-dashed pb-1">real-time.</span>
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm rounded-xl opacity-0 group-hover:opacity-100 transition-opacity shadow-2xl whitespace-nowrap pointer-events-none">
                  Powered by Socket.io
                </span>
              </span>
            </p>
            {CONFIG.hero.pitchExtra.map((pitchLine, idx) => (
              <p key={idx} className="text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-medium mb-2">
                {pitchLine}
              </p>
            ))}
          </div>
          
          {/* Glassmorphic Pill Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button 
              onClick={() => handleNavigate('/marketplace')}
              className="px-10 py-4 rounded-full bg-cyan-600/90 hover:bg-cyan-500 dark:bg-cyan-500/80 dark:hover:bg-cyan-400/90 text-white backdrop-blur-xl border border-cyan-400/50 font-bold shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] w-full sm:w-auto text-lg"
            >
              {CONFIG.hero.ctaPrimary}
            </button>
            <a 
              href={CONFIG.hero.githubRepoUrl} 
              target="_blank" 
              rel="noreferrer"
              className="px-10 py-4 rounded-full bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-white font-bold border border-slate-900/10 dark:border-white/20 hover:bg-white/80 dark:hover:bg-slate-700/60 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-lg w-full sm:w-auto flex items-center justify-center gap-3 group text-lg"
            >
              <IconGithub className="w-6 h-6 group-hover:scale-110 transition-transform" /> {CONFIG.hero.ctaSecondary}
            </a>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* =========================================
          SECTION 2: FEATURES
          ========================================= */}
      <section id="features" className="relative w-full py-16 lg:py-24 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Built for the Community
            </h2>
            <p className="text-lg md:text-xl text-slate-700 dark:text-slate-300 max-w-3xl">
              Exchange study materials, lab equipment, and hostel essentials securely within the campus boundaries. We deliver a tailored ecosystem to bypass the clutter of public forums.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {CONFIG.features.map((feature) => (
              <div 
                key={feature.id} 
                className={`relative overflow-hidden ${feature.tintClass} backdrop-blur-xl rounded-[2rem] p-10 shadow-lg border transition-all duration-500 group hover:-translate-y-2 ${feature.glowClass} flex flex-col h-full min-h-[320px]`}
              >
                <div className={`absolute -bottom-8 -right-8 w-48 h-48 opacity-10 dark:opacity-20 transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-12 ${feature.iconColor}`}>
                  {feature.icon}
                </div>

                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-8 bg-white/60 dark:bg-slate-900/60 shadow-sm border border-white/40 dark:border-slate-700/50 ${feature.iconColor} group-hover:scale-110 transition-transform duration-500 relative z-10`}>
                  <div className="w-10 h-10">
                    {feature.icon}
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 relative z-10" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  {feature.title}
                </h3>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg relative z-10 flex-grow">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* =========================================
          SECTION 3: TECH STACK
          ========================================= */}
      <section id="tech" className="relative w-full py-16 lg:py-24 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6" style={{ fontFamily: "'Poppins', sans-serif" }}>
              The Engine Room
            </h2>
            <p className="text-lg md:text-xl text-slate-700 dark:text-slate-300 max-w-3xl">
              Powered by an industry-standard software stack. Our architecture guarantees optimal speed, robust security, and high scalability for continuous peer-to-peer usage.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" style={{ fontFamily: "'Poppins', sans-serif" }}>
            {CONFIG.techStack.map((tech, idx) => (
              <div 
                key={idx} 
                className={`group relative ${tech.tint} backdrop-blur-md p-8 rounded-[2rem] border shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center gap-6`}
              >
                <div className="flex-shrink-0 group-hover:scale-110 transition-transform duration-500 drop-shadow-md">
                  {tech.icon}
                </div>
                <div>
                  <span className="block font-bold text-slate-900 dark:text-white text-xl mb-1">{tech.name}</span>
                  <span className="block text-sm text-slate-600 dark:text-slate-300 font-medium uppercase tracking-wider">{tech.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* =========================================
          SECTION 4: BUILDERS
          ========================================= */}
      <section id="builders" className="relative w-full pt-16 pb-32 lg:pt-24 lg:pb-40 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Meet the Builders
            </h2>
            <p className="text-lg md:text-xl text-slate-700 dark:text-slate-300 max-w-3xl">
              A passion project engineered to solve specific campus challenges. We combine clean code with modern design principles to build reliable tools for our peers.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full" style={{ fontFamily: "'Poppins', sans-serif" }}>
            {CONFIG.builders.map((builder, idx) => (
              <div 
                key={idx} 
                className="flex flex-col bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl rounded-[2rem] p-8 md:p-10 border border-slate-900/10 dark:border-white/10 shadow-lg w-full group transition-all hover:shadow-2xl hover:-translate-y-1"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-8">
                  <div className={`w-20 h-20 flex-shrink-0 bg-gradient-to-br ${builder.gradient} rounded-full flex items-center justify-center text-3xl font-black text-white shadow-lg`}>
                    {builder.initial}
                  </div>
                  <div>
                    <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-1">{builder.name}</h3>
                    <p className="text-sm font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest">{builder.role}</p>
                  </div>
                </div>

                <div className="mb-10 flex-grow">
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg mb-6">
                    {builder.description}
                  </p>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed border-l-2 border-slate-400 dark:border-slate-600 pl-4">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{builder.college}</span><br/>
                    {builder.branch}
                  </p>
                </div>

                {/* Permanent Inner Glass Pills for Links */}
                <div className="mt-auto flex flex-col sm:flex-row gap-4">
                  <a 
                    href={builder.github} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex-1 py-3.5 rounded-full bg-slate-900/5 dark:bg-white/10 border border-slate-900/10 dark:border-white/20 hover:bg-slate-900/10 dark:hover:bg-white/20 text-slate-900 dark:text-white transition-all duration-300 flex justify-center items-center gap-2 font-semibold hover:-translate-y-1 hover:shadow-md"
                  >
                    <IconGithub className="w-5 h-5" /> GitHub
                  </a>
                  <a 
                    href={builder.linkedin} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex-1 py-3.5 rounded-full bg-blue-600/10 dark:bg-blue-900/40 border border-blue-600/20 dark:border-blue-700/40 hover:bg-blue-600/20 dark:hover:bg-blue-800/50 text-blue-700 dark:text-blue-300 transition-all duration-300 flex justify-center items-center gap-2 font-semibold hover:-translate-y-1 hover:shadow-md"
                  >
                    <IconLinkedin className="w-5 h-5" /> LinkedIn
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;