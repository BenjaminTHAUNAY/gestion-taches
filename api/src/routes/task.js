'use strict';

const express = require('express');
const router = express.Router();

const { Task, TaskList, ListMember } = require('../../models');
const auth = require('../middleware/auth');

const checkRole = (allowedRoles) => {
  return async (req, res, next) => {
    const listId = req.params.listId || req.body.listId;

    const list = await TaskList.findByPk(listId);
    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    if (!list.isCoop) {
      if (list.ownerId !== req.user.id) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      return next();
    }

    const member = await ListMember.findOne({
      where: {
        listId,
        userId: req.user.id
      }
    });

    if (!member || !allowedRoles.includes(member.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    next();
  };
};
router.get(
  '/:listId',
  auth,
  checkRole(['owner', 'editor', 'reader']),
  async (req, res) => {
    const { page = 1, limit = 10, status, sort = 'createdAt' } = req.query;

    const where = { listId: req.params.listId };
    if (status) where.status = status;

    const tasks = await Task.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      order: [[sort, 'DESC']]
    });

    res.json({
      total: tasks.count,
      page: parseInt(page),
      pages: Math.ceil(tasks.count / limit),
      data: tasks.rows
    });
  }
);
router.post(
  '/',
  auth,
  checkRole(['owner', 'editor']),
  async (req, res) => {
    const task = await Task.create({
      listId: req.body.listId,
      title: req.body.title,
      dueDate: req.body.dueDate,
      status: req.body.status
    });

    res.status(201).json(task);
  }
);
router.put(
  '/:id',
  auth,
  async (req, res) => {
    const task = await Task.findByPk(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Vérification des droits
    req.body.listId = task.listId;
    await checkRole(['owner', 'editor'])(req, res, async () => {
      // Précondition obligatoire
      const clientDate = req.headers['if-unmodified-since'];
      if (!clientDate) {
        return res.status(428).json({
          error: 'Precondition Required',
          message: 'If-Unmodified-Since header is required'
        });
      }

      // Détection de conflit
      if (new Date(clientDate).getTime() !== task.updatedAt.getTime()) {
        return res.status(409).json({
          error: 'Conflict',
          message: 'Task has been modified by another user'
        });
      }

      await task.update({
        title: req.body.title,
        done: req.body.done,
        dueDate: req.body.dueDate,
        status: req.body.status
      });

      res.json(task);
    });
  }
);

router.delete(
  '/:id',
  auth,
  async (req, res) => {
    const task = await Task.findByPk(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    req.body.listId = task.listId;
    await checkRole(['owner', 'editor'])(req, res, async () => {
      await task.destroy();
      res.status(204).end();
    });
  }
);

module.exports = router;
