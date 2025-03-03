const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getAllTourCollection = async (req, res) => {
  try {
    const tours = await prisma.tourCollection.findMany({
      include: { packages: true },
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
    if (!collection)
      return res.status(404).json({ error: "Collection not found" });
    res.json({ success: true, collection });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Error fetching collection" });
  }
};

exports.createTourCollection = async (req, res) => {
  try {
    const { name, description, gallery } = req.body;
    const newTour = await prisma.tourCollection.create({
      data: {
        name,
        description,
        gallery: {
          create: gallery.map((image) => ({
            imageUrl: image.imageUrl,
          })),
        },
      },
      include: { gallery: true },
    });
    res.status(201).json({ success: true, newTour });
  } catch (error) {
    res.status(500).json({ success: false, error: "Error creating tour" });
  }
};

exports.updateTourCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, gallery } = req.body;

    const existingTour = await prisma.tourCollection.findUnique({
      where: { id: parseInt(id) },
w
    });

    if (!existingTour) {
      return res
        .status(404)
        .json({ success: false, error: "Collection not found" });
    }

    const updatedCollection = await prisma.tourCollection.update({
      where: { id: parseInt(id) },
      data: { name, description },
    });

    if (gallery && gallery.length > 0) {
      await prisma.gallery.createMany({
        data: gallery.map((image) => ({
          imageUrl: image.imageUrl,
          collectionId: parseInt(id),
        })),
        skipDuplicates: true,
      });
    }

    const updatedCollectionWithGallery = await prisma.tourCollection.findUnique(
      {
        where: { id: parseInt(id) },
        include: { gallery: true },
      }
    );

    res.json({
      success: true,
      updatedCollection: updatedCollectionWithGallery,
    });
  } catch (error) {
    console.error(error);
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
        .json({ success: false, error: "Package not found" });
    }

    await prisma.tourCollection.delete({
      where: { id: parseInt(id) },
    });
    res.json({ success: true, message: "Collection deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Error deleting collection" });
  }
};
