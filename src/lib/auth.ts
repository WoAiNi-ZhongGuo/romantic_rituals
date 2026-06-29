const STORAGE_KEY = 'lover_auth';

export function getPasswordHash(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16);
}

export function isAuthenticated(): boolean {
  return localStorage.getItem(STORAGE_KEY) === 'true';
}

export function login(password: string): boolean {
  const expectedHash = import.meta.env.VITE_APP_PASSWORD_HASH;
  if (!expectedHash) {
    localStorage.setItem(STORAGE_KEY, 'true');
    return true;
  }
  if (getPasswordHash(password) === expectedHash) {
    localStorage.setItem(STORAGE_KEY, 'true');
    return true;
  }
  return false;
}

export function logout(): void {
  localStorage.removeItem(STORAGE_KEY);
}
