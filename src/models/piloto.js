import { JsonStorage } from './json.storage.js';

const FILE_NAME = 'pilotos.json';

export const PilotModel = {
  async findAll() {
    return await JsonStorage.readCollection(FILE_NAME);
  },

  async findById(id) {
    const pilots = await this.findAll();
    return pilots.find((pilot) => pilot.id === id) || null;
  },

  async findByLicense(licencia) {
    const pilots = await this.findAll();
    return pilots.find((pilot) => pilot.licencia.toLowerCase() === licencia.toLowerCase()) || null;
  },

  async create(pilotData) {
    const pilots = await this.findAll();
    const newPilot = {
      id: JsonStorage.generateNextId(pilots, 'id'),
      ...pilotData,
    };
    pilots.push(newPilot);
    await JsonStorage.writeCollection(FILE_NAME, pilots);
    return newPilot;
  },

  async update(id, updatedFields) {
    const pilots = await this.findAll();
    const index = pilots.findIndex((pilot) => pilot.id === id);
    if (index === -1) return null;

    pilots[index] = { ...pilots[index], ...updatedFields, id };
    await JsonStorage.writeCollection(FILE_NAME, pilots);
    return pilots[index];
  },

  async delete(id) {
    const pilots = await this.findAll();
    const filtered = pilots.filter((pilot) => pilot.id !== id);
    if (filtered.length === pilots.length) return false;

    await JsonStorage.writeCollection(FILE_NAME, filtered);
    return true;
  },
};