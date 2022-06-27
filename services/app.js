import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";

import userRoutes from "./routes/user.js";
import roomRoutes from "./routes/room.js"

const app = express();

mongoose.connect(
    process.env.MONGO_URL|| "mongodb://CoLab" 
).catch(error => {
    console.log(error);
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cors());

app.use("/api/user", userRoutes);
app.use("/api/room", roomRoutes);

export default app;