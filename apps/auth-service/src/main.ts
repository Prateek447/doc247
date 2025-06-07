import express from 'express';
import cors from 'cors';
import { errorMiddleware } from '@packages/error-middleware';
import cookieParser from 'cookie-parser';
import router from './routes/auth.router';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import swaggerDocument from './swagger-output.json';
import morgan from 'morgan';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 6001;

const app = express();

// Add morgan logger
app.use(morgan('dev'));

app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin: ['http://localhost:3000'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }
));

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

app.use(errorMiddleware)

const server = app.listen(port, () => {
    console.log(`Auth service is running on http://localhost:${port}/api`);
    console.log(`Swagger UI is available at http://localhost:${port}/api-docs`);
});

server.on('error', (err) => {
    console.error('Server error:', err);
});
