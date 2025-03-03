const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    res.json({ success: true, reviews });
  } catch (error) {
    console.error("Error fetching all reviews:", error);
    res.status(500).json({ error: "Error fetching reviews" });
  }
};

exports.getReviewById = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await prisma.review.findUnique({
      where: { id: parseInt(id) },
      include: { user: { select: { id, name, email } } },
    });

    if (!review)
      return res
        .status(404)
        .json({ success: false, error: "Review not found" });

    res.json({ success: true, review });
  } catch (error) {
    res.status(500).json({ success: false, error: "Error fetching review" });
  }
};

exports.getReviewsByTourPackageId = async (req, res) => {
  try {
    const { tourPackageId } = req.params;
    const reviews = await prisma.review.findMany({
      where: { tourPackageId: parseInt(tourPackageId) },
      include: { user: { select: { id, name, email } } },
    });

    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ success: false, error: "Error fetching reviews" });
  }
};

exports.createReview = async (req, res) => {
  try {
    const { tourPackageId, rating, comment } = req.body;
    const userId = req.user;

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    const newReview = await prisma.review.create({
      data: { tourPackageId: parseInt(tourPackageId), userId, rating, comment },
    });

    res.status(201).json({ success: true, newReview });
  } catch (error) {
    res.status(500).json({ success: false, error: "Error creating review" });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user;

    const existingReview = await prisma.review.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingReview)
      return res
        .status(404)
        .json({ success: false, error: "Review not found" });

    if (existingReview.userId !== userId) {
      return res
        .status(403)
        .json({ success: false, error: "Unauthorized to update this review" });
    }

    const updatedReview = await prisma.review.update({
      where: { id: parseInt(id) },
      data: { rating, comment },
    });

    res.json({ success: true, updatedReview });
  } catch (error) {
    res.status(500).json({ success: false, error: "Error updating review" });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user;

    const existingReview = await prisma.review.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingReview)
      return res
        .status(404)
        .json({ success: false, error: "Review not found" });

    if (existingReview.userId !== userId) {
      return res
        .status(403)
        .json({ success: false, error: "Unauthorized to delete this review" });
    }

    await prisma.review.delete({ where: { id: parseInt(id) } });

    res.json({ success: true, message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: "Error deleting review" });
  }
};

exports.getAverageRatingByTourPackage = async (req, res) => {
  try {
    const { tourPackageId } = req.params;

    const average = await prisma.review.aggregate({
      where: { tourPackageId: parseInt(tourPackageId) },
      _avg: { rating: true },
    });

    res.json({
      success: true,
      tourPackageId: parseInt(tourPackageId),
      averageRating: average._avg.rating || 0,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Error calculating average rating" });
  }
};
