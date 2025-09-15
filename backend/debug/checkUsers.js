import { User } from '../models/index.js';
import bcrypt from 'bcrypt';

const checkUsers = async () => {
  try {
    console.log('Checking users in database...');
    
    const users = await User.findAll({
      attributes: ['id', 'username', 'password', 'role', 'created_at']
    });
    
    console.log(`Found ${users.length} users:`);
    
    for (const user of users) {
      console.log(`- ID: ${user.id}, Username: ${user.username}, Role: ${user.role}`);
      
      // Test password for superadmin
      if (user.username === 'superadmin') {
        const isValid = await bcrypt.compare('admin123', user.password);
        console.log(`  Password test for superadmin: ${isValid ? 'VALID' : 'INVALID'}`);
      }
    }
    
    // If no users found, create them
    if (users.length === 0) {
      console.log('No users found, creating sample users...');
      
      const sampleUsers = [
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
          username: 'user1',
          password: await bcrypt.hash('user123', 10),
          role: 'user'
        }
      ];
      
      await User.bulkCreate(sampleUsers);
      console.log('Sample users created successfully');
    }
    
  } catch (error) {
    console.error('Error checking users:', error);
  }
  
  process.exit(0);
};

checkUsers();
