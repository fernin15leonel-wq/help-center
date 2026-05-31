const db = require('../config/db');

// GET /tickets/:id/comentarios
const getComentarios = (req, res) => {
  const ticket_id = req.params.id;

  const query = `
    SELECT c.id, c.comentario, c.created_at,
           COALESCE(u.nombre, 'Soporte') AS autor,
           COALESCE(u.rol, 'tecnico')    AS rol_autor
    FROM comentarios c
    LEFT JOIN users u ON c.usuario_id = u.id
    WHERE c.ticket_id = ?
    ORDER BY c.created_at ASC
  `;

  db.query(query, [ticket_id], (err, results) => {
    if (err) {
      console.error('[getComentarios] Error:', err.message);
      // Fallback sin JOIN
      db.query('SELECT * FROM comentarios WHERE ticket_id = ? ORDER BY created_at ASC', [ticket_id], (err2, results2) => {
        if (err2) return res.status(500).json({ success: false, message: 'Error al obtener comentarios' });
        const mapped = (results2 || []).map(c => ({ ...c, autor: 'Soporte', rol_autor: 'tecnico' }));
        return res.json({ success: true, data: mapped });
      });
    } else {
      return res.json({ success: true, data: results });
    }
  });
};

// POST /tickets/:id/comentario
const crearComentario = (req, res) => {
  const ticket_id  = req.params.id;
  const usuario_id = req.user?.id || null;
  const comentario = (req.body.mensaje || req.body.comentario || '').trim();

  if (!comentario) {
    return res.status(400).json({ success: false, message: 'El comentario no puede estar vacío' });
  }

  const query = 'INSERT INTO comentarios (ticket_id, usuario_id, comentario) VALUES (?, ?, ?)';

  db.query(query, [ticket_id, usuario_id, comentario], (err, result) => {
    if (err) {
      console.error('[crearComentario] Error:', err.code, err.message);
      if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.errno === 1452) {
        db.query(query, [ticket_id, null, comentario], (err2, result2) => {
          if (err2) return res.status(500).json({ success: false, message: 'Error al guardar: ' + err2.message });
          return res.status(201).json({ success: true, message: 'Comentario guardado', data: { id: result2.insertId } });
        });
      } else {
        return res.status(500).json({ success: false, message: 'Error al guardar: ' + err.message });
      }
    } else {
      console.log('✅ Comentario guardado id:', result.insertId, 'ticket:', ticket_id);
      return res.status(201).json({ success: true, message: 'Comentario guardado', data: { id: result.insertId } });
    }
  });
};

module.exports = { getComentarios, crearComentario };