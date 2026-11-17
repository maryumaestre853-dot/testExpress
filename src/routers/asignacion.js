import { Router } from 'express';
import { AssignmentController } from '../controllers/asignacion.js';

const router = Router();

const validateAssignmentId = (req, res, next) => {
  const id = Number(req.params.idAsignacion);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_PARAM',
        message: "El parámetro 'idAsignacion' debe ser un entero positivo",
      },
    });
  }
  req.params.idAsignacion = id;
  next();
};

const validateCreateBody = (req, res, next) => {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_BODY', message: 'El cuerpo debe ser un objeto JSON válido' },
    });
  }

  const required = ['idPiloto', 'idAvion', 'fechaVuelo', 'rutaAsignada'];
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

router.get('/', AssignmentController.getAll);
router.get('/:idAsignacion', validateAssignmentId, AssignmentController.getById);
router.post('/', validateCreateBody, AssignmentController.create);
router.put('/:idAsignacion', validateAssignmentId, AssignmentController.update);
router.delete('/:idAsignacion', validateAssignmentId, AssignmentController.remove);

export default router;