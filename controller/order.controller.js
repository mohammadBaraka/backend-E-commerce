import Order from "../models/order.js";
import OderItem from "../models/orderItem.js";
import { httpStatus } from "../helpers/httpStatus.js";
import OrderItem from "../models/orderItem.js";

export const getOrders = async (req, res) => {
  try {
    const order = await Order.find()
      .populate("user", "name")
      .populate({
        path: "orderItems",
        populate: {
          path: "product",
          populate: "category",
        },
      })
      .sort({ dateOrdered: -1 });

    if (!order)
      return res
        .status(httpStatus.codeNotFound)
        .json({ status: httpStatus.FAIL, messag: "Orders are not found" });
    const response = {
      status: httpStatus.SUCCESS,
      data: order,
    };
    res.status(httpStatus.codeSuccess).json(response);
  } catch (err) {
    res
      .status(httpStatus.cdeIntervar)
      .json({ status: httpStatus.FAIL, message: err.message });
  }
};
export const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name")
      .populate({
        path: "orderItems",
        populate: {
          path: "product",
          populate: "category",
        },
      })
      .sort({ dateOrdered: -1 });

    if (!order)
      return res
        .status(httpStatus.codeNotFound)
        .json({ status: httpStatus.FAIL, messag: "Orders are not found" });
    const response = {
      status: httpStatus.SUCCESS,
      data: order,
    };
    res.status(httpStatus.codeSuccess).json(response);
  } catch (err) {
    res
      .status(httpStatus.cdeIntervar)
      .json({ status: httpStatus.FAIL, message: err.message });
  }
};
export const createOrder = async (req, res) => {
  const orderItemsIds = await Promise.all(
    req.body.orderItems.map(async (orderItem) => {
      let newOrderItem = new OderItem({
        quantity: orderItem.quantity,
        product: orderItem.product,
      });
      await newOrderItem.save();
      return newOrderItem._id;
    })
  );

  const totalPrices = await Promise.all(
    orderItemsIds.map(async (orderItemId) => {
      const orderItem = await OrderItem.findById(orderItemId).populate(
        "product",
        "price"
      );
      const totalPrice = orderItem.product.price * orderItem.quantity;
      return totalPrice;
    })
  );
  const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

  try {
    const order = new Order({
      orderItems: orderItemsIds,
      shippingAddress1: req.body.shippingAddress1,
      shippingAddress2: req.body.shippingAddress2,
      city: req.body.city,
      zip: req.body.zip,
      country: req.body.country,
      phone: req.body.phone,
      status: req.body.status,
      totalPrice: totalPrice,
      user: req.body.user,
    });
    await order.save();
    const response = {
      status: httpStatus.SUCCESS,
      message: "Order created successfully",
      data: order,
    };
    res.status(httpStatus.codeCreated).json(response);
  } catch (err) {
    res
      .status(httpStatus.cdeIntervar)
      .json({ status: httpStatus.FAIL, message: err.message });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const order = Order.findByIdAndDelete(req.params.id).then(async (order) => {
      if (!order)
        return res
          .status(httpStatus.codeNotFound)
          .json({ status: httpStatus.FAIL, message: "Order not found" });

      if (order) {
        await order.orderItems.map(async (orderItem) => {
          await OderItem.findByIdAndDelete(orderItem);
        });
        const response = {
          status: httpStatus.SUCCESS,
          message: "Delete order success",
        };
        res.status(httpStatus.codeSuccess).json(response);
      }
    });
  } catch (error) {
    res
      .status(httpStatus.cdeIntervar)
      .json({ status: httpStatus.FAIL, message: err.message });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status: req.body.status,
      },
      { new: true }
    );
    if (!order)
      return res
        .status(httpStatus.codeNotFound)
        .json({ status: httpStatus.FAIL, message: "Order not found" });
    const response = {
      status: httpStatus.SUCCESS,
      message: "Update status success",
      data: order,
    };
    res.status(httpStatus.codeSuccess).json(response);
  } catch (error) {
    res
      .status(httpStatus.cdeIntervar)
      .json({ status: httpStatus.FAIL, message: err.message });
  }
};
