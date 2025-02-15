const db = require('../config/database');

const applianceController = {
    // Get all appliances with pagination
    getAllAppliances: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;

            // Get total count
            const [countResult] = await db.query(
                'SELECT COUNT(*) as total FROM appliances'
            );
            const total = countResult[0].total;

            // Get paginated appliances
            const [appliances] = await db.query(
                'SELECT * FROM appliances ORDER BY id DESC LIMIT ? OFFSET ?',
                [limit, offset]
            );

            res.json({
                appliances,
                pagination: {
                    total,
                    page,
                    totalPages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Get appliance by ID
    getApplianceById: async (req, res) => {
        try {
            const [appliance] = await db.query(
                'SELECT * FROM appliances WHERE id = ?',
                [req.params.id]
            );
            
            if (appliance.length === 0) {
                return res.status(404).json({ message: 'Appliance not found' });
            }
            
            res.json(appliance[0]);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Create new appliance
    createAppliance: async (req, res) => {
        try {
            const { name, price, stock_quantity } = req.body;
            
            const [result] = await db.query(
                'INSERT INTO appliances (name, price, stock_quantity) VALUES (?, ?, ?)',
                [name, price, stock_quantity]
            );
            
            res.status(201).json({
                id: result.insertId,
                name,
                price,
                stock_quantity
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Update appliance
    updateAppliance: async (req, res) => {
        try {
            const { name, price, stock_quantity } = req.body;
            
            // First check if appliance exists
            const [appliance] = await db.query(
                'SELECT * FROM appliances WHERE id = ?',
                [req.params.id]
            );
            
            if (appliance.length === 0) {
                return res.status(404).json({ message: 'Appliance not found' });
            }
            
            await db.query(
                'UPDATE appliances SET name = ?, price = ?, stock_quantity = ? WHERE id = ?',
                [name, price, stock_quantity, req.params.id]
            );
            
            res.json({ message: 'Appliance updated successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Delete appliance
    deleteAppliance: async (req, res) => {
        try {
            // First check if appliance is linked to any active loans
            const [activeLoans] = await db.query(
                'SELECT * FROM loans WHERE appliance_id = ? AND is_active = true',
                [req.params.id]
            );
            
            if (activeLoans.length > 0) {
                return res.status(400).json({ message: 'Cannot delete appliance with active loans' });
            }
            
            const [result] = await db.query(
                'DELETE FROM appliances WHERE id = ?',
                [req.params.id]
            );
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Appliance not found' });
            }
            
            res.json({ message: 'Appliance deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Search appliances
    searchAppliances: async (req, res) => {
        try {
            const { query } = req.query;
            
            const [appliances] = await db.query(
                'SELECT * FROM appliances WHERE name LIKE ? ORDER BY id DESC',
                [`%${query}%`]
            );
            
            res.json(appliances);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = applianceController; 