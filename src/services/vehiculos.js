import { AirplaneModel } from '../models/vehiculos.js';
import { AssignmentModel } from '../models/asignaciones.js';

const throwBusinessError = (message, statusCode = 400, code = 'BUSINESS_ERROR') => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  error.isOperational = true;
  throw error;
};

export const AirplaneService = {
  async getAllAirplanes() {
    return await AirplaneModel.findAll();
  },

  async getAirplaneById(id) {
    const airplane = await AirplaneModel.findById(id);
    if (!airplane) {
      throwBusinessError(`No existe ningún avión con el ID ${id}`, 404, 'AIRPLANE_NOT_FOUND');
    }
    return airplane;
  },

  async createAirplane({ modelo, matricula, capacidadMaxima, fabricante }) {
    const normalizedReg = String(matricula).trim().toUpperCase();
    const capacity = Number(capacidadMaxima);

    if (!Number.isInteger(capacity) || capacity <= 0) {
      throwBusinessError(
        'La capacidad máxima debe ser un número entero mayor a 0',
        400,
        'INVALID_CAPACITY'
      );
    }

    const existingAirplane = await AirplaneModel.findByRegistration(normalizedReg);
    if (existingAirplane) {
      throwBusinessError(
        `Ya existe una aeronave registrada con la matrícula ${normalizedReg}`,
        409,
        'DUPLICATE_REGISTRATION'
      );
    }

    return await AirplaneModel.create({
      modelo: String(modelo).trim(),
      matricula: normalizedReg,
      capacidadMaxima: capacity,
      fabricante: String(fabricante).trim(),
    });
  },

  async updateAirplane(id, payload) {
    const currentAirplane = await this.getAirplaneById(id);
    const updates = {};

    if (payload.modelo !== undefined) {
      updates.modelo = String(payload.modelo).trim();
    }

    if (payload.fabricante !== undefined) {
      updates.fabricante = String(payload.fabricante).trim();
    }

    if (payload.matricula !== undefined) {
      const normalizedReg = String(payload.matricula).trim().toUpperCase();
      const existing = await AirplaneModel.findByRegistration(normalizedReg);
      if (existing && existing.id !== id) {
        throwBusinessError(
          `La matrícula ${normalizedReg} ya está asignada a otra aeronave`,
          409,
          'DUPLICATE_REGISTRATION'
        );
      }
      updates.matricula = normalizedReg;
    }

    if (payload.capacidadMaxima !== undefined) {
      const capacity = Number(payload.capacidadMaxima);
      if (!Number.isInteger(capacity) || capacity <= 0) {
        throwBusinessError(
          'La capacidad máxima debe ser un número entero mayor a 0',
          400,
          'INVALID_CAPACITY'
        );
      }
      updates.capacidadMaxima = capacity;
    }

    if (Object.keys(updates).length === 0) {
      return currentAirplane;
    }

    return await AirplaneModel.update(id, updates);
  },

  async deleteAirplane(id) {
    await this.getAirplaneById(id);

    const activeAssignments = await AssignmentModel.findByAirplaneId(id);
    if (activeAssignments.length > 0) {
      throwBusinessError(
        `No se puede eliminar el avión ID ${id} porque tiene ${activeAssignments.length} asignación(es) activa(s)`,
        409,
        'REFERENTIAL_INTEGRITY_VIOLATION'
      );
    }

    await AirplaneModel.delete(id);
  },
};