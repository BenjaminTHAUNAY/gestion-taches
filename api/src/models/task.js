'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Task extends Model {
    static associate(models) {
      Task.belongsTo(models.User, { foreignKey: 'userId' });
      Task.belongsTo(models.ListMember, { foreignKey: 'listId', targetKey: 'listId', constraints: false });
    }
  }

  Task.init({
    title: { type: DataTypes.STRING, allowNull: false },
    status: { type: DataTypes.STRING, defaultValue: 'pending' },
    dueDate: DataTypes.DATE,
    userId: DataTypes.INTEGER,
    listId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Task'
  });

  return Task;
};
