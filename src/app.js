import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import cookieParser from "cookie-parser";
import compression from "compression";
import fileUpload from "express-fileupload";
import cors from "cors";
import createHttpError from "http-errors";
import routes from "./routes/index.js";

//dotenv config
dotenv.config();

//create express app
const app = express();

//morgan
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

//helmet
app.use(helmet());

//parse json request body and url
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//snaitize request data
app.use(mongoSanitize());

//enable cookie parser
app.use(cookieParser());

//gzip compression
app.use(compression());

//file upload
app.use(
  fileUpload({
    useTempFiles: true,
  })
);

//cors
app.use(
  cors({
    origin: process.env.CLIENT_ENDPOINT,
    credentials: true,
  })
);

//api v1 routes
app.use("/api/v1", routes);

app.get("/", (req, res) => {
  res.send("hello from server");
});

app.use(async (req, res, next) => {
  next(createHttpError.NotFound("This route does not exist"));
});

//error handling
app.use(async (err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    error: {
      status: err.status || 500,
      message: err.message,
    },
  });
});

export default app;
