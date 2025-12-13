import { Order  } from '../models/Order.js'
import { Cart } from '../models/Cart.js'
import { Product } from '../models/Product.js';


export const getOrders = async (req, res) => {
    try {
      const orders = await Order.findAll({
        order: [["id", "DESC"]],
        include: [
          {
            model: Cart,
            include: [
              {
                model: Product, // Trae el producto completo
              },
            ],
          },
        ],
      });
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

export const getOrderID = async (req, res, next) => {
    try {
        const { id } = req.params;
        const orderId = await Order.findByPk(id);
        if (!orderId)
        return res
            .status(404)
            .send({ message: "the order was not found." });
        res.status(200).send({
            message: "The order was found",
            order: orderId,
        });
    } catch (e) {
        next(e);
    }
}

export const createOrder = async (req, res) => {
    try {
        const orderCreated = await Order.create({ ...req.body });
        if (!orderCreated)
        return res
            .status(401)
            .send({ message: "the order was not created." });
        res.status(200).send({
            message: "this order was created.",
            orderCreated,
        });
    } catch (e) {
      console.log(e);
      
    }
}

export const cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const orderEdited = await Order.findByPk(id);
        if (!orderEdited)
            return res
                .status(404)
                .send({ message: "the order was no found" });
        orderEdited?.update({ ...req.body });
        res.status(200).send({
            message: "The order was edited",
            order: orderEdited,
        });
    } catch (e) {
        next(e);
    }
}