module.exports = {
  development: {
    username: "postgres",       // correspond au POSTGRES_USER dans docker-compose
    password: "password",       // correspond au POSTGRES_PASSWORD dans docker-compose
    database: "gestion_taches_dev", // correspond au POSTGRES_DB
    host: "localhost",          // "localhost" si tu accèdes depuis Windows
    dialect: "postgres",
    logging: console.log        // permet de voir les requêtes SQL dans la console
  },
  test: {
    username: "postgres",
    password: "password",
    database: "gestion_taches_test",
    host: "localhost",
    dialect: "postgres",
    logging: false
  },
  production: {
    username: "postgres",
    password: "password",
    database: "gestion_taches_prod",
    host: "localhost",
    dialect: "postgres",
    logging: false
  }
};
