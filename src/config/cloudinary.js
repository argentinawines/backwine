import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

// DEBUG (temporal) - NO imprime secretos
const u = process.env.CLOUDINARY_URL || "";
console.log("[cloudinary] CLOUDINARY_URL len:", u.length);
console.log("[cloudinary] CLOUDINARY_URL hasColon:", u.includes(":"));
console.log("[cloudinary] CLOUDINARY_URL hasAt:", u.includes("@"));
console.log(
  "[cloudinary] CLOUDINARY_URL hasCloudinaryPrefix:",
  u.startsWith("cloudinary://")
);

// Lee CLOUDINARY_URL del entorno + fuerza https
cloudinary.config({ secure: true });

// DEBUG (temporal) - NO imprime secretos
const cfg = cloudinary.config();
console.log("[cloudinary] cloud_name:", cfg.cloud_name);
console.log("[cloudinary] api_key present?:", Boolean(cfg.api_key));

export default cloudinary;
