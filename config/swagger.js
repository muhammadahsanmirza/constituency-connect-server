const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Constituency Connect API',
      version: '1.0.0',
      description: 'API documentation for the Constituency Connect System',
    },
    servers: [
      {
        url: 'http://localhost:8080',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: [
    './routes/*.js', 
    './controller/*.js', 
    './model/*.js',
    './middlewares/*.js',
    './utils/*.js'
  ],
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };