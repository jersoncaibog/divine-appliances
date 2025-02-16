const db = require('../config/database');

const dashboardController = {
    // Get dashboard metrics
    getMetrics: async (req, res) => {
        try {
            // Get active loans count
            const [activeLoans] = await db.query(`
                SELECT COUNT(*) as count 
                FROM loans 
                WHERE payment_status = 'Unpaid' AND is_active = true
            `);

            // Get total customers count
            const [customers] = await db.query(`
                SELECT COUNT(*) as count 
                FROM customers 
                WHERE is_active = true
            `);

            // Get overdue payments count
            const [overduePayments] = await db.query(`
                SELECT COUNT(*) as count 
                FROM loans 
                WHERE payment_status = 'Overdue' AND is_active = true
            `);

            // Get today's collections
            const [todayCollections] = await db.query(`
                SELECT COALESCE(SUM(amount_paid), 0) as total 
                FROM payments 
                WHERE DATE(payment_date) = CURDATE()
            `);

            res.json({
                active_loans: activeLoans[0].count,
                total_customers: customers[0].count,
                overdue_payments: overduePayments[0].count,
                todays_collections: todayCollections[0].total
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Get recent activity
    getRecentActivity: async (req, res) => {
        try {
            // Get recent payments
            const [recentPayments] = await db.query(`
                SELECT 
                    'payment' as activity_type,
                    p.id,
                    p.amount_paid,
                    p.payment_date,
                    c.name as customer_name,
                    a.name as appliance_name
                FROM payments p
                JOIN loans l ON p.loan_id = l.id
                JOIN customers c ON l.customer_id = c.id
                JOIN appliances a ON l.appliance_id = a.id
                ORDER BY p.payment_date DESC
                LIMIT 5
            `);

            // Get recent loans
            const [recentLoans] = await db.query(`
                SELECT 
                    'loan' as activity_type,
                    l.id,
                    l.total_loan_amount,
                    l.id as loan_date,
                    c.name as customer_name,
                    a.name as appliance_name
                FROM loans l
                JOIN customers c ON l.customer_id = c.id
                JOIN appliances a ON l.appliance_id = a.id
                WHERE l.is_active = true
                ORDER BY l.id DESC
                LIMIT 5
            `);

            // Combine and sort activities
            const activities = [...recentPayments, ...recentLoans]
                .sort((a, b) => {
                    const dateA = a.activity_type === 'payment' ? a.payment_date : new Date();
                    const dateB = b.activity_type === 'payment' ? b.payment_date : new Date();
                    return new Date(dateB) - new Date(dateA);
                })
                .slice(0, 5);

            res.json(activities);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = dashboardController; 