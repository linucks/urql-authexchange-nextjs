'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { useQuery, gql } from '@urql/next';
// import { useQuery, gql } from 'urql';


export default function Page() {
  return (
    <Suspense>
      <Pokemons />
    </Suspense>
  );
}

const TestQuery = gql`
query MyQuery {
  posts {
    nodes {
      id
      title
    }
  }
  viewer {
    email
  }
}
`;

function Pokemons() {
  const [result] = useQuery({ query: TestQuery });
  // console.log(`GOT RESULT ${JSON.stringify(result, null, 2)}`)
  if (result.fetching) return <p>Loading...</p>;
  return (
    <main>
      <h1>This is rendered as part of SSR</h1>
      <ul>
        {result.data
          ? result.data.posts.nodes.map((x: any) => (
              <li key={x.id}>{x.title}</li>
            ))
          : JSON.stringify(result.error)}
      </ul>
      <p>{result.data && result.data.viewer ? result.data.viewer.email : 'No viewer'}</p>
      <Link href="/">RSC</Link>
    </main>
  );
}


