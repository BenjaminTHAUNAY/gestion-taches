'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ListMember extends Model {
    static associate(models) {
      ListMember.belongsTo(models.User, { foreignKey: 'userId' });
      ListMember.belongsTo(models.TaskList, { foreignKey: 'listId' });
    }
  }

  ListMember.init({
    role: {
      type: DataTypes.ENUM('owner', 'editor', 'reader'),
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'ListMember',
    timestamps: true,
    updatedAt: false
  });

  return ListMember;
};
