import { Sequelize } from 'sequelize';
import { User } from '../models/index.js';

const migrate = async () => {
  try {
    // Ensure connection
    await User.sequelize.authenticate();
    console.log('Connected to database.');

    // Log current database/schema and preview counts
    const [dbNameRows] = await User.sequelize.query('SELECT DATABASE() AS db');
    const currentDb = dbNameRows?.[0]?.db;
    console.log('Current database:', currentDb);

    const [beforeRows] = await User.sequelize.query(
      "SELECT COUNT(*) AS cnt FROM users WHERE role IN ('manager','Manager')"
    );
    console.log("Users with role 'manager' before:", beforeRows?.[0]?.cnt ?? 0);

    // Use a transaction
    const result = await User.sequelize.transaction(async (t) => {
      // Normalize any variations of manager/Manager
      const [countLower] = await User.update(
        { role: 'superadmin' },
        { where: { role: 'manager' }, transaction: t }
      );

      const [countUpper] = await User.update(
        { role: 'superadmin' },
        { where: { role: 'Manager' }, transaction: t }
      );

      return (countLower || 0) + (countUpper || 0);
    });

    console.log(`Updated ${result} user(s) role from 'manager' to 'superadmin'.`);

    const [afterRows] = await User.sequelize.query(
      "SELECT role, COUNT(*) AS cnt FROM users GROUP BY role"
    );
    console.log('Role distribution after:', afterRows);
  } catch (e) {
    console.error('Migration error:', e);
    process.exit(1);
  } finally {
    process.exit(0);
  }
};

migrate();
