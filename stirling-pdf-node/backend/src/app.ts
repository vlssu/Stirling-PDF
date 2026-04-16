import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";

import { generalRouter } from "./controllers/general/index";
import { securityRouter } from "./controllers/security/index";
import { miscRouter } from "./controllers/misc/index";
import { convertersRouter } from "./controllers/converters/index";
import { filtersRouter } from "./controllers/filters/index";
import { errorHandler } from "./middleware/errorHandler";

const app = express();
const PORT = parseInt(process.env.PORT ?? "3001", 10);

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------
app.use(cors());
app.use(morgan("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------------------------------------------------------------------------
// API routes
// ---------------------------------------------------------------------------
app.use("/api/v1/general", generalRouter);
app.use("/api/v1/security", securityRouter);
app.use("/api/v1/misc", miscRouter);
app.use("/api/v1/convert", convertersRouter);
app.use("/api/v1/filter", filtersRouter);

// Health-check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "stirling-pdf-backend" });
});

// ---------------------------------------------------------------------------
// Serve built Vue SPA in production
// ---------------------------------------------------------------------------
const frontendDist = path.resolve(__dirname, "../../frontend/dist");

app.use(express.static(frontendDist));
app.get("*", (_req, res) => {
  res.sendFile(path.join(frontendDist, "index.html"));
});

// ---------------------------------------------------------------------------
// Error handling (must be registered after all routes)
// ---------------------------------------------------------------------------
app.use(errorHandler);

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`[stirling-pdf] Backend listening on http://localhost:${PORT}`);
});

export default app;
