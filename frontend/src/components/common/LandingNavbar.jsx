import React from 'react';
import { User, Sun, Moon } from 'lucide-react';

const LandingNavbar = ({ isLoggedIn, navigate, theme, toggleTheme }) => {
  const linkClasses =
    "relative text-slate-800 dark:text-slate-200 font-medium after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-full after:origin-center after:scale-x-0 after:bg-black dark:after:bg-white after:transition-transform after:duration-300 hover:after:scale-x-100";

  return (
    <nav
      className="bg-white/40 dark:bg-slate-950/40 backdrop-blur-xl border-b border-white/20 dark:border-slate-800/50 fixed top-0 z-50 w-full transition-colors duration-300"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      <div className="flex justify-between items-center px-4 sm:px-8 py-4 max-w-7xl mx-auto">

        {/* Brand */}
        <div
          onClick={() => navigate('/marketplace')}
          className="text-xl sm:text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 cursor-pointer hover:opacity-80 transition-opacity truncate pr-2"
        >
          CampusHive
        </div>

        {/* Right: Navigation Links, Theme Toggle, Profile */}
        <div className="flex items-center gap-4 sm:gap-6">

          {/* Main Website Link */}
          <button 
            onClick={() => navigate('/marketplace')} 
            className={`text-sm sm:text-base hidden sm:block ${linkClasses}`}
          >
            Marketplace
          </button>

          {!isLoggedIn && (
            <>
              <button 
                onClick={() => navigate('/signup')} 
                className={`text-sm sm:text-base hidden sm:block ${linkClasses}`}
              >
                Sign up
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-5 sm:px-7 py-2 sm:py-2.5 rounded-full border border-slate-900/10 dark:border-white/10 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md shadow-sm text-black dark:text-white font-medium text-sm sm:text-base transition-all duration-300 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black hover:shadow-lg"
              >
                Login
              </button>
            </>
          )}

          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-slate-900/10 dark:border-white/10 text-slate-700 hover:text-black dark:text-slate-300 dark:hover:text-white transition-all shadow-sm hover:shadow-md"
            title="Toggle Dark Mode"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {isLoggedIn && (
            <button
              onClick={() => navigate('/profile')}
              className="w-10 h-10 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-slate-900/10 dark:border-white/10 flex items-center justify-center hover:ring-2 hover:ring-cyan-500 transition-all shadow-sm"
              title="Profile"
            >
              <User className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default LandingNavbar;