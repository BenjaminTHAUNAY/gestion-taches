'use strict';

module.exports = (sequelize, DataTypes) => {
  const Task = sequelize.define(
    'Task',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },

      listId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },

      title: {
        type: DataTypes.STRING,
        allowNull: false
      },

      done: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },

      status: {
        type: DataTypes.ENUM('todo', 'doing', 'done'),
        allowNull: false,
        defaultValue: 'todo'
      },

      dueDate: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      tableName: 'Tasks',
      timestamps: true
    }
  );

  Task.associate = (models) => {
    Task.belongsTo(models.TaskList, {
      foreignKey: 'listId',
      as: 'list',
      onDelete: 'CASCADE'
    });
  };

  return Task;
};
