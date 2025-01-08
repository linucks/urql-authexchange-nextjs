"use server";
import { gql } from "urql";
import { authExchange } from "@urql/exchange-auth";

import { getRefreshToken, getToken, saveAuthData } from "./authstore";
import { redirect } from "next/navigation";

const REFRESH_TOKEN_MUTATION = gql`
  mutation RefreshCredentials($refreshToken: String!) {
    refreshCredentials(refreshToken: $refreshToken) {
      refreshToken
      token
    }
  }
`;

const authExc = authExchange(async (utilities) => {
  let token = getToken();
  let refreshToken = getRefreshToken();

  return {
    addAuthToOperation(operation) {
      console.log("addAuthToOperation");
      return token
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
      // Hack to force failed refresh
      return true;
      // Sync tokens on every operation
      token = getToken();
      refreshToken = getRefreshToken();

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
      console.log("refreshAuth");
      if (refreshToken) {
        const result = await utilities.mutate(REFRESH_TOKEN_MUTATION, {
          refreshToken,
        });

        if (result.data?.refreshCredentials) {
          token = result.data.refreshCredentials.token;
          refreshToken = result.data.refreshCredentials.refreshToken;
          saveAuthData({ token, refreshToken });
          return;
        }
      }
      console.log("Failed to refresh token - logging out");
      // This is where auth has gone wrong and we need to clean up and redirect to a login page
      // clearStorage();
      // window.location.reload();
      redirect("/logout");
    },
  };
});

export default authExc;
