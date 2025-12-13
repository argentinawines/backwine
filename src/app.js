import morgan from "morgan";
import cookieParser from "cookie-parser";
import userRoute from "./routes/user.routes.js";
import productRoute from "./routes/product.routes.js";
import cartRoute from "./routes/cart.routes.js";
import authRoutes from "./routes/auth.routes.js";
import cloudinaryRoutes from "./routes/cloudinary.routes.js";
import migrateRoutes from "./routes/migrate.routes.js";
import orderRoute from "./routes/order.routes.js";
// import router from "./routes/auth.routes.js";
import express from "express";
import session from "express-session";
import passport from "passport";
import "./utils/Passport.js"
import dotenv from "dotenv";
import multer from "multer";

dotenv.config();

dotenv.config();

const app = express();

app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  next();
});

//Configura multer
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // limita el tamaño de archivo a 10MB
});

app.use((req, res, next) => {
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'imagesArray', maxCount: 10 },
  ])(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(500).json({ error: err.message });
    }
    next();
  });
});

const sessionConfig = {
  secret: process.env.SESSION_SECRET || "default_secret",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false },
};

app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());

app.use("/api", authRoutes);

// routes here

app.use(userRoute);
app.use(productRoute);
app.use(cartRoute);
app.use("/api", authRoutes);
app.use(cloudinaryRoutes)
app.use(migrateRoutes)
app.use(orderRoute)

export default app;
