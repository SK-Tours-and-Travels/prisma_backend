const { PrismaClient } = require("@prisma/client");
const util = require("util");
const prisma = new PrismaClient();
const { uploadToAzure, deleteFileFromBlob } = require("../util/azureBlob");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer().array("gallery", 10);
const uploadAsync = util.promisify(upload);

exports.getAllTourCollection = async (req, res) => {
  try {
    // await uploadAsync(req, res);
    const tours = await prisma.tourCollection.findMany({
      include: { packages: true, gallery: true },
    });
    res.json({ success: true, tours });
  } catch (error) {
    res.status(500).json({ success: false, error: "Error fetching tours" });
  }
};

exports.getTourCollectionById = async (req, res) => {
  try {
    const { id } = req.params;
    const collection = await prisma.tourCollection.findUnique({
      where: { id: parseInt(id) },
      include: { packages: true, gallery: true },
    });

    if (!collection) {
      return res.status(404).json({ error: "Collection not found" });
    }

    res.json({ success: true, collection });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Error fetching collection" });
  }
};

exports.createTourCollection = async (req, res) => {
  try {
    console.log("Request Body:", req.body);
    console.log("Uploaded Files:", req.files);

    const { name, description } = req.body;
    if (!name || !description) {
      return res
        .status(400)
        .json({ success: false, error: "Name and description are required" });
    }

    const gallery = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        console.log("Processing File:", file.originalname);
        const imageUrl = await uploadToAzure(file);
        gallery.push({ imageUrl, galleryType: "COLLECTION" });
      }
    }

    const newTour = await prisma.tourCollection.create({
      data: {
        name,
        description,
        gallery: { create: gallery },
      },
      include: { gallery: true },
    });

    return res.status(201).json({ success: true, newTour });
  } catch (error) {
    console.error("Tour Collection Creation Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateTourCollection = async (req, res) => {
  try {
    await uploadAsync(req, res);
    const { id } = req.params;
    const { name, description } = req.body;

    const existingTour = await prisma.tourCollection.findUnique({
      where: { id: parseInt(id) },
      include: { gallery: true },
    });

    if (!existingTour) {
      return res
        .status(404)
        .json({ success: false, error: "Collection not found" });
    }

    if (req.files && req.files.length > 0) {
      await prisma.gallery.deleteMany({
        where: { collectionId: parseInt(id) },
      });

      const gallery = [];
      for (const file of req.files) {
        const imageUrl = await uploadToAzure(file);
        gallery.push({
          imageUrl,
          galleryType: "COLLECTION",
          collectionId: parseInt(id),
        });
      }

      await prisma.gallery.createMany({ data: gallery });
    }

    const updatedCollection = await prisma.tourCollection.update({
      where: { id: parseInt(id) },
      data: { name, description },
      include: { gallery: true },
    });

    res.json({ success: true, updatedCollection });
  } catch (error) {
    console.error("Error updating collection:", error);
    res
      .status(500)
      .json({ success: false, error: "Error updating collection" });
  }
};

exports.deleteTourCollection = async (req, res) => {
  try {
    const { id } = req.params;

    const existingTour = await prisma.tourCollection.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingTour) {
      return res
        .status(404)
        .json({ success: false, error: "Collection not found" });
    }

    const images = await prisma.gallery.findMany({
      where: { collectionId: parseInt(id) },
      select: { imageUrl: true },
    });

    const extractBlobName = (url) => url.split("/").pop();

    for (let img of images) {
      await deleteFileFromBlob(extractBlobName(img.imageUrl));
    }

    await prisma.gallery.deleteMany({
      where: { collectionId: parseInt(id) },
    });

    await prisma.tourCollection.delete({
      where: { id: parseInt(id) },
    });

    res.json({ success: true, message: "Collection deleted successfully" });
  } catch (error) {
    console.error("Error deleting collection:", error);
    res
      .status(500)
      .json({ success: false, error: "Error deleting collection" });
  }
};
