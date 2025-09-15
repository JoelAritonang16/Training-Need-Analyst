import bcrypt from 'bcrypt';
import { User } from '../models/index.js';

const seedUsers = async () => {
  try {
    // Check if users already exist
    const existingUsers = await User.findAll();
    if (existingUsers.length > 0) {
      console.log('Users already exist, skipping seeding');
      return;
    }

    // Create sample users
    const users = [
      {
        username: 'superadmin',
        password: await bcrypt.hash('admin123', 10),
        role: 'superadmin'
      },
      {
        username: 'admin1',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin'
      },
      {
        username: 'admin2',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin'
      },
      {
        username: 'user1',
        password: await bcrypt.hash('user123', 10),
        role: 'user'
      },
      {
        username: 'user2',
        password: await bcrypt.hash('user123', 10),
        role: 'user'
      },
      {
        username: 'user3',
        password: await bcrypt.hash('user123', 10),
        role: 'user'
      }
    ];

    await User.bulkCreate(users);
    console.log('Sample users created successfully');
    console.log('Login credentials:');
    console.log('SuperAdmin: superadmin / admin123');
    console.log('Admin: admin1 / admin123, admin2 / admin123');
    console.log('User: user1 / user123, user2 / user123, user3 / user123');
  } catch (error) {
    console.error('Error seeding users:', error);
  }
};

export default seedUsers;
