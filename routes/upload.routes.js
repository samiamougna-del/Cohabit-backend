import express from "express";
import authJwt from '../middlewares/authJwt.js';
import upload from "../controllers/upload.controller.js"
const router = express.Router();

router.post("/upload", authJwt.verifyToken, upload)


export default router;