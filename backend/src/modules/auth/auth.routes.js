const { Router } = require('express');
const authController = require('./auth.controller');
const { validate } = require('../../middleware/validate.middleware');
const { requireAuth } = require('../../middleware/auth.middleware');
const { registerSchema, loginSchema, updateProfileSchema } = require('./auth.validator');

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.get('/me', requireAuth, authController.getMe);
router.patch('/me', requireAuth, validate(updateProfileSchema), authController.updateMe);

module.exports = router;
