import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import receiptRoutes from './routes/receiptRoutes';
import swaggerDocument from './docs/swagger.json';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api/receipts', receiptRoutes);
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log('Swagger UI available at http://localhost:%d/api-docs', PORT);
    console.log(`Server: http://localhost:${PORT}`);
  });
}

export default app;
