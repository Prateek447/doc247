import express from 'express';
import cors from 'cors';
import { errorMiddleware } from '@packages/error-middleware';
import cookieParser from 'cookie-parser';
import router from './routes/auth.router';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import swaggerDocument from './swagger-output.json';
import morgan from 'morgan';

const port = process.env.PORT ? Number(process.env.PORT) : 6001;
const app = express();

// Add morgan logger
app.use(morgan('dev'));

app.use(express.json());
app.use(cookieParser());

// Single CORS configuration
app.use(cors({
    origin: ['http://127.0.0.1:3000', 'http://127.0.0.1:8080'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.get('/', (req, res) => {
    res.send({ 'message': 'Hello API'});
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerDocument);
});

//Define your routes here
app.use('/api', router);

app.use(errorMiddleware);

// Listen on all interfaces
const server = app.listen(port, '0.0.0.0', () => {
    console.log(`Auth service is running on http://127.0.0.1:${port}/api`);
    console.log(`Swagger UI is available at http://127.0.0.1:${port}/api-docs`);
});

server.on('error', (err) => {
    console.error('Server error:', err);
});
