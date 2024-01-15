import Product from "../models/products.js";
import Category from "../models/category.js";
import mongoose from "mongoose";
import { httpStatus } from "../helpers/httpStatus.js";

export const getProducts = async (req, res) => {
  let categories = {};
  if (req.query.categories) {
    categories = { category: req.query.categories.split(",") };
  }
  try {
    const product = await Product.find(categories).populate("category");
    if (!product) {
      res
        .status(httpStatus.codeNotFound)
        .json({ message: "Categories not found" });
    }
    const response = {
      status: httpStatus.SUCCESS,
      data: product,
    };
    res.status(httpStatus.codeSuccess).json(response);
  } catch (err) {
    res
      .status(httpStatus.cdeIntervar)
      .json({ status: httpStatus.FAIL, message: err.message });
  }
};
export const getProductById = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(httpStatus.codeBadRequest).send("Invalid Product Id");
  }
  try {
    const product = await Product.findById(req.params.id).populate("category");
    if (!product) {
      res
        .status(httpStatus.codeNotFound)
        .json({ message: "Product not found" });
    }
    const response = {
      status: httpStatus.SUCCESS,
      data: product,
    };
    res.status(httpStatus.codeSuccess).json(response);
  } catch (err) {
    res
      .status(httpStatus.cdeIntervar)
      .json({ status: httpStatus.cdeIntervar, message: err.message });
  }
};

//?=================CRETE A PRODUCT======================
export const createProduct = async (req, res) => {
  try {
    const { name, description, brand, price, countInstock } = req.body;
    if (!name || !description || !brand || !price || !countInstock) {
      return res
        .status(httpStatus.codeBadRequest)
        .json({ message: "Missing or invalid fields" });
    }

    const category = await Category.findById(req.body.category);
    if (!category)
      return res
        .status(httpStatus.codeBadRequest)
        .json({ message: "Invalid Category" });

    if (!req.file)
      return res
        .status(httpStatus.codeBadRequest)
        .json({ message: "No Image Uploaded!" });
    const fileName = req.file.filename;
    const basePase = `${req.protocol}://${req.get(
      "host"
    )}/public/uploads/${fileName}`;
    const newProduct = new Product({
      name,
      description,
      richDescription: req.body.richDescription || "", // Handle optional fields
      image: basePase,
      brand,
      price,
      category: req.body.category,
      countInstock,
      rating: req.body.rating || 0, // Example: Set default value if not provided
      numReviews: req.body.numReviews || 0, // Similar to rating
      isFeatured: req.body.isFeatured || false,
    });
    await newProduct.save();

    const response = {
      status: httpStatus.SUCCESS,
      message: "Product created successfully",
      data: newProduct,
    };
    res.send(response);
  } catch (err) {
    res
      .status(httpStatus.cdeIntervar)
      .json({ status: httpStatus.FAIL, message: err.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { name, description, brand, price, countInstock } = req.body;
    if (!name || !description || !brand || !price || !countInstock) {
      return res
        .status(httpStatus.codeBadRequest)
        .json({ message: "Missing or invalid fields" });
    }
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(httpStatus.codeBadRequest).send("Invalid Product Id");
    }
    const category = await Category.findById(req.body.category);
    if (!category)
      return res.status(httpStatus.codeBadRequest).send("Invalid Category");
    if (!req.file)
      return res
        .status(httpStatus.codeBadRequest)
        .json({ message: "No Image Uploaded!" });
    const fileName = req.file.filename;
    const basePase = `${req.protocol}://${req.get(
      "host"
    )}/public/uploads/${fileName}`;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        richDescription: req.body.richDescription,
        image: basePase,
        brand,
        price,
        category: req.body.category,
        countInstock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
      },
      { new: true }
    );

    // Check if the update was successful

    if (!product) {
      return res
        .status(httpStatus.codeNotFound)
        .json({ message: "product not found" });
    }

    const response = {
      status: httpStatus.SUCCESS,
      message: "Product Updated successfully",
      data: product,
    };
    res.status(httpStatus.codeSuccess).json(response);
  } catch (err) {
    res
      .status(httpStatus.cdeIntervar)
      .json({ status: httpStatus.cdeIntervar, message: err.message });
  }
};
export const gallery = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(httpStatus.codeBadRequest).send("Invalid Product Id");
    }

    const files = req.files;
    let imagesPath = [];
    const basePase = `${req.protocol}://${req.get("host")}/public/uploads/`;
    if (files) {
      files.map((file) => imagesPath.push(`${basePase}${file.fileName}`));
      const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
          images: imagesPath,
        },
        { new: true }
      );
      if (!product) {
        return res
          .status(httpStatus.codeNotFound)
          .json({ message: "product not found" });
      }
    }
  } catch (error) {
    res
      .status(httpStatus.cdeIntervar)
      .json({ status: httpStatus.cdeIntervar, message: err.message });
  }
};
export const deleteProduct = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(httpStatus.codeBadRequest).send("Invalid Product Id");
  }
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      res
        .status(httpStatus.codeNotFound)
        .json({ message: "Product not found" });
    }
    const response = {
      status: httpStatus.SUCCESS,
      message: "Product deleted successfully",
    };
    res.status(httpStatus.codeSuccess).json(response);
  } catch (err) {
    res
      .status(httpStatus.cdeIntervar)
      .json({ status: httpStatus.cdeIntervar, message: err.message });
  }
};

export const getFeturedProducts = async (req, res) => {
  const count = req.params.count ? req.params.count : 0;
  try {
    const product = await Product.find({ isFeatured: true }).limit(count);
    if (!product) {
      res
        .status(httpStatus.codeNotFound)
        .json({ message: "Categories not found" });
    }
    const response = {
      status: httpStatus.SUCCESS,
      data: product,
    };
    res.status(httpStatus.codeSuccess).json(response);
  } catch (err) {
    res.status(httpStatus.cdeIntervar).json(err.message);
  }
};

export const prouctsCount = async (req, res) => {
  try {
    const product = await Product.countDocuments();
    if (!product) {
      res
        .status(httpStatus.codeNotFound)
        .json({ message: "Categories not found" });
    }
    const response = {
      status: httpStatus.SUCCESS,
      productsCount: product,
    };
    res.status(httpStatus.codeSuccess).json(response);
  } catch (err) {
    res
      .status(httpStatus.cdeIntervar)
      .json({ status: httpStatus.cdeIntervar, message: err.message });
  }
};
