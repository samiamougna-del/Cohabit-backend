import express from "express";
import { 
    toggleFavorite, 
    getFavorites, 
    checkFavorite 
} from "../controllers/favorite.controller.js";
import { authJwt } from "../middlewares/index.js";

const router = express.Router();

// Récupérer tous les favoris de l'utilisateur connecté
router.get("/favorites", authJwt.verifyToken, getFavorites);

// Vérifier si un logement est dans les favoris
router.get("/favorites/check/:housingId", authJwt.verifyToken, checkFavorite);

// Toggle favorite (ajouter OU retirer selon l'état actuel)
router.put("/favorites/:housingId", authJwt.verifyToken, toggleFavorite);


export default router;