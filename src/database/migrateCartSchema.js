import { DataTypes } from "sequelize";
import { sequelize } from "./database.js";

export async function migrateCartSchema() {
  const queryInterface = sequelize.getQueryInterface();
  const cartColumns = await queryInterface.describeTable("cart");

  if (cartColumns.userId && cartColumns.userId.allowNull === false) {
    await queryInterface.changeColumn("cart", "userId", {
      type: DataTypes.UUID,
      allowNull: true,
    });
  }

  if (!cartColumns.orderId) {
    await queryInterface.addColumn("cart", "orderId", {
      type: DataTypes.INTEGER,
      allowNull: true,
    });
  }
}
