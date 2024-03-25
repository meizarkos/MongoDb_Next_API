import { Router } from "express";
import { createOne, getAll, getOneById } from "./repository";

const controller = Router();

controller.get("/", (req, res) => {
  getAll().then((todos) => {
    res.json(todos);
  });
});

controller.get("/:id", (req, res) => {
  getOneById(req.params.id).then((todo) => {
    res.json(todo);
  });
});

controller.post("/", (req, res) => {
  createOne(req.body).then((_) => {
    res.status(201).send({add:"added"});
  });
});
/*
controller.patch("/:id", (req, res) => {
  const todo = todoRepository.get(Number.parseInt(req.params.id));

  if (!todo) {
    res.status(404);
    res.json({ message: "Todo does not exist" });
    return;
  }

  const { error, value } = updateToDoSchema.validate(req.body);

  if (error) {
    res.status(400);
    res.json({ message: error.message });
    return;
  }

  res.json(todoRepository.put(Number.parseInt(req.params.id), value));
});

controller.delete("/:id", (req, res) => {
  const todo = todoRepository.get(Number.parseInt(req.params.id));
  if (!todo) {
    res.status(404);
    res.json({ message: "Todo does not exist" });
    return;
  }

  todoRepository.delete(Number.parseInt(req.params.id));
  res.status(201).send();
});
*/
export default controller;
