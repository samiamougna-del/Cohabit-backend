// app/middlewares/authJwt.js
import jwt from "jsonwebtoken";
import config from "../config/auth.config.js";
import db from "../models/index.js";
 
const User = db.User;
const Role = db.Role;
 
const verifyToken = async (req, res, next) => {
    let token = req.headers["x-access-token"] || req.headers["authorization"];
 
    if (!token) {
        return res.status(403).json({ message: "No token provided!" });
    }
 
    // Remove 'Bearer ' prefix if present
    if (token.startsWith("Bearer")) {
        token = token.slice(7, token.length);
    }
 
    try {
        const decoded = jwt.verify(token, config.secret);
        req.userId = decoded.id;
 
        // Fetch user details
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }
 
        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Unauthorized!" });
    }
};
 
const isAdmin = async (req, res, next) => {
    try {
        const user = req.user;
        const roles = await Role.find({ _id: { $in: user.roles } });
 
        const hasAdminRole = roles.some((role) => role.name === "admin");
 
        if (!hasAdminRole) {
            return res.status(403).json({ message: "Require Admin Role!" });
        }
 
        next();
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
 
const isSenior = async (req, res, next) => {
    try {
        const user = req.user;
        const roles = await Role.find({ _id: { $in: user.roles } });
 
        const hasSeniorRole = roles.some((role) => role.name === "senior");
 
        if (!hasSeniorRole) {
            return res.status(403).json({ message: "Require Senior Role!" });
        }
 
        next();
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


const isStudent = async (req, res, next) => {
    try {
        const user = req.user;
        const roles = await Role.find({ _id: { $in: user.roles } });
 
        const hasStudentRole = roles.some((role) => role.name === "student");
 
        if (!hasStudentRole) {
            return res.status(403).json({ message: "Require Student Role!" });
        }
 
        next();
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
 
const authJwt = {
    verifyToken,
    isAdmin,
    isSenior,
    isStudent,
};
 
export default authJwt;