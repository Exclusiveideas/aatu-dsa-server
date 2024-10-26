import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/dbConn.js";
import mongoose from "mongoose";

// Set up express to parse JSON
dotenv.config();

// connect to DB
connectDB();

const app = express();

import authRoutes from "./routes/authRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";


app.use(express.json());
app.use(
  cors({
    origin: "*", //https://techu-dsa.web.app/
  })
);

app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});


app.use("/auth", authRoutes);
app.use("/student", studentRoutes);

app.get("/", (req, res) => {
  res.send("AATU-DSA server running");
});





const PORT = process.env.PORT || 8080;


mongoose.connection.once('open', () => {
  console.log('connected to mongoDB')
  app.listen(PORT, () => console.log(`Server running on port: ${PORT}`))

})