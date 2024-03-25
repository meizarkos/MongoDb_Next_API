import { IToDo, Todo } from "./model";

export async function getAll() {
  return await Todo.find();
}

export async function getOneById(id: string) {
  return await Todo.findById(id);
}

export async function createOne(attributes: IToDo) {
  return await new Todo(attributes).save();
}
 
