require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const ticketRoutes = require('./route/ticketRoutes');
const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error('Error: MONGO_URI is not defined in the environment variables.');
    process.exit(1);
}

app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
}));

app.use(express.json());

mongoose.connect(MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error.message);
        process.exit(1);
    });

app.use('/api', ticketRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

process.on('SIGINT', async () => {
    console.log('Closing MongoDB connection...');
    await mongoose.connection.close();
    process.exit(0);
});