import React, { Component, Suspense } from 'react';

import { wrap } from 'react-worker-components';

import './TextBox';
import './Counter';
import { Props as HelloProps } from './Hello.worker';

const createWorker = () => new Worker(new URL('./Hello.worker', import.meta.url));

const Hello = wrap<HelloProps>(createWorker, 'Hello');

const WorkerCounter = wrap(createWorker, 'WorkerCounter');

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
    <Suspense fallback="Loading...">
      <h1>Hello</h1>
      <Hello count={10} />
      <WorkerCounter />
    </Suspense>
  </ErrorBoundary>
);

export default App;
