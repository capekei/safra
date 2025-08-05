import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { type Server } from "http";
import { nanoid } from "nanoid";

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

}

export async function setupVite(app: Express, server: Server) {
  try {
    
    // Skip Vite setup in production - should use serveStatic instead
    if (process.env.NODE_ENV === 'production') {
      return;
    }
    
    // Dynamic import for development-only dependencies
    const { createServer: createViteServer, createLogger } = await import("vite");
    
    const viteLogger = createLogger();
    
    // Inline Vite config without dev-only plugins to avoid imports
    const inlineViteConfig = {
      resolve: {
        alias: {
          "@": path.resolve(import.meta.dirname, "..", "client", "src"),
          "@shared": path.resolve(import.meta.dirname, "..", "shared"),
          "@assets": path.resolve(import.meta.dirname, "..", "attached_assets"),
        },
      },
      root: path.resolve(import.meta.dirname, "..", "client"),
      server: {
        middlewareMode: true,
        hmr: { server },
        allowedHosts: true as const,
      },
      appType: "custom" as const,
      configFile: false as const,
    };

    const vite = await createViteServer({
      ...inlineViteConfig,
      customLogger: {
        ...viteLogger,
        error: (msg, options) => {
          console.error('🔥 Vite middleware error:', msg);
          if (options?.error) {
            console.error('🔍 Error details:', options.error);
          }
          // Log and continue instead of killing the process
          viteLogger.error(msg, options);
        },
      },
    });

    
    app.use(vite.middlewares);
    
    app.use("*", async (req, res, next) => {
      const url = req.originalUrl;

      // Skip API routes and uploads
      if (url.startsWith('/api') || url.startsWith('/uploads')) {
        return next();
      }

      try {
        const clientTemplate = path.resolve(
          import.meta.dirname,
          "..",
          "client",
          "index.html",
        );

        // always reload the index.html file from disk incase it changes
        let template = await fs.promises.readFile(clientTemplate, "utf-8");
        template = template.replace(
          `src="/src/main.tsx"`,
          `src="/src/main.tsx?v=${nanoid()}"`,
        );
        const page = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(page);
      } catch (e) {
        console.error('🔥 Vite SSR error:', e);
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
    
  } catch (error) {
    console.error('❌ FATAL: Failed to setup Vite middleware:', error);
    console.error('🔧 Server will continue without Vite middleware');
    // Continue without Vite instead of crashing
  }
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(import.meta.dirname, "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
