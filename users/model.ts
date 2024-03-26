import mongoose from "mongoose";

const utilisateursSchema = new mongoose.Schema({
  email: {type: String, required: true,unique: true},
  password: {type: String, required: true},
  salt : {type: String, required: true},
  pseudo : {type: String, required: false,unique: true},
  ban : {type: Boolean, required : false},
  role : {type: String, required: true},
  createdAt : {type: Date, default: Date.now},
});

export const User = mongoose.model("users", utilisateursSchema);