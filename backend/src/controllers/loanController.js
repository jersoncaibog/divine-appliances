const db = require('../config/database');

const loanController = {
    // Get all loans with pagination
    getAllLoans: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;

            // Get total count
            const [countResult] = await db.query(
                'SELECT COUNT(*) as total FROM loans WHERE is_active = true'
            );
            const total = countResult[0].total;

            // Get paginated loans with customer and appliance details
            const [loans] = await db.query(`
                SELECT l.*, c.name as customer_name, a.name as appliance_name 
                FROM loans l 
                JOIN customers c ON l.customer_id = c.id 
                JOIN appliances a ON l.appliance_id = a.id 
                WHERE l.is_active = true
                ORDER BY l.id DESC
                LIMIT ? OFFSET ?
            `, [limit, offset]);

            res.json({
                loans,
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

    // Get loan by ID
    getLoanById: async (req, res) => {
        try {
            const [loan] = await db.query(`
                SELECT l.*, c.name as customer_name, a.name as appliance_name 
                FROM loans l 
                JOIN customers c ON l.customer_id = c.id 
                JOIN appliances a ON l.appliance_id = a.id 
                WHERE l.id = ? AND l.is_active = true
            `, [req.params.id]);
            
            if (loan.length === 0) {
                return res.status(404).json({ message: 'Loan not found' });
            }
            
            res.json(loan[0]);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Get customer's loans
    getCustomerLoans: async (req, res) => {
        try {
            const [loans] = await db.query(`
                SELECT l.*, a.name as appliance_name 
                FROM loans l 
                JOIN appliances a ON l.appliance_id = a.id 
                WHERE l.customer_id = ? AND l.is_active = true
            `, [req.params.customerId]);
            
            res.json(loans);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Create new loan
    createLoan: async (req, res) => {
        try {
            const { customer_id, appliance_id, total_loan_amount, monthly_payment } = req.body;
            
            // Check if customer exists and is active
            const [customer] = await db.query(
                'SELECT * FROM customers WHERE id = ? AND is_active = true',
                [customer_id]
            );
            
            if (customer.length === 0) {
                return res.status(404).json({ message: 'Customer not found or inactive' });
            }
            
            // Check if appliance exists and has stock
            const [appliance] = await db.query(
                'SELECT * FROM appliances WHERE id = ? AND stock_quantity > 0',
                [appliance_id]
            );
            
            if (appliance.length === 0) {
                return res.status(404).json({ message: 'Appliance not found or out of stock' });
            }
            
            const [result] = await db.query(
                'INSERT INTO loans (customer_id, appliance_id, total_loan_amount, monthly_payment, balance) VALUES (?, ?, ?, ?, ?)',
                [customer_id, appliance_id, total_loan_amount, monthly_payment, total_loan_amount]
            );
            
            // Decrease appliance stock
            await db.query(
                'UPDATE appliances SET stock_quantity = stock_quantity - 1 WHERE id = ?',
                [appliance_id]
            );
            
            res.status(201).json({
                id: result.insertId,
                customer_id,
                appliance_id,
                total_loan_amount,
                monthly_payment,
                balance: total_loan_amount
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Update loan
    updateLoan: async (req, res) => {
        try {
            const { total_loan_amount, monthly_payment, payment_status, balance } = req.body;
            
            const [loan] = await db.query(
                'SELECT * FROM loans WHERE id = ? AND is_active = true',
                [req.params.id]
            );
            
            if (loan.length === 0) {
                return res.status(404).json({ message: 'Loan not found' });
            }
            
            await db.query(
                'UPDATE loans SET total_loan_amount = ?, monthly_payment = ?, payment_status = ?, balance = ? WHERE id = ?',
                [total_loan_amount, monthly_payment, payment_status, balance, req.params.id]
            );
            
            res.json({ message: 'Loan updated successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Delete loan (soft delete)
    deleteLoan: async (req, res) => {
        try {
            // Check if loan exists and get appliance_id
            const [loan] = await db.query(
                'SELECT * FROM loans WHERE id = ? AND is_active = true',
                [req.params.id]
            );
            
            if (loan.length === 0) {
                return res.status(404).json({ message: 'Loan not found' });
            }
            
            // Soft delete the loan
            await db.query(
                'UPDATE loans SET is_active = false WHERE id = ?',
                [req.params.id]
            );
            
            // Increase appliance stock by 1
            await db.query(
                'UPDATE appliances SET stock_quantity = stock_quantity + 1 WHERE id = ?',
                [loan[0].appliance_id]
            );
            
            res.json({ message: 'Loan deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Search loans
    searchLoans: async (req, res) => {
        try {
            const { query } = req.query;
            const searchQuery = `%${query}%`;
            
            const [loans] = await db.query(`
                SELECT l.*, c.name as customer_name, a.name as appliance_name 
                FROM loans l 
                JOIN customers c ON l.customer_id = c.id 
                JOIN appliances a ON l.appliance_id = a.id 
                WHERE l.is_active = true 
                AND (c.name LIKE ? OR a.name LIKE ? OR l.payment_status LIKE ?)
            `, [searchQuery, searchQuery, searchQuery]);
            
            res.json(loans);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = loanController; 