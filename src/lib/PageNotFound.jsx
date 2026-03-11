import { useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { colors, shadows } from '@/components/app/design/tokens';

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
        <div className="w-20 h-20 rounded-3xl mx-auto mb-8 flex items-center justify-center" style={{ background: colors.bg.elevated }}>
          <span className="text-4xl font-bold" style={{ color: colors.text.disabled }}>?</span>
        </div>

        <h1 className="text-[48px] font-bold mb-2" style={{ color: colors.text.disabled }}>404</h1>
        <h2 className="text-[20px] font-semibold mb-2" style={{ color: colors.text.primary }}>Page not found</h2>
        <p className="text-[14px] leading-relaxed mb-8" style={{ color: colors.text.muted }}>
          We looked everywhere for <span className="font-semibold" style={{ color: colors.text.secondary }}>"{pageName || 'this page'}"</span> but it doesn't seem to exist.
        </p>

        {isFetched && authData?.isAuthenticated && authData?.user?.role === 'admin' && (
          <div className="mb-8 p-4 rounded-xl text-left" style={{ background: colors.bg.elevated, border: `1px solid ${colors.border.default}` }}>
            <p className="text-[13px] font-semibold mb-1" style={{ color: colors.warning }}>Admin Note</p>
            <p className="text-[13px] leading-relaxed" style={{ color: colors.text.muted }}>
              This page hasn't been created yet. You can ask the AI to build it in the chat.
            </p>
          </div>
        )}

        <button onClick={() => window.location.href = '/'}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-[14px] font-semibold"
          style={{ background: colors.accent.primary, color: '#fff' }}>
          Go Home
        </button>
      </div>
    </div>
  );
}