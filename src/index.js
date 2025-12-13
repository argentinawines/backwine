import app from "./app.js";
import dotenv from "dotenv";
import { sequelize } from "./database/database.js";

dotenv.config();

const { PORT } = process.env;

app.listen(PORT, () => {
  console.log(`Listening at PORT ${PORT} `);
  sequelize.sync({ force: false });
});
