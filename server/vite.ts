import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  try {
    console.log('🔄 Setting up Vite middleware...');
    
    const serverOptions = {
      middlewareMode: true,
      hmr: { server },
      allowedHosts: true as const,
    };

    const vite = await createViteServer({
      ...viteConfig,
      configFile: false,
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
      server: serverOptions,
      appType: "custom",
    });

    console.log('✅ Vite server created successfully');
    
    app.use(vite.middlewares);
    console.log('✅ Vite middlewares registered');
    
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
    
    console.log('✅ Vite catch-all handler registered');
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
