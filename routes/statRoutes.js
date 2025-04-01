const express = require("express");
const { getStatistics } = require("../controllers/statController");
const { protect } = require("../middlewares/auth");

const router = express.Router();

router.get("/get", getStatistics);

module.exports = router;
