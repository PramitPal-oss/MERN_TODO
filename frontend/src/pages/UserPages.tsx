import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { authApi, postsApi } from "../api";
import { apiMessage } from "../api/client";
import type { Meta, Post } from "../types/api";
import { useAuth } from "../context/AuthContext";
import { EmptyState, ErrorState, LoadingState } from "../components/States";
import { Pagination } from "../components/Pagination";

const schema = z.object({ title: z.string().trim().min(3).max(160), content: z.string().trim().min(1).max(50000) });
type Input = z.infer<typeof schema>;
export function PostEditorPage() {
  const { id } = useParams(); const navigate = useNavigate(); const auth = useAuth(); const [error, setError] = useState(""); const [loading, setLoading] = useState(Boolean(id));
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Input>({ resolver: zodResolver(schema) });
  useEffect(() => { if (!id) return; void postsApi.get(id).then(r => { if (r.data.data.author.id !== auth.user?.id && auth.user?.role !== "ADMIN") { navigate("/403", { replace: true }); return; } reset({ title: r.data.data.title, content: r.data.data.content || "" }); }).catch(e => setError(apiMessage(e))).finally(() => setLoading(false)); }, [id, auth.user, navigate, reset]);
  const submit = handleSubmit(async values => { try { const post = id ? (await postsApi.update(id, values)).data.data : (await postsApi.create(values)).data.data; navigate(`/posts/${post.slug}`); } catch (e) { setError(apiMessage(e)); } });
  if (loading) return <LoadingState />;
  return <section className="editor"><p className="eyebrow">{id ? "Refine your story" : "A blank page"}</p><h1>{id ? "Edit post" : "Write a new post"}</h1>{error && <ErrorState message={error} />}<form onSubmit={submit}><label>Title<input {...register("title")} /></label>{errors.title && <small className="field-error">{errors.title.message}</small>}<label>Story<textarea className="story-editor" {...register("content")} /></label>{errors.content && <small className="field-error">{errors.content.message}</small>}<div className="actions"><button className="button primary" disabled={isSubmitting}>{isSubmitting ? "Saving…" : "Publish"}</button><button type="button" className="button ghost" onClick={() => navigate(-1)}>Cancel</button></div></form></section>;
}

export function MyPostsPage() {
  const auth = useAuth(); const [posts, setPosts] = useState<Post[]>([]); const [meta, setMeta] = useState<Meta | null>(null); const [page, setPage] = useState(1); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const load = useCallback(async () => { if (!auth.user) return; setLoading(true); try { const r = await postsApi.list(page, auth.user.id); setPosts(r.data.data); setMeta(r.data.meta); setError(""); } catch (e) { setError(apiMessage(e)); } finally { setLoading(false); } }, [auth.user, page]);
  useEffect(() => { void load(); }, [load]);
  const remove = async (id: string) => { if (!window.confirm("Soft-delete this post?")) return; try { await postsApi.remove(id); await load(); } catch (e) { setError(apiMessage(e)); } };
  return <><div className="page-heading"><div><p className="eyebrow">Your workspace</p><h1>My posts</h1></div><Link className="button primary" to="/posts/new">Write a post</Link></div>{loading ? <LoadingState /> : error ? <ErrorState message={error} retry={load} /> : posts.length === 0 ? <EmptyState>You have not published a post yet.</EmptyState> : <div className="table-wrap"><table><thead><tr><th>Title</th><th>Published</th><th>Actions</th></tr></thead><tbody>{posts.map(post => <tr key={post.id}><td><Link to={`/posts/${post.slug}`}>{post.title}</Link></td><td>{new Date(post.createdAt).toLocaleDateString()}</td><td><div className="actions"><Link className="button ghost" to={`/posts/${post.id}/edit`}>Edit</Link><button className="button danger" onClick={() => void remove(post.id)}>Delete</button></div></td></tr>)}</tbody></table></div>}<Pagination meta={meta} onPage={setPage} /></>;
}

export function AccountPage() {
  const auth = useAuth(); const [search] = useSearchParams(); const [error, setError] = useState(search.get("oauthError") || "");
  const link = async (provider: "google" | "facebook") => { try { window.location.href = (await authApi.link(provider)).data.data.authorizationUrl; } catch (e) { setError(apiMessage(e)); } };
  if (!auth.user) return null;
  return <section><p className="eyebrow">Your profile</p><h1>Account</h1>{search.get("linked") && <div className="alert success">{search.get("linked")} connected successfully.</div>}{error && <ErrorState message={error} />}<div className="profile-card"><dl><div><dt>Name</dt><dd>{auth.user.name}</dd></div><div><dt>Email</dt><dd>{auth.user.email ?? "Not provided"}</dd></div><div><dt>Role</dt><dd>{auth.user.role}</dd></div></dl><h2>Connected accounts</h2>{(["google", "facebook"] as const).map(provider => <div className="provider" key={provider}><span>{provider.charAt(0).toUpperCase() + provider.slice(1)}</span>{auth.user!.providers.includes(provider) ? <span className="chip success-chip">Connected</span> : <button className="button ghost" onClick={() => void link(provider)}>Connect</button>}</div>)}</div></section>;
}
