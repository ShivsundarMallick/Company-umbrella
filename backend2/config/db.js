const mongoose = require('mongoose');

// const umbrellaDb = mongoose.createConnection(process.env.MONGO_URI_UMBRELLA);
const complianceDb = mongoose.createConnection(process.env.MONGO_URI_COMPLIANCE);

// Add event listeners to confirm connection (optional but good practice)
// umbrellaDb.on('connected', () => {
//     console.log(`Company Umbrella MongoDB connected`);
// });

complianceDb.on('connected', () => {
    console.log(`Compliance Dashboard MongoDB connected`);
});

// umbrellaDb.on('error', (err) => console.error('Company Umbrella MongoDB connection error:', err));
complianceDb.on('error', (err) => console.error('Compliance Dashboard MongoDB connection error:', err));

module.exports = { complianceDb };
