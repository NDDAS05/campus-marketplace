import React from 'react';
import { User, Sun, Moon } from 'lucide-react';

// The landing page's own navbar — deliberately lighter than the marketplace
// Navbar (no search bar, no post/messages icons). It only ever shows:
//   CampusHive (brand)  ·  Login+Signup (logged out only)  ·  Theme toggle  ·  Profile
//
// isLoggedIn: when false, shows "Sign up" + "Login" (same treatment as the
//   main Navbar); when true, that slot is simply omitted.
// navigate: the app's fake-router setter (setCurrentPath from App.jsx).
const LandingNavbar = ({ isLoggedIn, navigate, theme, toggleTheme }) => {
  const linkClasses =
    "relative text-slate-800 dark:text-slate-200 font-medium after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-full after:origin-center after:scale-x-0 after:bg-black dark:after:bg-white after:transition-transform after:duration-300 hover:after:scale-x-100";

  return (
    <nav
      className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-b border-slate-100 dark:border-slate-800 sticky top-0 z-50 w-full"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      <div className="flex justify-between items-center px-4 sm:px-8 py-4 max-w-7xl mx-auto">

        {/* Brand */}
        <div
          onClick={() => navigate('/marketplace')}
          className="text-lg sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white cursor-pointer hover:opacity-80 transition-opacity truncate pr-2"
        >
          CampusHive
        </div>

        {/* Right: Login+Signup (logged out), theme toggle, profile */}
        <div className="flex items-center gap-3 sm:gap-6">

          {!isLoggedIn && (
            <>
              <button onClick={() => navigate('/signup')} className={`text-sm sm:text-base ${linkClasses}`}>
                Sign up
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-5 sm:px-7 py-2 sm:py-2.5 rounded-full border-2 border-black dark:border-white text-black dark:text-white font-medium text-sm sm:text-base transition-colors duration-300 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
              >
                Login
              </button>
            </>
          )}

          <button
            onClick={toggleTheme}
            className="text-slate-600 hover:text-black dark:text-slate-300 dark:hover:text-white transition-colors"
            title="Toggle Dark Mode"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <button
            onClick={() => navigate('/profile')}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 flex items-center justify-center hover:ring-2 hover:ring-black dark:hover:ring-white transition-all"
            title="Profile"
          >
            <User className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default LandingNavbar;