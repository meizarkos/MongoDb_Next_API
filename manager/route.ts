import { Router } from 'express';
import { Maquette } from '../maquette/model';
import { User } from '../users/model';

export const routerManager = Router();

routerManager.get("/allMaquette", async(req, res) => {
  const maquettes = await Maquette.find().select('-__v -data -contentType -user_id');
  const response = await Promise.all(maquettes.map(async maquette => {
    const auteur = await User.findOne({_id: maquette.id_user}).select('-password -salt -__v');
    
    const maquetteToReturn = {
      id_maquette: maquette._id,
      title: maquette.title,
      name: maquette.name,
      auteur: auteur
    }
    return maquetteToReturn;
  })
  )
  return res.status(200).json(response);
});