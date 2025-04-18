const express = require("express");
const {
  getTourPackagesByCollection,
  getAllTourPackages,
  getTourPackagesById,
  createTourPackage,
  updateTourPackage,
  deleteTourPackage,
} = require("../controllers/tourPackageController");
const multer = require("multer");
const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get("/get/", getAllTourPackages);
router.get("/get/:id", getTourPackagesById);
router.get("/getbyCollection/:collectionName", getTourPackagesByCollection);
router.post(
  "/create/",
  upload.fields([{ name: "gallery" }, { name: "document" }]),
  createTourPackage
);
router.put(
  "/update/:id",
  upload.fields([{ name: "gallery" }, { name: "document" }]),
  updateTourPackage
);
router.delete("/delete/:id", deleteTourPackage);

module.exports = router;
