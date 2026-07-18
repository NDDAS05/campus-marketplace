import React, { useState, useEffect } from 'react';
import Navbar from './components/common/Navbar';
import HomePage from './pages/Home';
import AuthPage from './pages/Authpage';
import ProfilePage from './pages/Profilepage';
import MessagesPage from './pages/Messagepage';
import ListingDetailPage from './pages/ListingDetailPage';
import PublicProfilePage from './pages/PublicProfilePage';
import { authApi } from './utils/api';

import CreateListingPage from './pages/Createlistingpage';

export default function App() {
  // Real session state — user is null until the server confirms who's logged in.
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState('/');

  const isLoggedIn = !!user;

  // On first load, ask the backend if the httpOnly cookie is still valid.
  // This is what keeps someone logged in across a page refresh.
  useEffect(() => {
    (async () => {
      try {
        const data = await authApi.getMe();
        setUser(data.user);
      } catch {
        setUser(null); // no valid session — that's fine, just means logged out
      } finally {
        setIsAuthLoading(false);
      }
    })();
  }, []);

  // Called by AuthPage once the server confirms login/signup succeeded
  const handleAuthSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    setCurrentPath('/');
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // even if the request fails, clear local state so the UI doesn't
      // stay stuck showing a "logged in" view
    }
    setUser(null);
    setCurrentPath('/');
  };

  // Simple router logic to render correct component based on state.
  // Dynamic segments (/listing/:id, /user/:id) are checked first since the
  // switch below only does exact matches.
  const renderPage = () => {
    if (currentPath.startsWith('/listing/')) {
      const listingId = currentPath.slice('/listing/'.length);
      return <ListingDetailPage listingId={listingId} navigate={setCurrentPath} currentUser={user} />;
    }
    if (currentPath.startsWith('/user/')) {
      const userId = currentPath.slice('/user/'.length);
      return <PublicProfilePage userId={userId} navigate={setCurrentPath} />;
    }

    switch (currentPath) {
      case '/': return <HomePage navigate={setCurrentPath} />;
      case '/login':
        return <AuthPage mode="login" onAuthSuccess={handleAuthSuccess} navigate={setCurrentPath} />;
      case '/signup':
        return <AuthPage mode="signup" onAuthSuccess={handleAuthSuccess} navigate={setCurrentPath} />;
      case '/profile':
        return isLoggedIn
          ? <ProfilePage onLogout={handleLogout} />
          : <AuthPage mode="login" onAuthSuccess={handleAuthSuccess} navigate={setCurrentPath} message="Please log in to view your profile" />;
      case '/messages':
        return isLoggedIn
          ? <MessagesPage />
          : <AuthPage mode="login" onAuthSuccess={handleAuthSuccess} navigate={setCurrentPath} message="Please log in to view your messages" />;
      case '/about': return <div className="p-8">About Page Placeholder</div>;
      case '/create':
        return isLoggedIn
          ? <CreateListingPage navigate={setCurrentPath} />
          : <AuthPage mode="login" onAuthSuccess={handleAuthSuccess} navigate={setCurrentPath} message="Please log in to post an item" />;
      default: return <HomePage navigate={setCurrentPath} />;
    }
  };

  // Avoid flashing the logged-out navbar/buttons for a split second while
  // we're still checking the cookie on first load.
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      <Navbar
        isLoggedIn={isLoggedIn}
        onLogin={() => setCurrentPath('/login')}
        onLogout={handleLogout}
        navigate={setCurrentPath}
      />

      {/* Main content wrapper */}
      <main className="flex flex-1 w-full">
        {renderPage()}
      </main>
    </div>
  );
}