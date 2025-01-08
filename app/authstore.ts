"use server";

import { cookies } from "next/headers";

const TOKEN_KEY = "token";
const REFRESH_TOKEN_KEY = "refresh_token";

export const saveAuthData = async ({ token, refreshToken }) => {
  (await cookies()).set({
    name: TOKEN_KEY,
    value: token,
  });
  (await cookies()).set({
    name: REFRESH_TOKEN_KEY,
    value: refreshToken,
  });
};

export const getToken = async () => {
  return (await cookies()).get(TOKEN_KEY)?.value;
};

export const getRefreshToken = async () => {
  return (await cookies()).get(REFRESH_TOKEN_KEY)?.value;
};

export const clearStorage = async () => {
  (await cookies()).delete(TOKEN_KEY);
  (await cookies()).delete(REFRESH_TOKEN_KEY);
};
