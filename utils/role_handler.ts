import { NextFunction, Request, Response } from "express";


export const onlyRoleHandler = (role: string[]) => (req: Request, res: Response, next: NextFunction) => {
  if(!req.jwt.payload || !req.jwt.payload.role) return res.status(403).json({ message: "You are not allowed to access this route" });

  if(req.jwt.payload.role === "admin") return next();

  if (!role.includes(req.jwt.payload.role)) {
    return res.status(403).json({ message: "You are not allowed to access this route" });
  }
  next();
};

export const roleHandler = (role: string[]) => (req: Request, res: Response, next: NextFunction) => {
  if(!req.jwt.payload) return res.status(403).json({ message: "You are not allowed to access this route" });

  if(req.jwt.payload.role === "admin") return next();

  if (!role.includes(req.jwt.payload.role)) {
    return res.status(403).json({ message: "You are not allowed to access this route" });
  }
  const id = req.params.id;
  if (id !== req.jwt.payload.id) {
    return res.status(403).json({ message: "Dont try to touch the URL" });
  }
  next();
}