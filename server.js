import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import fileUpload from 'express-fileupload';
import db from "./models/index.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/users.js";
import housingRoutes from "./routes/housings.js";
import favoriteRoutes from "./routes/favorites.routes.js"
import requestRoutes from "./routes/request.routes.js"
import uploadRoutes from "./routes/upload.routes.js"
import messageRoutes from "./routes/message.routes.js" // pour le cat 

const app = express();

// Middleware configuration
const corsOptions = {
    origin: "*",
};
 
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload())
app.use("/", housingRoutes)
app.use("/", authRoutes)
// Simple route for testing
app.get("/", (req, res) => {
    res.json({ message: "Welcome to the Node.js JWT Authentication application." });
});
 
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/test", userRoutes);
app.use("/api", favoriteRoutes);
app.use("/api", requestRoutes)
app.use("/api", uploadRoutes)
app.use("/api/messages", messageRoutes) // pour le chat 
 
// Set port and start server
const PORT = process.env.PORT || 3000;
 
// Connect to MongoDB and start the server
db.mongoose
    .connect(process.env.CONNECTION_STRING)
    .then(() => {
        console.log("Successfully connected to MongoDB.");
        // Initialize roles in the database
        initial();
       if (process.env.NODE_ENV !== 'production') {
            app.listen(PORT, () => {
                console.log(`Server is running on port ${PORT}.`);
            });
        }
    })
    .catch((err) => {
        console.error("Connection error:", err);
        process.exit();
    });
 
// Verifie et crée automatiquement les rôles au démarrage du serveur, une fois. 
function initial() {
    db.Role.estimatedDocumentCount()
        .then((count) => {
            if (count === 0) {
                return Promise.all([
                    new db.Role({ name: "student" }).save(),
                    new db.Role({ name: "admin" }).save(),
                    new db.Role({ name: "senior" }).save(),
                ]);
            }
        })
        .then((roles) => {
            if (roles) {
                console.log(
                    "Added 'student', 'admin', and 'senior' to roles collection.",
                );
            }
        })
        .catch((err) => {
            console.error("Error initializing roles:", err);
        });
}

export default app;