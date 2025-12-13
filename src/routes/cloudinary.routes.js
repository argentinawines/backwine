import { Router } from "express";
import { deleteImages, uploadImages } from "../controllers/cloudinary.js";

const router = Router();

router.post('/cloudinary/', uploadImages)
router.delete('/cloudinary/', deleteImages)

export default router;