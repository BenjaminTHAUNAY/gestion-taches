'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ListMember extends Model {
    static associate(models) {
      ListMember.belongsTo(models.User, { foreignKey: 'userId' });
      ListMember.hasMany(models.Task, { foreignKey: 'listId', sourceKey: 'listId' });
    }
  }

  ListMember.init({
    listId: { type: DataTypes.INTEGER, allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    role: { type: DataTypes.STRING, defaultValue: 'reader' }
  }, {
    sequelize,
    modelName: 'ListMember'
  });

  return ListMember;
};
