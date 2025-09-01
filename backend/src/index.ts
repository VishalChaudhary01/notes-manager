import express from 'express';
import { env } from './config/env';

const app = express();

app.get('/health', (_req, res) => {
  res.status(200).json({ message: 'Healthy Server!' });
});

const PORT = env.PORT;

app.listen(PORT, () =>
  console.log(`Server sunning at http://localhost:${PORT}`)
);
