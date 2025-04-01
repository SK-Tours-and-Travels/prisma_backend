const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getStatistics = async (req, res) => {
  try {
    const collectionsCount = await prisma.tourCollection.count();
    const packagesCount = await prisma.tourPackage.count();
    const usersCount = await prisma.user.count();
    const reviewCount = await prisma.review.count();

    return res.json({
      success: true,
      data: {
        collections: collectionsCount,
        packages: packagesCount,
        users: usersCount,
        reviews:reviewCount,
      },
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
