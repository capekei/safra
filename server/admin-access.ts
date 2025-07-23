import { Router } from "express";
import type { Request, Response } from "express";

const router = Router();

// Special admin access route - this is the "top 0.1%" approach
// Direct access via /safra-admin for admins who know the URL
router.get("/safra-admin", (req: Request, res: Response) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Admin Access - SafraReport</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #f5f5f7;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          margin: 0;
          padding: 20px;
        }
        .container {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          max-width: 400px;
          width: 100%;
          text-align: center;
        }
        h1 {
          font-size: 28px;
          margin-bottom: 10px;
          color: #1d1d1f;
        }
        p {
          color: #6e6e73;
          margin-bottom: 30px;
        }
        .button {
          display: inline-block;
          background: #0071e3;
          color: white;
          padding: 12px 32px;
          border-radius: 12px;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.2s;
        }
        .button:hover {
          background: #0051d5;
          transform: translateY(-1px);
        }
        .admin-key {
          background: #f5f5f7;
          padding: 8px 16px;
          border-radius: 8px;
          font-family: monospace;
          font-size: 14px;
          color: #6e6e73;
          margin-top: 20px;
          display: inline-block;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🔐 Acceso Administrativo</h1>
        <p>Portal exclusivo para administradores de SafraReport</p>
        <a href="/admin/dashboard" class="button">Acceder al Panel Admin</a>
        <div class="admin-key">safra-admin-2025</div>
      </div>
    </body>
    </html>
  `);
});

export default router;