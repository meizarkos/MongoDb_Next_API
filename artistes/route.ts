import { Router,Request,Response, NextFunction } from "express";
import { validatorArtiste, validatorArtisteUpdate } from "./models";
import { User } from "../users/model";
import { Maquette } from "../maquette/model";
import { roleHandler } from "../utils/role_handler";
import multer from "multer";
import bcrypt from "bcrypt";
import jwt from "jwt-express";

type Artiste = {
  email: string;
  role: string;
  pseudo: string;
  ban: boolean;
  createdAt: Date;
}

const allowed = ["artiste","admin"]

export const routerArtistes = Router();

async function handleUniquePseudo(pseudo: string): Promise<boolean> {
  if(!pseudo) return true;
  const artist = await User.findOne({pseudo: pseudo}).select('-password -salt -__v');
  if(artist) return false;
  return true;
}

routerArtistes.post("/register",async (req, res) => {
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

  const uniquePseudo = await handleUniquePseudo(value.pseudo);

  if(!uniquePseudo){
    return res.status(400).json({message:"Pseudo already taken"})
  }

  await new User(value).save()

  User.findOne({email:value.email}).select('-password -salt -__v').then(artiste => {
    if (artiste) {
      const token = res.jwt({
        role: artiste.role,
        id: artiste._id
      })
      return res.status(200).json({ message: "Artiste created", token:token.token, id:artiste._id });
    } else {
      return res.status(500).json({ message: "Something unexpected happend" });
    }
  })
});

routerArtistes.patch("/artistes/:id", jwt.active(),roleHandler(allowed),async (req:Request, res:Response) => {
  const { error,value } = validatorArtisteUpdate.validate(req.body);

  if (error) {
    res.status(400).json({ message: error.message });
    return;
  }

  const idArtiste = req.params.id

  if(!idArtiste){
    return res.status(403).json({message:"You aren't connected"})
  }

  const artiste = await User.findOne({_id:idArtiste}).select('-password -salt -__v') 

  if(!artiste){
    return res.status(500).json({message:"Something went wrong"})
  }

  const uniquePseudo = await handleUniquePseudo(value.pseudo);

  if(!uniquePseudo){
    return res.status(400).json({message:"Pseudo already taken"})
  }

  User.findOneAndUpdate({email:artiste.email},value).select('-password -salt -__v').then(artiste => {
    if (artiste) {
      return res.status(200).json({ message: "Artiste updated",artiste});
    } else {
      return res.status(500).json({ message: "Something unexpected happend" });
    }
  })
  .catch(err => {
    return res.status(500).json({ message: err.message});
  })
})



const upload = multer({ storage: multer.memoryStorage()})

routerArtistes.post("/maquette/:id", jwt.active(),roleHandler(["artiste"]),upload.single('image'),async (req:Request, res:Response) => {
  const idArtiste = req.params.id
  const title = req.body.title

  if(!title){
    return res.status(400).json({message:"No title provided"})
  }

  if(!idArtiste){
    return res.status(403).json({message:"You aren't connected"})
  }

  if(!req.file){
    return res.status(400).json({message:"No file uploaded"})
  }

  const artiste:Artiste = await User.findOne({_id:idArtiste}).select('-password -salt -__v')
  if(!artiste){
    return res.status(500).json({message:"Something went wrong"})
  }
  
  if(artiste.ban){
    return res.status(403).json({message:"You are banned"})
  }

  const maquette = new Maquette({
    id_user:idArtiste,
    data:req.file.buffer,
    contentType:req.file.mimetype,
    title:title,
    name:req.file.originalname
  })

  await maquette.save()

  return res.status(200).json({message:"Maquette uploaded"})
})

routerArtistes.get("/maquette/:id", jwt.active(),roleHandler(allowed),async (req:Request, res:Response) => {
  const idArtiste = req.params.id

  if(!idArtiste){
    return res.status(403).json({message:"You aren't connected"})
  }

  const maquettes = await Maquette.find({id_user:idArtiste}).select('-__v -data')

  if(!maquettes){
    return res.status(404).json({message:"No maquette found"})
  }

  return res.status(200).json(maquettes)
})

routerArtistes.get("/maquetteImage/:id/:idMaquette", jwt.active(),roleHandler(allowed),async (req, res) => {
  const maquette = await Maquette.findOne({_id:req.params.idMaquette,id_user:req.params.id}).select('-__v')

  if(!maquette){
    return res.status(404).json({message:"Maquette not found"})
  }

  res.setHeader('Content-Type', maquette.contentType)

  return res.send(maquette.data)
})
