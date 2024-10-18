import { Collection } from "mongodb";
import { User } from "../models/interfaces/user"; 


export type UserId = string

export const validateLogin = async (
    name: string,
    password: string,
    collection: Collection<User>
): Promise<User | null> => {
    // Ищем пользователя в базе данных
    const matchingUser = await collection.findOne({ name });

    // Проверяем пароль
    if (matchingUser && matchingUser.password === password) {
        return matchingUser; // Возвращаем объект пользователя
    }
    
    return null; // Возвращаем null, если нет совпадений
};
