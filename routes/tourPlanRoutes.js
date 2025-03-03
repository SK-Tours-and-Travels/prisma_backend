const express = require("express");
const {
  getAllTourPlans,
  getTourPlanById,
  createTourPlan,
  updateTourPlan,
  deleteTourPlan,
} = require("../controllers/tourPlanController");

const router = express.Router();

router.get("/get/", getAllTourPlans);
router.get("/get/:id", getTourPlanById);
router.post("/create/", createTourPlan);
router.put("/update/:id", updateTourPlan);
router.delete("/delete/:id", deleteTourPlan);

module.exports = router;
