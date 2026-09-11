import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService';
import { refreshStoredTokens, setAuthFailureHandler, setTokenUpdateHandler } from '../services/api';
import { authStorage } from '../utils/authStorage';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { error: showError } = useToast();
  const [user, setUser] = useState(null);
  const [tokens, setTokens] = useState(() => authStorage.getTokens());
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = useCallback(() => {
    authStorage.clear();
    setTokens(null);
    setUser(null);
  }, []);

  useEffect(() => {
    setAuthFailureHandler(() => {
      if (authStorage.getTokens()?.accessToken) showError('Your session has expired. Please log in again.');
      clearSession();
    });
    setTokenUpdateHandler(setTokens);
    return () => {
      setAuthFailureHandler(null);
      setTokenUpdateHandler(null);
    };
  }, [clearSession, showError]);

  useEffect(() => {
    let active = true;
    async function restore() {
      if (!authStorage.getTokens()?.accessToken) {
        setIsLoading(false);
        return;
      }
      try {
        const currentUser = await authService.me();
        if (active) setUser(currentUser);
      } catch {
        clearSession();
      } finally {
        if (active) setIsLoading(false);
      }
    }
    restore();
    return () => {
      active = false;
    };
  }, [clearSession]);

  const establishSession = useCallback(async (response) => {
    authStorage.setTokens(response);
    setTokens(authStorage.getTokens());
    try {
      const currentUser = await authService.me();
      setUser(currentUser);
      return currentUser;
    } catch (error) {
      clearSession();
      throw error;
    }
  }, [clearSession]);

  const login = useCallback(
    async (credentials) => establishSession(await authService.login(credentials)),
    [establishSession],
  );

  const register = useCallback(
    async (details) => establishSession(await authService.register(details)),
    [establishSession],
  );

  const googleLogin = useCallback(
    async (credential) => establishSession(await authService.googleLogin(credential)),
    [establishSession],
  );

  const logout = useCallback(async () => {
    const refreshToken = authStorage.getTokens()?.refreshToken;
    try {
      if (refreshToken) await authService.logout(refreshToken);
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const refreshAccessToken = useCallback(async () => {
    try {
      await refreshStoredTokens();
      const currentUser = await authService.me();
      setUser(currentUser);
      return currentUser;
    } catch (error) {
      clearSession();
      throw error;
    }
  }, [clearSession]);

  const value = useMemo(() => {
    return {
      user,
      accessToken: tokens?.accessToken ?? null,
      refreshToken: tokens?.refreshToken ?? null,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      googleLogin,
      register,
      logout,
      refreshAccessToken,
    };
  }, [user, tokens, isLoading, login, googleLogin, register, logout, refreshAccessToken]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
}
