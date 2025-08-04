import { Router } from "express";
import { db } from "../db";

const router = Router();

router.get("/health", async (req, res) => {
  const response: any = {
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
    },
    database: { status: "unknown" }
  };

  try {
    // Optional database health check - don't fail deployment if DB is unavailable
    await db.execute("SELECT 1 as health");
    response.database = { status: "connected" };
  } catch (error) {
    // Database not available, but service is still healthy for deployment
    response.database = {
      status: "disconnected",
      error: error instanceof Error ? error.message : "Database connection failed"
    };
  }

  // Always return 200 for basic health check - deployment should not fail
  res.status(200).json(response);
});

export { router as healthRouter };