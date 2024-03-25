
import { Router } from "express";
import userRepository from "./repository";
import { UserSchema, UpdateUserSchema } from "./model";

const controller = Router();

controller.get("/", (req, res, next) => {
  const userId = req.jwt.payload;
  console.log(userId);
  res.json(userRepository.getAll());
  next();
});

controller.get("/:id", (req, res) => {
  const user = userRepository.get(Number.parseInt(req.params.id));

  if (!user) {
    res.status(404).json({ message: "User does not exist" });
  }

  res.json(user);
});

controller.post("/", (req, res) => {
  const { error, value } = UserSchema.validate(req.body);

  if (error) {
    throw error;
  }

  res.status(201).json(userRepository.add(value));
});

controller.patch("/:id", (req, res) => {
  const user = userRepository.get(Number.parseInt(req.params.id));

  if (!user) {
    res.status(404);
    res.json({ message: "User does not exist" });
    return;
  }

  const { error, value } = UpdateUserSchema.validate(req.body);

  if (error) {
    res.status(400);
    res.json({ message: error.message });
    return;
  }

  res.json(userRepository.put(Number.parseInt(req.params.id), value));
});

controller.delete("/:id", (req, res) => {
  const user = userRepository.get(Number.parseInt(req.params.id));
  if (!user) {
    res.status(404);
    res.json({ message: "User does not exist" });
    return;
  }

  userRepository.delete(Number.parseInt(req.params.id));
  res.status(201).send();
});

export default controller;
