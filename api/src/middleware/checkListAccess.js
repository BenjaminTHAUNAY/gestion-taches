'use strict';

const { TaskList, ListMember } = require('../models');

/**
 * Middleware pour vérifier l'accès d'un utilisateur à une liste
 * Détermine le rôle de l'utilisateur pour les listes coopératives
 * Ajoute req.listId, req.role et req.taskList à la requête
 */
module.exports = async (req, res, next) => {
  try {
    // Récupérer listId depuis params ou body
    const listId = req.params.listId || req.body.listId || req.params.id;
    
    if (!listId) {
      return res.status(400).json({ error: 'listId requis' });
    }

    // Charger la liste
    const taskList = await TaskList.findByPk(listId);
    if (!taskList) {
      return res.status(404).json({ error: 'Liste introuvable' });
    }

    req.taskList = taskList;
    req.listId = parseInt(listId);

    // Pour les listes personnelles : seul le propriétaire a accès
    if (!taskList.isCoop) {
      if (taskList.ownerId !== req.userId) {
        return res.status(403).json({ error: 'Accès refusé : vous n\'êtes pas propriétaire de cette liste' });
      }
      req.role = 'owner';
      return next();
    }

    // Pour les listes coopératives : vérifier si l'utilisateur est propriétaire ou membre
    if (taskList.ownerId === req.userId) {
      req.role = 'owner';
      return next();
    }

    // Chercher l'entrée dans ListMember
    const membership = await ListMember.findOne({
      where: { listId: taskList.id, userId: req.userId }
    });

    if (!membership) {
      return res.status(403).json({ error: 'Accès refusé : vous n\'êtes pas membre de cette liste' });
    }

    req.role = membership.role;
    next();

  } catch (err) {
    console.error('checkListAccess ERROR:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
