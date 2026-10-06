import { Post } from "../models/post.model.js";
import { Comment } from "../models/comment.model.js";
import { AppError } from "../utils/app-error.js";

export async function likePost(postId: string, userId: string) {
  const post = await Post.findOneAndUpdate(
    { _id: postId, deletedAt: null },
    { $addToSet: { likedBy: userId } },
    { new: true }
  ).lean();
  if (!post) throw new AppError(404, "POST_NOT_FOUND", "Post was not found");
  return { id: post._id.toString(), likeCount: post.likedBy?.length ?? 0, likedByMe: true };
}

export async function unlikePost(postId: string, userId: string) {
  const post = await Post.findOneAndUpdate(
    { _id: postId, deletedAt: null },
    { $pull: { likedBy: userId } },
    { new: true }
  ).lean();
  if (!post) throw new AppError(404, "POST_NOT_FOUND", "Post was not found");
  return { id: post._id.toString(), likeCount: post.likedBy?.length ?? 0, likedByMe: false };
}

export async function likeComment(commentId: string, userId: string) {
  const comment = await Comment.findOne({ _id: commentId, deletedAt: null }).populate("post", "deletedAt").lean();
  if (!comment || (comment.post as any)?.deletedAt) throw new AppError(404, "COMMENT_NOT_FOUND", "Comment was not found");
  
  const updated = await Comment.findByIdAndUpdate(
    commentId,
    { $addToSet: { likedBy: userId } },
    { new: true }
  ).lean();
  return { id: updated!._id.toString(), likeCount: updated!.likedBy?.length ?? 0, likedByMe: true };
}

export async function unlikeComment(commentId: string, userId: string) {
  const comment = await Comment.findOne({ _id: commentId, deletedAt: null }).populate("post", "deletedAt").lean();
  if (!comment || (comment.post as any)?.deletedAt) throw new AppError(404, "COMMENT_NOT_FOUND", "Comment was not found");
  
  const updated = await Comment.findByIdAndUpdate(
    commentId,
    { $pull: { likedBy: userId } },
    { new: true }
  ).lean();
  return { id: updated!._id.toString(), likeCount: updated!.likedBy?.length ?? 0, likedByMe: false };
}
