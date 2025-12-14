import express from "express";
import authJwt from '../middlewares/authJwt.js';
import { sendRequest, seniorRequests, studentRequests, updateRequestStatus } from "../controllers/request.controller.js"
const router = express.Router();

router.post("/sendRequest", [ authJwt.verifyToken, authJwt.isStudent], sendRequest)
router.get("/seniorRequests", [ authJwt.verifyToken ,authJwt.isSenior ], seniorRequests)
router.get("/studentRequests", [ authJwt.verifyToken ,authJwt.isStudent], studentRequests)
router.patch("/updateRequestStatus/:requestId", [authJwt.verifyToken, authJwt.isSenior], updateRequestStatus)



export default router;