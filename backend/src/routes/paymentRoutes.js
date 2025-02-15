const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Search payments
router.get('/search', paymentController.searchPayments);

// Get all payments
router.get('/', paymentController.getAllPayments);

// Get single payment
router.get('/:id', paymentController.getPaymentById);

// Get loan's payment history
router.get('/loan/:loanId', paymentController.getLoanPayments);

// Get today's collections
router.get('/today', paymentController.getTodayCollections);

// Record payment
router.post('/', paymentController.recordPayment);

// Delete payment
router.delete('/:id', paymentController.deletePayment);

module.exports = router; 