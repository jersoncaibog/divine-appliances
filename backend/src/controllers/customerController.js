const db = require('../config/database');

const customerController = {
    // Get all customers with pagination
    getAllCustomers: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;

            // Get total count
            const [countResult] = await db.query(
                'SELECT COUNT(*) as total FROM customers WHERE is_active = true'
            );
            const total = countResult[0].total;

            // Get paginated customers
            const [customers] = await db.query(
                'SELECT * FROM customers WHERE is_active = true ORDER BY id DESC LIMIT ? OFFSET ?',
                [limit, offset]
            );

            res.json({
                customers,
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

    // Get customer by ID
    getCustomerById: async (req, res) => {
        try {
            const [customer] = await db.query(
                'SELECT * FROM customers WHERE id = ? AND is_active = true',
                [req.params.id]
            );
            
            if (customer.length === 0) {
                return res.status(404).json({ message: 'Customer not found' });
            }
            
            res.json(customer[0]);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Create new customer
    createCustomer: async (req, res) => {
        try {
            const { rfid_number, name, contact_number } = req.body;
            
            const [result] = await db.query(
                'INSERT INTO customers (rfid_number, name, contact_number, loan_status) VALUES (?, ?, ?, "Active")',
                [rfid_number, name, contact_number]
            );
            
            res.status(201).json({
                id: result.insertId,
                rfid_number,
                name,
                contact_number,
                loan_status: 'Active'
            });
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ message: 'RFID number already exists' });
            }
            res.status(500).json({ message: error.message });
        }
    },

    // Update customer
    updateCustomer: async (req, res) => {
        try {
            const { rfid_number, name, contact_number } = req.body;
            
            const [result] = await db.query(
                'UPDATE customers SET rfid_number = ?, name = ?, contact_number = ? WHERE id = ? AND is_active = true',
                [rfid_number, name, contact_number, req.params.id]
            );
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Customer not found' });
            }
            
            res.json({ message: 'Customer updated successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Delete customer (soft delete)
    deleteCustomer: async (req, res) => {
        try {
            // First check if customer has active loans
            const [activeLoans] = await db.query(
                'SELECT * FROM loans WHERE customer_id = ? AND payment_status != "Paid" AND is_active = true',
                [req.params.id]
            );
            
            if (activeLoans.length > 0) {
                return res.status(400).json({ message: 'Cannot delete customer with active loans' });
            }
            
            const [result] = await db.query(
                'UPDATE customers SET is_active = false WHERE id = ?',
                [req.params.id]
            );
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Customer not found' });
            }
            
            res.json({ message: 'Customer deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Search customers
    searchCustomers: async (req, res) => {
        try {
            const { query } = req.query;
            const searchQuery = `%${query}%`;
            
            const [customers] = await db.query(
                'SELECT * FROM customers WHERE is_active = true AND (name LIKE ? OR rfid_number LIKE ? OR contact_number LIKE ?)',
                [searchQuery, searchQuery, searchQuery]
            );
            
            res.json(customers);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = customerController;
