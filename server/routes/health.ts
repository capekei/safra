import { Router } from "express";
import { db } from "../db";

const router = Router();

router.get("/health", async (req, res) => {
  try {
    // Quick database health check
    await db.execute("SELECT 1 as health");
    
    res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
      },
      dominican: {
        currency: "DOP",
        mobile_optimized: true,
        network: "3G_ready"
      }
    });
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      error: error instanceof Error ? error.message : "Database connection failed",
      timestamp: new Date().toISOString()
    });
  }
});

export { router as healthRouter };