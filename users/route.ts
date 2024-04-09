import { Router, Request, Response } from "express";
import { User } from "./model";
import bcrypt from "bcrypt";
import JWT from "jwt-express"; 
import jwt from "jsonwebtoken";

export const routerUsers = Router();

type Artiste = {
  email: string;
  role: string;
  pseudo: string;
  ban: boolean;
  createdAt: Date;
}

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

routerUsers.patch("/banArtiste/:id", isAdmin, async (req, res) => {
  try {
    const artist = await User.findById(req.params.id) as Artiste;

    if (artist) {
      artist.ban = false;
      await User.findByIdAndUpdate(req.params.id, artist);
      res.send({ message: "Artiste banni avec succès" });
    } else {
      res.status(404).send({ message: "Artiste non trouvé" });
    }
  } catch (error) {
    res.status(500).send({ message: "Erreur lors du bannissement de l'artiste" });
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
