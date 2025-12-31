'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Task extends Model {
    static associate(models) {
      Task.belongsTo(models.TaskList, { foreignKey: 'listId' });
    }
  }

  Task.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    done: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Task'
  });

  return Task;
};
