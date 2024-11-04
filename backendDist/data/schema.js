import Joi from "joi";
export const loginSchema = Joi.object({
    username: Joi.string().min(3).required(),
    password: Joi.string().required(),
    isGuest: Joi.boolean().default(false) // isGuest будет undefined, если не указан в запросе
});
export const messageSchema = Joi.object({
    channelId: Joi.string().required(),
    content: Joi.string().required(),
});
export const privateMessageSchema = Joi.object({
    recipientId: Joi.string().required(),
    recipientName: Joi.string().required(),
    content: Joi.string().required()
});
export const userSchema = Joi.object({
    name: Joi.string()
        .min(3)
        .max(30)
        .required(),
    password: Joi.string()
        .min(8)
        .max(100)
        .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
        .required()
});
