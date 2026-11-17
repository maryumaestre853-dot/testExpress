import { Router } from 'express';
import { PilotController } from '../controllers/piloto.js';

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

  const required = ['nombre', 'licencia', 'horasVuelo'];
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

router.get('/', PilotController.getAll);
router.get('/:id', validateId, PilotController.getById);
router.post('/', validateCreateBody, PilotController.create);
router.put('/:id', validateId, PilotController.update);
router.delete('/:id', validateId, PilotController.remove);

export default router;