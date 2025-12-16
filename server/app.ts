import "dotenv/config";

import { type Server } from "node:http";
import express, {
  type Express,
  type Request,
  type Response,
  type NextFunction,
} from "express";

import session from "express-session";
import MongoStore from "connect-mongo";
import cors from "cors";

import { registerRoutes } from "./routes";
import { connectDB, seedDatabase } from "./db";

/* ---------------- Logger ---------------- */

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

/* ---------------- App Init ---------------- */

export const app = express();

/* ---------------- MongoDB Connection ---------------- */

await connectDB();

/* ---------------- CORS (MUST BE BEFORE SESSION) ---------------- */

app.use(
  cors({
    origin: "http://localhost:5173", // React frontend
    credentials: true,               // 🔥 allow cookies
  })
);

/* ---------------- Session (MongoDB) ---------------- */

app.use(
  session({
    name: "eduadmitsid",
    store: MongoStore.create({
      mongoUrl: (process.env.MONGO_URI || process.env.MONGODB_URI) as string,
      collectionName: "sessions",
    }),
    secret: process.env.SESSION_SECRET || "dev_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,        // true in production (HTTPS)
      sameSite: "lax",      // 🔥 required for localhost
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  })
);

/* ---------------- Body Parsers ---------------- */

declare module "http" {
  interface IncomingMessage {
    rawBody?: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  })
);

app.use(express.urlencoded({ extended: false }));

/* ---------------- Request Logger ---------------- */

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: any;

  const originalResJson = res.json.bind(res);
  res.json = (body: any) => {
    capturedJsonResponse = body;
    return originalResJson(body);
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

/* ---------------- Run App ---------------- */

export default async function runApp(
  setup: (app: Express, server: Server) => Promise<void>,
) {
  await seedDatabase();

  const server = await registerRoutes(app);

  app.use(
    (err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
      throw err;
    }
  );

  await setup(app, server);

  const port = parseInt(process.env.PORT || "5000", 10);

  server.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`🚀 Server running on port ${port}`);
    }
  );
}
