import express from "express";
import { newHousing, deleteHousing, updateHousing } from "../controllers/housing.controller.js";
import { authJwt } from "../middlewares/index.js";
const router = express.Router();

router.post("/newHousing", [authJwt.verifyToken, authJwt.isSenior], newHousing); 
router.put("/updateHousing/:id", authJwt.verifyToken, updateHousing)
router.delete("/deleteHousing/:id", [authJwt.verifyToken, authJwt.isSenior], deleteHousing);


export default router;