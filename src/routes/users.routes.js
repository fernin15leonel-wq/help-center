const express = require('express');
const router  = express.Router();

const { registerUser, getUsers } = require('../controllers/users.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// POST /users/register — público
router.post('/register', registerUser);

// GET /users — solo admin
router.get('/', authMiddleware, roleMiddleware('admin'), getUsers);

module.exports = router;