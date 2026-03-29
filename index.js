require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const tourRoutes = require("./routes/tourRoutes");
const tourPackageRoutes = require("./routes/tourPackageRoutes");
const tourPlanRoutes = require("./routes/tourPlanRoutes");
const gallery = require("./routes/galleryRoutes");
const userRoutes = require("./routes/userRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const statRoutes = require("./routes/statRoutes");

const app = express();
app.use(
  cors({
    origin: [
      "https://agreeable-dune-073a6cc10.4.azurestaticapps.net",
      "https://purple-tree-07281eb10.1.azurestaticapps.net",
      "https://trippcard.in",
      "http://127.0.0.1:5173",
      "http://localhost:5173",
      "http://localhost:5174",
      "http://127.0.0.1:3000",
      "https://admin.trippcard.in",
      "https://www.trippcard.in"
    ],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  }),
);
app.use(express.json());
app.use(bodyParser.json());

app.use("/api/user", userRoutes);
app.use("/api/collections", tourRoutes);
app.use("/api/packages", tourPackageRoutes);
app.use("/api/tourplan", tourPlanRoutes);
app.use("/api/gallery", gallery);
app.use("/api/review/", reviewRoutes);
app.use("/api/stat/", statRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.get("/", (req, res) => {
  res.send("Server is up and running");
});
