// app/middlewares/verifySignUp.js
import db from "../models/index.js";
 
const ROLES = db.ROLES;
const User = db.User;
 
const checkDuplicateEmail = async (req, res, next) => {
    try {
       
        // Check if email exists
        const userByEmail = await User.findOne({ email: req.body.email });
        if (userByEmail) {
            return res.status(400).json({ message: "Failed! Email is already in use!" });
        }
 
        next();
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
 
const checkRolesExisted = (req, res, next) => {
    if (req.body.roles) {
        const invalidRoles = req.body.roles.filter((role) => !ROLES.includes(role));
        if (invalidRoles.length > 0) {
            return res.status(400).json({
                message: `Failed! Roles [${invalidRoles.join(", ")}] do not exist!`,
            });
        }
    }
    next();
};
 
const verifySignUp = {
    checkDuplicateEmail,
    checkRolesExisted,
};
 
export default verifySignUp;