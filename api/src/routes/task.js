'use strict';

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Task, TaskList, ListMember } = require('../models');

/**
 * Helper pour vérifier l'accès à une tâche via sa liste
 */
async function checkTaskAccess(req, res, task) {
  if (!task) {
    res.status(404).json({ error: 'Tâche introuvable' });
    return false;
  }

  // Récupérer la liste associée
  const taskList = await TaskList.findByPk(task.listId);
  if (!taskList) {
    res.status(404).json({ error: 'Liste associée introuvable' });
    return false;
  }

  req.taskList = taskList;
  req.listId = task.listId;

  // Pour les listes personnelles
  if (!taskList.isCoop) {
    if (taskList.ownerId !== req.userId) {
      res.status(403).json({ error: 'Accès refusé' });
      return false;
    }
    req.role = 'owner';
    return true;
  }

  // Pour les listes coopératives
  if (taskList.ownerId === req.userId) {
    req.role = 'owner';
    return true;
  }

  const membership = await ListMember.findOne({
    where: { listId: taskList.id, userId: req.userId }
  });

  if (!membership) {
    res.status(403).json({ error: 'Accès refusé : vous n\'êtes pas membre de cette liste' });
    return false;
  }

  req.role = membership.role;
  return true;
}

/**
 * GET /api/tasks/:id
 * Obtenir une tâche spécifique
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Tâche introuvable' });
    }

    const hasAccess = await checkTaskAccess(req, res, task);
    if (!hasAccess) return; // Réponse déjà envoyée par checkTaskAccess

    res.json(task);
  } catch (err) {
    console.error('GET /api/tasks/:id ERROR:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * PUT /api/tasks/:id
 * Modifier une tâche avec détection de conflit
 * 
 * Gestion des conflits :
 * - Le client doit fournir le champ updatedAt de la version qu'il a chargée
 * - Si updatedAt n'est pas fourni : 428 Precondition Required
 * - Si updatedAt ne correspond pas à la version serveur : 409 Conflict
 * - Le mécanisme utilise le timestamp updatedAt géré automatiquement par Sequelize
 */
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, done, dueDate, updatedAt } = req.body;

    // Précondition requise : updatedAt pour la détection de conflit
    if (!updatedAt) {
      return res.status(428).json({ 
        error: 'Precondition Required',
        message: 'Le champ updatedAt est requis pour éviter les conflits de modification',
        details: 'Vous devez fournir le champ updatedAt de la version actuelle de la tâche que vous avez chargée'
      });
    }

    const task = await Task.findByPk(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Tâche introuvable' });
    }

    const hasAccess = await checkTaskAccess(req, res, task);
    if (!hasAccess) return;

    if (req.role === 'reader') {
      return res.status(403).json({ error: 'Lecture seule : vous ne pouvez pas modifier cette tâche' });
    }

    // Détection de conflit : comparer les timestamps updatedAt
    const clientTimestamp = new Date(updatedAt).getTime();
    const serverTimestamp = new Date(task.updatedAt).getTime();

    if (clientTimestamp !== serverTimestamp) {
      return res.status(409).json({ 
        error: 'Conflict',
        message: 'La tâche a été modifiée par un autre utilisateur entre-temps',
        details: 'Vous devez recharger la tâche et réappliquer vos modifications',
        serverVersion: {
          id: task.id,
          title: task.title,
          done: task.done,
          dueDate: task.dueDate,
          updatedAt: task.updatedAt
        }
      });
    }

    // Mise à jour de la tâche
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (done !== undefined) updateData.done = done;
    if (dueDate !== undefined) updateData.dueDate = dueDate;

    await task.update(updateData);
    await task.reload();

    res.json(task);

  } catch (err) {
    console.error('PUT /api/tasks/:id ERROR:', err);
    res.status(500).json({ error: 'Erreur serveur', details: err.message });
  }
});

/**
 * DELETE /api/tasks/:id
 * Supprimer une tâche
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Tâche introuvable' });
    }

    const hasAccess = await checkTaskAccess(req, res, task);
    if (!hasAccess) return;

    if (req.role === 'reader') {
      return res.status(403).json({ error: 'Lecture seule : vous ne pouvez pas supprimer cette tâche' });
    }

    await task.destroy();
    res.json({ message: 'Tâche supprimée' });

  } catch (err) {
    console.error('DELETE /api/tasks/:id ERROR:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
