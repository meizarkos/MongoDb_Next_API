import { Request,Response,NextFunction,Router } from "express"
import jwt from "jwt-express"
import { Maquette } from "./model"
import { Approbations } from "../approbation/model"
import { User } from "../users/model"
import { roleHandler } from "../utils/role_handler"


export const routerMaquette  = Router()

routerMaquette.get("/allMaquette/:id",jwt.active(),(req:Request,res:Response,next:NextFunction)=>roleHandler(["admin","manager"],req,res,next),async(req,res)=>{
    const id_maquette = req.params.id_maquette

    const maquette = await Maquette.findOne({_id:id_maquette}).select("-__v -data -contentType")

    if(!maquette){
        return res.status(404).json({message:"L'id spécifié n'existe pas"})
    }

    const approbations = await Approbations.find({id_maquette:id_maquette})
    const auteurs = await User.findOne({_id:maquette.id_user}).select("-__v -password -salt")

    res.status(200).json({maquette,approbations,auteurs})
})