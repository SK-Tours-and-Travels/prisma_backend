const express = require("express");
const router = express.Router();
const multer = require("multer");
const { protect } = require("../middlewares/auth");

const customerGallery = require("../controllers/customerGalleryController");
const testimonial = require("../controllers/testimonialController");
const adminGallery = require("../controllers/adminGalleryController");

const upload = multer({ memoryStorage: multer.memoryStorage() });

//Customer Gallery Submission
// Submit photos for a tour package (up to 5 images)
// multipart/form-data: packageId, name, email, images[]
router.post(
  "/customer/gallery",
  upload.array("images", 5),
  customerGallery.submitGalleryImages,
);

// Get approved gallery images for a package (public)
router.get(
  "/customer/gallery/package/:packageId",
  customerGallery.getApprovedGalleryByPackage,
);

// Get approved gallery images for a collection (public)
router.get(
  "/customer/gallery/collection/:collectionId",
  customerGallery.getApprovedGalleryByCollection,
);
// PUBLIC + OPTIONAL AUTH: Testimonials

// Submit a testimonial (anonymous OR logged-in)
// If logged in, add Authorization header — the middleware is optional here
// multipart/form-data: name, email, message, rating, tourPackageId, photo (file)
router.post(
  "/testimonials",
  (req, res, next) => {
    // Try to authenticate but don't block if no token
    const token =
      req.header("Authorization")?.replace("Bearer ", "") || req.cookies?.token;
    if (token) {
      return protect(req, res, next);
    }
    next();
  },
  upload.single("photo"),
  testimonial.submitTestimonial,
);
router.get("/gallery", customerGallery.getAllApprovedGallery);

// Get all approved testimonials (public, supports ?tourPackageId=&page=&limit=)
router.get("/testimonials", testimonial.getApprovedTestimonials);

module.exports = router;
