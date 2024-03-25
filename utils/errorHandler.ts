import { NextFunction, Request, Response } from "express";
import { ValidationError } from "joi";
import { JWTExpressError } from "jwt-express";

export default function errorhandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!err) {
    next();
  }

  switch (err.name) {
    case "ValidationError":
      res.status(400).json({ message: err.message });
      break;
    case "JWTExpressError":
      res.status(401).json({ message: "You are not authenticated." });
      break;

    default:
      res.status(500).json({ message: "Something went wrong." });
  }
}
