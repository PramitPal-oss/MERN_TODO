import { Schema, model, type InferSchemaType } from "mongoose";

const commentSchema = new Schema({
  content: { type: String, required: true, trim: true, minlength: 1, maxlength: 2000 },
  post: { type: Schema.Types.ObjectId, ref: "Post", required: true, immutable: true },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true, immutable: true }
}, { timestamps: true, strict: "throw" });

commentSchema.index({ post: 1, createdAt: 1, _id: 1 });
commentSchema.index({ author: 1 });
commentSchema.index({ createdAt: -1, _id: -1 });
export type CommentDocument = InferSchemaType<typeof commentSchema> & { _id: import("mongoose").Types.ObjectId; createdAt: Date; updatedAt: Date };
export const Comment = model("Comment", commentSchema);
