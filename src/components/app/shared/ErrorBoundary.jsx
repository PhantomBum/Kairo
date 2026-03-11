import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { colors, shadows } from '@/components/app/design/tokens';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[Kairo Error]', error, info?.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 flex items-center justify-center p-8" style={{ background: colors.bg.base }}>
          <div className="text-center max-w-sm">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center" style={{ background: `${colors.danger}15` }}>
              <AlertTriangle className="w-7 h-7" style={{ color: colors.danger }} />
            </div>
            <h2 className="text-[18px] font-bold mb-2" style={{ color: colors.text.primary }}>Something went wrong</h2>
            <p className="text-[14px] mb-6" style={{ color: colors.text.muted }}>
              An unexpected error occurred. Try reloading the page.
            </p>
            <button onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-[14px] font-semibold transition-all hover:brightness-110"
              style={{ background: colors.accent.primary, color: '#fff' }}>
              <RefreshCw className="w-4 h-4" /> Reload Kairo
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}