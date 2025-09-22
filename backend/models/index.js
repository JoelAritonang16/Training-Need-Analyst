import { Sequelize } from "sequelize";
import sequelize from "../db/db.js";
import UserModel from "./User.js";
import TrainingProposalModel from "./TrainingProposal.js";

const db = {};

// Initialize models
db.User = UserModel(sequelize, Sequelize);
db.TrainingProposal = TrainingProposalModel(sequelize, Sequelize);
// Add sequelize instance
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Sync database
const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log("Database synced successfully");
  } catch (error) {
    console.error("Database sync error:", error);
  }
};

// Initialize database
const initDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection established successfully.");
    await syncDatabase();
  } catch (error) {
    console.error("Database initialization error:", error);
  }
};

db.initDatabase = initDatabase;

// Export individual models for easier importing
export const User = db.User;
export const TrainingProposal = db.TrainingProposal;

export default db;
