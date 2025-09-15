import dotenv from "dotenv";

dotenv.config();

// Default database configuration
const defaultConfig = {
  username: "root",
  password: "",
  database: "spmt",
  host: "localhost",
  port: 3306,
  dialect: "mysql",
  logging: console.log,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true,
  },
};

// Environment-specific configurations
export const config = {
  development: {
    ...defaultConfig,
    username: process.env.DB_USER || defaultConfig.username,
    password: process.env.DB_PASSWORD || defaultConfig.password,
    database: process.env.DB_NAME || defaultConfig.database,
    host: process.env.DB_HOST || defaultConfig.host,
    port: process.env.DB_PORT || defaultConfig.port,
    logging: console.log,
  },
  test: {
    ...defaultConfig,
    username: process.env.DB_USER || defaultConfig.username,
    password: process.env.DB_PASSWORD || defaultConfig.password,
    database: process.env.DB_NAME || defaultConfig.database,
    host: process.env.DB_HOST || defaultConfig.host,
    port: process.env.DB_PORT || defaultConfig.port,
    logging: false,
  },
  production: {
    ...defaultConfig,
    username: process.env.DB_USER || defaultConfig.username,
    password: process.env.DB_PASSWORD || defaultConfig.password,
    database: process.env.DB_NAME || defaultConfig.database,
    host: process.env.DB_HOST || defaultConfig.host,
    port: process.env.DB_PORT || defaultConfig.port,
    logging: false,
  },
};

export default config;
