import { AssignmentService } from '../services/asignacion.js';

export const AssignmentController = {
  async getAll(req, res, next) {
    try {
      const assignments = await AssignmentService.getAllAssignments();
      return res.status(200).json({ success: true, count: assignments.length, data: assignments });
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const assignment = await AssignmentService.getAssignmentById(req.params.idAsignacion);
      return res.status(200).json({ success: true, data: assignment });
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const newAssignment = await AssignmentService.createAssignment(req.body);
      return res.status(201).json({
        success: true,
        message: 'Asignación de vuelo creada correctamente',
        data: newAssignment,
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const updatedAssignment = await AssignmentService.updateAssignment(
        req.params.idAsignacion,
        req.body
      );
      return res.status(200).json({
        success: true,
        message: 'Asignación actualizada correctamente',
        data: updatedAssignment,
      });
    } catch (error) {
      next(error);
    }
  },

  async remove(req, res, next) {
    try {
      await AssignmentService.deleteAssignment(req.params.idAsignacion);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};