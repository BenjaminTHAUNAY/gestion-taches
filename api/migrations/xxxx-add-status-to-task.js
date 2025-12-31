module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Tasks', 'status', {
      type: Sequelize.ENUM('todo', 'doing', 'done'),
      defaultValue: 'todo'
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('Tasks', 'status');
  }
};
