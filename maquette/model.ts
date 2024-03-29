import mongoose from "mongoose";

const maquetteSchema = new mongoose.Schema({
  id_user : {type: String, required: true},
  data: {type:Buffer, required: true},
  contentType: {type:String, required: true},
  title: {type:String, required: true},
  name: {type:String, required: true},
  voteNumber: {type: Number, default: 0},
  validation : {type:Boolean,require: false},
  createdAt : {type: Date, default: Date.now},
});

export const Maquette = mongoose.model("maquettes", maquetteSchema);
