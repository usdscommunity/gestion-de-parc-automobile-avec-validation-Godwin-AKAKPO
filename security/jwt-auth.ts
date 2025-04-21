const jwtAuth = require('jsonwebtoken');
import dotenv from 'dotenv';
dotenv.config(); // Pour charger les variables d'environnement

const jwtSecret = process.env.JWT_SECRET; // Utiliser la bonne variable d'environnement (respect de la casse)

export const generateToken = (userId: number) => {
    return jwtAuth.sign(
        { userId },
        jwtSecret,
        {
            expiresIn: '1h',
        }
    );
}

export const verifytoken = (token: string) => {
    return jwtAuth.verify(token, jwtSecret);
}
