const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Help Desk - Soporte de Office',
      version: '1.0.0',
      description: 'Documentación de la API de Mesa de Ayuda optimizada para la gestión de incidentes en la suite corporativa de Microsoft Office.'
    },
    servers: [
      { 
        url: 'http://localhost:3000',
        description: 'Servidor Local de Desarrollo'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      // --- MODELOS DE DATOS REUTILIZABLES (SCHEMAS) ---
      schemas: {
        TicketInput: {
          type: 'object',
          required: ['titulo', 'descripcion', 'categoria', 'prioridad'],
          properties: {
            titulo: { type: 'string', example: 'Fallo con activación de licencia Outlook' },
            descripcion: { type: 'string', example: 'Muestra error de cuenta corporativa y no sincroniza la bandeja de entrada.' },
            categoria: { type: 'string', enum: ['Word', 'Excel', 'Outlook', 'Teams', 'Licenciamiento', 'Instalación', 'PowerPoint', 'OneDrive', 'OneNote', 'CellWorld', 'Office Repair', 'Cloud Sync', 'Security Center', 'Otro'], example: 'Outlook' },
            prioridad: { type: 'string', enum: ['baja', 'media', 'alta'], example: 'alta' }
          }
        },
        TicketResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'success' },
            message: { type: 'string', example: 'Ticket de Soporte de Office creado con éxito' },
            data: {
              type: 'object',
              properties: {
                id: { type: 'integer', example: 14 }
              }
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'error' },
            message: { type: 'string', example: 'Prioridad inválida. Use: baja, media o alta' }
          }
        }
      }
    },
    paths: {
      // --- ENDPOINTS DE AUTENTICACIÓN Y USUARIOS ---
      '/auth/login': {
        post: {
          summary: 'Iniciar sesión y obtener token JWT',
          tags: ['Autenticación'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', example: 'admin@office.com' },
                    password: { type: 'string', example: '123456' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Login exitoso, devuelve el token JWT' },
            401: { description: 'Credenciales incorrectas' }
          }
        }
      },
      '/users/register': {
        post: {
          summary: 'Registrar un nuevo usuario en el sistema',
          tags: ['Autenticación'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['nombre', 'email', 'password', 'rol'],
                  properties: {
                    nombre: { type: 'string', example: 'Juan Pérez' },
                    email: { type: 'string', example: 'juan@office.com' },
                    password: { type: 'string', example: 'password123' },
                    rol: { type: 'string', example: 'usuario' }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: 'Usuario registrado exitosamente' },
            400: { description: 'El email ya se encuentra registrado' }
          }
        }
      },
      // --- ENDPOINTS DE SOPORTE DE OFFICE ---
      '/tickets': {
        get: {
          summary: 'Obtener todos los tickets (Admin y Tecnico)',
          tags: ['Soporte de Office'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Lista de incidentes devuelta exitosamente' }
          }
        },
        post: {
          summary: 'Crear un nuevo ticket (Usuario y Admin)',
          tags: ['Soporte de Office'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/TicketInput' }
              }
            }
          },
          responses: {
            201: { 
              description: 'Ticket creado y registrado en la base de datos',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/TicketResponse' }
                }
              }
            },
            400: { 
              description: 'Error de validación en los datos de entrada',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' }
                }
              }
            }
          }
        }
      },
      '/tickets/{id}': {
        delete: {
          summary: 'Eliminar un ticket por ID (Solo Admin)',
          tags: ['Soporte de Office'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'integer' }
            }
          ],
          responses: {
            200: { description: 'Ticket eliminado correctamente' }
          }
        }
      },
      '/tickets/{id}/asignar': {
        put: {
          summary: 'Asignar un tecnico a un ticket (Solo Admin)',
          tags: ['Soporte de Office'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'integer' }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['tecnico_id'],
                  properties: {
                    tecnico_id: { type: 'integer', example: 3 }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Tecnico asignado exitosamente y flujo cambiado a en_proceso' }
          }
        }
      },
      '/tickets/{id}/estado': {
        put: {
          summary: 'Cambiar el estado de un ticket (Tecnico y Admin)',
          tags: ['Soporte de Office'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'integer' }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['estado'],
                  properties: {
                    estado: { type: 'string', enum: ['abierto', 'en_proceso', 'resuelto', 'cerrado'], example: 'resuelto' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Estado actualizado correctamente en el workflow' }
          }
        }
      }
    }
  },
  apis: [] 
};

module.exports = swaggerJSDoc(options);