'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Task extends Model {
    static associate(models) {
      Task.belongsTo(models.List, { foreignKey: 'listId', as: 'list' });
      Task.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });

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
