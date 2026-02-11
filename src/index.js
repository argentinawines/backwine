// src/index.js
import "dotenv/config";
import app from "./app.js";
import { sequelize } from "./database/database.js";

const PORT = process.env.PORT || 10000;

let dbOk = false;

// Health que indica estado real de DB (Render no timeoutea porque el puerto abre igual)
app.get("/healthz", (req, res) => {
  res.status(dbOk ? 200 : 503).json({ ok: true, db: dbOk });
});

// ✅ IMPORTANTE para Render: escuchar rápido y en 0.0.0.0
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Listening at PORT ${PORT}`);
});

// Conectar DB en background (sin bloquear el listen)
(async () => {
  try {
    await sequelize.authenticate(); // prueba conexión
    await sequelize.sync({ force: false });
    dbOk = true;
    console.log("DB OK");
  } catch (err) {
    dbOk = false;
    console.error("DB ERROR:", err);
    // No hacemos process.exit(1) para no tumbar el servicio y evitar loops/timeout.
  }
})();
