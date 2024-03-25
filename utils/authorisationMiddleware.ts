import { NextFunction, Request, Response } from "express";

export default function authorisationMiddleware(roles: Array<string>) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.jwt.payload.role)) {
      throw new Error();
    }

    next();
  };
}
