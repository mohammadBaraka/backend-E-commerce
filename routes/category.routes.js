import express from "express";
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategoryById,
  updateCategory,
} from "../controller/category.controller.js";

const router = express.Router();
router.route("/").post(createCategory);
router.route("/").get(getCategories);
router
  .route("/:id")
  .get(getCategoryById)
  .delete(deleteCategory)
  .put(updateCategory);
export default router;
