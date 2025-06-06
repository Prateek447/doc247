import express from 'express';
import cors from 'cors';
import { errorMiddleware } from '@packages/error-middleware';
import cookieParser from 'cookie-parser';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 6001;

const app = express();

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


app.use(errorMiddleware)

const server =  app.listen(port, host, () => {
    console.log(`[ ready ] http://${host}:${port}/api`);
});


server.on('error', (err) => {
    console.error('Server error:', err);
});
