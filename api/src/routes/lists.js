'use strict';

const express = require('express');
const router = express.Router();
const { TaskList, ListMember, User, Task } = require('../models');
const auth = require('../middleware/auth');
const checkListAccess = require('../middleware/checkListAccess');
const { Op } = require('sequelize');

/**
 * GET /api/lists
 * Récupérer toutes les listes accessibles à l'utilisateur connecté
 * - Listes personnelles dont il est propriétaire
 * - Listes coopératives dont il est membre
 */
router.get('/', auth, async (req, res) => {
  try {
    // Listes personnelles dont l'utilisateur est propriétaire
    const personalLists = await TaskList.findAll({
      where: {
        ownerId: req.userId,
        isCoop: false
      }
    });

    // Listes coopératives dont l'utilisateur est membre ou propriétaire
    const memberShips = await ListMember.findAll({
      where: { userId: req.userId },
      attributes: ['listId']
    });
    const memberListIds = memberShips.map(m => m.listId);

    // Listes coopératives dont il est propriétaire ou membre
    const coopLists = await TaskList.findAll({
      where: {
        [Op.or]: [
          { ownerId: req.userId, isCoop: true },
          { id: { [Op.in]: memberListIds }, isCoop: true }
        ]
      }
    });

    const allLists = [...personalLists, ...coopLists];
    res.json(allLists);

  } catch (err) {
    console.error('GET /api/lists ERROR:', err);
    res.status(500).json({ error: 'Erreur serveur', details: err.message });
  }
});

/**
 * GET /api/lists/:id
 * Consulter une liste spécifique (vérifie les droits d'accès)
 */
router.get('/:id', auth, checkListAccess, async (req, res) => {
  try {
    const list = await TaskList.findByPk(req.params.id, {
      include: [
        { model: User, as: 'owner', attributes: ['id', 'email'] }
      ]
    });

    if (!list) {
      return res.status(404).json({ error: 'Liste introuvable' });
    }

    res.json(list);
  } catch (err) {
    console.error('GET /api/lists/:id ERROR:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * POST /api/lists
 * Créer une nouvelle liste (personnelle ou coopérative)
 */
router.post('/', auth, async (req, res) => {
  try {
    const { name, isCoop } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Le nom est requis' });
    }

    const list = await TaskList.create({
      name,
      ownerId: req.userId,
      isCoop: isCoop === true || isCoop === 'true'
    });

    // Si c'est une liste coopérative, créer automatiquement l'entrée owner dans ListMember
    if (list.isCoop) {
      await ListMember.create({
        listId: list.id,
        userId: req.userId,
        role: 'owner'
      });
    }

    res.status(201).json(list);

  } catch (err) {
    console.error('POST /api/lists ERROR:', err);
    res.status(500).json({ error: 'Erreur serveur', details: err.message });
  }
});

/**
 * PUT /api/lists/:id
 * Renommer une liste (selon les droits : owner peut modifier)
 */
router.put('/:id', auth, checkListAccess, async (req, res) => {
  try {
    // Seul le propriétaire peut renommer
    if (req.role !== 'owner') {
      return res.status(403).json({ error: 'Seul le propriétaire peut modifier la liste' });
    }

    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Le nom est requis' });
    }

    await req.taskList.update({ name });
    res.json(req.taskList);

  } catch (err) {
    console.error('PUT /api/lists/:id ERROR:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * DELETE /api/lists/:id
 * Supprimer une liste (seul le propriétaire peut supprimer)
 */
router.delete('/:id', auth, checkListAccess, async (req, res) => {
  try {
    // Seul le propriétaire peut supprimer
    if (req.role !== 'owner') {
      return res.status(403).json({ error: 'Seul le propriétaire peut supprimer la liste' });
    }

    await req.taskList.destroy();
    res.json({ message: 'Liste supprimée' });

  } catch (err) {
    console.error('DELETE /api/lists/:id ERROR:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * GET /api/lists/:id/tasks
 * Obtenir les tâches d'une liste
 */
router.get('/:id/tasks', auth, checkListAccess, async (req, res) => {
  try {
    const { Task } = require('../models');
    const tasks = await Task.findAll({
      where: { listId: req.params.id },
      order: [['createdAt', 'DESC']]
    });
    res.json(tasks);
  } catch (err) {
    console.error('GET /api/lists/:id/tasks ERROR:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * POST /api/lists/:id/tasks
 * Ajouter une tâche à une liste
 */
router.post('/:id/tasks', auth, checkListAccess, async (req, res) => {
  try {
    if (req.role === 'reader') {
      return res.status(403).json({ error: 'Lecture seule : vous ne pouvez pas créer de tâche' });
    }

    const { title, done, dueDate } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'title est requis' });
    }

    const { Task } = require('../models');
    const task = await Task.create({
      title,
      done: done || false,
      dueDate: dueDate || null,
      listId: parseInt(req.params.id)
    });

    res.status(201).json(task);
  } catch (err) {
    console.error('POST /api/lists/:id/tasks ERROR:', err);
    res.status(500).json({ error: 'Erreur serveur', details: err.message });
  }
});

/**
 * GET /api/lists/:id/members
 * Obtenir les membres d'une liste coopérative (visible uniquement pour les membres)
 */
router.get('/:id/members', auth, checkListAccess, async (req, res) => {
  try {
    if (!req.taskList.isCoop) {
      return res.status(400).json({ error: 'Cette liste n\'est pas coopérative' });
    }

    // Récupérer tous les membres avec leurs infos utilisateur
    const members = await ListMember.findAll({
      where: { listId: req.params.id },
      include: [
        { model: User, attributes: ['id', 'email'] }
      ]
    });

    // Formater la réponse
    const formatted = members.map(m => ({
      userId: m.userId,
      listId: m.listId,
      role: m.role,
      email: m.User.email,
      createdAt: m.createdAt
    }));

    res.json(formatted);

  } catch (err) {
    console.error('GET /api/lists/:id/members ERROR:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * POST /api/lists/:id/members
 * Ajouter un membre à une liste coopérative (seul le propriétaire peut ajouter)
 */
router.post('/:id/members', auth, checkListAccess, async (req, res) => {
  try {
    if (!req.taskList.isCoop) {
      return res.status(400).json({ error: 'Cette liste n\'est pas coopérative' });
    }

    // Seul le propriétaire peut ajouter des membres
    if (req.role !== 'owner') {
      return res.status(403).json({ error: 'Seul le propriétaire peut ajouter des membres' });
    }

    const { email, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({ error: 'email et role requis' });
    }

    if (!['owner', 'editor', 'reader'].includes(role)) {
      return res.status(400).json({ error: 'role invalide (owner, editor, reader)' });
    }

    // Trouver l'utilisateur par email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Vérifier si l'utilisateur n'est pas déjà membre
    const existing = await ListMember.findOne({
      where: { listId: req.params.id, userId: user.id }
    });

    if (existing) {
      return res.status(409).json({ error: 'Cet utilisateur est déjà membre de la liste' });
    }

    // Créer le membre
    const member = await ListMember.create({
      listId: parseInt(req.params.id),
      userId: user.id,
      role
    });

    res.status(201).json({
      userId: member.userId,
      listId: member.listId,
      role: member.role,
      email: user.email,
      createdAt: member.createdAt
    });

  } catch (err) {
    console.error('POST /api/lists/:id/members ERROR:', err);
    res.status(500).json({ error: 'Erreur serveur', details: err.message });
  }
});

/**
 * PUT /api/lists/:id/members/:userId
 * Modifier le rôle d'un membre (seul le propriétaire peut modifier)
 */
router.put('/:id/members/:userId', auth, checkListAccess, async (req, res) => {
  try {
    if (!req.taskList.isCoop) {
      return res.status(400).json({ error: 'Cette liste n\'est pas coopérative' });
    }

    // Seul le propriétaire peut modifier les rôles
    if (req.role !== 'owner') {
      return res.status(403).json({ error: 'Seul le propriétaire peut modifier les rôles' });
    }

    const { role } = req.body;
    if (!role || !['owner', 'editor', 'reader'].includes(role)) {
      return res.status(400).json({ error: 'role invalide (owner, editor, reader)' });
    }

    const member = await ListMember.findOne({
      where: {
        listId: req.params.id,
        userId: req.params.userId
      }
    });

    if (!member) {
      return res.status(404).json({ error: 'Membre non trouvé' });
    }

    // Ne pas permettre de modifier le rôle du propriétaire original
    if (req.taskList.ownerId === parseInt(req.params.userId) && member.role === 'owner') {
      return res.status(400).json({ error: 'Impossible de modifier le rôle du propriétaire original' });
    }

    await member.update({ role });

    const user = await User.findByPk(req.params.userId);
    res.json({
      userId: member.userId,
      listId: member.listId,
      role: member.role,
      email: user.email,
      createdAt: member.createdAt
    });

  } catch (err) {
    console.error('PUT /api/lists/:id/members/:userId ERROR:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * DELETE /api/lists/:id/members/:userId
 * Retirer un membre d'une liste (seul le propriétaire peut retirer)
 */
router.delete('/:id/members/:userId', auth, checkListAccess, async (req, res) => {
  try {
    if (!req.taskList.isCoop) {
      return res.status(400).json({ error: 'Cette liste n\'est pas coopérative' });
    }

    // Seul le propriétaire peut retirer des membres
    if (req.role !== 'owner') {
      return res.status(403).json({ error: 'Seul le propriétaire peut retirer des membres' });
    }

    const member = await ListMember.findOne({
      where: {
        listId: req.params.id,
        userId: req.params.userId
      }
    });

    if (!member) {
      return res.status(404).json({ error: 'Membre non trouvé' });
    }

    // Ne pas permettre de retirer le propriétaire original
    if (req.taskList.ownerId === parseInt(req.params.userId)) {
      return res.status(400).json({ error: 'Impossible de retirer le propriétaire original' });
    }

    await member.destroy();
    res.json({ message: 'Membre retiré' });

  } catch (err) {
    console.error('DELETE /api/lists/:id/members/:userId ERROR:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
