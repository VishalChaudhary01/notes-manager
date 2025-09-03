import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { env } from './config/env';
import { errorHandler } from './middlewares/error-handler';
import appRoutes from './routes';

const app = express();
const PORT = env.PORT;
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/health', (_req, res) => {
  res.status(200).json({ message: 'Healthy Server!' });
});

app.use('/api/v1', appRoutes);

app.use(errorHandler);

app.listen(PORT, () =>
  console.log(`Server sunning at http://localhost:${PORT}`)
);
