const express = require('express');
const rateLimit = require('express-rate-limit');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/authenticate');
const { registerSchema, loginSchema } = require('../schemas/auth.schema');
const auth = require('../controllers/auth.controller');

const router = express.Router();

// Stricter limit on auth endpoints to slow down brute-force / credential
// stuffing: 10 attempts per 15 minutes per IP.
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });

router.post('/register', authLimiter, validate(registerSchema), auth.register);
router.post('/login', authLimiter, validate(loginSchema), auth.login);
router.post('/refresh', auth.refresh);
router.post('/logout', auth.logout);
router.get('/me', authenticate, auth.me);

module.exports = router;
