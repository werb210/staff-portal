import { Component, ReactNode } from "react";

export default class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: any }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-3 text-red-600">App Error</h1>
          <pre className="bg-gray-100 p-4 rounded">{String(this.state.error)}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}
