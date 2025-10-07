import { User, Divisi, Branch, AnakPerusahaan } from '../models/index.js';
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
        attributes: ['id', 'username', 'role', 'divisiId', 'branchId', 'anakPerusahaanId', 'created_at'],
        include: [
          {
            model: Divisi,
            as: 'divisi',
            attributes: ['id', 'nama']
          },
          {
            model: Branch,
            as: 'branch',
            attributes: ['id', 'nama']
          },
          {
            model: AnakPerusahaan,
            as: 'anakPerusahaan',
            attributes: ['id', 'nama']
          }
        ]
      });

      // Transform data to include role and status
      const transformedUsers = users.map(user => {
        // Determine unit based on role
        let unit = 'Belum dipilih';
        if (user.role === 'user') {
          unit = user.divisi?.nama || 'Belum dipilih';
        } else if (user.role === 'admin') {
          unit = user.anakPerusahaan?.nama || 'Belum dipilih';
        }

        return {
          id: user.id,
          username: user.username,
          email: `${user.username}@pelindo.com`,
          unit: unit,
          divisi: user.divisi,
          branch: user.branch,
          anakPerusahaan: user.anakPerusahaan,
          divisiId: user.divisiId,
          branchId: user.branchId,
          anakPerusahaanId: user.anakPerusahaanId,
          role: user.role || 'user',
          status: 'active',
          createdAt: user.created_at
        };
      });

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
      const { username, password, role, divisiId, branchId, anakPerusahaanId } = req.body;

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

      // Create user with role-based fields
      const userData = {
        username,
        password: hashedPassword,
        role,
        branchId: branchId || null
      };

      // Add role-specific fields
      if (role === 'user') {
        userData.divisiId = divisiId || null;
      } else if (role === 'admin') {
        userData.anakPerusahaanId = anakPerusahaanId || null;
      }

      const user = await User.create(userData);

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
      const { username, role, divisiId, branchId } = req.body;

      console.log('=== UPDATE USER (ORIGINAL METHOD) ===');
      console.log('User ID:', userId);
      console.log('Request body:', req.body);
      console.log('Divisi ID:', divisiId);
      console.log('Branch ID:', branchId);

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
      const updatedUser = await user.update({
        username,
        role,
        divisiId: divisiId || null,
        branchId: branchId || null
      });
      
      console.log('User updated successfully (original method)');
      console.log('Updated divisi ID:', updatedUser.divisiId);
      console.log('Updated branch ID:', updatedUser.branchId);

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
      const { username, password, role, email, unit, currentUserRole, divisiId, branchId, anakPerusahaanId } = req.body;

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

      // Create user with role-based fields
      const userData = {
        username,
        password: hashedPassword,
        role
      };

      // Add role-specific fields
      if (role === 'user') {
        userData.divisiId = divisiId || null;
        userData.branchId = branchId || null;
      } else if (role === 'admin') {
        userData.anakPerusahaanId = anakPerusahaanId || null;
        // Admin doesn't need branchId as it's handled through anak perusahaan
      }

      const user = await User.create(userData);

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
      const { username, role, email, unit, currentUserRole, divisiId, branchId, anakPerusahaanId } = req.body;
      
      console.log('=== UPDATE USER WITH ROLE VALIDATION ===');
      console.log('User ID:', userId);
      console.log('Request body:', req.body);
      console.log('Divisi ID:', divisiId);
      console.log('Branch ID:', branchId);
      console.log('Anak Perusahaan ID:', anakPerusahaanId);

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

      // Update user with role-based fields
      const updateData = {
        username,
        role
      };

      // Add role-specific fields
      if (role === 'user') {
        updateData.divisiId = divisiId || null;
        updateData.branchId = branchId || null;
        updateData.anakPerusahaanId = null; // Clear anak perusahaan for user role
      } else if (role === 'admin') {
        updateData.anakPerusahaanId = anakPerusahaanId || null;
        updateData.divisiId = null; // Clear divisi for admin role
        // Admin doesn't need branchId as it's handled through anak perusahaan
      }

      const updatedUser = await user.update(updateData);
      
      console.log('User updated successfully');
      console.log('Updated divisi ID:', updatedUser.divisiId);
      console.log('Updated branch ID:', updatedUser.branchId);
      console.log('Updated anak perusahaan ID:', updatedUser.anakPerusahaanId);

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
  },

  // Update own profile
  async updateOwnProfile(req, res) {
    try {
      console.log('=== UPDATE OWN PROFILE START ===');
      console.log('req.user:', req.user);
      
      const userId = req.user.id; // From auth middleware
      const { username, fullName, email, phone, unit } = req.body;

      console.log('User ID:', userId);
      console.log('Request body:', req.body);
      console.log('Username from body:', username);
      console.log('FullName from body:', fullName);
      console.log('Email from body:', email);
      console.log('Phone from body:', phone);
      console.log('Unit from body:', unit);

      // Check if user exists
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User tidak ditemukan'
        });
      }

      // Check if new username already exists (if username is being changed)
      if (username && username !== user.username) {
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: 'Username sudah digunakan oleh user lain'
          });
        }
      }

      // Update user profile fields (ALL fields can be updated)
      const updateData = {};
      if (username !== undefined) updateData.username = username;
      if (fullName !== undefined) updateData.fullName = fullName;
      if (email !== undefined) updateData.email = email;
      if (phone !== undefined) updateData.phone = phone;
      if (unit !== undefined) updateData.unit = unit;

      const updatedUser = await user.update(updateData);
      
      console.log('Profile updated successfully');
      console.log('Updated user:', updatedUser.toJSON());

      res.json({
        success: true,
        message: 'Profil berhasil diperbarui',
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          fullName: updatedUser.fullName,
          email: updatedUser.email,
          phone: updatedUser.phone,
          unit: updatedUser.unit,
          role: updatedUser.role
        }
      });
    } catch (error) {
      console.error('Update own profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal memperbarui profil'
      });
    }
  }
};

export default userController;
