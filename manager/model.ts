import joi from "joi"

export const validatorApprobation = joi.object({
  flag: joi.boolean().required().description("Votre avis est obligatoire"),
  commentaire: joi.string().min(25).required().description("Laissez un commentaire"),
});
