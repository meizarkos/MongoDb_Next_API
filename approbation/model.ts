import mongoose from "mongoose";

const approbationSchema = new mongoose.Schema({
  id_user: {type: String, required: true},
  id_maquette: {type:String, required: true},
  flag:{type:Boolean,required:true},
  commentaire:{type:String,required:true},
  createdAt : {type: Date, default: Date.now},
});

export const Approbations = mongoose.model("approbations",approbationSchema);
