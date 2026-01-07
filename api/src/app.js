const express = require('express');
const cors = require('cors');
const listRoutes = require('./routes/list');
const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', require('./routes/auth'));
app.use('/tasks', require('./routes/task'));
app.use('/lists', listRoutes);

app.get('/', (req, res) => {
  res.send('API OK');
});

module.exports = app;
