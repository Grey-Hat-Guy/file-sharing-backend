const express = require('express');
const { login, register, authCheck, logout } = require('../controllers/authController');
const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.get('/auth-check', authCheck);
router.post('/logout', logout);
module.exports = router;