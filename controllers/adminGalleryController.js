// controllers/adminGallery.controller.js
// Admin endpoints for moderating customer-submitted gallery images.
// All routes here require the protect middleware.

const { PrismaClient } = require("@prisma/client");
const { deleteFileFromBlob } = require("../util/azureBlob");
const prisma = new PrismaClient();

const extractBlobName = (url) => url.split("/").pop();

// ── GET /api/admin/gallery
// Returns all gallery images — filter by isApproved via query param
// ?isApproved=false → pending submissions
// ?isApproved=true  → approved images
// (no filter)       → all images
exports.adminGetAllGallery = async (req, res) => {
  try {
    const { isApproved, galleryType, page = 1, limit = 20 } = req.query;

    const where = {};
    if (isApproved !== undefined) {
      where.isApproved = isApproved === "true";
    }
    if (galleryType) {
      where.galleryType = galleryType.toUpperCase(); // "PACKAGE" or "COLLECTION"
    }

    const images = await prisma.gallery.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      include: {
        package: { select: { id: true, name: true } },
        collection: { select: { id: true, name: true } },
      },
    });

    const total = await prisma.gallery.count({ where });

    res.json({
      success: true,
      images,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching gallery:", error);
    res.status(500).json({ success: false, error: "Error fetching gallery" });
  }
};

// ── PATCH /api/admin/gallery/:id/approve
// Approve a customer-submitted image
exports.adminApproveGalleryImage = async (req, res) => {
  try {
    const { id } = req.params;

    const image = await prisma.gallery.findUnique({
      where: { id: parseInt(id) },
    });
    if (!image) {
      return res
        .status(404)
        .json({ success: false, error: "Gallery image not found" });
    }

    const updated = await prisma.gallery.update({
      where: { id: parseInt(id) },
      data: { isApproved: true },
    });

    res.json({
      success: true,
      message: "Gallery image approved",
      image: updated,
    });
  } catch (error) {
    console.error("Error approving image:", error);
    res.status(500).json({ success: false, error: "Error approving image" });
  }
};

// ── PATCH /api/admin/gallery/:id/reject
// Reject (unapprove) an image — removes from public view but keeps in DB
exports.adminRejectGalleryImage = async (req, res) => {
  try {
    const { id } = req.params;

    const image = await prisma.gallery.findUnique({
      where: { id: parseInt(id) },
    });
    if (!image) {
      return res
        .status(404)
        .json({ success: false, error: "Gallery image not found" });
    }

    const updated = await prisma.gallery.update({
      where: { id: parseInt(id) },
      data: { isApproved: false },
    });

    res.json({
      success: true,
      message: "Gallery image rejected",
      image: updated,
    });
  } catch (error) {
    console.error("Error rejecting image:", error);
    res.status(500).json({ success: false, error: "Error rejecting image" });
  }
};

// ── DELETE /api/admin/gallery/:id
// Permanently delete an image (from DB and Azure Blob)
exports.adminDeleteGalleryImage = async (req, res) => {
  try {
    const { id } = req.params;

    const image = await prisma.gallery.findUnique({
      where: { id: parseInt(id) },
    });
    if (!image) {
      return res
        .status(404)
        .json({ success: false, error: "Gallery image not found" });
    }

    await deleteFileFromBlob(extractBlobName(image.imageUrl));
    await prisma.gallery.delete({ where: { id: parseInt(id) } });

    res.json({ success: true, message: "Gallery image deleted successfully" });
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({ success: false, error: "Error deleting image" });
  }
};

// ── PATCH /api/admin/gallery/bulk-approve
// Bulk approve multiple images at once
// Body: { ids: [1, 2, 3] }
exports.adminBulkApproveGallery = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "ids must be a non-empty array" });
    }

    const result = await prisma.gallery.updateMany({
      where: { id: { in: ids.map(Number) } },
      data: { isApproved: true },
    });

    res.json({
      success: true,
      message: `${result.count} image(s) approved`,
    });
  } catch (error) {
    console.error("Error bulk approving images:", error);
    res
      .status(500)
      .json({ success: false, error: "Error bulk approving images" });
  }
};