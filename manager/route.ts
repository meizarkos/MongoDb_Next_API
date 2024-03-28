import { Router } from "express"
import { User } from "../users/model"
import { Maquette } from "../maquette/model"
import { Approbations } from "../approbation/model"
import { validatorApprobation } from "./model"

export const routerManager = Router()

routerManager.post("/avis/:managerId/:maquetteId",async(req,res)=>{
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
            res.status(200).json({ message: `La maquette a été validé`})
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

    Maquette.updateOne({ _id: id_maquette }, { $set: { voteNumber: maquette.voteNumber,validation:maquette.validation } })  

    value.id_user = id_user
    value.id_maquette = id_maquette

    await new Approbations(value).save()
})