import React, { useState } from 'react';
import LandingNavbar from '../components/common/LandingNavbar';

// Safe inline SVG icons to guarantee zero runtime crashes from missing icon libraries
const IconUsers = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const IconShield = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const IconLock = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const IconZap = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const IconCheck = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const IconSearch = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const IconMessage = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const IconBag = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
);

const IconArrowRight = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

const IconExternal = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
);

const IconGithub = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const FEATURES = [
  {
    title: "Campus Exclusive",
    description: "Say goodbye to scattered WhatsApp groups. Find everything you need to buy or sell in one dedicated campus platform.",
    icon: <IconUsers className="w-6 h-6 text-blue-600 dark:text-blue-400" />
  },
  {
    title: "Safe & Moderated",
    description: "Automated AI moderation keeps the marketplace clean, ensuring all listings are relevant and appropriate.",
    icon: <IconShield className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
  },
  {
    title: "Verified Access",
    description: "Protected authentication ensures only verified @students.iiests.ac.in accounts can access.",
    icon: <IconLock className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
  },
  {
    title: "Real-Time Chat",
    description: "Negotiate prices, ask questions, or coordinate quick meetups on campus with built-in instant messaging.",
    icon: <IconZap className="w-6 h-6 text-amber-500 dark:text-amber-400" />
  }
];

const STEPS = [
  {
    num: "01",
    title: "Sign In Securely",
    desc: "Log in using your official institutional email to instantly verify your identity.",
    icon: <IconCheck className="w-5 h-5 text-teal-500" />
  },
  {
    num: "02",
    title: "List Your Item",
    desc: "Snap a photo, set a price, and list your unused books, cycles, or hostel essentials in seconds.",
    icon: <IconSearch className="w-5 h-5 text-blue-500" />
  },
  {
    num: "03",
    title: "Negotiate & Chat",
    desc: "Interested buyers can securely message you right within the platform to finalize the deal.",
    icon: <IconMessage className="w-5 h-5 text-indigo-500" />
  },
  {
    num: "04",
    title: "Meet on Campus",
    desc: "Arrange a quick meetup at the library, Nescafe, or hostels to complete the transaction.",
    icon: <IconBag className="w-5 h-5 text-emerald-500" />
  }
];

const TECH_STACK = [
  { name: "React", role: "Frontend Experience", category: "Frontend" },
  { name: "Node.js", role: "Backend Runtime", category: "Backend" },
  { name: "Express.js", role: "API Architecture", category: "Backend" },
  { name: "MongoDB", role: "Data Storage", category: "Database" },
  { name: "Google Auth", role: "Student Authentication", category: "Security" },
  { name: "Groq AI", role: "Content Moderation", category: "AI" },
  { name: "Chat.io", role: "Realtime Chat", category: "Frontend" }
];

const CONTRIBUTORS = [
  { name: "Nirupam Das", role: "Developer", github: "https://github.com/NDDAS05" },
  { name: "Antarikshya Mitra", role: "Developer", github: "https://github.com/codeAntariksh" }
];

const LandingPage = ({ navigate, isLoggedIn, theme, toggleTheme }) => {
  const [selectedTechCategory, setSelectedTechCategory] = useState('All');

  // Defensive navigation caller
  const handleNavigate = (path) => {
    if (typeof navigate === 'function') {
      navigate(path);
    } else {
      window.location.hash = path;
    }
  };

  const filteredTechStack = selectedTechCategory === 'All' 
    ? TECH_STACK 
    : TECH_STACK.filter(tech => tech.category === selectedTechCategory);

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">

      <LandingNavbar
        isLoggedIn={isLoggedIn}
        navigate={handleNavigate}
        theme={theme}
        toggleTheme={toggleTheme}
      />
      
      {/* --- HERO SECTION --- */}
      <div className="relative bg-gradient-to-br from-blue-600 via-teal-600 to-emerald-600 pt-24 pb-48 lg:pt-32 lg:pb-64 overflow-hidden">
        {/* Background Decorative Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px] opacity-10"></div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight mb-6 leading-tight drop-shadow-sm">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-white to-teal-100">
              CampusHive
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto mb-10 leading-relaxed font-medium">
            Buy, sell, and discover campus essentials easily. 
            A secure, student-only marketplace built exclusively for Our College Community.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => handleNavigate('/marketplace')}
              className="px-8 py-3.5 rounded-xl bg-white text-blue-700 hover:bg-slate-100 font-bold shadow-xl transition-all duration-200 hover:-translate-y-0.5 w-full sm:w-auto flex items-center justify-center gap-2"
            >
              Explore Platform <IconArrowRight className="w-4 h-4" />
            </button>
            <a 
              href="https://github.com/NDDAS05/campus-marketplace" 
              target="_blank" 
              rel="noreferrer"
              className="px-8 py-3.5 rounded-xl bg-white/15 text-white font-bold border border-white/30 hover:bg-white/25 transition-all duration-200 backdrop-blur-md w-full sm:w-auto flex items-center justify-center gap-2"
            >
              <IconGithub className="w-5 h-5" /> View Repository
            </a>
          </div>
        </div>
      </div>

      {/* --- OVERLAPPING FEATURE CARDS --- */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 lg:-mt-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((feature, idx) => (
            <div 
              key={idx} 
              className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl flex flex-col h-full border border-slate-100 dark:border-slate-800 hover:shadow-2xl transition-all duration-300 group hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 tracking-widest uppercase">
                  {feature.subtitle}
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed flex-grow">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* --- HOW IT WORKS --- */}
      <div className="py-24 lg:py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-4">
              From Listing to Recovery
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-3 max-w-xl mx-auto text-sm md:text-base">
              A structured 4-step process designed to eliminate uncertainty and streamline campus exchanges.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {STEPS.map((step, idx) => (
              <div key={idx} className="relative bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-md border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-3xl font-black text-slate-300 dark:text-slate-700">
                      {step.num}
                    </span>
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                      {step.icon}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- MISSION --- */}
      <div className="py-24 bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/3 flex justify-center">
            <div className="relative w-56 h-56 flex items-center justify-center">
              <div className="absolute inset-0 bg-teal-500/10 dark:bg-teal-500/20 rounded-full blur-2xl animate-pulse"></div>
              <svg viewBox="0 0 100 100" className="w-48 h-48 text-teal-500 fill-current relative z-10 drop-shadow-md">
                <path d="M50 0 C50 35 65 50 100 50 C65 50 50 65 50 100 C50 65 35 50 0 50 C35 50 50 35 50 0 Z" />
              </svg>
            </div>
          </div>
          
          <div className="lg:w-2/3">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight mb-8">
              Making Campus Commerce Simple, Trusted, and Accessible
            </h2>
            
            <div className="space-y-4">
              {[
                "Building a more connected campus experience through a dedicated and organized peer-to-peer marketplace.",
                "The idea behind CampusHive emerged from a simple observation: buying and selling second-hand essentials like drafters, books, and cycles is scattered across dozens of noisy WhatsApp groups.",
                "Because these channels are fragmented, students often miss out on great deals or struggle to sell items quickly. CampusHive bridges this gap."
              ].map((text, idx) => (
                <div key={idx} className="bg-slate-50 dark:bg-slate-800/60 border-l-4 border-teal-500 rounded-r-2xl p-5">
                  <p className="text-slate-700 dark:text-slate-300 text-sm md:text-base leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* --- TECHNOLOGY --- */}
      <div className="py-24 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
            Powered by Modern Technologies
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto text-sm md:text-base">
            Engineered using scalable full-stack technology stack providing secure student authentication, real-time communication, and reliable automated AI moderation.
          </p>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {['All', 'Frontend', 'Backend', 'Database', 'Security', 'AI'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedTechCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  selectedTechCategory === cat 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {filteredTechStack.map((tech, idx) => (
              <div 
                key={idx} 
                className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 transition-all flex flex-col items-center justify-center"
              >
                <span className="font-bold text-slate-900 dark:text-white text-base block">{tech.name}</span>
                <span className="text-xs text-slate-400 mt-1">{tech.role}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- CONTRIBUTORS --- */}
      <div className="py-24 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
            The People Behind CampusHive
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto text-sm md:text-base">
            A shared vision and commitment to solving everyday campus challenges through modern open technology.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {CONTRIBUTORS.map((person, idx) => (
              <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-700/60 text-left hover:shadow-md transition-all">
                <div className="w-12 h-1 bg-gradient-to-r from-blue-600 to-teal-400 rounded-full mb-6"></div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-1">{person.name}</h3>
                <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 mb-6 uppercase tracking-wider">{person.role}</p>
                <a 
                  href={person.github} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="inline-flex items-center text-blue-600 dark:text-blue-400 font-bold text-sm hover:underline gap-1.5"
                >
                  <IconGithub className="w-4 h-4" /> View GitHub <IconExternal className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- OPEN SOURCE CTA --- */}
      <div className="py-24 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-950 rounded-3xl p-10 lg:p-14 text-center shadow-2xl relative overflow-hidden text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800">
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
              Built in Public, Open for Innovation
            </h2>
            <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-8 text-sm md:text-base leading-relaxed">
              CampusHive is developed as an open-source project. Explore the architecture, review the implementation, discover how different technologies come together, or contribute ideas that help shape the future of campus exchanges.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a 
                href="https://github.com/NDDAS05/campus-marketplace" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-teal-500 text-slate-950 font-bold hover:bg-teal-400 transition-colors w-full sm:w-auto shadow-lg"
              >
                View Repository <IconArrowRight className="w-4 h-4" />
              </a>
              <button 
                onClick={() => handleNavigate('/marketplace')}
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-slate-900/5 dark:bg-white/10 text-slate-900 dark:text-white font-bold hover:bg-slate-900/10 dark:hover:bg-white/20 transition-colors w-full sm:w-auto border border-slate-900/10 dark:border-white/20"
              >
                Explore Marketplace
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default LandingPage;