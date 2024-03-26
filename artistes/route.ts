import { Router } from "express";
import { validatorArtiste, validatorArtisteUpdate } from "./models";
import { User } from "../users/model";
import bcrypt from "bcrypt";

async function pseudoNotUnique(pseudo:string){
  const user = await User.findOne({pseudo:pseudo}).select('-password -salt -__v')
  if(user){
    return true
  }
  return false
}


export const routerArtistes = Router();

routerArtistes.post("/register", async (req, res) => {
  const { error,value } = validatorArtiste.validate(req.body);

  if (error) {
    res.status(400).json({ message: error.message });
    return;
  }

  const salt = await bcrypt.genSalt(10)
  value.salt = salt
  value.password = await bcrypt.hash(value.password,salt)
  value.role = "artiste"
  value.ban = false

  if(value.pseudo !== undefined){
    const user = await pseudoNotUnique(value.pseudo)
    if(user){
      return res.status(400).json({ message: "This pseudo is already used." });
    }
  }

  await new User(value).save()

  User.findOne({email:value.email}).select('-password -salt -__v').then(artiste => {
    if (artiste) {
      const token = res.jwt({
        userId: artiste._id.toString(),
        role: artiste.role,
      });
      return res.status(200).json({ message: "Artiste created", token:token.token});
    } else {
      return res.status(500).json({ message: "Something unexpected happend" });
    }
  })
});

routerArtistes.patch("/artistes", async (req, res) => {
  const { error,value } = validatorArtisteUpdate.validate(req.body);

  if (error) {
    res.status(400).json({ message: error.message });
    return;
  }

  User.findOneAndUpdate({email:value.email},value).then(artiste => {
    if (artiste) {
      return res.status(200).json({ message: "Artiste updated"});
    } else {
      return res.status(500).json({ message: "Something unexpected happend" });
    }
  })
})
