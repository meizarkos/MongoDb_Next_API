import mongoose from "mongoose";

const utilisateursSchema = new mongoose.Schema({
  email: {type: String, required: true,unique: true},
  password: {type: String, required: true},
  salt : {type: String, required: true},
  pseudo : {type: String, required: false},
  ban : {type: Boolean, required : false},
  role : {type: String, required: true},
  createdAt : {type: Date, default: Date.now},
})

utilisateursSchema.path('pseudo').validate(async function(value) {
  if (!value) return true;
  const user = await mongoose.model("users").findOne({ pseudo: value });
  if(user){
    return false
  } 
  else{
    return true
  }
},"Pseudo already exist, try another one")

export const User = mongoose.model("users", utilisateursSchema);
