'use strict';

const express = require('express');
const router = express.Router();
const { Task, ListMember } = require('../models'); // plus de TaskList
const auth = require('../middleware/auth');

// Middleware pour vérifier les droits sur une tâche
const checkRole = (allowedRoles) => {
  return async (req, res, next) => {
    const taskId = req.params.id || req.body.taskId;

    const task = await Task.findByPk(taskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    // Vérifie si l'utilisateur est membre de la liste
    const member = await ListMember.findOne({
      where: {
        listId: task.listId,
        userId: req.user.id
      }
    });

    if (!member || !allowedRoles.includes(member.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    req.task = task; // passe la tâche au prochain middleware
    next();
  };
};

// GET /tasks/:id - récupérer une tâche
router.get('/:id', auth, checkRole(['owner', 'editor', 'reader']), async (req, res) => {
  res.json(req.task);
});

// POST /tasks - créer une tâche
router.post('/', auth, checkRole(['owner', 'editor']), async (req, res) => {
  const task = await Task.create({
    listId: req.body.listId,
    title: req.body.title,
    dueDate: req.body.dueDate,
    status: req.body.status
  });
  res.status(201).json(task);
});

// PUT /tasks/:id - mettre à jour une tâche
router.put('/:id', auth, checkRole(['owner', 'editor']), async (req, res) => {
  const task = req.task;

  // Précondition obligatoire pour éviter les conflits
  const clientDate = req.headers['if-unmodified-since'];
  if (!clientDate) {
    return res.status(428).json({
      error: 'Precondition Required',
      message: 'If-Unmodified-Since header is required'
    });
  }

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

// DELETE /tasks/:id - supprimer une tâche
router.delete('/:id', auth, checkRole(['owner', 'editor']), async (req, res) => {
  await req.task.destroy();
  res.status(204).end();
});

module.exports = router;
