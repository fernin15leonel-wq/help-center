const mysql = require('mysql2');

const db = mysql.createConnection({
  host:     process.env.DB_HOST     || 'localhost',
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '12345',
  database: process.env.DB_NAME     || 'help_center_db',
});

db.connect((err) => {
  if (err) {
    console.error('❌ Error de conexión a MySQL:', err.message);
    process.exit(1); // Detiene el servidor si no hay BD — evita errores silenciosos
  }
  console.log('✅ Conectado a la base de datos MySQL (help_center_db)');
});

module.exports = db;