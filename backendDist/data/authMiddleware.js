import jwt from 'jsonwebtoken';
export const authenticate = (req, _res, next) => {
    const token = req.headers.authorization;
    if (token && process.env.SECRET) {
        try {
            const verifiedUser = jwt.verify(token, process.env.SECRET);
            console.log('Verified User:', verifiedUser);
            req.user = verifiedUser;
        }
        catch (error) {
            console.log('Invalid token:', error);
        }
    }
    next();
};
