const express = require('express');
const { authenticate, requireRole } = require('../middleware/authenticate');
const { validate, validateParams } = require('../middleware/validate');
const { uuidParamSchema, updateRoleSchema } = require('../schemas/admin.schema');
const admin = require('../controllers/adminController');

const router = express.Router();

router.use(authenticate, requireRole('ADMIN'));

router.get('/users', admin.listUsers);
router.put(
  '/users/:id/role',
  validateParams(uuidParamSchema),
  validate(updateRoleSchema),
  admin.updateUserRole
);
router.delete('/users/:id', validateParams(uuidParamSchema), admin.deleteUser);

module.exports = router;
