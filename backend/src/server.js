const express = require('express');
const cors = require('cors');
const app = express();

// Routes
const customerRoutes = require('./routes/customerRoutes');
const loanRoutes = require('./routes/loanRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const applianceRoutes = require('./routes/applianceRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/customers', customerRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/appliances', applianceRoutes);
app.use('/api/dashboard', dashboardRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
