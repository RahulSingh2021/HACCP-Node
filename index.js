require("module-alias/register");

const db = require("@models");
const express = require("express");
const cors = require("cors");
const apiRoutes = require("@routes/api");


const app = express();


app.use(cors({
   origin: "*",
   credentials: true
}));



app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Serve static files
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));


// ✅ Routes
app.use("/api", apiRoutes);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
