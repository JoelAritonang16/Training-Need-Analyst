import { User, Branch } from '../models/index.js';

const auth = {
  // Check if user is authenticated
  async isAuthenticated(req, res, next) {
    try {
      console.log('Auth middleware - Session:', req.session);
      console.log('Auth middleware - Cookies:', req.headers.cookie);
      console.log('Auth middleware - Authorization header:', req.headers.authorization);
      console.log('Auth middleware - X-User-Id header:', req.headers['x-user-id']);
      
      // First try session-based authentication
      if (req.session && req.session.user) {
        const user = await User.findByPk(req.session.user.id, {
          include: [
            {
              model: Branch,
              as: 'branch',
              attributes: ['id', 'nama']
            }
          ]
        });
        
        if (user) {
          req.user = user;
          console.log('Auth middleware - User authenticated via session:', user.username, 'branchId:', user.branchId);
          return next();
        }
      }
      
      // Then try token-based authentication (for backward compatibility)
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        
        // Try to decode token to get user info (simple approach)
        // For now, we'll use a simple token validation
        // In production, you should use JWT or similar
        try {
          // Simple token validation - in real app, decode JWT here
          const userId = req.headers['x-user-id'];
          
          if (userId) {
            const user = await User.findByPk(userId, {
              include: [
                {
                  model: Branch,
                  as: 'branch',
                  attributes: ['id', 'nama']
                }
              ]
            });
            
            if (user) {
              req.user = user;
              console.log('Auth middleware - User authenticated via token:', user.username, 'branchId:', user.branchId);
              return next();
            }
          }
          
          // If no X-User-Id header, try to extract user ID from token format
          // Token format: token_${userId}_${timestamp}
          if (token.startsWith('token_')) {
            const parts = token.split('_');
            if (parts.length >= 2) {
              const userId = parts[1];
              const user = await User.findByPk(userId, {
                include: [
                  {
                    model: Branch,
                    as: 'branch',
                    attributes: ['id', 'nama']
                  }
                ]
              });
              if (user) {
                req.user = user;
                console.log('Auth middleware - User authenticated via token (extracted ID):', user.username, 'branchId:', user.branchId);
                return next();
              }
            }
          }
        } catch (error) {
          console.log('Token validation error:', error);
        }
      }
      
      console.log('Auth middleware - Authentication failed');
      return res.status(401).json({
        success: false,
        message: "Anda harus login terlebih dahulu"
      });
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  },

  // Check if user has admin role
  async isAdmin(req, res, next) {
    try {
      if (req.user && req.user.role === 'admin') {
        return next();
      }
      
      return res.status(403).json({
        success: false,
        message: "Akses ditolak. Anda harus memiliki role admin"
      });
    } catch (error) {
      console.error('Admin check error:', error);
      return res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  },

  // Check if user has moderator role or higher
  async isModerator(req, res, next) {
    try {
      if (req.user && (req.user.role === 'host' || req.user.role === 'admin')) {
        return next();
      }
      
      return res.status(403).json({
        success: false,
        message: "Akses ditolak. Anda harus memiliki role host atau admin"
      });
    } catch (error) {
      console.error('Moderator check error:', error);
      return res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  },

  // Check if user has superadmin role
  async isSuperadmin(req, res, next) {
    try {
      if (req.user && req.user.role === 'superadmin') {
        return next();
      }
      
      return res.status(403).json({
        success: false,
        message: "Akses ditolak. Anda harus memiliki role superadmin"
      });
    } catch (error) {
      console.error('Superadmin check error:', error);
      return res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  },

  // Check if user has admin or superadmin role
  async isAdminOrSuperadmin(req, res, next) {
    try {
      if (req.user && (req.user.role === 'admin' || req.user.role === 'superadmin')) {
        return next();
      }
      
      return res.status(403).json({
        success: false,
        message: "Akses ditolak. Anda harus memiliki role admin atau superadmin"
      });
    } catch (error) {
      console.error('Admin or Superadmin check error:', error);
      return res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  },

  // Dynamic role checking method
  requireRole(roleName) {
    return async (req, res, next) => {
      try {
        if (req.user && req.user.role === roleName) {
          return next();
        }
        
        return res.status(403).json({
          success: false,
          message: `Akses ditolak. Anda harus memiliki role ${roleName}`
        });
      } catch (error) {
        console.error('Role check error:', error);
        return res.status(500).json({
          success: false,
          message: "Internal server error"
        });
      }
    };
  }
};

// Add authenticateToken function for backward compatibility
const authenticateToken = auth.isAuthenticated;

export default auth;
