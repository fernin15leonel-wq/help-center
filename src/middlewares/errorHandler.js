const { fail } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  console.error('ERROR:', err);

  const status = err.status || 500;
  const message = err.message || 'Error interno del servidor';

  return fail(res, message, status, err.details || null);
};

module.exports = errorHandler; 2