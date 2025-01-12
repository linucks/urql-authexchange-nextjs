import Link from "next/link";
import { cacheExchange, createClient, fetchExchange, gql } from "@urql/core";
import { registerUrql } from "@urql/next/rsc";

import authExc from "../app/auth-exchange";
import { clearStorage, getToken, saveAuthData } from "./authstore";

export function SignIn() {
  return (
    <form
      action={async () => {
        "use server";
        await saveAuthData({
          token: Date.now().toString(),
          refreshToken: Date.now().toString(),
        });
      }}
    >
      <button type="submit">Sign in</button>
    </form>
  );
}

export function SignOut() {
  return (
    <form
      action={async () => {
        "use server";
        await clearStorage();
      }}
    >
      <button type="submit">Sign out</button>
    </form>
  );
}

const signedIn = async () => {
  return (await getToken()) ? true : false;
};

const makeClient = () => {
  return createClient({
    url: "https://graphql-pokeapi.graphcdn.app/",
    exchanges: [cacheExchange, authExc, fetchExchange],
  });
};

const { getClient } = registerUrql(makeClient);

const PokemonsQuery = gql`
  query {
    pokemons(limit: 10) {
      results {
        id
        name
      }
    }
  }
`;

export default async function Home() {
  const result = await getClient().query(PokemonsQuery, {});
  return (
    <main>
      <h1>This is rendered as part of an RSC</h1>
      {(await signedIn()) ? SignOut() : SignIn()}
      <ul>
        {result.data
          ? result.data.pokemons.results.map((x: any) => (
              <li key={x.id}>{x.name}</li>
            ))
          : `${JSON.stringify(result.error)}\n${result.error.graphQLErrors}\n${
              result.error.networkError
            }`}
      </ul>
      <Link href="/non-rsc">Non RSC</Link>
    </main>
  );
}
