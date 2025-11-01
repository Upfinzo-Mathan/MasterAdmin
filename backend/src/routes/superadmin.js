import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { 
  superadminLogin, 
  createAdmin, 
  listAdmins, 
  getAdmin, 
  updateAdmin, 
  toggleAdminStatus, 
  deleteAdmin,
  getAdminUsers
} from '../controllers/superadminController.js';

const router = Router();

// Public superadmin login
router.post('/login', superadminLogin);

// Protected superadmin actions
router.post('/create-admin', requireAuth, requireRole('superadmin'), createAdmin);
router.get('/admins', requireAuth, requireRole('superadmin'), listAdmins);
router.get('/admins/:id', requireAuth, requireRole('superadmin'), getAdmin);
router.get('/admins/:id/users', requireAuth, requireRole('superadmin'), getAdminUsers);
router.put('/admins/:id', requireAuth, requireRole('superadmin'), updateAdmin);
router.patch('/admins/:id/toggle-status', requireAuth, requireRole('superadmin'), toggleAdminStatus);
router.delete('/admins/:id', requireAuth, requireRole('superadmin'), deleteAdmin);

export default router;

