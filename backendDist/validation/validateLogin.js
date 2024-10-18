export const validateLogin = async (name, password, collection) => {
    // Ищем пользователя в базе данных
    const matchingUser = await collection.findOne({ name });
    // Проверяем пароль
    if (matchingUser && matchingUser.password === password) {
        return matchingUser; // Возвращаем объект пользователя
    }
    return null; // Возвращаем null, если нет совпадений
};
