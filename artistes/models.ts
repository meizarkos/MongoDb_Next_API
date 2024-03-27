import joi from "joi";

export const validatorArtiste = joi.object({
  email: joi.string().email().max(128).min(3).required().description("L'email est obligatoire"),
  password: joi.string().required().description("Le mot de passe est obligatoire"),
  pseudo: joi.string().min(3).max(128).optional().description("Le pseudo est trop long"),
});

export const validatorArtisteUpdate = joi.object({
  email: joi.string().email().max(128).min(3).optional().description("L'email est trop long"),
  pseudo: joi.string().min(3).max(128).optional().description("Le pseudo est trop long"),
});