import { errorHandling } from "./helpers/errorHandling.js";
import { fileURLToPath } from "url";
import { dirname } from "path";
import express from "express";
import morgan from "morgan";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";

//?=================MIDDLEWARE=================
const app = express();
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(
  cors({
    origin: "https://shopping-app-e-commerce.netlify.app",
    optionsSuccessStatus: 200,
    credentials: true,
  })
);
app.options("*", cors());

// app.use(morgan("tiny"));
app.use(cookieParser());
app.use(errorHandling);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use("/public/uploads", express.static(`${__dirname}/public/uploads`));
//?=================ROUTES=================
const apiUrl = process.env.API_URL;
import productRouter from "./routes/products.routes.js";
import categoryRouter from "./routes/category.routes.js";
import userRouter from "./routes/users.routes.js";
import authRouter from "./routes/auth.routes.js";
import orderRouter from "./routes/order.routes.js";

app.use(`${apiUrl}/product`, productRouter);
app.use(`${apiUrl}/category`, categoryRouter);
app.use(`${apiUrl}/users`, userRouter);
app.use(`${apiUrl}/order`, orderRouter);
app.use(`${apiUrl}`, authRouter);

//?=================CONNECT TO DB AND RUN THE APP=================
const port = process.env.PORT || 5000;

mongoose
  .connect(`${process.env.MONGODB_URI}`)
  .then(() => {
    console.log("Connect To DB Success");

    app.listen(port, () => {
      console.log(`server is running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.log(err.message);
  });
