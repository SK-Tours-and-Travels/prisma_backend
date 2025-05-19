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
const auth = require("../middlewares/auth");
router.get("/get/", getAllTourPackages);
router.get("/get/:id", getTourPackagesById);
router.get("/getbyCollection/:collectionName", getTourPackagesByCollection);
router.post(
  "/create/",
  upload.fields([{ name: "gallery" }, { name: "document" }]),
  auth.protect,
  createTourPackage
);
router.put(
  "/update/:id",
  upload.fields([{ name: "gallery" }, { name: "document" }]),
  auth.protect,
  updateTourPackage
);
router.delete("/delete/:id", auth.protect, deleteTourPackage);

module.exports = router;
