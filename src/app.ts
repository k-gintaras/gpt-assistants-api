import express from "express";
import swaggerUi from "swagger-ui-express";
import dotenv from "dotenv";
import cors from "cors";
import { getDb } from "./database/database";
import { homePageHandler } from "./homepage";
import { RegisterRoutes } from "./routes";  // auto-generated
import swaggerDocument from "./swagger.json";  // auto-generated

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:3001", "http://localhost:3000", "http://localhost:4200", /^http:\/\/192\.168\.\d+\.\d+:300[01]$/, /^http:\/\/192\.168\.\d+\.\d+:4200$/],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

async function startServer() {
  console.log("🔧 Starting server initialization...");
  const db = getDb();
  db.setFeedbackEnabled(true);
  await db.initialize();
  console.log("✅ Database initialized");

  try {
    console.log("📝 About to register routes...");
    RegisterRoutes(app);  // tsoa picks up all controllers
    console.log("✅ Routes registered successfully!");
  } catch (error: any) {
    console.error("❌ Failed to register routes:", error.message, error.stack);
  }

  // Error handler middleware - must be AFTER RegisterRoutes
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    
    console.error(`❌ Error [${status}]:`, message);
    
    res.status(status).json({
      error: message,
      status: status
    });
  });

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  app.get("/", homePageHandler);

  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
}

export default app;

if (require.main === module) {
  startServer();
}
