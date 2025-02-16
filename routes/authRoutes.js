const express = require('express');
const { login, register, authCheck } = require('../controllers/authController');
const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.get('/auth-check', authCheck);
module.exports = router;