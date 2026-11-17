import { PilotService } from '../services/piloto.js';

export const PilotController = {
  async getAll(req, res, next) {
    try {
      const pilots = await PilotService.getAllPilots();
      return res.status(200).json({ success: true, count: pilots.length, data: pilots });
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const pilot = await PilotService.getPilotById(req.params.id);
      return res.status(200).json({ success: true, data: pilot });
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const newPilot = await PilotService.createPilot(req.body);
      return res.status(201).json({
        success: true,
        message: 'Piloto registrado correctamente',
        data: newPilot,
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const updatedPilot = await PilotService.updatePilot(req.params.id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Piloto actualizado correctamente',
        data: updatedPilot,
      });
    } catch (error) {
      next(error);
    }
  },

  async remove(req, res, next) {
    try {
      await PilotService.deletePilot(req.params.id);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};