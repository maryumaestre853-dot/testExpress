import { JsonStorage } from './json.storage.js';

const FILE_NAME = 'vehiculos.json';

export const AirplaneModel = {
  async findAll() {
    return await JsonStorage.readCollection(FILE_NAME);
  },

  async findById(id) {
    const airplanes = await this.findAll();
    return airplanes.find((plane) => plane.id === id) || null;
  },

  async findByRegistration(matricula) {
    const airplanes = await this.findAll();
    return (
      airplanes.find((plane) => plane.matricula.toLowerCase() === matricula.toLowerCase()) || null
    );
  },

  async create(airplaneData) {
    const airplanes = await this.findAll();
    const newAirplane = {
      id: JsonStorage.generateNextId(airplanes, 'id'),
      ...airplaneData,
    };
    airplanes.push(newAirplane);
    await JsonStorage.writeCollection(FILE_NAME, airplanes);
    return newAirplane;
  },

  async update(id, updatedFields) {
    const airplanes = await this.findAll();
    const index = airplanes.findIndex((plane) => plane.id === id);
    if (index === -1) return null;

    airplanes[index] = { ...airplanes[index], ...updatedFields, id };
    await JsonStorage.writeCollection(FILE_NAME, airplanes);
    return airplanes[index];
  },

  async delete(id) {
    const airplanes = await this.findAll();
    const filtered = airplanes.filter((plane) => plane.id !== id);
    if (filtered.length === airplanes.length) return false;

    await JsonStorage.writeCollection(FILE_NAME, filtered);
    return true;
  },
};