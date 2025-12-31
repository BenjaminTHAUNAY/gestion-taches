const express = require('express');
const router = express.Router();
const { TaskList, ListMember } = require('../models');
const auth = require('../middleware/auth');

// Créer une liste
router.post('/', auth, async (req, res) => {
  try {
    const { name, isCoop } = req.body;

    const list = await TaskList.create({
      name,
      isCoop: !!isCoop,
      ownerId: req.user.id
    });

    // Le créateur est owner
    await ListMember.create({
      userId: req.user.id,
      listId: list.id,
      role: 'owner'
    });

    res.status(201).json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

// Ajouter un membre à une liste (owner uniquement)
router.post('/:id/members', auth, async (req, res) => {
  try {
    const { userId, role } = req.body;
    const listId = req.params.id;

    // Vérifier que l'utilisateur est owner
    const owner = await ListMember.findOne({
      where: {
        listId,
        userId: req.user.id,
        role: 'owner'
      }
    });

    if (!owner) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    // Empêcher les doublons
    const existing = await ListMember.findOne({
      where: { listId, userId }
    });

    if (existing) {
      return res.status(400).json({ error: 'Utilisateur déjà membre' });
    }

    const member = await ListMember.create({
      listId,
      userId,
      role
    });

    res.status(201).json(member);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
