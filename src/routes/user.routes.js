import { Router } from "express";
import { createUser, login, getUsers, getAdmin } from "../controllers/User.js";
import { tokenVerify } from "../utils/jwt.js";

const router = Router();

router.post("/user", createUser);
router.post("/admin", (req, res) => {
  res.status(403).json({ message: "Public administrator creation is disabled." });
});
router.post("/login", login);
router.get("/user", tokenVerify, getUsers);
router.get("/admin", tokenVerify, (req, res) => {
  res.json({ email: req.admin.email, rol: "admin" });
});
router.post("/administrator", getAdmin);

export default router;
