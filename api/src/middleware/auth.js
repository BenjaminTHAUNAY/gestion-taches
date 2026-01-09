const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Middleware d'authentification JWT
 * Vérifie la présence et la validité du token JWT dans l'en-tête Authorization
 * Ajoute req.userId à la requête si le token est valide
 */
module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token manquant' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token invalide' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
    req.userId = decoded.id;
    next();
  } catch (err) {
    console.error("AUTH ERROR:", err);
    return res.status(401).json({ error: 'Token invalide ou expiré' });
  }
};
