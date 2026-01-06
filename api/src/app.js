const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', require('./routes/auth'));
app.use('/tasks', require('./routes/task'));

app.get('/', (req, res) => {
  res.send('API OK');
});

module.exports = app;
