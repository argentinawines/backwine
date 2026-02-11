import "dotenv/config";
import app from "./app.js";
import { sequelize } from "./database/database.js";

const PORT = process.env.PORT || 10000;

let dbOk = false;

app.get("/health", (req, res) => {
  res.status(dbOk ? 200 : 503).json({ ok: true, db: dbOk });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Listening at PORT ${PORT}`);
});

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: false });
    dbOk = true;
    console.log("DB OK");
  } catch (err) {
    console.error("DB ERROR:", err);
  }
})();
