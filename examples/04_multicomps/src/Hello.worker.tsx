import React from 'react';

import { expose } from 'react-worker-components';

import { TextBox } from './TextBox';
import { Counter } from './Counter';

const fib = (i: number): number => (i <= 1 ? i : fib(i - 1) + fib(i - 2));

export type Props = {
  count: number;
};

const Hello: React.FC<Props> = ({ count }) => {
  const fibNum = fib(count);
  return (
    <div>
      <div>Hello from worker: {fibNum}</div>
      <h1>Worker TextBox</h1>
      <TextBox />
    </div>
  );
};

expose(Hello, 'Hello');

const WorkerCounter: React.FC = () => (
  <div>
    <h1>Worker Counter</h1>
    <Counter />
  </div>
);

expose(WorkerCounter, 'WorkerCounter');
