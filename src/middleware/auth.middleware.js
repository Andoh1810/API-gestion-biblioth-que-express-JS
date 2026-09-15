import { httpCode } from "../static/httpCode.js";
import jwt from 'jsonwebtoken'

const authMiddleware = (req, res, next) => {

    try {

        const info = req.headers.authorization

        if (!info || !info.startsWith('Bearer ')) {
            return res.status(httpCode.UNAUTHORIZED).json({ message: "Token manquant ou mal écrit!" })
        }

        const accessToken = info.split(' ')[1]

        const decode = jwt.verify(accessToken, process.env.CLE_ACCESS_TOKEN)
        req.user = decode
    
        next()

    } catch (error) {
        return res.status(httpCode.UNAUTHORIZED).json({ message: "Token expiré"})
    }


}

export default authMiddleware
