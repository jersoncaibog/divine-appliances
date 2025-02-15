const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');

// Get all loans
router.get('/', loanController.getAllLoans);

// Get single loan
router.get('/:id', loanController.getLoanById);

// Get customer's loans
router.get('/customer/:customerId', loanController.getCustomerLoans);

// Create loan
router.post('/', loanController.createLoan);

// Update loan
router.put('/:id', loanController.updateLoan);

// Delete loan (soft delete)
router.delete('/:id', loanController.deleteLoan);

// Search loans
router.get('/search', loanController.searchLoans);

module.exports = router;
