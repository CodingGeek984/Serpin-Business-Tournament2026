import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-[var(--color-bg-primary)] p-6 text-center text-[var(--color-text-primary)]">
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-8 shadow-xl max-w-md w-full">
            <h1 className="mb-4 text-2xl font-bold text-red-500">Упс! Что-то пошло не так.</h1>
            <p className="mb-6 text-[var(--color-text-secondary)]">
              Произошла непредвиденная ошибка. Мы уже работаем над её устранением.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Перезагрузить страницу
            </button>
            {this.state.error && (
              <div className="mt-6 text-left">
                <p className="text-xs text-[var(--color-text-secondary)] truncate">
                  Error: {this.state.error.message}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
