import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught runtime error intercepted by AI Giga-Guardian Boundary:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleResetApp = () => {
    try {
      // Clear storage keys that could cause boot loops
      sessionStorage.clear();
      // Retain essential items like Auth, but clear potential malformed states
      const keysToKeep = ['sb-xstbuiishcldznuusshw-auth-token'];
      const backups: Record<string, string> = {};
      
      keysToKeep.forEach(k => {
        const val = localStorage.getItem(k);
        if (val) backups[k] = val;
      });

      localStorage.clear();

      Object.entries(backups).forEach(([k, v]) => {
        localStorage.setItem(k, v);
      });

      // Reload completely
      window.location.href = '/';
    } catch (e) {
      window.location.reload();
    }
  };

  public render() {
    const { hasError, error } = this.state;
    // When using ref children in class components, refer to props.children
    const { children } = this.props;

    if (hasError) {
      return (
        <div id="error-boundary-screen" className="min-h-screen bg-[#f5f5f0] dark:bg-[#0c0c0d] flex items-center justify-center p-4 sm:p-6 transition-colors duration-300">
          <div id="error-boundary-card" className="w-full max-w-xl bg-white dark:bg-zinc-900 border border-red-100 dark:border-red-950/30 rounded-[32px] p-6 sm:p-10 shadow-2xl relative overflow-hidden flex flex-col md:items-center text-center space-y-6">
            {/* Background Accent */}
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-amber-500 via-[#cca568] to-red-500" />
            
            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/20 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <AlertOctagon className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-serif font-black text-gray-900 dark:text-white tracking-tight">
                Interrupted Flight
              </h1>
              <p className="text-[#cca568] font-mono text-xs uppercase tracking-widest font-bold">
                Runtime Guard Active
              </p>
            </div>

            <div className="bg-amber-50/50 dark:bg-zinc-950 p-4 rounded-2xl border border-amber-100/50 dark:border-zinc-800 text-xs text-gray-500 dark:text-gray-400 font-mono text-left max-h-48 overflow-y-auto leading-relaxed w-full">
              <p className="font-semibold text-red-600 dark:text-red-400 mb-1">
                ERROR: {error?.message || 'An unexpected client-side exception occurred.'}
              </p>
              {error?.stack && (
                <span className="opacity-80 block text-[10px] sm:text-xs">
                  {error.stack}
                </span>
              )}
            </div>

            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed max-w-md">
              A runtime glitch temporarily halted your dashboard session. Click the <strong>Reset App</strong> button down below to discard malformed local states and resume leadership training.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
              <button
                onClick={this.handleResetApp}
                id="reset-app-button"
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-amber-600 to-[#cca568] hover:from-amber-700 hover:to-[#b8955c] text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-amber-500/10 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                Reset App
              </button>
              <button
                onClick={() => { window.location.href = '/'; }}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-gray-700 dark:text-gray-200 text-sm font-semibold rounded-xl transition-all cursor-pointer"
              >
                <Home className="w-4 h-4" />
                Return Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return children;
  }
}
