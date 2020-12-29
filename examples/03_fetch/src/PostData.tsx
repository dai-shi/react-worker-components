import React from 'react';

import { createFetchStore } from 'react-suspense-fetch';

type Props = {
  name: string;
  id: number;
};

type Result = {
  data: {
    id: number;
    name: string;
    color: string;
  };
};

const fetchPost = async (path: string): Promise<Result> => {
  const response = await fetch(`https://reqres.in/api/${path}?delay=1`);
  return response.json();
};

const store = createFetchStore(fetchPost);

export const PostData: React.FC<Props> = ({ name, id }) => {
  const { data } = store.get(`${name}/${id}`);
  return (
    <div>Post Data: {data.name}</div>
  );
};
