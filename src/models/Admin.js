import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";


export const Admin = sequelize.define(
  "admin",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
    },
    email: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    rol: {
      type: DataTypes.STRING,
      // allowNull: false,
    },
  },
  {
    freezeTableName: true,
  }
);


