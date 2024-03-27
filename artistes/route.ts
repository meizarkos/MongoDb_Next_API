import { Router,Request,Response, NextFunction } from "express";
import { validatorArtiste, validatorArtisteUpdate } from "./models";
import { User } from "../users/model";
import { Maquette } from "../maquette/model";
import { roleHandler } from "../utils/role_handler";
import multer from "multer";
import bcrypt from "bcrypt";
import jwt from "jwt-express";

const allowed = ["artiste"]

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
        userId: artiste._id.toString(),
        role: "a",
      })
      return res.status(200).json({ message: "Artiste created", token:token.token });
    } else {
      return res.status(500).json({ message: "Something unexpected happend" });
    }
  })
});

routerArtistes.patch("/artistes", jwt.active(),(req:Request, res:Response,next:NextFunction)=>roleHandler(allowed,req,res,next),async (req:Request, res:Response) => {
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



const upload = multer({ storage: multer.memoryStorage()})

routerArtistes.post("/maquette", jwt.active(),(req:Request, res:Response,next:NextFunction)=>roleHandler(allowed,req,res,next),upload.single('image'),async (req:Request, res:Response) => {
  const idArtiste = req.jwt.payload.userId
  
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

  const maquette = new Maquette({
    id_user:idArtiste,
    data:req.file.buffer,
    contentType:req.file.mimetype,
    title:title
  })

  await maquette.save()

  return res.status(200).json({message:"Maquette uploaded"})
})




routerArtistes.get("/maquette", jwt.active(),(req:Request, res:Response,next:NextFunction)=>roleHandler(allowed,req,res,next),async (req:Request, res:Response) => {
  const idArtiste = req.jwt.payload.userId

  if(!idArtiste){
    return res.status(403).json({message:"You aren't connected"})
  }

  const maquettes = await Maquette.find({id_user:idArtiste}).select('-__v -data')

  const typeReturn = maquettes.map(maquette => {
    return {
      id:maquette._id,
      data:maquette.contentType,
      title:maquette.title,
      createdAt:maquette.createdAt
    }
  })

  return res.status(200).json(typeReturn)
})

routerArtistes.get("/maquette/:id", jwt.active(),async (req, res) => {
  const idArtiste = req.jwt.payload.userId

  if(!idArtiste){
    return res.status(403).json({message:"You aren't connected"})
  }

  const maquette = await Maquette.findOne({_id:req.params.id,id_user:idArtiste}).select('-__v')

  if(!maquette){
    return res.status(404).json({message:"Maquette not found"})
  }

  res.setHeader('Content-Type', maquette.contentType)

  return res.send(maquette.data)
})
