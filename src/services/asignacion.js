import { AssignmentModel } from '../models/asignaciones.js';
import { PilotModel } from '../models/piloto.js';
import { AirplaneModel } from '../models/vehiculos.js';

const throwBusinessError = (message, statusCode = 400, code = 'BUSINESS_ERROR') => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  error.isOperational = true; 
  throw error;
};

const validateIsoDate = (dateStr) => {
  const parsed = Date.parse(dateStr);
  if (Number.isNaN(parsed)) {
    throwBusinessError(
      'El campo fechaVuelo debe tener un formato de fecha válido (ej. YYYY-MM-DD)',
      400,
      'INVALID_DATE'
    );
  }
  return String(dateStr).trim();
};

export const AssignmentService = {
  async getAllAssignments() {
    const [assignments, pilots, airplanes] = await Promise.all([
      AssignmentModel.findAll(),
      PilotModel.findAll(),
      AirplaneModel.findAll(),
    ]);

    const pilotMap = new Map(pilots.map((p) => [p.id, p]));
    const airplaneMap = new Map(airplanes.map((a) => [a.id, a]));

    return assignments.map((item) => ({
      ...item,
      detallePiloto: pilotMap.get(item.idPiloto) || null,
      detalleAvion: airplaneMap.get(item.idAvion) || null,
    }));
  },

  async getAssignmentById(idAsignacion) {
    const assignment = await AssignmentModel.findById(idAsignacion);
    if (!assignment) {
      throwBusinessError(
        `No existe ninguna asignación con el ID ${idAsignacion}`,
        404,
        'ASSIGNMENT_NOT_FOUND'
      );
    }

    const [detallePiloto, detalleAvion] = await Promise.all([
      PilotModel.findById(assignment.idPiloto),
      AirplaneModel.findById(assignment.idAvion),
    ]);

    return {
      ...assignment,
      detallePiloto,
      detalleAvion,
    };
  },

  async createAssignment({ idPiloto, idAvion, fechaVuelo, rutaAsignada }) {
    const pilotId = Number(idPiloto);
    const airplaneId = Number(idAvion);

    if (!Number.isInteger(pilotId) || pilotId <= 0 || !Number.isInteger(airplaneId) || airplaneId <= 0) {
      throwBusinessError('idPiloto e idAvion deben ser enteros positivos', 400, 'INVALID_FOREIGN_KEY');
    }

    const cleanDate = validateIsoDate(fechaVuelo);

    // 1. Validación relacional: existencia del piloto
    const pilot = await PilotModel.findById(pilotId);
    if (!pilot) {
      throwBusinessError(
        `Integridad relacional fallida: El piloto con ID ${pilotId} no existe`,
        404,
        'RELATED_PILOT_NOT_FOUND'
      );
    }

    // 2. Regla operativa: disponibilidad del piloto
    if (pilot.estado !== 'DISPONIBLE') {
      throwBusinessError(
        `El piloto ${pilot.nombre} no puede ser asignado porque su estado actual es '${pilot.estado}'`,
        409,
        'PILOT_NOT_AVAILABLE'
      );
    }

    // 3. Validación relacional: existencia del avión
    const airplane = await AirplaneModel.findById(airplaneId);
    if (!airplane) {
      throwBusinessError(
        `Integridad relacional fallida: El avión con ID ${airplaneId} no existe`,
        404,
        'RELATED_AIRPLANE_NOT_FOUND'
      );
    }

    // 4. Regla operativa: evitar cruce de horarios en la misma fecha
    const allAssignments = await AssignmentModel.findAll();
    const conflict = allAssignments.find(
      (a) => a.fechaVuelo === cleanDate && (a.idPiloto === pilotId || a.idAvion === airplaneId)
    );
    if (conflict) {
      throwBusinessError(
        `Conflicto de programación para la fecha ${cleanDate}: el piloto o la aeronave ya tienen una ruta asignada`,
        409,
        'SCHEDULE_CONFLICT'
      );
    }

    return await AssignmentModel.create({
      idPiloto: pilotId,
      idAvion: airplaneId,
      fechaVuelo: cleanDate,
      rutaAsignada: String(rutaAsignada).trim().toUpperCase(),
    });
  },

  async updateAssignment(idAsignacion, payload) {
    const current = await AssignmentModel.findById(idAsignacion);
    if (!current) {
      throwBusinessError(
        `No existe ninguna asignación con el ID ${idAsignacion}`,
        404,
        'ASSIGNMENT_NOT_FOUND'
      );
    }

    const updates = {};
    const targetPilotId = payload.idPiloto !== undefined ? Number(payload.idPiloto) : current.idPiloto;
    const targetAirplaneId = payload.idAvion !== undefined ? Number(payload.idAvion) : current.idAvion;
    const targetDate = payload.fechaVuelo !== undefined ? validateIsoDate(payload.fechaVuelo) : current.fechaVuelo;

    if (payload.idPiloto !== undefined) {
      if (!Number.isInteger(targetPilotId) || targetPilotId <= 0) {
        throwBusinessError('idPiloto debe ser un entero positivo', 400, 'INVALID_FOREIGN_KEY');
      }
      const pilot = await PilotModel.findById(targetPilotId);
      if (!pilot) {
        throwBusinessError(
          `Integridad relacional fallida: El piloto con ID ${targetPilotId} no existe`,
          404,
          'RELATED_PILOT_NOT_FOUND'
        );
      }
      if (pilot.estado !== 'DISPONIBLE' && targetPilotId !== current.idPiloto) {
        throwBusinessError(
          `El piloto ${pilot.nombre} no está disponible (Estado: ${pilot.estado})`,
          409,
          'PILOT_NOT_AVAILABLE'
        );
      }
      updates.idPiloto = targetPilotId;
    }

    if (payload.idAvion !== undefined) {
      if (!Number.isInteger(targetAirplaneId) || targetAirplaneId <= 0) {
        throwBusinessError('idAvion debe ser un entero positivo', 400, 'INVALID_FOREIGN_KEY');
      }
      const airplane = await AirplaneModel.findById(targetAirplaneId);
      if (!airplane) {
        throwBusinessError(
          `Integridad relacional fallida: El avión con ID ${targetAirplaneId} no existe`,
          404,
          'RELATED_AIRPLANE_NOT_FOUND'
        );
      }
      updates.idAvion = targetAirplaneId;
    }

    if (payload.fechaVuelo !== undefined) {
      updates.fechaVuelo = targetDate;
    }

    if (payload.rutaAsignada !== undefined) {
      updates.rutaAsignada = String(payload.rutaAsignada).trim().toUpperCase();
    }

    if (Object.keys(updates).length === 0) {
      return current;
    }

    // Verificar conflictos excluyendo la asignación actual
    const allAssignments = await AssignmentModel.findAll();
    const conflict = allAssignments.find(
      (a) =>
        a.idAsignacion !== idAsignacion &&
        a.fechaVuelo === targetDate &&
        (a.idPiloto === targetPilotId || a.idAvion === targetAirplaneId)
    );
    if (conflict) {
      throwBusinessError(
        `Conflicto de programación para la fecha ${targetDate}: el piloto o la aeronave ya tienen una ruta asignada`,
        409,
        'SCHEDULE_CONFLICT'
      );
    }

    return await AssignmentModel.update(idAsignacion, updates);
  },

  async deleteAssignment(idAsignacion) {
    const deleted = await AssignmentModel.delete(idAsignacion);
    if (!deleted) {
      throwBusinessError(
        `No existe ninguna asignación con el ID ${idAsignacion}`,
        404,
        'ASSIGNMENT_NOT_FOUND'
      );
    }
  },
};