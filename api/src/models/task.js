'use strict';

module.exports = (sequelize, DataTypes) => {
  const Task = sequelize.define('Task', {
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
    },
    listId: { 
      type: DataTypes.INTEGER, 
      allowNull: false 
    }
  }, {
    tableName: 'Tasks'
  });

  Task.associate = models => {
    Task.belongsTo(models.TaskList, { 
      foreignKey: 'listId',
      as: 'taskList'
    });
  };

  return Task;
};
