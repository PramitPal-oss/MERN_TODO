import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { commentsApi, postsApi } from "../api";
import { apiMessage } from "../api/client";
import type { Comment, Meta, Post } from "../types/api";
import { EmptyState, ErrorState, LoadingState } from "../components/States";
import { Pagination } from "../components/Pagination";
import { useAuth } from "../context/AuthContext";
import { SafeText } from "../components/SafeText";

const date = (value: string) => new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value));
export function BlogListPage() {
  const [posts, setPosts] = useState<Post[]>([]); const [meta, setMeta] = useState<Meta | null>(null); const [page, setPage] = useState(1); const [error, setError] = useState(""); const [loading, setLoading] = useState(true);
  const load = useCallback(async () => { setLoading(true); setError(""); try { const r = await postsApi.list(page); setPosts(r.data.data); setMeta(r.data.meta); } catch (e) { setError(apiMessage(e)); } finally { setLoading(false); } }, [page]);
  useEffect(() => { void load(); }, [load]);
  return <><section className="hero"><p className="eyebrow">Ideas, carefully considered</p><h1>Stories that stay with you.</h1><p>A small community for thoughtful writing, useful lessons, and honest conversation.</p></section>{loading ? <LoadingState /> : error ? <ErrorState message={error} retry={load} /> : posts.length === 0 ? <EmptyState>No stories have been published yet.</EmptyState> : <div className="post-grid">{posts.map(post => <article className="post-card" key={post.id}><div><span className="chip">{post.author.name}</span><span className="muted"> · {date(post.createdAt)}</span></div><h2><Link to={`/posts/${post.slug}`}>{post.title}</Link></h2><p>{post.excerpt}</p><Link className="read-link" to={`/posts/${post.slug}`}>Read story →</Link></article>)}</div>}<Pagination meta={meta} onPage={setPage} /></>;
}

function CommentSection({ post }: { post: Post }) {
  const auth = useAuth(); const [comments, setComments] = useState<Comment[]>([]); const [meta, setMeta] = useState<Meta | null>(null); const [page, setPage] = useState(1); const [content, setContent] = useState(""); const [editId, setEditId] = useState(""); const [editText, setEditText] = useState(""); const [error, setError] = useState("");
  const load = useCallback(async () => { try { const r = await commentsApi.list(post.id, page); setComments(r.data.data); setMeta(r.data.meta); } catch (e) { setError(apiMessage(e)); } }, [post.id, page]);
  useEffect(() => { void load(); }, [load]);
  const create = async (event: React.FormEvent) => { event.preventDefault(); try { await commentsApi.create(post.id, content); setContent(""); setPage(1); await load(); } catch (e) { setError(apiMessage(e)); } };
  const save = async (id: string) => { try { await commentsApi.update(id, editText); setEditId(""); await load(); } catch (e) { setError(apiMessage(e)); } };
  const remove = async (id: string) => { if (!window.confirm("Delete this comment?")) return; try { await commentsApi.remove(id); await load(); } catch (e) { setError(apiMessage(e)); } };
  return <section className="comments"><h2>Conversation</h2>{error && <ErrorState message={error} />}{auth.status === "authenticated" ? <form className="comment-form" onSubmit={create}><label htmlFor="comment">Add a comment</label><textarea id="comment" value={content} maxLength={2000} required onChange={e => setContent(e.target.value)} /><button className="button primary">Post comment</button></form> : <p className="notice"><Link to="/login">Log in</Link> to join the conversation.</p>}{comments.length === 0 ? <EmptyState>No comments yet.</EmptyState> : comments.map(comment => { const canEdit = auth.user?.id === comment.author.id || auth.user?.role === "ADMIN"; return <article className="comment" key={comment.id}><div><strong>{comment.author.name}</strong><span className="muted"> · {date(comment.createdAt)}</span></div>{editId === comment.id ? <><textarea value={editText} onChange={e => setEditText(e.target.value)} /><div className="actions"><button className="button primary" onClick={() => void save(comment.id)}>Save</button><button className="button ghost" onClick={() => setEditId("")}>Cancel</button></div></> : <p className="prewrap">{comment.content}</p>}{canEdit && editId !== comment.id && <div className="actions"><button className="button ghost" onClick={() => { setEditId(comment.id); setEditText(comment.content); }}>Edit</button><button className="button danger" onClick={() => void remove(comment.id)}>Delete</button></div>}</article>; })}<Pagination meta={meta} onPage={setPage} /></section>;
}

export function PostDetailsPage() {
  const { slug = "" } = useParams(); const [post, setPost] = useState<Post | null>(null); const [error, setError] = useState(""); const [loading, setLoading] = useState(true);
  useEffect(() => { void postsApi.getBySlug(slug).then(r => setPost(r.data.data)).catch(e => setError(apiMessage(e))).finally(() => setLoading(false)); }, [slug]);
  if (loading) return <LoadingState />; if (error || !post) return <ErrorState message={error || "Post not found"} />;
  return <><article className="post-detail"><p className="eyebrow">{post.author.name} · {date(post.createdAt)}</p><h1>{post.title}</h1><SafeText className="prewrap story-content">{post.content || ""}</SafeText></article><CommentSection post={post} /></>;
}
