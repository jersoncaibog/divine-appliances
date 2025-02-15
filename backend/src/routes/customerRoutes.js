const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

// Get all customers
router.get('/', customerController.getAllCustomers);

// Search customers
router.get('/search', customerController.searchCustomers);

// Get single customer
router.get('/:id', customerController.getCustomerById);

// Create customer
router.post('/', customerController.createCustomer);

// Update customer
router.put('/:id', customerController.updateCustomer);

// Delete customer (soft delete)
router.delete('/:id', customerController.deleteCustomer);

module.exports = router; 