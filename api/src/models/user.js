'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // Exemple : un utilisateur peut avoir plusieurs listes
      // User.hasMany(models.TaskList, { foreignKey: 'ownerId' });
      // User.hasMany(models.ListMember, { foreignKey: 'userId' });
    }
  }

  User.init({
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'User'
  });

  return User;
};
