import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";


export const Order = sequelize.define(
  "order",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    postalCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
   
    address: {
        type: DataTypes.STRING,
        allowNull: false,
      },
     
     totalPrice: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      shippingPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      currency: {
        type: DataTypes.STRING(3),
        allowNull: true,
      },
      paypalOrderId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      paypalCaptureId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      paymentStatus: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
     
      status:{
        type: DataTypes.ENUM,
        values: ["pending", "inProcess", "done", "canceled"],
        defaultValue: "pending",
      }
  },
  {
    freezeTableName: true,
  }
);
