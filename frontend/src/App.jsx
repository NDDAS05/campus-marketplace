import React, { useState, useEffect } from 'react';
import Navbar from './components/common/Navbar';
import HomePage from './pages/Home';
import AuthPage from './pages/Authpage';
import ProfilePage from './pages/Profilepage';
import MessagesPage from './pages/Messagepage';
import ListingDetailPage from './pages/ListingDetailPage';
import PublicProfilePage from './pages/PublicProfilePage';
import { authApi } from './utils/api';
import LandingPage from './pages/LandingPage';
import CreateListingPage from './pages/Createlistingpage';

export default function App() {
  // Real session state — user is null until the server confirms who's logged in.
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState('/');

  // Theme state — persisted in localStorage, falls back to 'light'.
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

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

  // Called by AuthPage once the server confirms login/signup succeeded.
  // Sends the person into the marketplace feed, not back to the landing page.
  const handleAuthSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    setCurrentPath('/marketplace');
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

  // Split the route from any query params (e.g. "/marketplace?search=..."
  // from the Navbar search box) once, up front, so both renderPage() and
  // the showGlobalNavbar check below use the same basePath.
  const [basePath] = currentPath.split('?');

  const renderPage = () => {
    if (basePath.startsWith('/listing/')) {
      const listingId = basePath.slice('/listing/'.length);
      return <ListingDetailPage listingId={listingId} navigate={setCurrentPath} currentUser={user} />;
    }
    if (basePath.startsWith('/user/')) {
      const userId = basePath.slice('/user/'.length);
      return <PublicProfilePage userId={userId} navigate={setCurrentPath} />;
    }

    switch (basePath) {
      // '/' is the CampusHive landing page — it owns its own (lighter)
      // navbar, so the global marketplace Navbar is hidden for this path
      // (see the `showGlobalNavbar` check below).
      case '/':
        return (
          <LandingPage
            navigate={setCurrentPath}
            isLoggedIn={isLoggedIn}
            theme={theme}
            toggleTheme={toggleTheme}
          />
        );
      // The marketplace feed — query params like ?search=... stay attached
      // to currentPath so HomePage/Navbar can read them.
      case '/marketplace':
        return <HomePage navigate={setCurrentPath} currentPath={currentPath} />;
      case '/login':
        return <AuthPage mode="login" onAuthSuccess={handleAuthSuccess} navigate={setCurrentPath} />;
      case '/signup':
        return <AuthPage mode="signup" onAuthSuccess={handleAuthSuccess} navigate={setCurrentPath} />;
      case '/profile':
        return isLoggedIn
          ? <ProfilePage onLogout={handleLogout} navigate={setCurrentPath} />
          : <AuthPage mode="login" onAuthSuccess={handleAuthSuccess} navigate={setCurrentPath} message="Please log in to view your profile" />;
      case '/messages':
        return isLoggedIn
          ? <MessagesPage />
          : <AuthPage mode="login" onAuthSuccess={handleAuthSuccess} navigate={setCurrentPath} message="Please log in to view your messages" />;
      case '/create':
        return isLoggedIn
          ? <CreateListingPage navigate={setCurrentPath} />
          : <AuthPage mode="login" onAuthSuccess={handleAuthSuccess} navigate={setCurrentPath} message="Please log in to post an item" />;
      default:
        return (
          <LandingPage
            navigate={setCurrentPath}
            isLoggedIn={isLoggedIn}
            theme={theme}
            toggleTheme={toggleTheme}
          />
        );
    }
  };

  // The landing page ('/') renders its own lightweight navbar internally,
  // so we don't want to stack the full marketplace Navbar on top of it.
  // Every other route keeps the usual Navbar (search, post item, profile, etc).
  const showGlobalNavbar = basePath !== '/';

  // Avoid flashing the logged-out navbar/buttons for a split second while
  // we're still checking the cookie on first load.
  if (isAuthLoading) {
    return (
      <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-300 dark:border-gray-700 border-t-black dark:border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-950 flex flex-col font-sans text-gray-900 dark:text-gray-100">
      {showGlobalNavbar && (
        <Navbar
          isLoggedIn={isLoggedIn}
          onLogin={() => setCurrentPath('/login')}
          onLogout={handleLogout}
          navigate={setCurrentPath}
          currentPath={currentPath}
          theme={theme}
          toggleTheme={toggleTheme}
        />
      )}

      {/* Main content wrapper */}
      <main className="flex flex-1 w-full">
        {renderPage()}
      </main>
    </div>
  );
}