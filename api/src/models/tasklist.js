'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class TaskList extends Model {
    static associate(models) {
      TaskList.belongsTo(models.User, { foreignKey: 'ownerId' });
      TaskList.hasMany(models.Task, { foreignKey: 'listId' });
      TaskList.hasMany(models.ListMember, { foreignKey: 'listId' });
    }
  }

  TaskList.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    isCoop: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    ownerId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'TaskList'
  });

  return TaskList;
};
