const express = require("express");
const cors = require("cors");
const axios = require("axios");
const dotenv = require("dotenv");
const crypto = require("crypto");

dotenv.config();

const app = express();

const PORT = Number(process.env.PORT || 5000);
const HOST = process.env.HOST || "0.0.0.0";
const AI_LAYER_URL = process.env.AI_LAYER_URL || "http://127.0.0.1:8000";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const REQUEST_TIMEOUT_MS = Number(process.env.REQUEST_TIMEOUT_MS || 180000);

// Optional public API bearer token. When unset, /api routes remain open for local development.
const API_BEARER_TOKEN = process.env.API_BEARER_TOKEN || "";

// Server-to-server secret used by Express when calling FastAPI.
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || "";

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left || ""));
  const rightBuffer = Buffer.from(String(right || ""));

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function isPrivateNetworkOrigin(origin) {
  if (!origin) return true;
  if (/^http:\/\/localhost:\d+$/.test(origin)) return true;
  if (/^http:\/\/127\.0\.0\.1:\d+$/.test(origin)) return true;
  if (/^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:\d+$/.test(origin)) return true;
  if (/^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d+$/.test(origin)) return true;
  if (/^http:\/\/172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}:\d+$/.test(origin)) return true;
  return false;
}

app.use(
  cors({
    origin(origin, callback) {
      if (origin === FRONTEND_URL || isPrivateNetworkOrigin(origin)) {
        return callback(null, true);
      }

      console.log("Blocked CORS origin:", origin);
      return callback(new Error("Origin not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.use(express.json({ limit: "10mb" }));

function requireBearerToken(req, res, next) {
  if (!API_BEARER_TOKEN) {
    return next();
  }

  const authorization = req.get("authorization") || "";
  const prefix = "Bearer ";

  if (!authorization.startsWith(prefix)) {
    return res.status(401).json({
      success: false,
      message: "Authentication required. Send Authorization: Bearer <token>."
    });
  }

  const token = authorization.slice(prefix.length).trim();

  if (!safeEqual(token, API_BEARER_TOKEN)) {
    return res.status(401).json({
      success: false,
      message: "Invalid bearer token."
    });
  }

  return next();
}

const aiHeaders = {
  "Content-Type": "application/json"
};

if (INTERNAL_API_KEY) {
  aiHeaders["x-internal-key"] = INTERNAL_API_KEY;
}

const aiClient = axios.create({
  baseURL: AI_LAYER_URL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: aiHeaders
});

function handleAIError(error, res) {
  console.error("AI Layer Error:", error.message);

  if (error.response) {
    return res.status(error.response.status || 500).json({
      success: false,
      message: "AI Layer returned an error.",
      error: error.response.data
    });
  }

  if (error.request) {
    return res.status(503).json({
      success: false,
      message: "Unable to connect to AI Layer.",
      detail: `Make sure FastAPI is running at ${AI_LAYER_URL}`
    });
  }

  return res.status(500).json({
    success: false,
    message: "Backend request failed.",
    detail: error.message
  });
}

app.get("/", (req, res) => {
  res.json({
    success: true,
    service: "NewsPulse Backend",
    status: "online",
    ai_layer: AI_LAYER_URL,
    api_auth_enabled: Boolean(API_BEARER_TOKEN),
    internal_auth_enabled: Boolean(INTERNAL_API_KEY)
  });
});

app.get("/health", async (req, res) => {
  try {
    const response = await aiClient.get("/health");
    return res.json({
      success: true,
      backend: "healthy",
      ai_layer: response.data
    });
  } catch (error) {
    return handleAIError(error, res);
  }
});

// Everything below /api is protected when API_BEARER_TOKEN is configured.
app.use("/api", requireBearerToken);

app.post("/api/orchestrate", async (req, res) => {
  try {
    const response = await aiClient.post("/orchestrate", req.body);
    return res.json({ success: true, data: response.data });
  } catch (error) {
    return handleAIError(error, res);
  }
});

app.post("/api/brief", async (req, res) => {
  try {
    const response = await aiClient.post("/brief", req.body);
    return res.json({ success: true, data: response.data });
  } catch (error) {
    return handleAIError(error, res);
  }
});

app.post("/api/delta", async (req, res) => {
  try {
    const response = await aiClient.post("/delta", req.body);
    return res.json({ success: true, data: response.data });
  } catch (error) {
    return handleAIError(error, res);
  }
});

app.post("/api/evidence", async (req, res) => {
  try {
    const response = await aiClient.post("/evidence", req.body);
    return res.json({ success: true, data: response.data });
  } catch (error) {
    return handleAIError(error, res);
  }
});

app.post("/api/impact", async (req, res) => {
  try {
    const response = await aiClient.post("/impact", req.body);
    return res.json({ success: true, data: response.data });
  } catch (error) {
    return handleAIError(error, res);
  }
});

app.get("/api/news/latest", async (req, res) => {
  try {
    const response = await aiClient.get("/news/latest", { params: { ...req.query } });
    return res.json({ success: true, data: response.data });
  } catch (error) {
    return handleAIError(error, res);
  }
});

app.get("/api/news/clusters", async (req, res) => {
  try {
    const response = await aiClient.get("/news/clusters", { params: { ...req.query } });
    return res.json({ success: true, data: response.data });
  } catch (error) {
    return handleAIError(error, res);
  }
});

app.get("/api/stories", async (req, res) => {
  try {
    const response = await aiClient.get("/stories");
    return res.json({ success: true, data: response.data });
  } catch (error) {
    return handleAIError(error, res);
  }
});

app.get("/api/stories/:storyId", async (req, res) => {
  try {
    const response = await aiClient.get(`/stories/${req.params.storyId}`);
    return res.json({ success: true, data: response.data });
  } catch (error) {
    return handleAIError(error, res);
  }
});

app.post("/api/stories", async (req, res) => {
  try {
    const response = await aiClient.post("/stories", req.body);
    return res.json({ success: true, data: response.data });
  } catch (error) {
    return handleAIError(error, res);
  }
});

app.post("/api/stories/:storyId/update", async (req, res) => {
  try {
    const response = await aiClient.post(`/stories/${req.params.storyId}/update`, req.body);
    return res.json({ success: true, data: response.data });
  } catch (error) {
    return handleAIError(error, res);
  }
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "NewsPulse route not found."
  });
});

app.listen(PORT, HOST, () => {
  console.log();
  console.log("========================================");
  console.log("NEWSPULSE BACKEND STARTED");
  console.log("========================================");
  console.log(`Host: ${HOST}`);
  console.log(`Backend Port: ${PORT}`);
  console.log(`AI Layer: ${AI_LAYER_URL}`);
  console.log(`API bearer auth: ${API_BEARER_TOKEN ? "enabled" : "disabled"}`);
  console.log(`Internal AI auth: ${INTERNAL_API_KEY ? "enabled" : "disabled"}`);
  console.log("========================================");
});
