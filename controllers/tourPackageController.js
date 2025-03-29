const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const {
  uploadToAzure,
  uploadFileToBlob,
  deleteFileFromBlob,
} = require("../util/azureBlob");
const multer = require("multer");
const { parse } = require("dotenv");

const storage = multer.memoryStorage();
const upload = multer({ storage });

exports.getAllTourPackages = async (req, res) => {
  try {
    const packages = await prisma.tourPackage.findMany({
      include: {
        collection: true,
        tourPlans: true,
        gallery: true,
        reviews: true,
        destinations: true,
      },
    });
    res.json({ success: true, packages });
  } catch (error) {
    res.status(500).json({ success: false, error: "Error fetching packages" });
  }
};

exports.getTourPackagesById = async (req, res) => {
  try {
    const { id } = req.params;
    const packages = await prisma.tourPackage.findUnique({
      where: { id: parseInt(id) },
      include: {
        collection: true,
        tourPlans: true,
        gallery: true,
        reviews: true,
        destinations: true,
      },
    });
    if (!packages) {
      return res
        .status(404)
        .json({ success: false, error: "Collection doesn't exist" });
    }
    res.json({ success: true, packages });
  } catch (error) {
    res.status(500).json({ success: false, error: "Error fetching packages" });
  }
};

exports.createTourPackage = async (req, res) => {
  try {
    const {
      name,
      collectionId,
      date,
      month,
      description,
      duration,
      guests,
      priceAdult,
      priceChild,
      tourPlans = "[]",
      destinations = "[]",
    } = req.body;

    let parsedTourPlans;
    let parsedDestinations;
    try {
      parsedTourPlans = JSON.parse(tourPlans);
      if (!Array.isArray(parsedTourPlans)) {
        throw new Error("tourPlans must be an array");
      }
    } catch (err) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid tourPlans format" });
    }

    try {
      parsedDestinations = JSON.parse(destinations);
      if (!Array.isArray(parsedDestinations)) {
        throw new Error("tourPlans must be an array");
      }
    } catch (err) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid tourPlans format" });
    }

    const gallery = req.files["gallery"] || [];
    const document = req.files["document"] || [];
    let galleryUrls = [];
    if (gallery && gallery.length > 0) {
      galleryUrls = await Promise.all(
        gallery.map(async (file) => {
          return await uploadToAzure(
            file.buffer,
            file.originalname,
            file.mimetype
          );
        })
      );
    }

    let documentUrl = null;
    if (document && document.length > 0) {
      documentUrl = await uploadFileToBlob(
        document[0].buffer,
        document[0].originalname,
        document[0].mimetype
      );
    }

    const newPackage = await prisma.tourPackage.create({
      data: {
        name,
        collectionId: parseInt(collectionId),
        document: documentUrl,
        date: new Date(date),
        month,
        description,
        duration,
        guests: parseInt(guests),
        priceAdult: parseInt(priceAdult),
        priceChild: parseInt(priceChild),
        gallery: {
          create: galleryUrls.map((imageUrl) => ({
            imageUrl,
            galleryType: "PACKAGE",
          })),
        },
        tourPlans: {
          create: parsedTourPlans.map((plan) => ({
            from: plan.from,
            to: plan.to,
            description: plan.description,
            stepOrder: plan.stepOrder,
          })),
        },
        destinations: {
          create: parsedDestinations.map((place) => ({
            name: place.name,
          })),
        },
      },
      include: { gallery: true, tourPlans: true, destinations: true },
    });

    res.status(201).json({ success: true, newPackage });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, error: "Error creating tour package" });
  }
};

exports.updateTourPackage = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      collectionId,
      date,
      month,
      description,
      duration,
      guests,
      priceAdult,
      priceChild,
      tourPlans = "[]",
      destinations = "[]",
    } = req.body;

    let parsedTourPlans;
    let parsedDestinations;
    try {
      parsedTourPlans = JSON.parse(tourPlans);
      if (!Array.isArray(parsedTourPlans)) {
        throw new Error("tourPlans must be an array");
      }
    } catch (err) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid tourPlans format" });
    }

    try {
      parsedDestinations = JSON.parse(destinations);
      if (!Array.isArray(parsedDestinations)) {
        throw new Error("tourPlans must be an array");
      }
    } catch (err) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid tourPlans format" });
    }

    const gallery = req.files["gallery"] || [];
    let galleryUrls = [];
    if (gallery.length > 0) {
      galleryUrls = await Promise.all(
        gallery.map(async (file) => {
          return await uploadToAzure(
            file.buffer,
            file.originalname,
            file.mimetype
          );
        })
      );
    }

    await prisma.tourPlan.deleteMany({ where: { tourId: parseInt(id) } });
    await prisma.gallery.deleteMany({ where: { packageId: parseInt(id) } });

    const updatedPackage = await prisma.tourPackage.update({
      where: { id: parseInt(id) },
      data: {
        name,
        collectionId: parseInt(collectionId),
        date: new Date(date),
        month,
        description,
        duration,
        guests,
        priceAdult,
        priceChild,
        gallery: {
          create: galleryUrls.map((imageUrl) => ({
            imageUrl,
            galleryType: "PACKAGE",
            packageId: parseInt(id),
          })),
        },
        tourPlans: {
          create: parsedTourPlans.map((plan) => ({
            from: plan.from,
            to: plan.to,
            description: plan.description,
            stepOrder: plan.stepOrder,
          })),
        },
        destinations: {
          create: parsedDestinations.map((place) => ({
            name: place.name,
          })),
        },
      },
      include: { gallery: true, tourPlans: true, destinations: true },
    });

    res.json({ success: true, updatedPackage });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, error: "Error updating tour package" });
  }
};

exports.deleteTourPackage = async (req, res) => {
  try {
    const { id } = req.params;

    const images = await prisma.gallery.findMany({
      where: { packageId: parseInt(id) },
      select: { imageUrl: true },
    });

    const packageData = await prisma.tourPackage.findUnique({
      where: { id: parseInt(id) },
      select: { document: true },
    });

    const extractBlobName = (url) => url.split("/").pop();

    for (let img of images) {
      await deleteFileFromBlob(extractBlobName(img.imageUrl));
    }

    if (packageData?.document) {
      await deleteFileFromBlob(extractBlobName(packageData.document));
    }

    await prisma.tourPlan.deleteMany({ where: { tourId: parseInt(id) } });
    await prisma.gallery.deleteMany({ where: { packageId: parseInt(id) } });
    await prisma.tourPackage.delete({ where: { id: parseInt(id) } });
    await prisma.tourDestination.deleteMany({
      where: { tourPackageId: parseInt(id) },
    });
    res.json({ success: true, message: "Tour package deleted successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, error: "Error deleting tour package" });
  }
};
