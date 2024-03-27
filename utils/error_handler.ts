import { NextFunction, Request, Response } from "express";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!err) {
    next();
  }

  console.log(err.message)

  switch (err.name) {
    case "ValidationError":
      res.status(400).json({ message: err.message });
      break;
    case "JWTExpressError":
      res.status(401).json({ message: "You are not authenticated." });
      break;
    case "MongoServerError":
      if(err.message.includes("email")){
        res.status(400).json({ message: "This email is already used." });
      }
      else if(err.message.includes("pseudo")){
        res.status(400).json({ message: "This pseudo is already used." });
      }
      else{
        res.status(500).json({ message: "Something went wrong." });
      }
      break;
      
    default:
      res.status(500).json({ message: "Something went wrong." });
  }
}
