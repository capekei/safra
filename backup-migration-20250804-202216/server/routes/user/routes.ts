import { Router, type Request, type Response } from "express";
import { storage } from "../../database/storage";
import multer from "multer";
import path from "path";
import { promises as fs } from "fs";
// import { authenticateSupabase, type AuthRequest } from "../../middleware/auth"; // Temporarily disabled - using Neon/Drizzle stack

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: async (req, file, cb) => {
      const uploadDir = path.join(process.cwd(), 'uploads');
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (JPEG, PNG, WebP)'));
    }
  }
});

// Get user's classifieds
router.get("/classifieds", /* authenticateSupabase as any, */ (async (req: any, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "No autorizado" });
    }

    const classifieds = await storage.getUserClassifieds(userId);
    res.json(classifieds);
  } catch (error) {
    console.error('Error fetching user classifieds:', error);
    res.status(500).json({ message: "Error al obtener clasificados" });
  }
}));

// Create a new classified
router.post("/classifieds", /* authenticateSupabase as any, */ upload.array('images', 5), async (req: any, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "No autorizado" });
    }

    const files = req.files as Express.Multer.File[];
    const images = files.map(file => `/uploads/${file.filename}`);

    const classified = {
      ...req.body,
      userId,
      images,
      status: 'pending', // All user submissions start as pending
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    };

    // Convert string IDs to numbers
    if (classified.categoryId) classified.categoryId = parseInt(classified.categoryId);
    if (classified.provinceId) classified.provinceId = parseInt(classified.provinceId);
    if (classified.price) classified.price = classified.price.toString();

    const newClassified = await storage.createUserClassified(classified);
    res.json(newClassified);
  } catch (error) {
    console.error('Error creating classified:', error);
    res.status(500).json({ message: "Error al crear clasificado" });
  }
});

// Delete a classified
router.delete("/classifieds/:id", /* authenticateSupabase as any, */ async (req: any, res: Response) => {
  try {
    const userId = req.user?.id;
    const classifiedId = parseInt(req.params.id);
    
    if (!userId) {
      return res.status(401).json({ message: "No autorizado" });
    }

    // Check if user owns this classified
    const classified = await storage.getClassifiedById(classifiedId);
    if (!classified || classified.userId !== userId) {
      return res.status(403).json({ message: "No tienes permiso para eliminar este clasificado" });
    }

    await storage.deleteClassified(classifiedId);
    res.json({ message: "Clasificado eliminado" });
  } catch (error) {
    console.error('Error deleting classified:', error);
    res.status(500).json({ message: "Error al eliminar clasificado" });
  }
});

// Get user's reviews
router.get("/reviews", /* authenticateSupabase as any, */ (async (req: any, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "No autorizado" });
    }

    const reviews = await storage.getUserReviews(userId);
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({ message: "Error al obtener reseñas" });
  }
}) as any);

// Create a new review
router.post("/reviews", /* authenticateSupabase as any, */ upload.array('images', 3), async (req: any, res: Response) => {
  try {
    const userId = req.user?.id;
    const user = (req.session as any)?.user;
    
    if (!userId) {
      return res.status(401).json({ message: "No autorizado" });
    }

    const files = req.files as Express.Multer.File[];
    const images = files.map(file => `/uploads/${file.filename}`);

    // Check if business exists or create new one
    let businessId = req.body.businessId;
    
    if (!businessId && req.body.businessName) {
      // Check if business already exists
      const existingBusiness = await storage.getBusinessByName(req.body.businessName);
      
      if (existingBusiness) {
        businessId = existingBusiness.id;
      } else {
        // Create new business
        const slug = req.body.businessName
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();
        
        const newBusiness = await storage.createBusiness({
          name: req.body.businessName,
          slug: slug,
          categoryId: parseInt(req.body.categoryId),
          active: false, // New businesses start as inactive until verified
        });
        businessId = newBusiness.id;
      }
    }

    const review = {
      businessId: parseInt(businessId),
      reviewerName: user?.firstName && user?.lastName 
        ? `${user.firstName} ${user.lastName}` 
        : 'Usuario Anónimo',
      reviewerEmail: user?.email || null,
      rating: parseInt(req.body.rating),
      title: req.body.title,
      content: req.body.content,
      images,
      userId,
      approved: false, // All reviews start as unapproved
    };

    const newReview = await storage.createUserReview(review);
    res.json(newReview);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ message: "Error al crear reseña" });
  }
});

// Delete a review
router.delete("/reviews/:id", /* authenticateSupabase as any, */ async (req: any, res: Response) => {
  try {
    const userId = req.user?.id;
    const reviewId = parseInt(req.params.id);
    
    if (!userId) {
      return res.status(401).json({ message: "No autorizado" });
    }

    // Check if user owns this review
    const review = await storage.getReviewById(reviewId);
    if (!review || review.userId !== userId) {
      return res.status(403).json({ message: "No tienes permiso para eliminar esta reseña" });
    }

    await storage.deleteReview(reviewId);
    res.json({ message: "Reseña eliminada" });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: "Error al eliminar reseña" });
  }
});

// Get user preferences
router.get("/preferences", /* authenticateSupabase as any, */ async (req: any, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "No autorizado" });
    }

    const preferences = await storage.getUserPreferences(userId);
    res.json(preferences || {
      categories: [],
      keywords: [],
      notifications: {
        breaking: true,
        daily: false,
        weekly: false,
      }
    });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    res.status(500).json({ message: "Error al obtener preferencias" });
  }
});

// Update user preferences
router.put("/preferences", /* authenticateSupabase as any, */ async (req: any, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "No autorizado" });
    }

    const preferences = await storage.updateUserPreferences(userId, req.body);
    res.json(preferences);
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ message: "Error al actualizar preferencias" });
  }
});

// Search businesses (for review creation) - this is outside user routes
router.get("/businesses/search", async (req: any, res: Response) => {
  try {
    const query = req.query.q as string;
    if (!query || query.length < 3) {
      return res.json([]);
    }

    const businesses = await storage.searchBusinesses(query);
    res.json(businesses);
  } catch (error) {
    console.error('Error searching businesses:', error);
    res.status(500).json({ message: "Error al buscar negocios" });
  }
});

export default router;