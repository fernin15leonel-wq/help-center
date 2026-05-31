const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {

    try {

        const authHeader =
            req.headers.authorization;

        if (!authHeader) {

            return res.status(401).json({
                error: 'No hay token'
            });
        }

        const token =
            authHeader.split(' ')[1];

        if (!token) {

            return res.status(401).json({
                error: 'Token inválido'
            });
        }

        const secret =
            process.env.JWT_SECRET ||
            'tu_clave_secreta';

        const decoded = jwt.verify(
            token,
            secret
        );

        req.user = decoded;

        next();

    } catch (error) {

        console.error(error);

        return res.status(403).json({
            error: 'Token inválido o expirado'
        });
    }
};

module.exports = authMiddleware;