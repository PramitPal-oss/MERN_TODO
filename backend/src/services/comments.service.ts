import { Comment } from "../models/comment.model.js";
import { Post } from "../models/post.model.js";
import { AppError } from "../utils/app-error.js";
import { commentDto } from "../utils/serializers.js";
import { notifyCommentCreated } from "./notification.service.js";

async function requireActivePost(postId: string) {
  const post = await Post.exists({ _id: postId, deletedAt: null });
  if (!post) throw new AppError(404, "POST_NOT_FOUND", "Post was not found");
}

export async function listComments(postId: string, page: number, limit: number) {
  await requireActivePost(postId);
  const filter = { post: postId };
  const [items, total] = await Promise.all([
    Comment.find(filter).sort({ createdAt: 1, _id: 1 }).skip((page - 1) * limit).limit(limit).populate("author", "name").lean(),
    Comment.countDocuments(filter)
  ]);
  return { items: items.map(item => commentDto(item)), total };
}

export async function createComment(postId: string, userId: string, content: string) {
  const post = await Post.findOne({ _id: postId, deletedAt: null }).select("author title slug").lean();
  if (!post) throw new AppError(404, "POST_NOT_FOUND", "Post was not found");

  const created = await Comment.create({ post: postId, author: userId, content });
  const comment = await Comment.findById(created._id).populate("author", "name").lean();
  const dto = commentDto(comment);

  const actorName = (comment?.author as any)?.name ?? "Someone";
  try {
    await notifyCommentCreated({
      recipientId: post.author.toString(),
      actorId: userId,
      actorName,
      postTitle: post.title,
      postSlug: post.slug,
      postId: post._id.toString(),
      commentId: created._id.toString()
    });
  } catch {
    // Preserves comment success even if notification service throws unexpectedly
  }

  return dto;
}

export async function getComment(id: string, isAdmin: boolean) {
  const comment = await Comment.findById(id).populate("author", "name").populate("post", "title slug deletedAt").lean();
  if (!comment || (!isAdmin && (comment.post as any)?.deletedAt)) throw new AppError(404, "COMMENT_NOT_FOUND", "Comment was not found");
  return commentDto(comment, isAdmin);
}

export async function updateComment(id: string, content: string, isAdmin: boolean) {
  const existing = await Comment.findById(id).lean();
  if (!existing) throw new AppError(404, "COMMENT_NOT_FOUND", "Comment was not found");
  if (!isAdmin) await requireActivePost(existing.post.toString());
  const comment = await Comment.findByIdAndUpdate(id, { $set: { content } }, { new: true, runValidators: true }).populate("author", "name").lean();
  return commentDto(comment);
}

export async function deleteComment(id: string, isAdmin: boolean) {
  const existing = await Comment.findById(id).lean();
  if (!existing) throw new AppError(404, "COMMENT_NOT_FOUND", "Comment was not found");
  if (!isAdmin) await requireActivePost(existing.post.toString());
  await Comment.deleteOne({ _id: id });
  return { id };
}

export async function listAdminComments(page: number, limit: number, postId?: string) {
  const filter = postId ? { post: postId } : {};
  const [items, total] = await Promise.all([
    Comment.find(filter).sort({ createdAt: -1, _id: -1 }).skip((page - 1) * limit).limit(limit).populate("author", "name").populate("post", "title slug deletedAt").lean(),
    Comment.countDocuments(filter)
  ]);
  return { items: items.map(item => commentDto(item, true)), total };
}
