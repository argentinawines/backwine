import app from "./app.js";
import dotenv from "dotenv";
import { sequelize } from "./database/database.js";

dotenv.config();

const PORT = process.env.PORT || 10000;

async function start() {
  try {
    await sequelize.authenticate(); // prueba conexión
    await sequelize.sync({ force: false });
    console.log("DB OK");

    app.listen(PORT, () => {
      console.log(`Listening at PORT ${PORT}`);
    });
  } catch (err) {
    console.error("DB ERROR:", err);
    process.exit(1);
  }
}

start();
