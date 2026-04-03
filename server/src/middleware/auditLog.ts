import { Request, Response, NextFunction } from "express";
import prisma from "../prisma";
import { AuthRequest } from "./auth";

export const auditLog = (entityType: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res);

    res.json = function (body: any) {
      try {
        const action = getActionFromMethod(req.method, req.originalUrl);
        const entityId = extractEntityId(req.originalUrl);

        prisma.auditLog.create({
          data: {
            businessId: Number(req.user?.businessId) || 0,
            userId: Number(req.user?.id) || 0,
            action,
            entityType,
            entityId: entityId ? Number(entityId) : null,
            details: JSON.stringify({
              method: req.method,
              path: req.originalUrl,
              body: sanitizeBody(req.body),
              statusCode: res.statusCode,
            }),
            ipAddress: req.ip || req.socket.remoteAddress,
            userAgent: req.headers["user-agent"],
          },
        }).catch(() => {});
      } catch {}

      return originalJson(body);
    };

    next();
  };
};

const getActionFromMethod = (method: string, url: string): string => {
  switch (method) {
    case "POST": return "CREATE";
    case "PUT":
    case "PATCH": return "UPDATE";
    case "DELETE": return "DELETE";
    case "GET": return "READ";
    default: return "UNKNOWN";
  }
};

const extractEntityId = (url: string): string | null => {
  const parts = url.split("/");
  const id = parts[parts.length - 1];
  return /^\d+$/.test(id) ? id : null;
};

const sanitizeBody = (body: any): any => {
  if (!body) return null;
  const sanitized = { ...body };
  delete sanitized.password;
  delete sanitized.token;
  return sanitized;
};
