const app = require('./app');

const PORT = process.env.PORT || 3000;

// Lance le serveur et reste en écoute
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
