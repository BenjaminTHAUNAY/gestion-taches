status: {
  type: DataTypes.ENUM('todo', 'doing', 'done'),
  allowNull: false,
  defaultValue: 'todo'
},
