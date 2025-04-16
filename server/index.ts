import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import dotenv from 'dotenv';

// Load environment variables from .env file 
// This needs to be done as early as possible
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    
    // In development, rethrow the error for better debugging
    // In production, just log it without crashing the server
    if (process.env.NODE_ENV === 'development') {
      throw err;
    } else {
      console.error('Server Error:', err);
    }
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Use the PORT environment variable if provided, or default to 5000
  // This serves both the API and the client.
  let port = process.env.PORT ? parseInt(process.env.PORT) : 5000;
  
  // Default to 0.0.0.0 to bind to all available network interfaces
  // This is better for Docker and cloud environments
  const host = process.env.HOST || "0.0.0.0";
  
  // Function to try binding to port, with fallback to random available port 
  const startServer = (attemptPort: number) => {
    server.listen({ port: attemptPort, host })
      .on('listening', () => {
        const address = server.address();
        const actualPort = typeof address === 'object' && address ? address.port : attemptPort;
        
        log(`serving on port ${actualPort}`);
        
        // If binding to anything other than localhost/127.0.0.1, show both addresses
        if (host !== "127.0.0.1" && host !== "localhost") {
          log(`App available at: http://${host}:${actualPort} and http://localhost:${actualPort}`);
        } else {
          log(`App available at: http://localhost:${actualPort}`);
        }
      })
      .on('error', (error: any) => {
        // If the port is already in use, try a different port
        if (error.code === 'EADDRINUSE') {
          log(`Port ${attemptPort} is already in use, trying port ${attemptPort + 1}`);
          startServer(attemptPort + 1);
        } else {
          console.error('Failed to start server:', error);
          process.exit(1);
        }
      });
  };
  
  // Start the server with the initial port
  startServer(port);
})();
