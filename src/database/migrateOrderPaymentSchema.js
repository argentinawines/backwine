import { DataTypes } from "sequelize";
import { sequelize } from "./database.js";

const paymentColumns = {
  subtotal: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
  shippingPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
  currency: { type: DataTypes.STRING(3), allowNull: true },
  paypalOrderId: { type: DataTypes.STRING, allowNull: true },
  paypalCaptureId: { type: DataTypes.STRING, allowNull: true },
  paymentStatus: { type: DataTypes.STRING, allowNull: true },
  merchantNotificationStatus: { type: DataTypes.STRING, allowNull: true },
  merchantNotifiedAt: { type: DataTypes.DATE, allowNull: true },
};

export async function migrateOrderPaymentSchema() {
  const queryInterface = sequelize.getQueryInterface();
  const orderColumns = await queryInterface.describeTable("order");

  for (const [columnName, definition] of Object.entries(paymentColumns)) {
    if (!orderColumns[columnName]) {
      await queryInterface.addColumn("order", columnName, definition);
    }
  }
}
