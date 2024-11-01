export async function validateLogin(username, password, collection) {
    const user = await collection.findOne({ name: username });
    if (user && user.password === password) {
        if (user.isGuest) {
            await collection.updateOne({ _id: user._id }, { $set: { isGuest: false } });
            user.isGuest = false;
        }
        return user;
    }
    return null;
}
