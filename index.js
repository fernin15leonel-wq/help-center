require('dotenv').config(); // ← DEBE SER LA PRIMERA LÍNEA
const express = require('express');
const cors = require('cors');
const path = require('path');

// --- AGREGADO PARA SWAGGER ---
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./src/config/swagger');
// -----------------------------

// Importación de rutas
const authRoutes    = require('./src/routes/auth.routes');
const ticketsRoutes = require('./src/routes/tickets.routes');
const usersRoutes   = require('./src/routes/users.routes');

const app = express();

// =============================================
//  CORS — Permite localhost Y red local WiFi
// =============================================
app.use(cors({
    origin: function(origin, callback) {
        // Sin origin = petición desde archivo local o Postman → permitir
        if (!origin) return callback(null, true);

        // Permitir localhost en cualquier puerto
        const esLocalhost = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

        // Permitir IPs de red local: 192.168.x.x / 10.x.x.x / 172.16-31.x.x
        const esRedLocal = /^http:\/\/(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)\d+\.\d+(:\d+)?$/.test(origin);

        if (esLocalhost || esRedLocal) {
            callback(null, true);
        } else {
            // En desarrollo permitimos todo; en producción cambia a callback(new Error('No permitido'))
            callback(null, true);
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json());

// =============================================
//  FRONTEND ESTÁTICO — sirve index.html
//  Accesible desde cualquier dispositivo en red
// =============================================
app.use(express.static(path.join(__dirname, 'src/frontend')));

// --- CONFIGURACIÓN DE SWAGGER EN ESPAÑOL ---
app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
        swaggerOptions: { language: 'es' },
        customJs: [
            'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/lang/es.js'
        ]
    })
);
// -----------------------------------------

// Registro de rutas
app.use('/auth',    authRoutes);
app.use('/tickets', ticketsRoutes);
app.use('/users',   usersRoutes);

// Ruta base — ahora redirige al frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/frontend', 'index.html'));
});

// Definición del puerto — escucha en TODAS las interfaces (no solo localhost)
const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
    console.log(`🌐 Red local: http://<TU_IP>:${PORT}  (ejecuta 'ipconfig' para ver tu IP)`);
    console.log(`🚀 Registro: http://localhost:${PORT}/users/register`);
    console.log(`📝 Swagger:  http://localhost:${PORT}/api-docs`);
});