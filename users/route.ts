import { Router, Request, Response } from "express";
import { User } from "./model";
import bcrypt from "bcrypt";
import JWT from "jwt-express"; 
import jwt from "jsonwebtoken";

export const routerUsers = Router();

routerUsers.use(JWT.init(process.env.JWT_SECRET!, {
  cookies: false, 
}));

const isAdmin = async (req: any, res: Response, next: Function) => {
  try {
    const user = await User.findById(req.jwt.payload.id); 

    if (user && user.role === "admin") {
      next();
    } else {
      return res.status(403).send({ message: "Accès refusé" });
    }
  } catch (error) {
    return res.status(500).send({ message: "Erreur interne du serveur" });
  }
};

routerUsers.put("/banArtiste/:id", isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).send({ message: "Utilisateur non trouvé" });
    }

    user.ban = true;
    await user.save();
    res.send({ message: "L'artiste a été banni avec succès" });
  } catch (error) {
    res.status(500).send({ message: "Erreur lors de la mise à jour de l'utilisateur" });
  }
});

routerUsers.delete("/user/:id", isAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.send({ message: "Utilisateur supprimé avec succès" });
  } catch (error) {
    res.status(500).send({ message: "Erreur lors de la suppression de l'utilisateur" });
  }
});

routerUsers.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).send({ message: "Email ou mot de passe incorrect" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: '2h' });
    res.send({ token });
  } catch (error) {
    res.status(500).send({ message: "Erreur lors de la connexion" });
  }
});
