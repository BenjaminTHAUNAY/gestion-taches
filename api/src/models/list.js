'use strict';

module.exports = (sequelize, DataTypes) => {
  const List = sequelize.define(
    'List',
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      ownerId: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    },
    {
      tableName: 'TaskLists',   // ✅ TABLE RÉELLE
      timestamps: true
    }
  );

  List.associate = (models) => {
    List.belongsTo(models.User, { foreignKey: 'ownerId' });
    List.hasMany(models.Task, { foreignKey: 'listId' });
    List.hasMany(models.ListMember, { foreignKey: 'listId' });
  };

  return List;
};
