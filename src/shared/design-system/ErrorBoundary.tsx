import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-kraft-bg flex items-center justify-center p-6">
          <div className="max-w-md w-full highlight-card p-12 text-center space-y-8">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-kraft-red/10 rounded-full flex items-center justify-center text-kraft-red">
                <AlertTriangle size={40} />
              </div>
            </div>
            <div className="space-y-4">
              <h1 className="text-3xl font-black tracking-tighter text-kraft-ink uppercase">Đã có lỗi xảy ra</h1>
              <p className="text-kraft-accent text-sm font-black uppercase tracking-widest opacity-60 leading-relaxed">
                Ứng dụng gặp sự cố không mong muốn. Vui lòng tải lại trang hoặc liên hệ quản trị viên.
              </p>
            </div>
            {this.state.error && (
              <div className="p-4 bg-kraft-folder-dark/20 rounded-xl text-left overflow-auto max-h-32">
                <p className="text-[10px] text-kraft-ink opacity-70 break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}
            <button 
              onClick={() => window.location.reload()}
              className="w-full liquid-button-primary h-16 flex items-center justify-center gap-4 group"
            >
              <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
              <span className="text-lg font-black uppercase tracking-widest">Tải lại trang</span>
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
