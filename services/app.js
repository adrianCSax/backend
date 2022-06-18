import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";

import userRoutes from "./routes/user.js";

const app = express();

mongoose.connect(
    "mongodb://localhost:27017/CoLabPrueba"
).catch(error => {
    console.log(error);
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use((_req, _res, _next) => {
    _res.setHeader("Access-Control-Allow-Origin", "*");
    _res.setHeader(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    _res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PATCH, DELETE, OPTIONS"
    );
    _next();
});

app.use("/api/user", userRoutes);

export default app;