import { useLocation } from 'react-router-dom';
import { Crown } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { colors } from '@/components/app/design/tokens';

export default function PageNotFound() {
  const location = useLocation();
  const pageName = location.pathname.substring(1);

  const { data: authData, isFetched } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        const user = await base44.auth.me();
        return { user, isAuthenticated: true };
      } catch {
        return { user: null, isAuthenticated: false };
      }
    }
  });

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: colors.bg.base }}>
      <div className="max-w-md w-full text-center k-fade-in">
        <div className="w-20 h-20 rounded-3xl mx-auto mb-8 flex items-center justify-center" style={{ background: `${colors.accent.primary}15`, border: `1px solid ${colors.accent.primary}30` }}>
          <Crown className="w-10 h-10" style={{ color: colors.accent.primary }} />
        </div>

        <h1 className="text-[28px] font-bold mb-2" style={{ color: colors.text.primary }}>We couldn't find that page</h1>
        <p className="text-[15px] leading-relaxed mb-8" style={{ color: colors.text.muted }}>
          The page you're looking for might have moved or doesn't exist. No worries — we'll get you back on track.
        </p>

        {isFetched && authData?.isAuthenticated && authData?.user?.role === 'admin' && (
          <div className="mb-8 p-4 rounded-xl text-left" style={{ background: colors.bg.elevated, border: `1px solid ${colors.border.default}` }}>
            <p className="text-[13px] font-semibold mb-1" style={{ color: colors.warning }}>Admin Note</p>
            <p className="text-[13px] leading-relaxed" style={{ color: colors.text.muted }}>
              This page hasn't been created yet. You can ask the AI to build it in the chat.
            </p>
          </div>
        )}

        <a href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[14px] font-semibold transition-all hover:brightness-110"
          style={{ background: colors.accent.primary, color: '#0d1117' }}>
          Go Home
        </a>
      </div>
    </div>
  );
}