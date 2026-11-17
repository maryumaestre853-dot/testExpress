import express from 'express';
import pilotoRoutes from './routers/piloto.js';
import vehiculosRoutes from './routers/vehiculos.js';
import asignacionRoutes from './routers/asignacion.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.use(express.json({ limit: '100kb' }));
app.use((req, res, next) => {
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${durationMs.toFixed(2)} ms)`
    );
  });
  next();
});

app.use('/api/pilotos', pilotoRoutes);
app.use('/api/vehiculos', vehiculosRoutes);
app.use('/api/asignacion', asignacionRoutes);


app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ENDPOINT_NOT_FOUND',
      message: `El recurso ${req.method} ${req.originalUrl} no existe `,
    },
  });
});

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MALFORMED_JSON',
        message: 'El Json es invalido',
      },
    });
  }

  const statusCode = err.statusCode || 500;
  const isOperational = Boolean(err.isOperational);

  if (!isOperational) {
    console.error('[CRITICAL_ERROR]:', err);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: isOperational ? err.message : 'Error',
    },
  });
});

app.listen(PORT, () => {
  console.log(`Ejecutandose en  http://localhost:${PORT}`);
});