const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/create-qris', paymentController.createQris);
router.get('/status/:orderId', paymentController.checkStatus);

module.exports = router;