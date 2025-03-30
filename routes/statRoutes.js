import express from "express";
import { getStatistics } from "../controllers/statController";

const router = express.Router();

router.get("/get", getStatistics);

export default router;
