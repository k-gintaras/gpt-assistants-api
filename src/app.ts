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
    origin: "http://localhost:4200",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

async function startServer() {
  const db = getDb();
  db.setFeedbackEnabled(true);
  await db.initialize();
  console.log("✅ Database initialized");

  RegisterRoutes(app);  // tsoa picks up all controllers

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
