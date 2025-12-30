'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Users
    await queryInterface.createTable('Users', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      email: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });

    // TaskLists
    await queryInterface.createTable('TaskLists', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      name: { type: Sequelize.STRING, allowNull: false },
      ownerId: {
        type: Sequelize.INTEGER,
        references: { model: 'Users', key: 'id' },
        onDelete: 'CASCADE',
        allowNull: false
      },
      isCoop: { type: Sequelize.BOOLEAN, defaultValue: false },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });

    // Tasks
    await queryInterface.createTable('Tasks', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      listId: {
        type: Sequelize.INTEGER,
        references: { model: 'TaskLists', key: 'id' },
        onDelete: 'CASCADE',
        allowNull: false
      },
      title: { type: Sequelize.STRING, allowNull: false },
      done: { type: Sequelize.BOOLEAN, defaultValue: false },
      dueDate: { type: Sequelize.DATE, allowNull: true },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });

    // ListMembers
    await queryInterface.createTable('ListMembers', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      listId: {
        type: Sequelize.INTEGER,
        references: { model: 'TaskLists', key: 'id' },
        onDelete: 'CASCADE',
        allowNull: false
      },
      userId: {
        type: Sequelize.INTEGER,
        references: { model: 'Users', key: 'id' },
        onDelete: 'CASCADE',
        allowNull: false
      },
      role: {
        type: Sequelize.ENUM('owner','editor','reader'),
        allowNull: false
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });

    // contrainte unique listId + userId
    await queryInterface.addConstraint('ListMembers', {
      fields: ['listId', 'userId'],
      type: 'unique',
      name: 'unique_list_user'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ListMembers');
    await queryInterface.dropTable('Tasks');
    await queryInterface.dropTable('TaskLists');
    await queryInterface.dropTable('Users');
  }
};
