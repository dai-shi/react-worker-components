import React, { Suspense, useState } from 'react';

import { wrap } from 'react-worker-components';

import { TextBox } from './TextBox';

import { Props as FetcherProps } from './Fetcher.worker';

const Fetcher = wrap<FetcherProps>(() => new Worker('./Fetcher.worker', { type: 'module' }));

const Main: React.FC = () => {
  const [uid, setUid] = useState(1);
  return (
    <div>
      <span>User ID: {uid}</span>
      <button type="button" onClick={() => setUid((c) => c + 1)}>+1</button>
      <Suspense fallback="Loading...">
        <Fetcher uid={uid}>
          <TextBox />
        </Fetcher>
      </Suspense>
    </div>
  );
};

export default Main;
