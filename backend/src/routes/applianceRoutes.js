const express = require('express');
const router = express.Router();
const applianceController = require('../controllers/applianceController');

// Search appliances
router.get('/search', applianceController.searchAppliances);

// Get all appliances
router.get('/', applianceController.getAllAppliances);

// Get single appliance
router.get('/:id', applianceController.getApplianceById);

// Create appliance
router.post('/', applianceController.createAppliance);

// Update appliance
router.put('/:id', applianceController.updateAppliance);

// Delete appliance
router.delete('/:id', applianceController.deleteAppliance);

module.exports = router;
