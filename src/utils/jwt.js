import jwt from "jsonwebtoken";

function getJwtSecret() {
  const secret = process.env.jwt_secret || process.env.SESSION_SECRET;
  if (!secret) throw new Error("JWT_SECRET_NOT_CONFIGURED");
  return secret;
}

export const tokenSign = async (user, time) => {
  return jwt.sign(user, getJwtSecret(), { expiresIn: time });
};



export const tokenVerify = async (req, res, next) => {
  const authorization = req.headers.authorization;
  const [scheme, token] = String(authorization || "").split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(401).send({ message: "Administrator authentication required." });
  }

  try {
    const payload = jwt.verify(token, getJwtSecret());
    if (payload.role !== "admin") {
      return res.status(403).send({ message: "Administrator access required." });
    }
    req.admin = payload;
    return next();
  } catch {
    return res.status(401).send({ message: "The administrator session is invalid or expired." });
  }
};
