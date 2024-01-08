import express from "express";
import { getUserById, getUsers } from "../controller/users.controller.js";

const router = express.Router();
router.route("/").get(getUsers);
router.route("/:id").get(getUserById);
export default router;
