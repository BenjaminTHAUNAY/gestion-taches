'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ListMembers', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      listId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'TaskLists', key: 'id' },
        onDelete: 'CASCADE'
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onDelete: 'CASCADE'
      },
      role: {
        type: Sequelize.ENUM('owner', 'editor', 'reader'),
        defaultValue: 'reader'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    await queryInterface.addConstraint('ListMembers', {
      fields: ['listId', 'userId'],
      type: 'unique',
      name: 'unique_list_user'
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('ListMembers');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_ListMembers_role";');
  }
};
