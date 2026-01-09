'use strict';

module.exports = (sequelize, DataTypes) => {
  const TaskList = sequelize.define('TaskList', {
    name: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    ownerId: { 
      type: DataTypes.INTEGER, 
      allowNull: false 
    },
    isCoop: { 
      type: DataTypes.BOOLEAN, 
      defaultValue: false 
    }
  }, {
    tableName: 'TaskLists'
  });

  TaskList.associate = models => {
    TaskList.hasMany(models.Task, { foreignKey: 'listId', as: 'tasks' });
    TaskList.hasMany(models.ListMember, { foreignKey: 'listId', as: 'members' });
    TaskList.belongsTo(models.User, { foreignKey: 'ownerId', as: 'owner' });
  };

  return TaskList;
};
