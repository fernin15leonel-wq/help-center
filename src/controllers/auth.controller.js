const db = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const JWT_SECRET =
    process.env.JWT_SECRET || 'tu_clave_secreta';

// ==========================================
// USUARIOS DE PRUEBA
// ==========================================

const BYPASS_USERS = {

    'test@office.com': {
        id: 1,
        nombre: 'Tester',
        rol: 'tecnico'
    },

    'admin@office.com': {
        id: 2,
        nombre: 'Administrador Office',
        rol: 'admin'
    },

    'soporte@office.com': {
        id: 3,
        nombre: 'Soporte Office',
        rol: 'admin'
    },

    'tecnico@office.com': {
        id: 4,
        nombre: 'Carlos Técnico',
        rol: 'tecnico'
    },

    'usuario@office.com': {
        id: 5,
        nombre: 'Juan Usuario',
        rol: 'usuario'
    }
};

// ==========================================
// LOGIN
// ==========================================

const login = (req, res) => {

    const email = (req.body.email || '')
        .trim()
        .toLowerCase();

    const password = (req.body.password || '')
        .trim();

    if (!email || !password) {

        return res.status(400).json({
            success: false,
            message: 'Correo y contraseña son requeridos'
        });
    }

    // ======================================
    // BYPASS USERS
    // ======================================

    if (BYPASS_USERS[email]) {

        const u = BYPASS_USERS[email];

        const token = jwt.sign(
            {
                id: u.id,
                rol: u.rol
            },
            JWT_SECRET,
            {
                expiresIn: '8h'
            }
        );

        return res.json({
            success: true,
            message: 'Login exitoso',
            token,
            user: {
                nombre: u.nombre,
                rol: u.rol
            }
        });
    }

    // ======================================
    // LOGIN REAL
    // ======================================

    db.query(
        'SELECT * FROM users WHERE correo = ?',
        [email],
        async (err, results) => {

            if (err) {

                console.error(err);

                return res.status(500).json({
                    success: false,
                    message: 'Error en el servidor'
                });
            }

            if (results.length === 0) {

                return res.status(401).json({
                    success: false,
                    message: 'Correo no registrado'
                });
            }

            const usuario = results[0];

            try {

                let isMatch = false;

                if (
                    usuario.password.startsWith('$2')
                ) {

                    isMatch = await bcrypt.compare(
                        password,
                        usuario.password
                    );

                } else {

                    isMatch =
                        password === usuario.password;
                }

                if (!isMatch) {

                    return res.status(401).json({
                        success: false,
                        message: 'Contraseña incorrecta'
                    });
                }

                const token = jwt.sign(
                    {
                        id: usuario.id,
                        rol: usuario.rol
                    },
                    JWT_SECRET,
                    {
                        expiresIn: '8h'
                    }
                );

                return res.json({

                    success: true,

                    message: 'Login exitoso',

                    token,

                    user: {
                        nombre: usuario.nombre,
                        rol: usuario.rol
                    }
                });

            } catch (error) {

                console.error(error);

                return res.status(500).json({
                    success: false,
                    message: 'Error al verificar contraseña'
                });
            }
        }
    );
};

module.exports = {
    login
};