// app/controllers/auth.controller.js
import config from "../config/auth.config.js";
import db from "../models/index.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
const User = db.User;
const Role = db.Role

 
export const signup = async (req, res) => {
    try {
        
        // Create a new user
        const user = new User({
            lastName: req.body.lastName,
            firstName: req.body.firstName,
            email: req.body.email,
            phoneNumber: req.body.phoneNumber,
            password: bcrypt.hashSync(req.body.password, 8),
        });
    
        const role = await Role.findOne({ name: req.body.roles });

        if (!role) {
            return res.status(500).json({ message: "Role not found" });
        }

// 3. Associer l'ID du rôle à l'utilisateur
      user.roles = [role._id];
        // Save user to the database
        await user.save();
        res.status(201).json({ message: "User was registered successfully!" });
        console.log ("data saved");
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
 
export const signin = async (req, res) => {
    try {
        // Find user by email
        const user = await User.findOne({ email: req.body.email}).populate(
            "roles",
            "-__v",
        );
 
        if (!user) {
            return res.status(404).json({ message: "User Not found." });
        }
 
        // Validate password
        const passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
            if (!passwordIsValid) {
            return res.status(401).json({
                accessToken: null,
                message: "Invalid Password!",
            });
        }
 
        // Generate JWT
        const token = jwt.sign({ id: user.id }, config.secret, {
            algorithm: "HS256",
            expiresIn: 86400, // 24 hours
        });
 
        // Extract user roles
        const authorities = user.roles.map((role) => `ROLE_${role.name.toUpperCase()}`);
 
        res.status(200).json({
           id: user._id,
           email: user.email,
           roles: authorities,
           accessToken: token,
            
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const deleteUser = (req, res) => {
  User.deleteOne({ _id: req.params.id })
    .then(result => {
      if (result.deletedCount === 0) {
        return res.json({ result: false, error: 'Not found' });
      }
      res.json({ result: true, message: 'Deleted successfully' });
    })
    .catch(error => {
      res.json({ result: false, error: error.message });
    });
};


//params id 
export const updateUser = (req, res) => {
  if (req.params.id !== req.userId) {
    return res.status(403).json({ 
      result: false, 
      error: "You can only update your own profile!" 
    });
  }

  // Liste des champs autorisés
  const allowedFields = ['lastName', 'firstName', 'email', 'phoneNumber', 'age', 'bio', 'preferences'];
  
  const updateData = {};
  
  // Ajoute seulement les champs présents
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  });

  // Gère le password séparément (hashage)
  if (req.body.password) {
    updateData.password = bcrypt.hashSync(req.body.password, 8);
  }

  User.findByIdAndUpdate(req.params.id, updateData, { new: true })
    .then(updated => {
      if (!updated) {
        return res.json({ result: false, error: 'Not found' });
      }
      res.json({ result: true, data: updated });
    })
    .catch(error => {
      res.json({ result: false, error: error.message });
    });
};


