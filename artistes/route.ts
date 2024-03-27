import { Router } from "express";
import { validatorArtiste, validatorArtisteUpdate } from "./models";
import { User } from "../users/model";
import {keyToken} from "../utils/jwt";
import bcrypt from "bcrypt";
import jwt from "jwt-express";

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

routerArtistes.patch("/artistes", jwt.active(),async (req, res) => {
  const { error,value } = validatorArtisteUpdate.validate(req.body);

  if (error) {
    res.status(400).json({ message: error.message });
    return;
  }

  const idArtiste = req.jwt.payload.userId

  if(!idArtiste){
    return res.status(403).json({message:"You aren't connected"})
  }

  const artiste = await User.findOne({_id:idArtiste}).select('-password -salt -__v')

  if(!artiste){
    return res.status(500).json({message:"Something went wrong"})
  }

  User.findOneAndUpdate({email:artiste.email},value).select('-password -salt -__v').then(artiste => {
    if (artiste) {
      return res.status(200).json({ message: "Artiste updated"});
    } else {
      return res.status(500).json({ message: "Something unexpected happend" });
    }
  })
})
