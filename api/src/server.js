require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors');

// Middleware JSON
app.use(express.json());
app.use(cors()); // autorise toutes les origines pour tester

// ROUTES
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/task');
const listRoutes = require('./routes/lists');

app.use('/auth', authRoutes);
app.use('/tasks', taskRoutes);
app.use('/lists', listRoutes);

// Route test
app.get('/', (req, res) => {
  res.json({ message: 'API Task Manager is running ✅' });
});

// Lancement serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});



