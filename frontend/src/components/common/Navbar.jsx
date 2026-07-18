import React, { useState } from 'react';
import { Search, Bell, MessageSquare, User, Plus, LogOut, Menu, X } from 'lucide-react';

const Navbar = ({ isLoggedIn, onLogin, onLogout, navigate }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  // Helper to close menus when a link is clicked
  const handleNavigate = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
    setIsMobileSearchOpen(false);
  };


  const linkClasses = "relative text-gray-800 font-medium after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-full after:origin-center after:scale-x-0 after:bg-black after:transition-transform after:duration-300 hover:after:scale-x-100";

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 w-full" style={{ fontFamily: "'Poppins', sans-serif" }}>
      
      {/* --- MAIN HEADER --- */}
      <div className="flex justify-between items-center px-4 sm:px-8 py-4 relative">
        
        {/* Left: Brand */}
        <div 
          onClick={() => handleNavigate('/')}
          className="text-lg sm:text-2xl font-bold tracking-tight text-gray-900 cursor-pointer hover:opacity-80 transition-opacity truncate pr-2"
        >
          Campus Marketplace
        </div>

        {/* Middle: Desktop Search Bar */}
        {isLoggedIn && (
          <div className="hidden md:flex flex-1 max-w-xl mx-8 relative">
            <input 
              type="text" 
              placeholder="Search items..." 
              className="w-full bg-gray-100 border-none rounded-full py-2 pl-5 pr-10 focus:ring-2 focus:ring-black outline-none transition-all"
            />
            <Search className="absolute right-4 top-2 text-gray-500 w-5 h-5 cursor-pointer" />
          </div>
        )}

        {/* Right: Desktop Links & Buttons */}
        <div className="hidden md:flex items-center gap-6">
          {!isLoggedIn ? (
            <>
              <button onClick={() => handleNavigate('/about')} className={linkClasses}>About us</button>
              <button onClick={() => handleNavigate('/signup')} className={linkClasses}>Sign up</button>
              <button onClick={onLogin} className="px-7 py-2.5 rounded-full border-2 border-black text-black font-medium transition-colors duration-300 hover:bg-black hover:text-white">Login</button>
            </>
          ) : (
            <>
              <button onClick={() => handleNavigate('/create')} className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-black text-white font-medium hover:bg-gray-800 transition-colors">
                <Plus className="w-4 h-4" /> Post Item
              </button>
              <div className="w-px h-6 bg-gray-200 mx-2"></div>
              <button onClick={() => handleNavigate('/messages')} className="text-gray-600 hover:text-black relative">
                <MessageSquare className="w-6 h-6" />
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <button className="text-gray-600 hover:text-black"><Bell className="w-6 h-6" /></button>
              <div className="relative group cursor-pointer ml-2">
                <div onClick={() => handleNavigate('/profile')} className="w-10 h-10 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center hover:ring-2 hover:ring-black">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Mobile Icons & Hamburger Button */}
        <div className="md:hidden flex items-center gap-3 sm:gap-4">
          
          {/* Mobile Search Toggle */}
          <button 
            onClick={() => {
              setIsMobileSearchOpen(true);
              setIsMobileMenuOpen(false); // Close menu if it was open
            }} 
            className="text-gray-600 hover:text-black"
          >
            <Search className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {isLoggedIn && (
            <>
              <button onClick={() => handleNavigate('/create')} className="w-8 h-8 flex items-center justify-center rounded-full bg-black text-white hover:bg-gray-800 transition-colors">
                <Plus className="w-5 h-5" />
              </button>
              <button onClick={() => handleNavigate('/messages')} className="text-gray-600 hover:text-black relative">
                <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="absolute top-0 right-0 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
            </>
          )}
          
          {/* Hamburger Menu Toggle */}
          <button 
            onClick={() => {
              setIsMobileMenuOpen(!isMobileMenuOpen);
              setIsMobileSearchOpen(false); // Close search if it was open
            }} 
            className="text-gray-800 ml-1"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6 sm:w-7 sm:h-7" /> : <Menu className="w-6 h-6 sm:w-7 sm:h-7" />}
          </button>
        </div>

        {/* --- MOBILE SEARCH OVERLAY --- */}
        <div 
          className={`md:hidden absolute top-0 left-0 w-full h-full bg-white z-[60] flex items-center px-4 transition-all duration-300 ease-in-out ${
            isMobileSearchOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
          }`}
        >
          <div className="flex-1 flex items-center bg-gray-100 rounded-full px-4 py-2">
            <Search className="w-5 h-5 text-gray-500 flex-shrink-0" />
            {/* We conditionally render the input so autoFocus works every time it opens */}
            {isMobileSearchOpen && (
              <input 
                type="text" 
                placeholder="Search textbooks, electronics..." 
                className="w-full bg-transparent border-none outline-none px-3 text-sm text-gray-900"
                autoFocus
              />
            )}
          </div>
          <button 
            onClick={() => setIsMobileSearchOpen(false)} 
            className="ml-3 p-1 text-gray-600 hover:text-black"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* --- MOBILE MENU DROPDOWN --- */}
      <div 
        className={`md:hidden absolute w-full left-0 bg-white shadow-lg overflow-hidden transition-all duration-300 ease-in-out origin-top ${
          isMobileMenuOpen ? 'max-h-[300px] opacity-100 border-t border-gray-100 pb-2' : 'max-h-0 opacity-0 pointer-events-none'
        }`}
      >
        <div className="p-4 flex flex-col gap-4">
          {isLoggedIn ? (
            <>
              <button onClick={() => handleNavigate('/profile')} className="w-full py-2 text-left font-medium text-gray-800">My Profile</button>
              <button onClick={() => { onLogout(); setIsMobileMenuOpen(false); }} className="w-full py-2 text-left font-medium text-red-600">Logout</button>
            </>
          ) : (
            <>
              <button onClick={() => handleNavigate('/about')} className="w-full py-2 text-left font-medium text-gray-800">About us</button>
              <button onClick={() => handleNavigate('/signup')} className="w-full py-2 text-left font-medium text-gray-800">Sign up</button>
              <button onClick={() => { onLogin(); setIsMobileMenuOpen(false); }} className="w-full py-2 border-2 border-black rounded-full font-medium text-center transition-colors duration-300 hover:bg-black hover:text-white">Login</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;