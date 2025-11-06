import mysql from 'mysql2/promise';
import config from '../config/database.js';

const setupDatabase = async () => {
  try {
    // Connect to MySQL server (without specifying database)
    const connection = await mysql.createConnection({
      host: config.development.host,
      port: config.development.port,
      user: config.development.username,
      password: config.development.password
    });

    console.log('Connected to MySQL server');

    // Create database if not exists
    const dbName = config.development.database;
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`Database '${dbName}' created or already exists`);

    // Use the database
    await connection.execute(`USE \`${dbName}\``);
    console.log(`Using database '${dbName}'`);

    // Create users table if not exists
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_username (username)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;

    await connection.execute(createUsersTable);
    console.log('Users table created or already exists');

    // Close connection
    await connection.end();
    console.log('Database setup completed successfully');

    return true;
  } catch (error) {
    console.error('Database setup error:', error);
    return false;
  }
};

// Run setup if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupDatabase().then(success => {
    if (success) {
      console.log('\nDatabase is ready!');
      console.log('You can now run: npm run create-test-user');
    } else {
      console.log('\nDatabase setup failed');
      process.exit(1);
    }
  });
}

export default setupDatabase;
