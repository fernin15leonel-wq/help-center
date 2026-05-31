// roleMiddleware.js
// Uso: roleMiddleware('admin', 'tecnico')  — acepta uno o varios roles

const roleMiddleware = (...rolesPermitidos) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'No autenticado' });
        }

        const rolUsuario = (req.user.rol || '').toLowerCase().trim();
        const permitido  = rolesPermitidos.map(r => r.toLowerCase().trim());

        if (!permitido.includes(rolUsuario)) {
            return res.status(403).json({
                error: `Acceso denegado. Se requiere rol: ${rolesPermitidos.join(' o ')}. Tu rol: ${rolUsuario}`
            });
        }

        next();
    };
};

module.exports = roleMiddleware;