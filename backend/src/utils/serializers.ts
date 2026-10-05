const id = (value: unknown) => String(value ?? "");
const iso = (value: unknown) => value instanceof Date ? value.toISOString() : new Date(String(value)).toISOString();

export function userDto(user: any) {
  return {
    id: id(user._id), name: user.name, email: user.email ?? null, role: user.role, isActive: user.isActive,
    providers: [user.googleId ? "google" : null, user.facebookId ? "facebook" : null].filter(Boolean),
    hasPassword: Boolean(user.passwordHash), isProtectedAdmin: Boolean(user.isProtectedAdmin),
    createdAt: iso(user.createdAt), updatedAt: iso(user.updatedAt)
  };
}

export function authorDto(author: any) {
  if (author && typeof author === "object" && author.name) return { id: id(author._id), name: author.name };
  return { id: id(author), name: "Unknown user" };
}

export function postDto(post: any, summary = false, admin = false) {
  const value: any = { id: id(post._id), title: post.title, slug: post.slug, author: authorDto(post.author), createdAt: iso(post.createdAt), updatedAt: iso(post.updatedAt) };
  if (summary) value.excerpt = Array.from(post.content).slice(0, 200).join(""); else value.content = post.content;
  if (admin) value.deletedAt = post.deletedAt ? iso(post.deletedAt) : null;
  return value;
}

export function commentDto(comment: any, admin = false) {
  const value: any = { id: id(comment._id), content: comment.content, postId: id(comment.post?._id ?? comment.post), author: authorDto(comment.author), createdAt: iso(comment.createdAt), updatedAt: iso(comment.updatedAt) };
  if (admin && comment.post && typeof comment.post === "object") value.post = { id: id(comment.post._id), title: comment.post.title, slug: comment.post.slug, deletedAt: comment.post.deletedAt ? iso(comment.post.deletedAt) : null };
  return value;
}
