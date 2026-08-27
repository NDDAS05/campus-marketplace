import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/common/Navbar';
import HomePage from './pages/Home';
import AuthPage from './pages/Authpage';
import ProfilePage from './pages/Profilepage';
import MessagesPage from './pages/Messagepage';
import ListingDetailPage from './pages/Listingdetailpage';
import PublicProfilePage from './pages/Publicprofilepage';
import { authApi } from './utils/api';
import LandingPage from './pages/LandingPage';
import CreateListingPage from './pages/Createlistingpage';
import EditListingPage from './pages/EditListingPage';

export default function App() {
  // Real session state — user is null until the server confirms who's logged in.
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // FIX ("Back goes to Google instead of the previous page in-app"):
  // currentPath used to be plain React state, set via setCurrentPath with
  // no interaction with the browser's actual URL/history at all. That
  // meant every in-app "navigation" — Landing -> Marketplace -> a listing
  // -> Profile — never created a new browser history entry. The whole
  // session was ONE entry, so pressing Back had nothing of ours to go
  // back to, and fell through to whatever real page you'd loaded the
  // site from (e.g. a Google results page).
  //
  // Fix: seed currentPath from the real URL, push a real history entry
  // on every navigate() call, and listen for popstate (Back/Forward) to
  // sync state back from the URL. Every page already calls the prop
  // named `navigate`, so this is a drop-in replacement — only App.jsx
  // needed to change.
  const [currentPath, setCurrentPathState] = useState(
    () => window.location.pathname + window.location.search
  );

  const navigate = useCallback((path) => {
    const current = window.location.pathname + window.location.search;
    if (path !== current) {
      window.history.pushState({ path }, '', path);
    }
    setCurrentPathState(path);
  }, []);

  useEffect(() => {
    const onPopState = () => {
      setCurrentPathState(window.location.pathname + window.location.search);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

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
    navigate('/marketplace');
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // even if the request fails, clear local state so the UI doesn't
      // stay stuck showing a "logged in" view
    }
    setUser(null);
    navigate('/');
  };

  // Split the route from any query params (e.g. "/marketplace?search=..."
  // from the Navbar search box) once, up front, so both renderPage() and
  // the showGlobalNavbar check below use the same basePath.
  const [basePath] = currentPath.split('?');

  const renderPage = () => {
    // "/listing/:id/edit" must be checked BEFORE the generic
    // "/listing/:id" branch below — otherwise that branch's naive slice()
    // treats "<id>/edit" as the listing id itself and Edit silently breaks.
    const editMatch = basePath.match(/^\/listing\/([^/]+)\/edit$/);
    if (editMatch) {
      const listingId = editMatch[1];
      return isLoggedIn
        ? <EditListingPage listingId={listingId} navigate={navigate} />
        : <AuthPage mode="login" onAuthSuccess={handleAuthSuccess} navigate={navigate} message="Please log in to edit your listing" />;
    }
    if (basePath.startsWith('/listing/')) {
      const listingId = basePath.slice('/listing/'.length);
      return <ListingDetailPage listingId={listingId} navigate={navigate} currentUser={user} />;
    }
    if (basePath.startsWith('/user/')) {
      const userId = basePath.slice('/user/'.length);
      return <PublicProfilePage userId={userId} navigate={navigate} />;
    }
    if (basePath.startsWith('/edit/')) {
      const listingId = basePath.slice('/edit/'.length);
      return isLoggedIn
        ? <EditListingPage listingId={listingId} navigate={navigate} />
        : <AuthPage mode="login" onAuthSuccess={handleAuthSuccess} navigate={navigate} message="Please log in to edit your listing" />;
    }

    switch (basePath) {
      // '/' is the CampusHive landing page — it owns its own (lighter)
      // navbar, so the global marketplace Navbar is hidden for this path
      // (see the `showGlobalNavbar` check below).
      case '/':
        return (
          <LandingPage
            navigate={navigate}
            isLoggedIn={isLoggedIn}
            theme={theme}
            toggleTheme={toggleTheme}
          />
        );
      // The marketplace feed — query params like ?search=... stay attached
      // to currentPath so HomePage/Navbar can read them.
      case '/marketplace':
        return <HomePage navigate={navigate} currentPath={currentPath} currentUser={user} />;
      case '/login':
        return <AuthPage mode="login" onAuthSuccess={handleAuthSuccess} navigate={navigate} />;
      case '/signup':
        return <AuthPage mode="signup" onAuthSuccess={handleAuthSuccess} navigate={navigate} />;
      case '/profile':
        return isLoggedIn
          ? <ProfilePage onLogout={handleLogout} navigate={navigate} />
          : <AuthPage mode="login" onAuthSuccess={handleAuthSuccess} navigate={navigate} message="Please log in to view your profile" />;
      case '/messages':
        return isLoggedIn
          ? <MessagesPage navigate={navigate} currentPath={currentPath} currentUser={user} />
          : <AuthPage mode="login" onAuthSuccess={handleAuthSuccess} navigate={navigate} message="Please log in to view your messages" />;
      case '/create':
        return isLoggedIn
          ? <CreateListingPage navigate={navigate} />
          : <AuthPage mode="login" onAuthSuccess={handleAuthSuccess} navigate={navigate} message="Please log in to post an item" />;
      default:
        return (
          <LandingPage
            navigate={navigate}
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
          onLogin={() => navigate('/login')}
          onLogout={handleLogout}
          navigate={navigate}
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