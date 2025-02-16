const express = require('express');
const cors = require('cors');
const app = express();

// Import combined routes
const routes = require('./routes/index');

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', routes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
