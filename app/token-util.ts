const AUTH_LIFETIME = 10;
const REFRESH_LIFETIME = 5 * AUTH_LIFETIME;

export const authValid = (token: string): boolean => {
  const created = parseInt(token) / 1000;
  const now = Date.now() / 1000;
  console.log("authValid", created, now, created + AUTH_LIFETIME < now);
  return created + AUTH_LIFETIME < now;
};

export const refreshValid = (token: string): boolean => {
  const created = parseInt(token) / 1000;
  const now = Date.now() / 1000;
  console.log("refreshValid", created, now, created + REFRESH_LIFETIME < now);
  return created + REFRESH_LIFETIME < now;
};
