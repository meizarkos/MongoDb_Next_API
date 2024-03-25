import joi from "joi";
import mongoose from "mongoose";

export interface IToDo {
  id?: string;
  name: string;
  description: string;
  done: boolean;
}

export const toDoSchema = joi.object({
  name: joi.string().max(32).min(3).required().description("Name of the todo"),
  description: joi.string().required().description("Description of the todo"),
  done: joi.boolean().required().description("Is the todo done"),
});

export const updateToDoSchema = joi
  .object({
    name: joi
      .string()
      .max(32)
      .min(3)
      .optional()
      .description("Name of the todo"),
    description: joi.string().optional().description("Description of the todo"),
    done: joi.boolean().optional().description("Is the todo done"),
  })
  .min(1);

export const TodoMongoSchema = new mongoose.Schema({
  description: String,
  done: { type: "boolean", default: false },
  name: String,
},{
  methods:{
    setDone(){this.set("done",true).save()}
  }
});

export const Todo = mongoose.model("todo", TodoMongoSchema);
