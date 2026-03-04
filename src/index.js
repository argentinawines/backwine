// src/index.js
import "dotenv/config";
import app from "./app.js";
import { sequelize } from "./database/database.js";

const PORT = process.env.PORT || 10000;

// Estado DB compartido con app.js
app.locals.dbOk = false;

// ✅ IMPORTANTE para Render: escuchar rápido y en 0.0.0.0
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Listening at PORT ${PORT}`);
});

// Conectar DB en background (sin bloquear el listen)
(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: false });
    app.locals.dbOk = true;
    console.log("DB OK");
  } catch (err) {
    app.locals.dbOk = false;
    console.error("DB ERROR:", err);
    // No hacemos process.exit(1) para no tumbar el servicio.
  }
})();
