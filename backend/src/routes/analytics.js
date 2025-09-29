const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const auth = require('../middlewares/auth');



// router.get('/summary', auth, analyticsController.getSummary);
// router.get('/monthly', auth, analyticsController.getMonthlyReport);
// router.get('/category', auth, analyticsController.getCategoryReport);

router.get('/:id', auth, analyticsController.piecharApi)
router.get('/chart', auth, analyticsController.piecharApi)






module.exports = router;
