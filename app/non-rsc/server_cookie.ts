'use server'

import { cookies } from 'next/headers';

export async function getUserToken() {
  // const token = await getCookie(USER_AUTH_TOKEN, { path: '/' });
  return (await cookies()).get('wp-auth-token')?.value;
};
