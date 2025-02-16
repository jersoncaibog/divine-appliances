const db = require('../config/database');

const paymentController = {
    // Get all payments with pagination
    getAllPayments: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;

            // Get total count
            const [countResult] = await db.query(
                'SELECT COUNT(*) as total FROM payments'
            );
            const total = countResult[0].total;

            // Get paginated payments
            const [payments] = await db.query(`
                SELECT p.*, l.customer_id, c.name as customer_name, l.appliance_id, a.name as appliance_name
                FROM payments p
                JOIN loans l ON p.loan_id = l.id
                JOIN customers c ON l.customer_id = c.id
                JOIN appliances a ON l.appliance_id = a.id
                ORDER BY p.payment_date DESC
                LIMIT ? OFFSET ?
            `, [limit, offset]);

            res.json({
                payments,
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

    // Get payment by ID
    getPaymentById: async (req, res) => {
        try {
            const [payment] = await db.query(`
                SELECT p.*, l.customer_id, c.name as customer_name, l.appliance_id, a.name as appliance_name
                FROM payments p
                JOIN loans l ON p.loan_id = l.id
                JOIN customers c ON l.customer_id = c.id
                JOIN appliances a ON l.appliance_id = a.id
                WHERE p.id = ?
            `, [req.params.id]);
            
            if (payment.length === 0) {
                return res.status(404).json({ message: 'Payment not found' });
            }
            
            res.json(payment[0]);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Get loan's payment history
    getLoanPayments: async (req, res) => {
        try {
            const [payments] = await db.query(
                'SELECT * FROM payments WHERE loan_id = ? ORDER BY payment_date DESC',
                [req.params.loanId]
            );
            res.json(payments);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Get today's collections
    getTodayCollections: async (req, res) => {
        try {
            const [collections] = await db.query(`
                SELECT SUM(amount_paid) as total_collections
                FROM payments
                WHERE DATE(payment_date) = CURDATE()
            `);
            
            res.json({
                total_collections: collections[0].total_collections || 0
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Record payment
    recordPayment: async (req, res) => {
        try {
            const { loan_id, amount_paid } = req.body;
            
            // Get loan details
            const [loan] = await db.query(
                'SELECT * FROM loans WHERE id = ? AND is_active = true',
                [loan_id]
            );
            
            if (loan.length === 0) {
                return res.status(404).json({ message: 'Loan not found' });
            }
            
            const currentLoan = loan[0];
            const newBalance = currentLoan.balance - amount_paid;
            
            // Update loan balance and status
            let newStatus = currentLoan.payment_status;
            if (newBalance <= 0) {
                newStatus = 'Paid';
            }
            
            await db.query(
                'UPDATE loans SET balance = ?, payment_status = ? WHERE id = ?',
                [newBalance, newStatus, loan_id]
            );
            
            // Record the payment
            const [result] = await db.query(
                'INSERT INTO payments (loan_id, amount_paid, remaining_balance) VALUES (?, ?, ?)',
                [loan_id, amount_paid, newBalance]
            );
            
            // If loan is paid, update customer loan status if they have no other active loans
            if (newStatus === 'Paid') {
                const [activeLoans] = await db.query(
                    'SELECT * FROM loans WHERE customer_id = ? AND payment_status != "Paid" AND is_active = true',
                    [currentLoan.customer_id]
                );
                
                if (activeLoans.length === 0) {
                    await db.query(
                        'UPDATE customers SET loan_status = "Completed" WHERE id = ?',
                        [currentLoan.customer_id]
                    );
                }
            }
            
            res.status(201).json({
                id: result.insertId,
                loan_id,
                amount_paid,
                remaining_balance: newBalance,
                payment_status: newStatus
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Search payments
    searchPayments: async (req, res) => {
        try {
            const searchQuery = req.query.query;
            
            const [payments] = await db.query(`
                SELECT p.*, l.customer_id, c.name as customer_name, l.appliance_id, a.name as appliance_name
                FROM payments p
                JOIN loans l ON p.loan_id = l.id
                JOIN customers c ON l.customer_id = c.id
                JOIN appliances a ON l.appliance_id = a.id
                WHERE 
                    c.name LIKE ? OR
                    c.rfid_number LIKE ? OR
                    a.name LIKE ? OR
                    DATE_FORMAT(p.payment_date, '%Y-%m-%d') LIKE ?
                ORDER BY p.payment_date DESC
            `, [`%${searchQuery}%`, searchQuery, `%${searchQuery}%`, `%${searchQuery}%`]);

            res.json(payments);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Delete payment
    deletePayment: async (req, res) => {
        try {
            // First get the payment details to update the loan balance
            const [payment] = await db.query(
                'SELECT * FROM payments WHERE id = ?',
                [req.params.id]
            );
            
            if (payment.length === 0) {
                return res.status(404).json({ message: 'Payment not found' });
            }

            // Get the loan details
            const [loan] = await db.query(
                'SELECT * FROM loans WHERE id = ?',
                [payment[0].loan_id]
            );

            if (loan.length === 0) {
                return res.status(404).json({ message: 'Associated loan not found' });
            }

            // Calculate new balance by adding back the payment amount
            const newBalance = parseFloat(loan[0].balance) + parseFloat(payment[0].amount_paid);
            
            // Update loan balance
            await db.query(
                'UPDATE loans SET balance = ?, payment_status = ? WHERE id = ?',
                [newBalance, newBalance > 0 ? 'Unpaid' : 'Paid', payment[0].loan_id]
            );

            // Delete the payment record
            const [result] = await db.query(
                'DELETE FROM payments WHERE id = ?',
                [req.params.id]
            );
            
            if (result.affectedRows === 0) {
                throw new Error('Failed to delete payment');
            }
            
            res.json({ message: 'Payment deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = paymentController; 