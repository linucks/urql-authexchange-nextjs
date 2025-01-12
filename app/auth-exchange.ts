"use server";
import { gql } from "urql";
import { authExchange } from "@urql/exchange-auth";

import { getRefreshToken, getToken, saveAuthData } from "./authstore";
import { redirect } from "next/navigation";
import { authValid, refreshValid } from "./token-util";

const REFRESH_TOKEN_MUTATION = gql`
  mutation RefreshCredentials($refreshToken: String!) {
    refreshCredentials(refreshToken: $refreshToken) {
      refreshToken
      token
    }
  }
`;

const authExc = authExchange(async (utilities) => {
  let token = await getToken();
  let refreshToken = await getRefreshToken();

  return {
    addAuthToOperation(operation) {
      console.log("addAuthToOperation ", authValid(token));
      return authValid(token)
        ? utilities.appendHeaders(operation, {
            Authorization: `Bearer ${token}`,
          })
        : operation;
    },
    didAuthError(error) {
      console.log("didAuthError");
      return error.graphQLErrors.some(
        (e) => e.extensions?.code === "UNAUTHORIZED"
      );
    },
    willAuthError(operation) {
      console.log("willAuthError");
      // Sync tokens on every operation.
      // ISSUE: How to do this as not async function?
      // token = await getAuthToken(isAdmin);
      // refreshToken = await getRefreshToken(isAdmin);

      return true; // force auth error to trigger refreshAuth
      if (!token) {
        // Detect our login mutation and let this operation through:
        return (
          operation.kind !== "mutation" ||
          // Here we find any mutation definition with the "signin" field
          !operation.query.definitions.some((definition) => {
            return (
              definition.kind === "OperationDefinition" &&
              definition.selectionSet.selections.some((node) => {
                // The field name is just an example, since register may also be an exception
                return node.kind === "Field" && node.name.value === "signin";
              })
            );
          })
        );
      }
      return false;
    },
    async refreshAuth() {
      if (refreshValid(refreshToken)) {
        console.log("refreshAuth refreshing token");
        const result = await utilities.mutate(REFRESH_TOKEN_MUTATION, {
          refreshToken,
        });
        if (result.data?.refreshCredentials) {
          token = result.data.refreshCredentials.token;
          refreshToken = result.data.refreshCredentials.refreshToken;
          // This fails with:
          // Error: Cookies can only be modified in a Server Action or Route Handler.
          await saveAuthData({ token, refreshToken });
          return;
        }
      }
      console.log("Failed to refresh token - logging out");
      // Refresh has gone wrong so we need to cleanup and logout by redirecting to the logout page
      // This fails with: NEXT_REDIRECT;replace;/logout;307;
      redirect("/logout");
    },
  };
});

export default authExc;
