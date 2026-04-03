import { Request, Response, NextFunction } from "express";

export interface PaginatedRequest extends Request {
  pagination: {
    page: number;
    limit: number;
    skip: number;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  };
}

export const paginate = (defaultLimit = 20, maxLimit = 100) => {
  return (req: PaginatedRequest, res: Response, next: NextFunction) => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(maxLimit, Math.max(1, parseInt(req.query.limit as string) || defaultLimit));
    const skip = (page - 1) * limit;
    const search = (req.query.search as string) || undefined;
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder = (req.query.sortOrder as "asc" | "desc") || "desc";

    req.pagination = { page, limit, skip, search, sortBy, sortOrder };
    next();
  };
};

export const paginateResponse = (res: Response, data: any[], total: number, page: number, limit: number) => {
  return res.json({
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  });
};
