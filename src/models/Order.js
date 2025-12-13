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
