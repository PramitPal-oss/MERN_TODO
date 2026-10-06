import React, { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { commentsApi, postsApi } from "../api";
import { apiMessage } from "../api/client";
import type { Comment, Meta, Post } from "../types/api";
import { EmptyState, ErrorState, LoadingState } from "../components/States";
import { Pagination } from "../components/Pagination";
import { useAuth } from "../context/AuthContext";
import { SafeText } from "../components/SafeText";
import { PostCard } from "../components/PostCard";
import { UserAvatar } from "../components/UserAvatar";
import { ConfirmActionDialog } from "../components/ConfirmActionDialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, MessageSquare, Pencil, Trash2 } from "lucide-react";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
    new Date(value)
  );

export function BlogListPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const r = await postsApi.list(page);
      setPosts(r.data.data);
      setMeta(r.data.meta);
    } catch (e) {
      setError(apiMessage(e));
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-8">
      {/* Compact hero banner */}
      <section className="py-6 sm:py-8 border-b border-border">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
          Ideas, carefully considered
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Stories that stay with you.
        </h1>
        <p className="text-base text-muted-foreground mt-2 max-w-2xl">
          A thoughtful community for long-form writing, technical explorations, and honest conversation.
        </p>
      </section>

      {/* Main post grid or states */}
      {loading ? (
        <LoadingState label="Loading stories…" />
      ) : error ? (
        <ErrorState message={error} retry={load} />
      ) : posts.length === 0 ? (
        <EmptyState>No stories have been published yet.</EmptyState>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      <Pagination meta={meta} onPage={setPage} />
    </div>
  );
}

function CommentSection({ post }: { post: Post }) {
  const auth = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [page, setPage] = useState(1);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editId, setEditId] = useState("");
  const [editText, setEditText] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [error, setError] = useState("");

  // Delete dialog state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await commentsApi.list(post.id, page);
      setComments(r.data.data);
      setMeta(r.data.meta);
    } catch (e) {
      setError(apiMessage(e));
    }
  }, [post.id, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const create = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError("");
    try {
      await commentsApi.create(post.id, content.trim());
      setContent("");
      setPage(1);
      await load();
    } catch (e) {
      setError(apiMessage(e));
    } finally {
      setIsSubmitting(false);
    }
  };

  const save = async (id: string) => {
    if (!editText.trim() || isSavingEdit) return;
    setIsSavingEdit(true);
    try {
      await commentsApi.update(id, editText.trim());
      setEditId("");
      await load();
    } catch (e) {
      setError(apiMessage(e));
    } finally {
      setIsSavingEdit(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await commentsApi.remove(deleteId);
      setDeleteId(null);
      await load();
    } catch (e) {
      setDeleteError(apiMessage(e));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <section className="max-w-[720px] mx-auto mt-12 pt-8 border-t border-border space-y-6">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          Discussion
        </h2>
      </div>

      {error && <ErrorState message={error} />}

      {/* Comment Form or Login Notice */}
      {auth.status === "authenticated" ? (
        <Card className="border-border">
          <CardContent className="pt-6">
            <form onSubmit={create} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-comment" className="text-sm font-semibold">
                  Add to the conversation
                </Label>
                <Textarea
                  id="new-comment"
                  value={content}
                  maxLength={2000}
                  required
                  placeholder="Share your thoughts respectfully..."
                  className="min-h-[100px] resize-y"
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>
              <div className="flex justify-end">
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting || !content.trim()}
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Post comment
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="p-4 rounded-lg bg-muted/40 border border-border text-center text-sm text-muted-foreground">
          <Link
            to="/login"
            className="font-semibold text-foreground underline underline-offset-4 hover:text-primary"
          >
            Log in
          </Link>{" "}
          to join the discussion and leave a comment.
        </div>
      )}

      {/* Comment List */}
      {comments.length === 0 ? (
        <EmptyState>No comments yet. Be the first to start the conversation.</EmptyState>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => {
            const canEdit =
              auth.user?.id === comment.author.id || auth.user?.role === "ADMIN";

            return (
              <Card key={comment.id} className="border-border">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <UserAvatar name={comment.author.name} size="sm" />
                      <span className="text-sm font-semibold text-foreground">
                        {comment.author.name}
                      </span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <time
                        className="text-xs text-muted-foreground"
                        dateTime={comment.createdAt}
                      >
                        {formatDate(comment.createdAt)}
                      </time>
                    </div>

                    {canEdit && editId !== comment.id && (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => {
                            setEditId(comment.id);
                            setEditText(comment.content);
                          }}
                          aria-label="Edit comment"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => {
                            setDeleteError(null);
                            setDeleteId(comment.id);
                          }}
                          aria-label="Delete comment"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {editId === comment.id ? (
                    <div className="space-y-3 pt-2">
                      <Textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="min-h-[90px] resize-y"
                        maxLength={2000}
                        required
                      />
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isSavingEdit}
                          onClick={() => setEditId("")}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          disabled={isSavingEdit || !editText.trim()}
                          onClick={() => void save(comment.id)}
                        >
                          {isSavingEdit && (
                            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                          )}
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                      {comment.content}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Pagination meta={meta} onPage={setPage} />

      {/* Delete Comment Confirmation Dialog */}
      <ConfirmActionDialog
        open={Boolean(deleteId)}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete comment?"
        description="This permanently removes the comment. This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        isLoading={isDeleting}
        error={deleteError}
        onConfirm={confirmDelete}
      />
    </section>
  );
}

export function PostDetailsPage() {
  const { slug = "" } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void postsApi
      .getBySlug(slug)
      .then((r) => setPost(r.data.data))
      .catch((e) => setError(apiMessage(e)))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <LoadingState label="Loading story…" />;
  if (error || !post) return <ErrorState message={error || "Post not found"} />;

  return (
    <div className="space-y-8">
      <article className="max-w-[720px] mx-auto space-y-6">
        {/* Author / Metadata */}
        <div className="flex items-center gap-3">
          <UserAvatar name={post.author.name} size="md" />
          <div>
            <p className="text-sm font-semibold text-foreground">
              {post.author.name}
            </p>
            <p className="text-xs text-muted-foreground">
              Published on {formatDate(post.createdAt)}
            </p>
          </div>
        </div>

        {/* Story Title */}
        <h1 className="text-3xl sm:text-4xl md:text-[42px] font-extrabold tracking-tight text-foreground leading-tight">
          {post.title}
        </h1>

        <Separator className="my-6" />

        {/* Story Content with Serif Reading Typography */}
        <div className="font-serif text-lg leading-relaxed text-foreground whitespace-pre-wrap selection:bg-muted">
          <SafeText>{post.content || ""}</SafeText>
        </div>
      </article>

      <CommentSection post={post} />
    </div>
  );
}
