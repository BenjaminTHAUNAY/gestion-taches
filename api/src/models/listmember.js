'use strict';

module.exports = (sequelize, DataTypes) => {
  const ListMember = sequelize.define('ListMember', {
    listId: { type: DataTypes.INTEGER, allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    role: { type: DataTypes.ENUM('owner','editor','reader'), allowNull: false }
  }, {});

  ListMember.associate = models => {
    ListMember.belongsTo(models.TaskList, { foreignKey: 'listId' });
    ListMember.belongsTo(models.User, { foreignKey: 'userId' });
  };

  return ListMember;
};
