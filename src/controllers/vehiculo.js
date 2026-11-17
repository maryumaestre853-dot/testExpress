import { AirplaneService } from '../services/vehiculos.js';

export const AirplaneController = {
  async getAll(req, res, next) {
    try {
      const airplanes = await AirplaneService.getAllAirplanes();
      return res.status(200).json({ success: true, count: airplanes.length, data: airplanes });
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const airplane = await AirplaneService.getAirplaneById(req.params.id);
      return res.status(200).json({ success: true, data: airplane });
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const newAirplane = await AirplaneService.createAirplane(req.body);
      return res.status(201).json({
        success: true,
        message: 'Aeronave registrada correctamente',
        data: newAirplane,
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const updatedAirplane = await AirplaneService.updateAirplane(req.params.id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Aeronave actualizada correctamente',
        data: updatedAirplane,
      });
    } catch (error) {
      next(error);
    }
  },

  async remove(req, res, next) {
    try {
      await AirplaneService.deleteAirplane(req.params.id);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};