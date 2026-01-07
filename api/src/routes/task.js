const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Task, List, ListMember } = require('../models');

// 🔹 CRÉER UNE TÂCHE
router.post('/', auth, async (req, res) => {
  console.log("UserID:", req.userId); 
  try {
    const { title, status, dueDate, listId } = req.body;

    if (!title || !listId) {
      return res.status(400).json({ error: 'title et listId requis' });
    }

    const task = await Task.create({
      title,
      status: status || 'todo',
      dueDate,
      listId,
      userId: req.userId
    });

    res.status(201).json(task);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// 🔹 LISTER LES TÂCHES D’UNE LISTE
router.get('/:listId', auth, async (req, res) => {
  try {
    const tasks = await Task.findAll({
      where: {
        listId: req.params.listId,
        userId: req.userId
      }
    });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// 🔹 MODIFIER UNE TÂCHE
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOne({
      where: { id: req.params.id, userId: req.userId }
    });

    if (!task) {
      return res.status(404).json({ error: 'Tâche introuvable' });
    }

    await task.update(req.body);
    res.json(task);

  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// 🔹 SUPPRIMER UNE TÂCHE
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOne({
      where: { id: req.params.id, userId: req.userId }
    });

    if (!task) {
      return res.status(404).json({ error: 'Tâche introuvable' });
    }

    await task.destroy();
    res.json({ message: 'Tâche supprimée' });

  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
