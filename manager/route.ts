import { Request,Response,NextFunction, Router } from 'express';
import { validatorApprobation } from './model';
import { Maquette } from '../maquette/model';
import { User } from '../users/model';
import { Approbations } from '../approbation/model';
import { roleHandler } from '../utils/role_handler';
import jwt from "jwt-express"
import bcrypt from "bcrypt";


export const routerManager = Router();

routerManager.get("/allMaquette",jwt.active(),(req:Request,res:Response,next:NextFunction)=>roleHandler(["manager","admin"],req,res,next), async(_req, res) => {
  const maquettes = await Maquette.find().select('-__v -data -contentType -user_id');
  const response = await Promise.all(maquettes.map(async maquette => {
    const auteur = await User.findOne({_id: maquette.id_user}).select('-password -salt -__v');
    
    const maquetteToReturn = {
      id_maquette: maquette._id,
      title: maquette.title,
      name: maquette.name,
      validation : maquette.validation,
      auteur: auteur
    }
    return maquetteToReturn;
  })
  )
  return res.status(200).json(response);
});


routerManager.get("/maquetteImage/:idMaquette", jwt.active(),(req:Request,res:Response,next:NextFunction)=>roleHandler(["admin","manager"],req,res,next),async (req, res) => {
    const maquette = await Maquette.findOne({_id:req.params.idMaquette}).select('-__v')
  
    if(!maquette){
      return res.status(404).json({message:"Maquette not found"})
    }
  
    res.setHeader('Content-Type', maquette.contentType)
  
    return res.send(maquette.data)
  })


routerManager.post("/avis/:managerId/:maquetteId",jwt.active(),(req:Request,res:Response,next:NextFunction)=>roleHandler(["admin","manager"],req,res,next),async(req,res)=>{
    const {error,value} = validatorApprobation.validate(req.body)

    if(error){
        res.status(400).json({ message: error.message });
        return;
    }

    const id_user = req.params.managerId
    const id_maquette = req.params.maquetteId

    const maquette = await Maquette.findOne({_id:id_maquette}).select("-__v -data -contentType")
    const manager = await User.findOne({_id:id_user}).select("-__v -password -salt")

    if(!maquette || !manager){
        res.status(404).json({ message: "L'URL entré est invalide, maquette ou manager introuvable"});
        return;
    }

    if(maquette.voteNumber>=5){
        if(maquette.validation){
            res.status(200).json({ message: `La maquette est déjà validé`})
            return
        }
        res.status(200).json({message:"La maquette est déjà refusé"})
        return
    }

    const alreadyGive = await Approbations.findOne({id_user:id_user,id_maquette:id_maquette})

    if(alreadyGive){
        res.status(200).json({message:"Vous avez déjà donné votre avis"})
        return
    }

    maquette.voteNumber++
    if(maquette.voteNumber==5){
        let valide = 0
        const allOpinion = await Approbations.find({id_maquette:id_maquette})
        allOpinion.map(opinion =>{
            if(opinion.flag){
                valide++
            }
        })

        if(valide>2){
            maquette.validation = true
        }
        else{
            maquette.validation = false
        }
    }

    await Maquette.updateOne({ _id: id_maquette }, { $set: { voteNumber: maquette.voteNumber,validation:maquette.validation } })  

    Maquette.findOne({_id: id_maquette}).then(maquette=>console.log(maquette))

    value.id_user = id_user
    value.id_maquette = id_maquette

    await new Approbations(value).save()
    return res.status(200).json({message:"Avis ajouté avec succès"})
})


routerManager.post("/addManager", jwt.active(), (req: Request, res: Response, next: NextFunction) => roleHandler(["admin"], req, res, next), async (req, res) => {
    try {
      const { email, pseudo } = req.body;
      if (!email || !pseudo) {
        return res.status(400).json({ message: "Email et pseudo sont requis." });
      }
  
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ message: "Un utilisateur avec cet email existe déjà." });
      }
  
      const password = "defaultPassword"; 
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      const newUser = new User({
        email,
        password: hashedPassword,
        salt, 
        role: "manager",
        pseudo,
        createdAt: new Date()
      });
  
      await newUser.save();
  
      res.status(201).json({ message: "Manager ajouté avec succès." });
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de l'ajout du manager." });
    }
  });
  
