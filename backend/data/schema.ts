import Joi from "joi"

export const userSchema = Joi.object({
	name: Joi.string().min(1).required(),
	
})