/** Browser-only: last username + history for the login form (same device). */

export const LOGIN_LAST_USERNAME_KEY = "fi_login_last_username";
export const LOGIN_SAVED_USERNAMES_KEY = "fi_login_saved_usernames";
export const MAX_SAVED_USERNAMES = 16;

function safeParseList(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((x): x is string => typeof x === "string" && x.trim().length > 0)
      .map((x) => x.trim());
  } catch {
    return [];
  }
}

export function readLastUsername(): string {
  if (typeof window === "undefined") return "";
  try {
    const v = localStorage.getItem(LOGIN_LAST_USERNAME_KEY);
    return v?.trim() ?? "";
  } catch {
    return "";
  }
}

export function readSavedUsernames(): string[] {
  if (typeof window === "undefined") return [];
  return safeParseList(localStorage.getItem(LOGIN_SAVED_USERNAMES_KEY));
}

/** Call after a successful login. */
export function rememberSuccessfulLogin(username: string): void {
  const u = username.trim();
  if (!u || typeof window === "undefined") return;
  try {
    localStorage.setItem(LOGIN_LAST_USERNAME_KEY, u);
    const prev = readSavedUsernames().filter((x) => x !== u);
    const next = [u, ...prev].slice(0, MAX_SAVED_USERNAMES);
    localStorage.setItem(LOGIN_SAVED_USERNAMES_KEY, JSON.stringify(next));
  } catch {
    /* quota / private mode */
  }
}
