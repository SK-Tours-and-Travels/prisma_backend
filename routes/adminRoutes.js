const express = require("express");
const router = express.Router();
const multer = require("multer");
const { protect } = require("../middlewares/auth");

const customerGallery = require("../controllers/customerGalleryController");
const testimonial = require("../controllers/testimonialController");
const adminGallery = require("../controllers/adminGalleryController");

const upload = multer({ memoryStorage: multer.memoryStorage() });

// ADMIN: Gallery Moderation (all require auth)

// Get all gallery images with optional filters (?isApproved=false&galleryType=PACKAGE)
router.get("/admin/gallery", protect, adminGallery.adminGetAllGallery);

// Approve a single image
router.patch(
  "/admin/gallery/:id/approve",
  protect,
  adminGallery.adminApproveGalleryImage,
);

// Reject a single image
router.patch(
  "/admin/gallery/:id/reject",
  protect,
  adminGallery.adminRejectGalleryImage,
);

// Delete an image permanently
router.delete(
  "/admin/gallery/:id",
  protect,
  adminGallery.adminDeleteGalleryImage,
);

// Bulk approve: body { ids: [1,2,3] }
router.patch(
  "/admin/gallery/bulk-approve",
  protect,
  adminGallery.adminBulkApproveGallery,
);

// ADMIN: Testimonial Moderation (all require auth)

// Get all testimonials (?isApproved=false for pending)
router.get("/admin/testimonials", protect, testimonial.adminGetAllTestimonials);

// Approve a testimonial
router.patch(
  "/admin/testimonials/:id/approve",
  protect,
  testimonial.adminApproveTestimonial,
);

// Reject a testimonial
router.patch(
  "/admin/testimonials/:id/reject",
  protect,
  testimonial.adminRejectTestimonial,
);

// Delete a testimonial permanently
router.delete(
  "/admin/testimonials/:id",
  protect,
  testimonial.adminDeleteTestimonial,
);

module.exports = router;