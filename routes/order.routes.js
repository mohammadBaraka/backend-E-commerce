import express from "express";
import {
  createOrder,
  deleteOrder,
  getOrder,
  getOrders,
  updateStatus,
} from "../controller/order.controller.js";
const router = express.Router();

router.route("/:id").get(getOrder).delete(deleteOrder).put(updateStatus);
router.route("/").get(getOrders);
router.route("/").post(createOrder);

export default router;
