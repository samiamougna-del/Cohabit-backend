import dotenv from "dotenv";
dotenv.config();

// config/auth.config.js
export default {
    secret: process.env.JWT_SECRET, // Replace with your own secret key
};

