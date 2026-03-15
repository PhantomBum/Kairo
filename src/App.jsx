import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Invite from '@/pages/Invite';
import Wrapped from '@/pages/Wrapped';
import ServerWidget from '@/pages/ServerWidget';
import KairoLoadingScreen from '@/components/app/KairoLoadingScreen';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AuthenticatedApp = () => {
  const { pathname } = useLocation();
  const { isLoadingAuth, isLoadingPublicSettings, authError, user } = useAuth();
  const [loadingDismissed, setLoadingDismissed] = useState(false);
  const loadingRef = useRef(false);

  const isLoading = isLoadingAuth || isLoadingPublicSettings;
  const username = user?.full_name || user?.email?.split('@')[0] || '';
  const onReady = useCallback(() => setLoadingDismissed(true), []);

  // Public embed route — no auth required
  if (pathname.startsWith('/embed/')) {
    return (
      <Routes>
        <Route path="/embed/:serverId" element={<ServerWidget />} />
      </Routes>
    );
  }

  if (isLoading || !loadingDismissed) {
    return (
      <KairoLoadingScreen
        isLoading={isLoading}
        username={username}
        onReady={onReady}
      />
    );
  }

  // Handle authentication errors (but don't force login on a public app)
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    }
    // For auth_required or other errors, just continue — app is public
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/invite/:code" element={<Invite />} />
      <Route path="/wrapped/:username/:year" element={<Wrapped />} />
      <Route path="/" element={
        <LayoutWrapper currentPageName={mainPageKey}>
          <MainPage />
        </LayoutWrapper>
      } />
      {Object.entries(Pages).map(([path, Page]) => (
        <Route
          key={path}
          path={`/${path}`}
          element={
            <LayoutWrapper currentPageName={path}>
              <Page />
            </LayoutWrapper>
          }
        />
      ))}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {
  React.useEffect(() => {
    const blockNativeContextMenu = (e) => e.preventDefault();
    window.addEventListener('contextmenu', blockNativeContextMenu);
    return () => window.removeEventListener('contextmenu', blockNativeContextMenu);
  }, []);

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <NavigationTracker />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App