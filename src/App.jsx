import React from 'react';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import Kairo from '@/pages/Kairo';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Invite from '@/pages/Invite';

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 30000 } } });

function Protected({ children }) {
  const { user, isLoadingAuth } = useAuth();
  if (isLoadingAuth) {
    return (
      <div className="k-page" style={{ background: '#0a0a0b' }}>
        <div className="k-spinner" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  React.useEffect(() => {
    const h = (e) => e.preventDefault();
    document.addEventListener('contextmenu', h);
    return () => document.removeEventListener('contextmenu', h);
  }, []);

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/invite/:code" element={<Invite />} />
            <Route path="/" element={<Protected><Kairo /></Protected>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster theme="dark" position="bottom-right" toastOptions={{ style: { background: '#111114', border: '1px solid rgba(255,255,255,0.06)', color: '#ffffff' } }} />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
