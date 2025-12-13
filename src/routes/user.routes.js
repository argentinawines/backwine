import { Router } from "express";
import { createUser, createAdmin, login, getUsers, getAdmin } from "../controllers/User.js";

const router = Router();

router.post("/user", createUser);
router.post("/admin", createAdmin);
router.post("/login", login);
router.get("/user", getUsers);
router.get("/admin", getAdmin);
router.post("/administrator", getAdmin);

export default router;
