'use strict';

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const taskRoutes = require('./routes/task');
const listRoutes = require('./routes/tasklist');

const app = express();

// Middlewares globaux
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/auth', authRoutes);       // inscription / login
app.use('/users', userRoutes);      // profil utilisateur
app.use('/tasks', taskRoutes);      // CRUD tâches + conflits
app.use('/lists', listRoutes);      // CRUD listes + gestion membres

// Route racine pour tester le serveur
app.get('/', (req, res) => {
  res.json({ message: 'API Task Manager is running 🚀' });
});

// Middleware 404
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found' });
});

// Middleware gestion erreurs
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

module.exports = app;
