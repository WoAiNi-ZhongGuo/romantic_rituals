const STORAGE_KEY = 'lover_auth';

export function getPasswordHash(password: string): string {
  return Array.from(new TextEncoder().encode(password))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
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
