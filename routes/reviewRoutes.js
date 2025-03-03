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

const router = express.Router();

router.get("/get/", getAllReviews);
router.get("/get/:id", getReviewById);
router.get("/:packageid", getReviewsByTourPackageId);
router.post("/create/", createReview);
router.put("/update/:id", protect, updateReview);
router.delete("/delete/:id", protect, deleteReview);
router.get("/averagereview/:packageid", getAverageRatingByTourPackage);

module.exports = router;
