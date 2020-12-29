import React from 'react';

import { createFetchStore } from 'react-suspense-fetch';
import { expose } from 'react-worker-components';

import { PostData } from './PostData';
import { TextBox } from './TextBox';

export type Props = {
  uid: number;
};

type Result = {
  data: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  };
};

const fetchUser = async (uid: number): Promise<Result> => {
  const response = await fetch(`https://reqres.in/api/users/${uid}?delay=1`);
  return response.json();
};

const store = createFetchStore(fetchUser);

const Foo: React.FC = ({ children }) => (<span>{children}</span>);

const Fetcher: React.FC<Props> = ({ uid, children }) => {
  const { data } = store.get(uid);
  return (
    <Foo>
      <div>User Name: {data.first_name} {data.last_name}</div>
      <PostData name={data.first_name} id={1} />
      <h1>Main TextBox</h1>
      {children}
      <h1>Worker TextBox</h1>
      <TextBox />
    </Foo>
  );
};

expose(Fetcher);
