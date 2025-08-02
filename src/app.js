require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/users'); 
const rideRoutes = require('./routes/rides');
const adminRoutes = require('./routes/admin');
const errorHandler = require('./middleware/errorHandler');

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

// routes
app.use('/api/v1/users', userRoutes); 
app.use('/api/v1/rides', rideRoutes);
app.use('/api/v1/admin', adminRoutes);

// root route
app.get('/', (req, res) => {
  res.send('Corporate Ride Scheduler API is running!');
});

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
 