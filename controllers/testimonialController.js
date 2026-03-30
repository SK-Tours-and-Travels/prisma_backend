// controllers/testimonial.controller.js
// Customers submit testimonials (anonymous OR logged-in).
// Admin approves/rejects. Only approved ones are shown publicly.

const { PrismaClient } = require("@prisma/client");
const { uploadToAzure, deleteFileFromBlob } = require("../util/azureBlob");
const prisma = new PrismaClient();

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOMER ROUTES
// ─────────────────────────────────────────────────────────────────────────────

// ── POST /api/testimonials
// Body (multipart/form-data):
//   - name          (required)
//   - email         (optional)
//   - message       (required)
//   - rating        (optional, 1-5)
//   - tourPackageId (optional)
//   - photo         (optional, single image file)
// If the user is logged in (protect middleware ran), req.user will be set.
exports.submitTestimonial = async (req, res) => {
  try {
    const { name, email, message, rating, tourPackageId } = req.body;

    // Validation
    if (!name || name.trim().length < 2) {
      return res
        .status(400)
        .json({ success: false, error: "A valid name is required" });
    }
    if (!message || message.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: "Message must be at least 10 characters",
      });
    }
    if (rating !== undefined && rating !== "") {
      const parsedRating = parseInt(rating);
      if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
        return res
          .status(400)
          .json({ success: false, error: "Rating must be between 1 and 5" });
      }
    }

    // Optional: verify tourPackageId exists
    if (tourPackageId) {
      const pkg = await prisma.tourPackage.findUnique({
        where: { id: parseInt(tourPackageId) },
        select: { id: true },
      });
      if (!pkg) {
        return res
          .status(404)
          .json({ success: false, error: "Tour package not found" });
      }
    }

    // Optional photo upload
    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadToAzure(req.file);
    }

    const testimonial = await prisma.testimonial.create({
      data: {
        name: name.trim(),
        email: email?.trim() || null,
        message: message.trim(),
        rating: rating ? parseInt(rating) : null,
        imageUrl,
        isApproved: false,
        tourPackageId: tourPackageId ? parseInt(tourPackageId) : null,
        // Link to user account if they're logged in (req.user set by protect middleware)
        userId: req.user || null,
      },
    });

    res.status(201).json({
      success: true,
      message: "Thank you! Your testimonial has been submitted and is pending review.",
      testimonial: {
        id: testimonial.id,
        name: testimonial.name,
        message: testimonial.message,
      },
    });
  } catch (error) {
    console.error("Error submitting testimonial:", error);
    res
      .status(500)
      .json({ success: false, error: "Error submitting testimonial" });
  }
};

// ── GET /api/testimonials
// Public: returns all approved testimonials (for the website homepage/testimonials page)
exports.getApprovedTestimonials = async (req, res) => {
  try {
    const { tourPackageId, limit = 20, page = 1 } = req.query;

    const where = { isApproved: true };
    if (tourPackageId) {
      where.tourPackageId = parseInt(tourPackageId);
    }

    const testimonials = await prisma.testimonial.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      select: {
        id: true,
        name: true,
        message: true,
        rating: true,
        imageUrl: true,
        createdAt: true,
        tourPackage: {
          select: { id: true, name: true },
        },
      },
    });

    const total = await prisma.testimonial.count({ where });

    res.json({
      success: true,
      testimonials,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    res
      .status(500)
      .json({ success: false, error: "Error fetching testimonials" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN ROUTES (protect middleware required on all routes below)
// ─────────────────────────────────────────────────────────────────────────────

// ── GET /api/admin/testimonials
// Admin: returns ALL testimonials (approved + pending) with full details
exports.adminGetAllTestimonials = async (req, res) => {
  try {
    const { isApproved, page = 1, limit = 20 } = req.query;

    const where = {};
    if (isApproved !== undefined) {
      where.isApproved = isApproved === "true";
    }

    const testimonials = await prisma.testimonial.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      include: {
        tourPackage: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    const total = await prisma.testimonial.count({ where });

    res.json({
      success: true,
      testimonials,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    res
      .status(500)
      .json({ success: false, error: "Error fetching testimonials" });
  }
};

// ── PATCH /api/admin/testimonials/:id/approve
// Admin: approve a testimonial
exports.adminApproveTestimonial = async (req, res) => {
  try {
    const { id } = req.params;

    const testimonial = await prisma.testimonial.findUnique({
      where: { id: parseInt(id) },
    });
    if (!testimonial) {
      return res
        .status(404)
        .json({ success: false, error: "Testimonial not found" });
    }

    const updated = await prisma.testimonial.update({
      where: { id: parseInt(id) },
      data: { isApproved: true },
    });

    res.json({
      success: true,
      message: "Testimonial approved successfully",
      testimonial: updated,
    });
  } catch (error) {
    console.error("Error approving testimonial:", error);
    res
      .status(500)
      .json({ success: false, error: "Error approving testimonial" });
  }
};

// ── PATCH /api/admin/testimonials/:id/reject
// Admin: reject (unapprove) a testimonial
exports.adminRejectTestimonial = async (req, res) => {
  try {
    const { id } = req.params;

    const testimonial = await prisma.testimonial.findUnique({
      where: { id: parseInt(id) },
    });
    if (!testimonial) {
      return res
        .status(404)
        .json({ success: false, error: "Testimonial not found" });
    }

    const updated = await prisma.testimonial.update({
      where: { id: parseInt(id) },
      data: { isApproved: false },
    });

    res.json({
      success: true,
      message: "Testimonial rejected",
      testimonial: updated,
    });
  } catch (error) {
    console.error("Error rejecting testimonial:", error);
    res
      .status(500)
      .json({ success: false, error: "Error rejecting testimonial" });
  }
};

// ── DELETE /api/admin/testimonials/:id
// Admin: permanently delete a testimonial (and its image if any)
exports.adminDeleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;

    const testimonial = await prisma.testimonial.findUnique({
      where: { id: parseInt(id) },
    });
    if (!testimonial) {
      return res
        .status(404)
        .json({ success: false, error: "Testimonial not found" });
    }

    // Delete image from Azure if it exists
    if (testimonial.imageUrl) {
      const extractBlobName = (url) => url.split("/").pop();
      await deleteFileFromBlob(extractBlobName(testimonial.imageUrl));
    }

    await prisma.testimonial.delete({ where: { id: parseInt(id) } });

    res.json({ success: true, message: "Testimonial deleted successfully" });
  } catch (error) {
    console.error("Error deleting testimonial:", error);
    res
      .status(500)
      .json({ success: false, error: "Error deleting testimonial" });
  }
};