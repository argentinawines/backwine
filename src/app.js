import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";
import dotenv from "dotenv";
import multer from "multer";

import "./utils/Passport.js";

import userRoute from "./routes/user.routes.js";
import productRoute from "./routes/product.routes.js";
import cartRoute from "./routes/cart.routes.js";
import authRoutes from "./routes/auth.routes.js";
import cloudinaryRoutes from "./routes/cloudinary.routes.js";
import migrateRoutes from "./routes/migrate.routes.js";
import orderRoute from "./routes/order.routes.js";

dotenv.config();

const app = express();

/* -------------------------------------------------------
   Trust proxy (Render / reverse proxy)
------------------------------------------------------- */
app.set("trust proxy", 1);

/* -------------------------------------------------------
   Middlewares globales
------------------------------------------------------- */
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());
app.use(morgan("dev"));

/* -------------------------------------------------------
   CORS (solo tus dominios)
------------------------------------------------------- */
const allowedOrigins = new Set([
  "https://argentinawineshipping.com",
  "https://www.argentinawineshipping.com",
  // opcional (para pruebas):
  "http://localhost:3000",
]);

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin && allowedOrigins.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin"); // importante para caches/proxies
  }

  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, DELETE"
  );

  // Responder preflight rápido
  if (req.method === "OPTIONS") return res.sendStatus(204);

  next();
});

/* -------------------------------------------------------
   Multer (solo en memoria)
------------------------------------------------------- */
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

app.use((req, res, next) => {
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "imagesArray", maxCount: 10 },
  ])(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: err.message });
    }
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    next();
  });
});

/* -------------------------------------------------------
   Sesión + Passport
------------------------------------------------------- */
const isProd = process.env.NODE_ENV === "production";

const sessionConfig = {
  name: "sid",
  secret: process.env.SESSION_SECRET || "default_secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd, // en Render debe ser true (https)
    maxAge: 1000 * 60 * 60 * 12, // 12h
  },
};

app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());

/* -------------------------------------------------------
   Health
------------------------------------------------------- */
app.get("/", (req, res) => {
  res.status(200).json({ ok: true, service: "backwine", status: "running" });
});

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

/* -------------------------------------------------------
   Routes
------------------------------------------------------- */
app.use("/api", authRoutes);
app.use(userRoute);
app.use(productRoute);
app.use(cartRoute);
app.use(cloudinaryRoutes);
app.use(migrateRoutes);
app.use(orderRoute);

/* -------------------------------------------------------
   404 JSON (evita HTML feo)
------------------------------------------------------- */
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

export default app;
