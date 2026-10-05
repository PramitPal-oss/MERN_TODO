import type { RequestHandler } from "express";
import { User } from "../models/user.model.js";
import { RefreshSession } from "../models/refresh-session.model.js";
import { AppError } from "../utils/app-error.js";
import { verifyAccessToken } from "../utils/tokens.js";

export const authenticate: RequestHandler = async (req, _res, next) => {
  try {
    const header = req.get("authorization");
    if (!header?.startsWith("Bearer ")) throw new AppError(401, "UNAUTHENTICATED", "Authentication required");
    const payload = verifyAccessToken(header.slice(7));
    if (payload.type !== "access" || !payload.sub || !payload.sid) throw new Error("invalid token type");
    const [user, session] = await Promise.all([User.findById(payload.sub).lean(), RefreshSession.findById(payload.sid).lean()]);
    if (!user?.isActive || !session || session.revokedAt || session.expiresAt <= new Date() || session.user.toString() !== user._id.toString() || payload.ver !== user.authVersion || session.authVersion !== user.authVersion) {
      throw new AppError(401, "SESSION_INVALID", "Session is no longer valid");
    }
    req.auth = { userId: user._id.toString(), sessionId: session._id.toString(), role: user.role, authVersion: user.authVersion };
    next();
  } catch (error: any) {
    if (error instanceof AppError) return next(error);
    const code = error?.name === "TokenExpiredError" ? "ACCESS_TOKEN_EXPIRED" : "UNAUTHENTICATED";
    next(new AppError(401, code, code === "ACCESS_TOKEN_EXPIRED" ? "Access token expired" : "Invalid access token"));
  }
};

export const optionalAuthenticate: RequestHandler = (req, res, next) => {
  if (!req.get("authorization")) return next();
  return authenticate(req, res, next);
};
