import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import { connectDB } from "./src/config/db.js";
import app from "./src/app.js";

dotenv.config();
await connectDB();

const server = express();
server.use(cors());
server.use(helmet());
server.use(morgan("dev"));
server.use(express.json());
server.use("/api", app);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
