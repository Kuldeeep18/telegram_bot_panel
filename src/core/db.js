const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;
const connectDB = async () => {
    if (!MONGODB_URI) {
        console.warn("Warning: MONGODB_URI is not set. MongoDB connection skipped. In-memory data will be used.");
        return;
    }
    try {
        await mongoose.connect(MONGODB_URI, {
            serverApi: {
                version: '1',
                strict: true,
                deprecationErrors: true,
            }
        });
        console.log("MongoDB connected successfully!");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        console.warn("Continuing execution without MongoDB...");
    }
};

module.exports = connectDB;

