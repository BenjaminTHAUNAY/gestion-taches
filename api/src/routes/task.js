const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const checkRole = require('../middleware/listRole');
const { Task } = require('../../models');

// Lire les tâches (tous les membres)
router.get('/:listId', auth, checkRole(['owner', 'editor', 'reader']), async (req, res) => {
  const tasks = await Task.findAll({
    where: { listId: req.params.listId }
  });
  res.json(tasks);
});

// Créer une tâche
router.post('/', auth, checkRole(['owner', 'editor']), async (req, res) => {
  const task = await Task.create(req.body);
  res.status(201).json(task);
});

// Modifier une tâche
router.put('/:id', auth, checkRole(['owner', 'editor']), async (req, res) => {
  await Task.update(req.body, { where: { id: req.params.id } });
  res.json({ message: 'Tâche mise à jour' });
});

// Supprimer une tâche (owner seulement)
router.delete('/:id', auth, checkRole(['owner']), async (req, res) => {
  await Task.destroy({ where: { id: req.params.id } });
  res.json({ message: 'Tâche supprimée' });
});

module.exports = router;
