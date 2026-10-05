import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiMessage } from "../api/client";
import { authApi } from "../api";
import { LoadingState } from "../components/States";

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });
const registerSchema = z.object({ name: z.string().trim().min(2).max(80), email: z.string().email(), password: z.string().min(10).refine(v => new TextEncoder().encode(v).length <= 72, "Password is too long") });
type Login = z.infer<typeof loginSchema>; type Register = z.infer<typeof registerSchema>;

function SocialButtons() {
  const [providers, setProviders] = useState({ google: false, facebook: false });
  useEffect(() => { void authApi.providers().then(r => setProviders(r.data.data)).catch(() => undefined); }, []);
  const base = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";
  return <div className="social"><button className="button social-button" disabled={!providers.google} onClick={() => { window.location.href = `${base}/auth/google`; }}>Continue with Google{!providers.google && " (not configured)"}</button><button className="button social-button" disabled={!providers.facebook} onClick={() => { window.location.href = `${base}/auth/facebook`; }}>Continue with Facebook{!providers.facebook && " (not configured)"}</button></div>;
}

export function LoginPage() {
  const auth = useAuth(); const navigate = useNavigate(); const location = useLocation(); const [search] = useSearchParams(); const [error, setError] = useState(search.get("oauthError") ? `Social login failed: ${search.get("oauthError")}` : "");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Login>({ resolver: zodResolver(loginSchema) });
  if (auth.status === "authenticated") return <Navigate to="/dashboard" replace />;
  const submit = handleSubmit(async values => { try { await auth.login(values); const from = (location.state as any)?.from; navigate(typeof from === "string" && from.startsWith("/") && !from.startsWith("//") ? from : "/dashboard", { replace: true }); } catch (e) { setError(apiMessage(e)); } });
  return <div className="auth-card"><p className="eyebrow">Welcome back</p><h1>Log in to Inkstone</h1>{error && <div className="alert error">{error}</div>}<form onSubmit={submit}><label>Email<input type="email" autoComplete="email" {...register("email")} /></label>{errors.email && <small className="field-error">{errors.email.message}</small>}<label>Password<input type="password" autoComplete="current-password" {...register("password")} /></label>{errors.password && <small className="field-error">{errors.password.message}</small>}<button className="button primary" disabled={isSubmitting}>{isSubmitting ? "Logging in…" : "Log in"}</button></form><div className="divider">or</div><SocialButtons /><p>New here? <Link to="/register">Create an account</Link></p></div>;
}

export function RegisterPage() {
  const auth = useAuth(); const navigate = useNavigate(); const [error, setError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Register>({ resolver: zodResolver(registerSchema) });
  if (auth.status === "authenticated") return <Navigate to="/dashboard" replace />;
  const submit = handleSubmit(async values => { try { await auth.register(values); navigate("/dashboard", { replace: true }); } catch (e) { setError(apiMessage(e)); } });
  return <div className="auth-card"><p className="eyebrow">Start writing</p><h1>Create your account</h1>{error && <div className="alert error">{error}</div>}<form onSubmit={submit}><label>Name<input autoComplete="name" {...register("name")} /></label>{errors.name && <small className="field-error">{errors.name.message}</small>}<label>Email<input type="email" autoComplete="email" {...register("email")} /></label>{errors.email && <small className="field-error">{errors.email.message}</small>}<label>Password<input type="password" autoComplete="new-password" {...register("password")} /></label>{errors.password && <small className="field-error">{errors.password.message}</small>}<button className="button primary" disabled={isSubmitting}>{isSubmitting ? "Creating…" : "Create account"}</button></form><p>Already have an account? <Link to="/login">Log in</Link></p></div>;
}

export function OAuthCallbackPage() { const auth = useAuth(); const navigate = useNavigate(); useEffect(() => { void auth.refreshSession().then(() => navigate("/dashboard", { replace: true })).catch(() => navigate("/login?oauthError=OAUTH_FAILED", { replace: true })); }, [auth.refreshSession, navigate]); return <LoadingState label="Completing social login…" />; }
