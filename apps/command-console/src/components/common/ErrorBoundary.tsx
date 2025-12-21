/**
 * ErrorBoundary - Catches React errors and displays graceful fallback
 *
 * Features:
 * - Catches JavaScript errors anywhere in child component tree
 * - Logs error information
 * - Displays user-friendly error message
 * - Provides retry functionality
 */

import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center justify-center min-h-[200px] p-6">
          <div className="glass rounded-lg p-6 max-w-md text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-severe/20 flex items-center justify-center">
              <AlertTriangle className="text-severe" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Something went wrong
            </h3>
            <p className="text-sm text-slate-400 mb-4">
              An unexpected error occurred. Please try again.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left mb-4 text-xs">
                <summary className="text-slate-500 cursor-pointer hover:text-slate-300">
                  Error details
                </summary>
                <pre className="mt-2 p-2 bg-slate-800 rounded text-red-400 overflow-auto max-h-32">
                  {this.state.error.message}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            <button
              onClick={this.handleRetry}
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent-cyan text-slate-900 rounded-lg font-medium text-sm hover:bg-accent-cyan/90 transition-colors"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
