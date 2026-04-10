const JWT_KEY = "blogflow_jwt";
const USER_ID_KEY = "blogflow_userId";

export function getToken(): string | null {
  return localStorage.getItem(JWT_KEY);
}

export function getUserId(): string | null {
  return localStorage.getItem(USER_ID_KEY);
}

export function setSession(jwt: string, userId: string) {
  localStorage.setItem(JWT_KEY, jwt);
  localStorage.setItem(USER_ID_KEY, userId);
}

export function clearSession() {
  localStorage.removeItem(JWT_KEY);
  localStorage.removeItem(USER_ID_KEY);
}
