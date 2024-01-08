import mongoose from "mongoose";
const { Schema } = mongoose;
const orserSchema = new Schema({
  orderItems: [
    {
      type: Schema.Types.ObjectId,
      ref: "OrderItem",
      required: true,
    },
  ],
  shippingAddress1: {
    type: String,
    required: true,
  },
  shippingAddress2: {
    type: String,
  },
  city: {
    type: String,
    required: true,
  },
  zip: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "pending",
  },
  totalPrice: {
    type: Number,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  dateOrdered: {
    type: Date,
    default: Date.now,
  },
});

orserSchema.virtual("id").get(function () {
  return this._id.toHexString();
});
orserSchema.set("toJSON", {
  virtuals: true,
});

const Order = mongoose.model("Order", orserSchema);
export default Order;
