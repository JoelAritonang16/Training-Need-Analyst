import bcrypt from 'bcrypt';
import axios from 'axios';
import { User, Branch, Divisi, AnakPerusahaan } from '../models/index.js';

const authController = {
  // Login user
  async login(req, res) {
    try {
      const { username, password, recaptchaToken } = req.body;
      
      // Validate input
      if (!username || !password) {
        return res.status(400).json({ 
          success: false, 
          message: "Username dan password harus diisi" 
        });
      }

      // Verify reCAPTCHA token
      if (!recaptchaToken) {
        return res.status(400).json({ 
          success: false, 
          message: "Harap verifikasi bahwa Anda bukan robot" 
        });
      }

      // Verify reCAPTCHA with Google
      const recaptchaSecretKey = process.env.RECAPTCHA_SECRET_KEY;
      if (!recaptchaSecretKey) {
        console.error('RECAPTCHA_SECRET_KEY is not set in environment variables');
        return res.status(500).json({ 
          success: false, 
          message: "Konfigurasi keamanan tidak lengkap. Silakan hubungi administrator." 
        });
      }

      try {
        const recaptchaVerifyUrl = 'https://www.google.com/recaptcha/api/siteverify';
        const recaptchaResponse = await axios.post(recaptchaVerifyUrl, null, {
          params: {
            secret: recaptchaSecretKey,
            response: recaptchaToken
          },
          timeout: 10000 // 10 seconds timeout
        });

        if (!recaptchaResponse.data.success) {
          console.error('reCAPTCHA verification failed:', recaptchaResponse.data);
          const errorCodes = recaptchaResponse.data['error-codes'] || [];
          console.error('Error codes:', errorCodes);
          
          // Provide more specific error messages
          if (errorCodes.includes('invalid-input-secret')) {
            return res.status(500).json({ 
              success: false, 
              message: "Konfigurasi reCAPTCHA tidak valid. Silakan hubungi administrator." 
            });
          }
          
          return res.status(400).json({ 
            success: false, 
            message: "Verifikasi reCAPTCHA gagal. Silakan coba lagi." 
          });
        }

        // Optional: Check score for reCAPTCHA v3 (not needed for v2, but good to have)
        if (recaptchaResponse.data.score !== undefined && recaptchaResponse.data.score < 0.5) {
          return res.status(400).json({ 
            success: false, 
            message: "Verifikasi keamanan gagal. Silakan coba lagi." 
          });
        }
      } catch (recaptchaError) {
        console.error('reCAPTCHA verification error:', recaptchaError);
        console.error('Error details:', recaptchaError.message);
        console.error('Error stack:', recaptchaError.stack);
        
        // Check if it's a network error
        if (recaptchaError.code === 'ECONNREFUSED' || recaptchaError.code === 'ETIMEDOUT') {
          return res.status(500).json({ 
            success: false, 
            message: "Tidak dapat terhubung ke server verifikasi. Silakan coba lagi." 
          });
        }
        
        return res.status(500).json({ 
          success: false, 
          message: "Terjadi kesalahan saat verifikasi keamanan" 
        });
      }

      // Find user by username with branch and divisi info
      const user = await User.findOne({
        where: { username: username },
        include: [
          {
            model: Branch,
            as: 'branch',
            attributes: ['id', 'nama']
          },
          {
            model: Divisi,
            as: 'divisi',
            attributes: ['id', 'nama']
          },
          {
            model: AnakPerusahaan,
            as: 'anakPerusahaan',
            attributes: ['id', 'nama']
          }
        ]
      });

      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: "Username atau password salah" 
        });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        return res.status(401).json({ 
          success: false, 
          message: "Username atau password salah" 
        });
      }

      // Store user data in session
      req.session.user = {
        id: user.id,
        username: user.username,
        role: user.role || 'user',
        branchId: user.branchId,
        divisiId: user.divisiId,
        anakPerusahaanId: user.anakPerusahaanId
      };
      
      // Save session explicitly
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).json({ 
            success: false, 
            message: "Terjadi kesalahan session" 
          });
        }
        
        // Generate a simple token for frontend use
        const token = `token_${user.id}_${Date.now()}`;
        
        // Login successful
        res.json({
          success: true,
          message: "Login berhasil",
          token: token,
          user: {
            id: user.id,
            username: user.username,
            role: user.role || 'user',
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            unit: user.unit,
            branchId: user.branchId,
            divisiId: user.divisiId,
            anakPerusahaanId: user.anakPerusahaanId,
            branch: user.branch,
            divisi: user.divisi,
            anakPerusahaan: user.anakPerusahaan
          }
        });
      });

    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Terjadi kesalahan server" 
      });
    }
  },

  // Get user info
  async getUser(req, res) {
    try {
      const userId = req.params.id;
      const user = await User.findByPk(userId, {
        attributes: ['id', 'username', 'role', 'created_at']
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User tidak ditemukan"
        });
      }

      res.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          role: user.role || 'user',
          created_at: user.created_at
        }
      });

    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Terjadi kesalahan server" 
      });
    }
  },

  // Check authentication status
  async checkAuth(req, res) {
    try {
      // First try session-based authentication
      if (req.session && req.session.user) {
        const user = await User.findByPk(req.session.user.id, {
          attributes: ['id', 'username', 'role', 'fullName', 'email', 'phone', 'unit', 'profilePhoto', 'branchId', 'divisiId', 'anakPerusahaanId', 'created_at'],
          include: [
            {
              model: Branch,
              as: 'branch',
              attributes: ['id', 'nama']
            },
            {
              model: Divisi,
              as: 'divisi',
              attributes: ['id', 'nama']
            },
            {
              model: AnakPerusahaan,
              as: 'anakPerusahaan',
              attributes: ['id', 'nama']
            }
          ]
        });

        if (user) {
          return res.json({
            success: true,
            user: {
              id: user.id,
              username: user.username,
              role: user.role || 'user',
              fullName: user.fullName,
              email: user.email,
              phone: user.phone,
              unit: user.unit,
              profilePhoto: user.profilePhoto,
              branchId: user.branchId,
              divisiId: user.divisiId,
              anakPerusahaanId: user.anakPerusahaanId,
              branch: user.branch,
              divisi: user.divisi,
              anakPerusahaan: user.anakPerusahaan,
              created_at: user.created_at
            }
          });
        }
      }
      
      // Then try token-based authentication
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        
        // Extract user ID from token format: token_${userId}_${timestamp}
        if (token.startsWith('token_')) {
          const parts = token.split('_');
          if (parts.length >= 2) {
            const userId = parts[1];
            const user = await User.findByPk(userId, {
              attributes: ['id', 'username', 'role', 'fullName', 'email', 'phone', 'unit', 'profilePhoto', 'branchId', 'divisiId', 'anakPerusahaanId', 'created_at'],
              include: [
                {
                  model: Branch,
                  as: 'branch',
                  attributes: ['id', 'nama']
                },
                {
                  model: Divisi,
                  as: 'divisi',
                  attributes: ['id', 'nama']
                },
                {
                  model: AnakPerusahaan,
                  as: 'anakPerusahaan',
                  attributes: ['id', 'nama']
                }
              ]
            });
            
        if (user) {
          return res.json({
            success: true,
            user: {
              id: user.id,
              username: user.username,
              role: user.role || 'user',
              fullName: user.fullName,
              email: user.email,
              phone: user.phone,
              unit: user.unit,
              profilePhoto: user.profilePhoto,
              branchId: user.branchId,
              divisiId: user.divisiId,
              anakPerusahaanId: user.anakPerusahaanId,
              branch: user.branch,
              divisi: user.divisi,
              anakPerusahaan: user.anakPerusahaan,
              created_at: user.created_at
            }
          });
            }
          }
        }
      }
      
      return res.status(401).json({
        success: false,
        message: "User tidak terautentikasi"
      });

    } catch (error) {
      console.error("Check auth error:", error);
      res.status(500).json({
        success: false,
        message: "Terjadi kesalahan server"
      });
    }
  },

  // Get current authenticated user
  async getCurrentUser(req, res) {
    try {
      if (!req.session || !req.session.user) {
        return res.status(401).json({
          success: false,
          message: "User tidak terautentikasi"
        });
      }

      const user = await User.findByPk(req.session.user.id, {
        attributes: ['id', 'username', 'role', 'created_at']
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User tidak ditemukan"
        });
      }

      res.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          role: user.role || 'user',
          created_at: user.created_at
        }
      });

    } catch (error) {
      console.error("Get current user error:", error);
      res.status(500).json({
        success: false,
        message: "Terjadi kesalahan server"
      });
    }
  },

  // Logout user
  async logout(req, res) {
    try {
      // Destroy session
      if (req.session) {
        req.session.destroy((err) => {
          if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).json({
              success: false,
              message: "Gagal logout"
            });
          }
          
          res.json({
            success: true,
            message: "Logout berhasil"
          });
        });
      } else {
        res.json({
          success: true,
          message: "Logout berhasil"
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Terjadi kesalahan server" 
      });
    }
  }
};

export default authController;
