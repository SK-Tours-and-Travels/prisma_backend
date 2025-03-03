const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getAllTourPlans = async (req, res) => {
  try {
    const plans = await prisma.tourPlan.findMany({
      include: { tour: true },
    });
    res.json({ success: true, plans });
  } catch (error) {
    console.error("Error fetching tour plans:", error);
    res.status(500).json({ success: false, error: "Error fetching tour plans" });
  }
};


exports.getTourPlanById = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await prisma.tourPlan.findUnique({
      where: { id: parseInt(id) },
      include: { tour: true },
    });

    if (!plan) {
      return res
        .status(404)
        .json({ success: false, error: "Tour plan not found" });
    }

    res.json(plan);
  } catch (error) {
    res.status(500).json({ success: false, error: "Error fetching tour plan" });
  }
};

exports.createTourPlan = async (req, res) => {
  try {
    const { tourPackageId, from, to, description, stepOrder } = req.body;

    const newPlan = await prisma.tourPlan.create({
      data: {
        tourPackageId,
        from,
        to,
        description,
        stepOrder,
      },
    });

    res.status(201).json({ success: true, newPlan });
  } catch (error) {
    res.status(500).json({ success: false, error: "Error creating tour plan" });
  }
};

exports.updateTourPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { from, to, description, stepOrder } = req.body;

    const updatedPlan = await prisma.tourPlan.update({
      where: { id: parseInt(id) },
      data: {
        from,
        to,
        description,
        stepOrder,
      },
    });

    res.json({ success: true, updatedPlan });
  } catch (error) {
    res.status(500).json({ success: false, error: "Error updating tour plan" });
  }
};

exports.deleteTourPlan = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.tourPlan.delete({
      where: { id: parseInt(id) },
    });

    res.json({ success: true, message: "Tour plan deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: "Error deleting tour plan" });
  }
};
