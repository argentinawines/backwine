import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";

export const ProductInOrder = sequelize.define(
  "productInOrder",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      primaryKey: true,
    },

    quantity: {
      type: DataTypes.STRING,
      
      allowNull: false,
    },

    totalPrice: {
      type: DataTypes.STRING,
 
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
  }
);
