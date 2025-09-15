import bcrypt from 'bcrypt';
import { User } from '../models/index.js';

const createTestUser = async () => {
  try {
    // Check if test user already exists
    const existingUser = await User.findOne({
      where: { username: 'admin' }
    });

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({ username: 'admin', password: hashedPassword, role: 'admin' });
      console.log('Admin user created');
    } else {
      console.log('Admin user already exists');
    }

    // Create additional test users
    const users = [
      {
        username: 'user1',
        password: await bcrypt.hash('user123', 10),
        role: 'user'
      },
      {
        username: 'superadmin',
        password: await bcrypt.hash('superadmin123', 10),
        role: 'superadmin'
      }
    ];

    for (const userData of users) {
      const found = await User.findOne({ where: { username: userData.username } });
      if (!found) {
        await User.create(userData);
        console.log(`User ${userData.username} created successfully`);
      } else {
        console.log(`User ${userData.username} already exists`);
      }
    }

    console.log('\nTest credentials:');
    console.log('Admin: username=admin, password=admin123');
    console.log('User: username=user1, password=user123');
    console.log('Superadmin: username=superadmin, password=superadmin123');

  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    process.exit(0);
  }
};

// Run the script
createTestUser();
