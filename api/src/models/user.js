'use strict';

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false }
  }, {});

  User.associate = models => {
    User.hasMany(models.TaskList, { foreignKey: 'ownerId', as: 'ownedLists' });
    User.hasMany(models.ListMember, { foreignKey: 'userId' });
  };

  return User;
};
