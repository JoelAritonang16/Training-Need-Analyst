import { User } from '../models/index.js';
import bcrypt from 'bcrypt';
import { Op } from 'sequelize';

const userController = {
  // Get all users with role-based filtering
  async getAllUsers(req, res) {
    try {
      const { currentUserRole } = req.query;
      
      let whereClause = {};
      
      // Role-based filtering
      if (currentUserRole === 'admin') {
        whereClause.role = 'user';
      } else if (currentUserRole === 'superadmin') {
        whereClause.role = { [Op.in]: ['user', 'admin'] };
      }

      const users = await User.findAll({
        where: whereClause,
        attributes: ['id', 'username', 'role', 'created_at']
      });

      // Transform data to include role and status
      const transformedUsers = users.map(user => ({
        id: user.id,
        username: user.username,
        email: `${user.username}@pelindo.com`,
        unit: 'Default Unit',
        role: user.role || 'user',
        status: 'active',
        createdAt: user.created_at
      }));

      res.json({
        success: true,
        users: transformedUsers
      });
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal memuat data users'
      });
    }
  },

  // Create new user
  async createUser(req, res) {
    try {
      const { username, password, role } = req.body;

      // Validate input
      if (!username || !password || !role) {
        return res.status(400).json({
          success: false,
          message: 'Username, password, dan role harus diisi'
        });
      }

      // Check if username already exists
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Username sudah digunakan'
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await User.create({
        username,
        password: hashedPassword,
        role
      });

      res.json({
        success: true,
        message: 'User berhasil dibuat',
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          status: 'Active'
        }
      });
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal membuat user'
      });
    }
  },

  // Update user
  async updateUser(req, res) {
    try {
      const userId = req.params.id;
      const { username, role } = req.body;

      // Validate input
      if (!username || !role) {
        return res.status(400).json({
          success: false,
          message: 'Username dan role harus diisi'
        });
      }

      // Check if user exists
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User tidak ditemukan'
        });
      }

      // Check if username already exists (excluding current user)
      const existingUser = await User.findOne({ 
        where: { 
          username,
          id: { [Op.ne]: userId }
        }
      });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Username sudah digunakan'
        });
      }

      // Update user
      await user.update({
        username,
        role
      });

      res.json({
        success: true,
        message: 'User berhasil diupdate',
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          status: 'Active'
        }
      });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengupdate user'
      });
    }
  },

  // Delete user
  async deleteUser(req, res) {
    try {
      const userId = req.params.id;

      // Check if user exists
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User tidak ditemukan'
        });
      }

      // Delete user
      await user.destroy();

      res.json({
        success: true,
        message: 'User berhasil dihapus'
      });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal menghapus user'
      });
    }
  },

  // Get users by role (for role-based access)
  async getUsersByRole(req, res) {
    try {
      const { role } = req.params;
      const { currentUserRole } = req.body;

      // Role-based access control
      let allowedRoles = [];
      if (currentUserRole === 'superadmin') {
        allowedRoles = ['user', 'admin'];
      } else if (currentUserRole === 'admin') {
        allowedRoles = ['user'];
      } else {
        return res.status(403).json({
          success: false,
          message: 'Akses ditolak'
        });
      }

      if (!allowedRoles.includes(role)) {
        return res.status(403).json({
          success: false,
          message: 'Tidak memiliki akses untuk role ini'
        });
      }

      const users = await User.findAll({
        where: { role },
        attributes: ['id', 'username', 'role', 'created_at']
      });

      const transformedUsers = users.map(user => ({
        id: user.id,
        username: user.username,
        role: user.role,
        status: 'active',
        createdAt: user.created_at
      }));

      res.json({
        success: true,
        users: transformedUsers
      });
    } catch (error) {
      console.error('Get users by role error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal memuat data users'
      });
    }
  },

  // Create user with role validation
  async createUserWithRoleValidation(req, res) {
    try {
      const { username, password, role, email, unit, currentUserRole } = req.body;

      // Role-based access control
      if (currentUserRole === 'admin' && role !== 'user') {
        return res.status(403).json({
          success: false,
          message: 'Admin hanya dapat membuat user dengan role "user"'
        });
      }

      if (currentUserRole === 'superadmin' && !['user', 'admin'].includes(role)) {
        return res.status(403).json({
          success: false,
          message: 'Role tidak valid'
        });
      }

      // Validate input
      if (!username || !password || !role) {
        return res.status(400).json({
          success: false,
          message: 'Username, password, dan role harus diisi'
        });
      }

      // Check if username already exists
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Username sudah digunakan'
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await User.create({
        username,
        password: hashedPassword,
        role
      });

      res.json({
        success: true,
        message: 'User berhasil dibuat',
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          email: email || `${username}@pelindo.com`,
          unit: unit || 'Default Unit',
          status: 'active',
          createdAt: user.created_at
        }
      });
    } catch (error) {
      console.error('Create user with role validation error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal membuat user'
      });
    }
  },

  // Update user with role validation
  async updateUserWithRoleValidation(req, res) {
    try {
      const userId = req.params.id;
      const { username, role, email, unit, currentUserRole } = req.body;

      // Check if user exists
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User tidak ditemukan'
        });
      }

      // Role-based access control
      if (currentUserRole === 'admin') {
        if (user.role !== 'user' || role !== 'user') {
          return res.status(403).json({
            success: false,
            message: 'Admin hanya dapat mengedit user dengan role "user"'
          });
        }
      }

      if (currentUserRole === 'superadmin') {
        if (!['user', 'admin'].includes(user.role) || !['user', 'admin'].includes(role)) {
          return res.status(403).json({
            success: false,
            message: 'SuperAdmin hanya dapat mengedit user dan admin'
          });
        }
      }

      // Validate input
      if (!username || !role) {
        return res.status(400).json({
          success: false,
          message: 'Username dan role harus diisi'
        });
      }

      // Check if username already exists (excluding current user)
      const existingUser = await User.findOne({ 
        where: { 
          username,
          id: { [Op.ne]: userId }
        }
      });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Username sudah digunakan'
        });
      }

      // Update user
      await user.update({
        username,
        role
      });

      res.json({
        success: true,
        message: 'User berhasil diupdate',
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          email: email || `${username}@pelindo.com`,
          unit: unit || 'Default Unit',
          status: 'active',
          createdAt: user.created_at
        }
      });
    } catch (error) {
      console.error('Update user with role validation error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengupdate user'
      });
    }
  },

  // Delete user with role validation
  async deleteUserWithRoleValidation(req, res) {
    try {
      const userId = req.params.id;
      const { currentUserRole } = req.body;

      // Check if user exists
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User tidak ditemukan'
        });
      }

      // Role-based access control
      if (currentUserRole === 'admin' && user.role !== 'user') {
        return res.status(403).json({
          success: false,
          message: 'Admin hanya dapat menghapus user dengan role "user"'
        });
      }

      if (currentUserRole === 'superadmin' && !['user', 'admin'].includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: 'SuperAdmin hanya dapat menghapus user dan admin'
        });
      }

      // Delete user
      await user.destroy();

      res.json({
        success: true,
        message: 'User berhasil dihapus'
      });
    } catch (error) {
      console.error('Delete user with role validation error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal menghapus user'
      });
    }
  }
};

export default userController;
