import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type PropsWithChildren } from "react";
import { authApi } from "../api";
import { apiMessage, refreshAccess, setAccessToken, setAuthFailureHandler } from "../api/client";
import type { User } from "../types/api";

type Status = "initializing" | "authenticated" | "anonymous" | "error";
interface AuthValue {
  status: Status; user: User | null; error: string | null;
  login(input: { email: string; password: string }): Promise<void>;
  register(input: { name: string; email: string; password: string }): Promise<void>;
  logout(): Promise<void>; refreshSession(): Promise<void>;
}
const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<Status>("initializing");
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const authGenerationRef = useRef(0);

  const accept = useCallback((payload: { user: User; accessToken: string }) => {
    setAccessToken(payload.accessToken);
    setUser(payload.user);
    setStatus("authenticated");
    setError(null);
  }, []);

  const clear = useCallback(() => {
    authGenerationRef.current++;
    setAccessToken(null);
    setUser(null);
    setStatus("anonymous");
    setError(null);
  }, []);

  const refreshSession = useCallback(async () => {
    const currentGen = authGenerationRef.current;
    try {
      const payload = await refreshAccess();
      if (authGenerationRef.current === currentGen) {
        accept(payload);
      }
    } catch (caught: any) {
      if (authGenerationRef.current === currentGen) {
        if (caught?.response?.status === 401) clear();
        else { setStatus("error"); setError(apiMessage(caught)); }
      }
      throw caught;
    }
  }, [accept, clear]);

  useEffect(() => { setAuthFailureHandler(clear); void refreshSession().catch(() => undefined); }, [clear, refreshSession]);
  useEffect(() => {
    const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("mern-blog-auth") : null;
    if (channel) channel.onmessage = event => { if (event.data === "logout") clear(); };
    return () => channel?.close();
  }, [clear]);

  const login = async (input: { email: string; password: string }) => {
    const nextGen = ++authGenerationRef.current;
    const response = await authApi.login(input);
    if (authGenerationRef.current === nextGen) {
      accept(response.data.data);
    }
  };

  const register = async (input: { name: string; email: string; password: string }) => {
    const nextGen = ++authGenerationRef.current;
    const response = await authApi.register(input);
    if (authGenerationRef.current === nextGen) {
      accept(response.data.data);
    }
  };

  const logout = async () => {
    authGenerationRef.current++;
    try {
      await authApi.logout();
    } finally {
      clear();
      if (typeof BroadcastChannel !== "undefined") {
        const channel = new BroadcastChannel("mern-blog-auth");
        channel.postMessage("logout");
        channel.close();
      }
    }
  };

  const value = useMemo(() => ({ status, user, error, login, register, logout, refreshSession }), [status, user, error, refreshSession]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() { const value = useContext(AuthContext); if (!value) throw new Error("useAuth must be used inside AuthProvider"); return value; }
