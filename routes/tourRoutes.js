const express = require("express");
const {
  getAllTourCollection,
  getTourCollectionById,
  createTourCollection,
  deleteTourCollection,
  updateTourCollection,
} = require("../controllers/tourController");
const router = express.Router();

router.get("/get/", getAllTourCollection);
router.get("/get/:id", getTourCollectionById);
router.post("/create/", createTourCollection);
router.put("/update/:id", updateTourCollection);
router.delete("/delete/:id", deleteTourCollection);
module.exports = router;
