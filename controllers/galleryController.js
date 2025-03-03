const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getAllGalleryImages = async (req, res) => {
  try {
    const images = await prisma.gallery.findMany({
      include: { tourPackage: true },
    });
    res.json({ success: true, images });
  } catch (error) {
    res.status(500).json({ error: "Error fetching gallery images" });
  }
};

exports.getGalleryImageById = async (req, res) => {
  try {
    const { id } = req.params;
    const image = await prisma.gallery.findUnique({
      where: { id: parseInt(id) },
      include: { tourPackage: true },
    });

    if (!image) {
      return res
        .status(404)
        .json({ success: false, error: "Gallery image not found" });
    }

    res.json(image);
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Error fetching gallery image" });
  }
};

exports.createGalleryImage = async (req, res) => {
  try {
    const { tourPackageId, imageUrl } = req.body;

    const newImage = await prisma.gallery.create({
      data: {
        tourPackageId,
        imageUrl,
      },
    });

    res.status(201).json({ succcess: true, newImage });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Error adding image to gallery" });
  }
};

exports.updateGalleryImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { imageUrl } = req.body;

    const updatedImage = await prisma.gallery.update({
      where: { id: parseInt(id) },
      data: { imageUrl },
    });

    res.json({ success: true, updatedImage });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Error updating gallery image" });
  }
};

exports.deleteGalleryImage = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.gallery.delete({
      where: { id: parseInt(id) },
    });

    res.json({ success: true, message: "Gallery image deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Error deleting gallery image" });
  }
};
