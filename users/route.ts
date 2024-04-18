import { Router, Request, Response } from "express";
import { User } from "./model";
import bcrypt from "bcrypt";

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

routerUsers.patch("/changePassword", isAdmin, async (req: Request, res: Response) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Ancien mot de passe et nouveau mot de passe sont requis." });
    }

    const user = await User.findById(req.jwt.payload.id);

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Ancien mot de passe incorrect." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.salt = salt; 
    await user.save();

    res.status(200).json({ message: "Mot de passe mis à jour avec succès." });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour du mot de passe." });
  }
});


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

routerUsers.patch("/debanArtiste/:id", isAdmin, async (req, res) => {
  try {
    const artist = await User.findById(req.params.id) as Artiste;

    if (artist) {
      artist.ban = false;
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

    if(user && user.role==="admin"){
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: "Email ou mot de passe incorrect" });
      }
    }
    if(user){
      const token = res.jwt({role: user.role, id: user._id})
      res.status(200).json({ token });
    }

    
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la connexion" });
  }
});