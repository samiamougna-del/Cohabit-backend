import mongoose from "mongoose";
import dbConfig from "../config/db.config.js";
 
import User from "./user.js";
import Role from "./role.js";
import Message from "./message.js";
 
const db = {};
 
db.mongoose = mongoose;
db.User = User;
db.Role = Role;
 
db.ROLES = ["senior", "admin", "student"];
db.config = dbConfig;
db.Message = Message;
 
export default db;