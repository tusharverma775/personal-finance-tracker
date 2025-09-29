const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middlewares/auth');

// User routes
router.get('/me', auth, userController.getUsers);
router.put('/me/:id', auth, userController.updateUserRole);
router.delete('/me/:id', auth, userController.deleteUser);


module.exports = router;
