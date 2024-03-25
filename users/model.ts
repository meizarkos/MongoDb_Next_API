import joi from "joi";

export interface IUser {
  id?: number;
  username: string;
  password: string;
  role: "user" | "admin" | "staff";
}

export const UserSchema = joi.object({
  username: joi.string().alphanum().min(3).required(),
  password: joi.string().min(5).required(),
  role: joi.string().regex(/user|admin|staff/).required(),
});

export const UpdateUserSchema = joi.object({
  password: joi.string().min(5).required(),
});
