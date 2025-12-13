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
  foreinkey: "productId",
  sourceKey: "id",
});
Cart.belongsTo(Product, { foreinkey: "productId", targetId: "id" });

User.hasMany(Cart, {
  foreinkey: "userId",
  sourceKey: "id",
});
Cart.belongsTo(User, { foreinkey: "userId", targetId: "id" });

// Product.hasMany(ProductInOrder, {
//   foreinkey: "productId",
//   sourceKey: "id",
// });
// ProductInOrder.belongsTo(Product, { foreinkey: "productId", targetId: "id" });

User.hasMany(Order, {
  foreinkey: "userId",
  sourceKey: "id",
});
Order.belongsTo(User, { foreinkey: "userId", targetId: "id" });

Order.hasMany(Cart, {
  foreinkey: "orderId",
  sourceKey: "id",
});
Cart.belongsTo(Order, { foreinkey: "orderId", targetId: "id" });

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