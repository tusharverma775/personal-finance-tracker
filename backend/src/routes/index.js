const express = require('express');
const router = express.Router();

// Import route files
const authRoutes = require('./auth');
const userRoutes = require('./users');
const transactionRoutes = require('./transactions');
const analyticsRoutes = require('./analytics');
const categoryRoutes = require('./category');

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/transactions', transactionRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/categories', categoryRoutes);

module.exports = router;
