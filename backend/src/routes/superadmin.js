import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { superadminLogin, createAdmin, listAdmins, deleteAdmin } from '../controllers/superadminController.js';

const router = Router();

// Public superadmin login
router.post('/login', superadminLogin);

// Protected superadmin actions
router.post('/create-admin', requireAuth, requireRole('superadmin'), createAdmin);
router.get('/admins', requireAuth, requireRole('superadmin'), listAdmins);
router.delete('/admins/:id', requireAuth, requireRole('superadmin'), deleteAdmin);

export default router;

