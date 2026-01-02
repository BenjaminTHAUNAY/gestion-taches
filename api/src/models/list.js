'use strict';

module.exports = (sequelize, DataTypes) => {
  const List = sequelize.define('List', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    ownerId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {});

  List.associate = (models) => {
    List.belongsTo(models.User, { foreignKey: 'ownerId', as: 'owner' });
    List.hasMany(models.ListMember, { foreignKey: 'listId', as: 'members' });
    List.hasMany(models.Task, { foreignKey: 'listId', as: 'tasks' });
  };

  return List;
};
