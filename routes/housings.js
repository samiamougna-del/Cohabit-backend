import express from "express";
import { newHousing, deleteHousing, updateHousing, allHousing, myHouse } from "../controllers/housing.controller.js";
import { authJwt } from "../middlewares/index.js";
const router = express.Router();

router.post("/newHousing", [authJwt.verifyToken, authJwt.isSenior], newHousing); 
router.patch("/updateHousing/:id", [authJwt.verifyToken, authJwt.isSenior], updateHousing)
router.get("/allHousing", [authJwt.verifyToken, authJwt.isStudent], allHousing)
router.delete("/deleteHousing/:id", [authJwt.verifyToken, authJwt.isSenior], deleteHousing);
router.get("/myHouse/:id", [authJwt.verifyToken, authJwt.isSenior], myHouse)


export default router;