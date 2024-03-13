import Category from "../models/category.js";
import { httpStatus } from "../helpers/httpStatus.js";
export const getCategories = async (req, res) => {
  try {
    const category = await Category.find();
    if (!category) {
      res
        .status(httpStatus.codeNotFound)
        .json({ message: "Categories not found" });
    }
    const response = {
      status: httpStatus.SUCCESS,
      data: category,
    };
    res.status(httpStatus.codeSuccess).json(response);
  } catch (err) {
    res.status(httpStatus.cdeIntervar).json(err.message);
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      res
        .status(httpStatus.codeNotFound)
        .json({ message: "Category not found" });
    }
    const response = {
      status: httpStatus.SUCCESS,
      data: category,
    };
    res.status(httpStatus.codeSuccess).json(response);
  } catch (err) {
    res.status(httpStatus.cdeIntervar).json(err.message);
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, icon, color } = req.body;
    if (!name || !icon || !color) {
      return res
        .status(httpStatus.codeBadRequest)
        .json({ message: "Please provide all required fields" });
    }

    const newCategory = new Category({
      name,
      icon,
      color,
    });

    const response = {
      status: "success",
      message: "Category created successfully",
      data: newCategory,
    };

    await newCategory.save();
    res.status(httpStatus.codeCreated).json(response);
  } catch (err) {
    res.status(httpStatus.cdeIntervar).json(err.message);
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      res
        .status(httpStatus.codeNotFound)
        .json({ message: "Category not found" });
    }
    res
      .status(httpStatus.codeSuccess)
      .json({ message: "Category deleted successfully" });
  } catch (err) {
    res.status(httpStatus.cdeIntervar).json(err.message);
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { name, icon, color } = req.body;
    const values = { name, icon, color };
    const { id } = req.params;
    // Temporary hardcoded update for testing
    const category = await Category.findByIdAndUpdate(
      id,
      {
        ...values,
      },
      { new: true }
    );

    // Check if the update was successful

    if (!category) {
      return res
        .status(httpStatus.codeNotFound)
        .json({ message: "Category not found" });
    }

    const response = {
      status: "success",
      message: "Category Updated successfully",
      data: category,
    };
    res.status(httpStatus.codeSuccess).json(response);
  } catch (err) {
    res.status(httpStatus.cdeIntervar).json(err.message);
  }
};
