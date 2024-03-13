import Product from "../models/products.js";
import Category from "../models/category.js";
import mongoose from "mongoose";
import { httpStatus } from "../helpers/httpStatus.js";
import cloudinary from "../helpers/cloudinay.js";
//?=================GET ALL PRODUCTS ======================
export const getProducts = async (req, res) => {
  let categories = {};
  let count = 0;
  if (req.query.categories) {
    categories = { category: req.query.categories.split(",") };
    count = await Product.countDocuments(categories);
  } else {
    count = await Product.countDocuments();
  }
  //?===========Paginate==============
  const query = req.query;
  const limit = query.limit || 10;
  const page = query.page || 1;
  const skip = (page - 1) * limit;
  const total = Math.ceil(count / limit);

  try {
    const product = await Product.find(categories)
      .sort({ _id: -1 })
      .populate("category")
      .limit(limit)
      .skip(skip);
    if (!product) {
      res
        .status(httpStatus.codeNotFound)
        .json({ message: "Categories not found" });
    }

    const response = {
      status: httpStatus.SUCCESS,
      data: product,
      totalProducts: total,
      currentPage: Number(page),
    };
    res.status(httpStatus.codeSuccess).json(response);
  } catch (err) {
    res.status(httpStatus.cdeIntervar).json({
      status: httpStatus.FAIL,
      message: err.message,
    });
  }
};

export const searchOnProducts = async (req, res) => {
  //?===========Paginate==============
  const query = req.query;
  const limit = query.limit || 10;
  const page = query.page || 1;
  const skip = (page - 1) * limit;

  const search = req.query.name;
  if (search.length === 0) {
    return res
      .status(httpStatus.codeNotFound)
      .json({ message: "Categories not found" });
  }
  try {
    const product = await Product.find({
      $or: [{ name: { $regex: search, $options: "i" } }],
    })
      .sort({ _id: -1 })
      .populate("category")
      .limit(limit)
      .skip(skip);
    if (!product) {
      res
        .status(httpStatus.codeNotFound)
        .json({ message: "Categories not found" });
    }

    const response = {
      status: httpStatus.SUCCESS,
      data: product,
      totalProducts: Math.ceil(product.length / limit),
      currentPage: Number(page),
    };
    res.status(httpStatus.codeSuccess).json(response);
  } catch (err) {
    res.status(httpStatus.cdeIntervar).json({
      status: httpStatus.FAIL,
      message: err.message,
    });
  }
};
//?=================GET A PRODUCT BY ID ======================

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

    const fileName = req.file.path; // Use the correct file path
    const uploadedImage = await cloudinary.uploader.upload(fileName, {
      public_id: req.file.filename,
    });

    // const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
    const image = uploadedImage.secure_url; // Get the secure URL of the uploaded image from Cloudinary

    const newProduct = new Product({
      name,
      description,
      richDescription: req.body.richDescription || "",
      image,
      brand,
      price,
      category: req.body.category,
      countInstock,
      rating: req.body.rating || 0,
      numReviews: req.body.numReviews || 0,
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
      .status(httpStatus.cdeIntervar) // Corrected status code
      .json({ status: httpStatus.FAIL, message: err.message });
  }
};

//?=================UPDATE A PRODUCT ======================
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
    const fileName = req?.file?.path; // Use the correct file path
    const uploadedImage = await cloudinary.uploader.upload(fileName, {
      public_id: req?.file?.filename,
    });

    const image = uploadedImage?.secure_url;

    console.log("🚀 ~ updateProduct ~ image:", image);

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        richDescription: req.body.richDescription,
        image,
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

//?=================UPLOAD MORE IMAGES ======================
export const gallery = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(httpStatus.codeBadRequest).send("Invalid Product Id");
    }
    let imagesPath = [];

    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(httpStatus.codeBadRequest).send("No images uploaded");
    }

    const uploadedImages = await Promise.all(
      files.map(async (file) => {
        const uploadedImage = await cloudinary.uploader.upload(file.path, {
          public_id: file.filename,
        });
        return uploadedImage.secure_url;
      })
    );

    uploadedImages.forEach((imageUrl) => imagesPath.push(imageUrl));

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
        .json({ message: "Product not found" });
    }
    res.send(product);
  } catch (err) {
    res.status(httpStatus.codeInternalServerError).json({
      status: httpStatus.codeInternalServerError,
      message: err.message,
    });
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
