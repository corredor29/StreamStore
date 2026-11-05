import { Request, Response, NextFunction } from "express"
import { ApiResponse } from "../utils/apiResponse"

export const ErrorMiddleware = (error: unknown, _req: Request, res: Response, _next: NextFunction) => ApiResponse.error(res, error)
