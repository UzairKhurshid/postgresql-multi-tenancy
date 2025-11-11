// server.js
const express = require("express");
const dotenv = require("dotenv");
const userRoutes = require("./routes/user");
const errorHandler = require("./middleware/error-middleware");

dotenv.config();

const app = express();
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server is up and running on port ${PORT}`));
