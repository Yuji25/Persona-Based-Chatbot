import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import chatRoutes from "./routes/chat.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 411;

app.use(cors());

app.use(express.json());

app.use("/chat", chatRoutes);


app.get("/", (req, res) => {
  res.send("Persona AI Backend Running");
});


app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});