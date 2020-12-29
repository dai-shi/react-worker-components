import React, { Component } from 'react';

import Main from './Main';

class ErrorBoundary extends Component<unknown, { error: unknown }> {
  constructor(props: unknown) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    const { error } = this.state;
    const { children } = this.props;
    if (error) {
      return (
        <div>
          <h1>Error</h1>
          <p>{`${error}`}</p>
        </div>
      );
    }
    return children;
  }
}

const App: React.FC = () => (
  <ErrorBoundary>
    <Main />
  </ErrorBoundary>
);

export default App;
