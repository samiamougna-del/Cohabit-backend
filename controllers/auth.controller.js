// app/controllers/auth.controller.js
import config from "../config/auth.config.js";
import db from "../models/index.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
const User = db.User;
const Role = db.Role

 
export const signup = async (req, res) => {
    try {
        //crée utilisateur sans role uniquement les données saisies par l'utilisateur
        const user = new User({
            lastName: req.body.lastName,
            firstName: req.body.firstName,
            email: req.body.email,
            phoneNumber: req.body.phoneNumber,
            password: bcrypt.hashSync(req.body.password, 8),
            age: req.body.age,
            photo: req.body.photo,
            bio: req.body.bio,
            preferences: {
                budgetMin: req.body.preferences?.budgetMin,
                budgetMax: req.body.preferences?.budgetMax,
                location: req.body.preferences?.location,
                lifestyle: req.body.preferences?.lifestyle || [],
                expectations: req.body.preferences?.expectations || []
            }

        });
    
        // trouver le role après pour double vérification et 0 erreurs (même si techniquement l'utilisateur n'a pas d'autre choix que de choisir le rôle en prems)
        const role = await Role.findOne({ name: req.body.roles });
        if (!role) {
            return res.status(500).json({ message: "Role not found" });
        }

        //associe l'ID du rôle à l'utilisateur
        user.roles = [role._id];
        
        // sauvegarde de l'utilisateur dans bdd
        await user.save();

        // une fois save génération du token DIRECTEMENT a l'enregistrement évite à l'utilisateur de se connecter après s'être enregistré
        //ajout du rôle dans le token DIRECTEMENT  pour réutilisation de reducer via JWTdecode puis screens
        const token = jwt.sign({ 
          id: user.id,
          role: role.name }, 
          config.secret, {
            algorithm: "HS256",
            expiresIn: 86400, // 24 heures 
        });

        //Plus besoin d'extraire le role 
      

        // réponse envoyée avec toutes les informations sans le authorities  
        res.status(201).json({
            message: "User was registered successfully!",
            id: user._id,
            lastName: user.lastName,
            firstName: user.firstName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            accessToken: token,
            age: user.age,
            photo: user.photo,
            bio: user.bio,
            preferences: user.preferences,
            accessToken: token,
        });
        
        console.log("Data saved");
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
 
        // Récupération du role via populate
        const token = jwt.sign({
           id: user.id, 
           role: user.roles[0].name

         }, config.secret, {
            algorithm: "HS256",
            expiresIn: 86400, // 24 hours
        });

 
        res.status(200).json({
           message: "User logged in successfully!",
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            accessToken: token,
            age: user.age,
            photo: user.photo,
            bio: user.bio,
            preferences: user.preferences,
            favorites: user.favorites,
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
  const allowedFields = ['lastName', 'firstName', 'email', 'phoneNumber', 'age', 'bio', 'preferences', 'photo'];
  
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


