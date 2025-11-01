import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { adminLogin } from '../controllers/superadminController.js';
import { createUser, listUsers, getUser, updateUser, deleteUser, createLead, getLead } from '../controllers/userController.js';

const router = Router();

// Public: admin login
router.post('/login', adminLogin);

// Protected: admin data CRUD
router.use(requireAuth, requireRole('admin'));
router.get('/users', listUsers);
router.post('/users', createUser);
router.post('/leads', createLead);
router.get('/leads/:id', getLead);
router.get('/users/:id', getUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

export default router;

