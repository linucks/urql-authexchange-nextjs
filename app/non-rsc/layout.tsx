'use client';

import { useMemo } from 'react';
import {
  UrqlProvider,
  ssrExchange,
  cacheExchange,
  fetchExchange,
  createClient,
} from '@urql/next';
// import { Client, Provider, cacheExchange, fetchExchange } from 'urql';

import Cookies from 'js-cookie';
import { getUserToken } from './server_cookie';

export default function Layout({ children }: React.PropsWithChildren) {
  const isClient = typeof window !== 'undefined';
  console.log(`IS CLIENT ${isClient}`);
  // const token = isClient ? Cookies.get('wp-auth-token') : getUserToken();
  const token = Cookies.get('wp-auth-token');
  console.log(`GOT TOKEN ${token}`);

  const [client, ssr] = useMemo(() => {
    const ssr = ssrExchange({
      isClient: isClient,
    });
    const client = createClient({
      url: 'http://api.sustainablesteps.local/wp/index.php?graphql',
      exchanges: [cacheExchange, ssr, fetchExchange],
      suspense: true,
      fetchOptions: () => {
        return {
          headers: { authorization: token ? `Bearer ${token}` : '' },
          // credentials: 'include'
          // cache: 'no-store',
        };
      },
    });

    return [client, ssr];
  }, []);


  // const client = new Client({
  //   url: 'http://api.sustainablesteps.local/wp/index.php?graphql',
  //   exchanges: [cacheExchange, fetchExchange],
  //   fetchOptions: () => {
  //     return {
  //       headers: { authorization: token ? `Bearer ${token}` : '' },
  //       // cache: 'no-store',
  //     };
  //   },
  // });

  return (
    // <Provider value={client}>
    <UrqlProvider client={client} ssr={ssr}>
      {children}
    </UrqlProvider>
    // </Provider>
  );
}
