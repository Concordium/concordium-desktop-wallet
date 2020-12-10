module.exports = {

  development: {
    client: "sqlite3",
    connection: {
      filename: "dev.sqlite3"
    },
    useNullAsDefault: true
  },

  production: {
    client: "sqlite3",
      connection: {
      filename: "./data.sqlite3"
    },
    useNullAsDefault: true,
    migrations: {
      tableName: "knex_migrations"
    }
  }

};
