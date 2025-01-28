const express = require('express');
const router = express.Router();
const { register, login, getAllUsers } = require('../controllers/userController');
const auth = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/list', auth, getAllUsers);

module.exports = router;
