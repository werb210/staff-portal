export function saveToken(token: string) {
  localStorage.setItem("bf_auth", token);
}

export function getToken() {
  return localStorage.getItem("bf_auth");
}

export function clearToken() {
  localStorage.removeItem("bf_auth");
}

export function isLoggedIn() {
  return Boolean(getToken());
}
