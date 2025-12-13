import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";

export const User = sequelize.define(
  "user",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // password: {
    //   type: DataTypes.STRING,
    //   allowNull: false,
    // },
    // name: {
    //   type: DataTypes.STRING,
    //   allowNull: false,
    // },
    // dateOfBirth: {
    //   type: DataTypes.DATEONLY,
    //   allowNull: false,
    // },
    // identification: {
    //   type: DataTypes.STRING,
    //   allowNull: false,
    // },

    // country: {
    //   type: DataTypes.STRING,
    //   allowNull: false,
    // },
    // city: {
    //   type: DataTypes.STRING,
    //   allowNull: true,
    // },
    // address: {
    //   type: DataTypes.STRING,
    //   allowNull: false,
    // },
    // province: {
    //   type: DataTypes.STRING,
    //   allowNull: true,
    // },
    // phone: {
    //   type: DataTypes.STRING,
    // },

    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    deletedByAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    freezeTableName: true,
  }
);
