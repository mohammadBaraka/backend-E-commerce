import express from "express";
import {
  createProduct,
  deleteProduct,
  getFeturedProducts,
  getProductById,
  getProducts,
  updateProduct,
  prouctsCount,
  gallery,
  searchOnProducts,
} from "../controller/products.controller.js";
import multer from "multer";

const FILE_TYPES = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};
const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPES[file.mimetype];
    let uploadError = new Error("invalid image type");
    if (isValid) {
      uploadError = null;
    }
    // cb(uploadError, "public/uploads/");
    cb(uploadError, "public/uploads/");
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(" ").join("-");
    const extension = FILE_TYPES[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});
const upload = multer({ storage: diskStorage });

const router = express.Router();

router.route("/count").get(prouctsCount);
router.route("/featured/:count").get(getFeturedProducts);
router.route("/").get(getProducts).post(upload.single("image"), createProduct);
router.route("/gallery/:id").put(upload.array("images", 4), gallery);
router.route("/search").get(searchOnProducts);
router
  .route("/:id")
  .delete(deleteProduct)
  .get(getProductById)
  .put(upload.single("image"), updateProduct);

export default router;
