import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";

export const DBIMAGE = sequelize.define(
  "dbimage",
  {
    cloudinaryID: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "product",
        key: "id",
      },
    },
    url: {
      type: DataTypes.STRING,
    },
    main: {
      type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);
