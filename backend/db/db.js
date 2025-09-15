import { Sequelize } from "sequelize";
import config from "../config/database.js";

const dbConfig = config.development;

console.log("Database configuration:", {
  host: dbConfig.host,
  user: dbConfig.username,
  database: dbConfig.database,
  dialect: dbConfig.dialect,
});

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

// Test connection
sequelize
  .authenticate()
  .then(() => {
    console.log("Database connection established successfully.");
  })
  .catch((err) => {
    console.error("Database error:", err);
  });

export default sequelize;
