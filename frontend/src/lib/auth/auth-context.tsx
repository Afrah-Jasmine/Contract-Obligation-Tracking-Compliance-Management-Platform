import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  clearAccessToken,
  readAccessToken,
  setUnauthorizedHandler,
  storeAccessToken,
} from "@/lib/api/client";
import { loginRequest } from "./auth-api";

type AuthUser = { email: string; id?: number; role?: string };

type AuthContextValue = {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  signIn: (input: { email: string; password: string; rememberMe: boolean }) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const USER_KEY = "contractiq_user_email";

function userFromToken(token: string): AuthUser | null {
  try {
    const payload = JSON.parse(
      atob(token.split(".")[1]!.replace(/-/g, "+").replace(/_/g, "/")),
    ) as {
      sub?: string;
      user_id?: number;
      role?: string;
      exp?: number;
    };
    if (!payload.sub || (payload.exp && payload.exp * 1000 <= Date.now())) return null;
    return {
      email: payload.sub,
      ...(payload.user_id !== undefined ? { id: payload.user_id } : {}),
      ...(payload.role !== undefined ? { role: payload.role } : {}),
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const existing = readAccessToken();
    if (existing) {
      const restoredUser = userFromToken(existing);
      if (!restoredUser) {
        clearAccessToken();
      } else {
        setToken(existing);
        setUser(restoredUser);
      }
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearAccessToken();
      sessionStorage.removeItem(USER_KEY);
      localStorage.removeItem(USER_KEY);
      setToken(null);
      setUser(null);
      window.location.assign("/login?expired=1");
    });
    return () => setUnauthorizedHandler(() => undefined);
  }, []);

  const signOut = useCallback(() => {
    clearAccessToken();
    sessionStorage.removeItem(USER_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const signIn = useCallback(
    async ({
      email,
      password,
      rememberMe,
    }: {
      email: string;
      password: string;
      rememberMe: boolean;
    }) => {
      const result = await loginRequest({ email, password });
      storeAccessToken(result.access_token, rememberMe);
      (rememberMe ? localStorage : sessionStorage).setItem(USER_KEY, email);
      setToken(result.access_token);
      setUser(userFromToken(result.access_token) ?? { email });
    },
    [],
  );

  const value = useMemo<AuthContextValue>(
    () => ({ token, user, isAuthenticated: Boolean(token), isHydrated, signIn, signOut }),
    [token, user, isHydrated, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
