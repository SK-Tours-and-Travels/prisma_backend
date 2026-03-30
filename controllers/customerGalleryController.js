// controllers/customerGallery.controller.js
// Customers submit photos for a tour package → stored with isApproved: false
// Admin approves/rejects via separate endpoints (adminGallery.controller.js)

const { PrismaClient } = require("@prisma/client");
const { uploadToAzure, deleteFileFromBlob } = require("../util/azureBlob");
const prisma = new PrismaClient();

// ── POST /api/customer/gallery
// Body (multipart/form-data):
//   - packageId   (required)  — which tour the photo belongs to
//   - name        (required)  — submitter name
//   - email       (optional)  — submitter email
//   - images      (required)  — up to 5 files
exports.submitGalleryImages = async (req, res) => {
  try {
    const { packageId, name, email } = req.body;

    if (!packageId) {
      return res
        .status(400)
        .json({ success: false, error: "packageId is required" });
    }
    if (!name || name.trim().length < 2) {
      return res
        .status(400)
        .json({ success: false, error: "A valid name is required" });
    }
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "At least one image is required" });
    }

    // Verify the package exists
    const tourPackage = await prisma.tourPackage.findUnique({
      where: { id: parseInt(packageId) },
      select: { id: true, name: true },
    });
    if (!tourPackage) {
      return res
        .status(404)
        .json({ success: false, error: "Tour package not found" });
    }

    // Upload each image to Azure and build gallery records
    const galleryRecords = [];
    for (const file of req.files) {
      const imageUrl = await uploadToAzure(file);
      galleryRecords.push({
        imageUrl,
        galleryType: "PACKAGE",
        packageId: parseInt(packageId),
        isApproved: false,           // awaits admin approval
        submittedBy: name.trim(),
        submittedEmail: email?.trim() || null,
      });
    }

    const created = await prisma.gallery.createMany({
      data: galleryRecords,
    });

    res.status(201).json({
      success: true,
      message: `${created.count} image(s) submitted successfully and are pending admin approval.`,
    });
  } catch (error) {
    console.error("Error submitting gallery images:", error);
    res
      .status(500)
      .json({ success: false, error: "Error submitting gallery images" });
  }
};

// ── GET /api/customer/gallery/package/:packageId
// Returns ONLY approved images for a given package (public-facing)
exports.getApprovedGalleryByPackage = async (req, res) => {
  try {
    const { packageId } = req.params;

    const images = await prisma.gallery.findMany({
      where: {
        packageId: parseInt(packageId),
        isApproved: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, images });
  } catch (error) {
    console.error("Error fetching gallery:", error);
    res.status(500).json({ success: false, error: "Error fetching gallery" });
  }
};

// ── GET /api/customer/gallery/collection/:collectionId
// Returns ONLY approved images for a given collection (public-facing)
exports.getApprovedGalleryByCollection = async (req, res) => {
  try {
    const { collectionId } = req.params;

    const images = await prisma.gallery.findMany({
      where: {
        collectionId: parseInt(collectionId),
        isApproved: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, images });
  } catch (error) {
    console.error("Error fetching gallery:", error);
    res.status(500).json({ success: false, error: "Error fetching gallery" });
  }
};

exports.getAllApprovedGallery = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const images = await prisma.gallery.findMany({
      where: {
        isApproved: true,
      },
      orderBy: { createdAt: "desc" },
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      include: {
        package: { select: { id: true, name: true } },
        collection: { select: { id: true, name: true } },
      },
    });

    const total = await prisma.gallery.count({ where: { isApproved: true } });

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