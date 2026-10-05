import type { RequestHandler } from "express";
import * as service from "../services/comments.service.js";
import { sendSuccess } from "../utils/responses.js";
const meta = (page: number, limit: number, total: number) => ({ page, limit, total, totalPages: total ? Math.ceil(total / limit) : 0 });
export const list: RequestHandler = async (req, res) => { const { page, limit } = req.validated!.query; const result = await service.listComments(req.validated!.params.postId, page, limit); sendSuccess(res, 200, "Comments retrieved", result.items, meta(page, limit, result.total)); };
export const create: RequestHandler = async (req, res) => { const value = await service.createComment(req.validated!.params.postId, req.auth!.userId, req.validated!.body.content); req.activity = { action: "COMMENT_CREATE", resourceType: "comment", resourceId: value.id }; sendSuccess(res, 201, "Comment created", value); };
export const get: RequestHandler = async (req, res) => sendSuccess(res, 200, "Comment retrieved", await service.getComment(req.validated!.params.id, req.auth?.role === "ADMIN"));
export const update: RequestHandler = async (req, res) => { const value = await service.updateComment(req.validated!.params.id, req.validated!.body.content, req.auth!.role === "ADMIN"); req.activity = { action: "COMMENT_UPDATE", resourceType: "comment", resourceId: value.id }; sendSuccess(res, 200, "Comment updated", value); };
export const remove: RequestHandler = async (req, res) => { const value = await service.deleteComment(req.validated!.params.id, req.auth!.role === "ADMIN"); req.activity = { action: "COMMENT_DELETE", resourceType: "comment", resourceId: value.id }; sendSuccess(res, 200, "Comment deleted", value); };
