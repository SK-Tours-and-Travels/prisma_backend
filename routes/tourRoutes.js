const express = require("express");
const multer = require("multer");

const {
  getAllTourCollection,
  getTourCollectionById,
  createTourCollection,
  deleteTourCollection,
  updateTourCollection,
} = require("../controllers/tourController");
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get("/get/", getAllTourCollection);
router.get("/get/:id", getTourCollectionById);
router.post("/create/",upload.array("gallery",10),createTourCollection);
router.put("/update/:id", updateTourCollection);
router.delete("/delete/:id", deleteTourCollection);
module.exports = router;
