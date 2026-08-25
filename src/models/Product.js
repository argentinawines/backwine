import { DataTypes, ForeignKeyConstraintError } from "sequelize";
import { sequelize } from "../database/database.js";
import { Cart } from "./Cart.js";
import { Order } from "./Order.js";
import { User } from "./User.js";
// import { ProductInOrder } from "./ProductInOrder.js";
import { DBIMAGE } from "./DBIMAGE.js";

export const Product = sequelize.define(
  "product",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      // allowNull: false,
    },
    image: {
      type: DataTypes.JSON,
      // allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      // allowNull: false,
    },
 
    price: {
      type: DataTypes.STRING,
      // allowNull: false,
    },
    tag: {
      type: DataTypes.STRING,
      // allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      // allowNull: false,
    },
   isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    offer:{
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      // allowNull: false,
    }
  },
  {
    freezeTableName: true,
  }
);

Product.hasMany(Cart, {
  foreignKey: "productId",
  sourceKey: "id",
});
Cart.belongsTo(Product, { foreignKey: "productId", targetKey: "id" });

User.hasMany(Cart, {
  foreignKey: "userId",
  sourceKey: "id",
});
Cart.belongsTo(User, { foreignKey: "userId", targetKey: "id" });

// Product.hasMany(ProductInOrder, {
//   foreinkey: "productId",
//   sourceKey: "id",
// });
// ProductInOrder.belongsTo(Product, { foreinkey: "productId", targetId: "id" });

User.hasMany(Order, {
  foreignKey: "userId",
  sourceKey: "id",
});
Order.belongsTo(User, { foreignKey: "userId", targetKey: "id" });

Order.hasMany(Cart, {
  foreignKey: "orderId",
  sourceKey: "id",
});
Cart.belongsTo(Order, { foreignKey: "orderId", targetKey: "id" });

// Cart.hasMany(Order, {
//   foreinkey: "orderId",
//   sourceKey: "id",
// });
// Order.belongsTo(Cart, { foreinkey: "orderId", targetId: "id" });

Product.hasMany(DBIMAGE, { 
  foreignKey: "productId", 
  sourceKey: "id" 
});
DBIMAGE.belongsTo(Product, { 
  foreignKey: "productId", 
  targetId: "id" 
});
