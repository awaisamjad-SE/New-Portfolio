require("dotenv").config();
const express = require("express");
const cors = require("cors");
const contactRoutes = require("./routes/contact");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

app.use("/api", contactRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
