import { NextFunction, Request, Response } from "express";

export function roleHandler(
  role: string[],
  req: Request,
  res: Response,
  next: NextFunction,
){
  if (!role.includes(req.jwt.payload.role)) {
    return res.status(403).json({ message: "You are not allowed to access this route" });
  }
  next();
}