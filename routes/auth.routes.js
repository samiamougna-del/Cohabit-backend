import express from "express";
import { signup, signin, deleteUser, updateUser } from "../controllers/auth.controller.js";
import { verifySignUp } from "../middlewares/index.js";
import { authJwt } from "../middlewares/index.js";
 
const router = express.Router();
 
// Signup route
router.post(
    "/signup",
    [verifySignUp.checkDuplicateEmail, verifySignUp.checkRolesExisted],
    signup,
);
 
// Signin route
router.post("/signin", signin);
//delete user

router.delete("/deleteUser/:id", authJwt.verifyToken, deleteUser);
router.patch("/updateUser/:id", authJwt.verifyToken, updateUser)
 
export default router;