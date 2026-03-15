import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { colors, shadows } from '@/components/app/design/tokens';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    this.setState({ errorInfo: info });
    // Structured error logging with full context
    console.error('[Kairo Error]', {
      message: error?.message,
      stack: error?.stack?.split('\n').slice(0, 5).join('\n'),
      component: info?.componentStack?.split('\n').slice(0, 3).join('\n'),
      url: window.location.href,
      timestamp: new Date().toISOString(),
      scope: this.props.scope || 'app',
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // If this is a scoped boundary (like a panel), show a minimal inline error
      if (this.props.fallback) {
        return this.props.fallback({ error: this.state.error, reset: this.handleReset });
      }
      return (
        <div className="flex-1 flex items-center justify-center p-8" style={{ background: colors.bg.base }}>
          <div className="text-center max-w-sm">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center" style={{ background: `${colors.danger}15` }}>
              <AlertTriangle className="w-7 h-7" style={{ color: colors.danger }} />
            </div>
            <h2 className="text-[18px] font-bold mb-2" style={{ color: colors.text.primary }}>Something went wrong on our end</h2>
            <p className="text-[14px] mb-4" style={{ color: colors.text.muted }}>
              Try refreshing the page — it usually works the second time.
            </p>
            {this.state.error?.message && (
              <p className="text-[12px] font-mono px-3 py-2 rounded-lg mb-5 break-words" style={{ background: colors.bg.overlay, color: colors.text.disabled, border: `1px solid ${colors.border.default}` }}>
                {this.state.error.message}
              </p>
            )}
            <div className="flex gap-3 justify-center">
              <button onClick={this.handleReset}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-colors hover:bg-[rgba(255,255,255,0.06)]"
                style={{ color: colors.text.secondary, border: `1px solid ${colors.border.default}` }}>
                Try Again
              </button>
              <button onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all hover:brightness-110"
                style={{ background: colors.accent.primary, color: '#fff' }}>
                <RefreshCw className="w-3.5 h-3.5" /> Reload
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}