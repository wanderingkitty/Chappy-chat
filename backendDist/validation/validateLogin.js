export async function validateLogin(username, password, collection) {
    const user = await collection.findOne({ name: username });
    if (user && user.password === password) { // В реальном приложении используйте безопасное сравнение паролей
        if (user.isGuest) {
            // Обновляем статус гостя на зарегистрированного пользователя
            await collection.updateOne({ _id: user._id }, { $set: { isGuest: false } });
            user.isGuest = false;
        }
        return user;
    }
    return null;
}
