Object.values(db.models).forEach(model => {
  if (model.associate) {
    model.associate(db.models);
  }
});
