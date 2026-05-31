const express = require('express');
const router  = express.Router();

// Controladores de tickets
const ticketsCtrl = require('../controllers/tickets.controller');
const comentariosCtrl = require('../controllers/comentarios.controller');

// Middlewares
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// ── TICKETS ────────────────────────────────────────────
router.get('/',
    authMiddleware,
    roleMiddleware('admin', 'tecnico', 'usuario'),
    ticketsCtrl.getTickets
);

router.post('/',
    authMiddleware,
    ticketsCtrl.createTicket
);

router.delete('/:id',
    authMiddleware,
    roleMiddleware('admin', 'tecnico'),
    ticketsCtrl.deleteTicket
);

router.put('/:id/asignar',
    authMiddleware,
    roleMiddleware('admin'),
    ticketsCtrl.asignarTecnico
);

router.put('/:id/estado',
    authMiddleware,
    roleMiddleware('tecnico', 'admin'),
    ticketsCtrl.cambiarEstado
);

// ── COMENTARIOS ────────────────────────────────────────
router.get('/:id/comentarios',
    authMiddleware,
    roleMiddleware('usuario', 'tecnico', 'admin'),
    comentariosCtrl.getComentarios
);

router.post('/:id/comentario',
    authMiddleware,
    roleMiddleware('tecnico', 'admin'),
    comentariosCtrl.crearComentario
);

module.exports = router;