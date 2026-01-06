'use strict';

const express = require('express');
const router = express.Router();
const { List } = require('../models');
const auth = require('../middleware/auth');

// Récupérer toutes les listes d’un utilisateur
router.get('/', auth, async (req, res) => {
  try {
    const lists = await List.findAll({ where: { ownerId: req.userId } });
    res.json(lists);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur', details: err.message });
  }
});

// Créer une nouvelle liste
router.post('/', auth, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Le nom est requis' });

    const list = await List.create({
      name,
      ownerId: req.userId
    });

    res.status(201).json(list);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur', details: err.message });
  }
});

module.exports = router;
