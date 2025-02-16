const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const loanController = require('../controllers/loanController');
const paymentController = require('../controllers/paymentController');
const applianceController = require('../controllers/applianceController');
const dashboardController = require('../controllers/dashboardController');

// Dashboard routes
router.get('/dashboard/metrics', dashboardController.getMetrics);
router.get('/dashboard/recent-activity', dashboardController.getRecentActivity);

// Customer routes
router.get('/customers', customerController.getAllCustomers);
router.get('/customers/search', customerController.searchCustomers);
router.get('/customers/rfid/:rfid', customerController.getCustomerByRFID);
router.get('/customers/:id', customerController.getCustomerById);
router.post('/customers', customerController.createCustomer);
router.put('/customers/:id', customerController.updateCustomer);
router.delete('/customers/:id', customerController.deleteCustomer);

// Loan routes
router.get('/loans', loanController.getAllLoans);
router.get('/loans/search', loanController.searchLoans);
router.get('/loans/:id', loanController.getLoanById);
router.post('/loans', loanController.createLoan);
router.put('/loans/:id', loanController.updateLoan);
router.delete('/loans/:id', loanController.deleteLoan);

// Payment routes
router.get('/payments', paymentController.getAllPayments);
router.get('/payments/search', paymentController.searchPayments);
router.get('/payments/:id', paymentController.getPaymentById);
router.post('/payments', paymentController.recordPayment);
router.delete('/payments/:id', paymentController.deletePayment);

// Appliance routes
router.get('/appliances', applianceController.getAllAppliances);
router.get('/appliances/search', applianceController.searchAppliances);
router.get('/appliances/:id', applianceController.getApplianceById);
router.post('/appliances', applianceController.createAppliance);
router.put('/appliances/:id', applianceController.updateAppliance);
router.delete('/appliances/:id', applianceController.deleteAppliance);

module.exports = router; 