const express = require("express");
const multer = require("multer");
const auth = require("../middlewares/auth");
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
router.post(
  "/create/",
  auth.protect,
  upload.array("gallery", 10),
  createTourCollection
);
router.put("/update/:id", auth.protect, updateTourCollection);
router.delete("/delete/:id", auth.protect, deleteTourCollection);
module.exports = router;
