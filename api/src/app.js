const express = require('express');
const app = express();
require('dotenv').config();

// Middleware pour parser JSON
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

app.use('/auth', authRoutes);
app.use('/user', userRoutes);

module.exports = app;

const taskListRoutes = require('./routes/tasklist');

app.use('/lists', taskListRoutes);

const taskRoutes = require('./routes/task');
app.use('/tasks', taskRoutes);
