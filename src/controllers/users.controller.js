const db     = require('../config/db');
const bcrypt = require('bcrypt');
const jwt    = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta';

// ─── Registro → crea usuario Y devuelve token JWT ────────────────────────────
const register = (req, res) => {
  const nombre   = (req.body.nombre   || '').trim();
  const email    = (req.body.email    || '').trim().toLowerCase();
  const password = (req.body.password || '').trim();
  const rolInput = (req.body.rol      || '').trim();

  if (!nombre || !email || !password) {
    return res.status(400).json({ success: false, message: 'Nombre, email y password son obligatorios' });
  }

  if (password.length < 8) {
    return res.status(400).json({ success: false, message: 'La contraseña debe tener al menos 8 caracteres' });
  }

  const rolFinal = ['usuario', 'tecnico', 'admin'].includes(rolInput) ? rolInput : 'usuario';

  const checkQuery = 'SELECT id FROM users WHERE TRIM(correo) = ?';

  db.query(checkQuery, [email], (err, results) => {
    if (err) {
      console.error('[register] Error BD:', err);
      return res.status(500).json({ success: false, message: 'Error en el servidor' });
    }

    if (results.length > 0) {
      return res.status(409).json({ success: false, message: 'Ya existe una cuenta con ese correo' });
    }

    bcrypt.hash(password, 10, (err, hash) => {
      if (err) {
        console.error('[register] Error bcrypt:', err);
        return res.status(500).json({ success: false, message: 'Error al encriptar contraseña' });
      }

      const insertQuery = 'INSERT INTO users (nombre, correo, password, rol) VALUES (?, ?, ?, ?)';

      db.query(insertQuery, [nombre, email, hash, rolFinal], (err, result) => {
        if (err) {
          console.error('[register] Error insert:', err);
          return res.status(500).json({ success: false, message: 'Error al crear usuario' });
        }

        const userId = result.insertId;

        // ✅ Generar token JWT igual que en login
        const token = jwt.sign(
          { id: userId, rol: rolFinal },
          JWT_SECRET,
          { expiresIn: '1h' }
        );

        // ✅ Devolver token + datos del usuario — el frontend puede iniciar sesión directo
        return res.status(201).json({
          success: true,
          message: 'Usuario creado exitosamente',
          token,
          user: {
            id:     userId,
            nombre,
            correo: email,
            rol:    rolFinal,
          },
        });
      });
    });
  });
};

// ─── Obtener todos los usuarios (solo admin) ──────────────────────────────────
const getUsers = (req, res) => {
  const query = 'SELECT id, nombre, correo, rol, created_at FROM users ORDER BY created_at DESC';

  db.query(query, (err, results) => {
    if (err) {
      console.error('[getUsers] Error BD:', err);
      return res.status(500).json({ success: false, message: 'Error al obtener usuarios' });
    }
    return res.json({ success: true, data: results });
  });
};

module.exports = { register, registerUser: register, getUsers };