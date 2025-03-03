const express = require("express");
const {
  getAllGalleryImages,
  getGalleryImageById,
  createGalleryImage,
  updateGalleryImage,
  deleteGalleryImage,
} = require("../controllers/galleryController");

const router = express.Router();

router.get("/get/", getAllGalleryImages);
router.get("/get/:id", getGalleryImageById);
router.post("/create/", createGalleryImage);
router.put("/update/:id", updateGalleryImage);
router.delete("/delete/:id", deleteGalleryImage);

module.exports = router;
