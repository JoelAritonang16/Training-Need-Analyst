import { User, Divisi, Branch, AnakPerusahaan } from '../models/index.js';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';
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
        
        // Get current admin's branchId - ALWAYS query database to ensure accuracy
        let currentAdminBranchId = null;
        let currentAdminId = null;
        
        // Get admin ID from session, req.user, or token
        if (req.session && req.session.user && req.session.user.id) {
          currentAdminId = req.session.user.id;
        } else if (req.user && req.user.id) {
          currentAdminId = req.user.id;
        } else {
          // Try to get from token
          const authHeader = req.headers.authorization;
          if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            if (token.startsWith('token_')) {
              const parts = token.split('_');
              if (parts.length >= 2) {
                currentAdminId = parts[1];
              }
            }
          }
        }
        
        // ALWAYS query database to get admin's branchId (most reliable method)
        if (currentAdminId) {
          const currentAdmin = await User.findByPk(currentAdminId, {
            attributes: ['id', 'username', 'branchId']
          });
          
          if (currentAdmin) {
            if (currentAdmin.branchId) {
              currentAdminBranchId = currentAdmin.branchId;
            }
          }
        }
        
        // CRITICAL: Always filter by admin's branchId - if not found, return empty
        if (currentAdminBranchId) {
          // Ensure branchId is a number
          whereClause.branchId = Number(currentAdminBranchId);
        } else {
          // Return empty list if admin branchId is not found
          return res.json({
            success: true,
            users: []
          });
        }
      } else if (currentUserRole === 'superadmin') {
        whereClause.role = { [Op.in]: ['user', 'admin'] };
        // Superadmin can see all users, no branch filtering
      }
      
      // If admin, ensure branchId filter is set
      if (currentUserRole === 'admin' && !whereClause.branchId) {
        return res.json({
          success: true,
          users: []
        });
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
      
      // Additional validation: Double-check if admin, filter out any users that don't match branchId
      if (currentUserRole === 'admin' && whereClause.branchId) {
        // Ensure both are numbers for comparison
        const expectedBranchId = Number(whereClause.branchId);
        const filteredUsers = users.filter(u => {
          const userBranchId = Number(u.branchId);
          return userBranchId === expectedBranchId;
        });
        
        if (filteredUsers.length !== users.length) {
          // Use filtered list
          const transformedUsers = filteredUsers.map(user => {
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

          return res.json({
            success: true,
            users: transformedUsers
          });
        }
      }

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

      // Role-specific required fields to prevent DB constraint errors
      if (role === 'user') {
        if (!branchId) {
          return res.status(400).json({ success: false, message: 'Branch wajib dipilih untuk role user' });
        }
        // Divisi optional by design, but validate numeric if provided
        if (req.body.divisiId && divisiId === null) {
          return res.status(400).json({ success: false, message: 'Divisi tidak valid' });
        }
      }
      if (role === 'admin') {
        if (!anakPerusahaanId) {
          return res.status(400).json({ success: false, message: 'Anak Perusahaan wajib dipilih untuk role admin' });
        }
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
      // Coerce possible string IDs to integers or null
      const coerceId = (v) => {
        if (v === undefined || v === null || v === '') return null;
        const n = Number(v);
        return Number.isNaN(n) ? null : n;
      };
      let divisiId = coerceId(req.body.divisiId);
      let branchId = coerceId(req.body.branchId);
      let anakPerusahaanId = coerceId(req.body.anakPerusahaanId);

      // Auto-assign branchId from admin user if currentUserRole is admin
      if (currentUserRole === 'admin') {
        // Get current admin user from session/token
        let currentAdminUser = null;
        
        // Try session first
        if (req.session && req.session.user) {
          // If branchId is already in session, use it directly
          if (req.session.user.branchId) {
            branchId = req.session.user.branchId;
          } else {
            // Fallback: fetch from database
            currentAdminUser = await User.findByPk(req.session.user.id, {
              attributes: ['id', 'branchId', 'anakPerusahaanId']
            });
          }
        } else {
          // Try token-based auth
          const authHeader = req.headers.authorization;
          if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            if (token.startsWith('token_')) {
              const parts = token.split('_');
              if (parts.length >= 2) {
                const userId = parts[1];
                currentAdminUser = await User.findByPk(userId, {
                  attributes: ['id', 'branchId', 'anakPerusahaanId']
                });
              }
            }
          }
        }
        
        if (currentAdminUser && currentAdminUser.branchId) {
          branchId = currentAdminUser.branchId; // Auto-assign admin's branch
        }
      }

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
        userData.divisiId = divisiId;
        userData.branchId = branchId;
        userData.anakPerusahaanId = null;
      } else if (role === 'admin') {
        userData.anakPerusahaanId = anakPerusahaanId;
        userData.divisiId = null;
        userData.branchId = branchId; // admin perlu branch assignment
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
      // Return more explicit error info where safe
      const message = error?.message?.includes('foreign key constraint')
        ? 'Data referensi tidak valid (Divisi/Branch/Anak Perusahaan)'
        : (error?.message || 'Gagal membuat user');
      res.status(500).json({ success: false, message });
    }
  },

  // Update user with role validation
  async updateUserWithRoleValidation(req, res) {
    try {
      const userId = req.params.id;
      const { username, role, email, unit, currentUserRole, divisiId, branchId, anakPerusahaanId } = req.body;

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
        updateData.branchId = branchId || null; // Admin perlu branch assignment
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
      
      const userId = req.user?.id; // From auth middleware
      const { username, fullName, email, phone, unit } = req.body;
      
      // Validasi user ID
      if (!userId) {
        console.error('No user ID found in request');
        return res.status(401).json({
          success: false,
          message: 'Tidak ada informasi pengguna yang valid'
        });
      }

      // Validasi input
      if (!username) {
        return res.status(400).json({
          success: false,
          message: 'Username tidak boleh kosong'
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

      // Check if new username already exists (if username is being changed)
      if (username && username !== user.username) {
        const existingUser = await User.findOne({ 
          where: { 
            username,
            id: { [Op.ne]: userId } // Exclude current user
          } 
        });
        
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: 'Username sudah digunakan oleh user lain'
          });
        }
      }

      // Update user profile fields
      const updateData = {
        username: username || user.username,
        fullName: fullName !== undefined ? fullName : user.fullName,
        email: email !== undefined ? email : user.email,
        phone: phone !== undefined ? phone : user.phone,
        unit: unit !== undefined ? unit : user.unit
      };

      try {
        // Update data user
        await user.update(updateData);
        
        // Ambil data terbaru dari database
        const updatedUser = await User.findByPk(userId);

        return res.json({
          success: true,
          message: 'Profil berhasil diperbarui',
          user: {
            id: updatedUser.id,
            username: updatedUser.username,
            fullName: updatedUser.fullName,
            email: updatedUser.email,
            phone: updatedUser.phone,
            unit: updatedUser.unit,
            role: updatedUser.role,
            profilePhoto: updatedUser.profilePhoto
          }
        });
      } catch (updateError) {
        console.error('Error saat update user:', updateError);
        
        // Handle validation errors
        if (updateError.name === 'SequelizeValidationError' || updateError.name === 'SequelizeUniqueConstraintError') {
          const messages = updateError.errors.map(err => err.message);
          return res.status(400).json({
            success: false,
            message: 'Validasi gagal',
            errors: messages
          });
        }
        
        throw updateError; // Re-throw untuk ditangkap oleh catch terluar
      }
    } catch (error) {
      console.error('Update own profile error:', error);
      
      // Handle specific errors
      let errorMessage = 'Gagal memperbarui profil';
      let statusCode = 500;
      
      if (error.name === 'SequelizeDatabaseError') {
        errorMessage = 'Terjadi kesalahan pada database';
      } else if (error.name === 'SequelizeConnectionError') {
        errorMessage = 'Tidak dapat terhubung ke database';
        statusCode = 503; // Service Unavailable
      }
      
      res.status(statusCode).json({
        success: false,
        message: `${errorMessage}: ${error.message || 'Tidak ada detail tambahan'}`
      });
    }
  },

  // Upload profile photo
  async uploadProfilePhoto(req, res) {
    try {
      
      const userId = req.user.id;
      
      if (!req.file) {
        console.log('No file uploaded');
        return res.status(400).json({
          success: false,
          message: 'Tidak ada file yang diupload'
        });
      }

      // Get user
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User tidak ditemukan'
        });
      }

      // Delete old photo if exists
      if (user.profilePhoto) {
        try {
          const oldPhotoPath = path.join(__dirname, '..', user.profilePhoto);
          if (fs.existsSync(oldPhotoPath)) {
            fs.unlinkSync(oldPhotoPath);
          }
        } catch (deleteError) {
          // Continue anyway if deletion fails
        }
      }

      // Save new photo path
      const photoPath = `uploads/profiles/${req.file.filename}`;
      
      try {
        await user.update({ profilePhoto: photoPath });
      } catch (dbError) {
        console.error('Database update error:', dbError);
        throw dbError;
      }

      res.json({
        success: true,
        message: 'Foto profil berhasil diupload',
        profilePhoto: photoPath,
        photoUrl: `http://localhost:5000/${photoPath}`
      });
    } catch (error) {
      console.error('Upload profile photo error:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({
        success: false,
        message: 'Gagal mengupload foto profil: ' + error.message
      });
    }
  }
};

export default userController;
