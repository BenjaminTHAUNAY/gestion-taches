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
