const AUTH_STORAGE_KEY = 'insightforge.auth';

export const authStorage = {
  getTokens() {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }
  },

  setTokens(tokens) {
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        accessToken: tokens.access_token ?? tokens.accessToken,
        refreshToken: tokens.refresh_token ?? tokens.refreshToken,
      }),
    );
  },

  clear() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  },
};
