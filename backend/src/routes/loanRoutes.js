const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');

// Search loans
router.get('/search', loanController.searchLoans);

// Get all loans
router.get('/', loanController.getAllLoans);

// Get customer's loans
router.get('/customer/:customerId', loanController.getCustomerLoans);

// Get single loan
router.get('/:id', loanController.getLoanById);

// Create loan
router.post('/', loanController.createLoan);

// Update loan
router.put('/:id', loanController.updateLoan);

// Delete loan (soft delete)
router.delete('/:id', loanController.deleteLoan);

module.exports = router;
