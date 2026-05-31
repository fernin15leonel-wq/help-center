const db = require('../config/db');
const { ok, fail } = require('../utils/response');

const estadosValidos    = ['abierto', 'en_proceso', 'resuelto', 'cerrado'];
const prioridadesValidas = ['baja', 'media', 'alta'];
const categoriasValidas  = ['Word', 'Excel', 'Outlook', 'Teams', 'Licenciamiento', 'Instalación', 'PowerPoint', 'OneDrive', 'OneNote', 'CellWorld', 'Office Repair', 'Cloud Sync', 'Security Center', 'Otro'];

// 1. OBTENER TICKETS — con nombre del usuario via LEFT JOIN
const getTickets = (req, res) => {
  const rol = req.user?.rol;
  const uid = req.user?.id;

  let query, params;

  if (rol === 'usuario') {
    // Usuario solo ve sus propios tickets
    query  = `SELECT t.*, u.nombre AS nombre_usuario 
              FROM tickets t 
              LEFT JOIN users u ON t.usuario_id = u.id 
              WHERE t.usuario_id = ? 
              ORDER BY t.created_at DESC`;
    params = [uid];
  } else {
    // Admin y tecnico ven todos con nombre del usuario
    query  = `SELECT t.*, u.nombre AS nombre_usuario 
              FROM tickets t 
              LEFT JOIN users u ON t.usuario_id = u.id 
              ORDER BY t.created_at DESC`;
    params = [];
  }

  db.query(query, params, (err, results) => {
    if (err) return fail(res, 'Error al consultar tickets', 500, err);
    return ok(res, results, 'Lista de tickets obtenida');
  });
};

// 2. CREAR TICKET
const createTicket = (req, res) => {
  const titulo      = (req.body.titulo || req.body.problema || '').trim();
  const descripcion = (req.body.descripcion || '').trim();
  const categoria   = (req.body.categoria || '').trim();
  const prioridad   = (req.body.prioridad  || '').trim().toLowerCase();

  console.log('📥 Datos recibidos:', { titulo, descripcion, categoria, prioridad, usuario_id: req.user?.id, rol: req.user?.rol });

  if (!titulo || !descripcion || !categoria || !prioridad) {
    return fail(res, 'Título, descripción, categoría y prioridad son obligatorios', 400);
  }
  if (titulo.length < 5)       return fail(res, 'El título debe tener al menos 5 caracteres', 400);
  if (descripcion.length < 10) return fail(res, 'La descripción debe tener al menos 10 caracteres', 400);
  if (!prioridadesValidas.includes(prioridad)) return fail(res, 'Prioridad inválida. Use: baja, media o alta', 400);
  // Sin validación estricta de categoría — acepta cualquier valor del frontend

  const usuario_id = req.user?.id || null;

  // Intentar con usuario_id primero; si falla por FK, insertar con NULL
  const query = 'INSERT INTO tickets (titulo, descripcion, estado, prioridad, aplicacion, usuario_id) VALUES (?, ?, ?, ?, ?, ?)';

  db.query(query, [titulo, descripcion, 'abierto', prioridad, categoria, usuario_id], (err, result) => {
    if (err) {
      console.error('❌ ERROR AL CREAR TICKET:', err.code, err.errno, err.message);
      // Si el error es por llave foránea, reintentar con NULL
      if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.errno === 1452) {
        console.log('🔄 Reintentando con usuario_id NULL...');
        db.query(query, [titulo, descripcion, 'abierto', prioridad, categoria, null], (err2, result2) => {
          if (err2) {
            console.error('❌ ERROR EN REINTENTO:', err2.code, err2.message);
            return fail(res, 'Error al crear ticket', 500, err2);
          }
          console.log('✅ Ticket creado con NULL usuario_id, id:', result2.insertId);
          return ok(res, { id: result2.insertId }, 'Ticket creado con éxito', 201);
        });
      } else {
        return fail(res, 'BD Error: ' + err.code + ' — ' + err.message, 500, err);
      }
    } else {
      console.log('✅ Ticket creado, id:', result.insertId);
      return ok(res, { id: result.insertId }, 'Ticket creado con éxito', 201);
    }
  });
};

// 3. ASIGNAR TÉCNICO
const asignarTecnico = (req, res) => {
  const { tecnico_id } = req.body;
  const { id } = req.params;
  if (!tecnico_id) return fail(res, 'ID del técnico es obligatorio', 400);
  db.query('UPDATE tickets SET tecnico_id = ?, estado = "en_proceso" WHERE id = ?', [tecnico_id, id], (err) => {
    if (err) return fail(res, 'Error al asignar técnico', 500, err);
    return ok(res, null, 'Ticket asignado y puesto en proceso');
  });
};

// 4. CAMBIAR ESTADO
const cambiarEstado = (req, res) => {
  const { estado } = req.body;
  const { id }     = req.params;
  if (!estadosValidos.includes(estado)) return fail(res, 'Estado inválido', 400);
  db.query('UPDATE tickets SET estado = ? WHERE id = ?', [estado, id], (err) => {
    if (err) return fail(res, 'Error al actualizar estado', 500, err);
    return ok(res, null, 'Estado actualizado correctamente');
  });
};

// 5. ELIMINAR TICKET
const deleteTicket = (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM tickets WHERE id = ?', [id], (err) => {
    if (err) return fail(res, 'Error al eliminar ticket', 500, err);
    return ok(res, null, 'Ticket eliminado con éxito');
  });
};

module.exports = { getTickets, createTicket, asignarTecnico, cambiarEstado, deleteTicket };