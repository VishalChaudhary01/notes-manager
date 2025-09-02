import express from 'express';
import { env } from './config/env';
import { errorHandler } from './middlewares/error-handler';

const app = express();
const PORT = env.PORT;

app.get('/health', (_req, res) => {
  res.status(200).json({ message: 'Healthy Server!' });
});

app.use(errorHandler);

app.listen(PORT, () =>
  console.log(`Server sunning at http://localhost:${PORT}`)
);
