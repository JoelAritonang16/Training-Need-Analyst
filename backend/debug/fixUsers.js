import { User } from '../models/index.js';
import bcrypt from 'bcrypt';

const fixUsers = async () => {
  try {
    console.log('Fixing user credentials...');
    
    // Update superadmin password
    const superadmin = await User.findOne({ where: { username: 'superadmin' } });
    if (superadmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await superadmin.update({ password: hashedPassword });
      console.log('Updated superadmin password');
    }
    
    // Update admin password
    const admin = await User.findOne({ where: { username: 'admin' } });
    if (admin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await admin.update({ password: hashedPassword });
      console.log('Updated admin password');
    }
    
    // Update user1 password
    const user1 = await User.findOne({ where: { username: 'user1' } });
    if (user1) {
      const hashedPassword = await bcrypt.hash('user123', 10);
      await user1.update({ password: hashedPassword });
      console.log('Updated user1 password');
    }
    
    // Update manager to have correct password
    const manager = await User.findOne({ where: { username: 'manager' } });
    if (manager) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await manager.update({ password: hashedPassword });
      console.log('Updated manager password');
    }
    
    // Verify passwords
    console.log('\nVerifying passwords:');
    const users = await User.findAll();
    
    for (const user of users) {
      let testPassword = '';
      if (user.role === 'user') testPassword = 'user123';
      else testPassword = 'admin123';
      
      const isValid = await bcrypt.compare(testPassword, user.password);
      console.log(`${user.username} (${user.role}): ${isValid ? 'VALID' : 'INVALID'}`);
    }
    
  } catch (error) {
    console.error('Error fixing users:', error);
  }
  
  process.exit(0);
};

fixUsers();
