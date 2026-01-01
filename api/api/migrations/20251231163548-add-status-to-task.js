'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Tasks', 'status', {
      type: Sequelize.ENUM('todo', 'doing', 'done'),
      allowNull: false,
      defaultValue: 'todo'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Tasks', 'status');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_Tasks_status";'
    );
  }
};
