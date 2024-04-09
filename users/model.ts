import mongoose from "mongoose";

const utilisateursSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  salt: { type: String, required: true },
  role: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  ban: { type: Boolean, default: false } 
}, { strict: false });


export const User = mongoose.model("users", utilisateursSchema);
