const express = require("express");
const {
  getAllTourPackages,
  getTourPackagesById,
  createTourPackage,
  updateTourPackage,
  deleteTourPackage,
} = require("../controllers/tourPackageController");

const router = express.Router();

router.get("/get/", getAllTourPackages);
router.get("/get/:id", getTourPackagesById);
router.post("/create/", createTourPackage);
router.put("/update/:id", updateTourPackage);
router.delete("/delete/:id", deleteTourPackage);

module.exports = router;
