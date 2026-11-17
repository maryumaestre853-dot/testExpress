import { PilotModel } from '../models/piloto.js';
import { AssignmentModel } from '../models/asignaciones.js';

const VALID_STATUSES = ['DISPONIBLE', 'EN_VUELO', 'INACTIVO'];

const throwBusinessError = (message, statusCode = 400, code = 'BUSINESS_ERROR') => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  error.isOperational = true;
  throw error;
};

export const PilotService = {
  async getAllPilots() {
    return await PilotModel.findAll();
  },

  async getPilotById(id) {
    const pilot = await PilotModel.findById(id);
    if (!pilot) {
      throwBusinessError(`No existe ningún piloto con el ID ${id}`, 404, 'PILOT_NOT_FOUND');
    }
    return pilot;
  },

  async createPilot({ nombre, licencia, horasVuelo, estado = 'DISPONIBLE' }) {
    const normalizedLicense = String(licencia).trim().toUpperCase();
    const normalizedStatus = String(estado).trim().toUpperCase();
    const hours = Number(horasVuelo);

    if (Number.isNaN(hours) || hours < 0) {
      throwBusinessError(
        'Las horas de vuelo deben ser un número mayor o igual a 0',
        400,
        'INVALID_FLIGHT_HOURS'
      );
    }

    if (!VALID_STATUSES.includes(normalizedStatus)) {
      throwBusinessError(
        `Estado inválido. Valores permitidos: ${VALID_STATUSES.join(', ')}`,
        400,
        'INVALID_PILOT_STATUS'
      );
    }

    const existingPilot = await PilotModel.findByLicense(normalizedLicense);
    if (existingPilot) {
      throwBusinessError(
        `Ya existe un piloto registrado con la licencia ${normalizedLicense}`,
        409,
        'DUPLICATE_LICENSE'
      );
    }

    return await PilotModel.create({
      nombre: String(nombre).trim(),
      licencia: normalizedLicense,
      horasVuelo: hours,
      estado: normalizedStatus,
    });
  },

  async updatePilot(id, payload) {
    const currentPilot = await this.getPilotById(id);
    const updates = {};

    if (payload.nombre !== undefined) {
      updates.nombre = String(payload.nombre).trim();
    }

    if (payload.licencia !== undefined) {
      const normalizedLicense = String(payload.licencia).trim().toUpperCase();
      const existing = await PilotModel.findByLicense(normalizedLicense);
      if (existing && existing.id !== id) {
        throwBusinessError(
          `La licencia ${normalizedLicense} pertenece a otro piloto`,
          409,
          'DUPLICATE_LICENSE'
        );
      }
      updates.licencia = normalizedLicense;
    }

    if (payload.horasVuelo !== undefined) {
      const hours = Number(payload.horasVuelo);
      if (Number.isNaN(hours) || hours < 0) {
        throwBusinessError(
          'Las horas de vuelo deben ser un número mayor o igual a 0',
          400,
          'INVALID_FLIGHT_HOURS'
        );
      }
      updates.horasVuelo = hours;
    }

    if (payload.estado !== undefined) {
      const normalizedStatus = String(payload.estado).trim().toUpperCase();
      if (!VALID_STATUSES.includes(normalizedStatus)) {
        throwBusinessError(
          `Estado inválido. Valores permitidos: ${VALID_STATUSES.join(', ')}`,
          400,
          'INVALID_PILOT_STATUS'
        );
      }
      updates.estado = normalizedStatus;
    }

    if (Object.keys(updates).length === 0) {
      return currentPilot;
    }

    return await PilotModel.update(id, updates);
  },

  async deletePilot(id) {
    await this.getPilotById(id);

    const activeAssignments = await AssignmentModel.findByPilotId(id);
    if (activeAssignments.length > 0) {
      throwBusinessError(
        `No se puede eliminar el piloto ID ${id} porque tiene ${activeAssignments.length} asignación(es) activa(s)`,
        409,
        'REFERENTIAL_INTEGRITY_VIOLATION'
      );
    }

    await PilotModel.delete(id);
  },
};