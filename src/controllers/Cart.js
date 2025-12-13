import  { Sequelize, Transaction } from "sequelize"; 
import { sequelize } from "../database/database.js";
// {  } from "sequelize";
import { Cart } from "../models/Cart.js";
import { Product } from "../models/Product.js";



export async function getCarts(req, res) {
    try {
      const products = await Cart.findAll({
      //   where: { userId: req.body.userId },
      include: [
        {
            model: Product,
          
        },
    ],
      });
      res.json(products);
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  }

export const getCartProducts = async (req, res) => {
  try {
    console.log(req.body.userId, "req.body en getCartProducts");
    
    const carts = await Cart.findAll({
      // where: { userId: req.body.userId },
      include: [
        {
            model: Product,
          
        },
    ],
    });
    res.status(200).send({ status: "ok", carts });
  } catch (err) {
    console.log(err);
    return res.status(404).json({ msg: "No se pudo obtener el carrito." });
  }
};



export const addProductInCart = async (req, res) => {
  try {
    const cartItems = req.body;

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ msg: "El carrito debe ser un arreglo de productos." });
    }

    // Iterar sobre cada item del carrito
    for (const item of cartItems) {
      const { productId, quantity } = item;

      if (!productId || quantity <= 0) {
        return res.status(400).json({ msg: "El producto y la cantidad son necesarios y válidos." });
      }

      const product = await Product.findByPk(productId);

      if (!product) {
        throw new Error(`Producto con ID ${productId} no encontrado`);
      }

      if (product.stock < quantity) {
        throw new Error(`Stock insuficiente para el producto ${product.name}`);
      }

      // Descontar stock
      product.stock -= quantity;
      await product.save();

      // Crear el item en el carrito
      await Cart.create({
        ...item,
        productId: productId, // asegurarse de usar productId
      });
    }

    res.status(201).send({ status: "ok", message: "Carrito creado y stock actualizado" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ msg: "No se pudo crear el carrito.", error: err.message });
  }
};

// export const addProductInCart = async (req, res) => {
//   try {
//     const productsArray = req.body; // Esperas un array de objetos
//     if (!Array.isArray(productsArray)) {
//       return res.status(400).json({ msg: "Se esperaba un array de productos." });
//     }

//     const createdProducts = await Promise.all(
//       productsArray.map((product) => Cart.create(product))
//     );

//     console.log(productsArray, "req.body en addProductInCart");

//     res.status(201).send({ status: "ok", cart: createdProducts });
//   } catch (err) {
//     console.log(err);
//     return res.status(500).json({ msg: "No se pudo crear el carrito." });
//   }
// };

// export const addProductInCart = async (req, res) => {
//   const { productId, quantity } = req.body;
//   console.log(req.body, "req.body en addProductInCart");
//   console.log(req.user, "req.user en addProductInCart");
  
//   try {
//     const [cart, created] = await Cart.upsert(
//       {
//         productId,
//         quantity,
//         userId: req.body.userId,
//       },
//       {
//         returning: true,
//       }
//     );

//     res.status(created ? 201 : 200).send({ status: "ok", cart });
//   } catch (err) {
//     console.log(err);
//     return res.status(404).json({ msg: "No se pudo agregar el producto al carrito." });
//   }
// };

export const deleteProductInCart = async (req, res) => {
  try {
    const deleted = await Cart.destroy({
      where: { id: req.params.id, userId: req.user._id },
    });

    if (!deleted) {
      return res.status(404).json({ msg: "Producto no encontrado en el carrito." });
    }

    res.status(200).send({ status: "ok" });
  } catch (err) {
    console.log(err);
    return res.status(404).json({ msg: "No se pudo eliminar el producto del carrito." });
  }
};


















// export const getCartProducts = async (req, res) => {
//   try {
//     const carts = await Cart.find({ userId: req.user._id }).populate(
//       "productId"
//     );
//     // console.log(carts)
//     res.status(200).send({ status: "ok", carts });
//   } catch (err) {
//     console.log(err);
//     return res
//     .status(404)
//     .json({ msg: "we cannot do it" });
//   }
// };

// export const addProductInCart = async (req, res) => {
//   const { productId, quantity } = req.body;
//   try {
//     const cart = await Cart.findOneAndUpdate(
//       { productId },
//       { productId, quantity, userId: req.user._id },
//       { upsert: true }
//     );

//     res.status(201).send({ status: "ok", cart });
//   } catch (err) {
//     console.log(err);
//     return res
//     .status(404)
//     .json({ msg: "we cannot do it" });
//   }
// };

// export const deleteProductInCart = async (req, res) => {
//   try {
//     await Cart.findByIdAndRemove(req.params.id);
//     res.status(200).send({ status: "ok" });
//   } catch (e) {
//     console.log(err);
//     return res
//             .status(404)
//             .json({ msg: "we cannot do it" });
//   }
// };

// delete cart
//   export const cartDelete = async (req, res) =>{
//     try {
//         const {id} = req.params
//         const result = await Cart.destroy({
//             where:{id : id },
//         })
//         console.log(result)
//         res.send({ msg: "your Product was deleted" });

//     } catch (error) {
//         return res
//         .status(404)
//         .json({ msg: "we cannot do it" });
//     }
//   }
