import { Order  } from '../models/Order.js'
import { Cart } from '../models/Cart.js'
import { Product } from '../models/Product.js';
import { sequelize } from '../database/database.js';


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
    let transaction;

    try {
        transaction = await sequelize.transaction();
        const { items, ...orderData } = req.body;

        if (items !== undefined && (!Array.isArray(items) || items.length === 0)) {
            await transaction.rollback();
            return res.status(400).send({
                message: "The order must include at least one product.",
            });
        }

        const normalizedItems = (items || []).map(({ productId, quantity }) => ({
            productId,
            quantity: Number(quantity),
        }));

        if (
            normalizedItems.some(
                ({ productId, quantity }) =>
                    !productId || !Number.isInteger(quantity) || quantity <= 0
            )
        ) {
            await transaction.rollback();
            return res.status(400).send({
                message: "Every product and quantity must be valid.",
            });
        }

        if (normalizedItems.length > 0) {
            const productIds = [...new Set(normalizedItems.map(({ productId }) => productId))];
            const products = await Product.findAll({
                attributes: ["id"],
                where: { id: productIds },
                transaction,
            });

            if (products.length !== productIds.length) {
                await transaction.rollback();
                return res.status(400).send({
                    message: "One or more products no longer exist.",
                });
            }
        }

        const orderCreated = await Order.create(orderData, { transaction });
        const carts = normalizedItems.length
            ? await Cart.bulkCreate(
                normalizedItems.map((item) => ({
                    ...item,
                    orderId: orderCreated.id,
                    userId: orderData.userId || null,
                })),
                { transaction, validate: true }
            )
            : [];

        await transaction.commit();

        res.status(201).send({
            message: "this order was created.",
            orderCreated,
            carts,
        });
    } catch (e) {
        if (transaction && !transaction.finished) {
            await transaction.rollback();
        }
        console.error(e);
        res.status(500).send({
            message: "The order and its products could not be created.",
        });
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
