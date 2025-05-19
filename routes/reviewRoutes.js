const express = require("express");
const { protect } = require("../middlewares/auth");
const {
  getAllReviews,
  getReviewById,
  getReviewsByTourPackageId,
  createReview,
  updateReview,
  deleteReview,
  getAverageRatingByTourPackage,
} = require("../controllers/reviewController");
const auth = require("../middlewares/auth");
const router = express.Router();

router.get("/get/", getAllReviews);
router.get("/get/:id", getReviewById);
router.get("/:packageid", getReviewsByTourPackageId);
router.post("/create/", auth.protect, createReview);
router.put("/update/:id", auth.protect, updateReview);
router.delete("/delete/:id", auth.protect, deleteReview);
router.get("/averagereview/:packageid", getAverageRatingByTourPackage);

module.exports = router;
