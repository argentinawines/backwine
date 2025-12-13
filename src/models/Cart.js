import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";


export const Cart = sequelize.define(
  "cart",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      primaryKey: true,
    },
    
      quantity: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      productId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
  },
  {
    freezeTableName: true,
  }
);
