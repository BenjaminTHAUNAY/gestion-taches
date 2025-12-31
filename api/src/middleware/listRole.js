const { ListMember } = require('../../models');

module.exports = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const listId = req.params.listId || req.body.listId;

      const member = await ListMember.findOne({
        where: {
          listId,
          userId: req.user.id
        }
      });

      if (!member || !allowedRoles.includes(member.role)) {
        return res.status(403).json({ error: 'Accès refusé' });
      }

      next();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
};
