import { JsonStorage } from './json.storage.js';

const FILE_NAME = 'asignaciones.json';

export const AssignmentModel = {
  async findAll() {
    return await JsonStorage.readCollection(FILE_NAME);
  },

  async findById(idAsignacion) {
    const assignments = await this.findAll();
    return assignments.find((item) => item.idAsignacion === idAsignacion) || null;
  },

  async findByPilotId(idPiloto) {
    const assignments = await this.findAll();
    return assignments.filter((item) => item.idPiloto === idPiloto);
  },

  async findByAirplaneId(idAvion) {
    const assignments = await this.findAll();
    return assignments.filter((item) => item.idAvion === idAvion);
  },

  async create(assignmentData) {
    const assignments = await this.findAll();
    const newAssignment = {
      idAsignacion: JsonStorage.generateNextId(assignments, 'idAsignacion'),
      ...assignmentData,
    };
    assignments.push(newAssignment);
    await JsonStorage.writeCollection(FILE_NAME, assignments);
    return newAssignment;
  },

  async update(idAsignacion, updatedFields) {
    const assignments = await this.findAll();
    const index = assignments.findIndex((item) => item.idAsignacion === idAsignacion);
    if (index === -1) return null;

    assignments[index] = { ...assignments[index], ...updatedFields, idAsignacion };
    await JsonStorage.writeCollection(FILE_NAME, assignments);
    return assignments[index];
  },

  async delete(idAsignacion) {
    const assignments = await this.findAll();
    const filtered = assignments.filter((item) => item.idAsignacion !== idAsignacion);
    if (filtered.length === assignments.length) return false;

    await JsonStorage.writeCollection(FILE_NAME, filtered);
    return true;
  },
};