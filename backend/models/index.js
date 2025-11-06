import { Sequelize } from "sequelize";
import sequelize from "../db/db.js";
import UserModel from "./User.js";
import TrainingProposalModel from "./TrainingProposal.js";
import TrainingProposalItemModel from "./TrainingProposalItem.js";
import DivisiModel from "./Divisi.js";
import BranchModel from "./Branch.js";
import AnakPerusahaanModel from "./AnakPerusahaan.js";
import AnakPerusahaanBranchModel from "./AnakPerusahaanBranch.js";
import DraftTNA2026Model from "./DraftTNA2026.js";
import TempatDiklatRealisasiModel from "./TempatDiklatRealisasi.js";

const db = {};

// Initialize models
db.User = UserModel(sequelize, Sequelize);
db.TrainingProposal = TrainingProposalModel(sequelize, Sequelize);
db.TrainingProposalItem = TrainingProposalItemModel(sequelize, Sequelize);
db.Divisi = DivisiModel(sequelize, Sequelize);
db.Branch = BranchModel(sequelize, Sequelize);
db.AnakPerusahaan = AnakPerusahaanModel(sequelize, Sequelize);
db.AnakPerusahaanBranch = AnakPerusahaanBranchModel(sequelize, Sequelize);
db.DraftTNA2026 = DraftTNA2026Model(sequelize, Sequelize);
db.TempatDiklatRealisasi = TempatDiklatRealisasiModel(sequelize, Sequelize);

// Define associations
db.User.belongsTo(db.Divisi, { foreignKey: 'divisiId', as: 'divisi' });
db.User.belongsTo(db.Branch, { foreignKey: 'branchId', as: 'branch' });
db.User.belongsTo(db.AnakPerusahaan, { foreignKey: 'anakPerusahaanId', as: 'anakPerusahaan' });
db.Divisi.hasMany(db.User, { foreignKey: 'divisiId', as: 'users' });
db.Branch.hasMany(db.User, { foreignKey: 'branchId', as: 'users' });
db.AnakPerusahaan.hasMany(db.User, { foreignKey: 'anakPerusahaanId', as: 'users' });

// Proposal -> Items
db.TrainingProposal.hasMany(db.TrainingProposalItem, {
  foreignKey: 'proposalId',
  as: 'items',
  onDelete: 'CASCADE'
});
db.TrainingProposalItem.belongsTo(db.TrainingProposal, {
  foreignKey: 'proposalId',
  as: 'proposal'
});

// Proposal -> Branch (proposal belongs to branch)
db.TrainingProposal.belongsTo(db.Branch, { foreignKey: 'branchId', as: 'branch' });
db.Branch.hasMany(db.TrainingProposal, { foreignKey: 'branchId', as: 'proposals' });

// Proposal -> User (proposal belongs to user)
db.TrainingProposal.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });
db.User.hasMany(db.TrainingProposal, { foreignKey: 'userId', as: 'proposals' });

// DraftTNA2026 associations
db.DraftTNA2026.belongsTo(db.Branch, { foreignKey: 'branchId', as: 'branch' });
db.Branch.hasMany(db.DraftTNA2026, { foreignKey: 'branchId', as: 'draftTNA2026' });
db.DraftTNA2026.belongsTo(db.Divisi, { foreignKey: 'divisiId', as: 'divisi' });
db.Divisi.hasMany(db.DraftTNA2026, { foreignKey: 'divisiId', as: 'draftTNA2026' });
db.DraftTNA2026.belongsTo(db.User, { foreignKey: 'createdBy', as: 'creator' });
db.DraftTNA2026.belongsTo(db.User, { foreignKey: 'updatedBy', as: 'updater' });

// TempatDiklatRealisasi associations
db.TempatDiklatRealisasi.belongsTo(db.Branch, { foreignKey: 'branchId', as: 'branch' });
db.Branch.hasMany(db.TempatDiklatRealisasi, { foreignKey: 'branchId', as: 'tempatDiklatRealisasi' });
db.TempatDiklatRealisasi.belongsTo(db.User, { foreignKey: 'createdBy', as: 'creator' });

// Many-to-many associations for AnakPerusahaan and Branch
db.AnakPerusahaan.belongsToMany(db.Branch, { 
  through: db.AnakPerusahaanBranch, 
  foreignKey: 'anakPerusahaanId', 
  otherKey: 'branchId',
  as: 'branches' 
});
db.Branch.belongsToMany(db.AnakPerusahaan, { 
  through: db.AnakPerusahaanBranch, 
  foreignKey: 'branchId', 
  otherKey: 'anakPerusahaanId',
  as: 'anakPerusahaan' 
});

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
export const TrainingProposalItem = db.TrainingProposalItem;
export const Divisi = db.Divisi;
export const Branch = db.Branch;
export const AnakPerusahaan = db.AnakPerusahaan;
export const AnakPerusahaanBranch = db.AnakPerusahaanBranch;
export const DraftTNA2026 = db.DraftTNA2026;
export const TempatDiklatRealisasi = db.TempatDiklatRealisasi;

export default db;
