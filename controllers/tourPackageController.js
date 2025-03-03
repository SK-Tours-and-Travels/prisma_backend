const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getAllTourPackages = async (req, res) => {
  try {
    const packages = await prisma.tourPackage.findMany({
      include: {
        collection: true,
        tourPlans: true,
        gallery: true,
        reviews: true,
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
      collectionId,
      gallery,
      document,
      date,
      description,
      duration,
      guests,
      priceAdult,
      priceChild,
      tourPlans,
    } = req.body;

    const newPackage = await prisma.tourPackage.create({
      data: {
        collectionId,
        document,
        date: new Date(date),
        description,
        duration,
        guests,
        priceAdult,
        priceChild,
        gallery: {
          create: gallery.map((image) => ({
            imageUrl: image.imageUrl,
          })),
        },
        tourPlans: {
          create: tourPlans.map((plan) => ({
            from: plan.from,
            to: plan.to,
            description: plan.description,
            stepOrder: plan.stepOrder,
          })),
        },
      },
      include: { gallery: true, tourPlans: true },
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

    const existingPackage = await prisma.tourPackage.findUnique({
      where: { id: parseInt(id) },
      include: { tourPlans: true },
    });

    if (!existingPackage) {
      return res
        .status(404)
        .json({ success: false, error: "Package not found" });
    }

    const {
      collectionId,
      document,
      date,
      description,
      duration,
      guests,
      priceAdult,
      priceChild,
      tourPlans,
    } = req.body;

    const updatedPackage = await prisma.tourPackage.update({
      where: { id: parseInt(id) },
      data: {
        collectionId,
        document,
        date: new Date(date),
        description,
        duration,
        guests,
        priceAdult,
        priceChild,
        tourPlans: {
          upsert: tourPlans.map((plan) => ({
            where: { id: plan.id || 0 },
            update: {
              from: plan.from,
              to: plan.to,
              description: plan.description,
              stepOrder: plan.stepOrder,
            },
            // create: {
            //   from: plan.from,
            //   to: plan.to,
            //   description: plan.description,
            //   stepOrder: plan.stepOrder,
            // },
          })),
        },
      },
      include: { gallery: true, tourPlans: true },
    });

    if (gallery && gallery.length > 0) {
      await prisma.gallery.createMany({
        data: gallery.map((image) => ({
          imageUrl: image.imageUrl,
          packageId: parseInt(id),
        })),
      });
    }

    const updatedPackageWithGallery = await prisma.tourPackage.findUnique({
      where: { id: parseInt(id) },
      include: { gallery: true },
    });

    res.json({ success: true, updatedPackageWithGallery });
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

    const existingPackage = await prisma.tourPackage.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingPackage) {
      return res
        .status(404)
        .json({ success: false, error: "Package not found" });
    }

    await prisma.tourPlan.deleteMany({
      where: { tourId: parseInt(id) },
    });

    await prisma.gallery.deleteMany({
      where: { packageId: parseInt(id) },
    });

    await prisma.tourPackage.delete({
      where: { id: parseInt(id) },
    });

    res.json({ success: true, message: "Tour package deleted successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, error: "Error deleting tour package" });
  }
};
