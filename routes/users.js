import express from "express";
import {
    adminBoard,
    seniorBoard,
    studentBoard,
} from "../controllers/user.controller.js";
import { authJwt } from "../middlewares/index.js";
 
const router = express.Router();
 
// STUDENT (any authenticated user)
router.get("/student", [authJwt.verifyToken, authJwt.isStudent], studentBoard);
 
// SENIOR route
router.get("/senior", [authJwt.verifyToken, authJwt.isSenior], seniorBoard);
 
// Admin route
router.get("/admin", [authJwt.verifyToken, authJwt.isAdmin], adminBoard);
 
export default router;