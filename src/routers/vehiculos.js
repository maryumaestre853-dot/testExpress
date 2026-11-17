import { Router } from 'express';
import { AirplaneController } from '../controllers/vehiculo.js';

const router = Router();

const validateId = (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_PARAM', message: "El parámetro 'id' debe ser un entero positivo" },
    });
  }
  req.params.id = id;
  next();
};

const validateCreateBody = (req, res, next) => {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_BODY', message: 'El cuerpo debe ser un objeto JSON válido' },
    });
  }

  const required = ['modelo', 'matricula', 'capacidadMaxima', 'fabricante'];
  const missing = required.filter(
    (field) => req.body[field] === undefined || req.body[field] === null || req.body[field] === ''
  );

  if (missing.length > 0) {
    return res.status(400).json({
      success: false,
      error: { code: 'MISSING_FIELDS', message: `Faltan campos obligatorios: ${missing.join(', ')}` },
    });
  }
  next();
};

router.get('/', AirplaneController.getAll);
router.get('/:id', validateId, AirplaneController.getById);
router.post('/', validateCreateBody, AirplaneController.create);
router.put('/:id', validateId, AirplaneController.update);
router.delete('/:id', validateId, AirplaneController.remove);

export default router;