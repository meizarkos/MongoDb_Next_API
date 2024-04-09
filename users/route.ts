import { Router, Request, Response } from "express";
import { User } from "./model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const routerUsers = Router();

type Artiste = {
  email: string;
  role: string;
  pseudo: string;
  ban: boolean;
  createdAt: Date;
}

const isAdmin = async (req: any, res: Response, next: Function) => {
  try {
    const user = await User.findById(req.jwt.payload.id); 

    if (user && user.role === "admin") {
      next();
    } else {
      return res.status(403).json({ message: "Accès refusé" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

routerUsers.patch("/banArtiste/:id", isAdmin, async (req, res) => {
  try {
    const artist = await User.findById(req.params.id) as Artiste;

    if (artist) {
      artist.ban = true;
      await User.findByIdAndUpdate(req.params.id, artist);
      res.status(200).json({ message: "Artiste banni avec succès" });
    } else {
      res.status(404).json({ message: "Artiste non trouvé" });
    }
  } catch (error) {
    res.status(500).json({ message: "Erreur lors du bannissement de l'artiste" });
  }
});

routerUsers.delete("/user/:id", isAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Utilisateur supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la suppression de l'utilisateur" });
  }
});

routerUsers.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: '2h' });
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la connexion" });
  }
});
