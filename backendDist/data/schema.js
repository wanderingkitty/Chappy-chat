import Joi from "joi";
export const loginSchema = Joi.object({
    username: Joi.string().min(3).required(),
    password: Joi.string().required(),
    isGuest: Joi.boolean().default(false) // isGuest будет undefined, если не указан в запросе
});
export const messageSchema = Joi.object({
    channelId: Joi.string().required(),
    content: Joi.string().required()
});
export const privateMessageSchema = Joi.object({
    recipientId: Joi.string().required(),
    content: Joi.string().required()
});
