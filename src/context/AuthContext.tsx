import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { setAppLanguage } from '../i18n';
import { setAuthToken, setUnauthorizedHandler } from '../services/apiClient';
import * as authApi from '../services/authApi';
import type { Session } from '../services/authApi';
import { clearSession, loadSession, saveSession, saveUser } from '../services/sessionStorage';
import type { ProfileUpdate, SignUpData, User } from '../types/account';

type AuthStatus = 'loading' | 'signedOut' | 'signedIn';

type AuthContextValue = {
  status: AuthStatus;
  user: User | null;
  register: (data: SignUpData, language: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (update: ProfileUpdate) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<User | null>(null);

  const logout = useCallback(async () => {
    setAuthToken(null);
    await clearSession();
    setUser(null);
    setStatus('signedOut');
  }, []);

  // after login or registration: remember the token and who is logged in
  const startSession = useCallback(async ({ token, user: sessionUser }: Session) => {
    setAuthToken(token);
    await saveSession(token, sessionUser);
    setUser(sessionUser);
    setStatus('signedIn');
  }, []);

  // on app start: continue the saved session, refresh the profile in the background
  useEffect(() => {
    setUnauthorizedHandler(() => void logout());

    (async () => {
      const saved = await loadSession();
      if (!saved) return setStatus('signedOut');

      setAuthToken(saved.token);
      setUser(saved.user);
      setStatus('signedIn');

      try {
        const fresh = await authApi.fetchMe();
        setUser(fresh);
        await saveUser(fresh);
      } catch {
        // offline: keep the cached profile; an invalid token already logged out (401 handler)
      }
    })();

    return () => setUnauthorizedHandler(null);
  }, [logout]);

  const register = useCallback(
    async (data: SignUpData, language: string) => {
      await startSession(await authApi.register({ ...data, language, termsAccepted: true }));
    },
    [startSession],
  );

  const login = useCallback(
    async (email: string, password: string) => {
      const session = await authApi.login(email, password);
      await startSession(session);
      // the app speaks the language saved in the account
      await setAppLanguage(session.user.language);
    },
    [startSession],
  );

  const updateProfile = useCallback(async (update: ProfileUpdate) => {
    const updated = await authApi.updateProfile(update);
    setUser(updated);
    await saveUser(updated);
  }, []);

  const value = useMemo(
    () => ({ status, user, register, login, logout, updateProfile }),
    [status, user, register, login, logout, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
