import { Component, ReactNode } from "react";

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
  error?: Error;
};

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    console.error("GLOBAL ERROR CAUGHT:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-10 text-center">
          <h1 className="text-3xl font-bold mb-4">Something went wrong</h1>
          <pre className="text-red-600">{String(this.state.error)}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}
